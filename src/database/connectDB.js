import { Sequelize } from "sequelize";
import dotenv  from "dotenv";
dotenv.config()


const database = process.env.DB_NAME
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const host = process.env.DB_HOST


const sequelize = new Sequelize(database, username, password, {
    host,
    dialect: 'postgres',
    port: process.env.DB_PORT,
    logging: false
});


export default sequelize