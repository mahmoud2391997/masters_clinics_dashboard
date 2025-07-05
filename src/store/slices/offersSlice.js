import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    offers: [],
    loading: false,
    error: null,
};
export const fetchOffers = createAsyncThunk('offers/fetchAll', async (_, { rejectWithValue }) => {
    try {
        const response = await fetch('https://www.ss.mastersclinics.com/offers', {
            headers: {
                Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch offers');
        }
        return await response.json();
    }
    catch (error) {
        return rejectWithValue('فشل في جلب العروض');
    }
});
const offersSlice = createSlice({
    name: 'offers',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOffers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(fetchOffers.fulfilled, (state, action) => {
            state.loading = false;
            state.offers = action.payload;
        })
            .addCase(fetchOffers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});
export const { clearError } = offersSlice.actions;
export default offersSlice.reducer;
