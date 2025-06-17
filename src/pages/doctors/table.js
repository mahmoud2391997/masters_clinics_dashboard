import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, Paper, Box, FormControl, InputLabel, Select, MenuItem, TableBody, TextField, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Checkbox, FormControlLabel, IconButton, Avatar, } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const defaultFormFields = [
    { name: 'name', label: 'اسم الطبيب' },
    { name: 'specialty', label: 'التخصص' },
    { name: 'department', label: 'القسم' },
    { name: 'branch', label: 'الفرع' },
];
const DataTableHeaders = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        specialty: '',
        department: '',
        branches: [],
        working_hours_slots: [],
    });
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Fetch doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/doctors', {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
                const data = response.data;
                console.log('Fetched Doctors:', data);
                setDoctors(data);
                // Extract unique branches and departments
                const allBranches = data.flatMap(doctor => doctor.branches);
                const uniqueBranches = Array.from(new Set(allBranches));
                const uniqueDepartments = Array.from(new Set(data.map(d => d.department)));
                setBranches(['الكل', ...uniqueBranches]);
                setDepartments(['الكل', ...uniqueDepartments]);
                setFilteredDoctors(data);
            }
            catch (err) {
                setError('فشل تحميل بيانات الأطباء');
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);
    // Apply filters and search
    useEffect(() => {
        let filtered = [...doctors];
        // Branch filter
        if (selectedBranch && selectedBranch !== 'الكل') {
            filtered = filtered.filter(d => d.branches.includes(selectedBranch));
        }
        // Department filter
        if (selectedDepartment && selectedDepartment !== 'الكل') {
            filtered = filtered.filter(d => d.department === selectedDepartment);
        }
        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(d => d.name.toLowerCase().includes(query) ||
                d.specialty.toLowerCase().includes(query));
        }
        setFilteredDoctors(filtered);
    }, [selectedBranch, selectedDepartment, searchQuery, doctors]);
    const handleAddDoctor = () => {
        setOpenAddDialog(true);
    };
    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewDoctor({
            name: '',
            specialty: '',
            department: '',
            branches: [],
            working_hours_slots: [],
        });
        setImageFile(null);
        setImageUrl('');
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDoctor(prev => ({ ...prev, [name]: value }));
    };
    const handleBranchChange = (e) => {
        const { value } = e.target;
        setNewDoctor(prev => ({ ...prev, branches: [value] }));
    };
    const handleDepartmentChange = (e) => {
        const { value } = e.target;
        setNewDoctor(prev => ({ ...prev, department: value }));
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
            setImageUrl('');
        }
    };
    const handleImageUrlChange = (e) => {
        setImageUrl(e.target.value);
        setImageFile(null);
    };
    const addWorkingHoursSlot = () => {
        setNewDoctor(prev => ({
            ...prev,
            working_hours_slots: [
                ...(prev.working_hours_slots || []),
                { days: [], openingTime: '', closingTime: '' }
            ]
        }));
    };
    const removeWorkingHoursSlot = (index) => {
        setNewDoctor(prev => {
            const updatedSlots = [...(prev.working_hours_slots || [])];
            updatedSlots.splice(index, 1);
            return { ...prev, working_hours_slots: updatedSlots };
        });
    };
    const handleDayToggle = (slotIndex, day) => {
        setNewDoctor(prev => {
            const updatedSlots = [...(prev.working_hours_slots || [])];
            const currentDays = updatedSlots[slotIndex].days || [];
            if (currentDays.includes(day)) {
                updatedSlots[slotIndex].days = currentDays.filter(d => d !== day);
            }
            else {
                updatedSlots[slotIndex].days = [...currentDays, day];
            }
            return { ...prev, working_hours_slots: updatedSlots };
        });
    };
    const handleWorkingHoursChange = (slotIndex, field, value) => {
        setNewDoctor(prev => {
            const updatedSlots = [...(prev.working_hours_slots || [])];
            updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
            return { ...prev, working_hours_slots: updatedSlots };
        });
    };
    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('name', newDoctor.name || '');
            formData.append('specialty', newDoctor.specialty || '');
            formData.append('bio', newDoctor.bio || '');
            formData.append('department', newDoctor.department || '');
            formData.append('branches', JSON.stringify(newDoctor.branches || []));
            formData.append('working_hours_slots', JSON.stringify(newDoctor.working_hours_slots || []));
            if (imageFile) {
                formData.append('image', imageFile);
            }
            else if (imageUrl) {
                formData.append('imageUrl', imageUrl);
            }
            const response = await axios.post('http://localhost:3000/doctors', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            setDoctors(prev => [...prev, response.data]);
            setFilteredDoctors(prev => [...prev, response.data]);
            handleCloseAddDialog();
        }
        catch (err) {
            setError('فشل في إضافة الطبيب');
            console.error(err);
        }
    };
    const getDayName = (day) => {
        const dayNames = {
            sunday: 'الأحد',
            monday: 'الإثنين',
            tuesday: 'الثلاثاء',
            wednesday: 'الأربعاء',
            thursday: 'الخميس',
            friday: 'الجمعة',
            saturday: 'السبت'
        };
        return dayNames[day] || day;
    };
    const formatTime = (time) => {
        if (!time)
            return '';
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    };
    const formatDaysRange = (days) => {
        if (days.length === 7)
            return 'كل الأيام';
        if (days.length === 5 &&
            !days.includes('friday') &&
            !days.includes('saturday'))
            return 'أيام العمل (الأحد - الخميس)';
        return days.map(getDayName).join('، ');
    };
    return (_jsxs(Box, { dir: "rtl", className: "p-5", children: [_jsx(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }, children: _jsxs(Box, { sx: { display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }, children: [_jsx(Box, { sx: { flex: 1, minWidth: '200px' }, children: _jsx(TextField, { fullWidth: true, label: "\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u062A\u062E\u0635\u0635", variant: "outlined", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }) }), _jsx(Box, { sx: { flex: 1, minWidth: '200px' }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "branch-filter-label", children: "\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0641\u0631\u0639" }), _jsx(Select, { labelId: "branch-filter-label", value: selectedBranch, label: "\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0641\u0631\u0639", onChange: (e) => setSelectedBranch(e.target.value), children: branches.map((branch, index) => (_jsx(MenuItem, { value: branch, children: branch }, index))) })] }) }), _jsx(Box, { sx: { flex: 1, minWidth: '200px' }, children: _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "department-filter-label", children: "\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { labelId: "department-filter-label", value: selectedDepartment, label: "\u062A\u0635\u0641\u064A\u0629 \u062D\u0633\u0628 \u0627\u0644\u0642\u0633\u0645", onChange: (e) => setSelectedDepartment(e.target.value), children: departments.map((dept, index) => (_jsx(MenuItem, { value: dept, children: dept }, index))) })] }) }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(Add, {}), onClick: handleAddDoctor, sx: { height: '56px' }, children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628" })] }) }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [defaultFormFields.map((field) => (_jsx(TableCell, { sx: {
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            backgroundColor: '#f5f5f5',
                                        }, children: field.label || field.name }, field.name))), _jsx(TableCell, { align: "center", sx: {
                                            fontWeight: 'bold',
                                            textAlign: 'center',
                                            backgroundColor: '#f5f5f5',
                                        }, children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, align: "center", children: _jsx(Typography, { children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." }) }) })) : error ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, align: "center", color: "error", children: _jsx(Typography, { color: "error", children: error }) }) })) : filteredDoctors.length > 0 ? (filteredDoctors.map((doctor) => (_jsxs(TableRow, { children: [_jsx(TableCell, { align: "center", children: doctor.name }), _jsx(TableCell, { align: "center", children: doctor.specialty }), _jsx(TableCell, { align: "center", children: doctor.department }), _jsx(TableCell, { align: "center", children: doctor.branches.join(', ') }), _jsx(TableCell, { align: "center", children: _jsx(Link, { to: `/doctors/${doctor.id}`, children: _jsx("button", { className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition", children: "\u0639\u0631\u0636" }) }) })] }, doctor.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 5, align: "center", children: _jsx(Typography, { children: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0637\u0628\u0627\u0621 \u0645\u062A\u0627\u062D\u064A\u0646" }) }) })) })] }) }), _jsxs(Dialog, { open: openAddDialog, onClose: handleCloseAddDialog, fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628 \u062C\u062F\u064A\u062F" }), _jsx(DialogContent, { dividers: true, children: _jsx(Box, { component: "form", sx: { display: 'flex', flexDirection: 'column', gap: 3 }, children: _jsxs(Box, { display: "flex", gap: 3, flexDirection: { xs: 'column', md: 'row' }, children: [_jsxs(Box, { flex: 1, display: "flex", flexDirection: "column", gap: 3, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0628\u064A\u0628", name: "name", value: newDoctor.name, onChange: handleInputChange }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u062A\u062E\u0635\u0635", name: "specialty", value: newDoctor.specialty, onChange: handleInputChange }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0633\u064A\u0631\u0629 \u0627\u0644\u0630\u0627\u062A\u064A\u0629", name: "bio", value: newDoctor.bio, onChange: handleInputChange }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "department-label", children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { labelId: "department-label", label: "\u0627\u0644\u0642\u0633\u0645", value: newDoctor.department, onChange: handleDepartmentChange, children: departments.filter(d => d !== 'الكل').map((dept, index) => (_jsx(MenuItem, { value: dept, children: dept }, index))) })] }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { id: "branch-label", children: "\u0627\u0644\u0641\u0631\u0639" }), _jsx(Select, { labelId: "branch-label", label: "\u0627\u0644\u0641\u0631\u0639", value: newDoctor.branches?.[0] || '', onChange: handleBranchChange, children: branches.filter(b => b !== 'الكل').map((branch, index) => (_jsx(MenuItem, { value: branch, children: branch }, index))) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628" }), _jsxs(Box, { display: "flex", gap: 2, alignItems: "center", children: [_jsxs(Button, { variant: "outlined", component: "label", children: ["\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleFileChange })] }), imageFile && (_jsx(Typography, { variant: "body2", children: imageFile.name }))] }), _jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 1 }, children: "\u0623\u0648" }), _jsx(TextField, { fullWidth: true, label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", value: imageUrl, onChange: handleImageUrlChange, sx: { mt: 1 } }), (imageFile || imageUrl) && (_jsx(Avatar, { src: imageFile ? URL.createObjectURL(imageFile) : imageUrl, sx: { width: 100, height: 100, mt: 2 } }))] })] }), _jsx(Box, { flex: 1, children: _jsxs(Box, { borderTop: "1px solid", borderColor: "divider", pt: 3, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, children: [_jsx(Typography, { variant: "h6", children: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644" }), _jsx(Button, { startIcon: _jsx(Add, {}), onClick: addWorkingHoursSlot, sx: { bgcolor: 'indigo.100', color: 'indigo.700', '&:hover': { bgcolor: 'indigo.200' } }, children: "\u0625\u0636\u0627\u0641\u0629 \u0648\u0642\u062A" })] }), _jsx(Stack, { spacing: 2, children: (newDoctor.working_hours_slots || []).map((slot, index) => (_jsxs(Paper, { elevation: 2, sx: { p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }, children: [_jsxs(Box, { display: "flex", flexDirection: { xs: 'column', sm: 'row' }, gap: 3, children: [_jsxs(Box, { flex: 1, children: [_jsx(Typography, { variant: "subtitle2", sx: { textAlign: 'right', mb: 1 }, children: "\u0627\u0644\u0623\u064A\u0627\u0645" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }, children: daysOfWeek.map(day => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: slot.days?.includes(day) || false, onChange: () => handleDayToggle(index, day) }), label: getDayName(day), labelPlacement: "start", sx: { mr: 0, ml: 1 } }, day))) })] }), _jsx(Box, { flex: 1, children: _jsxs(Box, { display: "flex", gap: 2, children: [_jsx(Box, { flex: 1, children: _jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0641\u062A\u062D", type: "time", value: slot.openingTime || '', onChange: (e) => handleWorkingHoursChange(index, 'openingTime', e.target.value), fullWidth: true, InputLabelProps: { shrink: true }, sx: { '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } } }) }), _jsx(Box, { flex: 1, children: _jsx(TextField, { label: "\u0648\u0642\u062A \u0627\u0644\u0625\u063A\u0644\u0627\u0642", type: "time", value: slot.closingTime || '', onChange: (e) => handleWorkingHoursChange(index, 'closingTime', e.target.value), fullWidth: true, InputLabelProps: { shrink: true }, sx: { '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } } }) })] }) })] }), _jsx(Box, { display: "flex", justifyContent: "flex-end", mt: 1, children: _jsx(IconButton, { onClick: () => removeWorkingHoursSlot(index), color: "error", size: "small", children: _jsx(Delete, { fontSize: "small" }) }) }), slot.days?.length > 0 && slot.openingTime && slot.closingTime && (_jsxs(Typography, { variant: "body2", sx: { textAlign: 'right', mt: 1, color: 'text.secondary' }, children: [formatDaysRange(slot.days), ": ", formatTime(slot.openingTime), " - ", formatTime(slot.closingTime)] }))] }, index))) })] }) })] }) }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseAddDialog, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", color: "primary", disabled: !newDoctor.name || !newDoctor.specialty || !newDoctor.department || !newDoctor.branches?.length, children: "\u062D\u0641\u0638" })] })] })] }));
};
export default DataTableHeaders;
