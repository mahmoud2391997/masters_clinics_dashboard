import axios from 'axios';

const API_URL = 'http://localhost:3000/appointments';

// Get all landing pages
export const getLandingPages = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Get a single landing page by ID
export const getLandingPageById = async (id: string | number) => {
    const response = await axios.get(`http://localhost:3000/landingPage/${id}`);
    console.log(response.data);
    
    return response.data;
};

// Create a new landing page


// Update a landing page by ID
export const updateLandingPage = async (id: string | number, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};
export const updateAppointments = async (id: string | number, data: any) => {
    const response = await axios.put(`${API_URL}/${id}`, data,{
         headers: {
                        'Content-Type': 'application/json',  
"Authorization": `Bearer ${sessionStorage.getItem('token') || ''}`        

                    }}
    );
    console.log(response.data);
    
    return response.data;
};

// Delete a landing page by ID
export const deleteLandingPage = async (id: string | number) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
// Delete an appointment by ID
export const deleteAppointment = async (id: string | number) => {
  const response = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sessionStorage.getItem('token') || ''}`,
    },
  });
  return response.data;
};
