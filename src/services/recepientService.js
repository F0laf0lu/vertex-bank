

class ReceipientService{

    #receipientRepo

    constructor(_receipientRepo){
        this.#receipientRepo = _receipientRepo
    }

    async createReceipient(data){
        return await this.#receipientRepo.create(data)
    }

    async getReceipient(fields){
        const query = {where: { ...fields }}
        return await this.#receipientRepo.fetchOne(query)
    }

    async getReceipientById(id){

    }

}


export default ReceipientService