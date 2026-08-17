import api from "./api";

export const processPayment = async (paymentData) => {
    return await api.post("/payments/process", paymentData);
};

export const getClientPayments = async (clientId) => {
    return await api.get(`/payments/client/${clientId}`);
};
