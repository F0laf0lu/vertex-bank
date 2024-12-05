import { body, validationResult } from "express-validator";
import Utility from "../utils/utils.js";
import { ResponseCode } from "../utils/response.js";
import AccountService from "../services/accountService.js";
import AccountRepository from "../repository/accountRepository.js";


const accountRepo = new AccountRepository();
const accountService = new AccountService(accountRepo);


const validateSenderAccount = async (req, res, next) => {
    const { senderAccount, user } = req.body;

    try {
            const sender = await accountService.getAccountByField({
                accountNumber: senderAccount,
            });

            if (!sender) {
                return Utility.handleError(res, "Sender account not found", ResponseCode.NOT_FOUND);
            }

            if (sender.userId != user.id) {
                return Utility.handleError(
                    res,
                    "Permission Denied. Can only transfer from your account",
                    ResponseCode.PERMISSION_DENIED
                );
            }
            req.sender = sender
        next();
    } catch (error) {
        return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
    }
};



const validateReceiverAccount = async (req, res, next) => {
    const { receiverAccount } = req.body;
    try {
        const receiver = await accountService.getAccountByField({ accountNumber: receiverAccount });
        if (!receiver) {
            return Utility.handleError(res, "Receiver account not found", ResponseCode.NOT_FOUND);
        }
        req.receiver = receiver;
        next();
    } catch (error) {
        return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
    }
};

const validateTransferDetails = (req, res, next) => {
    const { amount, receiverAccount } = req.body;
    const { sender } = req;
    try {
        const numericAmount = Math.round(parseFloat(amount) * 100);
        const numericBalance = Math.round(parseFloat(sender.balance) * 100);
        if (numericAmount > numericBalance) {
            return Utility.handleError(res, "Insufficient funds", ResponseCode.BAD_REQUEST);
        }
        if (amount <= 0) {
            return Utility.handleError(res, "Amount must be above zero", ResponseCode.BAD_REQUEST);
        }
        if (sender.accountNumber === receiverAccount) {
            return Utility.handleError(
                res,
                "User cannot transfer to their own account",
                ResponseCode.BAD_REQUEST
            );
        }
        next();
    } catch (error) {
        return Utility.handleError(res, error.message, ResponseCode.BAD_REQUEST);
    }
};



const validateInternalTransfer = [
    body("senderAccount")
        .trim()
        .notEmpty()
        .withMessage("Sender account is required")
        .isString()
        .withMessage("Sender account must be a string"),
    body("receiverAccount")
        .trim()
        .notEmpty()
        .withMessage("Receiver account is required")
        .isString()
        .withMessage("Receiver account must be a string"),
    body("amount")
        .trim()
        .notEmpty()
        .withMessage("Amount is required")
        .isFloat({ gt: 0 })
        .withMessage("Amount must be greater than zero"),
    body("desc").trim().optional().isString().withMessage("Description must be a        string"),

    // Middleware to handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = errors.array().map((error) => {
                    error.msg;
            });

            return Utility.handleError(res, error, ResponseCode.BAD_REQUEST);
        }
        next();
    },

    validateReceiverAccount,
    validateSenderAccount,
    validateTransferDetails,
];

const trnxValidator = {
    validateInternalTransfer,
}


export default trnxValidator