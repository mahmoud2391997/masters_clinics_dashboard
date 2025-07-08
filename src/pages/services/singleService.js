import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, Divider, CircularProgress, Chip, MenuItem, Select, FormControl, InputLabel, IconButton, List, ListItem, ListItemText } from '@mui/material';
import { Edit, Save, Cancel, Delete, Add, Close } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SubservicesPage from './subServices';
const API_BASE_URL = 'http://localhost:3000';
const getAuthToken = () => {
    return sessionStorage.getItem('token');
};
const parseIds = (ids) => {
    if (!ids)
        return [];
    if (Array.isArray(ids))
        return ids.map(id => Number(id));
    try {
        const parsed = JSON.parse(ids);
        return Array.isArray(parsed) ? parsed.map(id => Number(id)) : [];
    }
    catch {
        return [];
    }
};
const fetchServiceById = async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في جلب البيانات');
    }
    const data = await response.json();
    return {
        ...data,
        id: data.id,
        branches: parseIds(data.branches),
        doctors_ids: parseIds(data.doctors_ids),
        capabilities: data.capabilities ? (typeof data.capabilities === 'string' ? JSON.parse(data.capabilities) : data.capabilities) : [],
        department_id: data.department_id || null,
    };
};
const ServiceSinglePage = () => {
    const { id } = useParams();
    const [service, setService] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        description: '',
        capabilities: [],
        approach: '',
        doctors_ids: [],
        branches: [],
        department_id: null,
        image: ''
    });
    const [previewImage, setPreviewImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCapability, setNewCapability] = useState('');
    const [newDoctorId, setNewDoctorId] = useState('');
    const [newBranchId, setNewBranchId] = useState('');
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const token = getAuthToken();
                const [serviceData, doctorsRes, branchesRes, departmentsRes] = await Promise.all([
                    id ? fetchServiceById(id) : Promise.reject('معرف غير موجود'),
                    fetch(`${API_BASE_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
                    fetch(`${API_BASE_URL}/branches`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
                    fetch(`${API_BASE_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
                ]);
                setService(serviceData);
                setDoctors(doctorsRes);
                setBranches(branchesRes);
                setDepartments(departmentsRes);
                setForm({
                    title: serviceData.title || '',
                    subtitle: serviceData.subtitle || '',
                    description: serviceData.description || '',
                    capabilities: serviceData.capabilities || [],
                    approach: serviceData.approach || '',
                    doctors_ids: serviceData.doctors_ids || [],
                    branches: serviceData.branches || [],
                    department_id: serviceData.department_id || null,
                    image: serviceData.image || ''
                });
                setPreviewImage(serviceData.image || '');
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'حدث خطأ');
            }
            finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleSelectChange = (name, value) => {
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.match('image.*')) {
                setError('الرجاء اختيار ملف صورة');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleAddCapability = () => {
        if (newCapability.trim()) {
            setForm(prev => ({
                ...prev,
                capabilities: [...prev.capabilities, newCapability.trim()]
            }));
            setNewCapability('');
        }
    };
    const handleRemoveCapability = (index) => {
        setForm(prev => ({
            ...prev,
            capabilities: prev.capabilities.filter((_, i) => i !== index)
        }));
    };
    const handleAddDoctor = () => {
        if (newDoctorId && !form.doctors_ids.includes(newDoctorId)) {
            setForm(prev => ({
                ...prev,
                doctors_ids: [...prev.doctors_ids, newDoctorId]
            }));
            setNewDoctorId('');
        }
    };
    const handleRemoveDoctor = (doctorId) => {
        setForm(prev => ({
            ...prev,
            doctors_ids: prev.doctors_ids.filter(id => id !== doctorId)
        }));
    };
    const handleAddBranch = () => {
        if (newBranchId && !form.branches.includes(newBranchId)) {
            setForm(prev => ({
                ...prev,
                branches: [...prev.branches, newBranchId]
            }));
            setNewBranchId('');
        }
    };
    const handleRemoveBranch = (branchId) => {
        setForm(prev => ({
            ...prev,
            branches: prev.branches.filter(id => id !== branchId)
        }));
    };
    const handleSave = async () => {
        if (!form || !id)
            return;
        setLoading(true);
        setError(null);
        const token = getAuthToken();
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("subtitle", form.subtitle || '');
            formData.append("description", form.description);
            formData.append("capabilities", JSON.stringify(form.capabilities));
            formData.append("approach", form.approach);
            formData.append("doctors_ids", JSON.stringify(form.doctors_ids));
            formData.append("branches", JSON.stringify(form.branches));
            if (form.department_id)
                formData.append("department_id", form.department_id.toString());
            if (imageFile) {
                formData.append("image", imageFile);
            }
            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'فشل في التحديث');
            }
            const updatedService = await fetchServiceById(id);
            setService(updatedService);
            setForm({
                title: updatedService.title || '',
                subtitle: updatedService.subtitle || '',
                description: updatedService.description || '',
                capabilities: updatedService.capabilities || [],
                approach: updatedService.approach || '',
                doctors_ids: updatedService.doctors_ids || [],
                branches: updatedService.branches || [],
                department_id: updatedService.department_id || null,
                image: updatedService.image || ''
            });
            setImageFile(null);
            setEditMode(false);
            setError(null);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'فشل في التحديث');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        if (service) {
            setForm({
                title: service.title || '',
                subtitle: service.subtitle || '',
                description: service.description || '',
                capabilities: service.capabilities || [],
                approach: service.approach || '',
                doctors_ids: service.doctors_ids || [],
                branches: service.branches || [],
                department_id: service.department_id || null,
                image: service.image || ''
            });
            setPreviewImage(service.image || '');
            setImageFile(null);
            setEditMode(false);
            setError(null);
        }
    };
    const handleDelete = async () => {
        if (!id)
            return;
        if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟'))
            return;
        setLoading(true);
        const token = getAuthToken();
        try {
            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('فشل في الحذف');
            }
            alert('تم حذف الخدمة بنجاح');
            window.location.href = '/services';
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'فشل في الحذف');
        }
        finally {
            setLoading(false);
        }
    };
    if (loading)
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    if (error)
        return (_jsx(Box, { sx: { p: 3 }, children: _jsx(Typography, { color: "error", children: error }) }));
    if (!service)
        return _jsx(Typography, { children: "\u0627\u0644\u062E\u062F\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    const availableDoctors = doctors.filter(doctor => !form.doctors_ids.includes(doctor.id));
    const availableBranches = branches.filter(branch => !form.branches.includes(branch.id));
    return (_jsxs(_Fragment, { children: [_jsx(Box, { sx: { maxWidth: 900, mx: 'auto', p: 3 }, children: _jsxs(Paper, { elevation: 3, sx: { p: 4 }, children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0629" }), editMode ? (_jsxs(_Fragment, { children: [_jsx(Button, { color: "success", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { mr: 1 }, children: "\u062D\u0641\u0638" }), _jsx(Button, { color: "inherit", startIcon: _jsx(Cancel, {}), onClick: handleCancel, children: "\u0625\u0644\u063A\u0627\u0621" })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { startIcon: _jsx(Edit, {}), onClick: () => setEditMode(true), sx: { mr: 1 }, children: "\u062A\u0639\u062F\u064A\u0644" }), _jsx(Button, { color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, children: "\u062D\u0630\u0641" })] }))] }), _jsxs(Box, { display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, children: [_jsxs(Box, { flex: { xs: "1 1 100%", md: "0 0 30%" }, textAlign: "center", children: [_jsx(Avatar, { src: previewImage, alt: form.title, sx: { width: 200, height: 200, mx: 'auto', mb: 2 } }), editMode && (_jsx("label", { children: _jsxs(Button, { variant: "contained", component: "span", children: ["\u062A\u062D\u0645\u064A\u0644 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }) }))] }), _jsxs(Box, { flex: { xs: "1 1 100%", md: "1 1 70%" }, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u062E\u062F\u0645\u0629", name: "title", value: form.title, onChange: handleChange, margin: "normal", disabled: !editMode }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639\u064A", name: "subtitle", value: form.subtitle || '', onChange: handleChange, margin: "normal", disabled: !editMode }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0648\u0635\u0641", name: "description", value: form.description, onChange: handleChange, margin: "normal", multiline: true, rows: 4, disabled: !editMode }), _jsxs(FormControl, { fullWidth: true, margin: "normal", disabled: !editMode, children: [_jsx(InputLabel, { children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { value: form.department_id || '', label: "\u0627\u0644\u0642\u0633\u0645", onChange: (e) => handleSelectChange('department_id', e.target.value), children: departments.map(dep => (_jsx(MenuItem, { value: dep.id, children: dep.name }, dep.id))) })] }), _jsxs(Box, { mt: 2, mb: 2, children: [_jsx(Typography, { variant: "subtitle1", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621 \u0627\u0644\u0645\u0639\u064A\u0646\u0648\u0646" }), editMode ? (_jsxs(_Fragment, { children: [_jsxs(Box, { display: "flex", gap: 1, mb: 2, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628" }), _jsx(Select, { value: newDoctorId, label: "\u0625\u0636\u0627\u0641\u0629 \u0637\u0628\u064A\u0628", onChange: (e) => setNewDoctorId(e.target.value), children: availableDoctors.map(doc => (_jsx(MenuItem, { value: doc.id, children: doc.name }, doc.id))) })] }), _jsx(Button, { variant: "contained", onClick: handleAddDoctor, disabled: !newDoctorId, startIcon: _jsx(Add, {}), children: "\u0625\u0636\u0627\u0641\u0629" })] }), _jsx(List, { dense: true, children: form.doctors_ids.map(id => {
                                                                const doctor = doctors.find(d => d.id === id);
                                                                return doctor ? (_jsx(ListItem, { secondaryAction: _jsx(IconButton, { edge: "end", onClick: () => handleRemoveDoctor(doctor.id), children: _jsx(Close, {}) }), children: _jsx(ListItemText, { primary: doctor.name }) }, doctor.id)) : (_jsx(ListItem, { secondaryAction: _jsx(IconButton, { edge: "end", onClick: () => handleRemoveDoctor(id), children: _jsx(Close, {}) }), children: _jsx(ListItemText, { primary: `طبيب غير معروف (ID: ${id})` }) }, id));
                                                            }) })] })) : (_jsx(Box, { sx: { pl: 2 }, children: form.doctors_ids.length > 0 ? (form.doctors_ids.map(id => {
                                                        const doctor = doctors.find(d => d.id === id);
                                                        return doctor ? (_jsxs(Typography, { children: ["\u2022 ", doctor.name] }, doctor.id)) : (_jsxs(Typography, { children: ["\u2022 \u0637\u0628\u064A\u0628 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641 (ID: ", id, ")"] }, id));
                                                    })) : (_jsx(Typography, { color: "textSecondary", children: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0637\u0628\u0627\u0621 \u0645\u0639\u064A\u0646\u0648\u0646" })) }))] }), _jsxs(Box, { mt: 2, mb: 2, children: [_jsx(Typography, { variant: "subtitle1", children: "\u0627\u0644\u0641\u0631\u0648\u0639 \u0627\u0644\u0645\u062A\u0627\u062D\u0629" }), editMode ? (_jsxs(_Fragment, { children: [_jsxs(Box, { display: "flex", gap: 1, mb: 2, children: [_jsxs(FormControl, { fullWidth: true, children: [_jsx(InputLabel, { children: "\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0639" }), _jsx(Select, { value: newBranchId, label: "\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0639", onChange: (e) => setNewBranchId(e.target.value), children: availableBranches.map(branch => (_jsx(MenuItem, { value: branch.id, children: branch.name }, branch.id))) })] }), _jsx(Button, { variant: "contained", onClick: handleAddBranch, disabled: !newBranchId, startIcon: _jsx(Add, {}), children: "\u0625\u0636\u0627\u0641\u0629" })] }), _jsx(List, { dense: true, children: form.branches.map(id => {
                                                                const branch = branches.find(b => b.id === id);
                                                                return branch ? (_jsx(ListItem, { secondaryAction: _jsx(IconButton, { edge: "end", onClick: () => handleRemoveBranch(branch.id), children: _jsx(Close, {}) }), children: _jsx(ListItemText, { primary: branch.name }) }, branch.id)) : (_jsx(ListItem, { secondaryAction: _jsx(IconButton, { edge: "end", onClick: () => handleRemoveBranch(id), children: _jsx(Close, {}) }), children: _jsx(ListItemText, { primary: `فرع غير معروف (ID: ${id})` }) }, id));
                                                            }) })] })) : (_jsx(Box, { sx: { pl: 2 }, children: form.branches.length > 0 ? (form.branches.map(id => {
                                                        const branch = branches.find(b => b.id === id);
                                                        return branch ? (_jsxs(Typography, { children: ["\u2022 ", branch.name] }, branch.id)) : (_jsxs(Typography, { children: ["\u2022 \u0641\u0631\u0639 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641 (ID: ", id, ")"] }, id));
                                                    })) : (_jsx(Typography, { color: "textSecondary", children: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0641\u0631\u0648\u0639 \u0645\u0639\u064A\u0646\u0629" })) }))] })] })] }), _jsx(Divider, { sx: { my: 4 } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0645\u0645\u064A\u0632\u0627\u062A" }), editMode ? (_jsxs(_Fragment, { children: [_jsxs(Box, { display: "flex", gap: 1, mb: 2, children: [_jsx(TextField, { fullWidth: true, value: newCapability, onChange: (e) => setNewCapability(e.target.value), size: "small" }), _jsx(Button, { variant: "contained", onClick: handleAddCapability, startIcon: _jsx(Add, {}), children: "\u0625\u0636\u0627\u0641\u0629" })] }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 1, children: form.capabilities.map((item, index) => (_jsx(Chip, { label: item, onDelete: () => handleRemoveCapability(index) }, index))) })] })) : (_jsx(Box, { sx: { pl: 2 }, children: form.capabilities.length > 0 ? (form.capabilities.map((item, index) => (_jsxs(Typography, { children: ["\u2022 ", item] }, index)))) : (_jsx(Typography, { color: "textSecondary", children: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0645\u062D\u062A\u0648\u0649" })) }))] }), _jsx(Divider, { sx: { my: 4 } }), _jsxs(Box, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0645\u0646\u0647\u062C\u064A\u0629" }), _jsx(TextField, { fullWidth: true, name: "approach", value: form.approach, onChange: handleChange, margin: "normal", multiline: true, rows: 4, disabled: !editMode })] })] }) }), _jsx(SubservicesPage, {})] }));
};
export default ServiceSinglePage;
