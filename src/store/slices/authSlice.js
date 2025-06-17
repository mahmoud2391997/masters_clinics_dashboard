import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const initialState = {
    user: null,
    token: sessionStorage.getItem('token'),
    isAuthenticated: !!sessionStorage.getItem('token'),
    loading: false,
    error: null,
};
// Async thunks
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
    try {
        const response = await fetch('http://localhost:3000/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if (!response.ok) {
            return rejectWithValue(data.message || 'فشل تسجيل الدخول');
        }
        sessionStorage.setItem('token', data.idToken);
        sessionStorage.setItem('role', data.role);
        if (data.user) {
            sessionStorage.setItem('userData', JSON.stringify(data.user));
        }
        return {
            user: data.user,
            token: data.idToken,
            role: data.role,
        };
    }
    catch {
        return rejectWithValue('حدث خطأ غير متوقع');
    }
});
export const logoutUser = createAsyncThunk('auth/logout', async () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('userData');
});
export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async (_, { rejectWithValue }) => {
    try {
        const token = sessionStorage.getItem('token');
        if (!token)
            return rejectWithValue('No token found');
        const response = await fetch('http://localhost:3000/protected', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('role');
            sessionStorage.removeItem('userData');
            return rejectWithValue('Token invalid');
        }
        const data = await response.json();
        return data.user;
    }
    catch {
        return rejectWithValue('Auth check failed');
    }
});
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setUser: (state, action) => {
            state.user = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
            .addCase(loginUser.fulfilled, (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        })
            .addCase(loginUser.rejected, (state, action) => {
            state.loading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload;
        })
            .addCase(logoutUser.fulfilled, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.error = null;
        })
            .addCase(checkAuthStatus.fulfilled, (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        })
            .addCase(checkAuthStatus.rejected, (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
        });
    },
});
export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
