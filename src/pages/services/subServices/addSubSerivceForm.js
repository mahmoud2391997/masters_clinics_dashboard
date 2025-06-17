'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Stack, Divider, Chip, IconButton, InputAdornment, Snackbar, Alert } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArrowBack, CloudUpload, Link, Add } from '@mui/icons-material';
const SubserviceAddForm = ({ id }) => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        imageFile: null,
        price: 0,
        duration: 0,
        category: ''
    });
    const [errors, setErrors] = useState({
        name: '',
        price: '',
        duration: ''
    });
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'duration' ? Number(value) : value,
            ...(name === 'imageUrl' && { imageFile: null, imageUrl: value })
        }));
    };
    const handleFileChange = (e) => {
        if (!e.target.files || !e.target.files[0])
            return;
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) {
            setNotification({
                open: true,
                message: 'الرجاء اختيار ملف صورة فقط',
                severity: 'error'
            });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setNotification({
                open: true,
                message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت',
                severity: 'error'
            });
            return;
        }
        setFormData(prev => ({
            ...prev,
            imageFile: file,
            imageUrl: ''
        }));
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.readyState === 2) {
                setImagePreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    };
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    const validateForm = () => {
        const newErrors = {
            name: '',
            price: '',
            duration: ''
        };
        let isValid = true;
        if (!formData.name.trim()) {
            newErrors.name = 'الاسم مطلوب';
            isValid = false;
        }
        if (formData.price && formData.price < 0) {
            newErrors.price = 'يجب أن يكون السعر رقمًا موجبًا';
            isValid = false;
        }
        if (formData.duration && formData.duration <= 0) {
            newErrors.duration = 'المدة يجب أن تكون أكبر من صفر';
            isValid = false;
        }
        setErrors(newErrors);
        return isValid;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        if (typeof window === 'undefined')
            return;
        setLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                throw new Error('لم يتم العثور على رمز المصادقة');
            }
            const formPayload = new FormData();
            formPayload.append('name', formData.name);
            formPayload.append('description', formData.description || '');
            formPayload.append('price', String(formData.price));
            formPayload.append('duration', String(formData.duration));
            formPayload.append('category', formData.category || '');
            formPayload.append('serviceId', id || '');
            if (formData.imageFile) {
                formPayload.append('image', formData.imageFile);
            }
            else if (formData.imageUrl) {
                formPayload.append('imageUrl', formData.imageUrl);
            }
            const response = await fetch('http://localhost:3000/subServices', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formPayload,
            });
            if (!response.ok) {
                throw new Error('فشل في إنشاء الخدمة الفرعية');
            }
            setNotification({
                open: true,
                message: 'تم إنشاء الخدمة الفرعية بنجاح!',
                severity: 'success'
            });
            // إعادة تعيين النموذج
            setFormData({
                name: '',
                description: '',
                imageUrl: '',
                imageFile: null,
                price: 0,
                duration: 0,
                category: ''
            });
            setImagePreview(null);
        }
        catch (error) {
            console.error('خطأ في إنشاء الخدمة الفرعية:', error);
            setNotification({
                open: true,
                message: error instanceof Error ? error.message : 'فشل في إنشاء الخدمة الفرعية',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleBack = () => {
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };
    const handleCancel = () => {
        setFormData({
            name: '',
            description: '',
            imageUrl: '',
            imageFile: null,
            price: 0,
            duration: 0,
            category: ''
        });
        setImagePreview(null);
        setErrors({ name: '', price: '', duration: '' });
    };
    return (_jsxs(Container, { maxWidth: "md", sx: { py: 4 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 4, children: [_jsx(IconButton, { onClick: handleBack, sx: { mr: 2 }, children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h4", children: "\u0625\u0636\u0627\u0641\u0629 \u062E\u062F\u0645\u0629 \u0641\u0631\u0639\u064A\u0629 \u062C\u062F\u064A\u062F\u0629" })] }), _jsx(Card, { children: _jsx(CardContent, { children: _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { required: true, fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0641\u0631\u0639\u064A\u0629", name: "name", value: formData.name, onChange: handleChange, variant: "outlined", error: !!errors.name, helperText: errors.name }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 4, label: "\u0627\u0644\u0648\u0635\u0641", name: "description", value: formData.description, onChange: handleChange, variant: "outlined" }), _jsxs(Box, { children: [_jsx(TextField, { fullWidth: true, label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629 \u0623\u0648 \u062A\u062D\u0645\u064A\u0644", name: "imageUrl", value: formData.imageUrl, onChange: handleChange, variant: "outlined", placeholder: "https://example.com/image.jpg", InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Link, {}) })),
                                                endAdornment: (_jsxs(InputAdornment, { position: "end", children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(CloudUpload, {}), onClick: triggerFileInput, children: "\u062A\u062D\u0645\u064A\u0644" }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/*", style: { display: 'none' } })] })),
                                            }, disabled: !!formData.imageFile }), formData.imageFile && (_jsxs(Box, { mt: 1, display: "flex", alignItems: "center", children: [_jsxs(Typography, { variant: "body2", color: "text.secondary", sx: { mr: 2 }, children: ["\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u062E\u062A\u0627\u0631: ", formData.imageFile.name] }), _jsx(Button, { size: "small", onClick: () => {
                                                        setFormData(prev => ({ ...prev, imageFile: null }));
                                                        setImagePreview(null);
                                                    }, children: "\u0625\u0632\u0627\u0644\u0629" })] }))] }), _jsx(Divider, { children: _jsx(Chip, { label: "\u0627\u0644\u0633\u0639\u0631 \u0648\u0627\u0644\u0645\u062F\u0629" }) }), _jsxs(Box, { display: "flex", gap: 2, children: [_jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 (\u062C\u0646\u064A\u0647)", name: "price", value: formData.price, onChange: handleChange, variant: "outlined", InputProps: { inputProps: { min: 0 } }, error: !!errors.price, helperText: errors.price }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0645\u062F\u0629 (\u0628\u0627\u0644\u062F\u0642\u0627\u0626\u0642)", name: "duration", value: formData.duration, onChange: handleChange, variant: "outlined", InputProps: { inputProps: { min: 1 } }, error: !!errors.duration, helperText: errors.duration })] }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641", name: "category", value: formData.category, onChange: handleChange, variant: "outlined" }), _jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, children: [_jsx(Button, { variant: "outlined", color: "secondary", onClick: handleCancel, disabled: loading, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(LoadingButton, { type: "submit", variant: "contained", color: "primary", loading: loading, loadingPosition: "start", startIcon: _jsx(Add, {}), children: loading ? 'جاري الإرسال...' : 'إنشاء الخدمة' })] })] }) }) }) }), _jsx(Snackbar, { open: notification.open, autoHideDuration: 4000, onClose: () => setNotification(prev => ({ ...prev, open: false })), children: _jsx(Alert, { severity: notification.severity, sx: { width: '100%' }, children: notification.message }) })] }));
};
export default SubserviceAddForm;
