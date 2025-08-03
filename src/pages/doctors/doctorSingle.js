import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Snackbar, Alert, MenuItem, Stack, FormControl, InputLabel, Select } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';
const DoctorSingle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [form, setForm] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const getAuthToken = () => sessionStorage.getItem('token') || '';
    const fetchWithAuth = async (url, options = {}) => {
        const token = getAuthToken();
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };
        return fetch(url, { ...options, headers });
    };
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`);
                if (!res.ok)
                    throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                setDoctor(data);
                setForm({
                    ...data,
                    branch_id: data.branch?.id,
                    department_id: data.department?.id
                });
            }
            catch (err) {
                setSnackbar({ open: true, message: 'حدث خطأ أثناء تحميل بيانات الطبيب', severity: 'error' });
            }
            finally {
                setLoading(false);
            }
        };
        const fetchOptions = async () => {
            try {
                const [branchesRes, departmentsRes] = await Promise.all([
                    fetchWithAuth('https://www.ss.mastersclinics.com/branches'),
                    fetchWithAuth('https://www.ss.mastersclinics.com/departments')
                ]);
                const branches = await branchesRes.json();
                const departments = await departmentsRes.json();
                setBranchOptions(branches);
                setDepartmentOptions(departments);
            }
            catch (err) {
                setSnackbar({ open: true, message: 'فشل تحميل الفروع أو الأقسام', severity: 'error' });
            }
        };
        if (id) {
            fetchData();
            fetchOptions();
        }
    }, [id]);
    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('name', form.name || '');
            formData.append('specialty', form.specialty || '');
            formData.append('services', form.services || '');
            formData.append('branch_id', String(form.branch_id || ''));
            formData.append('department_id', String(form.department_id || ''));
            formData.append('priority', String(form.priority ?? 0));
            formData.append('is_active', String(form.is_active ?? true));
            if (imageFile) {
                formData.append('image', imageFile);
            }
            const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`, {
                method: 'PUT',
                body: formData,
            });
            if (!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);
            const updated = await res.json();
            setDoctor({
                ...updated,
                branch: branchOptions.find(b => b.id === updated.branch_id) || null,
                department: departmentOptions.find(d => d.id === updated.department_id) || null
            });
            setForm({
                ...updated,
                branch_id: updated.branch_id,
                department_id: updated.department_id
            });
            setImageFile(null);
            setImagePreview(null);
            setEditMode(false);
            setSnackbar({ open: true, message: 'تم التحديث بنجاح', severity: 'success' });
        }
        catch (err) {
            setSnackbar({ open: true, message: 'فشل تحديث بيانات الطبيب', severity: 'error' });
        }
    };
    if (loading)
        return _jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", children: _jsx(CircularProgress, {}) });
    if (!doctor)
        return _jsx(Typography, { variant: "h6", color: "error", align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0637\u0628\u064A\u0628" });
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), onClick: () => navigate(-1), children: "\u0639\u0648\u062F\u0629" }), _jsxs(Typography, { variant: "h4", gutterBottom: true, children: ["\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0628\u064A\u0628: ", doctor.name] }), _jsx(Box, { component: Paper, sx: { p: 3, mt: 2 }, children: _jsxs(Stack, { spacing: 2, children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", value: form.name || '', onChange: (e) => handleChange('name', e.target.value), fullWidth: true, disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u062A\u062E\u0635\u0635", value: form.specialty || '', onChange: (e) => handleChange('specialty', e.target.value), fullWidth: true, disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", value: form.services || '', onChange: (e) => handleChange('services', e.target.value), fullWidth: true, multiline: true, rows: 4, disabled: !editMode }), editMode ? (_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0641\u0631\u0639" }), _jsx(Select, { value: form.branch_id || '', onChange: (e) => handleChange('branch_id', e.target.value), label: "\u0627\u0644\u0641\u0631\u0639", children: branchOptions.map((branch) => (_jsx(MenuItem, { value: branch.id, children: branch.name }, branch.id))) })] })) : (_jsx(TextField, { label: "\u0627\u0644\u0641\u0631\u0639", value: doctor.branch?.name || 'غير محدد', fullWidth: true, disabled: true })), editMode ? (_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { value: form.department_id || '', onChange: (e) => handleChange('department_id', e.target.value), label: "\u0627\u0644\u0642\u0633\u0645", children: departmentOptions.map((dep) => (_jsx(MenuItem, { value: dep.id, children: dep.name }, dep.id))) })] })) : (_jsx(TextField, { label: "\u0627\u0644\u0642\u0633\u0645", value: doctor.department?.name || 'غير محدد', fullWidth: true, disabled: true })), _jsx(TextField, { label: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", type: "number", value: form.priority ?? 0, onChange: (e) => handleChange('priority', parseInt(e.target.value)), fullWidth: true, disabled: !editMode }), _jsxs(FormControl, { fullWidth: true, disabled: !editMode, children: [_jsx(InputLabel, { children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsxs(Select, { value: String(form.is_active ?? true), onChange: (e) => handleChange('is_active', e.target.value === 'true'), label: "\u0627\u0644\u062D\u0627\u0644\u0629", children: [_jsx(MenuItem, { value: "true", children: "\u0646\u0634\u0637" }), _jsx(MenuItem, { value: "false", children: "\u063A\u064A\u0631 \u0646\u0634\u0637" })] })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628:" }), imagePreview ? (_jsx("img", { src: imagePreview, alt: "New preview", style: { maxWidth: 200, borderRadius: 8, marginTop: 8 } })) : doctor.image ? (_jsx("img", { src: `https://www.ss.mastersclinics.com${doctor.image}`, alt: "Current doctor", style: { maxWidth: 200, borderRadius: 8, marginTop: 8 } })) : (_jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u0645\u062A\u0627\u062D\u0629" })), editMode && (_jsxs(Box, { mt: 2, children: [_jsxs(Button, { component: "label", startIcon: _jsx(ImageIcon, {}), variant: "outlined", children: [doctor.image ? 'تغيير الصورة' : 'تحميل صورة', _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }), imageFile && _jsxs(Typography, { variant: "caption", sx: { display: 'block', mt: 1 }, children: ["\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u062D\u062F\u062F: ", imageFile.name] })] }))] }), _jsx(TextField, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621", value: doctor.created_at, fullWidth: true, disabled: true }), _jsx(TextField, { label: "\u0622\u062E\u0631 \u062A\u0639\u062F\u064A\u0644", value: doctor.updated_at, fullWidth: true, disabled: true })] }) }), editMode ? (_jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 3 }, children: [_jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(Save, {}), onClick: handleSave, children: "\u062D\u0641\u0638" }), _jsx(Button, { variant: "outlined", color: "secondary", startIcon: _jsx(Cancel, {}), onClick: () => {
                            setEditMode(false);
                            setImageFile(null);
                            setImagePreview(null);
                            setForm({
                                ...doctor,
                                branch_id: doctor.branch?.id,
                                department_id: doctor.department?.id
                            });
                        }, children: "\u0625\u0644\u063A\u0627\u0621" })] })) : (_jsx(Button, { sx: { mt: 2 }, variant: "outlined", onClick: () => setEditMode(true), children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A" })), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 4000, onClose: () => setSnackbar({ ...snackbar, open: false }), children: _jsx(Alert, { severity: snackbar.severity, onClose: () => setSnackbar({ ...snackbar, open: false }), children: snackbar.message }) })] }));
};
export default DoctorSingle;
