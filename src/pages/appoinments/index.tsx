import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    TextField,
    MenuItem,
    TableContainer,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Typography,
    IconButton,
    ListItemSecondaryAction
} from '@mui/material';
import { updateAppointments } from '../../api/landingPages';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LeadForm from './appointmentForm';

interface DataTableProps {
    formFields?: FormField[];
    data?: Appointment[];
    onDelete?: (id: string) => void;
    onView?: (row: Appointment) => void;
    userRole: 'customercare' | 'mediabuyer' | 'admin';
}

interface FormField {
    name: string;
    label?: string;
}

interface Appointment {
    id: string;
    _id?: string;
    name: string;
    phone: string;
    branch: string;
    createdAt: string;
    landingPageId: string;
    utmSource: string;
    doctor?: string;
    offer?: string;
    callLogs?: CallLog[];
    [key: string]: any;
}

interface CallLog {
    id: string;
    timestamp: string;
    status: string;
    notes?: string;
    agentName?: string;
}

const DataTable: React.FC<DataTableProps> = ({
    formFields = defaultFormFields,
    data = defaultData,
    userRole
}) => {
    const [addLead, setAddLead] = useState(false);
    const [role] = useState(sessionStorage.getItem("role"));
    const [state, setState] = useState({
        search: '',
        branchFilter: 'all',
        loading: false,
        error: null as string | null,
        fetchedData: data as Appointment[] | undefined,
        selectedAppointment: null as Appointment | null,
        callLogDialogOpen: false,
        newCallLogStatus: '',
        newCallLogNotes: '',
        editingLogId: null as string | null,
        editedLogStatus: '',
        editedLogNotes: ''
    });

    const { 
        search, 
        branchFilter, 
        loading, 
        error, 
        fetchedData,
        selectedAppointment,
        callLogDialogOpen,
        newCallLogStatus,
        newCallLogNotes,
        editingLogId,
        editedLogStatus,
        editedLogNotes
    } = state;

    const fetchWithToken = async (url: string, options: RequestInit = {}) => {
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
                if (!response.ok) throw new Error('Network error');
                
                const data = await response.json();
                setState(prev => ({ ...prev, fetchedData: data, loading: false }));
            } catch (err) {
                console.log(err);
                setState(prev => ({ ...prev, error: 'فشل في تحميل البيانات', loading: false }));
            }
        };
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الحجز؟')) {
            try {
                setState(prev => ({ ...prev, loading: true }));
                const response = await fetchWithToken(`http://localhost:3000/appointments/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) throw new Error('Failed to delete appointment');
                
                setState(prev => ({
                    ...prev,
                    fetchedData: prev.fetchedData?.filter(item => item._id !== id && item.id !== id),
                    loading: false
                }));
            } catch (err) {
                console.error('Error deleting appointment:', err);
                setState(prev => ({ ...prev, error: 'فشل في حذف الحجز', loading: false }));
            }
        }
    };

    const branchOptions = useMemo(() => {
        const branches = (fetchedData || []).map(d => d.branch).filter(Boolean) as string[];
        return Array.from(new Set(branches));
    }, [fetchedData]);

    const deepSearch = (obj: any, searchTerm: string): boolean => {
        if (!obj) return false;
        return Object.values(obj).some(val => {
            if (typeof val === 'object' && val !== null) {
                return deepSearch(val, searchTerm);
            }
            const stringValue = String(val ?? '').toLowerCase();
            return stringValue.includes(searchTerm.toLowerCase());
        });
    };

    const filteredData = useMemo(() => {
        if (!fetchedData) return [];
        return fetchedData
            .filter(row => {
                const matchesBranch = branchFilter === 'all' || row.branch === branchFilter;
                const matchesSearch = search.trim() ? deepSearch(row, search) : true;
                return matchesBranch && matchesSearch;
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [search, branchFilter, fetchedData]);

    const handleChange = (field: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({ ...prev, [field]: e.target.value }));
    };

    const openCallLogDialog = (appointment: Appointment) => {
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
        if (!selectedAppointment || !newCallLogStatus) return;
        
        try {
            const newLog: CallLog = {
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
                fetchedData: prev.fetchedData?.map(item =>
                    item._id === selectedAppointment._id || item.id === selectedAppointment.id
                        ? { ...item, callLogs: updatedLogs } 
                        : item
                ),
                newCallLogStatus: '',
                newCallLogNotes: ''
            }));
        } catch (err) {
            console.error('Failed to add call log:', err);
        }
    };

    const startEditingLog = (log: CallLog) => {
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
        if (!selectedAppointment || !editingLogId) return;
        
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).map(log => 
                log.id === editingLogId 
                    ? { 
                        ...log, 
                        status: editedLogStatus,
                        notes: editedLogNotes,
                        timestamp: new Date().toISOString()
                    } 
                    : log
            );
            
            await updateAppointments(selectedAppointment._id || selectedAppointment.id, { 
                callLogs: updatedLogs
            });

            setState(prev => ({
                ...prev,
                fetchedData: prev.fetchedData?.map(item =>
                    item._id === selectedAppointment._id || item.id === selectedAppointment.id
                        ? { ...item, callLogs: updatedLogs } 
                        : item
                ),
                editingLogId: null
            }));
        } catch (err) {
            console.error('Failed to update call log:', err);
        }
    };

    const deleteCallLog = async (logId: string) => {
        if (!selectedAppointment) return;
        
        try {
            const updatedLogs = (selectedAppointment.callLogs || []).filter(log => log.id !== logId);
            
            await updateAppointments(selectedAppointment._id || selectedAppointment.id, { 
                callLogs: updatedLogs
            });

            setState(prev => ({
                ...prev,
                fetchedData: prev.fetchedData?.map(item =>
                    item._id === selectedAppointment._id || item.id === selectedAppointment.id
                        ? { ...item, callLogs: updatedLogs } 
                        : item
                )
            }));
        } catch (err) {
            console.error('Failed to delete call log:', err);
        }
    };

    const getLatestStatus = (callLogs: CallLog[] = []) => {
        if (callLogs.length === 0) return 'لم يتم التواصل';
        const sorted = [...callLogs].sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        return sorted[0].status;
    };

    const renderCellValue = (row: Appointment, field: FormField) => {
        if (field.name === 'clientStatus') {
            const latestStatus = getLatestStatus(row.callLogs);
            
            if (userRole === 'customercare' || userRole === 'admin') {
                return (
                    <Box display="flex" alignItems="center">
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            {latestStatus}
                        </Typography>
                        <IconButton 
                            size="small" 
                            onClick={() => openCallLogDialog(row)}
                            color="primary"
                        >
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Box>
                );
            } else if (userRole === 'mediabuyer') {
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

  const renderActions = (row: Appointment) => (
    <TableCell align="center">
     
        {(userRole === 'admin' || userRole === 'mediabuyer') && (
            <Button
                variant="outlined"
                color="error"
                onClick={() => handleDelete(row._id || row.id)}
            >
                حذف
            </Button>
        )}
    </TableCell>
);
    const displayedFields = formFields.filter(field => 
        field.name !== 'isContacted'
    );

    return (
        <div dir="rtl" className="p-4">
            {addLead && <LeadForm setAddLead={setAddLead} />}
            
            <Box display="flex" gap={2} mb={2}>
                <TextField
                    label="بحث شامل"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={handleChange('search')}
                    fullWidth
                    placeholder="ابحث في جميع الحقول..."
                />
                <TextField
                    label="الفرع"
                    select
                    size="small"
                    value={branchFilter}
                    onChange={handleChange('branchFilter')}
                    style={{ minWidth: 150 }}
                >
                    <MenuItem value="all">الكل</MenuItem>
                    {branchOptions.map(branch => (
                        <MenuItem key={branch} value={branch}>
                            {branch}
                        </MenuItem>
                    ))}
                </TextField>
                <Button onClick={() => setAddLead(true)}>
                    اضافة طلب حجز
                </Button>
            </Box>

            {loading && <Box textAlign="center" my={2}>جاري التحميل...</Box>}
            {error && <Box textAlign="center" color="error.main" my={2}>{error}</Box>}

            {!loading && !error && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {displayedFields.map(field => (
                                    <TableCell
                                        key={field.name}
                                        style={{ fontWeight: 'bold', textAlign: 'right' }}
                                    >
                                        {field.label || field.name}
                                    </TableCell>
                                ))}
                       {
role === "admin" ||  role === "mediabuyer" ?
<TableCell align="center" style={{ fontWeight: 'bold' }}>
                                    الإجراءات
                                </TableCell> : null
                        }
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map(row => (
                                    <TableRow key={row.id} hover>
                                        {displayedFields.map(field => (
                                            <TableCell
                                                key={`${row.id}-${field.name}`}
                                                style={{ textAlign: 'right' }}
                                            >
                                                {renderCellValue(row, field)}
                                            </TableCell>
                                        ))}
                                        {renderActions(row)}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={displayedFields.length + 1} align="center">
                                        {search.trim()
                                            ? 'لا توجد نتائج مطابقة للبحث'
                                            : 'لا توجد بيانات متاحة'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Call Log Dialog */}
            <Dialog 
                open={callLogDialogOpen} 
                onClose={closeCallLogDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        سجل المكالمات - {selectedAppointment?.name}
                        <IconButton onClick={closeCallLogDialog}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box mb={3}>
                        <Typography variant="h6" gutterBottom>
                            إضافة مكالمة جديدة
                        </Typography>
                        <Box display="flex" gap={2} mb={2}>
                            <TextField
                                select
                                label="حالة المكالمة"
                                value={newCallLogStatus}
                                onChange={(e) => setState(prev => ({ ...prev, newCallLogStatus: e.target.value }))}
                                fullWidth
                                size="small"
                            >
                                <MenuItem value="لم يتم التواصل">لم يتم التواصل</MenuItem>
                                <MenuItem value="استفسار">استفسار</MenuItem>
                                <MenuItem value="مهتم">مهتم</MenuItem>
                                <MenuItem value="غير مهتم">غير مهتم</MenuItem>
                                <MenuItem value="تم الحجز">تم الحجز</MenuItem>
                                <MenuItem value="تم التواصل">تم التواصل علي الواتس اب</MenuItem>
                                <MenuItem value="لم يتم الرد">لم يتم الرد</MenuItem>
                                <MenuItem value="طلب التواصل في وقت اخر">طلب التواصل في وقت اخر</MenuItem>
                            </TextField>
                        </Box>
                        <TextField
                            label="ملاحظات"
                            value={newCallLogNotes}
                            onChange={(e) => setState(prev => ({ ...prev, newCallLogNotes: e.target.value }))}
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                        />
                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button 
                                variant="contained" 
                                onClick={addNewCallLog}
                                disabled={!newCallLogStatus}
                            >
                                إضافة المكالمة
                            </Button>
                        </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                        سجل المكالمات السابقة
                    </Typography>
                    {selectedAppointment?.callLogs?.length ? (
                        <List>
                            {[...selectedAppointment.callLogs]
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map((log) => (
                                    <ListItem key={log.id} divider>
                                        {editingLogId === log.id ? (
                                            <Box width="100%">
                                                <Box display="flex" gap={2} mb={2}>
                                                    <TextField
                                                        select
                                                        label="حالة المكالمة"
                                                        value={editedLogStatus}
                                                        onChange={(e) => setState(prev => ({ ...prev, editedLogStatus: e.target.value }))}
                                                        fullWidth
                                                        size="small"
                                                    >
                                                        <MenuItem value="لم يتم التواصل">لم يتم التواصل</MenuItem>
                                                        <MenuItem value="استفسار">استفسار</MenuItem>
                                                        <MenuItem value="مهتم">مهتم</MenuItem>
                                                        <MenuItem value="غير مهتم">غير مهتم</MenuItem>
                                                        <MenuItem value="تم الحجز">تم الحجز</MenuItem>
                                                        <MenuItem value="تم التواصل">تم التواصل علي الواتس اب</MenuItem>
                                                        <MenuItem value="لم يتم الرد">لم يتم الرد</MenuItem>
                                                        <MenuItem value="طلب التواصل في وقت اخر">طلب التواصل في وقت اخر</MenuItem>
                                                    </TextField>
                                                </Box>
                                                <TextField
                                                    label="ملاحظات"
                                                    value={editedLogNotes}
                                                    onChange={(e) => setState(prev => ({ ...prev, editedLogNotes: e.target.value }))}
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    size="small"
                                                />
                                                <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
                                                    <Button 
                                                        variant="outlined" 
                                                        onClick={cancelEditing}
                                                    >
                                                        إلغاء
                                                    </Button>
                                                    <Button 
                                                        variant="contained" 
                                                        onClick={saveEditedLog}
                                                    >
                                                        حفظ
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" justifyContent="space-between">
                                                            <Typography>
                                                                {new Date(log.timestamp).toLocaleString('ar-EG')}
                                                            </Typography>
                                                            <Typography fontWeight="bold">
                                                                {log.status}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <>
                                                            <Typography component="span" display="block">
                                                                {log.notes}
                                                            </Typography>
                                                            <Typography component="span" variant="caption" color="text.secondary">
                                                                المسؤول: {log.agentName || 'غير معروف'}
                                                            </Typography>
                                                        </>
                                                    }
                                                />
                                                <ListItemSecondaryAction>
                                                    <IconButton 
                                                        edge="end" 
                                                        onClick={() => startEditingLog(log)}
                                                        color="primary"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton 
                                                        edge="end" 
                                                        onClick={() => deleteCallLog(log.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </ListItemSecondaryAction>
                                            </>
                                        )}
                                    </ListItem>
                                ))}
                        </List>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            لا توجد مكالمات مسجلة
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCallLogDialog}>إغلاق</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

const defaultFormFields: FormField[] = [
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

const defaultData: Appointment[] = [];

export default DataTable;