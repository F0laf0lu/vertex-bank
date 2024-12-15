import { TransactionStatus, TransactionType } from "../utils/enum.js"


class TransactionService{

    #transactionRepo

    constructor(_trxnRepository){
        this.#transactionRepo = _trxnRepository
    }

    async createTrxn(data){
        const newTrxn = {
            ...data,
            status: TransactionStatus.PENDING
        }
        return await this.#transactionRepo.create(newTrxn)
    }

    async getTrxnByField(fieldData){
        const query = { where : {...fieldData}}
        return await this.#transactionRepo.fetchOne(query)
    }

    async setStatus(data, transId, dbOptions){
        const query = {
            where: { id: transId },
            returning: true,
            ...dbOptions,
        };
        const [rowsUpdated, [updatedTransaction]] = await this.#transactionRepo.updateOne(data, query)
        return updatedTransaction;
    }
}


export default TransactionService