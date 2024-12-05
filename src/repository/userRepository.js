import UserModel from "../model/userModel.js";


class UserRepository{
    async create(userData){
        return await UserModel.create(userData)
    }

    async fetchOne(query){
        return await UserModel.findOne(query)
    }

    async fetchAll(query){
        return await UserModel.findAll(query)
    }

    async updateOne(data, query){
        return await UserModel.update(data, query)
    }
}

export default UserRepository