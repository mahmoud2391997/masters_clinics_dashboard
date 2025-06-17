import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import axios from "axios";
import CardStats from "./card";
import DeleteIcon from '@mui/icons-material/Delete';
const DepartmentsStatsGrid = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');
    const [newDeptImage, setNewDeptImage] = useState('');
    const [adding, setAdding] = useState(false);
    const [newDeptImageFile, setNewDeptImageFile] = useState(null);
    const handleAddDepartment = async (e) => {
        if (e)
            e.preventDefault();
        if (!newDeptName.trim())
            return;
        setAdding(true);
        try {
            const formData = new FormData();
            formData.append('name', newDeptName);
            formData.append('description', newDeptDesc);
            if (newDeptImageFile) {
                formData.append('image', newDeptImageFile);
            }
            else if (newDeptImage) {
                formData.append('image', newDeptImage);
            }
            const res = await axios.post("http://localhost:3000/departments", formData, {
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
                }
            });
            setDepartments((prev) => [...prev, res.data]);
            setNewDeptName("");
            setNewDeptDesc("");
            setNewDeptImage("");
            setNewDeptImageFile(null);
            setShowAddModal(false);
        }
        catch (error) {
            console.error("Error adding department:", error);
        }
        finally {
            setAdding(false);
        }
    };
    useEffect(() => {
        fetchDepartments();
    }, []);
    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:3000/departments", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
                }
            });
            setDepartments(res.data);
        }
        catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
        finally {
            setLoading(false);
        }
    };
    const handleConfirmDelete = async () => {
        if (!departmentToDelete)
            return;
        setDeleting(true);
        try {
            setDepartments(prev => prev.filter(dept => dept._id !== departmentToDelete));
            setDeleteConfirmOpen(false);
        }
        catch (error) {
            console.error("Error deleting department:", error);
        }
        finally {
            setDeleting(false);
            setDepartmentToDelete(null);
        }
    };
    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setDepartmentToDelete(null);
    };
    if (loading) {
        return null;
    }
    const filteredDepartments = departments.filter((department) => department.name.toLowerCase().includes(search.toLowerCase()));
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "p-5 flex gap-4 items-center", children: [_jsx(TextField, { label: "\u0628\u062D\u062B \u0639\u0646 \u0627\u0644\u0623\u0642\u0633\u0627\u0645", variant: "outlined", fullWidth: true, value: search, onChange: (e) => setSearch(e.target.value) }), _jsx(Button, { variant: "contained", color: "primary", onClick: () => setShowAddModal(true), children: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0645" })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5", children: filteredDepartments.map((department) => (_jsx(CardStats, { department: department, onDeleteSuccess: () => {
                        // This will refresh the list after deletion
                        fetchDepartments();
                    }, onUpdateSuccess: () => {
                        // This will refresh the list after update
                        fetchDepartments();
                    } }, department._id))) }), showAddModal && (_jsx("div", { className: "fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0645 \u062C\u062F\u064A\u062F" }), _jsx("button", { onClick: () => {
                                        setShowAddModal(false);
                                        setNewDeptName('');
                                        setNewDeptDesc('');
                                        setNewDeptImage('');
                                    }, className: "text-gray-500 hover:text-gray-700 transition", "aria-label": "\u0625\u063A\u0644\u0627\u0642", children: _jsx("span", { className: "text-xl", children: "\u00D7" }) })] }), _jsxs("form", { onSubmit: handleAddDepartment, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "\u0627\u0633\u0645 \u0627\u0644\u0642\u0633\u0645" }), _jsx("input", { type: "text", value: newDeptName, onChange: (e) => setNewDeptName(e.target.value), placeholder: "\u0645\u062B\u0627\u0644: \u0627\u0644\u0642\u0644\u0628", className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "\u0627\u0644\u0648\u0635\u0641" }), _jsx("textarea", { value: newDeptDesc, onChange: (e) => setNewDeptDesc(e.target.value), placeholder: "\u0623\u062F\u062E\u0644 \u0648\u0635\u0641\u064B\u0627 \u0644\u0644\u0642\u0633\u0645", rows: 3, className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0642\u0633\u0645" }), _jsx("input", { type: "file", accept: "image/*", onChange: (e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setNewDeptImageFile(file);
                                                    setNewDeptImage(URL.createObjectURL(file));
                                                }
                                            }, className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("p", { className: "text-sm text-gray-500 mt-1", children: "\u0623\u0648" }), _jsx("input", { type: "text", value: newDeptImage, onChange: (e) => {
                                                setNewDeptImage(e.target.value);
                                                setNewDeptImageFile(null);
                                            }, placeholder: "\u0623\u062F\u062E\u0644 \u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", className: "w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), newDeptImage && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-gray-600 text-sm mb-1", children: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0635\u0648\u0631\u0629:" }), _jsx("img", { src: newDeptImage, alt: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0635\u0648\u0631\u0629 \u0627\u0644\u0642\u0633\u0645", className: "w-full max-h-24 max-w-24 object-contain border rounded shadow-sm" })] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => {
                                                setShowAddModal(false);
                                                setNewDeptName('');
                                                setNewDeptDesc('');
                                                setNewDeptImage('');
                                            }, className: "px-4 py-2 text-gray-600 hover:text-gray-800", disabled: adding, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400", disabled: adding, children: adding ? 'جاري الإضافة...' : 'إضافة' })] })] })] }) })), _jsxs(Dialog, { open: deleteConfirmOpen, onClose: handleCancelDelete, children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0623\u0646\u0643 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645\u061F" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCancelDelete, color: "primary", disabled: deleting, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleConfirmDelete, color: "error", startIcon: _jsx(DeleteIcon, {}), disabled: deleting, children: deleting ? 'جاري الحذف...' : 'حذف' })] })] })] }));
};
export default DepartmentsStatsGrid;
