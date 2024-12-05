import sequelize from "./connectDB.js";
import UserModel from "../model/userModel.js";
import TokenModel from "../model/tokenModel.js";
import AccountModel from "../model/accountModel.js";
import TransactionModel from "../model/transactionModel.js";


const DbInitialize = async()=>{
    try {
        await sequelize.authenticate()
        await UserModel.sync({ alter: true });
        await TokenModel.sync({ alter: true });
        await AccountModel.sync({ alter: true });
        await TransactionModel.sync({ alter: true });
    } catch (error) {
        console.error(error)
        console.log("Unable to connect to database")
    }
}

export default DbInitialize