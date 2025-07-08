import React, { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Box,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,

  TableBody,
  Checkbox,
  MenuItem,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import { Add,  Save } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

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



const DoctorTable: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    title: '',
    description: '',
    position: '',
    practice_area: '',
    experience: '',
    address: '',
    phone: '',
    email: '',
    personal_experience: '',
    education: [],
    skills: [],
    achievements: [],
    working_hours: [],
    branches_ids: [],
    department_id: 0,
    image: null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get<Doctor[]>('http://localhost:3000/doctors', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        console.log('Fetched Doctors:', response.data);
        
        setDoctors(response.data);
        setFilteredDoctors(response.data);
      } catch (err) {
        setError('فشل في تحميل بيانات الأطباء');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [branchesRes, departmentsRes] = await Promise.all([
          axios.get<Branch[]>('http://localhost:3000/branches', {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }),
          axios.get<Department[]>('http://localhost:3000/departments', {
            headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
          }),
        ]);
        setBranchOptions(branchesRes.data);
        setDepartmentOptions(departmentsRes.data);
      } catch (err) {
        console.error('فشل في تحميل الفروع أو الأقسام', err);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(doctor =>
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doctor.title && doctor.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doctor.practice_area && doctor.practice_area.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDoctors(filtered);
  }, [searchQuery, doctors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name: keyof Doctor, value: string) => {
    setNewDoctor(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!newDoctor.name) {
      setError('الاسم مطلوب');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newDoctor.name);
      formData.append('title', newDoctor.title || '');
      formData.append('description', newDoctor.description || '');
      formData.append('position', newDoctor.position || '');
      formData.append('practice_area', newDoctor.practice_area || '');
      formData.append('experience', newDoctor.experience || '');
      formData.append('address', newDoctor.address || '');
      formData.append('phone', newDoctor.phone || '');
      formData.append('email', newDoctor.email || '');
      formData.append('personal_experience', newDoctor.personal_experience || '');
      formData.append('education', JSON.stringify(newDoctor.education || []));
      formData.append('skills', JSON.stringify(newDoctor.skills || []));
      formData.append('achievements', JSON.stringify(newDoctor.achievements || []));
      formData.append('working_hours', JSON.stringify(newDoctor.working_hours || []));
      formData.append('branches_ids', JSON.stringify(newDoctor.branches_ids || []));
      formData.append('department_id', newDoctor.department_id?.toString() || '');

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await axios.post('http://localhost:3000/doctors', formData, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setDoctors(prev => [...prev, response.data]);
      setFilteredDoctors(prev => [...prev, response.data]);
      setOpenAddDialog(false);
      resetForm();
    } catch (err) {
      setError('فشل في إضافة الطبيب');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewDoctor({
      name: '',
      title: '',
      description: '',
      position: '',
      practice_area: '',
      experience: '',
      address: '',
      phone: '',
      email: '',
      personal_experience: '',
      education: [],
      skills: [],
      achievements: [],
      working_hours: [],
      branches_ids: [],
      department_id: 0,
      image: null,
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const getBranchName = (id: number) => {
    const branch = branchOptions.find(b => b.id === id);
    return branch ? branch.name : id.toString();
  };

  const getDepartmentName = (id: number) => {

    console.log('Department ID:', id);
    
    console.log(departmentOptions);
    
    const dept = departmentOptions.find(d => d.id === id);
    return dept ? dept.name : '-';
  };

  return (
    <Box dir="rtl" className="p-5">
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="بحث بالاسم أو اللقب أو التخصص"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          variant="contained" 
          startIcon={<Add />} 
          onClick={() => setOpenAddDialog(true)}
        >
          إضافة طبيب
        </Button>
      </Box>

      {error && (
        <Box mb={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">الاسم</TableCell>
              <TableCell align="center">اللقب</TableCell>
              <TableCell align="center">المنصب</TableCell>
              <TableCell align="center">التخصص</TableCell>
              <TableCell align="center">القسم</TableCell>
              <TableCell align="center">الهاتف</TableCell>
              <TableCell align="center">البريد الإلكتروني</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <LinearProgress />
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell align="center">{doctor.name}</TableCell>
                  <TableCell align="center">{doctor.title || '-'}</TableCell>
                  <TableCell align="center">{doctor.position || '-'}</TableCell>
                  <TableCell align="center">{doctor.practice_area || '-'}</TableCell>
                  <TableCell align="center">{getDepartmentName(doctor.department_id)}</TableCell>
                  <TableCell align="center">{doctor.phone || '-'}</TableCell>
                  <TableCell align="center">{doctor.email || '-'}</TableCell>
                  <TableCell align="center">
                    <Link to={`/doctors/${doctor.id}`}>
                      <Button variant="outlined" size="small">عرض</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">لا توجد بيانات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

  <Dialog 
  open={openAddDialog} 
  onClose={() => {
    setOpenAddDialog(false);
    resetForm();
  }} 
  fullWidth 
  maxWidth="md"
>
  <DialogTitle>إضافة طبيب جديد</DialogTitle>
  <DialogContent dividers>
    <Stack spacing={3} sx={{ pt: 2 }}>
      <TextField
        label="الاسم *"
        name="name"
        value={newDoctor.name}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="اللقب"
        name="title"
        value={newDoctor.title}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="الوصف"
        name="description"
        value={newDoctor.description}
        onChange={handleInputChange}
        multiline
        rows={3}
        fullWidth
      />

      <TextField
        label="المنصب"
        name="position"
        value={newDoctor.position}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="التخصص"
        name="practice_area"
        value={newDoctor.practice_area}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="الخبرة"
        name="experience"
        value={newDoctor.experience}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="العنوان"
        name="address"
        value={newDoctor.address}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="الهاتف"
        name="phone"
        value={newDoctor.phone}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="البريد الإلكتروني"
        name="email"
        value={newDoctor.email}
        onChange={handleInputChange}
        fullWidth
      />

      <TextField
        label="الخبرة الشخصية"
        name="personal_experience"
        value={newDoctor.personal_experience}
        onChange={handleInputChange}
        multiline
        rows={3}
        fullWidth
      />

      <TextField
        label="التعليم (مفصولة بفاصلة)"
        value={newDoctor.education?.join(', ') || ''}
        onChange={(e) => handleListChange('education', e.target.value)}
        fullWidth
      />

      <TextField
        label="المهارات (مفصولة بفاصلة)"
        value={newDoctor.skills?.join(', ') || ''}
        onChange={(e) => handleListChange('skills', e.target.value)}
        fullWidth
      />

      <TextField
        label="الإنجازات (مفصولة بفاصلة)"
        value={newDoctor.achievements?.join(', ') || ''}
        onChange={(e) => handleListChange('achievements', e.target.value)}
        fullWidth
      />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          الفروع
        </Typography>
        <TextField
          select
          SelectProps={{
            multiple: true,
            value: newDoctor.branches_ids || [],
            onChange: (e) => {
              const value = e.target.value as number[];
              setNewDoctor(prev => ({ ...prev, branches_ids: value }));
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
              <Checkbox checked={newDoctor.branches_ids?.includes(branch.id) || false} />
              {branch.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          القسم
        </Typography>
        <TextField
          select
          value={newDoctor.department_id || ''}
          onChange={(e) => setNewDoctor(prev => ({
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
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          صورة الملف الشخصي
        </Typography>
        <Button
          variant="outlined"
          component="label"
          fullWidth
        >
          تحميل صورة
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>
        {imagePreview && (
          <Box mt={2} textAlign="center">
            <img
              src={imagePreview}
              alt="Preview"
              style={{
                maxHeight: '200px',
                maxWidth: '100%',
                borderRadius: '4px'
              }}
            />
          </Box>
        )}
      </Box>
    </Stack>
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={() => {
        setOpenAddDialog(false);
        resetForm();
      }}
      color="secondary"
    >
      إلغاء
    </Button>
    <Button
      onClick={handleSubmit}
      variant="contained"
      color="primary"
      disabled={submitting || !newDoctor.name}
      startIcon={submitting ? <CircularProgress size={20} /> : <Save />}
    >
      {submitting ? 'جاري الحفظ...' : 'حفظ'}
    </Button>
  </DialogActions>
</Dialog>
   </Box>
  );
};

export default DoctorTable;
