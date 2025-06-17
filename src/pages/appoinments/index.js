import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useMemo } from 'react';
import { Box, TextField, MenuItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Typography, IconButton, ListItemSecondaryAction } from '@mui/material';
import { updateAppointments } from '../../api/landingPages';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LeadForm from './appointmentForm';
const DataTable = ({ formFields = defaultFormFields, data = defaultData, userRole }) => {
    const [addLead, setAddLead] = useState(false);
    const [role] = useState(sessionStorage.getItem("role"));
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
        editedLogNotes: ''
    });
    const { search, branchFilter, loading, error, fetchedData, selectedAppointment, callLogDialogOpen, newCallLogStatus, newCallLogNotes, editingLogId, editedLogStatus, editedLogNotes } = state;
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
                const response = await fetchWithToken('http://localhost:3000/appointments', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${sessionStorage.getItem('token') || ''}`
                    }
                });
                if (!response.ok)
                    throw new Error('Network error');
                const data = await response.json();
                setState(prev => ({ ...prev, fetchedData: data, loading: false }));
            }
            catch (err) {
                console.log(err);
                setState(prev => ({ ...prev, error: 'فشل في تحميل البيانات', loading: false }));
            }
        };
        fetchData();
    }, []);
    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const response = await fetchWithToken(`http://localhost:3000/appointments/${id}`, {
                    method: 'DELETE'
                });
                if (!response.ok)
                    throw new Error('Failed to delete appointment');
                setState(prev => ({
                    ...prev,
                    fetchedData: prev.fetchedData?.filter(item => item._id !== id && item.id !== id),
                    loading: false
                }));
            }
            catch (err) {
                console.error('Error deleting appointment:', err);
                setState(prev => ({ ...prev, error: 'فشل في حذف الحجز', loading: false }));
            }
        }
    };
    const branchOptions = useMemo(() => {
        const branches = (fetchedData || []).map(d => d.branch).filter(Boolean);
        return Array.from(new Set(branches));
    }, [fetchedData]);
    const deepSearch = (obj, searchTerm) => {
        if (!obj)
            return false;
        return Object.values(obj).some(val => {
            if (typeof val === 'object' && val !== null) {
                return deepSearch(val, searchTerm);
            }
            const stringValue = String(val ?? '').toLowerCase();
            return stringValue.includes(searchTerm.toLowerCase());
        });
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
            editingLogId: null
        }));
    };
    const closeCallLogDialog = () => {
        setState(prev => ({
            ...prev,
            callLogDialogOpen: false,
            selectedAppointment: null
        }));
    };
    const addNewCallLog = async () => {
        if (!selectedAppointment || !newCallLogStatus)
            return;
        try {
            const newLog = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                status: newCallLogStatus,
                notes: newCallLogNotes,
                agentName: sessionStorage.getItem('username') || 'Unknown'
            };
            const updatedLogs = [...(selectedAppointment.callLogs || []), newLog];
            await updateAppointments(selectedAppointment._id || selectedAppointment.id, {
                callLogs: updatedLogs
            });
            setState(prev => ({
                ...prev,
                fetchedData: prev.fetchedData?.map(item => item._id === selectedAppointment._id || item.id === selectedAppointment.id
                    ? { ...item, callLogs: updatedLogs }
                    : item),
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
            editingLogId: log.id,
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
                    timestamp: new Date().toISOString()
                }
                : log);
            await updateAppointments(selectedAppointment._id || selectedAppointment.id, {
                callLogs: updatedLogs
            });
            setState(prev => ({
                ...prev,
                fetchedData: prev.fetchedData?.map(item => item._id === selectedAppointment._id || item.id === selectedAppointment.id
                    ? { ...item, callLogs: updatedLogs }
                    : item),
                editingLogId: null
            }));
        }
        catch (err) {
            console.error('Failed to update call log:', err);
        }
    };
    const deleteCallLog = async (logId) => {
        if (!selectedAppointment)
            return;
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).filter(log => log.id !== logId);
            await updateAppointments(selectedAppointment._id || selectedAppointment.id, {
                callLogs: updatedLogs
            });
            setState(prev => ({
                ...prev,
                fetchedData: prev.fetchedData?.map(item => item._id === selectedAppointment._id || item.id === selectedAppointment.id
                    ? { ...item, callLogs: updatedLogs }
                    : item)
            }));
        }
        catch (err) {
            console.error('Failed to delete call log:', err);
        }
    };
    const getLatestStatus = (callLogs = []) => {
        if (callLogs.length === 0)
            return 'لم يتم التواصل';
        const sorted = [...callLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return sorted[0].status;
    };
    const renderCellValue = (row, field) => {
        if (field.name === 'clientStatus') {
            const latestStatus = getLatestStatus(row.callLogs);
            if (userRole === 'customercare' || userRole === 'admin') {
                return (_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(Typography, { variant: "body2", sx: { mr: 1 }, children: latestStatus }), _jsx(IconButton, { size: "small", onClick: () => openCallLogDialog(row), color: "primary", children: _jsx(AddIcon, { fontSize: "small" }) })] }));
            }
            else if (userRole === 'mediabuyer') {
                return latestStatus;
            }
        }
        if (field.name === 'createdAt') {
            return new Date(row.createdAt).toLocaleString('ar-EG');
        }
        if (field.name === 'doctorOffer') {
            const doctor = row.doctor || '';
            const offer = row.offer || '';
            return doctor && offer ? `${doctor} - ${offer}` : doctor || offer || '-';
        }
        return row[field.name] ?? '-';
    };
    const renderActions = (row) => (_jsx(TableCell, { align: "center", children: (userRole === 'admin' || userRole === 'mediabuyer') && (_jsx(Button, { variant: "outlined", color: "error", onClick: () => handleDelete(row._id || row.id), children: "\u062D\u0630\u0641" })) }));
    const displayedFields = formFields.filter(field => field.name !== 'isContacted');
    return (_jsxs("div", { dir: "rtl", className: "p-4", children: [addLead && _jsx(LeadForm, { setAddLead: setAddLead }), _jsxs(Box, { display: "flex", gap: 2, mb: 2, children: [_jsx(TextField, { label: "\u0628\u062D\u062B \u0634\u0627\u0645\u0644", variant: "outlined", size: "small", value: search, onChange: handleChange('search'), fullWidth: true, placeholder: "\u0627\u0628\u062D\u062B \u0641\u064A \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644..." }), _jsxs(TextField, { label: "\u0627\u0644\u0641\u0631\u0639", select: true, size: "small", value: branchFilter, onChange: handleChange('branchFilter'), style: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), branchOptions.map(branch => (_jsx(MenuItem, { value: branch, children: branch }, branch)))] }), _jsx(Button, { onClick: () => setAddLead(true), children: "\u0627\u0636\u0627\u0641\u0629 \u0637\u0644\u0628 \u062D\u062C\u0632" })] }), loading && _jsx(Box, { textAlign: "center", my: 2, children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." }), error && _jsx(Box, { textAlign: "center", color: "error.main", my: 2, children: error }), !loading && !error && (_jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [displayedFields.map(field => (_jsx(TableCell, { style: { fontWeight: 'bold', textAlign: 'right' }, children: field.label || field.name }, field.name))), role === "admin" || role === "mediabuyer" ?
                                        _jsx(TableCell, { align: "center", style: { fontWeight: 'bold' }, children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }) : null] }) }), _jsx(TableBody, { children: filteredData.length > 0 ? (filteredData.map(row => (_jsxs(TableRow, { hover: true, children: [displayedFields.map(field => (_jsx(TableCell, { style: { textAlign: 'right' }, children: renderCellValue(row, field) }, `${row.id}-${field.name}`))), renderActions(row)] }, row.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: displayedFields.length + 1, align: "center", children: search.trim()
                                        ? 'لا توجد نتائج مطابقة للبحث'
                                        : 'لا توجد بيانات متاحة' }) })) })] }) })), _jsxs(Dialog, { open: callLogDialogOpen, onClose: closeCallLogDialog, fullWidth: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: ["\u0633\u062C\u0644 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A - ", selectedAppointment?.name, _jsx(IconButton, { onClick: closeCallLogDialog, children: _jsx(CloseIcon, {}) })] }) }), _jsxs(DialogContent, { children: [_jsxs(Box, { mb: 3, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0643\u0627\u0644\u0645\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx(Box, { display: "flex", gap: 2, mb: 2, children: _jsxs(TextField, { select: true, label: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629", value: newCallLogStatus, onChange: (e) => setState(prev => ({ ...prev, newCallLogStatus: e.target.value })), fullWidth: true, size: "small", children: [_jsx(MenuItem, { value: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644" }), _jsx(MenuItem, { value: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631", children: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631" }), _jsx(MenuItem, { value: "\u0645\u0647\u062A\u0645", children: "\u0645\u0647\u062A\u0645" }), _jsx(MenuItem, { value: "\u063A\u064A\u0631 \u0645\u0647\u062A\u0645", children: "\u063A\u064A\u0631 \u0645\u0647\u062A\u0645" }), _jsx(MenuItem, { value: "\u062A\u0645 \u0627\u0644\u062D\u062C\u0632", children: "\u062A\u0645 \u0627\u0644\u062D\u062C\u0632" }), _jsx(MenuItem, { value: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0639\u0644\u064A \u0627\u0644\u0648\u0627\u062A\u0633 \u0627\u0628" }), _jsx(MenuItem, { value: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F" }), _jsx(MenuItem, { value: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0648\u0642\u062A \u0627\u062E\u0631", children: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0648\u0642\u062A \u0627\u062E\u0631" })] }) }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: newCallLogNotes, onChange: (e) => setState(prev => ({ ...prev, newCallLogNotes: e.target.value })), fullWidth: true, multiline: true, rows: 3, size: "small" }), _jsx(Box, { mt: 2, display: "flex", justifyContent: "flex-end", children: _jsx(Button, { variant: "contained", onClick: addNewCallLog, disabled: !newCallLogStatus, children: "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629" }) })] }), _jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0633\u062C\u0644 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0627\u062A \u0627\u0644\u0633\u0627\u0628\u0642\u0629" }), selectedAppointment?.callLogs?.length ? (_jsx(List, { children: [...selectedAppointment.callLogs]
                                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                    .map((log) => (_jsx(ListItem, { divider: true, children: editingLogId === log.id ? (_jsxs(Box, { width: "100%", children: [_jsx(Box, { display: "flex", gap: 2, mb: 2, children: _jsxs(TextField, { select: true, label: "\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0643\u0627\u0644\u0645\u0629", value: editedLogStatus, onChange: (e) => setState(prev => ({ ...prev, editedLogStatus: e.target.value })), fullWidth: true, size: "small", children: [_jsx(MenuItem, { value: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644" }), _jsx(MenuItem, { value: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631", children: "\u0627\u0633\u062A\u0641\u0633\u0627\u0631" }), _jsx(MenuItem, { value: "\u0645\u0647\u062A\u0645", children: "\u0645\u0647\u062A\u0645" }), _jsx(MenuItem, { value: "\u063A\u064A\u0631 \u0645\u0647\u062A\u0645", children: "\u063A\u064A\u0631 \u0645\u0647\u062A\u0645" }), _jsx(MenuItem, { value: "\u062A\u0645 \u0627\u0644\u062D\u062C\u0632", children: "\u062A\u0645 \u0627\u0644\u062D\u062C\u0632" }), _jsx(MenuItem, { value: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644", children: "\u062A\u0645 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0639\u0644\u064A \u0627\u0644\u0648\u0627\u062A\u0633 \u0627\u0628" }), _jsx(MenuItem, { value: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0631\u062F" }), _jsx(MenuItem, { value: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0648\u0642\u062A \u0627\u062E\u0631", children: "\u0637\u0644\u0628 \u0627\u0644\u062A\u0648\u0627\u0635\u0644 \u0641\u064A \u0648\u0642\u062A \u0627\u062E\u0631" })] }) }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: editedLogNotes, onChange: (e) => setState(prev => ({ ...prev, editedLogNotes: e.target.value })), fullWidth: true, multiline: true, rows: 3, size: "small" }), _jsxs(Box, { mt: 2, display: "flex", justifyContent: "flex-end", gap: 1, children: [_jsx(Button, { variant: "outlined", onClick: cancelEditing, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { variant: "contained", onClick: saveEditedLog, children: "\u062D\u0641\u0638" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(ListItemText, { primary: _jsxs(Box, { display: "flex", justifyContent: "space-between", children: [_jsx(Typography, { children: new Date(log.timestamp).toLocaleString('ar-EG') }), _jsx(Typography, { fontWeight: "bold", children: log.status })] }), secondary: _jsxs(_Fragment, { children: [_jsx(Typography, { component: "span", display: "block", children: log.notes }), _jsxs(Typography, { component: "span", variant: "caption", color: "text.secondary", children: ["\u0627\u0644\u0645\u0633\u0624\u0648\u0644: ", log.agentName || 'غير معروف'] })] }) }), _jsxs(ListItemSecondaryAction, { children: [_jsx(IconButton, { edge: "end", onClick: () => startEditingLog(log), color: "primary", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { edge: "end", onClick: () => deleteCallLog(log.id), color: "error", children: _jsx(DeleteIcon, {}) })] })] })) }, log.id))) })) : (_jsx(Typography, { variant: "body2", color: "text.secondary", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0643\u0627\u0644\u0645\u0627\u062A \u0645\u0633\u062C\u0644\u0629" }))] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: closeCallLogDialog, children: "\u0625\u063A\u0644\u0627\u0642" }) })] })] }));
};
const defaultFormFields = [
    { name: 'name', label: 'الاسم' },
    { name: 'phone', label: 'رقم الهاتف' },
    { name: 'branch', label: 'الفرع' },
    { name: 'doctorOffer', label: 'الطبيب/العرض' },
    { name: 'createdAt', label: 'تاريخ طلب الحجز' },
    { name: 'pageCreator', label: 'منشئ الصفحة' },
    { name: 'pageTitle', label: 'عنوان الصفحة' },
    { name: 'utmSource', label: 'المصدر' },
    { name: 'clientStatus', label: 'حالة العميل' }
];
const defaultData = [];
export default DataTable;
