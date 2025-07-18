import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    departments: [],
    loading: false,
    error: null,
};
export const fetchDepartments = createAsyncThunk('departments/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch('https://www.ss.mastersclinics.com/departments', {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch departments');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue('فشل في جلب الأقسام');
    }
});
const departmentsSlice = createSlice({
    name: 'departments',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDepartments.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchDepartments.fulfilled, (state, action) => {
            state.loading = false;
            state.departments = action.payload;
        })
            .addCase(fetchDepartments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError } = departmentsSlice.actions;
export default departmentsSlice.reducer;
