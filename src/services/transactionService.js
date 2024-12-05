import { TransactionStatus, TransactionType } from "../utils/enum.js"


class TransactionService{

    #transactionRepo

    constructor(_trxnRepository){
        this.#transactionRepo = _trxnRepository
    }

    async createTrxn(data){
        const newTrxn = {
            ...data,
            type: TransactionType.DEPOSIT,
            status: TransactionStatus.PENDING
        }
        return await this.#transactionRepo.create(newTrxn)
    }

    async getTrxnByField(fieldData){
        const query = { where : {...fieldData}}
        return await this.#transactionRepo.fetchOne(query)
    }

    async updateTransaction(data, transId){
        const query = { where: { id: transId }, returning: true };
        return await this.#transactionRepo.updateOne(data, query)
    }
}


export default TransactionService