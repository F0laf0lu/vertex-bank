import { ResponseCode } from "../utils/response.js";
import Utility from "../utils/utils.js";

class AccountController {
    #accountService;

    constructor(_accountService) {
        this.#accountService = _accountService;
    }

    async createAccount(req, res) {
        try {
            const { type, user } = req.body;
            const newAccount = {
                userId: user.id,
                type,
            };
            let account = await this.#accountService.createAccount(newAccount);
            return Utility.handleSuccess(
                res,
                "Created Account successful",
                { account },
                201
            );
        } catch (error) {
            console.error(error);
            return Utility.handleError(
                res,
                error.message,
                ResponseCode.SERVER_ERROR
            );
        }
    }

    async getUserAccounts(req, res) {
        try {
            const { user } = req.body;
            const accounts = await this.#accountService.getUserAccounts(
                user.id
            );
            return Utility.handleSuccess(
                res,
                "User accounts fetched successfully",
                { accounts },
                ResponseCode.SUCCESS
            );
        } catch (error) {
            return Utility.handleError(
                res,
                error.message,
                ResponseCode.SERVER_ERROR
            );
        }
    }

    async getSingleAccount(req, res) {
        try {
            const {accountId} = req.params
            const account = await this.#accountService.getAccountByField({
                id: accountId,
            });
            return Utility.handleSuccess(
                res,
                "User accounts fetched successfully",
                { account },
                ResponseCode.SUCCESS
            );
        } catch (error) {
            return Utility.handleError(
                res,
                error.message,
                ResponseCode.SERVER_ERROR
            );
        }
    }
}

export default AccountController;
