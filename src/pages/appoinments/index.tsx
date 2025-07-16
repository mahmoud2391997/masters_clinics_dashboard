import React, { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import {
  Box, TextField, MenuItem, TableContainer, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemText, Typography, IconButton,
  ListItemSecondaryAction, Chip, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { updateAppointments, deleteAppointment } from '../../api/landingPages';

interface DataTableProps {
  formFields?: FormField[];
  data?: Appointment[];
  onDelete?: (id: string) => void;
  onView?: (row: Appointment) => void;
  userRole: 'customercare' | 'mediabuyer' | 'admin';
}

interface FormField {
  key: string;
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
  utmSource?: string;
  doctor?: string;
  offer?: string;
  callLogs?: CallLog[];
  [key: string]: any;
}

interface CallLog {
  id?: string;
  timestamp: string;
  status: string;
  notes?: string;
  agentName?: string;
  editedBy?: string;
}

interface State {
  search: string;
  branchFilter: string;
  loading: boolean;
  error: string | null;
  fetchedData: Appointment[];
  selectedAppointment: Appointment | null;
  callLogDialogOpen: boolean;
  newCallLogStatus: string;
  newCallLogNotes: string;
  editingLogId: string | null;
  editedLogStatus: string;
  editedLogNotes: string;
  deleteConfirmOpen: boolean;
  appointmentToDelete: string | null;
  currentPage: number;
  totalPages: number;
}

const statusColors: Record<string, 'warning' | 'info' | 'success' | 'error' | 'default'> = {
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

const DataTable: React.FC<Partial<DataTableProps>> = ({
  formFields = defaultFormFields,
  data = defaultData,
  userRole = 'customercare'
}) => {
  const [state, setState] = useState<State>({
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
    currentPage: 1,
    totalPages: 1,
  });

  const {
    search, branchFilter, loading, error, fetchedData,
    selectedAppointment, callLogDialogOpen,
    newCallLogStatus, newCallLogNotes,
    editingLogId, editedLogStatus, editedLogNotes,
    deleteConfirmOpen, appointmentToDelete,
    currentPage, totalPages,
  } = state;

  const role = userRole || (sessionStorage.getItem("role") ?? 'customercare');
  const username = sessionStorage.getItem("username") || 'غير معروف';

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

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetchWithToken(`https://www.ss.mastersclinics.com/appointments?page=${currentPage}`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      setState(prev => ({
        ...prev,
        fetchedData: data.appointments || [],
        totalPages: data.totalPages || 1,
        loading: false,
      }));
    } catch (err) {
      setState(prev => ({ ...prev, error: 'فشل في تحميل البيانات', loading: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const branchOptions = useMemo(() => {
    const branches = (fetchedData || []).map(d => d.branch).filter(Boolean);
    return Array.from(new Set(branches));
  }, [fetchedData]);

  const hasUtmSource = useMemo(() => {
    return fetchedData.some(row => !!row.utmSource);
  }, [fetchedData]);

  const visibleFormFields = useMemo(() => {
    if (role === 'customercare' && !hasUtmSource) {
      return formFields.filter(field => field.key !== 'utmSource');
    }
    return formFields;
  }, [formFields, role, hasUtmSource]);

  const deepSearch = (obj: any, searchTerm: string): boolean => {
    if (!obj) return false;
    return Object.values(obj).some(val => {
      if (typeof val === 'object' && val !== null) return deepSearch(val, searchTerm);
      const stringValue = String(val ?? '').toLowerCase();
      return stringValue.includes(searchTerm.toLowerCase());
    });
  };

  const getLastCallStatus = (appointment: Appointment): CallLog | null => {
    if (!appointment.callLogs || appointment.callLogs.length === 0) {
      return null;
    }
    const sortedLogs = [...appointment.callLogs].sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedLogs[0];
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

  const handleChange = (field: keyof State) => (e: ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, [field]: e.target.value }));
  };

  const openCallLogDialog = (appointment: Appointment) => {
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
    if (!selectedAppointment || !newCallLogStatus || !statusOptions.includes(newCallLogStatus)) return;

    try {
      const newLog: CallLog = {
        timestamp: new Date().toISOString(),
        status: newCallLogStatus,
        notes: newCallLogNotes,
        agentName: username || 'غير معروف'
      };

      const updatedLogs = [...(selectedAppointment.callLogs || []), newLog];
      await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });

      await fetchData(); // Refresh data after update

      setState(prev => ({
        ...prev,
        newCallLogStatus: '',
        newCallLogNotes: ''
      }));
    } catch (err) {
      console.error('Failed to add call log:', err);
      setState(prev => ({ ...prev, error: 'فشل في إضافة سجل الاتصال' }));
    }
  };

  const startEditingLog = (log: CallLog) => {
    setState(prev => ({
      ...prev,
      editingLogId: log.id ?? null,
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
            timestamp: new Date().toISOString(),
            editedBy: username
          }
          : log
      );

      await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });

      await fetchData(); // Refresh data after update

      setState(prev => ({
        ...prev,
        editingLogId: null,
        editedLogStatus: '',
        editedLogNotes: ''
      }));
    } catch (err) {
      console.error('Failed to save edited call log:', err);
      setState(prev => ({ ...prev, error: 'فشل في حفظ التعديلات' }));
    }
  };

  const deleteCallLog = async (logId: string) => {
    if (!selectedAppointment) return;

    try {
      const updatedLogs = (selectedAppointment.callLogs || []).filter(log => log.id !== logId);
      await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs });

      await fetchData(); // Refresh data after update
    } catch (err) {
      console.error('Failed to delete call log:', err);
      setState(prev => ({ ...prev, error: 'فشل في حذف سجل الاتصال' }));
    }
  };

  const openDeleteConfirm = (appointmentId: string) => {
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
    if (!appointmentToDelete) return;

    try {
      await deleteAppointment(appointmentToDelete);
      await fetchData(); // Refresh data after deletion
      closeDeleteConfirm();
    } catch (err) {
      console.error('Failed to delete appointment:', err);
      setState(prev => ({
        ...prev,
        error: 'فشل في حذف الموعد',
        deleteConfirmOpen: false,
        appointmentToDelete: null
      }));
    }
  };

  const renderDoctorOffer = (row: Appointment) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {row.doctor && <Typography variant="body2">الطبيب: {row.doctor}</Typography>}
      {row.offer && <Typography variant="body2">العرض: {row.offer}</Typography>}
      {!row.doctor && !row.offer && '-'}
    </Box>
  );

  return (
    <>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="بحث"
          value={search}
          onChange={handleChange('search')}
          sx={{ minWidth: 200 }}
        />
        <TextField
          select
          label="فرع"
          value={branchFilter}
          onChange={handleChange('branchFilter')}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">الكل</MenuItem>
          {branchOptions.map(branch => (
            <MenuItem key={branch} value={branch}>{branch}</MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small" aria-label="appointments table">
          <TableHead>
            <TableRow>
              {visibleFormFields.map(field => (
                <TableCell key={field.key} align="left">{field.label}</TableCell>
              ))}
              <TableCell>آخر حالة</TableCell>
              <TableCell>سجلات الاتصال</TableCell>
              {role === 'mediabuyer' && <TableCell>إجراءات</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={visibleFormFields.length + 3} align="center">... جاري التحميل</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={visibleFormFields.length + 3} align="center" sx={{ color: 'red' }}>{error}</TableCell>
              </TableRow>
            )}
            {!loading && filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleFormFields.length + 3} align="center">لا توجد بيانات</TableCell>
              </TableRow>
            )}
            {filteredData.map(row => {
              const lastCall = getLastCallStatus(row);
              return (
                <TableRow key={row.id} hover>
                  {visibleFormFields.map(field => (
                    <TableCell key={field.key}>
                      {field.key === 'createdAt'
                        ? new Date(row[field.key]).toLocaleString('ar-EG')
                        : field.key === 'doctor_offer'
                          ? renderDoctorOffer(row)
                          : (row[field.key] ?? '-')}
                    </TableCell>
                  ))}
                  <TableCell>
                    {lastCall ? (
                      <Tooltip title={`${new Date(lastCall.timestamp).toLocaleString('ar-EG')} - ${lastCall.agentName}`}>
                        <Chip
                          label={lastCall.status}
                          color={statusColors[lastCall.status] || 'default'}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      <Chip label="لا يوجد" color="default" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openCallLogDialog(row)}
                      sx={{ mr: 1 }}
                    >
                      عرض ({(row.callLogs?.length) || 0})
                    </Button>
                  </TableCell>
                  {role === 'mediabuyer' && (
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDeleteConfirm(row.id)}
                        startIcon={<DeleteIcon fontSize="small" />}
                      >
                        حذف الموعد
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          disabled={currentPage === 1}
          onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          size="small"
        >
          الصفحة السابقة
        </Button>
        <Typography variant="body2" sx={{ alignSelf: 'center' }}>
          الصفحة {currentPage} من {totalPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={() => setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          size="small"
        >
          الصفحة التالية
        </Button>
      </Box>

      {/* Call Log Dialog */}
      <Dialog open={callLogDialogOpen} onClose={closeCallLogDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box>
            <Typography variant="h6">سجلات الاتصال: {selectedAppointment?.name} - {selectedAppointment?.phone}</Typography>
            <Box sx={{ mt: 1 }}>
              {selectedAppointment?.doctor && (
                <Typography variant="body2">الطبيب: {selectedAppointment.doctor}</Typography>
              )}
              {selectedAppointment?.offer && (
                <Typography variant="body2">العرض: {selectedAppointment.offer}</Typography>
              )}
            </Box>
          </Box>
          <IconButton
            aria-label="close"
            onClick={closeCallLogDialog}
            sx={{ position: 'absolute', left: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List dense>
            {(selectedAppointment?.callLogs || []).map(log => (
              <ListItem key={log.id} alignItems="flex-start" divider>
                {editingLogId === log.id ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      select
                      label="الحالة"
                      value={editedLogStatus}
                      onChange={e => setState(prev => ({ ...prev, editedLogStatus: e.target.value }))}
                      fullWidth
                      margin="dense"
                      size="small"
                    >
                      {statusOptions.map(status => (
                        <MenuItem key={status} value={status}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={status}
                              color={statusColors[status] || 'default'}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {status}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="ملاحظات"
                      value={editedLogNotes}
                      onChange={e => setState(prev => ({ ...prev, editedLogNotes: e.target.value }))}
                      fullWidth
                      multiline
                      rows={2}
                      margin="dense"
                      size="small"
                    />
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button onClick={cancelEditing} size="small">إلغاء</Button>
                      <Button variant="contained" onClick={saveEditedLog} size="small">حفظ</Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={log.status}
                            color={statusColors[log.status] || 'default'}
                            size="small"
                          />
                          {log.editedBy && (
                            <Typography variant="caption" color="text.secondary">
                              (تم التعديل بواسطة: {log.editedBy})
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {log.notes || 'لا توجد ملاحظات'}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString('ar-EG', { timeZone: 'UTC' })
} - الوكيل: {log.agentName || 'غير معروف'}
                          </Typography>
                        </>
                      }
                    />
                    {(role === 'customercare' || role === 'admin') && (
                      <ListItemSecondaryAction>
                        <Tooltip title="تعديل">
                          <IconButton edge="end" aria-label="edit" onClick={() => startEditingLog(log)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton edge="end" aria-label="delete" onClick={() => log.id && deleteCallLog(log.id)} size="small">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </>
                )}
              </ListItem>
            ))}
          </List>

          {(role === 'customercare' || role === 'admin') && (
            <Box sx={{ mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>إضافة سجل جديد</Typography>
              <TextField
                select
                label="الحالة"
                value={newCallLogStatus}
                onChange={handleChange('newCallLogStatus')}
                fullWidth
                margin="dense"
                size="small"
                required
              >
                {statusOptions.map(status => (
                  <MenuItem key={status} value={status}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={status}
                        color={statusColors[status] || 'default'}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {status}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ملاحظات"
                value={newCallLogNotes}
                onChange={handleChange('newCallLogNotes')}
                fullWidth
                multiline
                rows={2}
                margin="dense"
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 1 }}
                onClick={addNewCallLog}
                disabled={!newCallLogStatus}
                size="small"
              >
                إضافة سجل
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCallLogDialog} size="small">إغلاق</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={closeDeleteConfirm}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Alert severity="warning">هل أنت متأكد أنك تريد حذف هذا الموعد؟ هذا الإجراء لا يمكن التراجع عنه.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            إلغاء
          </Button>
          <Button onClick={confirmDeleteAppointment} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const defaultFormFields: FormField[] = [
  { key: "name", label: "الاسم" },
  { key: "phone", label: "الهاتف" },
  { key: "branch", label: "الفرع" },
  { key: "doctor_offer", label: "الطبيب/العرض" },
  { key: "pageCreator", label: "منشئ الصفحة" },
  { key: "pageTitle", label: "عنوان الصفحة" },
  { key: "utmSource", label: "المصدر" },
  { key: "createdAt", label: "تاريخ الإنشاء" }
];

const defaultData: Appointment[] = [];

export default DataTable;