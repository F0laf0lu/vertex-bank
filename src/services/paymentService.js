import Utility from "../utils/utils.js";

class PaymentService {
    async initializePaystackPayment(email, amount) {
        try {
            const payment_data = {
                email,
                amount: amount * 100,
                callback_url: "http://127.0.0.1:5500/verify.html",
                reference: `txn${Utility.generateCode(12)}`,
            };
            const headers = {
                Authorization: `BEARER ${process.env.PAYSTACK_SK}`,
                "Content-Type": "application/json",
            };
            const response = await fetch("https://api.paystack.co/transaction/initialize", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ ...payment_data }),
            });
            const paystackData = await response.json();
            return paystackData;
        } catch (error) {
            Utility.logger.error(error.message);
            return null;
        }
    }

    async verifyPaystackPayment(reference) {
        try {
            // Get transaction reference
            // verify transaction with paystack
            // update transaction to applicable status
            // Credit user  account
            const response = await fetch(
                `https://api.paystack.co/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `BEARER ${process.env.PAYSTACK_SK}`,
                    },
                }
            );
            const { data } = await response.json();
            if (data && data.status) {
                return true;
            }
            return false;
        } catch (error) {
            Utility.logger.error(error.message);
            return false;
        }
    }

    async createPaystackReceipient(acctNo, bankCode) {
        try {
            const response = await fetch("https://api.paystack.co/transferrecipient", {
                method: "POST",
                headers: {
                    Authorization: `BEARER ${process.env.PAYSTACK_SK}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "nuban",
                    // name: "Folafolu Osilaja",
                    account_number: acctNo,
                    bank_code: bankCode,
                    currency: "NGN",
                }),
            });

            if (!response.ok) {
                return {status: "failed", message:response.statusText}
            }
            const { data } = await response.json();
            if (!data) {
                return {status:false, message:"Request failed"}
            }
            return data
        } catch (error) {
            Utility.logger.error(error.message)
            return {status:false, message:'Operation failed'};
        }
    }

    async initiatePaystackTranfer(amount, reason='', receipientCode, reference){
        try {
            const transferData = {
                source: "balance",
                amount: amount * 100,
                reason,
                recipient: receipientCode,
                reference,
            };
            const response = await fetch("https://api.paystack.co/transfer", {
                method: "POST",
                headers: {
                    Authorization: `BEARER ${process.env.PAYSTACK_SK}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...transferData }),
            });
            // cannot initiate third party payouts as a starter business: from paystack
            // transfer can't be complete or verified since it's side project
            // I'll assume the transfer was successful
            // data will always be false
            const data = await response.json();

            // custom code to simulate failed or successful transaction
            let paystackData = { status: false };
            let status = [false, true];
            let num = Math.floor(Math.random() * 2);
            console.log(status[num])
            if (status[num]) {
                paystackData.status = true;
            }
            return paystackData;
        } catch (error) {
            Utility.logger.error(error.message);
            return {status:false, message:"Server Error"}
        }
    }
}

export default PaymentService;
