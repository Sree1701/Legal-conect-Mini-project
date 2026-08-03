import api from "./api";

export const bookAppointment = async (data) => {
    return await api.post("/appointments/book", data);
};

export const getClientAppointments = async (clientId) => {
    return await api.get(`/appointments/client/${clientId}`);
};

export const getAdvocateAppointments = async (advocateId) => {
    return await api.get(`/appointments/advocate/${advocateId}`);
};

export const assignSlot = async (id, data) => {
    return await api.put(`/appointments/assign-slot/${id}`, data);
};

export const rejectAppointment = async (id) => {
    return await api.put(`/appointments/reject/${id}`);
};

export const completeAppointment = async (id) => {
    return await api.put(`/appointments/complete/${id}`);
};