import { body, validationResult } from "express-validator";
import Utility from "../utils/utils.js";


const registerValidator = [
    body('firstname')
        .notEmpty().withMessage('First name is required')
        .isString().withMessage('First name should be a string')
        .trim(),

    body('lastname')
        .notEmpty().withMessage('Last name is required')
        .isString().withMessage('Last name should be a string')
        .trim(),

    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .trim(),

    // Handle validation errors
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return Utility.handleError(res, errors.array(), ResponseCode.BAD_REQUEST);
        }
        next();
    }
]


const loginValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .trim(),
]

const forgotPasswordValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),
]

const resetPasswordValidator = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .trim()
        .isEmail().withMessage('Please enter a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .trim(),

    body('token').trim().notEmpty().withMessage("Provide code sent to your email")
]


const Validators = {
    registerValidator,
    loginValidator,
    forgotPasswordValidator,
    resetPasswordValidator
}

export default Validators