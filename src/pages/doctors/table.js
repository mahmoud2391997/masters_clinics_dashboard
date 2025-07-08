import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, Paper, Box, TextField, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TableBody, Checkbox, MenuItem, LinearProgress, CircularProgress } from '@mui/material';
import { Add, Save } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';
const DoctorTable = () => {
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newDoctor, setNewDoctor] = useState({
        name: '',
        title: '',
        description: '',
        position: '',
        practice_area: '',
        experience: '',
        address: '',
        phone: '',
        email: '',
        personal_experience: '',
        education: [],
        skills: [],
        achievements: [],
        working_hours: [],
        branches_ids: [],
        department_id: 0,
        image: null,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [branchOptions, setBranchOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const response = await axios.get('http://localhost:3000/doctors', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
                console.log('Fetched Doctors:', response.data);
                setDoctors(response.data);
                setFilteredDoctors(response.data);
            }
            catch (err) {
                setError('فشل في تحميل بيانات الأطباء');
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);
    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [branchesRes, departmentsRes] = await Promise.all([
                    axios.get('http://localhost:3000/branches', {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                    }),
                    axios.get('http://localhost:3000/departments', {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
                    }),
                ]);
                setBranchOptions(branchesRes.data);
                setDepartmentOptions(departmentsRes.data);
            }
            catch (err) {
                console.error('فشل في تحميل الفروع أو الأقسام', err);
            }
        };
        fetchOptions();
    }, []);
    useEffect(() => {
        const filtered = doctors.filter(doctor => doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doctor.title && doctor.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (doctor.practice_area && doctor.practice_area.toLowerCase().includes(searchQuery.toLowerCase())));
        setFilteredDoctors(filtered);
    }, [searchQuery, doctors]);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewDoctor(prev => ({ ...prev, [name]: value }));
    };
    const handleListChange = (name, value) => {
        setNewDoctor(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result);
            };
            reader.readAsDataURL(file);
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
            formData.append('name', newDoctor.name);
            formData.append('title', newDoctor.title || '');
            formData.append('description', newDoctor.description || '');
            formData.append('position', newDoctor.position || '');
            formData.append('practice_area', newDoctor.practice_area || '');
            formData.append('experience', newDoctor.experience || '');
            formData.append('address', newDoctor.address || '');
            formData.append('phone', newDoctor.phone || '');
            formData.append('email', newDoctor.email || '');
            formData.append('personal_experience', newDoctor.personal_experience || '');
            formData.append('education', JSON.stringify(newDoctor.education || []));
            formData.append('skills', JSON.stringify(newDoctor.skills || []));
            formData.append('achievements', JSON.stringify(newDoctor.achievements || []));
            formData.append('working_hours', JSON.stringify(newDoctor.working_hours || []));
            formData.append('branches_ids', JSON.stringify(newDoctor.branches_ids || []));
            formData.append('department_id', newDoctor.department_id?.toString() || '');
            if (imageFile) {
                formData.append('image', imageFile);
            }
            const response = await axios.post('http://localhost:3000/doctors', formData, {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setDoctors(prev => [...prev, response.data]);
            setFilteredDoctors(prev => [...prev, response.data]);
            setOpenAddDialog(false);
            resetForm();
        }
        catch (err) {
            setError('فشل في إضافة الطبيب');
            console.error(err);
        }
        finally {
            setSubmitting(false);
        }
    };
    const resetForm = () => {
        setNewDoctor({
            name: '',
            title: '',
            description: '',
            position: '',
            practice_area: '',
            experience: '',
            address: '',
            phone: '',
            email: '',
            personal_experience: '',
            education: [],
            skills: [],
            achievements: [],
            working_hours: [],
            branches_ids: [],
            department_id: 0,
            image: null,
        });
        setImageFile(null);
        setImagePreview(null);
    };
    const getBranchName = (id) => {
        const branch = branchOptions.find(b => b.id === id);
        return branch ? branch.name : id.toString();
    };
    const getDepartmentName = (id) => {
        console.log('Department ID:', id);
        console.log(departmentOptions);
        const dept = departmentOptions.find(d => d.id === id);
        return dept ? dept.name : '-';
    };
    return (_jsxs(Box, { dir: "rtl", className: "p-5", children: [_jsxs(Box, { display: "flex", gap: 2, mb: 2, children: [_jsx(TextField, { fullWidth: true, label: "\u0628\u062D\u062B \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0644\u0642\u0628 \u0623\u0648 \u0627\u0644\u062A\u062E\u0635\u0635", variant: "outlined", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setOpenAddDialog(true), children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628" })] }), error && (_jsx(Box, { mb: 2, children: _jsx(Typography, { color: "error", children: error }) })), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { align: "center", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0644\u0642\u0628" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0645\u0646\u0635\u0628" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u062A\u062E\u0635\u0635" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx(TableCell, { align: "center", children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, align: "center", children: _jsx(LinearProgress, {}) }) })) : filteredDoctors.length > 0 ? (filteredDoctors.map((doctor) => (_jsxs(TableRow, { children: [_jsx(TableCell, { align: "center", children: doctor.name }), _jsx(TableCell, { align: "center", children: doctor.title || '-' }), _jsx(TableCell, { align: "center", children: doctor.position || '-' }), _jsx(TableCell, { align: "center", children: doctor.practice_area || '-' }), _jsx(TableCell, { align: "center", children: getDepartmentName(doctor.department_id) }), _jsx(TableCell, { align: "center", children: doctor.phone || '-' }), _jsx(TableCell, { align: "center", children: doctor.email || '-' }), _jsx(TableCell, { align: "center", children: _jsx(Link, { to: `/doctors/${doctor.id}`, children: _jsx(Button, { variant: "outlined", size: "small", children: "\u0639\u0631\u0636" }) }) })] }, doctor.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }) })) })] }) }), _jsxs(Dialog, { open: openAddDialog, onClose: () => {
                    setOpenAddDialog(false);
                    resetForm();
                }, fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628 \u062C\u062F\u064A\u062F" }), _jsx(DialogContent, { dividers: true, children: _jsxs(Stack, { spacing: 3, sx: { pt: 2 }, children: [_jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645 *", name: "name", value: newDoctor.name, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0644\u0642\u0628", name: "title", value: newDoctor.title, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0648\u0635\u0641", name: "description", value: newDoctor.description, onChange: handleInputChange, multiline: true, rows: 3, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0646\u0635\u0628", name: "position", value: newDoctor.position, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u062A\u062E\u0635\u0635", name: "practice_area", value: newDoctor.practice_area, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u062E\u0628\u0631\u0629", name: "experience", value: newDoctor.experience, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", name: "address", value: newDoctor.address, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0647\u0627\u062A\u0641", name: "phone", value: newDoctor.phone, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A", name: "email", value: newDoctor.email, onChange: handleInputChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u062E\u0628\u0631\u0629 \u0627\u0644\u0634\u062E\u0635\u064A\u0629", name: "personal_experience", value: newDoctor.personal_experience, onChange: handleInputChange, multiline: true, rows: 3, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u062A\u0639\u0644\u064A\u0645 (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629)", value: newDoctor.education?.join(', ') || '', onChange: (e) => handleListChange('education', e.target.value), fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062A (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629)", value: newDoctor.skills?.join(', ') || '', onChange: (e) => handleListChange('skills', e.target.value), fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0625\u0646\u062C\u0627\u0632\u0627\u062A (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0627\u0635\u0644\u0629)", value: newDoctor.achievements?.join(', ') || '', onChange: (e) => handleListChange('achievements', e.target.value), fullWidth: true }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(TextField, { select: true, SelectProps: {
                                                multiple: true,
                                                value: newDoctor.branches_ids || [],
                                                onChange: (e) => {
                                                    const value = e.target.value;
                                                    setNewDoctor(prev => ({ ...prev, branches_ids: value }));
                                                },
                                                renderValue: (selected) => {
                                                    const selectedBranches = selected;
                                                    return selectedBranches.map(id => getBranchName(id)).join(', ');
                                                },
                                            }, fullWidth: true, children: branchOptions.map((branch) => (_jsxs(MenuItem, { value: branch.id, children: [_jsx(Checkbox, { checked: newDoctor.branches_ids?.includes(branch.id) || false }), branch.name] }, branch.id))) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(TextField, { select: true, value: newDoctor.department_id || '', onChange: (e) => setNewDoctor(prev => ({
                                                ...prev,
                                                department_id: parseInt(e.target.value)
                                            })), fullWidth: true, children: departmentOptions.map((dept) => (_jsx(MenuItem, { value: dept.id, children: dept.name }, dept.id))) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A" }), _jsxs(Button, { variant: "outlined", component: "label", fullWidth: true, children: ["\u062A\u062D\u0645\u064A\u0644 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleFileChange })] }), imagePreview && (_jsx(Box, { mt: 2, textAlign: "center", children: _jsx("img", { src: imagePreview, alt: "Preview", style: {
                                                    maxHeight: '200px',
                                                    maxWidth: '100%',
                                                    borderRadius: '4px'
                                                } }) }))] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => {
                                    setOpenAddDialog(false);
                                    resetForm();
                                }, color: "secondary", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", color: "primary", disabled: submitting || !newDoctor.name, startIcon: submitting ? _jsx(CircularProgress, { size: 20 }) : _jsx(Save, {}), children: submitting ? 'جاري الحفظ...' : 'حفظ' })] })] })] }));
};
export default DoctorTable;
