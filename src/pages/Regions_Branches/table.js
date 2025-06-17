import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteBranch } from '../../api/regions&branches';
const defaultFormFields = [
    { name: 'name', label: 'اسم الفرع' },
    { name: 'region', label: 'المنطقة' },
    { name: 'address', label: 'العنوان' },
    { name: 'working_hours', label: 'ساعات العمل' },
    { name: 'location_link', label: 'رابط الموقع' },
];
const DataTable = ({ formFields = defaultFormFields, regions = [], data = [], onDelete, onView, onDataChange, // Destructure the new prop
 }) => {
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const filteredData = useMemo(() => {
        return (data || []).filter(row => {
            const matchesSearch = Object.values(row).some(value => typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase()));
            const matchesRegion = regionFilter === 'all' || row.region_id?.toString() === regionFilter.toString();
            return matchesSearch && matchesRegion;
        });
    }, [search, regionFilter, data]);
    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setDeleteDialogOpen(true);
    };
    const handleConfirmDelete = async () => {
        if (!itemToDelete)
            return;
        setIsDeleting(true);
        try {
            // First try to use the onDelete prop if provided
            if (onDelete) {
                await onDelete(itemToDelete);
            }
            else {
                // Fallback to direct API call
                await deleteBranch(itemToDelete);
            }
            // Refresh data if callback provided
            if (onDataChange) {
                onDataChange();
            }
        }
        catch (error) {
            console.error('Error deleting branch:', error);
            // You might want to show an error message here
        }
        finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setItemToDelete(null);
        }
    };
    const handleCancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };
    return (_jsxs(Box, { dir: "rtl", className: "p-5", children: [_jsxs(Box, { display: "flex", gap: 2, mb: 2, children: [_jsx(TextField, { label: "\u0628\u062D\u062B", variant: "outlined", size: "small", fullWidth: true, value: search, onChange: e => setSearch(e.target.value) }), _jsxs(TextField, { label: "\u0627\u0644\u0645\u0646\u0637\u0642\u0629", variant: "outlined", select: true, size: "small", value: regionFilter, className: 'w-50', onChange: (e) => setRegionFilter(e.target.value), children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), regions.map((region) => (_jsx(MenuItem, { value: region.id, children: region.name }, region.id)))] })] }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [formFields.map(field => (_jsx(TableCell, { sx: { fontWeight: 'bold', textAlign: 'right' }, children: field.label || field.name }, field.name))), _jsx(TableCell, { align: "center", sx: { fontWeight: 'bold' }, children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: filteredData.length > 0 ? (filteredData.map((row, rowIndex) => (_jsxs(TableRow, { hover: true, children: [formFields.map(field => {
                                        let cellContent = row[field.name];
                                        // Handle region display
                                        if (field.name === 'region') {
                                            const region = regions.find(r => r.id === row.region_id);
                                            cellContent = region ? region.name : 'غير محدد';
                                        }
                                        // Handle working_hours display
                                        else if (field.name === 'working_hours' && Array.isArray(row[field.name])) {
                                            cellContent = row[field.name]
                                                .map((wh) => `${wh.days}: ${wh.time}`)
                                                .join(' | ');
                                        }
                                        // Handle object types generically
                                        else if (typeof cellContent === 'object' && cellContent !== null) {
                                            cellContent = Object.values(cellContent).join(' | ');
                                        }
                                        // Default fallback
                                        else {
                                            cellContent = cellContent ?? '-';
                                        }
                                        return (_jsx(TableCell, { sx: { textAlign: 'right' }, children: cellContent }, field.name));
                                    }), _jsxs(TableCell, { align: "center", children: [_jsx(Button, { variant: "outlined", size: "small", color: "primary", onClick: () => onView ? onView(row) : window.location.href = `/branches/${row.id || row._id}`, sx: { mx: 0.5 }, children: "\u0639\u0631\u0636" }), _jsx(Button, { variant: "outlined", size: "small", color: "error", startIcon: _jsx(DeleteIcon, {}), onClick: () => handleDeleteClick(row._id || row.id), sx: { mx: 0.5 }, disabled: isDeleting, children: "\u062D\u0630\u0641" })] })] }, row.id || row._id || rowIndex)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 1, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A \u0645\u062A\u0627\u062D\u0629" }) })) })] }) }), _jsxs(Dialog, { open: deleteDialogOpen, onClose: handleCancelDelete, children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0623\u0646\u0643 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0639\u0646\u0635\u0631\u061F" }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCancelDelete, color: "primary", disabled: isDeleting, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleConfirmDelete, color: "error", autoFocus: true, disabled: isDeleting, children: isDeleting ? 'جاري الحذف...' : 'حذف' })] })] })] }));
};
export default DataTable;
