import React, { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, Button, Paper, CircularProgress, Snackbar, Alert,
  MenuItem, Stack, FormControl, InputLabel, Select
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Cancel, ArrowBack } from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';

interface Branch {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  branch_id: number;
  department_id: number;
  services: string;
  image?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const DoctorSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Partial<Doctor>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const getAuthToken = () => sessionStorage.getItem('token') || '';

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Doctor = await res.json();
        setDoctor(data);
        setForm(data);
      } catch (err) {
        setSnackbar({ open: true, message: 'حدث خطأ أثناء تحميل بيانات الطبيب', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    const fetchOptions = async () => {
      try {
        const [branchesRes, departmentsRes] = await Promise.all([
          fetchWithAuth('https://www.ss.mastersclinics.com/branches'),
          fetchWithAuth('https://www.ss.mastersclinics.com/departments')
        ]);
        setBranchOptions(await branchesRes.json());
        setDepartmentOptions(await departmentsRes.json());
      } catch (err) {
        setSnackbar({ open: true, message: 'فشل تحميل الفروع أو الأقسام', severity: 'error' });
      }
    };

    if (id) {
      fetchData();
      fetchOptions();
    }
  }, [id]);

  const handleChange = (field: keyof Doctor, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', form.name || '');
      formData.append('specialty', form.specialty || '');
      formData.append('services', form.services || '');
      formData.append('branch_id', String(form.branch_id || ''));
      formData.append('department_id', String(form.department_id || ''));
      formData.append('priority', String(form.priority ?? 0));
      formData.append('is_active', String(form.is_active ?? true));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const updated = await res.json();
      setDoctor(updated);
      setForm(updated);
      setImageFile(null);
      setImagePreview(null);
      setEditMode(false);
      setSnackbar({ open: true, message: 'تم التحديث بنجاح', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'فشل تحديث بيانات الطبيب', severity: 'error' });
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (!doctor) return <Typography variant="h6" color="error" align="center">لا توجد بيانات لهذا الطبيب</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>عودة</Button>
      <Typography variant="h4" gutterBottom>تفاصيل الطبيب: {doctor.name}</Typography>
      <Box component={Paper} sx={{ p: 3, mt: 2 }}>
        <Stack spacing={2}>
          <TextField label="الاسم" value={form.name || ''} onChange={(e) => handleChange('name', e.target.value)} fullWidth disabled={!editMode} />
          <TextField label="التخصص" value={form.specialty || ''} onChange={(e) => handleChange('specialty', e.target.value)} fullWidth disabled={!editMode} />
          <TextField label="الخدمات" value={form.services || ''} onChange={(e) => handleChange('services', e.target.value)} fullWidth multiline rows={4} disabled={!editMode} />

          <FormControl fullWidth disabled={!editMode}>
            <InputLabel>الفرع</InputLabel>
            <Select value={form.branch_id || ''} onChange={(e) => handleChange('branch_id', e.target.value)} label="الفرع">
              {branchOptions.map((branch) => <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl fullWidth disabled={!editMode}>
            <InputLabel>القسم</InputLabel>
            <Select value={form.department_id || ''} onChange={(e) => handleChange('department_id', e.target.value)} label="القسم">
              {departmentOptions.map((dep) => <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>)}
            </Select>
          </FormControl>

          <TextField label="الأولوية" type="number" value={form.priority ?? 0} onChange={(e) => handleChange('priority', parseInt(e.target.value))} fullWidth disabled={!editMode} />

          <FormControl fullWidth disabled={!editMode}>
            <InputLabel>الحالة</InputLabel>
            <Select value={String(form.is_active ?? true)} onChange={(e) => handleChange('is_active', e.target.value === 'true')} label="الحالة">
              <MenuItem value="true">نشط</MenuItem>
              <MenuItem value="false">غير نشط</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography variant="subtitle1" gutterBottom>صورة الطبيب:</Typography>
            {imagePreview ? (
              <img src={imagePreview} alt="New preview" style={{ maxWidth: 200, borderRadius: 8, marginTop: 8 }} />
            ) : doctor.image ? (
              <img src={`https://www.ss.mastersclinics.com${doctor.image}`} alt="Current doctor" style={{ maxWidth: 200, borderRadius: 8, marginTop: 8 }} />
            ) : (
              <Typography variant="body2" color="textSecondary">لا توجد صورة متاحة</Typography>
            )}
            {editMode && (
              <Box mt={2}>
                <Button component="label" startIcon={<ImageIcon />} variant="outlined">
                  {doctor.image ? 'تغيير الصورة' : 'تحميل صورة'}
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {imageFile && <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>الملف المحدد: {imageFile.name}</Typography>}
              </Box>
            )}
          </Box>

          <TextField label="تاريخ الإنشاء" value={doctor.created_at} fullWidth disabled />
          <TextField label="آخر تعديل" value={doctor.updated_at} fullWidth disabled />
        </Stack>
      </Box>

      {editMode ? (
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" startIcon={<Save />} onClick={handleSave}>حفظ</Button>
          <Button variant="outlined" color="secondary" startIcon={<Cancel />} onClick={() => { setEditMode(false); setImageFile(null); setImagePreview(null); setForm(doctor); }}>إلغاء</Button>
        </Stack>
      ) : (
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setEditMode(true)}>تعديل البيانات</Button>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorSingle;