import axios from 'axios';

const API_BASE = 'https://www.ss.mastersclinics.com'; // Adjust base URL as needed

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    return {
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    };
};

// Regions API
export const getRegions = async () => (await axios.get(`${API_BASE}/regions`, getAuthHeaders())).data;

export const getRegion = async (id: string | number) => (await axios.get(`${API_BASE}/regions/${id}`, getAuthHeaders())).data;
export const createRegion = async (data: any) => (await axios.post(`${API_BASE}/regions`, data, getAuthHeaders())).data;
export const updateRegion = async (id: string | number, data: any) => (await axios.put(`${API_BASE}/regions/${id}`, data, getAuthHeaders())).data;
export const deleteRegion = async (id: string | number) => (await axios.delete(`${API_BASE}/regions/${id}`, getAuthHeaders())).data;

// Branches API
export const getBranches = async () => (await axios.get(`${API_BASE}/branches`, getAuthHeaders()));
export const getBranch = async (id: string | number) => (await axios.get(`${API_BASE}/branches/${id}`, getAuthHeaders())).data;
export const createBranch = async (data: any) => (await axios.post(`${API_BASE}/branches`, data, getAuthHeaders())).data;
export const updateBranch = async (id: string | number, data: any) => (await axios.put(`${API_BASE}/branches/${id}`, data, getAuthHeaders())).data;
export const deleteBranch = async (id: string | number) => {
console.log(id);

   return (await axios.delete(`${API_BASE}/branches/${id}`, getAuthHeaders())).data;
}