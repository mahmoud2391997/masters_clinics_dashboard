import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, Avatar, Divider, CircularProgress } from '@mui/material';
import { Edit, Save, Cancel, Delete } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SubservicesPage from './subServices';
const API_BASE_URL = 'https://www.ss.mastersclinics.com';
const fetchCategoryById = async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في جلب البيانات');
    }
    return await response.json();
};
const CategorySinglePage = () => {
    const [category, setCategory] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        doctorNames: [],
        image: '',
        branches: []
    });
    const [previewImage, setPreviewImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    useEffect(() => {
        const loadData = async () => {
            try {
                if (id) {
                    const data = await fetchCategoryById(id);
                    setCategory(data);
                    setForm(data);
                    setPreviewImage(data.image);
                }
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
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
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.match('image.*')) {
                setError('يرجى اختيار ملف صورة');
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
    const handleSave = async () => {
        if (!form || !id)
            return;
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            if (form.doctorNames?.length) {
                formData.append("doctorNames", JSON.stringify(form.doctorNames));
            }
            if (form.branches?.length) {
                formData.append("branches", JSON.stringify(form.branches));
            }
            if (imageFile) {
                formData.append("image", imageFile);
            }
            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'فشل في التحديث');
            }
            const updatedCategory = await fetchCategoryById(id);
            setCategory(updatedCategory);
            setForm(updatedCategory);
            setImageFile(null);
            setEditMode(false);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'فشل في التحديث');
        }
        finally {
            setLoading(false);
        }
    };
    const handleCancel = () => {
        if (category) {
            setForm(category);
            setPreviewImage(category.image);
            setImageFile(null);
            setEditMode(false);
        }
    };
    const handleDelete = async () => {
        if (!id)
            return;
        if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟'))
            return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                }
            });
            if (!response.ok) {
                throw new Error('فشل في الحذف');
            }
            // يمكنك إعادة التوجيه أو عرض رسالة نجاح
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
        return _jsx(Typography, { color: "error", children: error });
    if (!category)
        return _jsx(Typography, { children: "\u0627\u0644\u062E\u062F\u0645\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    return (_jsxs(_Fragment, { children: [_jsx(Box, { sx: { maxWidth: 900, mx: 'auto', p: 3 }, children: _jsxs(Paper, { elevation: 3, sx: { p: 4 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [_jsx(Typography, { variant: "h4", children: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0629" }), editMode ? (_jsxs(Box, { children: [_jsx(Button, { color: "success", startIcon: _jsx(Save, {}), onClick: handleSave, disabled: loading, sx: { mr: 2 }, children: "\u062D\u0641\u0638" }), _jsx(Button, { color: "inherit", startIcon: _jsx(Cancel, {}), onClick: handleCancel, disabled: loading, children: "\u0625\u0644\u063A\u0627\u0621" })] })) : (_jsxs(Box, { children: [_jsx(Button, { startIcon: _jsx(Edit, {}), onClick: () => setEditMode(true), sx: { mr: 2 }, children: "\u062A\u0639\u062F\u064A\u0644" }), _jsx(Button, { color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, disabled: loading, children: "\u062D\u0630\u0641" })] }))] }), _jsxs(Box, { display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4, children: [_jsxs(Box, { flex: { xs: "1 1 100%", md: "0 0 30%" }, textAlign: "center", children: [_jsx(Avatar, { src: previewImage, alt: form.name, sx: { width: 200, height: 200, mx: 'auto', mb: 2 } }), editMode && (_jsx("label", { children: _jsxs(Button, { variant: "contained", component: "span", disabled: loading, children: ["\u062A\u062D\u0645\u064A\u0644 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }) }))] }), _jsxs(Box, { flex: { xs: "1 1 100%", md: "1 1 70%" }, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u062E\u062F\u0645\u0629", name: "name", value: form.name, onChange: handleChange, margin: "normal", disabled: !editMode || loading }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0648\u0635\u0641", name: "description", value: form.description, onChange: handleChange, margin: "normal", multiline: true, rows: 4, disabled: !editMode || loading })] })] }), _jsx(Divider, { sx: { my: 4 } }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), _jsx(Box, { sx: { pl: 2 }, children: category.doctorNames?.length ? (category.doctorNames.map((doc, index) => (_jsxs(Typography, { children: ["\u2022 ", doc] }, index)))) : (_jsx(Typography, { color: "textSecondary", children: "\u0644\u0627 \u064A\u0648\u062C\u062F \u0623\u0637\u0628\u0627\u0621 \u0645\u062E\u0635\u0635\u0648\u0646." })) }), _jsx(Typography, { variant: "h6", sx: { mt: 3 }, gutterBottom: true, children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(Box, { sx: { pl: 2 }, children: category.branches?.length ? (category.branches.map((branch, index) => (_jsxs(Typography, { children: ["\u2022 ", branch] }, index)))) : (_jsx(Typography, { color: "textSecondary", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0641\u0631\u0648\u0639 \u0645\u062E\u0635\u0635\u0629." })) })] }) }), _jsx(SubservicesPage, {})] }));
};
export default CategorySinglePage;
