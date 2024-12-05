import { Router } from "express";
import Auth from "../middlewares/authMiddleware.js";
import AccountController from "../controllers/accountController.js";
import { createAccountValidator } from "../validators/accountValidator.js";
import AccountService from "../services/accountService.js";
import AccountRepository from "../repository/accountRepository.js";



const router = Router();

const accountRepo = new AccountRepository()
const accountService = new AccountService(accountRepo)
const accountController = new AccountController(accountService)


router.post("/create-account", Auth, createAccountValidator,  (req, res) => {
    return accountController.createAccount(req, res);
});


router.get("/accounts", Auth, (req, res) => {
    return accountController.getUserAccounts(req, res);
})

router.get("/:accountId", Auth, (req, res) => {
    return accountController.getSingleAccount(req, res);
});



export { router as AccountRouter };
