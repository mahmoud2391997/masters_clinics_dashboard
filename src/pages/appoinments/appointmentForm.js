"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { MenuItem, TextField, Button, CircularProgress, IconButton } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import React, { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const initialFormState = {
    name: "",
    phone: "",
    branch: "",
    landingPageId: "",
    utmSource: "",
    callLogs: [],
};
export default function LeadForm({ setAddLead }) {
    const [form, setForm] = useState({
        ...initialFormState,
        callLogs: [{
                timestamp: new Date().toISOString().slice(0, 16),
                status: "لم يتم التواصل",
                notes: ""
            }]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const validateForm = () => {
        if (!form.name.trim()) {
            setError("الاسم مطلوب");
            return false;
        }
        if (!form.phone.trim() || !/^[0-9]{10,15}$/.test(form.phone)) {
            setError("رقم هاتف صحيح مطلوب");
            return false;
        }
        return true;
    };
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError(null);
    };
    const handleCallLogChange = (index, field, value) => {
        setForm(prev => {
            const newCallLogs = [...prev.callLogs];
            newCallLogs[index] = { ...newCallLogs[index], [field]: value };
            return { ...prev, callLogs: newCallLogs };
        });
    };
    const addCallLog = () => {
        setForm(prev => ({
            ...prev,
            callLogs: [
                ...prev.callLogs,
                {
                    timestamp: new Date().toISOString().slice(0, 16),
                    status: "لم يتم التواصل",
                    notes: ""
                }
            ],
        }));
    };
    const removeCallLog = (index) => {
        if (form.callLogs.length <= 1) {
            toast.warning("يجب أن يحتوي على سجل مكالمة واحد على الأقل");
            return;
        }
        setForm(prev => {
            const newCallLogs = [...prev.callLogs];
            newCallLogs.splice(index, 1);
            return { ...prev, callLogs: newCallLogs };
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        setLoading(true);
        setError(null);
        const payload = {
            ...form,
            createdAt: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9),
        };
        try {
            const res = await fetch("https://www.ss.mastersclinics.com/appointments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });
            if (!res.ok)
                throw new Error("فشل إرسال البيانات");
            toast.success("تمت إضافة الرسالة بنجاح");
            setForm({
                ...initialFormState,
                callLogs: [{
                        timestamp: new Date().toISOString().slice(0, 16),
                        status: "لم يتم التواصل",
                        notes: ""
                    }]
            });
            setAddLead(false);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال";
            setError(message);
            toast.error(message);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-3xl mx-auto p-4 bg-white shadow rounded-lg", dir: "rtl", children: [_jsx("h2", { className: "text-xl font-bold mb-4", children: "\u0625\u0636\u0627\u0641\u0629 \u0631\u0627\u0626\u062F" }), error && (_jsx("div", { className: "bg-red-100 text-red-700 p-3 mb-4 rounded", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", name: "name", value: form.name, onChange: handleChange, required: true, fullWidth: true, error: !!error && !form.name.trim() }), _jsx(TextField, { label: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641", name: "phone", value: form.phone, onChange: handleChange, required: true, fullWidth: true, type: "tel", error: !!error && (!form.phone.trim() || !/^[0-9]{10,15}$/.test(form.phone)), helperText: "\u064A\u062C\u0628 \u0623\u0646 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 10-15 \u0631\u0642\u0645" }), _jsx(TextField, { label: "\u0627\u0644\u0641\u0631\u0639", name: "branch", value: form.branch, onChange: handleChange, required: true, fullWidth: true }), _jsxs("div", { className: "border p-4 rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "font-medium", children: "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A" }), _jsx(Button, { startIcon: _jsx(Add, {}), onClick: addCallLog, variant: "outlined", size: "small", children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0643\u0627\u0644\u0645\u0629" })] }), form.callLogs.map((log, index) => (_jsxs("div", { className: "mb-4 p-3 border rounded-md bg-gray-50", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629", type: "datetime-local", value: log.timestamp, onChange: (e) => handleCallLogChange(index, "timestamp", e.target.value), InputLabelProps: { shrink: true }, fullWidth: true }), _jsxs(TextField, { select: true, label: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629", value: log.status, onChange: (e) => handleCallLogChange(index, "status", e.target.value), fullWidth: true, children: [_jsx(MenuItem, { value: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644" }), _jsx(MenuItem, { value: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631", children: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631" }), _jsx(MenuItem, { value: "\u0645\u0647\u062A\u0645", children: "\u0645\u0647\u062A\u0645" }), _jsx(MenuItem, { value: "\u063A\u064A\u0631 \u0645\u0647\u062A\u0645", children: "\u063A\u064A\u0631 \u0645\u0647\u062A\u0645" }), _jsx(MenuItem, { value: "\u062A\u0645 \u0627\u0644\u062D\u062C\u0632", children: "\u062A\u0645 \u0627\u0644\u062D\u062C\u0632" }), _jsx(MenuItem, { value: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0639\u0644\u064A \u0627\u0644\u0648\u0627\u062A\u0633 \u0627\u0628" }), _jsx(MenuItem, { value: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F" }), _jsx(MenuItem, { value: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0648\u0642\u062A \u0627\u062E\u0631", children: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0648\u0642\u062A \u0627\u062E\u0631" })] }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: log.notes, onChange: (e) => handleCallLogChange(index, "notes", e.target.value), fullWidth: true })] }), _jsx("div", { className: "flex justify-end mt-2", children: _jsx(IconButton, { onClick: () => removeCallLog(index), color: "error", size: "small", "aria-label": "\u062D\u0630\u0641", children: _jsx(Delete, { fontSize: "small" }) }) })] }, index)))] }), _jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [_jsx(Button, { variant: "outlined", onClick: () => setAddLead(false), disabled: loading, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { type: "submit", variant: "contained", color: "primary", disabled: loading, startIcon: loading ? _jsx(CircularProgress, { size: 20 }) : null, children: loading ? "جاري الإرسال..." : "إرسال" })] })] })] }));
}
