import jwt from "jsonwebtoken";
import { ResponseCode } from "../utils/response.js";
import Utility from "../utils/utils.js";
import dotenv from "dotenv";
import UserService from "../services/userService.js";
import UserRepository from "../repository/userRepository.js";
dotenv.config();

const userRepository = new UserRepository();
const userService = new UserService(userRepository)

const Auth = async (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return Utility.handleError(
            res,
            "Authorization failed",
            ResponseCode.UNAUTHORIZED
        );
    }
    token = token.split(" ")[1];
    const payload = jwt.decode(token, process.env.JWT_KEY);
    if (!payload) {
        return Utility.handleError(res, "Authorization failed");
    }
    const user = await userService.getUserByField({ id: payload.id });
    if (!user) {
        return Utility.handleError(
            res,
            "User not found",
            ResponseCode.UNAUTHORIZED
        );
    }
    req.body.user = payload;
    next();
};


export default Auth