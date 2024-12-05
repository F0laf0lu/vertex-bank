import crypto from "crypto";
import pkg from "winston";

const { createLogger, format, info, transport, transports } = pkg;

const handleSuccess = (res, message, data = {}, statusCode) => {
    return res
        .status(statusCode)
        .json({ status: true, message: message, data: { ...data } });
};

const handleError = (res, message, statusCode) => {
    logger.log({ level: "error", message });
    return res.status(statusCode).json({ status: false, error: message });
};

const generateCode = (length = 32, numeric = false) => {
    if (!numeric) {
        return crypto.randomBytes(length).toString("hex");
    }
    length = 6;
    const randomBytes = crypto.randomBytes(length);
    const randomNumber = parseInt(randomBytes.toString("hex"), 16);
    const code = randomNumber.toString().slice(0, length);
    return code.padStart(length, "0");
};

const logger = createLogger({
    transports: [
        new transports.File({
            filename: "./logs/index.log",
            level: "error",
            format: format.combine(
                format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                format.printf(
                    (info) =>
                        `${info.timestamp} ${info.level} : ${info.message} `
                )
            ),
        }),
    ],
});

const Utility = {
    handleError,
    handleSuccess,
    generateCode,
    logger
};

export default Utility;
