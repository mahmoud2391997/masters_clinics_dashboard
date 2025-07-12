import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, IconButton, Paper, CircularProgress, FormControlLabel, Checkbox, Stack, Snackbar, Alert, Switch, MenuItem } from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const getDayName = (day) => {
    const dayNames = {
        sunday: 'الأحد',
        monday: 'الإثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت',
    };
    return dayNames[day] || day;
};
const DoctorSingle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [form, setForm] = useState({});
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [useFileUpload, setUseFileUpload] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [branchOptions, setBranchOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [optionsLoading, setOptionsLoading] = useState(false);
    const getAuthToken = () => {
        return sessionStorage.getItem('token') || '';
    };
    const fetchWithAuth = async (url, options = {}) => {
        const token = getAuthToken();
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
        };
        return fetch(url, { ...options, headers });
    };
    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                setLoading(true);
                const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                const parsedDoctor = {
                    ...data,
                    education: data.education || [],
                    skills: data.skills || [],
                    achievements: data.achievements || [],
                    working_hours: data.working_hours || [],
                    branches_ids: Array.isArray(data.branches_ids) ? data.branches_ids :
                        (data.branches_ids ? JSON.parse(data.branches_ids) : []),
                    department_id: data.department_id || 0,
                    image: data.image || null
                };
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
                if (!branchesRes.ok || !departmentsRes.ok) {
                    throw new Error('Failed to fetch options');
                }
                const branches = await branchesRes.json();
                const departments = await departmentsRes.json();
                setBranchOptions(Array.isArray(branches) ? branches : []);
                setDepartmentOptions(Array.isArray(departments) ? departments : []);
            }
            catch (error) {
                console.error('Error fetching options:', error);
                setSnackbar({ open: true, message: 'حدث خطأ أثناء جلب بيانات الفروع والأقسام', severity: 'error' });
                setBranchOptions([]);
                setDepartmentOptions([]);
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
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleListChange = (name, value) => {
        setForm((prev) => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    };
    const addWorkingHoursSlot = () => {
        setForm((prev) => ({
            ...prev,
            working_hours: [
                ...(prev.working_hours || []),
                { days: [], openingTime: '', closingTime: '' },
            ],
        }));
    };
    const removeWorkingHoursSlot = (index) => {
        setForm((prev) => {
            const updated = [...(prev.working_hours || [])];
            updated.splice(index, 1);
            return { ...prev, working_hours: updated };
        });
    };
    const handleDayToggle = (slotIndex, day) => {
        setForm((prev) => {
            const slots = [...(prev.working_hours || [])];
            const currentDays = slots[slotIndex].days;
            if (currentDays.includes(day)) {
                slots[slotIndex].days = currentDays.filter((d) => d !== day);
            }
            else {
                slots[slotIndex].days = [...currentDays, day];
            }
            return { ...prev, working_hours: slots };
        });
    };
    const handleWorkingHoursChange = (slotIndex, field, value) => {
        setForm((prev) => {
            const slots = [...(prev.working_hours || [])];
            slots[slotIndex] = { ...slots[slotIndex], [field]: value };
            return { ...prev, working_hours: slots };
        });
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };
    const handleSave = async () => {
        try {
            if (!id || !doctor)
                return;
            const formData = new FormData();
            formData.append('name', form.name || '');
            formData.append('title', form.title || '');
            formData.append('description', form.description || '');
            formData.append('position', form.position || '');
            formData.append('practice_area', form.practice_area || '');
            formData.append('experience', form.experience || '');
            formData.append('address', form.address || '');
            formData.append('phone', form.phone || '');
            formData.append('email', form.email || '');
            formData.append('personal_experience', form.personal_experience || '');
            formData.append('education', JSON.stringify(form.education || []));
            formData.append('skills', JSON.stringify(form.skills || []));
            formData.append('achievements', JSON.stringify(form.achievements || []));
            formData.append('working_hours', JSON.stringify(form.working_hours || []));
            formData.append('branches_ids', JSON.stringify(form.branches_ids || []));
            formData.append('department_id', form.department_id?.toString() || '');
            if (useFileUpload && imageFile) {
                formData.append('image', imageFile);
            }
            else if (!useFileUpload && form.image) {
                formData.append('imageUrl', form.image);
            }
            const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`, {
                method: 'PUT',
                body: formData,
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save doctor');
            }
            const updated = await res.json();
            setDoctor(updated);
            setForm(updated);
            setEditMode(false);
            setImagePreview(null);
            setImageFile(null);
            setSnackbar({ open: true, message: 'تم الحفظ بنجاح', severity: 'success' });
        }
        catch (error) {
            console.error('Error saving doctor:', error);
            setSnackbar({ open: true, message: error.message || 'حدث خطأ أثناء الحفظ', severity: 'error' });
        }
    };
    const handleCancel = () => {
        if (doctor) {
            setForm(doctor);
            setImagePreview(null);
            setImageFile(null);
            setEditMode(false);
        }
    };
    const handleDelete = async () => {
        if (!id)
            return;
        if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الطبيب؟'))
            return;
        try {
            const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                throw new Error('Failed to delete doctor');
            }
            setSnackbar({ open: true, message: 'تم حذف الطبيب بنجاح', severity: 'success' });
            navigate('/doctors');
        }
        catch (error) {
            console.error('Error deleting doctor:', error);
            setSnackbar({ open: true, message: 'حدث خطأ أثناء الحذف', severity: 'error' });
        }
    };
    const getBranchName = (id) => {
        const branch = branchOptions.find(b => b.id === id);
        return branch ? branch.name : id.toString();
    };
    const getDepartmentName = (id) => {
        if (!Array.isArray(departmentOptions))
            return id.toString();
        const dept = departmentOptions.find(d => d.id === id);
        return dept ? dept.name : id.toString();
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    if (!doctor) {
        return (_jsxs(Box, { textAlign: "center", p: 4, children: [_jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0637\u0628\u064A\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" }), _jsx(Button, { variant: "contained", onClick: () => navigate(-1), children: "\u0627\u0644\u0639\u0648\u062F\u0629" })] }));
    }
    return (_jsxs(Box, { sx: { maxWidth: 1000, mx: 'auto', p: 3 }, dir: "rtl", children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 3, children: [_jsx(IconButton, { onClick: () => navigate(-1), sx: { ml: 2 }, children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h4", children: doctor.name }), _jsx(Box, { flexGrow: 1 }), editMode ? (_jsxs(_Fragment, { children: [_jsx(Button, { color: "success", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { ml: 2 }, children: "\u062D\u0641\u0638" }), _jsx(Button, { color: "error", startIcon: _jsx(Cancel, {}), onClick: handleCancel, children: "\u0625\u0644\u063A\u0627\u0621" })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { startIcon: _jsx(Edit, {}), onClick: () => setEditMode(true), sx: { ml: 2 }, children: "\u062A\u0639\u062F\u064A\u0644" }), _jsx(Button, { color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, children: "\u062D\u0630\u0641" })] }))] }), _jsxs(Paper, { elevation: 3, sx: { p: 3 }, children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", name: "name", value: editMode ? form.name || '' : doctor.name || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0644\u0642\u0628", name: "title", value: editMode ? form.title || '' : doctor.title || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0648\u0635\u0641", name: "description", value: editMode ? form.description || '' : doctor.description || '', onChange: handleChange, fullWidth: true, multiline: true, rows: 3, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0646\u0635\u0628", name: "position", value: editMode ? form.position || '' : doctor.position || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0645\u062C\u0627\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0629", name: "practice_area", value: editMode ? form.practice_area || '' : doctor.practice_area || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u062E\u0628\u0631\u0629", name: "experience", value: editMode ? form.experience || '' : doctor.experience || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", name: "address", value: editMode ? form.address || '' : doctor.address || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", name: "phone", value: editMode ? form.phone || '' : doctor.phone || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", name: "email", value: editMode ? form.email || '' : doctor.email || '', onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629", name: "personal_experience", value: editMode ? form.personal_experience || '' : doctor.personal_experience || '', onChange: handleChange, fullWidth: true, multiline: true, rows: 3, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u062A\u0639\u0644\u064A\u0645 (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0648\u0627\u0635\u0644)", value: editMode ? form.education?.join(', ') || '' : doctor.education?.join(', ') || '', onChange: (e) => handleListChange('education', e.target.value), fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0648\u0627\u0635\u0644)", value: editMode ? form.skills?.join(', ') || '' : doctor.skills?.join(', ') || '', onChange: (e) => handleListChange('skills', e.target.value), fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "\u0627\u0644\u0625\u0646\u062C\u0627\u0632\u0627\u062A (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0648\u0627\u0635\u0644)", value: editMode ? form.achievements?.join(', ') || '' : doctor.achievements?.join(', ') || '', onChange: (e) => handleListChange('achievements', e.target.value), fullWidth: true, margin: "normal", disabled: !editMode }), _jsxs(Box, { mt: 3, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), editMode ? (optionsLoading ? (_jsx(CircularProgress, { size: 24 })) : (_jsx(TextField, { select: true, SelectProps: {
                                    multiple: true,
                                    value: form.branches_ids || [],
                                    onChange: (e) => {
                                        const value = e.target.value;
                                        setForm(prev => ({ ...prev, branches_ids: value }));
                                    },
                                    renderValue: (selected) => {
                                        const selectedBranches = selected;
                                        return selectedBranches.map(id => getBranchName(id)).join(', ');
                                    },
                                }, fullWidth: true, children: branchOptions.map((branch) => (_jsxs(MenuItem, { value: branch.id, children: [_jsx(Checkbox, { checked: form.branches_ids?.includes(branch.id) || false }), branch.name] }, branch.id))) }))) : (_jsx(Typography, { children: doctor.branches_ids?.map(id => getBranchName(id)).join(', ') || 'لا يوجد فروع' }))] }), _jsxs(Box, { mt: 2, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0642\u0633\u0645" }), editMode ? (optionsLoading ? (_jsx(CircularProgress, { size: 24 })) : (_jsx(TextField, { select: true, value: form.department_id || '', onChange: (e) => setForm(prev => ({
                                    ...prev,
                                    department_id: parseInt(e.target.value)
                                })), fullWidth: true, children: departmentOptions.map((dept) => (_jsx(MenuItem, { value: dept.id, children: dept.name }, dept.id))) }))) : (_jsx(Typography, { children: getDepartmentName(doctor.department_id) }))] }), _jsxs(Box, { mt: 3, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644" }), (editMode ? form.working_hours || [] : doctor.working_hours || []).map((slot, index) => (_jsxs(Paper, { sx: { p: 2, mb: 2 }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 2, children: [_jsxs(Typography, { children: ["\u0627\u0644\u0641\u062A\u0631\u0629 ", index + 1] }), editMode && (_jsx(IconButton, { onClick: () => removeWorkingHoursSlot(index), color: "error", children: _jsx(Delete, {}) }))] }), _jsxs(Box, { mb: 2, children: [_jsx(Typography, { children: "\u0627\u0644\u0623\u064A\u0627\u0645" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1 }, children: daysOfWeek.map((day) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: slot.days.includes(day), onChange: () => handleDayToggle(index, day), disabled: !editMode }), label: getDayName(day) }, day))) })] }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0628\u062F\u0621", type: "time", value: slot.openingTime, onChange: (e) => handleWorkingHoursChange(index, 'openingTime', e.target.value), fullWidth: true, disabled: !editMode, InputLabelProps: { shrink: true } }), _jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621", type: "time", value: slot.closingTime, onChange: (e) => handleWorkingHoursChange(index, 'closingTime', e.target.value), fullWidth: true, disabled: !editMode, InputLabelProps: { shrink: true } })] })] }, index))), editMode && (_jsx(Button, { startIcon: _jsx(Add, {}), onClick: addWorkingHoursSlot, children: "\u0625\u0636\u0627\u0641\u0629 \u0641\u062A\u0631\u0629 \u0639\u0645\u0644" }))] }), _jsxs(Box, { mt: 3, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628" }), editMode ? (_jsxs(_Fragment, { children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, children: [_jsx(Typography, { children: "\u0637\u0631\u064A\u0642\u0629 \u0627\u0644\u062A\u062D\u0645\u064A\u0644:" }), _jsx(Switch, { checked: useFileUpload, onChange: () => setUseFileUpload(!useFileUpload) }), _jsx(Typography, { children: useFileUpload ? 'رفع ملف' : 'رابط' })] }), useFileUpload ? (_jsxs(Stack, { direction: "row", spacing: 2, alignItems: "center", sx: { mb: 2 }, children: [_jsxs(Button, { variant: "outlined", component: "label", children: ["\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }), imageFile && _jsx(Typography, { children: imageFile.name })] })) : (_jsx(TextField, { fullWidth: true, label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", value: form.image || '', onChange: (e) => setForm(prev => ({ ...prev, image: e.target.value })), sx: { mt: 1 } })), (imagePreview || form.image) && (_jsx("img", { src: imagePreview || form.image || '', alt: "Preview", style: { maxWidth: '100%', maxHeight: 300, borderRadius: 8, marginTop: 16 } }))] })) : doctor.image ? (_jsx("img", { src: doctor.image, alt: doctor.name, style: { maxWidth: '100%', maxHeight: 300, borderRadius: 8 } })) : (_jsx(Typography, { children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u0645\u062A\u0627\u062D\u0629" }))] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 3000, onClose: () => setSnackbar((prev) => ({ ...prev, open: false })), children: _jsx(Alert, { severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
export default DoctorSingle;
