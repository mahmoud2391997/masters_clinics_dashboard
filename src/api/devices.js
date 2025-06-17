import axios, {} from "axios";
// ----- Helper -----
function getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : "",
        },
    };
}
// ----- API Functions -----
// Get all devices
export const getDevices = async () => {
    const response = await axios.get(`http://localhost:3000/devices`, getAuthHeaders());
    return response.data;
};
// Add new device
export const addDevice = async (formData) => {
    const response = await axios.post(`http://localhost:3000/devices`, formData, getAuthHeaders());
    return response.data;
};
// Update device by ID
export const updateDevice = async (id, formData) => {
    const response = await axios.put(`http://localhost:3000/devices/${id}`, formData, getAuthHeaders());
    return response.data;
};
// Delete device by ID
export const deleteDevice = async (id) => {
    const response = await axios.delete(`http://localhost:3000/devices/${id}`, getAuthHeaders());
    return response.data;
};
