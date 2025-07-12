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
    const response = await axios.get(`https://www.ss.mastersclinics.com/devices`, getAuthHeaders());
    return response.data;
};
// Add new device
export const addDevice = async (formData) => {
    const response = await axios.post(`https://www.ss.mastersclinics.com/devices`, formData, getAuthHeaders());
    return response.data;
};
// Update device by ID
export const updateDevice = async (id, formData) => {
    const response = await axios.put(`https://www.ss.mastersclinics.com/devices/${id}`, formData, getAuthHeaders());
    return response.data;
};
// Delete device by ID
export const deleteDevice = async (id) => {
    const response = await axios.delete(`https://www.ss.mastersclinics.com/devices/${id}`, getAuthHeaders());
    return response.data;
};
