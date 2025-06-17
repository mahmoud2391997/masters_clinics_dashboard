import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Branch {
  id: string;
  name: string;
  address: string;
  location_link: string;
  working_hours?: Array<{
    days: string;
    time: string;
  }>;
  region: string;
  imageUrl?: string;
  coordinates: { latitude: number; longitude: number };
}

interface BranchesState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
}

const initialState: BranchesState = {
  branches: [],
  loading: false,
  error: null,
};

export const fetchBranches = createAsyncThunk(
  'branches/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3000/branches', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      return rejectWithValue('فشل في جلب الفروع');
    }
  }
);

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
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = branchesSlice.actions;
export default branchesSlice.reducer;