import axios from 'axios';
const API_URL = 'https://www.ss.mastersclinics.com/appointments';
// Get all landing pages
export const getLandingPages = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};
// Get a single landing page by ID
export const getLandingPageById = async (id) => {
    const response = await axios.get(`https://www.ss.mastersclinics.com/landingPage/${id}`);
    console.log(response.data);
    return response.data;
};
// Create a new landing page
// Update a landing page by ID
export const updateLandingPage = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
};
export const updateAppointments = async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${sessionStorage.getItem('token') || ''}`
        }
    });
    console.log(response.data);
    return response.data;
};
// Delete a landing page by ID
export const deleteLandingPage = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};
// Delete an appointment by ID
export const deleteAppointment = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token') || ''}`,
        },
    });
    return response.data;
};
