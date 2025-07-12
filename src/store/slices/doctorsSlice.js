import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    doctors: [],
    loading: false,
    error: null,
};
export const fetchDoctors = createAsyncThunk('doctors/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch('https://www.ss.mastersclinics.com/doctors', {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch doctors');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue('فشل في جلب الأطباء');
    }
});
const doctorsSlice = createSlice({
    name: 'doctors',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDoctors.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchDoctors.fulfilled, (state, action) => {
            state.loading = false;
            state.doctors = action.payload;
        })
            .addCase(fetchDoctors.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError } = doctorsSlice.actions;
export default doctorsSlice.reducer;
