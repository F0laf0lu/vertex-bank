import TokenModel from "../model/tokenModel.js";


class TokenRepository{

    async create(trxnData){
        return await TokenModel.create(trxnData);
    }

    async fetchOne(query){
        return await TokenModel.findOne(query)
    }
    
    async updateOne(data, query){
        return await TokenModel.update(data, query)
    }
}

export default TokenRepository