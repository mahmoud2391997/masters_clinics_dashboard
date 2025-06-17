import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { CircularProgress, Alert } from "@mui/material";
const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { loading, error } = useAppSelector((state) => state.auth);
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Basic email validation
        if (!email.includes("@")) {
            return;
        }
        try {
            await dispatch(loginUser({ email, password })).unwrap();
            navigate("/leads");
        }
        catch (err) {
            // Error is handled by Redux
        }
    };
    // Clear error when user starts typing
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        if (error) {
            dispatch(clearError());
        }
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (error) {
            dispatch(clearError());
        }
    };
    return (_jsx("div", { className: "min-h-screen flex justify-center items-center bg-[#f6eecd] px-4", dir: "rtl", children: _jsxs("div", { className: "bg-white p-10 rounded-xl shadow-xl max-w-md w-full", children: [_jsx("h2", { className: "text-3xl font-semibold text-black mb-8 text-center", children: "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0625\u0644\u0649 \u062D\u0633\u0627\u0628\u0643" }), error && (_jsx(Alert, { severity: "error", sx: { mb: 3 }, children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block mb-2 text-sm font-medium text-gray-700", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx("input", { type: "email", id: "email", name: "email", value: email, onChange: handleEmailChange, placeholder: "example@you.com", required: true, autoComplete: "email", disabled: loading, className: "w-full rounded-md border border-gray-300 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f6eecd] transition disabled:opacity-50" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block mb-2 text-sm font-medium text-gray-700", children: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" }), _jsxs("div", { className: "relative", children: [_jsx("input", { type: showPassword ? "text" : "password", id: "password", name: "password", value: password, onChange: handlePasswordChange, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "current-password", disabled: loading, className: "w-full rounded-md border border-gray-300 px-4 py-3 pr-12 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f6eecd] transition disabled:opacity-50" }), _jsx("button", { type: "button", onClick: () => setShowPassword((show) => !show), disabled: loading, className: "absolute inset-y-0 left-3 flex items-center text-sm text-black hover:text-purple-800 focus:outline-none disabled:opacity-50", "aria-label": showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور", children: showPassword ? "إخفاء" : "إظهار" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: `w-full py-3 bg-black text-white rounded-md font-semibold hover:bg-[#f6eecd] focus:outline-none focus:ring-2 focus:ring-purple-500 transition flex items-center justify-center ${loading ? "opacity-70 cursor-not-allowed" : ""}`, children: loading ? (_jsxs(_Fragment, { children: [_jsx(CircularProgress, { size: 20, color: "inherit", sx: { mr: 1 } }), "\u062C\u0627\u0631\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644..."] })) : ("تسجيل الدخول") })] })] }) }));
};
export default Login;
