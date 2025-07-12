import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, Typography, CardMedia, IconButton, Button, Checkbox, FormControlLabel, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress, Snackbar, Alert, Tooltip, Box, Divider, CircularProgress } from "@mui/material";
import { Delete, Edit, Close, Save, Cancel, CloudUpload, Business } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});
const CardStats = ({ department, branches, onUpdateSuccess, onDeleteSuccess }) => {
    const parseBranchIds = (branchIds) => {
        if (!branchIds)
            return [];
        if (Array.isArray(branchIds))
            return branchIds;
        if (typeof branchIds === 'string') {
            try {
                return JSON.parse(branchIds) || [];
            }
            catch {
                return [];
            }
        }
        return [];
    };
    const initialBranchIds = parseBranchIds(department.branch_ids);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(department.name);
    const [description, setDescription] = useState(department.description);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [selectedBranchIds, setSelectedBranchIds] = useState(initialBranchIds);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [imageLoading, setImageLoading] = useState(true);
    useEffect(() => {
        setSelectedBranchIds(parseBranchIds(department.branch_ids));
    }, [editing, department.branch_ids]);
    const handleDelete = async () => {
        if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا القسم؟"))
            return;
        setDeleting(true);
        try {
            await axios.delete(`https://www.ss.mastersclinics.com/departments/${department.id}`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
            });
            onDeleteSuccess();
            setSuccess("تم حذف القسم بنجاح");
        }
        catch (error) {
            console.error("خطأ في حذف القسم:", error);
            setError("فشل في حذف القسم");
        }
        finally {
            setDeleting(false);
        }
    };
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            if (imageFile) {
                formData.append("image", imageFile);
            }
            formData.append("branch_ids", JSON.stringify(selectedBranchIds));
            await axios.put(`https://www.ss.mastersclinics.com/departments/${department.id}`, formData, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
            });
            onUpdateSuccess();
            setEditing(false);
            setSuccess("تم تحديث القسم بنجاح");
            setPreviewImage(null);
        }
        catch (error) {
            console.error("خطأ في تحديث القسم:", error);
            setError("فشل في تحديث القسم");
        }
        finally {
            setUpdating(false);
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match('image.*')) {
                setError('يرجى اختيار ملف صورة (JPEG، PNG، إلخ)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('يجب ألا يزيد حجم الصورة عن 5 ميجابايت');
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setPreviewImage(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemoveImage = () => {
        setImageFile(null);
        setPreviewImage(null);
    };
    const getBranchName = (id) => {
        return branches.find(b => b.id === id)?.name || id.toString();
    };
    const currentBranchIds = parseBranchIds(department.branch_ids);
    return (_jsxs(_Fragment, { children: [_jsxs(Card, { className: "shadow-md rounded-xl hover:shadow-lg transition-shadow duration-300", children: [department.image ? (_jsxs(Box, { position: "relative", children: [imageLoading && (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: "180px", children: _jsx(CircularProgress, {}) })), _jsx(CardMedia, { component: "img", height: "180", image: `https://www.ss.mastersclinics.com${department.image}`, alt: department.name, className: "object-cover", onLoad: () => setImageLoading(false), style: { display: imageLoading ? 'none' : 'block' } })] })) : (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", height: "180px", bgcolor: "action.hover", children: _jsx(Avatar, { sx: { width: 60, height: 60 }, children: _jsx(Business, { fontSize: "large" }) }) })), _jsx(CardHeader, { title: _jsx(Typography, { variant: "h6", fontWeight: "bold", children: department.name }), subheader: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, mt: 0.5, children: [_jsx(Business, { fontSize: "small", color: "action" }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [currentBranchIds.length, " \u0641\u0631\u0648\u0639"] })] }), action: _jsxs("div", { children: [_jsx(Tooltip, { title: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0642\u0633\u0645", children: _jsx(IconButton, { onClick: () => setEditing(true), color: "primary", children: _jsx(Edit, {}) }) }), _jsx(Tooltip, { title: "\u062D\u0630\u0641 \u0627\u0644\u0642\u0633\u0645", children: _jsx(IconButton, { onClick: handleDelete, color: "error", children: deleting ? _jsx(CircularProgress, { size: 24, color: "error" }) : _jsx(Delete, {}) }) })] }) }), _jsxs(CardContent, { children: [_jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: department.description }), _jsx(Divider, { sx: { my: 2 } }), _jsx("div", { className: "flex flex-wrap gap-2", children: currentBranchIds.length ? (currentBranchIds.map(id => (_jsx(Chip, { label: getBranchName(id), size: "small", variant: "outlined", color: "primary" }, id)))) : (_jsx(Typography, { variant: "caption", color: "text.disabled", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0641\u0631\u0648\u0639 \u0645\u062D\u062F\u062F\u0629" })) })] })] }), _jsxs(Dialog, { open: editing, onClose: () => { setEditing(false); setPreviewImage(null); }, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "h6", children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0642\u0633\u0645" }), _jsx(IconButton, { onClick: () => setEditing(false), children: _jsx(Close, {}) })] }) }), _jsxs("form", { onSubmit: handleUpdate, children: [_jsxs(DialogContent, { dividers: true, children: [updating && _jsx(LinearProgress, {}), _jsxs(Box, { mb: 3, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645", value: name, onChange: (e) => setName(e.target.value), margin: "normal", required: true, variant: "outlined" }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0648\u0635\u0641", value: description, onChange: (e) => setDescription(e.target.value), margin: "normal", multiline: true, rows: 4, variant: "outlined" })] }), _jsxs(Box, { mb: 3, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0642\u0633\u0645" }), _jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(CloudUpload, {}), fullWidth: true, sx: { mb: 2 }, children: ["\u0631\u0641\u0639 \u0635\u0648\u0631\u0629 \u062C\u062F\u064A\u062F\u0629", _jsx(VisuallyHiddenInput, { type: "file", accept: "image/*", onChange: handleImageChange })] }), (previewImage || department.image) && (_jsxs(Box, { mt: 2, textAlign: "center", position: "relative", children: [_jsx("img", { src: previewImage || `https://www.ss.mastersclinics.com${department.image}`, alt: "Preview", style: { maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' } }), _jsx(IconButton, { onClick: handleRemoveImage, color: "error", sx: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }, children: _jsx(Delete, { fontSize: "small" }) })] }))] }), _jsxs(Box, { mb: 2, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u062A\u0639\u064A\u064A\u0646 \u0644\u0644\u0641\u0631\u0648\u0639" }), _jsx(Box, { sx: { maxHeight: 200, overflow: 'auto', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }, children: branches.map((branch) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: selectedBranchIds.includes(branch.id), onChange: () => { setSelectedBranchIds((prev) => prev.includes(branch.id) ? prev.filter((id) => id !== branch.id) : [...prev, branch.id]); } }), label: branch.name, sx: { display: 'block', mr: 0 } }, branch.id))) })] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => { setEditing(false); setPreviewImage(null); }, startIcon: _jsx(Cancel, {}), disabled: updating, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { type: "submit", variant: "contained", color: "primary", startIcon: _jsx(Save, {}), disabled: updating, children: updating ? _jsx(CircularProgress, { size: 24 }) : 'حفظ التغييرات' })] })] })] }), _jsx(Snackbar, { open: !!error, autoHideDuration: 6000, onClose: () => setError(null), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: _jsx(Alert, { severity: "error", onClose: () => setError(null), children: error }) }), _jsx(Snackbar, { open: !!success, autoHideDuration: 6000, onClose: () => setSuccess(null), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: _jsx(Alert, { severity: "success", onClose: () => setSuccess(null), children: success }) })] }));
};
export default CardStats;
