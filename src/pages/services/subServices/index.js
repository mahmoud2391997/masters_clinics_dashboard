"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardMedia, Button, Chip, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Stack, IconButton } from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import SubserviceAddForm from './addSubSerivceForm';
const SubservicesPage = () => {
    const params = useParams();
    const id = typeof params.id === 'string' ? params.id : undefined;
    const [subservices, setSubservices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedSubservice, setSelectedSubservice] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [showAddForm, setShowAddForm] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchSubservices = async () => {
            try {
                const response = await fetch(`http://localhost:3000/subServices?serviceId=${id}`, {
                    headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
                });
                const data = await response.json();
                setSubservices(data);
            }
            catch (error) {
                console.error('حدث خطأ أثناء جلب البيانات:', error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchSubservices();
    }, [id]);
    const handleDeleteClick = (subservice) => {
        setSelectedSubservice(subservice);
        setDeleteConfirmOpen(true);
    };
    const handleDeleteConfirm = async () => {
        if (!selectedSubservice)
            return;
        try {
            await fetch(`http://localhost:3000/subServices/${selectedSubservice._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            setSubservices(subservices.filter(s => s._id !== selectedSubservice._id));
        }
        catch (error) {
            console.error('حدث خطأ أثناء الحذف:', error);
        }
        finally {
            setDeleteConfirmOpen(false);
            setSelectedSubservice(null);
        }
    };
    const handleEditClick = (subservice) => {
        setSelectedSubservice(subservice);
        setFormData(subservice);
        setImagePreview(subservice.imageUrl || null);
        setImageFile(null);
        setEditMode(true);
    };
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleSave = async () => {
        if (!selectedSubservice)
            return;
        try {
            const formDataToSend = new FormData();
            // Append all form data
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined) {
                    formDataToSend.append(key, value.toString());
                }
            });
            // Append image file if it exists
            if (imageFile) {
                formDataToSend.append('image', imageFile);
            }
            const response = await fetch(`http://localhost:3000/subservices/${selectedSubservice._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: formDataToSend,
            });
            const updated = await response.json();
            setSubservices(subservices.map(s => s._id === updated._id ? updated : s));
            setEditMode(false);
            setImageFile(null);
            setImagePreview(null);
        }
        catch (error) {
            console.error('حدث خطأ أثناء التحديث:', error);
        }
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "lg", sx: { py: 4 }, dir: "rtl", children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, children: [_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(IconButton, { onClick: () => navigate(-1), sx: { ml: 2 }, children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h4", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u0641\u0631\u0639\u064A\u0629" })] }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => setShowAddForm(true), children: "\u0625\u0636\u0627\u0641\u0629 \u062E\u062F\u0645\u0629 \u0641\u0631\u0639\u064A\u0629 \u062C\u062F\u064A\u062F\u0629" })] }), showAddForm && _jsx(SubserviceAddForm, { id: id }), _jsx(Box, { sx: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 3,
                }, children: subservices.map((subservice) => (_jsxs(Card, { sx: { height: '100%', display: 'flex', flexDirection: 'column' }, children: [_jsx(CardMedia, { component: "img", height: "200", image: subservice.imageUrl || '/placeholder-image.jpg', alt: subservice.name }), _jsxs(CardContent, { sx: { flexGrow: 1 }, children: [_jsx(Typography, { gutterBottom: true, variant: "h5", children: subservice.name }), _jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: subservice.description }), subservice.price && _jsx(Chip, { label: `$${subservice.price}`, color: "primary", sx: { mr: 1 } }), subservice.duration && _jsx(Chip, { label: `${subservice.duration} دقيقة`, sx: { mr: 1 } }), subservice.category && _jsx(Chip, { label: subservice.category, variant: "outlined" })] }), _jsxs(Box, { sx: { p: 2, display: 'flex', justifyContent: 'space-between' }, children: [_jsx(Button, { startIcon: _jsx(Edit, {}), onClick: () => handleEditClick(subservice), variant: "outlined", color: "primary", children: "\u062A\u0639\u062F\u064A\u0644" }), _jsx(Button, { startIcon: _jsx(Delete, {}), onClick: () => handleDeleteClick(subservice), variant: "outlined", color: "error", children: "\u062D\u0630\u0641" })] })] }, subservice._id))) }), _jsxs(Dialog, { open: editMode, onClose: () => setEditMode(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0641\u0631\u0639\u064A\u0629" }), _jsx(DialogContent, { children: _jsxs(Stack, { spacing: 3, sx: { mt: 2 }, children: [imagePreview && (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center' }, children: _jsx("img", { src: imagePreview, alt: "Preview", style: { maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' } }) })), _jsxs(Button, { variant: "contained", component: "label", fullWidth: true, children: [imageFile ? 'تغيير الصورة' : 'اختر صورة', _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }), _jsx(TextField, { label: "\u0627\u0644\u0627\u0633\u0645", name: "name", value: formData.name || '', onChange: handleFormChange, fullWidth: true, required: true }), _jsx(TextField, { label: "\u0627\u0644\u0648\u0635\u0641", name: "description", value: formData.description || '', onChange: handleFormChange, fullWidth: true, multiline: true, rows: 4 }), _jsxs(Box, { display: "flex", gap: 2, children: [_jsx(TextField, { label: "\u0627\u0644\u0633\u0639\u0631", name: "price", type: "number", value: formData.price || '', onChange: handleFormChange, fullWidth: true }), _jsx(TextField, { label: "\u0627\u0644\u0645\u062F\u0629 (\u062F\u0642\u0627\u0626\u0642)", name: "duration", type: "number", value: formData.duration || '', onChange: handleFormChange, fullWidth: true })] })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => {
                                    setEditMode(false);
                                    setImageFile(null);
                                    setImagePreview(null);
                                }, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSave, variant: "contained", color: "primary", children: "\u062D\u0641\u0638" })] })] }), _jsxs(Dialog, { open: deleteConfirmOpen, onClose: () => setDeleteConfirmOpen(false), children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsxs(Typography, { children: ["\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0623\u0646\u0643 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \"", selectedSubservice?.name, "\"\u061F"] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteConfirmOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleDeleteConfirm, color: "error", variant: "contained", children: "\u062D\u0630\u0641" })] })] })] }));
};
export default SubservicesPage;
