import { DataTypes } from "sequelize";
import DB from "../database/connectDB.js";
import { v4 as uuidv4 } from "uuid";

const ReceipientModel = DB.define(
    "Recipient",
    {
        id: {
            type: DataTypes.STRING,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true,
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accountName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accountNumber: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bankCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        receipientCode:{
            type:DataTypes.STRING,
            allowNull: false
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
        tableName: "recipients",
        createdAt: "createdAt",
        updatedAt: "updatedAt",
    }
);


export default ReceipientModel