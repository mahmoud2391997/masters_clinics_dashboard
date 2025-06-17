import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Box, Button, CircularProgress, Link } from '@mui/material';
// Update the formFields in the DataTable component:
const defaultFormFields = [
    { name: 'createdAt', label: 'تاريخ الإنشاء' },
    { name: 'creator', label: 'المنشئ' },
    { name: 'title', label: 'عنوان الصفحة' },
    { name: 'links', label: 'روابط الصفحات' },
    { name: 'actions', label: 'الاجراءات' }, // Add branches column
];
const DataTable = ({ formFields = defaultFormFields, data = [], loading = false, onDelete, onView, onEdit }) => {
    // State for filters and region selection
    const [filters, setFilters] = useState({});
    const [regionFilter] = useState('all');
    console.log(data);
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };
    const filteredData = useMemo(() => {
        return (data || []).filter(row => {
            const matchesFields = Object.entries(filters).every(([key, value]) => {
                if (key === 'createdAt') {
                    // No filter for createdAt
                    return true;
                }
                return row[key]?.toString().toLowerCase().includes(value.toLowerCase());
            });
            const matchesRegion = regionFilter === 'all' || row.region_id?.toString() === regionFilter.toString();
            return matchesFields && matchesRegion;
        });
    }, [filters, regionFilter, data]);
    return (_jsx("div", { dir: "rtl", children: _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [formFields.map((field) => (_jsx(TableCell, { style: { fontWeight: 'bold', textAlign: 'right' }, children: _jsxs(Box, { display: "flex", flexDirection: "column", children: [_jsx("span", { children: field.label || field.name }), field.name !== 'createdAt' && field.name !== 'links' && field.name !== 'actions' && (_jsx(TextField, { variant: "standard", size: "small", placeholder: `بحث`, value: filters[field.name] || '', onChange: (e) => handleFilterChange(field.name, e.target.value), inputProps: { style: { fontSize: '0.8rem' } } }))] }) }, field.name))), (onDelete || onView || onEdit) && (_jsx(TableCell, { align: "center", style: { fontWeight: 'bold' }, children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }))] }) }), _jsx(TableBody, { children: loading ? (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 1, align: "center", children: _jsx(CircularProgress, {}) }) })) : filteredData.length > 0 ? (filteredData.map((row, rowIndex) => (_jsxs(TableRow, { hover: true, children: [formFields.map((field) => (_jsx(TableCell, { style: { textAlign: 'right' }, children: field.name === 'actions' ? (_jsx(View, { id: row.id })) :
                                        field.name === 'createdAt' ? (
                                        // Show date and time in Arabic-Egypt locale
                                        new Date(row.createdAt).toLocaleString('ar-EG', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            hour12: true
                                        })) : field.name === 'links' && row.platforms ? (Object.entries(row.platforms)
                                            .filter(([_, enabled]) => enabled)
                                            .map(([platform]) => (_jsx("div", { children: _jsx(Link, { href: `https://www.mastersclinics.com/landingPage/${row.id}?utm_source=${platform}`, target: "_blank", rel: "noopener", children: platform }) }, platform)))) : (row[field.name] || '-') }, `${rowIndex}-${field.name}`))), (onDelete || onView || onEdit) && (_jsxs(TableCell, { align: "center", children: [onView && (_jsx(Button, { variant: "outlined", color: "primary", size: "small", onClick: () => onView(row), style: { marginLeft: 4 }, children: "\u0639\u0631\u0636" })), onEdit && (_jsx(Button, { variant: "outlined", color: "warning", size: "small", onClick: () => onEdit(row), style: { marginLeft: 4 }, children: "\u062A\u0639\u062F\u064A\u0644" })), onDelete && (_jsx(Button, { variant: "outlined", color: "error", size: "small", onClick: () => onDelete(row.id), children: "\u062D\u0630\u0641" }))] }))] }, rowIndex)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 1, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u062A\u0627\u062D\u0629" }) })) })] }) }) }));
};
export default DataTable;
import { useNavigate } from "react-router-dom";
const View = ({ id }) => {
    const navigate = useNavigate();
    const handleViewClick = () => {
        navigate(`/landingPage/${id}`);
    };
    return (_jsx(Button, { variant: "outlined", onClick: handleViewClick, children: "\u0639\u0631\u0636" }));
};
