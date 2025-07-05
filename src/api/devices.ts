import axios, { type AxiosRequestConfig } from "axios";

interface WorkingTimeSlot {
  type: 'singleDate' | 'dateRange';
  date?: string; // ISO format: e.g., "2025-06-02"
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  startDay?: WeekDay; // Only used if it's a date range
  endDay?: WeekDay;
  recurringTime?: {
    startTime: string; // "HH:mm"
    endTime: string;
  };
}



type WeekDay = 
  | 'الأحد' 
  | 'الاثنين' 
  | 'الثلاثاء' 
  | 'الأربعاء' 
  | 'الخميس' 
  | 'الجمعة' 
  | 'السبت';
interface Device {
  id: string;
    _id: string;
description?: string;
  name: string;
  department_id: number[];
  branches: number[];
  working_time_slots: WorkingTimeSlot[];
  sessionPeriod: string;
  imageUrl?: string;
}



// ----- Helper -----
function getAuthHeaders(): AxiosRequestConfig {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
}

// ----- API Functions -----

// Get all devices
export const getDevices = async (): Promise<Device[]> => {
  const response = await axios.get<Device[]>(`https://www.ss.mastersclinics.com/devices`, getAuthHeaders());
  return response.data;
};

// Add new device
export const addDevice = async (formData: FormData): Promise<any> => {
  const response = await axios.post(`https://www.ss.mastersclinics.com/devices`, formData, getAuthHeaders());
  return response.data;
};

// Update device by ID
export const updateDevice = async (id: string, formData: FormData): Promise<any> => {
  const response = await axios.put(`https://www.ss.mastersclinics.com/devices/${id}`, formData, getAuthHeaders());
  return response.data;
};

// Delete device by ID
export const deleteDevice = async (id: string): Promise<{ message: string }> => {
  const response = await axios.delete<{ message: string }>(`https://www.ss.mastersclinics.com/devices/${id}`, getAuthHeaders());
  return response.data;
};
