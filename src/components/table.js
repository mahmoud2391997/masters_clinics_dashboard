import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Box } from '@mui/material';
const defaultFormFields = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'الاسم' },
    { name: 'email', label: 'البريد الإلكتروني' },
];
const defaultData = [
    { id: 1, name: 'أحمد', email: 'ahmed@example.com', region_id: 1 },
    { id: 2, name: 'سارة', email: 'sara@example.com', region_id: 2 },
    { id: 3, name: 'محمد', email: 'mohamed@example.com', region_id: 1 },
];
const DataTable = ({ formFields = defaultFormFields, data = defaultData, onDelete, onView }) => {
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    // Extract all unique region_ids from data
    const regionOptions = useMemo(() => {
        const unique = Array.from(new Set((data || []).map(d => d.region_id).filter(Boolean)));
        return unique;
    }, [data]);
    const filteredData = useMemo(() => {
        return (data || []).filter(row => {
            const matchesSearch = Object.values(row).some(val => typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase()));
            const matchesRegion = regionFilter === 'all' || row.region_id?.toString() === regionFilter.toString();
            return matchesSearch && matchesRegion;
        });
    }, [search, regionFilter, data]);
    return (_jsxs("div", { dir: "rtl p-10", children: [_jsxs(Box, { display: "flex", gap: 2, mb: 2, children: [_jsx(TextField, { label: "\u0628\u062D\u062B", variant: "outlined", size: "small", value: search, onChange: (e) => setSearch(e.target.value), fullWidth: true }), _jsxs(TextField, { label: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629", select: true, size: "small", value: regionFilter, onChange: (e) => setRegionFilter(e.target.value), style: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), regionOptions.map(regionId => (_jsxs(MenuItem, { value: regionId, children: ["\u0627\u0644\u0645\u0646\u0637\u0642\u0629 ", regionId] }, regionId)))] })] }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [formFields.map((field) => (_jsx(TableCell, { style: { fontWeight: 'bold', textAlign: 'right' }, children: field.label || field.name }, field.name))), (onDelete || onView) && (_jsx(TableCell, { align: "center", style: { fontWeight: 'bold' }, children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }))] }) }), _jsx(TableBody, { children: filteredData.length > 0 ? (filteredData.map((row, rowIndex) => (_jsxs(TableRow, { hover: true, children: [formFields.map((field) => (_jsx(TableCell, { style: { textAlign: 'right' }, children: row[field.name] || '-' }, `${rowIndex}-${field.name}`))), (onDelete || onView) && (_jsxs(TableCell, { align: "center", children: [onView && (_jsx("button", { onClick: () => onView(row), children: "\u0639\u0631\u0636" })), onDelete && (_jsx("button", { onClick: () => onDelete(row.id), children: "\u062D\u0630\u0641" }))] }))] }, rowIndex)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 1, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u062A\u0627\u062D\u0629" }) })) })] }) })] }));
};
export default DataTable;
