import sequelize from "../database/connectDB.js";
import PaymentService from "../services/paymentService.js";
import { TransactionStatus, TransactionType } from "../utils/enum.js";
import { ResponseCode } from "../utils/response.js";
import Utility from "../utils/utils.js";
import dotenv from "dotenv";
dotenv.config();

const paymentService = new PaymentService();

class TransactionController {
    #transactionService;
    #accountService;
    #receipientService;

    constructor(_transactionService, _accountService, _receipientService) {
        this.#transactionService = _transactionService;
        this.#accountService = _accountService;
        this.#receipientService = _receipientService;
    }

    async deposit(req, res) {
        try {
            const { user, amount, accountNo } = req.body;
            const paystackData = await paymentService.initializePaystackPayment(user.email, amount);
            if (!paystackData) {
                return Utility.handleError(
                    res,
                    "Failed to initialize deposit",
                    ResponseCode.SERVICE_UNAVAILABLE
                );
            }
            if (!paystackData.status) {
                return Utility.handleError(
                    res,
                    { message: paystackData.message, ...paystackData.meta },
                    ResponseCode.BAD_REQUEST
                );
            }

            const newTrxn = {
                userId: user.id,
                accountId: accountNo,
                amount: amount,
                reference: paystackData.data.reference,
                type: TransactionType.DEPOSIT,
            };
            await this.#transactionService.createTrxn(newTrxn);
            return Utility.handleSuccess(
                res,
                "Deposit initialized",
                paystackData,
                ResponseCode.SUCCESS
            );
        } catch (error) {
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }

    async #completeDeposit(trans) {
        const t = await sequelize.transaction();
        try {
            await this.#accountService.creditAccount(trans.accountId, trans.amount, {
                transaction: t,
            });
            await this.#transactionService.setStatus(
                { status: TransactionStatus.COMPLETED },
                trans.id,
                { transaction: t }
            );
            await t.commit();
            return true;
        } catch (error) {
            Utility.logger.error(error.message);
            await t.rollback();
            return false;
        }
    }

    async verifyDeposit(req, res) {
        try {
            const { reference } = req.body;
            let trxn = await this.#transactionService.getTrxnByField({
                reference,
            });
            if (!trxn) {
                return Utility.handleError(res, "Transaction not found", ResponseCode.NOT_FOUND);
            }
            if (trxn.status != TransactionStatus.PENDING) {
                return Utility.handleError(
                    res,
                    "Transaction has been concluded",
                    ResponseCode.INVALID_DATA
                );
            }
            const ispaymentVerified = await paymentService.verifyPaystackPayment(reference);

            if (!ispaymentVerified) {
                return Utility.handleError(res, "Deposit Unsuccessful", ResponseCode.BAD_REQUEST);
            }

            const isDeposited = await this.#completeDeposit(trxn);

            if (!isDeposited) {
                return Utility.handleError(res, "Deposit failed", ResponseCode.NOT_FOUND);
            }
            trxn = await this.#transactionService.getTrxnByField({ reference });
            return Utility.handleSuccess(res, "Deposit Successful", { trxn }, ResponseCode.SUCCESS);
        } catch (error) {
            console.log(error);
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }

    async #completetransfer(trans) {
        const t = await sequelize.transaction();
        try {
            await this.#accountService.debitAccount(trans.senderAccountNo, trans.amount, {
                transaction: t,
            });
            await this.#accountService.creditAccount(trans.receiverAccountNo, trans.amount, {
                transaction: t,
            });
            await this.#transactionService.setStatus(
                { status: TransactionStatus.COMPLETED },
                trans.id,
                { transaction: t }
            );
            Utility.logger.info("transfer transaction successful");
            await t.commit();
            return true;
        } catch (error) {
            Utility.logger.error(error.message);
            await t.rollback();
            return false;
        }
    }

    async internalTransfer(req, res) {
        try {
            const { senderAccount, receiverAccount, amount, desc, user } = req.body;
            const trsfTrxn = {
                userId: user.id,
                amount: amount,
                reference: `txn${Utility.generateCode(12)}`,
                type: TransactionType.TRANSFER,
                senderAccountNo: senderAccount,
                receiverAccountNo: receiverAccount,
                description: desc,
            };
            const trxn = await this.#transactionService.createTrxn(trsfTrxn);
            const transfer = await this.#completetransfer(trxn);
            if (!transfer) {
                await this.#transactionService.setStatus(
                    { status: TransactionStatus.FAILED },
                    trxn.id
                );
                return Utility.handleError(res, "Transfer Failed", ResponseCode.BAD_REQUEST);
            }

            return Utility.handleSuccess(res, "Transfer Successful", {}, ResponseCode.SUCCESS);
        } catch (error) {
            console.log(error);
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }

    async #completeExternalTransfer(trans) {
        const t = await sequelize.transaction();

        try {
            await this.#accountService.debitAccount(trans.senderAccountNo, trans.amount, {
                transaction: t,
            });
            let transfer = await this.#transactionService.setStatus(
                { status: TransactionStatus.COMPLETED },
                trans.id,
                { transaction: t }
            );
            await t.commit();
            return { status: true, transaction: transfer };
        } catch (error) {
            await t.rollback();
            return { status: false, transaction: null };
        }
    }

    async externalTransfer(req, res) {
        try {
            const { senderAccount, receiverAccount, amount, bankCode, reason, user } = req.body;
            const receipient = await this.#receipientService.getReceipient({
                bankCode,
                accountNumber: receiverAccount,
            });

            let receipientCode;
            let receipientName;
            if (!receipient) {
                const newReceipient = await paymentService.createPaystackReceipient(
                    receiverAccount,
                    bankCode
                );
                receipientCode = newReceipient.recipient_code;
                receipientName = newReceipient.details.account_name;
                let receipientData = {
                    createdBy: req.body.user.id,
                    accountName: newReceipient.details.account_name,
                    accountNumber: receiverAccount,
                    receipientCode: newReceipient.recipient_code,
                    bankCode,
                };
                await this.#receipientService.createReceipient(receipientData);
            } else {
                receipientCode = receipient.receipientCode;
                receipientName = receipient.accountName;
            }

            const ref = `trsf-txn${Utility.generateCode(16)}`;

            const trsfData = {
                userId: user.id,
                amount: amount,
                reference: ref,
                type: TransactionType.TRANSFER,
                senderAccountNo: senderAccount,
                receiverAccountNo: receiverAccount,
                description: reason ? reason : `transfer/${receipientName}`,
            };

            let trsfTrxn = await this.#transactionService.createTrxn(trsfData);
            const transferData = await paymentService.initiatePaystackTranfer(
                amount,
                reason,
                receipientCode,
                ref
            );
            if (!transferData.status) {
                await this.#transactionService.setStatus(
                    { status: TransactionStatus.FAILED },
                    trsfTrxn.id
                );
                return Utility.handleError(
                    res,
                    "Transfer failed. Try again later",
                    ResponseCode.BAD_REQUEST
                );
            }

            const result = await this.#completeExternalTransfer(trsfTrxn);
            if (!result.status) {
                return Utility.handleError(res, "Transfer failed", ResponseCode.BAD_REQUEST);
            }
            return Utility.handleSuccess(
                res,
                "Transfer Successful",
                { transaction: result.transaction },
                ResponseCode.SUCCESS
            );
        } catch (error) {
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }
}

export default TransactionController;

// To Do
// Send Email Notification on completed transactions
