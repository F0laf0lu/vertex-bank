class UserService{

    #userRepository

    constructor(_userRepository){
        this.#userRepository = _userRepository;
    }

    async getUserByField(field) {
        const query = { where: {...field}}
        return await this.#userRepository.fetchOne(query)
    }

    async createUser(userRecord){
        return this.#userRepository.create(userRecord)
    }

    async updateUser(data, field){
        const query =  { where: { ...field} }
        return this.#userRepository.updateOne(data, query)
    }

}

export default UserService