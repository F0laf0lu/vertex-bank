import sequelize from "../database/connectDB.js";
import { AccountStatus } from "../utils/enum.js";

class AccountService {
    #accountRepository;

    constructor(_accountRepository) {
        this.#accountRepository = _accountRepository;
    }

    generateAccountNumber() {
        let accountNumber = "";
        for (let i = 0; i < 10; i++) {
            accountNumber += Math.floor(Math.random() * 10);
        }
        return accountNumber;
    }

    async createAccountNumber() {
        let accountNo = "";
        while (accountNo == "") {
            const result = this.generateAccountNumber();
            let query = { where: { accountNumber: result } };
            const exist = await this.#accountRepository.fetchOne(query);
            if (!exist) {
                accountNo = result;
                break;
            }
        }
        return accountNo;
    }

    async createAccount(data) {
        const accountData = {
            ...data,
            accountNumber: await this.createAccountNumber(),
            balance: 0.0,
            status: AccountStatus.ACTIVE,
        };
        return this.#accountRepository.create(accountData);
    }

    async getUserAccounts(userId) {
        const query = { where: { userId: userId } };
        return await this.#accountRepository.fetchAll(query);
    }

    async getAccountByField(fieldData) {
        const query = { where: { ...fieldData } };
        return await this.#accountRepository.fetchOne(query);
    }   

    async creditAccount(accountNumber, amount){
        const query = { where: { accountNumber } }
        const data = {
            balance: sequelize.literal(`balance+${amount}`)
        }
        return await this.#accountRepository.updateOne(data, query)
    }
}

export default AccountService;
