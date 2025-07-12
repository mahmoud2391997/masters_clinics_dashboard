import React, { useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Button, Paper, Avatar, Divider, CircularProgress,
  Chip, MenuItem, Select, FormControl, InputLabel, IconButton, List, ListItem, ListItemText
} from '@mui/material';
import { Edit, Save, Cancel, Delete, Add, Close } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SubservicesPage from './subServices';

interface Doctor {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Service {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  capabilities: string[];
  approach: string;
  doctors_ids: number[];
  branches: number[];
  department_id?: number | null;
  image?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = 'https://www.ss.mastersclinics.com';

const getAuthToken = (): string | null => {
  return sessionStorage.getItem('token');
};

const parseIds = (ids: string | number[] | null): number[] => {
  if (!ids) return [];
  if (Array.isArray(ids)) return ids.map(id => Number(id));
  try {
    const parsed = JSON.parse(ids);
    return Array.isArray(parsed) ? parsed.map(id => Number(id)) : [];
  } catch {
    return [];
  }
};

const fetchServiceById = async (id: string | number): Promise<Service> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/services/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'فشل في جلب البيانات');
  }
  const data = await response.json();
  
  return {
    ...data,
    id: data.id,
    branches: parseIds(data.branches),
    doctors_ids: parseIds(data.doctors_ids),
    capabilities: data.capabilities ? (typeof data.capabilities === 'string' ? JSON.parse(data.capabilities) : data.capabilities) : [],
    department_id: data.department_id || null,
  };
};

const ServiceSinglePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Omit<Service, 'id' | 'created_at' | 'updated_at'>>({
    title: '',
    subtitle: '',
    description: '',
    capabilities: [],
    approach: '',
    doctors_ids: [],
    branches: [],
    department_id: null,
    image: ''
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCapability, setNewCapability] = useState('');
  const [newDoctorId, setNewDoctorId] = useState<number | ''>('');
  const [newBranchId, setNewBranchId] = useState<number | ''>('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken();
        const [serviceData, doctorsRes, branchesRes, departmentsRes] = await Promise.all([
          id ? fetchServiceById(id) : Promise.reject('معرف غير موجود'),
          fetch(`${API_BASE_URL}/doctors`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
          fetch(`${API_BASE_URL}/branches`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
          fetch(`${API_BASE_URL}/departments`, { headers: { Authorization: `Bearer ${token}` } }).then(res => res.json()),
        ]);

        setService(serviceData);
        setDoctors(doctorsRes);
        setBranches(branchesRes);
        setDepartments(departmentsRes);

        setForm({
          title: serviceData.title || '',
          subtitle: serviceData.subtitle || '',
          description: serviceData.description || '',
          capabilities: serviceData.capabilities || [],
          approach: serviceData.approach || '',
          doctors_ids: serviceData.doctors_ids || [],
          branches: serviceData.branches || [],
          department_id: serviceData.department_id || null,
          image: serviceData.image || ''
        });
        setPreviewImage(serviceData.image || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: any) => {
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match('image.*')) {
        setError('الرجاء اختيار ملف صورة');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCapability = () => {
    if (newCapability.trim()) {
      setForm(prev => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()]
      }));
      setNewCapability('');
    }
  };

  const handleRemoveCapability = (index: number) => {
    setForm(prev => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== index)
    }));
  };

  const handleAddDoctor = () => {
    if (newDoctorId && !form.doctors_ids.includes(newDoctorId)) {
      setForm(prev => ({
        ...prev,
        doctors_ids: [...prev.doctors_ids, newDoctorId]
      }));
      setNewDoctorId('');
    }
  };

  const handleRemoveDoctor = (doctorId: number) => {
    setForm(prev => ({
      ...prev,
      doctors_ids: prev.doctors_ids.filter(id => id !== doctorId)
    }));
  };

  const handleAddBranch = () => {
    if (newBranchId && !form.branches.includes(newBranchId)) {
      setForm(prev => ({
        ...prev,
        branches: [...prev.branches, newBranchId]
      }));
      setNewBranchId('');
    }
  };

  const handleRemoveBranch = (branchId: number) => {
    setForm(prev => ({
      ...prev,
      branches: prev.branches.filter(id => id !== branchId)
    }));
  };

  const handleSave = async () => {
    if (!form || !id) return;
    setLoading(true);
    setError(null);
    const token = getAuthToken();

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("subtitle", form.subtitle || '');
      formData.append("description", form.description);
      formData.append("capabilities", JSON.stringify(form.capabilities));
      formData.append("approach", form.approach);
      formData.append("doctors_ids", JSON.stringify(form.doctors_ids));
      formData.append("branches", JSON.stringify(form.branches));
      if (form.department_id) formData.append("department_id", form.department_id.toString());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في التحديث');
      }

      const updatedService = await fetchServiceById(id);
      setService(updatedService);
      setForm({
        title: updatedService.title || '',
        subtitle: updatedService.subtitle || '',
        description: updatedService.description || '',
        capabilities: updatedService.capabilities || [],
        approach: updatedService.approach || '',
        doctors_ids: updatedService.doctors_ids || [],
        branches: updatedService.branches || [],
        department_id: updatedService.department_id || null,
        image: updatedService.image || ''
      });
      setImageFile(null);
      setEditMode(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (service) {
      setForm({
        title: service.title || '',
        subtitle: service.subtitle || '',
        description: service.description || '',
        capabilities: service.capabilities || [],
        approach: service.approach || '',
        doctors_ids: service.doctors_ids || [],
        branches: service.branches || [],
        department_id: service.department_id || null,
        image: service.image || ''
      });
      setPreviewImage(service.image || '');
      setImageFile(null);
      setEditMode(false);
      setError(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    setLoading(true);
    const token = getAuthToken();
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل في الحذف');
      }

      alert('تم حذف الخدمة بنجاح');
      window.location.href = '/services'; 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في الحذف');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Typography color="error">{error}</Typography>
    </Box>
  );

  if (!service) return <Typography>الخدمة غير موجودة</Typography>;

  const availableDoctors = doctors.filter(doctor => !form.doctors_ids.includes(doctor.id));
  const availableBranches = branches.filter(branch => !form.branches.includes(branch.id));

  return (
    <>
    
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h4">تفاصيل الخدمة</Typography>
          {editMode ? (
            <>
              <Button color="success" startIcon={<Save />} onClick={handleSave} sx={{ mr: 1 }}>
                حفظ
              </Button>
              <Button color="inherit" startIcon={<Cancel />} onClick={handleCancel}>
                إلغاء
              </Button>
            </>
          ) : (
            <>
              <Button startIcon={<Edit />} onClick={() => setEditMode(true)} sx={{ mr: 1 }}>
                تعديل
              </Button>
              <Button color="error" startIcon={<Delete />} onClick={handleDelete}>
                حذف
              </Button>
            </>
          )}
        </Box>

        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
          <Box flex={{ xs: "1 1 100%", md: "0 0 30%" }} textAlign="center">
            <Avatar src={previewImage} alt={form.title} sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }} />
            {editMode && (
              <label>
                <Button variant="contained" component="span">
                  تحميل صورة
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
              </label>
            )}
          </Box>

          <Box flex={{ xs: "1 1 100%", md: "1 1 70%" }}>
            <TextField
              fullWidth
              label="اسم الخدمة"
              name="title"
              value={form.title}
              onChange={handleChange}
              margin="normal"
              disabled={!editMode}
            />
            <TextField
              fullWidth
              label="العنوان الفرعي"
              name="subtitle"
              value={form.subtitle || ''}
              onChange={handleChange}
              margin="normal"
              disabled={!editMode}
            />
            <TextField
              fullWidth
              label="الوصف"
              name="description"
              value={form.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
              disabled={!editMode}
            />
            <FormControl fullWidth margin="normal" disabled={!editMode}>
              <InputLabel>القسم</InputLabel>
              <Select
                value={form.department_id || ''}
                label="القسم"
                onChange={(e) => handleSelectChange('department_id', e.target.value)}
              >
                {departments.map(dep => (
                  <MenuItem key={dep.id} value={dep.id}>{dep.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box mt={2} mb={2}>
              <Typography variant="subtitle1">الأطباء المعينون</Typography>
              {editMode ? (
                <>
                  <Box display="flex" gap={1} mb={2}>
                    <FormControl fullWidth>
                      <InputLabel>إضافة طبيب</InputLabel>
                      <Select
                        value={newDoctorId}
                        label="إضافة طبيب"
                        onChange={(e) => setNewDoctorId(e.target.value as number)}
                      >
                        {availableDoctors.map(doc => (
                          <MenuItem key={doc.id} value={doc.id}>{doc.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button 
                      variant="contained" 
                      onClick={handleAddDoctor}
                      disabled={!newDoctorId}
                      startIcon={<Add />}
                    >
                      إضافة
                    </Button>
                  </Box>
                  <List dense>
                    {form.doctors_ids.map(id => {
                      const doctor = doctors.find(d => d.id === id);
                      return doctor ? (
                        <ListItem 
                          key={doctor.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveDoctor(doctor.id)}>
                              <Close />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={doctor.name} />
                        </ListItem>
                      ) : (
                        <ListItem 
                          key={id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveDoctor(id)}>
                              <Close />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={`طبيب غير معروف (ID: ${id})`} />
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              ) : (
                <Box sx={{ pl: 2 }}>
                  {form.doctors_ids.length > 0 ? (
                    form.doctors_ids.map(id => {
                      const doctor = doctors.find(d => d.id === id);
                      return doctor ? (
                        <Typography key={doctor.id}>• {doctor.name}</Typography>
                      ) : (
                        <Typography key={id}>• طبيب غير معروف (ID: {id})</Typography>
                      );
                    })
                  ) : (
                    <Typography color="textSecondary">لا يوجد أطباء معينون</Typography>
                  )}
                </Box>
              )}
            </Box>

            <Box mt={2} mb={2}>
              <Typography variant="subtitle1">الفروع المتاحة</Typography>
              {editMode ? (
                <>
                  <Box display="flex" gap={1} mb={2}>
                    <FormControl fullWidth>
                      <InputLabel>إضافة فرع</InputLabel>
                      <Select
                        value={newBranchId}
                        label="إضافة فرع"
                        onChange={(e) => setNewBranchId(e.target.value as number)}
                      >
                        {availableBranches.map(branch => (
                          <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button 
                      variant="contained" 
                      onClick={handleAddBranch}
                      disabled={!newBranchId}
                      startIcon={<Add />}
                    >
                      إضافة
                    </Button>
                  </Box>
                  <List dense>
                    {form.branches.map(id => {
                      const branch = branches.find(b => b.id === id);
                      return branch ? (
                        <ListItem 
                          key={branch.id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveBranch(branch.id)}>
                              <Close />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={branch.name} />
                        </ListItem>
                      ) : (
                        <ListItem 
                          key={id}
                          secondaryAction={
                            <IconButton edge="end" onClick={() => handleRemoveBranch(id)}>
                              <Close />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={`فرع غير معروف (ID: ${id})`} />
                        </ListItem>
                      );
                    })}
                  </List>
                </>
              ) : (
                <Box sx={{ pl: 2 }}>
                  {form.branches.length > 0 ? (
                    form.branches.map(id => {
                      const branch = branches.find(b => b.id === id);
                      return branch ? (
                        <Typography key={branch.id}>• {branch.name}</Typography>
                      ) : (
                        <Typography key={id}>• فرع غير معروف (ID: {id})</Typography>
                      );
                    })
                  ) : (
                    <Typography color="textSecondary">لا يوجد فروع معينة</Typography>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>المميزات</Typography>
          {editMode ? (
            <>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  fullWidth
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  size="small"
                />
                <Button variant="contained" onClick={handleAddCapability} startIcon={<Add />}>
                  إضافة
                </Button>
              </Box>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {form.capabilities.map((item, index) => (
                  <Chip key={index} label={item} onDelete={() => handleRemoveCapability(index)} />
                ))}
              </Box>
            </>
          ) : (
            <Box sx={{ pl: 2 }}>
              {form.capabilities.length > 0 ? (
                form.capabilities.map((item, index) => (
                  <Typography key={index}>• {item}</Typography>
                ))
              ) : (
                <Typography color="textSecondary">لا يوجد محتوى</Typography>
              )}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4 }} />

        <Box>
          <Typography variant="h6" gutterBottom>المنهجية</Typography>
          <TextField
            fullWidth
            name="approach"
            value={form.approach}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            disabled={!editMode}
          />
        </Box>
      </Paper>
    </Box>
<SubservicesPage/>
    </>

  );
};

export default ServiceSinglePage;