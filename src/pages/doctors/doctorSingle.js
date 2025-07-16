import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Paper, CircularProgress, Snackbar, Alert, Switch, MenuItem, Stack, FormControl, InputLabel, Select, Chip } from '@mui/material';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
const parseArrayField = (field) => {
    if (Array.isArray(field))
        return field;
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed))
                return parsed;
            return [field];
        }
        catch {
            return [field];
        }
    }
    return [];
};
const DoctorSingle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [branchOptions, setBranchOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const getAuthToken = () => sessionStorage.getItem('token') || '';
    const fetchWithAuth = async (url, options = {}) => {
        const token = getAuthToken();
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        return fetch(url, { ...options, headers });
    };
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`);
                if (!res.ok)
                    throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                const parsedDoctor = {
                    ...data,
                    education: parseArrayField(data.education),
                    skills: parseArrayField(data.skills),
                    achievements: parseArrayField(data.achievements),
                    working_hours: data.working_hours || [],
                    branches_ids: Array.isArray(data.branches_ids) ? data.branches_ids :
                        (data.branches_ids ? JSON.parse(data.branches_ids) : []),
                    department_id: data.department_id || 0,
                    image: data.image || null,
                };
                console.log(parsedDoctor);
                setDoctor(parsedDoctor);
                setForm(parsedDoctor);
            }
            catch (error) {
                console.error('Error fetching doctor:', error);
                setSnackbar({ open: true, message: 'حدث خطأ أثناء جلب بيانات الطبيب', severity: 'error' });
            }
            finally {
                setLoading(false);
            }
        };
        const fetchBranchesAndDepartments = async () => {
            try {
                setOptionsLoading(true);
                const [branchesRes, departmentsRes] = await Promise.all([
                    fetchWithAuth('https://www.ss.mastersclinics.com/branches'),
                    fetchWithAuth('https://www.ss.mastersclinics.com/departments')
                ]);
                if (!branchesRes.ok || !departmentsRes.ok)
                    throw new Error('Failed to fetch options');
                const branches = await branchesRes.json();
                const departments = await departmentsRes.json();
                setBranchOptions(Array.isArray(branches) ? branches : []);
                setDepartmentOptions(Array.isArray(departments) ? departments : []);
            }
            catch (error) {
                console.error('Error fetching options:', error);
                setSnackbar({ open: true, message: 'حدث خطأ أثناء جلب بيانات الفروع والأقسام', severity: 'error' });
            }
            finally {
                setOptionsLoading(false);
            }
        };
        if (id) {
            fetchDoctor();
            fetchBranchesAndDepartments();
        }
    }, [id]);
    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };
    const handleArrayChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value.split(',').map(item => item.trim()),
        }));
    };
    const handleSave = async () => {
        try {
            // Ensure branches_ids is always an array
            const formData = {
                ...form,
                branches_ids: Array.isArray(form.branches_ids) ? form.branches_ids : [],
                education: form.education || [],
                skills: form.skills || [],
                achievements: form.achievements || [],
                working_hours: form.working_hours || []
            };
            const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`, {
                method: 'PUT',
                body: JSON.stringify(formData),
            });
            if (!res.ok)
                throw new Error(`HTTP error! status: ${res.status}`);
            setDoctor(form);
            setEditMode(false);
            setSnackbar({ open: true, message: 'تم تحديث بيانات الطبيب بنجاح', severity: 'success' });
        }
        catch (error) {
            console.error('Error updating doctor:', error);
            setSnackbar({ open: true, message: 'حدث خطأ أثناء تحديث بيانات الطبيب', severity: 'error' });
        }
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", children: _jsx(CircularProgress, {}) }));
    }
    if (!doctor) {
        return (_jsx(Typography, { variant: "h6", color: "error", align: "center", children: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0644\u0647\u0630\u0627 \u0627\u0644\u0637\u0628\u064A\u0628" }));
    }
    return (_jsxs(Box, { sx: { p: 2 }, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), onClick: () => navigate(-1), children: "\u0639\u0648\u062F\u0629" }), _jsxs(Typography, { variant: "h4", gutterBottom: true, children: ["\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0637\u0628\u064A\u0628: ", doctor.name] }), _jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", children: [_jsx(Switch, { checked: editMode, onChange: () => setEditMode(!editMode) }), _jsx(Typography, { children: "\u0648\u0636\u0639 \u0627\u0644\u062A\u0639\u062F\u064A\u0644" })] }), _jsxs(Box, { component: Paper, sx: { p: 2, mt: 2 }, children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", value: form.name || '', onChange: (e) => handleChange('name', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0627\u0644\u0644\u0642\u0628", value: form.title || '', onChange: (e) => handleChange('title', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0627\u0644\u0648\u0635\u0641", value: form.description || '', onChange: (e) => handleChange('description', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal", multiline: true, rows: 3 }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0646\u0635\u0628", value: form.position || '', onChange: (e) => handleChange('position', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0645\u062C\u0627\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629", value: form.practice_area || '', onChange: (e) => handleChange('practice_area', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0627\u0644\u062E\u0628\u0631\u0629", value: form.experience || '', onChange: (e) => handleChange('experience', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: form.address || '', onChange: (e) => handleChange('address', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal", multiline: true, rows: 2 }), _jsx(TextField, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", value: form.phone || '', onChange: (e) => handleChange('phone', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", value: form.email || '', onChange: (e) => handleChange('email', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal" }), _jsx(TextField, { label: "\u0627\u0644\u062A\u062C\u0631\u0628\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629", value: form.personal_experience || '', onChange: (e) => handleChange('personal_experience', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal", multiline: true, rows: 4 }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0624\u0647\u0644\u0627\u062A (\u062A\u0639\u0644\u064A\u0645)", value: form.education?.join(', ') || '', onChange: (e) => handleArrayChange('education', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal", helperText: "\u0627\u0641\u0635\u0644 \u0628\u064A\u0646 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0628\u0641\u0627\u0635\u0644\u0629" }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A", value: form.skills?.join(', ') || '', onChange: (e) => handleArrayChange('skills', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal", helperText: "\u0627\u0641\u0635\u0644 \u0628\u064A\u0646 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0628\u0641\u0627\u0635\u0644\u0629" }), _jsx(TextField, { label: "\u0627\u0644\u0625\u0646\u062C\u0627\u0632\u0627\u062A", value: form.achievements?.join(', ') || '', onChange: (e) => handleArrayChange('achievements', e.target.value), fullWidth: true, disabled: !editMode, margin: "normal", helperText: "\u0627\u0641\u0635\u0644 \u0628\u064A\u0646 \u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0628\u0641\u0627\u0635\u0644\u0629" }), _jsxs(FormControl, { fullWidth: true, margin: "normal", disabled: !editMode || optionsLoading, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(Select, { multiple: true, value: form.branches_ids || [], onChange: (e) => handleChange('branches_ids', e.target.value), renderValue: (selected) => (_jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: selected.map((value) => (_jsx(Chip, { label: branchOptions.find(b => b.id === value)?.name || value }, value))) })), children: branchOptions.map((branch) => (_jsx(MenuItem, { value: branch.id, children: branch.name }, branch.id))) })] }), _jsxs(FormControl, { fullWidth: true, margin: "normal", disabled: !editMode || optionsLoading, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { value: form.department_id || '', onChange: (e) => handleChange('department_id', e.target.value), children: departmentOptions.map((dep) => (_jsx(MenuItem, { value: dep.id, children: dep.name }, dep.id))) })] }), _jsx(TextField, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621", value: form.created_at || '', fullWidth: true, disabled: true, margin: "normal" }), _jsx(TextField, { label: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u062D\u062F\u064A\u062B", value: form.updated_at || '', fullWidth: true, disabled: true, margin: "normal" })] }), editMode && (_jsxs(Stack, { direction: "row", spacing: 2, sx: { mt: 2 }, children: [_jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(Save, {}), onClick: handleSave, children: "\u062D\u0641\u0638" }), _jsx(Button, { variant: "outlined", color: "secondary", startIcon: _jsx(Cancel, {}), onClick: () => setEditMode(false), children: "\u0625\u0644\u063A\u0627\u0621" })] })), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 4000, onClose: () => setSnackbar({ ...snackbar, open: false }), children: _jsx(Alert, { severity: snackbar.severity, onClose: () => setSnackbar({ ...snackbar, open: false }), children: snackbar.message }) })] }));
};
export default DoctorSingle;
