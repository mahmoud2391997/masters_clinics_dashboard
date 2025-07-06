import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Doctor {
  _id: string;
  id: number;
  name: string;
  specialty: string;
  bio: string;
  department: string;
  branches: string[];
  imageUrl?: string;
}

interface DoctorsState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorsState = {
  doctors: [],
  loading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/doctors', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('فشل في جلب الأطباء');
    }
  }
);

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
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = doctorsSlice.actions;
export default doctorsSlice.reducer;
export type { DoctorsState}