import TransactionModel from "../model/transactionModel.js";

class TransactionRepository {
    async create(data) {
        return await TransactionModel.create(data);
    }

    async fetchOne(query) {
        return await TransactionModel.findOne(query);
    }

    async fetchAll(query) {
        return await TransactionModel.findAll(query);
    }

    async updateOne(data, query) {
        return await TransactionModel.update(data, query);
    }
}

export default TransactionRepository;
