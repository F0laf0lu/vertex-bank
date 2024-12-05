import { DataTypes } from 'sequelize'
import DB from '../database/connectDB.js'
import { v4 as uuidv4 } from 'uuid'

const UserModel = DB.define(
    'User', {
        id:{
            type: DataTypes.UUID,
            defaultValue: () => uuidv4(),
            allowNull: false,
            primaryKey: true
        },
        username:{
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        password:{
            type:DataTypes.STRING,
            allowNull: false
        },
        firstname:{
            type: DataTypes.STRING,
            allowNull: false
        },
        lastname:{
            type: DataTypes.STRING,
            allowNull: false
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique:true
        },
        role:{
            type: DataTypes.STRING,
            allowNull: true
        },
        isEmailVerified:{
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        accountStatus:{
            type: DataTypes.STRING,
            allowNull: true
        },
        createdAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        },
        updatedAt:{
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false
        }
    },

    {
        timestamps:true,
        tableName:'users',
        createdAt:'createdAt',
        updatedAt:'updatedAt'
    }
)

export default UserModel