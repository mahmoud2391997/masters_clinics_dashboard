import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, IconButton, Paper, CircularProgress, Checkbox, FormControlLabel, Stack, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const getDayName = (day) => {
    const daysMap = {
        sunday: 'الأحد',
        monday: 'الإثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت'
    };
    return daysMap[day] || day;
};
const formatDaysRange = (days) => {
    if (days.length === 7)
        return 'كل الأيام';
    if (days.length === 5 &&
        days.includes('sunday') &&
        days.includes('monday') &&
        days.includes('tuesday') &&
        days.includes('wednesday') &&
        days.includes('thursday')) {
        return 'أيام العمل (الأحد - الخميس)';
    }
    return days.map(getDayName).join('، ');
};
const formatTime = (time) => {
    if (!time)
        return '';
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours);
    return `${hourNum > 12 ? hourNum - 12 : hourNum}:${minutes} ${hourNum >= 12 ? 'م' : 'ص'}`;
};
async function fetchDoctor(id, allBranches) {
    const response = await fetch(`http://localhost:3000/doctors/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
    });
    if (!response.ok)
        throw new Error('Failed to fetch doctor');
    const data = await response.json();
    // Convert branch names to IDs
    const branchNames = Array.isArray(data.branches) ? data.branches :
        typeof data.branches === 'string' ? JSON.parse(data.branches) : [];
    const branchIds = branchNames.map((name) => {
        const branch = allBranches.find(b => b.name === name);
        return branch ? branch.id : null;
    }).filter((id) => id !== null);
    return {
        ...data,
        working_hours_slots: data.working_hours_slots || [],
        branches: branchIds,
        branch_names: branchNames,
        department_id: data.department_id || data.department?.id || 0,
    };
}
async function fetchDepartments() {
    const response = await fetch('http://localhost:3000/departments', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
    });
    if (!response.ok)
        throw new Error('Failed to fetch departments');
    return response.json();
}
async function fetchBranches() {
    const response = await fetch('http://localhost:3000/branches', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
    });
    if (!response.ok)
        throw new Error('Failed to fetch branches');
    const data = await response.json();
    return data;
}
async function updateDoctor(id, data, branches, imageFile) {
    const token = sessionStorage.getItem('token');
    // Convert branch IDs to names for API
    const formData = new FormData();
    formData.append('name', data.name || '');
    formData.append('specialty', data.specialty || '');
    formData.append('bio', data.bio || '');
    formData.append('department_id', String(data.department_id || ''));
    if (data.working_hours_slots) {
        formData.append('working_hours_slots', JSON.stringify(data.working_hours_slots));
    }
    formData.append('branches', JSON.stringify(branches));
    if (imageFile) {
        formData.append('image', imageFile);
    }
    else if (data.image && typeof data.image === 'string') {
        formData.append('image', data.image);
    }
    const response = await fetch(`http://localhost:3000/doctors/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update doctor');
    }
    return response.json();
}
const DoctorSingle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [form, setForm] = useState({
        name: '',
        specialty: '',
        bio: '',
        image: null,
        working_hours_slots: [],
        department_id: 0,
        branches: [],
    });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [departmentsData, branchesData] = await Promise.all([
                    fetchDepartments(),
                    fetchBranches()
                ]);
                setDepartments(departmentsData);
                setBranches(branchesData);
                if (id) {
                    const doctorData = await fetchDoctor(id, branchesData);
                    setDoctor(doctorData);
                    setForm({
                        ...doctorData,
                        branches: doctorData.branches || []
                    });
                }
            }
            catch (error) {
                console.error('Error fetching data:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleDepartmentChange = (e) => {
        const department_id = e.target.value;
        setForm(prev => ({ ...prev, department_id }));
    };
    const handleBranchChange = (e) => {
        const selectedBranchIds = e.target.value;
        setForm(prev => ({ ...prev, branches: selectedBranchIds }));
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleWorkingHoursChange = (index, field, value) => {
        setForm(prev => {
            const working_hours_slots = [...(prev.working_hours_slots || [])];
            working_hours_slots[index] = { ...working_hours_slots[index], [field]: value };
            return { ...prev, working_hours_slots };
        });
    };
    const addWorkingHoursSlot = () => {
        setForm(prev => ({
            ...prev,
            working_hours_slots: [...(prev.working_hours_slots || []), { days: [], openingTime: '', closingTime: '' }],
        }));
    };
    const removeWorkingHoursSlot = (index) => {
        setForm(prev => {
            const working_hours_slots = [...(prev.working_hours_slots || [])];
            working_hours_slots.splice(index, 1);
            return { ...prev, working_hours_slots };
        });
    };
    const handleDayToggle = (index, day) => {
        setForm(prev => {
            const working_hours_slots = [...(prev.working_hours_slots || [])];
            const currentDays = working_hours_slots[index]?.days || [];
            const newDays = currentDays.includes(day)
                ? currentDays.filter(d => d !== day)
                : [...currentDays, day];
            working_hours_slots[index] = { ...working_hours_slots[index], days: newDays };
            return { ...prev, working_hours_slots };
        });
    };
    const handleSave = async () => {
        if (!id)
            return;
        try {
            const imageInput = document.getElementById('upload-image');
            const imageFile = imageInput?.files?.[0];
            console.log(form);
            const updated = await updateDoctor(id, form, form.branches || [], imageFile);
            setDoctor(updated);
            setForm(updated);
            setImagePreview(null);
            setEditMode(false);
            if (imageInput) {
                imageInput.value = '';
            }
        }
        catch (err) {
            console.error(err);
        }
    };
    const handleCancel = () => {
        if (doctor) {
            setForm(doctor);
            setImagePreview(null);
            setEditMode(false);
        }
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    if (!doctor) {
        return (_jsxs(Box, { textAlign: "center", p: 4, children: [_jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0637\u0628\u064A\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" }), _jsx(Button, { variant: "contained", onClick: () => navigate(-1), children: "\u0627\u0644\u0639\u0648\u062F\u0629" })] }));
    }
    return (_jsxs(Box, { sx: { maxWidth: 1000, mx: 'auto', p: 3 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 3, children: [_jsx(IconButton, { onClick: () => navigate(-1), sx: { mr: 2 }, children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h4", children: doctor.name }), _jsx(Box, { flexGrow: 1 }), editMode ? (_jsxs(_Fragment, { children: [_jsx(Button, { color: "success", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { mr: 2 }, children: "\u062D\u0641\u0638" }), _jsx(Button, { color: "error", startIcon: _jsx(Cancel, {}), onClick: handleCancel, children: "\u0625\u0644\u063A\u0627\u0621" })] })) : (_jsx(Button, { startIcon: _jsx(Edit, {}), onClick: () => setEditMode(true), children: "\u062A\u0639\u062F\u064A\u0644" }))] }), _jsxs(Paper, { elevation: 3, sx: { p: 3, mb: 4 }, children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", name: "name", value: editMode ? form.name || '' : doctor.name, onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode, sx: { '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } } }), _jsx(TextField, { label: "\u0627\u0644\u062A\u062E\u0635\u0635", name: "specialty", value: editMode ? form.specialty || '' : doctor.specialty, onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode, sx: { '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } } }), _jsx(TextField, { label: "\u0627\u0644\u0633\u064A\u0631\u0629 \u0627\u0644\u0630\u0627\u062A\u064A\u0629", name: "bio", value: editMode ? form.bio || '' : doctor.bio, onChange: handleChange, fullWidth: true, multiline: true, rows: 4, margin: "normal", placeholder: "\u0623\u062F\u062E\u0644 \u0633\u064A\u0631\u062A\u0643 \u0627\u0644\u0630\u0627\u062A\u064A\u0629 \u0647\u0646\u0627", disabled: !editMode, InputLabelProps: { shrink: true }, sx: {
                            '& label': { right: 0, left: 'auto' },
                            '& textarea': { textAlign: 'right' },
                        } }), _jsxs(FormControl, { fullWidth: true, margin: "normal", sx: { textAlign: 'right' }, children: [_jsx(InputLabel, { id: "department-label", sx: { right: 0, left: 'auto' }, children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { labelId: "department-label", id: "department", value: editMode ? form.department_id || 0 : doctor.department_id || 0, onChange: handleDepartmentChange, label: "\u0627\u0644\u0642\u0633\u0645", disabled: !editMode, sx: { textAlign: 'right' }, children: departments.map((department) => (_jsx(MenuItem, { value: department.id, sx: { justifyContent: 'flex-end' }, children: department.name }, department.id))) })] }), _jsxs(FormControl, { fullWidth: true, margin: "normal", sx: { textAlign: 'right' }, children: [_jsx(InputLabel, { id: "branches-label", sx: { right: 0, left: 'auto' }, children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(Select, { labelId: "branches-label", id: "branches", multiple: true, value: editMode ? form.branches || [] : doctor.branches || [], onChange: handleBranchChange, label: "\u0627\u0644\u0641\u0631\u0648\u0639", disabled: !editMode, sx: { textAlign: 'right' }, renderValue: (selected) => (_jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }, children: selected.map((branchId) => {
                                        const branch = branches.find(b => b.id === branchId);
                                        return branch ? (_jsx(Chip, { label: branch.name, sx: { direction: 'rtl' } }, branch.id)) : null;
                                    }) })), children: branches.map((branch) => (_jsx(MenuItem, { value: branch.id, sx: { justifyContent: 'flex-end' }, children: branch.name }, branch.id))) })] }), _jsxs(Box, { borderTop: "1px solid", borderColor: "divider", pt: 3, mt: 3, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h6", sx: { textAlign: 'right' }, children: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644" }), editMode && (_jsx(Button, { startIcon: _jsx(Add, {}), onClick: addWorkingHoursSlot, sx: { bgcolor: 'indigo.100', color: 'indigo.700', '&:hover': { bgcolor: 'indigo.200' } }, children: "\u0625\u0636\u0627\u0641\u0629 \u0648\u0642\u062A" }))] }), _jsx(Stack, { spacing: 2, children: (editMode ? form.working_hours_slots || [] : doctor.working_hours_slots || []).map((slot, index) => (_jsxs(Paper, { elevation: 2, sx: { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }, children: [_jsxs(Box, { display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 3, children: [_jsxs(Box, { flex: 1, children: [_jsx(Typography, { variant: "subtitle2", sx: { textAlign: 'right', mb: 1 }, children: "\u0627\u0644\u0623\u064A\u0627\u0645" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }, children: daysOfWeek.map(day => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: slot.days?.includes(day) || false, onChange: () => handleDayToggle(index, day), disabled: !editMode }), label: getDayName(day), labelPlacement: "start", sx: { mr: 0, ml: 1 } }, day))) })] }), _jsx(Box, { flex: 1, children: _jsxs(Box, { display: "flex", gap: 2, children: [_jsx(Box, { flex: 1, children: _jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0641\u062A\u062D", type: "time", value: slot.openingTime || '', onChange: (e) => handleWorkingHoursChange(index, 'openingTime', e.target.value), disabled: !editMode, fullWidth: true, InputLabelProps: { shrink: true }, sx: { '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } } }) }), _jsx(Box, { flex: 1, children: _jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0625\u063A\u0644\u0627\u0642", type: "time", value: slot.closingTime || '', onChange: (e) => handleWorkingHoursChange(index, 'closingTime', e.target.value), disabled: !editMode, fullWidth: true, InputLabelProps: { shrink: true }, sx: { '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } } }) })] }) })] }), editMode && (_jsx(Box, { display: "flex", justifyContent: "flex-end", mt: 1, children: _jsx(IconButton, { onClick: () => removeWorkingHoursSlot(index), color: "error", size: "small", children: _jsx(Delete, { fontSize: "small" }) }) })), slot.days?.length > 0 && slot.openingTime && slot.closingTime && (_jsxs(Typography, { variant: "body2", sx: { textAlign: 'right', mt: 1, color: 'text.secondary' }, children: [formatDaysRange(slot.days), ": ", formatTime(slot.openingTime), " - ", formatTime(slot.closingTime)] }))] }, index))) })] })] }), _jsxs(Paper, { elevation: 3, sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, sx: { textAlign: 'right' }, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628" }), editMode ? (_jsxs(_Fragment, { children: [_jsx("input", { type: "file", accept: "image/*", id: "upload-image", hidden: true, onChange: handleImageChange }), _jsx("label", { htmlFor: "upload-image", children: _jsx(Button, { variant: "contained", component: "span", sx: { mb: 2 }, children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" }) }), (imagePreview || doctor.image) && (_jsx("img", { src: imagePreview || doctor.image || undefined, alt: doctor.name, style: { maxWidth: '100%', borderRadius: 8 } }))] })) : doctor.image ? (_jsx("img", { src: doctor.image, alt: doctor.name, style: { maxWidth: '100%', borderRadius: 8 } })) : (_jsx(Typography, { children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0635\u0648\u0631\u0629 \u0645\u062A\u0627\u062D\u0629" }))] })] }));
};
export default DoctorSingle;
