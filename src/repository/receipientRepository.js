import ReceipientModel from "../model/recipientModel.js";



class ReceipientRepository {
    async create(data) {
        return await ReceipientModel.create(data);
    }

    async fetchOne(query) {
        return await ReceipientModel.findOne(query);
    }

    async updateOne(data, query) {
        return await ReceipientModel.update(data, query);
    }
}

export default ReceipientRepository