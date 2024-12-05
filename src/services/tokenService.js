import { addMinutes } from "date-fns";
import Utility from "../utils/utils.js";


class TokenService{
    #tokenRepository
    tokenTypes = {
        FORGOT_PASSWORD:'FORGOT_PASSWORD'
    }

    tokenStatus = {
        USED: 'USED',
        NOTUSED: 'NOTUSED'
    }

    #tokenExpiresMin = 5

    constructor(_tokenRepository){
        this.#tokenRepository = _tokenRepository;
    }

    async getTokenByField(field){
        const query = { where: {...field}}
        return await this.#tokenRepository.fetchOne(query)
    }
    
    async forgotPasswordToken(email){
        const tokenData = {
            key: email,
            type: this.tokenTypes.FORGOT_PASSWORD,
            expires : addMinutes(new Date(), this.#tokenExpiresMin),
            status : this.tokenStatus.NOTUSED,
        }
        const token  = await this.createToken(tokenData)
        return token
    }


    async createToken(data){
        const tokenData = {...data}
        tokenData.code = Utility.generateCode(16, true);
        let codeExists = true;

        while (codeExists) {
            const code = await this.getTokenByField({code: tokenData.code})
            if (!code) {
                codeExists = false
                break;
            }
        }
        return this.#tokenRepository.create(tokenData)
    }

    async updateToken(data, field){
        const query = { where:  { ...field } }
        return await this.#tokenRepository.updateOne(data, query)
    }
}


export default TokenService