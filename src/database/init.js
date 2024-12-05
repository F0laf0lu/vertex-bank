import sequelize from "./connectDB.js";
import UserModel from "../model/userModel.js";
import TokenModel from "../model/tokenModel.js";
import AccountModel from "../model/accountModel.js";
import TransactionModel from "../model/transactionModel.js";


const DbInitialize = async()=>{
    try {
        await sequelize.authenticate()
        await UserModel.sync()
        await TokenModel.sync()
        await AccountModel.sync()
        await TransactionModel.sync()
    } catch (error) {
        console.error(error)
        console.log("Unable to connect to database")
    }
}

export default DbInitialize