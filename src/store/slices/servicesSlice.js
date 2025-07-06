import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    services: [],
    loading: false,
    error: null,
};
export const fetchServices = createAsyncThunk('services/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch('http://localhost:3000/services', {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue('فشل في جلب الخدمات');
    }
});
const servicesSlice = createSlice({
    name: 'services',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchServices.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchServices.fulfilled, (state, action) => {
            state.loading = false;
            state.services = action.payload;
        })
            .addCase(fetchServices.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError } = servicesSlice.actions;
export default servicesSlice.reducer;
