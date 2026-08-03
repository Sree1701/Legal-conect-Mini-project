import axios from "axios";

const API = "http://localhost:5000/api/users";

export const getAllAdvocates = async () => {
    try {
        const response = await axios.get(`${API}/advocates`);
        return response.data;
    } catch (error) {
        console.error("Error fetching advocates:", error);
        throw error;
    }
};