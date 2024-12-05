import sequelize from "../database/connectDB.js";
import TransactionModel from "../model/transactionModel.js";
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

    constructor(_transactionService, _accountService) {
        this.#transactionService = _transactionService;
        this.#accountService = _accountService;
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
            await this.#accountService.creditAccount(trans.accountId, trans.amount, {transaction:t});
            await this.#transactionService.setStatus(
                { status: TransactionStatus.COMPLETED },
                trans.id,
                {transaction:t}
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
            await this.#accountService.debitAccount(
                trans.senderAccountNo, trans.amount, {transaction: t});
            await this.#accountService.creditAccount(
                trans.receiverAccountNo, trans.amount, {transaction: t});
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
                    {status: TransactionStatus.FAILED,},
                    trxn.id
                );
                return Utility.handleError(
                    res, "Transfer Failed", ResponseCode.BAD_REQUEST);
            }

            return Utility.handleSuccess(
                res, "Transfer Successful", {},ResponseCode.SUCCESS);
        } catch (error) {
            console.log(error);
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }

    async externalTransfer(req, res) {
        try {
            return Utility.handleSuccess(res, "Transfer Successful", {}, ResponseCode.SUCCESS);
        } catch (error) {
            return Utility.handleError(res, "Server Error".ResponseCode.SERVER_ERROR);
        }
    }
}

export default TransactionController;

// To Do
// Send Email Notification on completed transactions
