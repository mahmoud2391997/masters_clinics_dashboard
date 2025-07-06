import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/departments';

export interface Department {
    _id: string; // MongoDB ObjectId as a string
    id: number;
    name: string;
    description?: string;
    imageUrl?: string; // Optional field for department image


    // Add other department fields as needed
}

// Get all departments
export const fetchDepartments = async (): Promise<Department[]> => {
    const response = await axios.get<Department[]>(API_BASE_URL,
        {
            headers:{
                "Authorization": `Bearer ${sessionStorage.getItem("token")}`
            }
        }
    );
    return response.data;
};

// Get a single department by ID
export const fetchDepartmentById = async (_id: string): Promise<Department> => {
    const response = await axios.get<Department>(`${API_BASE_URL}/${_id}`);
    return response.data;
};

// Create a new department
export const createDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
    const response = await axios.post<Department>(API_BASE_URL, department);
    return response.data;
};

// Update a department


// Delete a department
export const deleteDepartment = async (_id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/${_id}`,{

      headers: {
        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
      }
    } );
};
