import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { TextField, Button, Checkbox, FormControlLabel, CircularProgress, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Typography } from "@mui/material";
import axios from "axios";
import CardStats from "./card";
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Cancel, Close } from "@mui/icons-material";
import { Save } from "lucide-react";
const DepartmentsStatsGrid = () => {
    const [departments, setDepartments] = useState([]);
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');
    const [newDeptPriority, setNewDeptPriority] = useState(0);
    const [newDeptImageFile, setNewDeptImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedBranchIds, setSelectedBranchIds] = useState([]);
    const [adding, setAdding] = useState(false);
    useEffect(() => {
        fetchDepartments();
        fetchBranches();
    }, []);
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get("https://www.ss.mastersclinics.com/departments", {
                headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
            });
            console.log(res.data);
            const parsedDepartments = res.data.map((dept) => ({
                ...dept,
                branch_ids: typeof dept.branch_ids === "string" && dept.branch_ids !== ""
                    ? JSON.parse(dept.branch_ids)
                    : Array.isArray(dept.branch_ids)
                        ? dept.branch_ids
                        : [],
                priority: dept.priority ?? 0
            }));
            setDepartments(parsedDepartments.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)));
        }
        catch (error) {
            console.error("خطأ في جلب الأقسام:", error);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchBranches = async () => {
        try {
            const res = await axios.get("https://www.ss.mastersclinics.com/branches", {
                headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
            });
            setBranches(res.data);
        }
        catch (error) {
            console.error("خطأ في جلب الفروع:", error);
        }
    };
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('يرجى اختيار ملف صورة');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                return;
            }
            setNewDeptImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemoveImage = () => {
        setNewDeptImageFile(null);
        setImagePreview(null);
    };
    const handleAddDepartment = async (e) => {
        e.preventDefault();
        if (!newDeptName.trim())
            return;
        setAdding(true);
        try {
            const formData = new FormData();
            formData.append("name", newDeptName);
            formData.append("description", newDeptDesc);
            formData.append("priority", newDeptPriority.toString());
            if (newDeptImageFile) {
                formData.append("image", newDeptImageFile);
            }
            formData.append("branch_ids", JSON.stringify(selectedBranchIds));
            const res = await axios.post("https://www.ss.mastersclinics.com/departments", formData, {
                headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
            });
            setDepartments((prev) => [...prev, {
                    ...res.data,
                    branch_ids: typeof res.data.branch_ids === "string"
                        ? JSON.parse(res.data.branch_ids)
                        : res.data.branch_ids,
                    priority: res.data.priority ?? 0
                }].sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0)));
            resetModalFields();
            setShowAddModal(false);
        }
        catch (error) {
            console.error("خطأ في إضافة القسم:", error);
        }
        finally {
            setAdding(false);
        }
    };
    const resetModalFields = () => {
        setNewDeptName('');
        setNewDeptDesc('');
        setNewDeptPriority(0);
        setNewDeptImageFile(null);
        setImagePreview(null);
        setSelectedBranchIds([]);
    };
    const filteredDepartments = departments.filter((department) => department.name.toLowerCase().includes(search.toLowerCase()));
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", mt: 4, children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-5 flex gap-4 items-center", children: [_jsx(TextField, { label: "\u0628\u062D\u062B \u0639\u0646 \u0642\u0633\u0645", variant: "outlined", fullWidth: true, value: search, onChange: (e) => setSearch(e.target.value) }), _jsx(Button, { variant: "contained", color: "primary", onClick: () => setShowAddModal(true), startIcon: _jsx(AddPhotoAlternateIcon, {}), children: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0645" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5", children: filteredDepartments.map((department) => (_jsx(CardStats, { department: department, branches: branches, onUpdateSuccess: fetchDepartments, onDeleteSuccess: fetchDepartments }, department.id))) }), _jsxs(Dialog, { open: showAddModal, onClose: () => {
                    setShowAddModal(false);
                    resetModalFields();
                }, fullWidth: true, maxWidth: "sm", children: [_jsx(DialogTitle, { children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [_jsx(Typography, { variant: "h6", children: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0645 \u062C\u062F\u064A\u062F" }), _jsx(IconButton, { onClick: () => {
                                        setShowAddModal(false);
                                        resetModalFields();
                                    }, children: _jsx(Close, {}) })] }) }), _jsxs("form", { onSubmit: handleAddDepartment, children: [_jsxs(DialogContent, { dividers: true, children: [adding && _jsx(LinearProgress, {}), _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645", value: newDeptName, onChange: (e) => setNewDeptName(e.target.value), margin: "normal", required: true }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0648\u0635\u0641", value: newDeptDesc, onChange: (e) => setNewDeptDesc(e.target.value), margin: "normal", multiline: true, rows: 4 }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0623\u0648\u0644\u0648\u064A\u0629 \u0627\u0644\u0638\u0647\u0648\u0631", value: newDeptPriority, onChange: (e) => setNewDeptPriority(Number(e.target.value)), margin: "normal", inputProps: { min: 0 } }), _jsxs(Box, { mt: 3, children: [_jsx(Typography, { variant: "subtitle1", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0642\u0633\u0645" }), _jsxs(Button, { component: "label", variant: "outlined", startIcon: _jsx(CloudUploadIcon, {}), fullWidth: true, sx: { mb: 2 }, children: ["\u0631\u0641\u0639 \u0635\u0648\u0631\u0629", _jsx("input", { type: "file", hidden: true, accept: "image/*", onChange: handleImageChange })] }), imagePreview && (_jsxs(Box, { mt: 2, position: "relative", textAlign: "center", children: [_jsx("img", { src: imagePreview, alt: "\u0645\u0639\u0627\u064A\u0646\u0629", style: { maxHeight: '200px', maxWidth: '100%', borderRadius: 8, border: '1px solid #ccc' } }), _jsx(IconButton, { onClick: handleRemoveImage, color: "error", sx: {
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            backgroundColor: 'rgba(255,255,255,0.7)',
                                                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                                        }, children: _jsx(DeleteIcon, { fontSize: "small" }) })] }))] }), _jsxs(Box, { mt: 4, children: [_jsx(Typography, { variant: "subtitle1", children: "\u0631\u0628\u0637 \u0628\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(Box, { sx: {
                                                    maxHeight: 200,
                                                    overflowY: 'auto',
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1
                                                }, children: branches.map((branch) => (_jsx(FormControlLabel, { control: _jsx(Checkbox, { checked: selectedBranchIds.includes(branch.id), onChange: () => {
                                                            setSelectedBranchIds(prev => prev.includes(branch.id)
                                                                ? prev.filter(id => id !== branch.id)
                                                                : [...prev, branch.id]);
                                                        } }), label: branch.name, sx: { display: 'block', mr: 0 } }, branch.id))) })] })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => {
                                            setShowAddModal(false);
                                            resetModalFields();
                                        }, startIcon: _jsx(Cancel, {}), disabled: adding, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { type: "submit", variant: "contained", startIcon: _jsx(Save, {}), disabled: adding, children: adding ? _jsx(CircularProgress, { size: 24 }) : 'إضافة القسم' })] })] })] })] }));
};
export default DepartmentsStatsGrid;
