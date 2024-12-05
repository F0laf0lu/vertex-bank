import AccountModel from "../model/accountModel.js";

class AccountRepository {
    async create(data) {
        return await AccountModel.create(data);
    }

    async fetchOne(query) {
        return await AccountModel.findOne(query);
    }

    async fetchAll(query) {
        return await AccountModel.findAll(query);
    }

    async updateOne(data, query) {
        return await AccountModel.update(data, query); 
    }
}

export default AccountRepository;
