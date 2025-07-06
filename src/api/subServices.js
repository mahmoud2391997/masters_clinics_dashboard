import axios from 'axios';
const API_URL = 'http://localhost:3000/subServices';
function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
        Authorization: token ? `Bearer ${token}` : '',
    };
}
// src/api/services.ts
export const editSubService = async (id, formData) => {
    const response = await fetch(`http://localhost:3000/subServices/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
            // Don't set Content-Type manually when using FormData
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
    if (!response.ok)
        throw new Error('Failed to update service');
    return await response.json();
};
export async function deleteSubService(id) {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
    });
    return response.data;
}
