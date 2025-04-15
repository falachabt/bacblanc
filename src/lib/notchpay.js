// lib/notchpay.js
import axios from 'axios';

export class NotchPayService {
    constructor(publicKey = "pk.qoIGxn6D2TV5WNAXk0kfeIe8aT8Jo99I7em5QD9axKbjshtLBJ2nsXJ6Y79mYJtCxjC6fJ3qi4AHQzNwkAGHrToq7LHoctOf9na5v0cKAJA8WUyUK4YvcHmqBoyZg", secretKey) {
        this.secretKey = secretKey;
        this.client = axios.create({
            baseURL: 'https://api.notchpay.co',
            headers: {
                Authorization: publicKey,
                'Content-Type': 'application/json'
            }
        });
    }

    get publicKey() {
        return this.client.defaults.headers.Authorization;
    }

    /**
     * Initialize and charge payment in one step
     */
    async initiateDirectCharge(params) {
        try {
            const startInit = performance.now();
            // 1. Initialize payment
            const initResponse = await this.initializePayment(params);
            const endInit = performance.now();
            console.log(`Initialization time: ${(endInit - startInit) / 1000}s`);

            // 2. Process direct charge if transaction reference exists
            if (initResponse.transaction?.reference) {
                try {
                    const startCharge = performance.now();
                    const chargeResponse = await this.chargeMobileMoney(
                        initResponse.transaction.reference,
                        params.phone || '',
                        params.channel || "cm.mobile"
                    );
                    const endCharge = performance.now();
                    console.log(`Charge time: ${(endCharge - startCharge) / 1000}s`);

                    return {
                        initResponse,
                        chargeResponse
                    };
                } catch (chargeError) {
                    // If charging fails, return initialization response with error
                    console.log("Charge failed, returning init response with auth URL for fallback");
                    return {
                        initResponse,
                        error: chargeError.message || "Failed to charge mobile money"
                    };
                }
            }

            throw new Error('Failed to get transaction reference');

        } catch (error) {
            console.log(error.message);
            this.handleError(error);
        }
    }

    /**
     * Initialize payment only
     */
    async initializePayment(params) {
        try {
            // Add callback URL if not provided
            const callbackUrl = 'https://elearn.ezadrive.com/api/paiement_webhook/callback';

            const updatedParams = {
                ...params,
                callback: params.callback || callbackUrl
            };

            const response = await this.client.post('/payments', updatedParams);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Cancel a payment
     */
    async cancelPayment(reference) {
        try {
            const response = await this.client.delete(`/payments/${reference}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Process direct charge
     */
    async chargeMobileMoney(reference, phone, channel) {
        try {
            const response = await this.client.put(`/payments/${reference}`, {
                channel: channel || "cm.mobile",
                data: {
                    phone: "237" + phone
                }
            });

            return response.data;
        } catch (error) {
            console.log("error", error.message);
            throw error; // Throw error to be caught by initiateDirectCharge
        }
    }

    /**
     * Verify transaction status
     */
    async verifyTransaction(reference) {
        try {
            const response = await this.client.get(`/payments/${reference}`);
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Create refund
     */
    async createRefund(transactionRef, amount) {
        if (!this.secretKey) {
            throw new Error('Secret key required for refunds');
        }

        try {
            const response = await this.client.post('/refunds', {
                payment: transactionRef,
                amount
            }, {
                headers: {
                    'X-Auth': this.secretKey
                }
            });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        if (axios.isAxiosError(error)) {
            console.error(error, error.message);
            throw new Error(error.response?.data?.message || 'NotchPay API error');
        }
        throw error;
    }
}

// Export une instance par défaut
export const notchpay = new NotchPayService();