import api from "./api";

export const getAllAdvocates = async () => {
    try {
        const response = await api.get("/users/advocates");
        return response.data;
    } catch (error) {
        console.error("Error fetching advocates:", error);
        throw error;
    }
};

export const getAdvocateSlots = async (advocateId) => {
    return await api.get(`/users/slots/${advocateId}`);
};

export const addAdvocateSlot = async (advocateId, slotData) => {
    return await api.post(`/users/slots/${advocateId}/add`, slotData);
};

export const autoGenerateSlots = async (advocateId, generateData) => {
    return await api.post(`/users/slots/${advocateId}/generate`, generateData);
};

export const deleteAdvocateSlot = async (advocateId, slotId) => {
    return await api.delete(`/users/slots/${advocateId}/${slotId}`);
};