import { Router } from "express";
import UserController from "../controllers/userController.js";
import UserService from "../services/userService.js";
import Validators from "../validators/userValidator.js";
import UserRepository from "../repository/userRepository.js";
import TokenService from "../services/tokenService.js";
import TokenRepository from "../repository/tokenRepository.js";

const router = Router()
const userRepository = new UserRepository()
const tokenService = new TokenService(new TokenRepository())
const userService = new UserService(userRepository)
const userController = new UserController(userService, tokenService)

router.post('/register', Validators.registerValidator, (req, res)=>{
    return userController.register(req, res)
})

router.post('/login', Validators.loginValidator, (req, res)=>  {
    return userController.login(req, res)
})

router.post('/reset-password', Validators.resetPasswordValidator, (req, res)=>{
    return userController.resetPassword(req, res)
})

router.post('/forgot-password', Validators.forgotPasswordValidator ,(req, res)=>{
    return userController.forgotPassword(req, res)
})

export {router as UserRouter}