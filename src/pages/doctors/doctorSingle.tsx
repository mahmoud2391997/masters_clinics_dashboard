import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, IconButton, Paper, CircularProgress,
  FormControlLabel, Checkbox, Stack, Snackbar, Alert, Switch,
  MenuItem
} from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';

interface WorkingHoursSlot {
  days: string[];
  openingTime: string;
  closingTime: string;
}

interface Doctor {
  id: number;
  name: string;
  title?: string;
  description?: string;
  position?: string;
  practice_area?: string;
  experience?: string;
  address?: string;
  phone?: string;
  email?: string;
  personal_experience?: string;
  education: string[];
  skills: string[];
  achievements: string[];
  working_hours: WorkingHoursSlot[];
  branches_ids: number[];
  department_id: number;
  image: string | null;
}

interface Branch {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const getDayName = (day: string) => {
  const dayNames: Record<string, string> = {
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
  };
  return dayNames[day] || day;
};

const DoctorSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Partial<Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [useFileUpload, setUseFileUpload] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const getAuthToken = () => {
    return sessionStorage.getItem('token') || '';
  };

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`http://localhost:3000/doctors/${id}`);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();

        const parsedDoctor: Doctor = {
          ...data,
          education: data.education || [],
          skills: data.skills || [],
          achievements: data.achievements || [],
          working_hours: data.working_hours || [],
          branches_ids: Array.isArray(data.branches_ids) ? data.branches_ids : 
                       (data.branches_ids ? JSON.parse(data.branches_ids) : []),
          department_id: data.department_id || 0,
          image: data.image || null
        };

        setDoctor(parsedDoctor);
        setForm(parsedDoctor);
      } catch (error) {
        console.error('Error fetching doctor:', error);
        setSnackbar({ open: true, message: 'حدث خطأ أثناء جلب بيانات الطبيب', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const fetchBranchesAndDepartments = async () => {
      try {
        setOptionsLoading(true);
        const [branchesRes, departmentsRes] = await Promise.all([
          fetchWithAuth('http://localhost:3000/branches'),
          fetchWithAuth('http://localhost:3000/departments')
        ]);
        
        if (!branchesRes.ok || !departmentsRes.ok) {
          throw new Error('Failed to fetch options');
        }
        
        const branches = await branchesRes.json();
        const departments = await departmentsRes.json();
        
        setBranchOptions(Array.isArray(branches) ? branches : []);
        setDepartmentOptions(Array.isArray(departments) ? departments : []);
      } catch (error) {
        console.error('Error fetching options:', error);
        setSnackbar({ open: true, message: 'حدث خطأ أثناء جلب بيانات الفروع والأقسام', severity: 'error' });
        setBranchOptions([]);
        setDepartmentOptions([]);
      } finally {
        setOptionsLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
      fetchBranchesAndDepartments();
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name: keyof Doctor, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
  };

  const addWorkingHoursSlot = () => {
    setForm((prev) => ({
      ...prev,
      working_hours: [
        ...(prev.working_hours || []),
        { days: [], openingTime: '', closingTime: '' },
      ],
    }));
  };

  const removeWorkingHoursSlot = (index: number) => {
    setForm((prev) => {
      const updated = [...(prev.working_hours || [])];
      updated.splice(index, 1);
      return { ...prev, working_hours: updated };
    });
  };

  const handleDayToggle = (slotIndex: number, day: string) => {
    setForm((prev) => {
      const slots = [...(prev.working_hours || [])];
      const currentDays = slots[slotIndex].days;
      if (currentDays.includes(day)) {
        slots[slotIndex].days = currentDays.filter((d) => d !== day);
      } else {
        slots[slotIndex].days = [...currentDays, day];
      }
      return { ...prev, working_hours: slots };
    });
  };

  const handleWorkingHoursChange = (slotIndex: number, field: string, value: string) => {
    setForm((prev) => {
      const slots = [...(prev.working_hours || [])];
      slots[slotIndex] = { ...slots[slotIndex], [field]: value };
      return { ...prev, working_hours: slots };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (!id || !doctor) return;

      const formData = new FormData();
      formData.append('name', form.name || '');
      formData.append('title', form.title || '');
      formData.append('description', form.description || '');
      formData.append('position', form.position || '');
      formData.append('practice_area', form.practice_area || '');
      formData.append('experience', form.experience || '');
      formData.append('address', form.address || '');
      formData.append('phone', form.phone || '');
      formData.append('email', form.email || '');
      formData.append('personal_experience', form.personal_experience || '');
      formData.append('education', JSON.stringify(form.education || []));
      formData.append('skills', JSON.stringify(form.skills || []));
      formData.append('achievements', JSON.stringify(form.achievements || []));
      formData.append('working_hours', JSON.stringify(form.working_hours || []));
      formData.append('branches_ids', JSON.stringify(form.branches_ids || []));
      formData.append('department_id', form.department_id?.toString() || '');

      if (useFileUpload && imageFile) {
        formData.append('image', imageFile);
      } else if (!useFileUpload && form.image) {
        formData.append('imageUrl', form.image);
      }

      const res = await fetchWithAuth(`http://localhost:3000/doctors/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save doctor');
      }

      const updated = await res.json();
      setDoctor(updated);
      setForm(updated);
      setEditMode(false);
      setImagePreview(null);
      setImageFile(null);
      setSnackbar({ open: true, message: 'تم الحفظ بنجاح', severity: 'success' });
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      setSnackbar({ open: true, message: error.message || 'حدث خطأ أثناء الحفظ', severity: 'error' });
    }
  };

  const handleCancel = () => {
    if (doctor) {
      setForm(doctor);
      setImagePreview(null);
      setImageFile(null);
      setEditMode(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الطبيب؟')) return;

    try {
      const res = await fetchWithAuth(`http://localhost:3000/doctors/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete doctor');
      }

      setSnackbar({ open: true, message: 'تم حذف الطبيب بنجاح', severity: 'success' });
      navigate('/doctors');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      setSnackbar({ open: true, message: 'حدث خطأ أثناء الحذف', severity: 'error' });
    }
  };

  const getBranchName = (id: number) => {
    const branch = branchOptions.find(b => b.id === id);
    return branch ? branch.name : id.toString();
  };

  const getDepartmentName = (id: number) => {
    if (!Array.isArray(departmentOptions)) return id.toString();
    const dept = departmentOptions.find(d => d.id === id);
    return dept ? dept.name : id.toString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6">الطبيب غير موجود</Typography>
        <Button variant="contained" onClick={() => navigate(-1)}>العودة</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }} dir="rtl">
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ ml: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{doctor.name}</Typography>
        <Box flexGrow={1} />
        {editMode ? (
          <>
            <Button color="success" startIcon={<Save />} onClick={handleSave} sx={{ ml: 2 }}>حفظ</Button>
            <Button color="error" startIcon={<Cancel />} onClick={handleCancel}>إلغاء</Button>
          </>
        ) : (
          <>
            <Button startIcon={<Edit />} onClick={() => setEditMode(true)} sx={{ ml: 2 }}>تعديل</Button>
            <Button color="error" startIcon={<Delete />} onClick={handleDelete}>حذف</Button>
          </>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3 }}>
        <TextField
          label="الاسم"
          name="name"
          value={editMode ? form.name || '' : doctor.name || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="اللقب"
          name="title"
          value={editMode ? form.title || '' : doctor.title || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="الوصف"
          name="description"
          value={editMode ? form.description || '' : doctor.description || ''}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="المنصب"
          name="position"
          value={editMode ? form.position || '' : doctor.position || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="مجال الممارسة"
          name="practice_area"
          value={editMode ? form.practice_area || '' : doctor.practice_area || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="الخبرة"
          name="experience"
          value={editMode ? form.experience || '' : doctor.experience || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="العنوان"
          name="address"
          value={editMode ? form.address || '' : doctor.address || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="الهاتف"
          name="phone"
          value={editMode ? form.phone || '' : doctor.phone || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="البريد الإلكتروني"
          name="email"
          value={editMode ? form.email || '' : doctor.email || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="الخبرة الشخصية"
          name="personal_experience"
          value={editMode ? form.personal_experience || '' : doctor.personal_experience || ''}
          onChange={handleChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="التعليم (مفصولة بفواصل)"
          value={editMode ? form.education?.join(', ') || '' : doctor.education?.join(', ') || ''}
          onChange={(e) => handleListChange('education', e.target.value)}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="المهارات (مفصولة بفواصل)"
          value={editMode ? form.skills?.join(', ') || '' : doctor.skills?.join(', ') || ''}
          onChange={(e) => handleListChange('skills', e.target.value)}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <TextField
          label="الإنجازات (مفصولة بفواصل)"
          value={editMode ? form.achievements?.join(', ') || '' : doctor.achievements?.join(', ') || ''}
          onChange={(e) => handleListChange('achievements', e.target.value)}
          fullWidth
          margin="normal"
          disabled={!editMode}
        />

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>الفروع</Typography>
          {editMode ? (
            optionsLoading ? (
              <CircularProgress size={24} />
            ) : (
              <TextField
                select
                SelectProps={{
                  multiple: true,
                  value: form.branches_ids || [],
                  onChange: (e) => {
                    const value = e.target.value as number[];
                    setForm(prev => ({ ...prev, branches_ids: value }));
                  },
                  renderValue: (selected) => {
                    const selectedBranches = selected as number[];
                    return selectedBranches.map(id => getBranchName(id)).join(', ');
                  },
                }}
                fullWidth
              >
                {branchOptions.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    <Checkbox checked={form.branches_ids?.includes(branch.id) || false} />
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>
            )
          ) : (
            <Typography>
              {doctor.branches_ids?.map(id => getBranchName(id)).join(', ') || 'لا يوجد فروع'}
            </Typography>
          )}
        </Box>

        <Box mt={2}>
          <Typography variant="h6" gutterBottom>القسم</Typography>
          {editMode ? (
            optionsLoading ? (
              <CircularProgress size={24} />
            ) : (
              <TextField
                select
                value={form.department_id || ''}
                onChange={(e) => setForm(prev => ({
                  ...prev,
                  department_id: parseInt(e.target.value as string)
                }))}
                fullWidth
              >
                {departmentOptions.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </TextField>
            )
          ) : (
            <Typography>{getDepartmentName(doctor.department_id)}</Typography>
          )}
        </Box>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>ساعات العمل</Typography>
          {(editMode ? form.working_hours || [] : doctor.working_hours || []).map((slot, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography>الفترة {index + 1}</Typography>
                {editMode && (
                  <IconButton onClick={() => removeWorkingHoursSlot(index)} color="error">
                    <Delete />
                  </IconButton>
                )}
              </Box>
              
              <Box mb={2}>
                <Typography>الأيام</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {daysOfWeek.map((day) => (
                    <FormControlLabel
                      key={day}
                      control={
                        <Checkbox
                          checked={slot.days.includes(day)}
                          onChange={() => handleDayToggle(index, day)}
                          disabled={!editMode}
                        />
                      }
                      label={getDayName(day)}
                    />
                  ))}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="وقت البدء"
                  type="time"
                  value={slot.openingTime}
                  onChange={(e) => handleWorkingHoursChange(index, 'openingTime', e.target.value)}
                  fullWidth
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="وقت الانتهاء"
                  type="time"
                  value={slot.closingTime}
                  onChange={(e) => handleWorkingHoursChange(index, 'closingTime', e.target.value)}
                  fullWidth
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Paper>
          ))}
          {editMode && (
            <Button startIcon={<Add />} onClick={addWorkingHoursSlot}>إضافة فترة عمل</Button>
          )}
        </Box>

        <Box mt={3}>
          <Typography variant="h6" gutterBottom>صورة الطبيب</Typography>
          {editMode ? (
            <>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography>طريقة التحميل:</Typography>
                <Switch
                  checked={useFileUpload}
                  onChange={() => setUseFileUpload(!useFileUpload)}
                />
                <Typography>{useFileUpload ? 'رفع ملف' : 'رابط'}</Typography>
              </Stack>
              {useFileUpload ? (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <Button variant="outlined" component="label">
                    اختر صورة
                    <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                  </Button>
                  {imageFile && <Typography>{imageFile.name}</Typography>}
                </Stack>
              ) : (
                <TextField
                  fullWidth
                  label="رابط الصورة"
                  value={form.image || ''}
                  onChange={(e) => setForm(prev => ({ ...prev, image: e.target.value }))}
                  sx={{ mt: 1 }}
                />
              )}
              {(imagePreview || form.image) && (
                <img
                  src={imagePreview || form.image || ''}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8, marginTop: 16 }}
                />
              )}
            </>
          ) : doctor.image ? (
            <img
              src={doctor.image}
              alt={doctor.name}
              style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
            />
          ) : (
            <Typography>لا توجد صورة متاحة</Typography>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorSingle;