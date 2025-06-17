import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    appointments: [],
    loading: false,
    error: null,
};
export const fetchAppointments = createAsyncThunk('appointments/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch('http://localhost:3000/appointments', {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch appointments');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue('فشل في جلب المواعيد');
    }
});
const appointmentsSlice = createSlice({
    name: 'appointments',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAppointments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchAppointments.fulfilled, (state, action) => {
            state.loading = false;
            state.appointments = action.payload;
        })
            .addCase(fetchAppointments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
