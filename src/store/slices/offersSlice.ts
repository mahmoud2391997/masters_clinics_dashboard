import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Offer {
  id: string;
  title: string;
  description: string;
  image: string;
  priceBefore: string;
  priceAfter: string;
  discountPercentage: string;
  branches: string[];
  services_ids: string[];
  doctors_ids: string[];
}

interface OffersState {
  offers: Offer[];
  loading: boolean;
  error: string | null;
}

const initialState: OffersState = {
  offers: [],
  loading: false,
  error: null,
};

export const fetchOffers = createAsyncThunk(
  'offers/fetchAll',
  async (_, { rejectWithValue }) => {
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
    } catch (error) {
      return rejectWithValue('فشل في جلب العروض');
    }
  }
);

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
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = offersSlice.actions;
export default offersSlice.reducer;
export type { OffersState}