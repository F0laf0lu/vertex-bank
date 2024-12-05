import { DataTypes } from "sequelize";
import DB from "../database/connectDB.js";
import { v4 as uuidv4 } from "uuid";


const TransactionModel = DB.define(
    "Transaction",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accountId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        reference: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(30, 2),
            defaultValue: 0.0,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        senderAccountNo:{
            type: DataTypes.STRING,
            allowNull: true
        },
        receiverAccountNo:{
            type: DataTypes.STRING,
            allowNull: true
        },
        description:{
            type: DataTypes.STRING,    
            allowNull:true
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    },
    {
        timestamps: true,
        tableName: "transactions",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    }
);



export default TransactionModel;