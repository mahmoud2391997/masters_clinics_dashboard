import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    branches: [],
    loading: false,
    error: null,
};
export const fetchBranches = createAsyncThunk('branches/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch('https://www.ss.mastersclinics.com/branches', {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch branches');
        }
        const data = await response.json();
        return data.data || data;
    }
    catch (error) {
        return rejectWithValue('فشل في جلب الفروع');
    }
});
const branchesSlice = createSlice({
    name: 'branches',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBranches.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchBranches.fulfilled, (state, action) => {
            state.loading = false;
            state.branches = action.payload;
        })
            .addCase(fetchBranches.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError } = branchesSlice.actions;
export default branchesSlice.reducer;
