import express, { urlencoded } from "express";
import cors from 'cors'

import dotenv  from "dotenv";
dotenv.config()



import DbInitialize from './database/init.js'
import { UserRouter } from "./router/userRouter.js";
import { AccountRouter } from "./router/accountRouter.js";
import { TransactionRouter } from "./router/transactionRouter.js";


const app = express()

app.use(cors())

app.use(express.json());
app.use(urlencoded({ extended: true}));

app.use('/api/users', UserRouter)
app.use('/api/accounts', AccountRouter)
app.use('/api/transactions', TransactionRouter)




app.get('/', (req, res)=>{
    res.send(`Welcome to Vertex Bank`);
});

const PORT = process.env.PORT || 5000;

const startApp = async()=>{
    try {
        await DbInitialize()
        app.listen(PORT, ()=>{
            console.log(`Server running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Unable to start server', error)
    }
}

startApp()