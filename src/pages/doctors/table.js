import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, Paper, Box, TextField, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, LinearProgress, CircularProgress, IconButton, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel, Avatar, TableBody } from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
const DoctorTable = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '', specialty: '', branch_id: 0, department_id: 0,
        services: '', image: null, priority: 0, is_active: true
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    useEffect(() => {
        fetchDoctors();
        fetchOptions();
    }, []);
    const fetchDoctors = async () => {
        try {
            const resp = await axios.get('https://www.ss.mastersclinics.com/doctors', {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setDoctors(resp.data);
            setFilteredDoctors(resp.data);
        }
        catch (err) {
            console.error(err);
            setError('فشل تحميل الأطباء');
        }
        finally {
            setLoading(false);
        }
    };
    const fetchOptions = async () => {
        try {
            const [b, d] = await Promise.all([
                axios.get('https://www.ss.mastersclinics.com/branches', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }),
                axios.get('https://www.ss.mastersclinics.com/departments', {
                    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
                }),
            ]);
            setBranchOptions(b.data);
            setDepartmentOptions(d.data);
        }
        catch (err) {
            console.error(err);
        }
    };
    useEffect(() => {
        const f = doctors.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())));
        setFilteredDoctors(f);
    }, [searchQuery, doctors]);
    const getImageUrl = (imagePath) => {
        if (!imagePath)
            return '';
        // Check if the path already has the domain
        if (imagePath.startsWith('http'))
            return imagePath;
        return `https://www.ss.mastersclinics.com${imagePath}`;
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDoctor(prev => ({ ...prev, [name]: name === 'priority' ? Number(value) : value }));
    };
    const handleSwitchChange = (e) => {
        setNewDoctor(prev => ({ ...prev, is_active: e.target.checked }));
    };
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setNewDoctor(prev => ({ ...prev, [name]: Number(value) }));
    };
    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setImageFile(e.target.files[0]);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const handleSubmit = async () => {
        if (!newDoctor.name) {
            setError('الاسم مطلوب');
            return;
        }
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(newDoctor).forEach(([k, v]) => {
                if (v !== undefined)
                    formData.append(k, String(v));
            });
            if (imageFile)
                formData.append('image', imageFile);
            const resp = await axios.post('https://www.ss.mastersclinics.com/doctors', formData, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setDoctors(prev => [...prev, resp.data]);
            setFilteredDoctors(prev => [...prev, resp.data]);
            setOpenAddDialog(false);
            resetForm();
        }
        catch (err) {
            console.error(err);
            setError('فشل إضافة الطبيب');
        }
        finally {
            setSubmitting(false);
        }
    };
    const resetForm = () => {
        setNewDoctor({
            name: '',
            specialty: '',
            branch_id: 0,
            department_id: 0,
            services: '',
            image: null,
            priority: 0,
            is_active: true
        });
        setImageFile(null);
        setImagePreview(null);
    };
    const handleDeleteClick = (id) => {
        setDoctorToDelete(id);
        setDeleteDialogOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!doctorToDelete)
            return;
        setDeleting(true);
        try {
            await axios.delete(`https://www.ss.mastersclinics.com/doctors/${doctorToDelete}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
            });
            setDoctors(prev => prev.filter(d => d.id !== doctorToDelete));
            setFilteredDoctors(prev => prev.filter(d => d.id !== doctorToDelete));
            setDeleteDialogOpen(false);
        }
        catch (err) {
            console.error(err);
            setError('فشل الحذف');
        }
        finally {
            setDeleting(false);
            setDoctorToDelete(null);
        }
    };
    const getBranchName = (id) => branchOptions.find(b => b.id === id)?.name || '';
    const getDepartmentName = (id) => departmentOptions.find(d => d.id === id)?.name || '';
    return (_jsxs(Box, { dir: "rtl", className: "p-5", children: [_jsxs(Box, { display: "flex", gap: 2, mb: 2, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u062A\u062E\u0635\u0635", variant: "outlined", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setOpenAddDialog(true), children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628" })] }), error && _jsx(Typography, { color: "error", mb: 2, children: error }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { align: "center", children: "\u0627\u0644\u0635\u0648\u0631\u0629" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u062A\u062E\u0635\u0635" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0641\u0631\u0639" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629" }), _jsx(TableCell, { align: "center", children: "\u0646\u0634\u0637" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, align: "center", children: _jsx(LinearProgress, {}) }) })) : filteredDoctors.length ? (filteredDoctors.map(doc => (_jsxs(TableRow, { children: [_jsx(TableCell, { align: "center", children: _jsx(Avatar, { src: getImageUrl(doc.image), alt: doc.name, sx: { width: 56, height: 56, margin: '0 auto' } }) }), _jsx(TableCell, { align: "center", children: doc.name }), _jsx(TableCell, { align: "center", children: doc.specialty || '-' }), _jsx(TableCell, { align: "center", children: getBranchName(doc.branch_id) }), _jsx(TableCell, { align: "center", children: getDepartmentName(doc.department_id) }), _jsx(TableCell, { align: "center", children: doc.services?.substring(0, 50) + '...' }), _jsx(TableCell, { align: "center", children: doc.priority }), _jsx(TableCell, { align: "center", children: doc.is_active ? 'نعم' : 'لا' }), _jsx(TableCell, { align: "center", children: _jsxs(Stack, { direction: "row", spacing: 1, justifyContent: "center", children: [_jsx(Link, { to: `/doctors/${doc.id}`, children: _jsx(Button, { variant: "outlined", size: "small", children: "\u0639\u0631\u0636" }) }), _jsx(IconButton, { color: "error", onClick: () => handleDeleteClick(doc.id), children: _jsx(Delete, {}) })] }) })] }, doc.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 9, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }) })) })] }) }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: () => setDeleteDialogOpen(false), children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "\u0647\u0644 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0637\u0628\u064A\u0628\u061F" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteDialogOpen(false), disabled: deleting, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleConfirmDelete, color: "error", disabled: deleting, children: deleting ? _jsx(CircularProgress, { size: 20 }) : 'حذف' })] })] }), _jsxs(Dialog, { open: openAddDialog, onClose: () => { setOpenAddDialog(false); resetForm(); }, fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628 \u062C\u062F\u064A\u062F" }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 3, pt: 2, children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", name: "name", value: newDoctor.name, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u062A\u062E\u0635\u0635", name: "specialty", value: newDoctor.specialty, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", name: "services", value: newDoctor.services, onChange: handleInputChange, multiline: true, rows: 3, fullWidth: true }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0641\u0631\u0639" }), _jsx(Select, { name: "branch_id", value: newDoctor.branch_id || '', onChange: handleSelectChange, children: branchOptions.map(b => (_jsx(MenuItem, { value: b.id, children: b.name }, b.id))) })] }), _jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { name: "department_id", value: newDoctor.department_id || '', onChange: handleSelectChange, children: departmentOptions.map(d => (_jsx(MenuItem, { value: d.id, children: d.name }, d.id))) })] }), _jsx(TextField, { label: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629", name: "priority", type: "number", value: newDoctor.priority, onChange: handleInputChange, fullWidth: true }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: newDoctor.is_active, onChange: handleSwitchChange }), label: "\u0646\u0634\u0637" }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u062D\u0633\u0627\u0628" }), _jsxs(Button, { variant: "outlined", component: "label", fullWidth: true, children: ["\u0631\u0641\u0639 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleFileChange })] }), imagePreview && (_jsx(Box, { mt: 2, textAlign: "center", children: _jsx("img", { src: imagePreview, alt: "Preview", style: {
                                                    maxHeight: 200,
                                                    maxWidth: '100%',
                                                    borderRadius: 4
                                                } }) }))] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => { setOpenAddDialog(false); resetForm(); }, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", color: "primary", disabled: submitting, children: submitting ? _jsx(CircularProgress, { size: 20 }) : 'حفظ' })] })] })] }));
};
export default DoctorTable;
