import axios from 'axios';

const API_URL = 'https://www.ss.mastersclinics.com/subServices';

function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
        Authorization: token ? `Bearer ${token}` : '',
    };
}

// src/api/services.ts
export const editSubService = async (id: string, formData: FormData) => {
  const response = await fetch(`https://www.ss.mastersclinics.com/subServices/${id}`, {
    method: 'PUT',
    body: formData,
    headers: {
      // Don't set Content-Type manually when using FormData
      "Authorization": `Bearer ${sessionStorage.getItem("token")}`
    }
  });

  if (!response.ok) throw new Error('Failed to update service');
  return await response.json();
};
export async function deleteSubService(id: string) {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeaders(),
        
    });
    return response.data;
}