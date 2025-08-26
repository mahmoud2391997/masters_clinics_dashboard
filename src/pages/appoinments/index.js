"use client";
import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Box, TextField, MenuItem, TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, Typography, IconButton, ListItemSecondaryAction, Chip, Tooltip, Alert, Popover, Badge, } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PaidIcon from "@mui/icons-material/Paid";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ar } from "date-fns/locale";
// API functions
const updateAppointments = async (id, data) => {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`https://www.ss.mastersclinics.com/appointments/${id}`, {
            method: "PUT",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to update appointment");
        }
        return await response.json();
    }
    catch (error) {
        console.error("Error updating appointment:", error);
        throw error;
    }
};
const deleteAppointment = async (id) => {
    try {
        const token = sessionStorage.getItem("token");
        const response = await fetch(`https://www.ss.mastersclinics.com/appointments/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: token ? `Bearer ${token}` : "",
            },
        });
        if (!response.ok) {
            throw new Error("Failed to delete appointment");
        }
        return await response.json();
    }
    catch (error) {
        console.error("Error deleting appointment:", error);
        throw error;
    }
};
const statusColors = {
    "لم يتم التواصل": "warning",
    استفسار: "info",
    مهتم: "success",
    "غير مهتم": "error",
    "تم الحجز": "success",
    "تم التواصل علي الواتس اب": "success",
    "لم يتم الرد": "warning",
    "طلب التواصل في وقت اخر": "info",
};
const paymentStatusColors = {
    paid: "success",
    pending: "warning",
    unpaid: "error",
};
const statusOptions = [
    "لم يتم التواصل",
    "استفسار",
    "مهتم",
    "غير مهتم",
    "تم الحجز",
    "تم التواصل علي الواتس اب",
    "لم يتم الرد",
    "طلب التواصل في وقت اخر",
];
const defaultFormFields = [
    { key: "name", label: "الاسم" },
    { key: "phone", label: "الهاتف" },
    { key: "branch", label: "الفرع" },
    { key: "doctor_offer", label: "الطبيب/العرض" },
    { key: "pageCreator", label: "منشئ الصفحة" },
    { key: "pageTitle", label: "عنوان الصفحة" },
    { key: "utmSource", label: "المصدر" },
    { key: "createdAt", label: "تاريخ الإنشاء" },
];
const defaultData = [];
const DataTable = ({ formFields = defaultFormFields, data = defaultData, userRole = "customercare", }) => {
    const [state, setState] = useState({
        search: "",
        branchFilter: "all",
        paymentFilter: "all",
        authFilter: "all",
        loading: false,
        error: null,
        fetchedData: data,
        selectedAppointment: null,
        callLogDialogOpen: false,
        newCallLogStatus: "",
        newCallLogNotes: "",
        editingLogId: null,
        editedLogStatus: "",
        editedLogNotes: "",
        deleteConfirmOpen: false,
        appointmentToDelete: null,
        currentPage: 1,
        totalPages: 1,
        scheduleAnchorEl: null,
        schedulingAppointment: null,
        newScheduledDateTime: null,
        isScheduling: false,
    });
    const { search, branchFilter, paymentFilter, authFilter, loading, error, fetchedData, selectedAppointment, callLogDialogOpen, newCallLogStatus, newCallLogNotes, editingLogId, editedLogStatus, editedLogNotes, deleteConfirmOpen, appointmentToDelete, currentPage, totalPages, scheduleAnchorEl, schedulingAppointment, newScheduledDateTime, isScheduling, } = state;
    const role = userRole || (sessionStorage.getItem("role") ?? "customercare");
    const username = sessionStorage.getItem("username") || "غير معروف";
    const fetchWithToken = async (url, options = {}) => {
        const token = sessionStorage.getItem("token");
        return fetch(url, {
            ...options,
            headers: {
                ...(options.headers || {}),
                Authorization: token ? `Bearer ${token}` : "",
                "Content-Type": "application/json",
            },
        });
    };
    // Utility functions for datetime handling
    const formatDateTimeForMySQL = (datetime) => {
        if (!datetime)
            return "";
        const year = datetime.getFullYear();
        const month = String(datetime.getMonth() + 1).padStart(2, "0");
        const day = String(datetime.getDate()).padStart(2, "0");
        const hours = String(datetime.getHours()).padStart(2, "0");
        const minutes = String(datetime.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:00`;
    };
    const formatDisplayDateTime = (mysqlDateTime) => {
        if (!mysqlDateTime)
            return "-";
        try {
            const [datePart, timePart] = mysqlDateTime.split(" ");
            if (!datePart || !timePart)
                return mysqlDateTime;
            const [year, month, day] = datePart.split("-").map(Number);
            const [hours, minutes, seconds = 0] = timePart.split(":").map(Number);
            const date = new Date(year, month - 1, day, hours, minutes, seconds);
            if (isNaN(date.getTime())) {
                console.error("Invalid date for display:", mysqlDateTime);
                return mysqlDateTime;
            }
            return date.toLocaleString("ar-EG", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });
        }
        catch (error) {
            console.error("Error formatting display date:", error, mysqlDateTime);
            return mysqlDateTime;
        }
    };
    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetchWithToken(`https://www.ss.mastersclinics.com/appointments?page=${currentPage}`);
            if (!response.ok)
                throw new Error("Network error");
            const data = await response.json();
            setState((prev) => ({
                ...prev,
                fetchedData: data.appointments || [],
                totalPages: data.totalPages || 1,
                loading: false,
            }));
        }
        catch (err) {
            setState((prev) => ({ ...prev, error: "فشل في تحميل البيانات", loading: false }));
        }
    }, [currentPage]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    const branchOptions = useMemo(() => {
        const branches = (fetchedData || []).map((d) => d.branch).filter(Boolean);
        return Array.from(new Set(branches));
    }, [fetchedData]);
    const hasUtmSource = useMemo(() => {
        return fetchedData.some((row) => !!row.utmSource);
    }, [fetchedData]);
    const visibleFormFields = useMemo(() => {
        if (role === "customercare" && !hasUtmSource) {
            return formFields.filter((field) => field.key !== "utmSource");
        }
        return formFields;
    }, [formFields, role, hasUtmSource]);
    const deepSearch = (obj, searchTerm) => {
        if (!obj)
            return false;
        return Object.values(obj).some((val) => {
            if (typeof val === "object" && val !== null)
                return deepSearch(val, searchTerm);
            const stringValue = String(val ?? "").toLowerCase();
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
            .filter((row) => {
            const matchesBranch = branchFilter === "all" || row.branch === branchFilter;
            const matchesPayment = paymentFilter === "all" || row.payment_status === paymentFilter;
            const matchesAuth = authFilter === "all" ||
                (authFilter === "authed" && row.is_authed === 1) ||
                (authFilter === "notAuthed" && row.is_authed === 0);
            const matchesSearch = search.trim() ? deepSearch(row, search) : true;
            return matchesBranch && matchesPayment && matchesAuth && matchesSearch;
        })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [search, branchFilter, paymentFilter, authFilter, fetchedData]);
    const handleChange = (field) => (e) => {
        setState((prev) => ({ ...prev, [field]: e.target.value }));
    };
    const openCallLogDialog = (appointment) => {
        setState((prev) => ({
            ...prev,
            selectedAppointment: appointment,
            callLogDialogOpen: true,
            newCallLogStatus: "",
            newCallLogNotes: "",
            editingLogId: null,
            editedLogStatus: "",
            editedLogNotes: "",
        }));
    };
    const closeCallLogDialog = () => {
        setState((prev) => ({
            ...prev,
            callLogDialogOpen: false,
            selectedAppointment: null,
            editingLogId: null,
        }));
    };
    const openSchedulePopup = (event, appointment) => {
        let initialDate = new Date();
        if (appointment.scheduledAt) {
            const [datePart, timePart] = appointment.scheduledAt.split(" ");
            if (datePart && timePart) {
                const [year, month, day] = datePart.split("-");
                const [hours, minutes] = timePart.split(":");
                initialDate = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day), Number.parseInt(hours), Number.parseInt(minutes));
            }
        }
        setState((prev) => ({
            ...prev,
            scheduleAnchorEl: event.currentTarget,
            schedulingAppointment: appointment,
            newScheduledDateTime: initialDate,
        }));
    };
    const closeSchedulePopup = () => {
        setState((prev) => ({
            ...prev,
            scheduleAnchorEl: null,
            schedulingAppointment: null,
            newScheduledDateTime: null,
            isScheduling: false,
        }));
    };
    const scheduleAppointment = useCallback(async () => {
        if (!schedulingAppointment || !newScheduledDateTime)
            return;
        setState((prev) => ({ ...prev, isScheduling: true, error: null }));
        try {
            const mysqlDateTime = formatDateTimeForMySQL(newScheduledDateTime);
            const schedulingLog = {
                id: Math.random().toString(36).slice(2),
                timestamp: new Date().toISOString(),
                status: "تم الحجز",
                notes: `تم تحديد موعد الحجز: ${formatDisplayDateTime(mysqlDateTime)}`,
                agentName: username || "غير معروف",
            };
            const updatedLogs = [...(schedulingAppointment.callLogs || []), schedulingLog];
            await updateAppointments(schedulingAppointment.id, {
                scheduledAt: mysqlDateTime,
                callLogs: updatedLogs,
            });
            await fetchData();
            closeSchedulePopup();
        }
        catch (err) {
            console.error("[ERROR] Scheduling failed:", err);
            setState((prev) => ({
                ...prev,
                error: err.message || "فشل في تحديد الموعد",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, isScheduling: false }));
        }
    }, [schedulingAppointment, newScheduledDateTime, username, fetchData]);
    const unscheduleAppointment = useCallback(async () => {
        if (!schedulingAppointment)
            return;
        setState((prev) => ({ ...prev, isScheduling: true, error: null }));
        try {
            const unschedulingLog = {
                id: Math.random().toString(36).slice(2),
                timestamp: new Date().toISOString(),
                status: "تم إلغاء الحجز",
                notes: "تم إلغاء موعد الحجز",
                agentName: username || "غير معروف",
            };
            const updatedLogs = [...(schedulingAppointment.callLogs || []), unschedulingLog];
            await updateAppointments(schedulingAppointment.id, {
                scheduledAt: null,
                callLogs: updatedLogs,
            });
            await fetchData();
            closeSchedulePopup();
        }
        catch (err) {
            setState((prev) => ({
                ...prev,
                error: err.message || "فشل في إلغاء الموعد",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, isScheduling: false }));
        }
    }, [schedulingAppointment, username, fetchData]);
    const addNewCallLog = useCallback(async () => {
        if (!selectedAppointment || !newCallLogStatus || !statusOptions.includes(newCallLogStatus))
            return;
        try {
            const newLog = {
                timestamp: new Date().toISOString(),
                status: newCallLogStatus,
                notes: newCallLogNotes,
                agentName: username || "غير معروف",
            };
            const updatedLogs = [...(selectedAppointment.callLogs || []), newLog];
            await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });
            await fetchData();
            setState((prev) => ({
                ...prev,
                newCallLogStatus: "",
                newCallLogNotes: "",
            }));
        }
        catch (err) {
            console.error("Failed to add call log:", err);
            setState((prev) => ({
                ...prev,
                error: "فشل في إضافة سجل الاتصال",
            }));
        }
    }, [selectedAppointment, newCallLogStatus, newCallLogNotes, username, fetchData]);
    const startEditingLog = (log) => {
        setState((prev) => ({
            ...prev,
            editingLogId: log.id ?? null,
            editedLogStatus: log.status,
            editedLogNotes: log.notes || "",
        }));
    };
    const cancelEditing = () => {
        setState((prev) => ({
            ...prev,
            editingLogId: null,
            editedLogStatus: "",
            editedLogNotes: "",
        }));
    };
    const saveEditedLog = async () => {
        if (!selectedAppointment || !editingLogId)
            return;
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).map((log) => log.id === editingLogId
                ? {
                    ...log,
                    status: editedLogStatus,
                    notes: editedLogNotes,
                    timestamp: new Date().toISOString(),
                    editedBy: username,
                }
                : log);
            await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });
            await fetchData();
            setState((prev) => ({
                ...prev,
                editingLogId: null,
                editedLogStatus: "",
                editedLogNotes: "",
            }));
        }
        catch (err) {
            console.error("Failed to save edited call log:", err);
            setState((prev) => ({
                ...prev,
                error: "فشل في حفظ التعديلات",
            }));
        }
    };
    const deleteCallLog = async (logId) => {
        if (!selectedAppointment)
            return;
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).filter((log) => log.id !== logId);
            await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });
            await fetchData();
        }
        catch (err) {
            console.error("Failed to delete call log:", err);
            setState((prev) => ({
                ...prev,
                error: "فشل في حذف سجل الاتصال",
            }));
        }
    };
    const openDeleteConfirm = (appointmentId) => {
        setState((prev) => ({
            ...prev,
            deleteConfirmOpen: true,
            appointmentToDelete: appointmentId,
        }));
    };
    const closeDeleteConfirm = () => {
        setState((prev) => ({
            ...prev,
            deleteConfirmOpen: false,
            appointmentToDelete: null,
        }));
    };
    const confirmDeleteAppointment = async () => {
        if (!appointmentToDelete)
            return;
        try {
            await deleteAppointment(appointmentToDelete);
            await fetchData();
            closeDeleteConfirm();
        }
        catch (err) {
            console.error("Failed to delete appointment:", err);
            setState((prev) => ({
                ...prev,
                error: "فشل في حذف الموعد",
                deleteConfirmOpen: false,
                appointmentToDelete: null,
            }));
        }
    };
    const renderDoctorOffer = (row) => (_jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 0.5 }, children: [row.doctor && _jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0637\u0628\u064A\u0628: ", row.doctor] }), row.offer && _jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0639\u0631\u0636: ", row.offer] }), !row.doctor && !row.offer && "-"] }));
    const renderScheduledAt = (scheduledAt) => {
        if (!scheduledAt)
            return "-";
        return formatDisplayDateTime(scheduledAt);
    };
    const isScheduleOpen = Boolean(scheduleAnchorEl);
    const scheduleId = isScheduleOpen ? "schedule-popover" : undefined;
    const handleScheduleClick = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isScheduling && newScheduledDateTime) {
            scheduleAppointment();
        }
    }, [isScheduling, newScheduledDateTime, scheduleAppointment]);
    const handleUnscheduleClick = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!isScheduling) {
            unscheduleAppointment();
        }
    }, [isScheduling, unscheduleAppointment]);
    const handlePaginationClick = useCallback((direction) => (event) => {
        event.preventDefault();
        event.stopPropagation();
        setState((prev) => ({
            ...prev,
            currentPage: direction === "prev" ? prev.currentPage - 1 : prev.currentPage + 1,
        }));
    }, [setState]);
    const handleAddCallLogClick = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
        if (newCallLogStatus) {
            addNewCallLog();
        }
    }, [newCallLogStatus, addNewCallLog]);
    return (_jsxs("div", { className: "p-2", children: [error && (_jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setState((prev) => ({ ...prev, error: null })), children: error })), _jsxs(Box, { sx: { mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }, children: [_jsx(TextField, { label: "\u0628\u062D\u062B", value: search, onChange: handleChange("search"), sx: { minWidth: 200 } }), _jsxs(TextField, { select: true, label: "\u0641\u0631\u0639", value: branchFilter, onChange: handleChange("branchFilter"), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), branchOptions.map((branch) => (_jsx(MenuItem, { value: branch, children: branch }, branch)))] }), _jsxs(TextField, { select: true, label: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639", value: paymentFilter, onChange: handleChange("paymentFilter"), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), _jsx(MenuItem, { value: "paid", children: "\u0645\u062F\u0641\u0648\u0639" }), _jsx(MenuItem, { value: "pending", children: "\u0642\u064A\u062F \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631" }), _jsx(MenuItem, { value: "unpaid", children: "\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639" })] }), _jsxs(TextField, { select: true, label: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0648\u062B\u064A\u0642", value: authFilter, onChange: handleChange("authFilter"), sx: { minWidth: 150 }, children: [_jsx(MenuItem, { value: "all", children: "\u0627\u0644\u0643\u0644" }), _jsx(MenuItem, { value: "authed", children: "\u0645\u0648\u062B\u0648\u0642" }), _jsx(MenuItem, { value: "notAuthed", children: "\u063A\u064A\u0631 \u0645\u0648\u062B\u0648\u0642" })] })] }), _jsx(TableContainer, { component: Paper, sx: { maxHeight: 500 }, children: _jsxs(Table, { stickyHeader: true, size: "small", "aria-label": "appointments table", children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [visibleFormFields.map((field) => (_jsx(TableCell, { align: "left", children: field.label }, field.key))), _jsx(TableCell, { children: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639" }), _jsx(TableCell, { children: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062A\u0648\u062B\u064A\u0642" }), _jsx(TableCell, { children: "\u0645\u0648\u0639\u062F \u0627\u0644\u062D\u062C\u0632" }), _jsx(TableCell, { children: "\u0622\u062E\u0631 \u062D\u0627\u0644\u0629" }), _jsx(TableCell, { children: "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" }), _jsx(TableCell, { children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsxs(TableBody, { children: [loading && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: visibleFormFields.length + 6, align: "center", children: "... \u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644" }) })), !loading && filteredData.length === 0 && (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: visibleFormFields.length + 6, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }) })), filteredData.map((row) => {
                                    const lastCall = getLastCallStatus(row);
                                    return (_jsxs(TableRow, { hover: true, children: [visibleFormFields.map((field) => (_jsx(TableCell, { children: field.key === "createdAt"
                                                    ? new Date(row[field.key]).toLocaleString("ar-EG", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                    : field.key === "doctor_offer"
                                                        ? renderDoctorOffer(row)
                                                        : (row[field.key] ?? "-") }, field.key))), _jsx(TableCell, { children: _jsx(Chip, { label: row.payment_status === "paid" ? "مدفوع" : row.payment_status === "pending" ? "قيد الانتظار" : "غير مدفوع", color: paymentStatusColors[row.payment_status] || "default", size: "small", icon: row.payment_status === "paid" ? _jsx(PaidIcon, {}) : undefined }) }), _jsx(TableCell, { children: _jsx(Box, { sx: { display: "flex", alignItems: "center" }, children: _jsx(Tooltip, { title: row.is_authed === 1 ? "موثوق" : "غير موثوق", children: _jsx(Badge, { color: row.is_authed === 1 ? "success" : "error", badgeContent: row.is_authed === 1 ? "✓" : "✗", children: _jsx(VerifiedUserIcon, { color: row.is_authed === 1 ? "success" : "disabled" }) }) }) }) }), _jsx(TableCell, { children: _jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [_jsx("span", { children: renderScheduledAt(row.scheduledAt) }), (role !== "mediabuyer" && row.is_authed === 1) && (_jsx(IconButton, { size: "small", onClick: (e) => openSchedulePopup(e, row), color: row.scheduledAt ? "primary" : "default", children: _jsx(ScheduleIcon, { fontSize: "small" }) }))] }) }), _jsx(TableCell, { children: lastCall ? (_jsx(Tooltip, { title: `${new Date(lastCall.timestamp).toLocaleString("ar-EG", {
                                                        year: "numeric",
                                                        month: "2-digit",
                                                        day: "2-digit",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })} - ${lastCall.agentName}`, children: _jsx(Chip, { label: lastCall.status, color: statusColors[lastCall.status] || "default", size: "small", variant: "outlined" }) })) : (_jsx(Chip, { label: "\u0644\u0627 \u064A\u0648\u062C\u062F", color: "default", size: "small", variant: "outlined" })) }), _jsx(TableCell, { children: _jsxs(Button, { variant: "outlined", size: "small", onClick: () => openCallLogDialog(row), sx: { mr: 1 }, children: ["\u0639\u0631\u0636 (", row.callLogs?.length || 0, ")"] }) }), _jsx(TableCell, { children: role === "mediabuyer" && (_jsx(Button, { variant: "outlined", color: "error", size: "small", onClick: () => openDeleteConfirm(row.id), startIcon: _jsx(DeleteIcon, { fontSize: "small" }), children: "\u062D\u0630\u0641" })) })] }, row.id));
                                })] })] }) }), _jsx(Popover, { id: scheduleId, open: isScheduleOpen, anchorEl: scheduleAnchorEl, onClose: closeSchedulePopup, anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                }, transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                }, children: _jsxs(Box, { sx: { p: 2, minWidth: 350 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u062D\u062C\u0632" }), _jsxs(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: [schedulingAppointment?.name, " - ", schedulingAppointment?.phone] }), _jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, adapterLocale: ar, children: _jsx(DateTimePicker, { label: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u0645\u0648\u0639\u062F", value: newScheduledDateTime, onChange: (newValue) => {
                                    setState((prev) => ({ ...prev, newScheduledDateTime: newValue }));
                                }, ampm: true, format: "dd/MM/yyyy hh:mm a", slotProps: {
                                    textField: {
                                        fullWidth: true,
                                        margin: "normal",
                                        dir: "rtl",
                                    },
                                } }) }), _jsxs(Box, { sx: { mt: 2, display: "flex", gap: 1, justifyContent: "space-between" }, children: [schedulingAppointment?.scheduledAt && (_jsx(Button, { variant: "outlined", color: "error", onClick: handleUnscheduleClick, disabled: isScheduling, children: "\u0625\u0644\u063A\u0627\u0621 \u0627\u0644\u0645\u0648\u0639\u062F" })), _jsxs(Box, { sx: { display: "flex", gap: 1 }, children: [_jsx(Button, { onClick: closeSchedulePopup, disabled: isScheduling, children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { variant: "contained", onClick: handleScheduleClick, disabled: isScheduling || !newScheduledDateTime, children: isScheduling ? "جاري الحفظ..." : "حفظ الموعد" })] })] })] }) }), _jsxs(Box, { sx: { mt: 2, display: "flex", justifyContent: "center", gap: 1 }, children: [_jsx(Button, { variant: "outlined", disabled: currentPage === 1, onClick: handlePaginationClick("prev"), size: "small", children: "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629" }), _jsxs(Typography, { variant: "body2", sx: { alignSelf: "center" }, children: ["\u0627\u0644\u0635\u0641\u062D\u0629 ", currentPage, " \u0645\u0646 ", totalPages] }), _jsx(Button, { variant: "outlined", disabled: currentPage === totalPages, onClick: handlePaginationClick("next"), size: "small", children: "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629" })] }), _jsxs(Dialog, { open: callLogDialogOpen, onClose: closeCallLogDialog, maxWidth: "sm", fullWidth: true, children: [_jsxs(DialogTitle, { children: [_jsxs(Box, { children: [_jsxs(Typography, { variant: "h6", children: ["\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644: ", selectedAppointment?.name, " - ", selectedAppointment?.phone] }), _jsxs(Box, { sx: { mt: 1 }, children: [selectedAppointment?.doctor && (_jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0637\u0628\u064A\u0628: ", selectedAppointment.doctor] })), selectedAppointment?.offer && (_jsxs(Typography, { variant: "body2", children: ["\u0627\u0644\u0639\u0631\u0636: ", selectedAppointment.offer] })), selectedAppointment?.scheduledAt && (_jsxs(Typography, { variant: "body2", color: "primary", children: ["\u0645\u0648\u0639\u062F \u0627\u0644\u062D\u062C\u0632: ", formatDisplayDateTime(selectedAppointment.scheduledAt)] })), _jsxs(Box, { sx: { display: "flex", gap: 1, mt: 1 }, children: [_jsx(Chip, { label: selectedAppointment?.payment_status === "paid" ? "مدفوع" : selectedAppointment?.payment_status === "pending" ? "قيد الانتظار" : "غير مدفوع", color: paymentStatusColors[selectedAppointment?.payment_status || "unpaid"] || "default", size: "small" }), _jsx(Chip, { label: selectedAppointment?.is_authed === 1 ? "موثوق" : "غير موثوق", color: selectedAppointment?.is_authed === 1 ? "success" : "error", size: "small" })] })] })] }), _jsx(IconButton, { "aria-label": "close", onClick: closeCallLogDialog, sx: { position: "absolute", left: 8, top: 8 }, children: _jsx(CloseIcon, {}) })] }), _jsxs(DialogContent, { dividers: true, children: [_jsx(List, { dense: true, children: (selectedAppointment?.callLogs || []).map((log) => (_jsx(ListItem, { alignItems: "flex-start", divider: true, children: editingLogId === log.id ? (_jsxs(Box, { sx: { width: "100%" }, children: [_jsx(TextField, { select: true, label: "\u0627\u0644\u062D\u0627\u0644\u0629", value: editedLogStatus, onChange: (e) => setState((prev) => ({ ...prev, editedLogStatus: e.target.value })), fullWidth: true, margin: "dense", size: "small", children: statusOptions.map((status) => (_jsx(MenuItem, { value: status, children: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Chip, { label: status, color: statusColors[status] || "default", size: "small", sx: { mr: 1 } }), status] }) }, status))) }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: editedLogNotes, onChange: (e) => setState((prev) => ({ ...prev, editedLogNotes: e.target.value })), fullWidth: true, multiline: true, rows: 2, margin: "dense", size: "small" }), _jsxs(Box, { sx: { mt: 1, display: "flex", gap: 1, justifyContent: "flex-end" }, children: [_jsx(Button, { onClick: cancelEditing, size: "small", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { variant: "contained", onClick: saveEditedLog, size: "small", children: "\u062D\u0641\u0638" })] })] })) : (_jsxs(_Fragment, { children: [_jsx(ListItemText, { primary: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Chip, { label: log.status, color: statusColors[log.status] || "default", size: "small" }), log.editedBy && (_jsxs(Typography, { variant: "caption", color: "text.secondary", children: ["(\u062A\u0645 \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0628\u0648\u0627\u0633\u0637\u0629: ", log.editedBy, ")"] }))] }), secondary: _jsxs(_Fragment, { children: [_jsx(Typography, { component: "span", variant: "body2", color: "text.primary", children: log.notes || "لا توجد ملاحظات" }), _jsx("br", {}), _jsxs(Typography, { component: "span", variant: "caption", color: "text.secondary", children: [new Date(log.timestamp).toLocaleString("ar-EG", {
                                                                    year: "numeric",
                                                                    month: "2-digit",
                                                                    day: "2-digit",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }), " ", "- \u0627\u0644\u0648\u0643\u064A\u0644: ", log.agentName || "غير معروف"] })] }) }), (role === "customercare" || role === "admin") && (_jsxs(ListItemSecondaryAction, { children: [_jsx(Tooltip, { title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(IconButton, { edge: "end", "aria-label": "edit", onClick: () => startEditingLog(log), size: "small", children: _jsx(EditIcon, { fontSize: "small" }) }) }), _jsx(Tooltip, { title: "\u062D\u0630\u0641", children: _jsx(IconButton, { edge: "end", "aria-label": "delete", onClick: () => log.id && deleteCallLog(log.id), size: "small", children: _jsx(DeleteIcon, { fontSize: "small" }) }) })] }))] })) }, log.id))) }), (role === "customercare" || role === "admin") && (_jsxs(Box, { sx: { mt: 2, borderTop: "1px solid #eee", pt: 2 }, children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0625\u0636\u0627\u0641\u0629 \u0633\u062C\u0644 \u062C\u062F\u064A\u062F" }), _jsx(TextField, { select: true, label: "\u0627\u0644\u062D\u0627\u0644\u0629", value: newCallLogStatus, onChange: handleChange("newCallLogStatus"), fullWidth: true, margin: "dense", size: "small", required: true, children: statusOptions.map((status) => (_jsx(MenuItem, { value: status, children: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Chip, { label: status, color: statusColors[status] || "default", size: "small", sx: { mr: 1 } }), status] }) }, status))) }), _jsx(TextField, { label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", value: newCallLogNotes, onChange: handleChange("newCallLogNotes"), fullWidth: true, multiline: true, rows: 2, margin: "dense", size: "small" }), _jsx(Button, { variant: "contained", startIcon: _jsx(AddIcon, {}), sx: { mt: 1 }, onClick: handleAddCallLogClick, disabled: !newCallLogStatus, size: "small", children: "\u0625\u0636\u0627\u0641\u0629 \u0633\u062C\u0644" })] }))] }), _jsx(DialogActions, { children: _jsx(Button, { onClick: closeCallLogDialog, size: "small", children: "\u0625\u063A\u0644\u0627\u0642" }) })] }), _jsxs(Dialog, { open: deleteConfirmOpen, onClose: closeDeleteConfirm, children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Alert, { severity: "warning", children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0623\u0646\u0643 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062F\u061F \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646\u0647." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: closeDeleteConfirm, color: "primary", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: confirmDeleteAppointment, color: "error", variant: "contained", children: "\u062D\u0630\u0641" })] })] })] }));
};
export default DataTable;
