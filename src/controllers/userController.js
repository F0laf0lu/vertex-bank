import bcrypt from "bcryptjs"
import JWT from "jsonwebtoken";
import { AccountStatus, EmailStatus, UserRoles } from "../utils/enum.js";
import Utility from "../utils/utils.js";
import { ResponseCode } from "../utils/response.js";
import EmailService from "../services/emailService.js";


class UserController{
    #userService;
    #tokenService;
    constructor(_userService, _tokenService){
        this.#userService = _userService    
        this.#tokenService = _tokenService
    }
    async register (req, res) {
        try {
            const {firstname, lastname, email, password} = req.body
            const newUser = {
                username: firstname,
                firstname,
                lastname,
                email,
                role: UserRoles.CUSTOMER,
                accountStatus: AccountStatus.ACTIVE,
                isEmailVerified: EmailStatus.NOT_VERIFIED
            }
            newUser.password = await bcrypt.hash(password, 10)

            let userExists = await this.#userService.getUserByField({email: newUser.email})

            if (userExists) {
                return Utility.handleError(res, "Email already exists", ResponseCode.ALREADY_EXIST)
            }
            let user = await this.#userService.createUser(newUser) 
            user.password = ''

            return Utility.handleSuccess(res, "User registered successfully", {user}, ResponseCode.CREATED)

        } catch (error) {
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }

    async login (req, res) {
        try {            
            const {email, password} = req.body
            let user = await this.#userService.getUserByField({email:email})
            if (!user) {
                return Utility.handleError(res, 'Invalid login detail', ResponseCode.NOT_FOUND)
            }

            let passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return Utility.handleError(res, "Invalid login detail", ResponseCode.NOT_FOUND)
            }
            const token = JWT.sign({
                firstname: user.firstname,
                lastname: user.lastname,
                id: user.id,
                email: user.email,
                role: user.role
            }, process.env.JWT_KEY, {expiresIn:"15d"})
            user.password = ''
            return Utility.handleSuccess(res, "Login Successful", { user, token }, ResponseCode.SUCCESS);
        } catch (error) {
            console.log(error)
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }

    async forgotPassword (req, res) {
        try {
            const {email} = req.body

            let user = await this.#userService.getUserByField({ email })

            if (!user) {
                return Utility.handleError(res, 'Account does not exist', ResponseCode.NOT_FOUND)
            }
            // generatetoken
            const token = await this.#tokenService.forgotPasswordToken(user.email)
            // Send Email
            await EmailService.sendForgotPasswordLink(user, token.code)
            Utility.handleSuccess(res, "Password reset code sent", {}, ResponseCode.SUCCESS)
        } catch (error) {
            console.log(error)
            Utility.handleError(res,error.message, ResponseCode.SERVER_ERROR)
        }
    }

    async resetPassword (req, res) {
        try {
            const {email, token, password} = req.body

            let validToken = await this.#tokenService.getTokenByField(
                {key:email, code:token, type:'FORGOT_PASSWORD', status:'NOTUSED'})
            
            if (!validToken) {
                return Utility.handleError(res, 'Token has expired', ResponseCode.NOT_FOUND)
            }
            const currentTime = Date.now();
            const expirationTime = new Date(validToken.expires).getTime();

            if (currentTime > expirationTime) {
                return Utility.handleError(res, 'Token has expired', ResponseCode.BAD_REQUEST)
            }

            let user = await this.#userService.getUserByField({ email })
            if (!user) {
                return Utility.handleError(res, 'Invalid User', ResponseCode.NOT_FOUND)
            }
            const _password = await bcrypt.hash(password, 10)

            await this.#userService.updateUser({password: _password}, {id: user.id})
            await this.#tokenService.updateToken({status: 'USED'}, {id: validToken.id})

            return Utility.handleSuccess(res, "Password reset successful ", {}, ResponseCode.SUCCESS);

        } catch (error) {
            console.error(error)
            return Utility.handleError(res, error.message, ResponseCode.SERVER_ERROR);
        }
    }


}




export default UserController