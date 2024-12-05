import { body, validationResult } from "express-validator";
import { AccountType } from "../utils/enum.js";
import Utility from "../utils/utils.js";
import { ResponseCode } from "../utils/response.js";

export const createAccountValidator = [
    body("type")
        .notEmpty()
        .withMessage("Account Type is required")
        .custom((value) => {
            if (!Object.values(AccountType).includes(value)) {
                throw new Error(
                    `Invalid account type. Allowed types are: ${Object.values(
                        AccountType
                    ).join(", ")}`
                );
            }
            return true;
        }),
        
    // Handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Utility.handleError(
                res,
                errors.array(),
                ResponseCode.BAD_REQUEST
            );
        }
        next();
    },
];


