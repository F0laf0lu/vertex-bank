import { Router } from "express";
import Auth from "../middlewares/authMiddleware.js";
import TransactionController from "../controllers/transactionController.js";
import TransactionService from "../services/transactionService.js";
import TransactionRepository from "../repository/transactionRepository.js";
import AccountService from "../services/accountService.js";
import AccountRepository from "../repository/accountRepository.js";
import trnxValidator from "../validators/transactionValidator.js";
import ReceipientRepository from "../repository/receipientRepository.js";
import ReceipientService from "../services/recepientService.js";

const router = Router();

const accountRepo = new AccountRepository()
const accountService = new AccountService(accountRepo);
const receipientRepo = new ReceipientRepository();
const receipientService = new ReceipientService(receipientRepo);
const trxRepo = new TransactionRepository()
const trxService = new TransactionService(trxRepo)
const transactionController = new TransactionController(trxService, accountService, receipientService)



router.post('/deposit', Auth, (req, res)=>{
    return transactionController.deposit(req, res);
})

router.post('/verify-deposit', Auth, (req, res)=>{
    return transactionController.verifyDeposit(req, res)
})

router.post('/internal-transfer', Auth, trnxValidator.validateInternalTransfer,  (req, res)=>{
    return transactionController.internalTransfer(req, res)
})

router.post("/external-transfer", Auth, trnxValidator.validateExternalTransfer, (req, res) => {
    return transactionController.externalTransfer(req, res);
});



export {router as TransactionRouter}