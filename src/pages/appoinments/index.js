import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Calendar, Clock, Trash2, History, Plus, Edit, X, Search, StickyNote, ChevronLeft, ChevronRight, AlertTriangle, } from "lucide-react";
// Date utility functions
const formatDateTimeForMySQL = (date) => {
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};
const formatDisplayDateTime = (dateTime) => {
    if (!dateTime)
        return '-';
    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
    if (isNaN(date.getTime()))
        return '-';
    return date.toLocaleString('ar-EG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};
const createTimestamp = () => {
    return new Date().toISOString();
};
const getUserTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
};
const getTimezoneOffset = () => {
    const offset = -new Date().getTimezoneOffset();
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
// Parse scheduledAt from database
const parseScheduledAt = (scheduledAt) => {
    if (!scheduledAt)
        return null;
    if (typeof scheduledAt === 'string') {
        // Handle MySQL datetime format (YYYY-MM-DD HH:MM:SS)
        if (scheduledAt.includes(' ')) {
            const [datePart, timePart] = scheduledAt.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes, seconds] = timePart.split(':');
            // Create date in local timezone
            return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes), parseInt(seconds || '0'));
        }
        console.log("parsed ISO string", scheduledAt);
        // Try to parse ISO string
        const parsed = new Date(scheduledAt);
        if (!isNaN(parsed.getTime())) {
            parsed.setHours(parsed.getHours() + 1); // ✅ add one hour
            return parsed;
        }
    }
    if (scheduledAt instanceof Date) {
        return scheduledAt;
    }
    return null;
};
// Status options and colors
const appointmentStatusOptions = ["pending", "confirmed", "completed", "cancelled"];
const appointmentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-green-100 text-green-800 border-green-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",
};
const appointmentStatusLabels = {
    pending: "قيد الانتظار",
    confirmed: "مؤكد",
    completed: "مكتمل",
    cancelled: "أُلغيت",
};
const callLogStatusOptions = [
    'لم يتم التواصل',
    'استفسار',
    'مهتم',
    'غير مهتم',
    'تم الحجز',
    'تم التواصل علي الواتس اب',
    'لم يتم الرد',
    'طلب التواصل في وقت اخر',
];
const statusColors = {
    'لم يتم التواصل': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'استفسار': 'bg-blue-100 text-blue-800 border-blue-200',
    'مهتم': 'bg-green-100 text-green-800 border-green-200',
    'غير مهتم': 'bg-red-100 text-red-800 border-red-200',
    'تم الحجز': 'bg-green-100 text-green-800 border-green-200',
    'تم التواصل علي الواتس اب': 'bg-green-100 text-green-800 border-green-200',
    'لم يتم الرد': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'طلب التواصل في وقت اخر': 'bg-blue-100 text-blue-800 border-blue-200',
};
const paymentStatusColors = {
    "paid": "bg-green-100 text-green-800 border-green-200",
    "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "unpaid": "bg-red-100 text-red-800 border-red-200",
};
const defaultFormFields = [
    { key: "name", label: "الاسم" },
    { key: "phone", label: "الهاتف" },
    { key: "branch", label: "الفرع" },
    { key: "doctor_offer", label: "الخدمة" },
    { key: "pageCreator", label: "منشئ الصفحة" },
    { key: "pageTitle", label: "عنوان الصفحة" },
    { key: "utmSource", label: "المصدر" },
    { key: "createdAt", label: "تاريخ الإنشاء" },
];
const defaultData = [];
// API functions
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
const updateAppointments = async (id, data) => {
    console.log(`Updating appointment ${id} with data:`, data);
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
            throw new Error(errorData.error || "فشل في تحديث الموعد");
        }
        return await response.json();
    }
    catch (error) {
        console.error("Error updating appointment:", error);
        throw error;
    }
};
// Chip Component
const Chip = ({ label, className = "", size = 'small' }) => {
    const sizeClass = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
    return (_jsx("span", { className: `inline-flex items-center rounded-full border font-medium ${sizeClass} ${className}`, children: label }));
};
const CallLogManager = ({ open, onClose, appointment, onUpdateCallLogs, userRole, username, }) => {
    const [state, setState] = useState({
        searchTerm: "",
        statusFilter: "all",
        showFilters: false,
        loading: false,
        error: null,
    });
    const [addPopupOpen, setAddPopupOpen] = useState(false);
    const [editPopupOpen, setEditPopupOpen] = useState(false);
    const [mediabuyerNotesPopupOpen, setMediabuyerNotesPopupOpen] = useState(false);
    // Add New Log Form
    const [newCallLogStatus, setNewCallLogStatus] = useState("");
    const [newCallLogNotes, setNewCallLogNotes] = useState("");
    const [newSupportMemberName, setNewSupportMemberName] = useState("");
    const [newAdminNotes, setNewAdminNotes] = useState("");
    const [newMediabuyerNotes, setNewMediabuyerNotes] = useState("");
    // Edit Full Log
    const [editingLog, setEditingLog] = useState(null);
    const [editedStatus, setEditedStatus] = useState("");
    const [editedNotes, setEditedNotes] = useState("");
    const [editedSupportMemberName, setEditedSupportMemberName] = useState("");
    const [editedAdminNotes, setEditedAdminNotes] = useState("");
    const [editedMediabuyerName, setEditedMediabuyerName] = useState("");
    const [editedMediabuyerNotes, setEditedMediabuyerNotes] = useState("");
    // Media Buyer Notes Popup
    const [mediabuyerEditingLog, setMediabuyerEditingLog] = useState(null);
    const [mediabuyerNotes, setMediabuyerNotes] = useState("");
    const canEditLogs = userRole === "customercare" || userRole === "admin";
    const isAdmin = userRole === "admin";
    const isMediabuyer = userRole === "mediabuyer";
    // Filter & sort logs
    const processedLogs = useMemo(() => {
        if (!appointment?.callLogs)
            return [];
        return appointment.callLogs
            .filter((log) => {
            const term = state.searchTerm.toLowerCase();
            const matchesSearch = !term ||
                log.status.toLowerCase().includes(term) ||
                (log.notes || "").toLowerCase().includes(term) ||
                (log.support_member_name || "").toLowerCase().includes(term) ||
                (log.mediabuyer_name || "").toLowerCase().includes(term) ||
                (log.admin_notes || "").toLowerCase().includes(term) ||
                (log.mediabuyer_notes || "").toLowerCase().includes(term);
            const matchesStatus = state.statusFilter === "all" || log.status === state.statusFilter;
            return matchesSearch && matchesStatus;
        })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [appointment?.callLogs, state.searchTerm, state.statusFilter]);
    // Reset form states
    const resetAddForm = () => {
        setNewCallLogStatus("");
        setNewCallLogNotes("");
        setNewSupportMemberName("");
        setNewAdminNotes("");
        setNewMediabuyerNotes("");
    };
    const resetEditForm = () => {
        setEditingLog(null);
        setEditedStatus("");
        setEditedNotes("");
        setEditedSupportMemberName("");
        setEditedAdminNotes("");
        setEditedMediabuyerName("");
        setEditedMediabuyerNotes("");
    };
    // Open edit popup
    const openEditPopup = (log) => {
        setEditingLog(log);
        setEditedStatus(log.status);
        setEditedNotes(log.notes || "");
        setEditedSupportMemberName(log.support_member_name || "");
        setEditedAdminNotes(log.admin_notes || "");
        setEditedMediabuyerName(log.mediabuyer_name || "");
        setEditedMediabuyerNotes(log.mediabuyer_notes || "");
        setEditPopupOpen(true);
    };
    // Add new full call log
    const addNewCallLog = async () => {
        if (!appointment || !newCallLogStatus)
            return;
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const newLog = {
                id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                appointmentId: appointment.id,
                timestamp: createTimestamp(),
                status: newCallLogStatus,
                notes: newCallLogNotes.trim() || null,
                support_member_name: newSupportMemberName.trim() || username || "غير معروف",
                mediabuyer_name: isMediabuyer ? (newMediabuyerNotes ? username : null) : null,
                timezone: getUserTimezone(),
                admin_notes: isAdmin ? newAdminNotes.trim() || null : null,
                mediabuyer_notes: isMediabuyer ? newMediabuyerNotes.trim() || null : null,
                created_by_role: userRole,
            };
            const updatedLogs = [...(appointment.callLogs || []), newLog];
            await onUpdateCallLogs(appointment.id, updatedLogs);
            resetAddForm();
            setAddPopupOpen(false);
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.message || "فشل في إضافة سجل الاتصال",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };
    // Save full edit
    const saveEditedLog = async () => {
        if (!appointment || !editingLog)
            return;
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedLogs = appointment.callLogs.map((log) => log.id === editingLog.id
                ? {
                    ...log,
                    status: editedStatus,
                    notes: editedNotes.trim() || null,
                    support_member_name: editedSupportMemberName.trim() || null,
                    mediabuyer_name: editedMediabuyerName.trim() || null,
                    admin_notes: isAdmin ? editedAdminNotes.trim() || null : log.admin_notes,
                    mediabuyer_notes: isMediabuyer ? editedMediabuyerNotes.trim() || null : log.mediabuyer_notes,
                    timestamp: createTimestamp(),
                    editedBy: username,
                    timezone: getUserTimezone(),
                }
                : log);
            await onUpdateCallLogs(appointment.id, updatedLogs);
            resetEditForm();
            setEditPopupOpen(false);
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.message || "فشل في حفظ التعديلات",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };
    // Open Media Buyer Notes Popup
    const openMediabuyerNotesPopup = (log) => {
        setMediabuyerEditingLog(log);
        setMediabuyerNotes(log.mediabuyer_notes || "");
        setEditedMediabuyerName(log.mediabuyer_name || username);
        setMediabuyerNotesPopupOpen(true);
    };
    // Save Media Buyer Notes (with name)
    const saveMediabuyerNotes = async () => {
        if (!appointment || !mediabuyerEditingLog)
            return;
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const trimmedNotes = mediabuyerNotes.trim();
            const finalName = editedMediabuyerName.trim() || username;
            let updatedLogs;
            if (trimmedNotes) {
                // Update existing log or add new note-only log
                updatedLogs = appointment.callLogs.map((log) => log.id === mediabuyerEditingLog.id
                    ? {
                        ...log,
                        mediabuyer_notes: trimmedNotes,
                        mediabuyer_name: finalName,
                        timestamp: createTimestamp(),
                        editedBy: username,
                        timezone: getUserTimezone(),
                    }
                    : log);
                // If this is a new standalone note (e.g., no prior log selected)
                if (!mediabuyerEditingLog.id ||
                    !appointment.callLogs?.find((l) => l.id === mediabuyerEditingLog.id)) {
                    const newNoteLog = {
                        id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                        appointmentId: appointment.id,
                        status: "ملاحظات الميديا باير",
                        mediabuyer_notes: trimmedNotes,
                        mediabuyer_name: finalName,
                        support_member_name: username,
                        timestamp: createTimestamp(),
                        timezone: getUserTimezone(),
                        created_by_role: "mediabuyer",
                    };
                    updatedLogs = [...updatedLogs, newNoteLog];
                }
            }
            else {
                // Clear notes
                updatedLogs = appointment.callLogs.map((log) => log.id === mediabuyerEditingLog.id
                    ? {
                        ...log,
                        mediabuyer_notes: null,
                        mediabuyer_name: null,
                        timestamp: createTimestamp(),
                        editedBy: username,
                        timezone: getUserTimezone(),
                    }
                    : log);
            }
            await onUpdateCallLogs(appointment.id, updatedLogs);
            setMediabuyerEditingLog(null);
            setMediabuyerNotes("");
            setEditedMediabuyerName("");
            setMediabuyerNotesPopupOpen(false);
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.message || "فشل في حفظ ملاحظات الميديا باير",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };
    // Delete entire log
    const deleteCallLog = async (logId) => {
        if (!appointment || !logId || !window.confirm("هل أنت متأكد من حذف هذا السجل؟"))
            return;
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedLogs = appointment.callLogs.filter((log) => log.id !== logId);
            await onUpdateCallLogs(appointment.id, updatedLogs);
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.message || "فشل في حذف سجل الاتصال",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };
    // Delete only media buyer notes
    const deleteMediabuyerNotes = async (logId) => {
        if (!appointment || !logId || !window.confirm("هل أنت متأكد من حذف ملاحظات الميديا باير؟"))
            return;
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const updatedLogs = appointment.callLogs.map((log) => log.id === logId
                ? {
                    ...log,
                    mediabuyer_notes: null,
                    mediabuyer_name: null,
                    timestamp: createTimestamp(),
                    editedBy: username,
                    timezone: getUserTimezone(),
                }
                : log);
            await onUpdateCallLogs(appointment.id, updatedLogs);
        }
        catch (error) {
            setState((prev) => ({
                ...prev,
                error: error.message || "فشل في حذف ملاحظات الميديا باير",
            }));
        }
        finally {
            setState((prev) => ({ ...prev, loading: false }));
        }
    };
    if (!open || !appointment)
        return null;
    return (_jsxs("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden", children: [_jsxs("div", { className: "flex-shrink-0 p-6 border-b border-gray-200 flex justify-between items-center", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(History, { className: "h-5 w-5 text-blue-600" }), "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644"] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [appointment.name, " - ", appointment.phone] })] }), _jsx("button", { onClick: onClose, className: "p-2 text-gray-400 hover:text-gray-600 rounded-md", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsx("div", { className: "flex-shrink-0 p-4 border-b bg-gray-50", children: _jsxs("div", { className: "flex gap-4", children: [_jsxs("div", { className: "relative flex-1", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0633\u062C\u0644\u0627\u062A...", value: state.searchTerm, onChange: (e) => setState((prev) => ({ ...prev, searchTerm: e.target.value })), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" })] }), _jsxs("select", { value: state.statusFilter, onChange: (e) => setState((prev) => ({ ...prev, statusFilter: e.target.value })), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "all", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A" }), callLogStatusOptions.map((status) => (_jsx("option", { value: status, children: status }, status)))] })] }) }), _jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-3", children: processedLogs.length === 0 ? (_jsx("p", { className: "text-center text-gray-500", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0633\u062C\u0644\u0627\u062A" })) : (processedLogs.map((log) => (_jsxs("div", { className: "bg-white border border-gray-200 rounded-md p-4 shadow-sm", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsx("span", { className: "inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 rounded", children: log.status }), _jsxs("div", { className: "flex gap-2", children: [isMediabuyer && (_jsx("button", { onClick: () => openMediabuyerNotesPopup(log), className: `p-2 ${log.mediabuyer_notes ? 'text-orange-600' : 'text-gray-400 hover:text-orange-600'}`, title: log.mediabuyer_notes ? "تعديل ملاحظات الميديا باير" : "إضافة ملاحظات الميديا باير", children: _jsx(StickyNote, { className: "h-4 w-4" }) })), canEditLogs && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => openEditPopup(log), className: "p-2 text-blue-500 hover:text-blue-700", title: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0633\u062C\u0644", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => deleteCallLog(log.id), className: "p-2 text-red-500 hover:text-red-700", title: "\u062D\u0630\u0641 \u0627\u0644\u0633\u062C\u0644", children: _jsx(Trash2, { className: "h-4 w-4" }) })] })), isMediabuyer && log.mediabuyer_notes && (_jsx("button", { onClick: () => deleteMediabuyerNotes(log.id), className: "p-2 text-red-400 hover:text-red-600", title: "\u062D\u0630\u0641 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631", children: _jsx(X, { className: "h-4 w-4" }) }))] })] }), log.support_member_name && (_jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("strong", { children: "\u0627\u0633\u0645 \u0639\u0636\u0648 \u0627\u0644\u062F\u0639\u0645:" }), " ", log.support_member_name] })), log.mediabuyer_name && (_jsxs("p", { className: "text-sm text-orange-600", children: [_jsx("strong", { children: " \u0627\u0633\u0645 \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631:" }), " ", log.mediabuyer_name] })), log.notes && (_jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("strong", { children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A:" }), " ", log.notes] })), log.admin_notes && isAdmin && (_jsxs("p", { className: "text-sm text-purple-700", children: [_jsx("strong", { children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u062F\u064A\u0631:" }), " ", log.admin_notes] })), log.mediabuyer_notes && (_jsxs("div", { className: "mt-2 p-2 bg-orange-50 border border-orange-200 rounded", children: [_jsxs("p", { className: "text-sm text-orange-800", children: [_jsx("strong", { children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631:" }), " ", log.mediabuyer_notes] }), log.editedBy && (_jsxs("p", { className: "text-xs text-orange-600 mt-1", children: ["\u062A\u0645 \u0627\u0644\u062A\u0639\u062F\u064A\u0644 \u0628\u0648\u0627\u0633\u0637\u0629: ", log.mediabuyer_name] }))] })), _jsxs("div", { className: "mt-2 text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-1", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), formatDisplayDateTime(log.timestamp)] }), log.created_by_role && (_jsx("span", { className: "bg-gray-100 px-2 py-0.5 rounded text-xs capitalize", children: log.created_by_role === 'admin' ? 'مدير' :
                                                log.created_by_role === 'mediabuyer' ? 'ميديا باير' :
                                                    'خدمة عملاء' }))] })] }, log.id)))) }), (canEditLogs || isMediabuyer) && (_jsxs("div", { className: "p-4 border-t bg-gray-50 flex justify-end gap-3", children: [canEditLogs && (_jsxs("button", { onClick: () => setAddPopupOpen(true), className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1", children: [_jsx(Plus, { className: "h-4 w-4" }), " \u0625\u0636\u0627\u0641\u0629 \u0633\u062C\u0644 \u062C\u062F\u064A\u062F"] })), isMediabuyer && (_jsxs("button", { onClick: () => {
                                    setMediabuyerEditingLog({
                                        id: '',
                                        appointmentId: appointment.id,
                                        status: "ملاحظات الميديا باير",
                                        timestamp: createTimestamp(),
                                        support_member_name: username,
                                        timezone: getUserTimezone(),
                                        created_by_role: 'mediabuyer',
                                    });
                                    setMediabuyerNotes("");
                                    setEditedMediabuyerName(username);
                                    setMediabuyerNotesPopupOpen(true);
                                }, className: "px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 flex items-center gap-1", children: [_jsx(Plus, { className: "h-4 w-4" }), " \u0625\u0636\u0627\u0641\u0629 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631"] }))] }))] }), addPopupOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "\u0625\u0636\u0627\u0641\u0629 \u0633\u062C\u0644 \u062C\u062F\u064A\u062F" }), _jsxs("select", { value: newCallLogStatus, onChange: (e) => setNewCallLogStatus(e.target.value), className: "w-full mb-3 border rounded p-2", required: true, children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062D\u0627\u0644\u0629" }), callLogStatusOptions.map((s) => (_jsx("option", { value: s, children: s }, s)))] }), _jsx("input", { placeholder: "\u0627\u0633\u0645 \u0639\u0636\u0648 \u0627\u0644\u062F\u0639\u0645", value: newSupportMemberName, onChange: (e) => setNewSupportMemberName(e.target.value), className: "w-full mb-3 border rounded p-2" }), _jsx("textarea", { placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0639\u0627\u0645\u0629", value: newCallLogNotes, onChange: (e) => setNewCallLogNotes(e.target.value), rows: 2, className: "w-full mb-3 border rounded p-2" }), isAdmin && (_jsx("textarea", { placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u062F\u064A\u0631", value: newAdminNotes, onChange: (e) => setNewAdminNotes(e.target.value), rows: 2, className: "w-full mb-3 border border-purple-200 rounded p-2" })), isMediabuyer && (_jsx("textarea", { placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631", value: newMediabuyerNotes, onChange: (e) => setNewMediabuyerNotes(e.target.value), rows: 2, className: "w-full mb-3 border border-orange-200 rounded p-2" })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => {
                                        setAddPopupOpen(false);
                                        resetAddForm();
                                    }, className: "px-4 py-2 bg-gray-100 rounded", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { onClick: addNewCallLog, disabled: !newCallLogStatus || state.loading, className: "px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50", children: state.loading ? "جاري..." : "إضافة" })] })] }) })), editPopupOpen && editingLog && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0633\u062C\u0644" }), _jsx("select", { value: editedStatus, onChange: (e) => setEditedStatus(e.target.value), className: "w-full mb-3 border rounded p-2", children: callLogStatusOptions.map((s) => (_jsx("option", { value: s, children: s }, s))) }), _jsx("input", { value: editedSupportMemberName, onChange: (e) => setEditedSupportMemberName(e.target.value), placeholder: "\u0627\u0633\u0645 \u0639\u0636\u0648 \u0627\u0644\u062F\u0639\u0645", className: "w-full mb-3 border rounded p-2" }), isMediabuyer && (_jsx("input", { value: editedMediabuyerName, onChange: (e) => setEditedMediabuyerName(e.target.value), placeholder: "\u0627\u0633\u0645 \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631", className: "w-full mb-3 border rounded p-2" })), _jsx("textarea", { value: editedNotes, onChange: (e) => setEditedNotes(e.target.value), placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0639\u0627\u0645\u0629", rows: 2, className: "w-full mb-3 border rounded p-2" }), isAdmin && (_jsx("textarea", { value: editedAdminNotes, onChange: (e) => setEditedAdminNotes(e.target.value), placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u062F\u064A\u0631", rows: 2, className: "w-full mb-3 border border-purple-200 rounded p-2" })), isMediabuyer && (_jsx("textarea", { value: editedMediabuyerNotes, onChange: (e) => setEditedMediabuyerNotes(e.target.value), placeholder: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631", rows: 2, className: "w-full mb-3 border border-orange-200 rounded p-2" })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => {
                                        setEditPopupOpen(false);
                                        resetEditForm();
                                    }, className: "px-4 py-2 bg-gray-100 rounded", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { onClick: saveEditedLog, disabled: state.loading, className: "px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50", children: state.loading ? "جاري..." : "حفظ" })] })] }) })), mediabuyerNotesPopupOpen && mediabuyerEditingLog && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50", children: _jsxs("div", { className: "bg-white p-6 rounded-lg w-full max-w-md", children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-orange-700", children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631" }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631" }), _jsx("input", { type: "text", value: editedMediabuyerName, onChange: (e) => setEditedMediabuyerName(e.target.value), placeholder: "\u0623\u062F\u062E\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631", className: "w-full border border-orange-300 rounded-md px-3 py-2 text-right", dir: "rtl" }), !isAdmin && (_jsx("p", { className: "text-xs text-orange-500 mt-1", children: "* \u0633\u064A\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0628\u0627\u0633\u0645\u0643 \u0627\u0644\u062D\u0627\u0644\u064A" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A" }), _jsx("textarea", { value: mediabuyerNotes, onChange: (e) => setMediabuyerNotes(e.target.value), placeholder: "\u0623\u062F\u062E\u0644 \u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u064A\u0627 \u0628\u0627\u064A\u0631...", rows: 4, className: "w-full border border-orange-200 rounded-md p-2 resize-none text-right", dir: "rtl" })] }), _jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [_jsx("button", { onClick: () => {
                                        setMediabuyerNotesPopupOpen(false);
                                        setMediabuyerEditingLog(null);
                                        setMediabuyerNotes("");
                                        setEditedMediabuyerName("");
                                    }, className: "px-4 py-2 bg-gray-100 rounded", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { onClick: saveMediabuyerNotes, disabled: state.loading, className: "px-4 py-2 bg-orange-600 text-white rounded disabled:opacity-50", children: state.loading ? "جاري..." : "حفظ" })] })] }) }))] }));
};
// DataTable Component
const DataTable = ({ formFields = defaultFormFields, data = defaultData, userRole = "customercare", }) => {
    const [state, setState] = useState({
        search: "",
        branchFilter: "all",
        paymentFilter: "all",
        authFilter: "all",
        statusFilter: "all",
        loading: false,
        error: null,
        fetchedData: data,
        selectedAppointment: null,
        callLogDialogOpen: false,
        deleteConfirmOpen: false,
        appointmentToDelete: null,
        currentPage: 1,
        totalPages: 1,
        schedulePopupOpen: false,
        schedulingAppointment: null,
        newScheduledDateTime: "",
        isScheduling: false,
    });
    const { search, branchFilter, paymentFilter, authFilter, statusFilter, loading, error, fetchedData, selectedAppointment, callLogDialogOpen, deleteConfirmOpen, appointmentToDelete, currentPage, totalPages, schedulePopupOpen, schedulingAppointment, newScheduledDateTime, isScheduling, } = state;
    const role = userRole || (sessionStorage.getItem("role") ?? "customercare");
    const username = sessionStorage.getItem("username") || "غير معروف";
    const canScheduleAppointments = role === "customercare";
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
    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetchWithToken(`https://www.ss.mastersclinics.com/appointments?page=${currentPage}`);
            if (!response.ok)
                throw new Error("Network error");
            const data = await response.json();
            console.log(data);
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
            const matchesSearch = search.trim() ? deepSearch(row, search) : true;
            const matchesPayment = paymentFilter === "all" || row.payment_status === paymentFilter;
            const matchesAuth = authFilter === "all" ||
                (authFilter === "authed" && row.is_authed === 1) ||
                (authFilter === "notAuthed" && row.is_authed === 0);
            const matchesStatus = statusFilter === "all" || row.status === statusFilter;
            return matchesSearch && matchesBranch && matchesPayment && matchesAuth && matchesStatus;
        })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [search, branchFilter, paymentFilter, authFilter, statusFilter, fetchedData]);
    const handleChange = (field) => (e) => {
        setState((prev) => ({ ...prev, [field]: e.target.value }));
    };
    const handleSelectChange = (field) => (e) => {
        setState((prev) => ({ ...prev, [field]: e.target.value }));
    };
    const openCallLogDialog = (appointment) => {
        setState((prev) => ({
            ...prev,
            selectedAppointment: appointment,
            callLogDialogOpen: true,
        }));
    };
    const closeCallLogDialog = () => {
        setState((prev) => ({
            ...prev,
            callLogDialogOpen: false,
            selectedAppointment: null,
        }));
    };
    const handleUpdateCallLogs = useCallback(async (appointmentId, callLogs) => {
        await updateAppointments(appointmentId, { callLogs });
        await fetchData();
        setState(prev => {
            if (prev.selectedAppointment?.id === appointmentId) {
                return {
                    ...prev,
                    selectedAppointment: {
                        ...prev.selectedAppointment,
                        callLogs
                    }
                };
            }
            return prev;
        });
    }, [fetchData]);
    const openSchedulePopup = (appointment) => {
        if (!canScheduleAppointments) {
            setState((prev) => ({ ...prev, error: "غير مصرح لك بتحديد المواعيد" }));
            return;
        }
        let initialDate = new Date();
        if (appointment.scheduledAt) {
            const parsedDate = parseScheduledAt(appointment.scheduledAt);
            if (parsedDate)
                initialDate = parsedDate;
        }
        const formattedDate = initialDate.toISOString().slice(0, 16);
        setState((prev) => ({
            ...prev,
            schedulePopupOpen: true,
            schedulingAppointment: appointment,
            newScheduledDateTime: formattedDate,
        }));
    };
    const closeSchedulePopup = () => {
        setState((prev) => ({
            ...prev,
            schedulePopupOpen: false,
            schedulingAppointment: null,
            newScheduledDateTime: "",
            isScheduling: false,
        }));
    };
    const scheduleAppointment = useCallback(async () => {
        if (!schedulingAppointment || !newScheduledDateTime)
            return;
        setState((prev) => ({ ...prev, isScheduling: true, error: null }));
        try {
            const scheduledDate = new Date(newScheduledDateTime);
            // Convert to MySQL datetime format (YYYY-MM-DD HH:MM:SS)
            const mysqlDateTime = formatDateTimeForMySQL(scheduledDate);
            const schedulingLog = {
                id: `schedule_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                appointmentId: schedulingAppointment.id,
                timestamp: createTimestamp(),
                status: "تم الحجز",
                notes: `تم تحديد موعد الحجز: ${formatDisplayDateTime(scheduledDate)}`,
                support_member_name: username || "غير معروف",
                timezone: getUserTimezone(),
                created_by_role: role,
            };
            const updatedLogs = [...(schedulingAppointment.callLogs || []), schedulingLog];
            // Update the appointment with the scheduled datetime
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
    }, [schedulingAppointment, newScheduledDateTime, username, role, fetchData]);
    const unscheduleAppointment = useCallback(async () => {
        if (!schedulingAppointment)
            return;
        setState((prev) => ({ ...prev, isScheduling: true, error: null }));
        try {
            const unschedulingLog = {
                id: `unschedule_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                appointmentId: schedulingAppointment.id,
                timestamp: createTimestamp(),
                status: "تم إلغاء الحجز",
                notes: "تم إلغاء موعد الحجز",
                support_member_name: username || "غير معروف",
                timezone: getUserTimezone(),
                created_by_role: role,
            };
            const updatedLogs = [...(schedulingAppointment.callLogs || []), unschedulingLog];
            // Set scheduledAt to null when unscheduling
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
    }, [schedulingAppointment, username, role, fetchData]);
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
    const updateAppointmentStatus = async (id, status) => {
        try {
            await updateAppointments(id, { status });
            await fetchData();
        }
        catch (err) {
            console.error("Failed to update appointment status:", err);
            setState((prev) => ({
                ...prev,
                error: "فشل في تحديث حالة الموعد",
            }));
        }
    };
    const renderDoctorOffer = (row) => (_jsxs("div", { className: "flex flex-col gap-1 text-sm", children: [row.type === "device" && row.device && (_jsxs("div", { className: "font-medium text-green-700", children: ["\u062C\u0647\u0627\u0632: ", row.device] })), row.type === "doctor" && row.doctor && (_jsxs("div", { className: "font-medium text-blue-700", children: ["\u0637\u0628\u064A\u0628: ", row.doctor] })), row.type === "offer" && row.offer && (_jsxs("div", { className: "font-medium text-purple-700", children: ["\u0639\u0631\u0636: ", row.offer] })), row.type === "branch" && (_jsxs("div", { className: "font-medium text-gray-700", children: ["\u0641\u0631\u0639: ", row.branch] })), row.type !== "device" && row.device && (_jsxs("div", { className: "text-xs text-gray-500", children: ["\u062C\u0647\u0627\u0632: ", row.device] })), row.type !== "doctor" && row.doctor && (_jsxs("div", { className: "text-xs text-gray-500", children: ["\u0637\u0628\u064A\u0628: ", row.doctor] })), row.type !== "offer" && row.offer && (_jsxs("div", { className: "text-xs text-gray-500", children: ["\u0639\u0631\u0636: ", row.offer] })), !row.device && !row.doctor && !row.offer && "-"] }));
    const renderScheduledAt = (scheduledAt) => {
        if (!scheduledAt)
            return "-";
        const date = parseScheduledAt(scheduledAt);
        if (!date || isNaN(date.getTime()))
            return "-";
        return formatDisplayDateTime(date);
    };
    const handlePaginationClick = useCallback((direction) => (event) => {
        event.preventDefault();
        event.stopPropagation();
        setState((prev) => ({
            ...prev,
            currentPage: direction === "prev" ? prev.currentPage - 1 : prev.currentPage + 1,
        }));
    }, [setState]);
    return (_jsxs("div", { className: "overflow-auto pr-2 bg-gray-50 min-h-screen p-2", children: [error && (_jsx("div", { className: "mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex", children: [_jsx(AlertTriangle, { className: "h-5 w-5 mr-2 mt-0.5" }), _jsx("span", { children: error })] }), _jsx("button", { onClick: () => setState((prev) => ({ ...prev, error: null })), className: "text-red-500 hover:text-red-700", children: _jsx(X, { className: "h-5 w-5" }) })] }) })), _jsx("div", { className: "mb-6 bg-white p-6 rounded-lg shadow-sm border", children: _jsxs("div", { className: "flex flex-wrap gap-4", children: [_jsxs("div", { className: "relative flex-1 min-w-64", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }), _jsx("input", { type: "text", placeholder: "\u0628\u062D\u062B \u0641\u064A \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F...", value: search, onChange: handleChange("search"), className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }), _jsxs("select", { value: branchFilter, onChange: handleSelectChange("branchFilter"), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0631\u0648\u0639" }), branchOptions.map((branch) => (_jsx("option", { value: branch, children: branch }, branch)))] }), _jsxs("select", { value: paymentFilter, onChange: handleSelectChange("paymentFilter"), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u062F\u0641\u0639" }), _jsx("option", { value: "paid", children: "\u0645\u062F\u0641\u0648\u0639" }), _jsx("option", { value: "pending", children: "\u0645\u0639\u0644\u0642" }), _jsx("option", { value: "unpaid", children: "\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639" })] }), _jsxs("select", { value: authFilter, onChange: handleSelectChange("authFilter"), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "\u062C\u0645\u064A\u0639 \u062D\u0627\u0644\u0627\u062A \u0627\u0644\u062A\u0648\u062B\u064A\u0642" }), _jsx("option", { value: "authed", children: "\u0645\u0648\u062B\u0642" }), _jsx("option", { value: "notAuthed", children: "\u063A\u064A\u0631 \u0645\u0648\u062B\u0642" })] }), _jsxs("select", { value: statusFilter, onChange: handleSelectChange("statusFilter"), className: "px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: [_jsx("option", { value: "all", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0627\u0644\u0627\u062A" }), appointmentStatusOptions.map((status) => (_jsx("option", { value: status, children: appointmentStatusLabels[status] }, status)))] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow-sm border overflow-hidden", children: _jsx("div", { className: "overflow-x-auto max-h-[75vh]", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50 border-b sticky top-0 z-10", children: _jsxs("tr", { children: [visibleFormFields.map((field) => (_jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: field.label }, field.key))), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639" }), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u0627\u0644\u062A\u0648\u062B\u064A\u0642" }), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u0645\u0648\u0639\u062F \u0627\u0644\u062D\u062C\u0632" }), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u0622\u062E\u0631 \u062D\u0627\u0644\u0629" }), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u0633\u062C\u0644\u0627\u062A \u0627\u0644\u0627\u062A\u0635\u0627\u0644" }), _jsx("th", { className: "text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsxs("tbody", { className: "divide-y divide-gray-200", children: [loading && (_jsx("tr", { children: _jsx("td", { colSpan: visibleFormFields.length + 7, className: "px-6 py-12 text-center", children: _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" }), _jsx("span", { className: "text-gray-600", children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." })] }) }) })), !loading && filteredData.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: visibleFormFields.length + 7, className: "px-6 py-12 text-center", children: _jsx("div", { className: "text-gray-500", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }) }) })), filteredData.map((row) => {
                                        const lastCall = getLastCallStatus(row);
                                        return (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [visibleFormFields.map((field) => (_jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: field.key === "createdAt"
                                                        ? formatDisplayDateTime(row[field.key])
                                                        : field.key === "doctor_offer"
                                                            ? renderDoctorOffer(row)
                                                            : (row[field.key] ?? "-") }, field.key))), _jsx("td", { className: "px-6 py-4", children: _jsx(Chip, { label: row.payment_status === "paid" ? "مدفوع" : row.payment_status === "pending" ? "معلق" : "غير مدفوع", className: paymentStatusColors[row.payment_status] || "bg-gray-100 text-gray-800" }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${row.is_authed ? 'bg-green-500' : 'bg-red-500'}`, children: row.is_authed ? '✓' : '✗' }) }), _jsx("td", { className: "px-6 py-4", children: userRole === "customercare" && (row.is_authed === 1) ? (_jsx("select", { value: row.status, onChange: (e) => updateAppointmentStatus(row.id, e.target.value), className: "px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent", children: appointmentStatusOptions.map((status) => (_jsx("option", { value: status, children: appointmentStatusLabels[status] }, status))) })) : (_jsx(Chip, { label: appointmentStatusLabels[row.status] || row.status, className: appointmentStatusColors[row.status] ||
                                                            "bg-gray-100 text-gray-800" })) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: renderScheduledAt(row.scheduledAt) }), row.scheduledAt && (_jsxs("div", { className: "text-xs text-gray-500 flex items-center gap-1 mt-1", children: [_jsx(Clock, { className: "h-3 w-3" }), "\u0627\u0644\u0645\u0646\u0637\u0642\u0629: ", getUserTimezone(), " (", getTimezoneOffset(), ")"] }))] }), (canScheduleAppointments && row.is_authed) ? (_jsx("button", { onClick: () => openSchedulePopup(row), className: `p-2 rounded-md hover:bg-gray-100 transition-colors ${row.scheduledAt ? 'text-blue-600' : 'text-gray-400'}`, title: row.scheduledAt ? "تعديل الموعد" : "تحديد موعد", children: _jsx(Calendar, { className: "h-4 w-4" }) })) : "-"] }) }), _jsx("td", { className: "px-6 py-4", children: lastCall ? (_jsxs("div", { className: "group relative", children: [_jsx(Chip, { label: lastCall.status, className: statusColors[lastCall.status] || "bg-gray-100 text-gray-800 border-gray-200" }), _jsxs("div", { className: "absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20", children: [_jsx("div", { className: "font-medium", children: formatDisplayDateTime(lastCall.timestamp) }), _jsxs("div", { className: "mt-1", children: ["\u0628\u0648\u0627\u0633\u0637\u0629: ", lastCall.support_member_name || 'غير معروف'] }), lastCall.notes && (_jsxs("div", { className: "mt-1", children: ["\u0645\u0644\u0627\u062D\u0638\u0629: ", lastCall.notes] }))] })] })) : (_jsx(Chip, { label: "\u0644\u0627 \u064A\u0648\u062C\u062F", className: "bg-gray-100 text-gray-800 border-gray-200" })) }), _jsx("td", { className: "px-6 py-4", children: _jsxs("button", { onClick: () => openCallLogDialog(row), className: "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors", children: [_jsx(History, { className: "h-4 w-4" }), "\u0627\u0644\u0633\u062C\u0644\u0627\u062A (", row.callLogs?.length || 0, ")"] }) }), _jsx("td", { className: "px-6 py-4", children: role === "mediabuyer" && (_jsxs("button", { onClick: () => openDeleteConfirm(row.id), className: "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors", children: [_jsx(Trash2, { className: "h-4 w-4" }), "\u062D\u0630\u0641"] })) })] }, row.id));
                                    })] })] }) }) }), _jsxs("div", { className: "mt-6 flex justify-center items-center gap-4", children: [_jsxs("button", { onClick: handlePaginationClick("prev"), disabled: currentPage === 1 || loading, className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(ChevronLeft, { className: "h-4 w-4" }), "\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0633\u0627\u0628\u0642\u0629"] }), _jsxs("span", { className: "text-sm text-gray-600", children: ["\u0627\u0644\u0635\u0641\u062D\u0629 ", currentPage, " \u0645\u0646 ", totalPages] }), _jsxs("button", { onClick: handlePaginationClick("next"), disabled: currentPage === totalPages || loading, className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: ["\u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u062A\u0627\u0644\u064A\u0629", _jsx(ChevronRight, { className: "h-4 w-4" })] })] }), callLogDialogOpen && selectedAppointment && (_jsx(CallLogManager, { open: callLogDialogOpen, onClose: closeCallLogDialog, appointment: selectedAppointment, onUpdateCallLogs: handleUpdateCallLogs, userRole: role, username: username })), schedulePopupOpen && schedulingAppointment && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "\u062A\u062D\u062F\u064A\u062F \u0645\u0648\u0639\u062F \u0627\u0644\u062D\u062C\u0632"] }), _jsx("button", { onClick: closeSchedulePopup, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-5 w-5" }) })] }), _jsxs("div", { className: "mb-4 p-3 bg-gray-50 rounded-md", children: [_jsxs("div", { className: "text-sm text-gray-600", children: [schedulingAppointment.name, " - ", schedulingAppointment.phone] }), _jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: ", _jsx("strong", { children: getUserTimezone() }), " (", getTimezoneOffset(), ")"] }), schedulingAppointment.scheduledAt && (_jsxs("div", { className: "text-xs text-blue-600 mt-1", children: ["\u0627\u0644\u0645\u0648\u0639\u062F \u0627\u0644\u062D\u0627\u0644\u064A: ", renderScheduledAt(schedulingAppointment.scheduledAt)] }))] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0627\u0644\u0645\u0648\u0639\u062F" }), _jsx("input", { type: "datetime-local", value: newScheduledDateTime, onChange: (e) => {
                                            const value = e.target.value;
                                            if (value) {
                                                setState(prev => ({
                                                    ...prev,
                                                    newScheduledDateTime: value
                                                }));
                                            }
                                        }, className: "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u0633\u064A\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0648\u0639\u062F \u0628\u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0632\u0645\u0646\u064A\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629" })] }), _jsxs("div", { className: "flex justify-between items-center gap-3", children: [schedulingAppointment.scheduledAt && (_jsxs("button", { onClick: unscheduleAppointment, disabled: isScheduling, className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Trash2, { className: "h-4 w-4" }), isScheduling ? "جاري الإلغاء..." : "إلغاء الموعد"] })), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: closeSchedulePopup, disabled: isScheduling, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsxs("button", { onClick: scheduleAppointment, disabled: isScheduling || !newScheduledDateTime, className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: [isScheduling ? (_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" })) : (_jsx(Calendar, { className: "h-4 w-4" })), isScheduling ? "جاري الحفظ..." : "حفظ الموعد"] })] })] })] }) }) })), deleteConfirmOpen && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "w-10 h-10 bg-red-100 rounded-full flex items-center justify-center", children: _jsx(AlertTriangle, { className: "h-6 w-6 text-red-600" }) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" })] }), _jsx("div", { className: "mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md", children: _jsx("p", { className: "text-sm text-yellow-800", children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0623\u0646\u0643 \u062A\u0631\u064A\u062F \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062F\u061F \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621 \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646\u0647." }) }), _jsxs("div", { className: "flex justify-end gap-3", children: [_jsx("button", { onClick: closeDeleteConfirm, className: "px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { onClick: confirmDeleteAppointment, className: "px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700", children: "\u062D\u0630\u0641" })] })] }) }) }))] }));
};
export default DataTable;
