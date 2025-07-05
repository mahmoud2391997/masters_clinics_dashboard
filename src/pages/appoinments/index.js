import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from 'react';
import { Box, TextField, MenuItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Typography, IconButton, ListItemSecondaryAction, Chip, Tooltip, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateAppointments, deleteAppointment } from '../../api/landingPages';
const statusColors = {
    'لم يتم التواصل': 'warning',
    'استفسار': 'info',
    'مهتم': 'success',
    'غير مهتم': 'error',
    'تم الحجز': 'success',
    'تم التواصل علي الواتس اب': 'success',
    'لم يتم الرد': 'warning',
    'طلب التواصل في وقت اخر': 'info',
};
const statusOptions = [
    'لم يتم التواصل',
    'استفسار',
    'مهتم',
    'غير مهتم',
    'تم الحجز',
    'تم التواصل علي الواتس اب',
    'لم يتم الرد',
    'طلب التواصل في وقت اخر',
];
const DataTable = ({ formFields = defaultFormFields, data = defaultData, userRole = 'customercare' }) => {
    const [state, setState] = useState({
        search: '',
        branchFilter: 'all',
        loading: false,
        error: null,
        fetchedData: data,
        selectedAppointment: null,
        callLogDialogOpen: false,
        newCallLogStatus: '',
        newCallLogNotes: '',
        editingLogId: null,
        editedLogStatus: '',
        editedLogNotes: '',
        deleteConfirmOpen: false,
        appointmentToDelete: null,
    });
    const { search, branchFilter, loading, error, fetchedData, selectedAppointment, callLogDialogOpen, newCallLogStatus, newCallLogNotes, editingLogId, editedLogStatus, editedLogNotes, deleteConfirmOpen, appointmentToDelete, } = state;
    // Use passed userRole or fallback to sessionStorage role
    const role = userRole || (sessionStorage.getItem("role") ?? 'customercare');
    const username = sessionStorage.getItem("username") || 'غير معروف';
    const fetchWithToken = async (url, options = {}) => {
        const token = sessionStorage.getItem('token');
        return fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json',
            },
        });
    };
    useEffect(() => {
        const fetchData = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            try {
                const response = await fetchWithToken('https://www.ss.mastersclinics.com/appointments');
                if (!response.ok)
                    throw new Error('Network error');
                const data = await response.json();
                console.log('Fetched appointments:', data);
                setState(prev => ({ ...prev, fetchedData: data, loading: false }));
            }
            catch (err) {
                setState(prev => ({ ...prev, error: 'فشل في تحميل البيانات', loading: false }));
            }
        };
        fetchData();
    }, []);
    const branchOptions = useMemo(() => {
        const branches = (fetchedData || []).map(d => d.branch).filter(Boolean);
        return Array.from(new Set(branches));
    }, [fetchedData]);
    const deepSearch = (obj, searchTerm) => {
        if (!obj)
            return false;
        return Object.values(obj).some(val => {
            if (typeof val === 'object' && val !== null)
                return deepSearch(val, searchTerm);
            const stringValue = String(val ?? '').toLowerCase();
            return stringValue.includes(searchTerm.toLowerCase());
        });
    };
    const getLastCallStatus = (appointment) => {
        if (!appointment.callLogs || appointment.callLogs.length === 0) {
            return null;
        }
        const sortedLogs = [...appointment.callLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sortedLogs[0];
    };
    const filteredData = useMemo(() => {
        if (!fetchedData)
            return [];
        return fetchedData
            .filter(row => {
            const matchesBranch = branchFilter === 'all' || row.branch === branchFilter;
            const matchesSearch = search.trim() ? deepSearch(row, search) : true;
            return matchesBranch && matchesSearch;
        })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [search, branchFilter, fetchedData]);
    const handleChange = (field) => (e) => {
        setState(prev => ({ ...prev, [field]: e.target.value }));
    };
    const openCallLogDialog = (appointment) => {
        setState(prev => ({
            ...prev,
            selectedAppointment: appointment,
            callLogDialogOpen: true,
            newCallLogStatus: '',
            newCallLogNotes: '',
            editingLogId: null,
            editedLogStatus: '',
            editedLogNotes: ''
        }));
    };
    const closeCallLogDialog = () => {
        setState(prev => ({
            ...prev,
            callLogDialogOpen: false,
            selectedAppointment: null,
            editingLogId: null
        }));
    };
    const addNewCallLog = async () => {
        if (!selectedAppointment || !newCallLogStatus || !statusOptions.includes(newCallLogStatus))
            return;
        try {
            const newLog = {
                timestamp: new Date().toISOString(),
                status: newCallLogStatus,
                notes: newCallLogNotes,
                agentName: username || 'غير معروف'
            };
            const updatedLogs = [...(selectedAppointment.callLogs || []), newLog];
            await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });
            const refreshed = await fetchWithToken('https://www.ss.mastersclinics.com/appointments');
            const data = await refreshed.json();
            setState(prev => ({
                ...prev,
                fetchedData: data,
                newCallLogStatus: '',
                newCallLogNotes: ''
            }));
        }
        catch (err) {
            console.error('Failed to add call log:', err);
        }
    };
    const startEditingLog = (log) => {
        setState(prev => ({
            ...prev,
            editingLogId: log.id ?? null, // استخدم null وليس undefined
            editedLogStatus: log.status,
            editedLogNotes: log.notes || ''
        }));
    };
    const cancelEditing = () => {
        setState(prev => ({
            ...prev,
            editingLogId: null,
            editedLogStatus: '',
            editedLogNotes: ''
        }));
    };
    const saveEditedLog = async () => {
        if (!selectedAppointment || !editingLogId)
            return;
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).map(log => log.id === editingLogId
                ? {
                    ...log,
                    status: editedLogStatus,
                    notes: editedLogNotes,
                    timestamp: new Date().toISOString(),
                    editedBy: username
                }
                : log);
            await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });
            const refreshed = await fetchWithToken('https://www.ss.mastersclinics.com/appointments');
            const data = await refreshed.json();
            setState(prev => ({
                ...prev,
                fetchedData: data,
                editingLogId: null,
                editedLogStatus: '',
                editedLogNotes: ''
            }));
        }
        catch (err) {
            console.error('Failed to save edited call log:', err);
        }
    };
    const deleteCallLog = async (logId) => {
        if (!selectedAppointment)
            return;
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).filter(log => log.id !== logId);
            await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });
            const refreshed = await fetchWithToken('https://www.ss.mastersclinics.com/appointments');
            const data = await refreshed.json();
            setState(prev => ({
                ...prev,
                fetchedData: data,
            }));
        }
        catch (err) {
            console.error('Failed to delete call log:', err);
        }
    };
    const openDeleteConfirm = (appointmentId) => {
        setState(prev => ({
            ...prev,
            deleteConfirmOpen: true,
            appointmentToDelete: appointmentId
        }));
    };
    const closeDeleteConfirm = () => {
        setState(prev => ({
            ...prev,
            deleteConfirmOpen: false,
            appointmentToDelete: null
        }));
    };
    const confirmDeleteAppointment = async () => {
        if (!appointmentToDelete)
            return;
        try {
            await deleteAppointment(appointmentToDelete);
            const refreshed = await fetchWithToken('https://www.ss.mastersclinics.com/appointments');
            const data = await refreshed.json();
            setState(prev => ({
                ...prev,
                fetchedData: data,
                deleteConfirmOpen: false,
                appointmentToDelete: null
            }));
        }
        catch (err) {
            console.error('Failed to delete appointment:', err);
            setState(prev => ({
                ...prev,
                error: 'فشل في حذف الموعد',
                deleteConfirmOpen: false,
                appointmentToDelete: null
            }));
        }
    };
    // Custom render for doctor_offer column
    const renderDoctorOffer = (row) => {
        return (_jsxs(Box, { sx: { display: 'flex', flexDirection: 'column', gap: 0.5 }, children: [row.doctor && (_jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0637\u0628\u064A\u0628: ", row.doctor] })), row.offer && (_jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0639\u0631\u0636: ", row.offer] })), !row.doctor && !row.offer && '-'] }));
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Box, { sx: { mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }, children: [_jsx(TextField, { label: "\u0628\u062D\u062B", value: search, onChange: handleChange('search'), sx: { minWidth: 200 } }), _jsxs(TextField, { select: true, label: "\u0641\u0631\u0639", value: branchFilter, onChange: handleChange('branchFilter'), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), branchOptions.map(branch => (_jsx(MenuItem, { value: branch, children: branch }, branch)))] })] }), _jsx(TableContainer, { component: Paper, sx: { maxHeight: 500 }, children: _jsxs(Table, { stickyHeader: true, size: "small", "aria-label": "appointments table", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [formFields.map(field => (_jsx(TableCell, { align: "left", children: field.label }, field.key))), _jsx(TableCell, { children: "\u0622\u062E\u0631 \u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" }), role === 'mediabuyer' && _jsx(TableCell, { children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsxs(TableBody, { children: [loading && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 3, align: "center", children: "... \u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644" }) })), error && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 3, align: "center", sx: { color: 'red' }, children: error }) })), !loading && filteredData.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: formFields.length + 3, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }) })), filteredData.map(row => {
                                    const lastCall = getLastCallStatus(row);
                                    return (_jsxs(TableRow, { hover: true, children: [formFields.map(field => (_jsx(TableCell, { children: field.key === 'createdAt'
                                                    ? new Date(row[field.key]).toLocaleString('ar-EG')
                                                    : field.key === 'doctor_offer'
                                                        ? renderDoctorOffer(row)
                                                        : (row[field.key] ?? '-') }, field.key))), _jsx(TableCell, { children: lastCall ? (_jsx(Tooltip, { title: `${new Date(lastCall.timestamp).toLocaleString('ar-EG')} - ${lastCall.agentName}`, children: _jsx(Chip, { label: lastCall.status, color: statusColors[lastCall.status] || 'default', size: "small", variant: "outlined" }) })) : (_jsx(Chip, { label: "\u0644\u0627 \u064A\u0648\u062C\u062F", color: "default", size: "small", variant: "outlined" })) }), _jsx(TableCell, { children: _jsxs(Button, { variant: "outlined", size: "small", onClick: () => openCallLogDialog(row), sx: { mr: 1 }, children: ["\u0639\u0631\u0636 (", (row.callLogs?.length) || 0, ")"] }) }), role === 'mediabuyer' && (_jsx(TableCell, { children: _jsx(Button, { variant: "outlined", color: "error", size: "small", onClick: () => openDeleteConfirm(row.id), startIcon: _jsx(DeleteIcon, { fontSize: "small" }), children: "\u062D\u0630\u0641 \u0627\u0644\u0645\u0648\u0639\u062F" }) }))] }, row.id));
                                })] })] }) }), _jsxs(Dialog, { open: callLogDialogOpen, onClose: closeCallLogDialog, maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "h6", children: ["\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644: ", selectedAppointment?.name, " - ", selectedAppointment?.phone] }), _jsxs(Box, { sx: { mt: 1 }, children: [selectedAppointment?.doctor && (_jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0637\u0628\u064A\u0628: ", selectedAppointment.doctor] })), selectedAppointment?.offer && (_jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0639\u0631\u0636: ", selectedAppointment.offer] }))] })] }), _jsx(IconButton, { "aria-label": "close", onClick: closeCallLogDialog, sx: { position: 'absolute', left: 8, top: 8 }, children: _jsx(CloseIcon, {}) })] }), _jsxs(DialogContent, { dividers: true, children: [_jsx(List, { dense: true, children: (selectedAppointment?.callLogs || []).map(log => (_jsx(ListItem, { alignItems: "flex-start", divider: true, children: editingLogId === log.id ? (_jsxs(Box, { sx: { width: '100%' }, children: [_jsx(TextField, { select: true, label: "\u0627\u0644\u062D\u0627\u0644\u0629", value: editedLogStatus, onChange: e => setState(prev => ({ ...prev, editedLogStatus: e.target.value })), fullWidth: true, margin: "dense", size: "small", children: statusOptions.map(status => (_jsx(MenuItem, { value: status, children: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Chip, { label: status, color: statusColors[status] || 'default', size: "small", sx: { mr: 1 } }), status] }) }, status))) }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: editedLogNotes, onChange: e => setState(prev => ({ ...prev, editedLogNotes: e.target.value })), fullWidth: true, multiline: true, rows: 2, margin: "dense", size: "small" }), _jsxs(Box, { sx: { mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }, children: [_jsx(Button, { onClick: cancelEditing, size: "small", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { variant: "contained", onClick: saveEditedLog, size: "small", children: "\u062D\u0641\u0638" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(ListItemText, { primary: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Chip, { label: log.status, color: statusColors[log.status] || 'default', size: "small" }), log.editedBy && (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["(\u062A\u0645 \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0628\u0648\u0627\u0633\u0637\u0629: ", log.editedBy, ")"] }))] }), secondary: _jsxs(_Fragment, { children: [_jsx(Typography, { component: "span", variant: "body2", color: "text.primary", children: log.notes || 'لا توجد ملاحظات' }), _jsx("br", {}), _jsxs(Typography, { component: "span", variant: "caption", color: "text.secondary", children: [new Date(log.timestamp).toLocaleString('ar-EG'), " - \u0627\u0644\u0648\u0643\u064A\u0644: ", log.agentName || 'غير معروف'] })] }) }), (role === 'customercare' || role === 'admin') && (_jsxs(ListItemSecondaryAction, { children: [_jsx(Tooltip, { title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(IconButton, { edge: "end", "aria-label": "edit", onClick: () => startEditingLog(log), size: "small", children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u062D\u0630\u0641", children: _jsx(IconButton, { edge: "end", "aria-label": "delete", onClick: () => log.id && deleteCallLog(log.id), size: "small", children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }))] })) }, log.id))) }), (role === 'customercare' || role === 'admin') && (_jsxs(Box, { sx: { mt: 2, borderTop: '1px solid #eee', pt: 2 }, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0625\u0636\u0627\u0641\u0629 \u0633\u062C\u0644 \u062C\u062F\u064A\u062F" }), _jsx(TextField, { select: true, label: "\u0627\u0644\u062D\u0627\u0644\u0629", value: newCallLogStatus, onChange: handleChange('newCallLogStatus'), fullWidth: true, margin: "dense", size: "small", required: true, children: statusOptions.map(status => (_jsx(MenuItem, { value: status, children: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Chip, { label: status, color: statusColors[status] || 'default', size: "small", sx: { mr: 1 } }), status] }) }, status))) }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: newCallLogNotes, onChange: handleChange('newCallLogNotes'), fullWidth: true, multiline: true, rows: 2, margin: "dense", size: "small" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), sx: { mt: 1 }, onClick: addNewCallLog, disabled: !newCallLogStatus, size: "small", children: "\u0625\u0636\u0627\u0641\u0629 \u0633\u062C\u0644" })] }))] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: closeCallLogDialog, size: "small", children: "\u0625\u063A\u0644\u0627\u0642" }) })] }), _jsxs(Dialog, { open: deleteConfirmOpen, onClose: closeDeleteConfirm, children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Alert, { severity: "warning", children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0623\u0646\u0643 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062F\u061F \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646\u0647." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: closeDeleteConfirm, color: "primary", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: confirmDeleteAppointment, color: "error", variant: "contained", children: "\u062D\u0630\u0641" })] })] })] }));
};
const defaultFormFields = [
    { key: "name", label: "الاسم" },
    { key: "phone", label: "الهاتف" },
    { key: "branch", label: "الفرع" },
    { key: "doctor_offer", label: "الطبيب/العرض" },
    { key: "pageCreator", label: "منشئ الصفحة" },
    { key: "pageTitle", label: "عنوان الصفحة" },
    { key: "utmSource", label: "المصدر" },
    { key: "createdAt", label: "تاريخ الإنشاء" }
];
const defaultData = [];
export default DataTable;
