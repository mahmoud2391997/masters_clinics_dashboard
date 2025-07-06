import axios from 'axios';
const API_BASE_URL = 'http://localhost:3000/departments';
// Get all departments
export const fetchDepartments = async () => {
    const response = await axios.get(API_BASE_URL, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
    return response.data;
};
// Get a single department by ID
export const fetchDepartmentById = async (_id) => {
    const response = await axios.get(`${API_BASE_URL}/${_id}`);
    return response.data;
};
// Create a new department
export const createDepartment = async (department) => {
    const response = await axios.post(API_BASE_URL, department);
    return response.data;
};
// Update a department
// Delete a department
export const deleteDepartment = async (_id) => {
    await axios.delete(`${API_BASE_URL}/${_id}`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
};
