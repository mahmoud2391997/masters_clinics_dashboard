import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button,  Paper, CircularProgress,
  Snackbar, Alert, Switch, MenuItem, Stack, FormControl, InputLabel, Select, Chip
} from '@mui/material';
import {  Save, Cancel, ArrowBack } from '@mui/icons-material';

interface WorkingHoursSlot {
  days: string[];
  openingTime: string;
  closingTime: string;
}

interface Doctor {
  id: number;
  name: string;
  title: string;
  description: string;
  position: string;
  practice_area: string;
  experience: string;
  address: string;
  phone: string;
  email: string;
  personal_experience: string;
  education: string[];
  skills: string[];
  achievements: string[];
  working_hours: WorkingHoursSlot[];
  branches_ids: number[];
  department_id: number;
  image: string | null;
  created_at: string;
  updated_at: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

const parseArrayField = (field: any): string[] => {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
      return [field];
    } catch {
      return [field];
    }
  }
  return [];
};

const DoctorSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Partial<Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const getAuthToken = () => sessionStorage.getItem('token') || '';

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await fetchWithAuth(`https://www.ss.mastersclinics.com/doctors/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const parsedDoctor: Doctor = {
          ...data,
          education: parseArrayField(data.education),
          skills: parseArrayField(data.skills),
          achievements: parseArrayField(data.achievements),
          working_hours: data.working_hours || [],
         branches_ids: Array.isArray(data.branches_ids) ? data.branches_ids :
  (data.branches_ids ? JSON.parse(data.branches_ids) : []),

          department_id: data.department_id || 0,
          image: data.image || null,
        };
console.log(parsedDoctor);

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
          fetchWithAuth('https://www.ss.mastersclinics.com/branches'),
          fetchWithAuth('https://www.ss.mastersclinics.com/departments')
        ]);

        if (!branchesRes.ok || !departmentsRes.ok) throw new Error('Failed to fetch options');

        const branches = await branchesRes.json();
        const departments = await departmentsRes.json();

        setBranchOptions(Array.isArray(branches) ? branches : []);
        setDepartmentOptions(Array.isArray(departments) ? departments : []);
      } catch (error) {
        console.error('Error fetching options:', error);
        setSnackbar({ open: true, message: 'حدث خطأ أثناء جلب بيانات الفروع والأقسام', severity: 'error' });
      } finally {
        setOptionsLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
      fetchBranchesAndDepartments();
    }
  }, [id]);

  const handleChange = (field: keyof Doctor, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: keyof Doctor, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()),
    }));
  };

 const handleSave = async () => {
  try {
    // Ensure branches_ids is always an array
    const formData = {
      ...form,
      branches_ids: Array.isArray(form.branches_ids) ? form.branches_ids : [],
      education: form.education || [],
      skills: form.skills || [],
      achievements: form.achievements || [],
      working_hours: form.working_hours || []
    };

    const res = await fetchWithAuth(`http://localhost:3000/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    setDoctor(form as Doctor);
    setEditMode(false);
    setSnackbar({ open: true, message: 'تم تحديث بيانات الطبيب بنجاح', severity: 'success' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    setSnackbar({ open: true, message: 'حدث خطأ أثناء تحديث بيانات الطبيب', severity: 'error' });
  }
};
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!doctor) {
    return (
      <Typography variant="h6" color="error" align="center">
        لا يوجد بيانات لهذا الطبيب
      </Typography>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
        عودة
      </Button>

      <Typography variant="h4" gutterBottom>
        تفاصيل الطبيب: {doctor.name}
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Switch checked={editMode} onChange={() => setEditMode(!editMode)} />
        <Typography>وضع التعديل</Typography>
      </Stack>

      <Box component={Paper} sx={{ p: 2, mt: 2 }}>
        <TextField
          label="الاسم"
          value={form.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="اللقب"
          value={form.title || ''}
          onChange={(e) => handleChange('title', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="الوصف"
          value={form.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
          multiline
          rows={3}
        />
        
        <TextField
          label="المنصب"
          value={form.position || ''}
          onChange={(e) => handleChange('position', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="مجال الممارسة"
          value={form.practice_area || ''}
          onChange={(e) => handleChange('practice_area', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="الخبرة"
          value={form.experience || ''}
          onChange={(e) => handleChange('experience', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="العنوان"
          value={form.address || ''}
          onChange={(e) => handleChange('address', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
          multiline
          rows={2}
        />
        
        <TextField
          label="الهاتف"
          value={form.phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="البريد الإلكتروني"
          value={form.email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
        />
        
        <TextField
          label="التجربة الشخصية"
          value={form.personal_experience || ''}
          onChange={(e) => handleChange('personal_experience', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
          multiline
          rows={4}
        />
        
        <TextField
          label="المؤهلات (تعليم)"
          value={form.education?.join(', ') || ''}
          onChange={(e) => handleArrayChange('education', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
          helperText="افصل بين العناصر بفاصلة"
        />
        
        <TextField
          label="المهارات"
          value={form.skills?.join(', ') || ''}
          onChange={(e) => handleArrayChange('skills', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
          helperText="افصل بين العناصر بفاصلة"
        />
        
        <TextField
          label="الإنجازات"
          value={form.achievements?.join(', ') || ''}
          onChange={(e) => handleArrayChange('achievements', e.target.value)}
          fullWidth
          disabled={!editMode}
          margin="normal"
          helperText="افصل بين العناصر بفاصلة"
        />

        <FormControl fullWidth margin="normal" disabled={!editMode || optionsLoading}>
          <InputLabel>الفروع</InputLabel>
          <Select
            multiple
            value={form.branches_ids || []}
            onChange={(e) => handleChange('branches_ids', e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip key={value} label={branchOptions.find(b => b.id === value)?.name || value} />
                ))}
              </Box>
            )}
          >
            {branchOptions.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" disabled={!editMode || optionsLoading}>
          <InputLabel>القسم</InputLabel>
          <Select
            value={form.department_id || ''}
            onChange={(e) => handleChange('department_id', e.target.value)}
          >
            {departmentOptions.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="تاريخ الإنشاء"
          value={form.created_at || ''}
          fullWidth
          disabled
          margin="normal"
        />
        
        <TextField
          label="تاريخ التحديث"
          value={form.updated_at || ''}
          fullWidth
          disabled
          margin="normal"
        />
      </Box>

      {editMode && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" startIcon={<Save />} onClick={handleSave}>
            حفظ
          </Button>
          <Button variant="outlined" color="secondary" startIcon={<Cancel />} onClick={() => setEditMode(false)}>
            إلغاء
          </Button>
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorSingle;