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
            const response = await fetch(
                "https://api.paystack.co/transaction/initialize",
                {
                    method: "POST",
                    headers: headers,
                    body: JSON.stringify({ ...payment_data }),
                }
            );
            const paystackData = await response.json();
            return paystackData
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
}

export default PaymentService;
