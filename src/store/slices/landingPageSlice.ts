import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

interface LandingPageContent {
  landingScreen: {
    title: string;
    subtitle: string;
    description: string;
    image: string | File;
  };
  services: Array<{
    id?: string;
    name: string;
    description: string;
    branches: string[];
  }>;
  offers: Array<{
    id?: string;
    offer: string;
    price: string;
    description?: string;
    image: string | File;
    branches: string[];
  }>;
  doctors: Array<{
    id?: string;
    name: string;
    specialization: string;
    image: string | File;
    branches: string[];
  }>;
}

interface LandingPage {
  id: string;
  creator: string;
  title: string;
  createdAt: string;
  platforms: {
    facebook: boolean;
    instagram: boolean;
    x: boolean;
    tiktok: boolean;
    google: boolean;
    snapchat: boolean;
  };
  showSections: {
    landingScreen: boolean;
    services: boolean;
    offers: boolean;
    doctors: boolean;
  };
  content: LandingPageContent;
  enabled: boolean;
}

interface LandingPageState {
  landingPages: LandingPage[];
  currentLandingPage: LandingPage | null;
  loading: boolean;
  error: string | null;
  existingItems: {
    doctors: any[];
    services: any[];
    offers: any[];
  };
}

const initialState: LandingPageState = {
  landingPages: [],
  currentLandingPage: null,
  loading: false,
  error: null,
  existingItems: {
    doctors: [],
    services: [],
    offers: [],
  },
};

// Async thunks
export const fetchLandingPages = createAsyncThunk(
  'landingPages/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('https://www.ss.mastersclinics.com/landingPages', {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch landing pages');
      }

      return await response.json();
    } catch (error) {
      
      return rejectWithValue('فشل في جلب صفحات الهبوط');
    }
  }
);

export const fetchLandingPageById = createAsyncThunk(
  'landingPages/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://www.ss.mastersclinics.com/landingPage/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch landing page');
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue('فشل في جلب صفحة الهبوط');
    }
  }
);

export const updateLandingPage = createAsyncThunk(
  'landingPages/update',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    console.log(data);
    
    try {
   

      const response = await fetch(`https://www.ss.mastersclinics.com/landingPage/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          // DO NOT manually set 'Content-Type' for multipart/form-data
        },
        body: data,
      });

      if (!response.ok) {
        console.log(response);
        
        throw new Error('Failed to update landing page');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating landing page:', error);
      return rejectWithValue('فشل في تحديث صفحة الهبوط');
    }
  }
);


export const deleteLandingPage = createAsyncThunk(
  'landingPages/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`https://www.ss.mastersclinics.com/landingPage/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete landing page');
      }

      return id;
    } catch (error) {
      return rejectWithValue('فشل في حذف صفحة الهبوط');
    }
  }
);

export const fetchExistingItems = createAsyncThunk(
  'landingPages/fetchExistingItems',
  async (_, { rejectWithValue }) => {
    try {
      const [doctorsRes, servicesRes, offersRes] = await Promise.all([
        fetch('https://www.ss.mastersclinics.com/doctors', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        }),
        fetch('https://www.ss.mastersclinics.com/services', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        }),
        fetch('https://www.ss.mastersclinics.com/offers', {
          headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
        }),
      ]);

      const [doctors, services, offers] = await Promise.all([
        doctorsRes.json(),
        servicesRes.json(),
        offersRes.json(),
      ]);
console.log(doctors);

      return { doctors, services, offers };
    } catch (error) {
      return rejectWithValue('فشل في جلب البيانات الموجودة');
    }
  }
);

const landingPageSlice = createSlice({
  name: 'landingPages',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLandingPage: (state, action: PayloadAction<LandingPage | null>) => {
      state.currentLandingPage = action.payload;
    },
    updateCurrentLandingPageContent: (state, action: PayloadAction<Partial<LandingPageContent>>) => {
      if (state.currentLandingPage) {
        state.currentLandingPage.content = {
          ...state.currentLandingPage.content,
          ...action.payload,
        };
      }
    },
    updateCurrentLandingPageSettings: (state, action: PayloadAction<Partial<Omit<LandingPage, 'content'>>>) => {
      if (state.currentLandingPage) {
        state.currentLandingPage = {
          ...state.currentLandingPage,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all landing pages
      .addCase(fetchLandingPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandingPages.fulfilled, (state, action) => {
        state.loading = false;
        state.landingPages = action.payload;
      })
      .addCase(fetchLandingPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch landing page by ID
      .addCase(fetchLandingPageById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLandingPageById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLandingPage = action.payload;
      })
      .addCase(fetchLandingPageById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update landing page
      .addCase(updateLandingPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLandingPage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLandingPage = action.payload;
        const index = state.landingPages.findIndex(page => page.id === action.payload.id);
        if (index !== -1) {
          state.landingPages[index] = action.payload;
        }
      })
      .addCase(updateLandingPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete landing page
      .addCase(deleteLandingPage.fulfilled, (state, action) => {
        state.landingPages = state.landingPages.filter(page => page.id !== action.payload);
        if (state.currentLandingPage?.id === action.payload) {
          state.currentLandingPage = null;
        }
      })
      // Fetch existing items
      .addCase(fetchExistingItems.fulfilled, (state, action) => {
        state.existingItems = action.payload;
      });
  },
});

export const {
  clearError,
  setCurrentLandingPage,
  updateCurrentLandingPageContent,
  updateCurrentLandingPageSettings,
} = landingPageSlice.actions;

export default landingPageSlice.reducer;
export type {LandingPageState}