import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, IconButton, Paper, CircularProgress,
  Checkbox, FormControlLabel, Stack, MenuItem, Select, FormControl, InputLabel, Chip
} from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';

interface WorkingHoursSlot {
  days: string[];
  openingTime: string;
  closingTime: string;
}

interface Department {
  id: number;
  name: string;
}
interface Branch {
  id:number;
  name:string
}


interface Doctor {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  image: string | null;
  working_hours_slots: WorkingHoursSlot[];
  department_id: number;
  branches: number[];
  branch_names?: string[];
}

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const getDayName = (day: string) => {
  const daysMap: Record<string, string> = {
    sunday: 'الأحد',
    monday: 'الإثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت'
  };
  return daysMap[day] || day;
};

const formatDaysRange = (days: string[]) => {
  if (days.length === 7) return 'كل الأيام';
  if (days.length === 5 && 
      days.includes('sunday') && 
      days.includes('monday') && 
      days.includes('tuesday') && 
      days.includes('wednesday') && 
      days.includes('thursday')) {
    return 'أيام العمل (الأحد - الخميس)';
  }
  return days.map(getDayName).join('، ');
};

const formatTime = (time: string) => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hourNum = parseInt(hours);
  return `${hourNum > 12 ? hourNum - 12 : hourNum}:${minutes} ${hourNum >= 12 ? 'م' : 'ص'}`;
};

async function fetchDoctor(id: string, allBranches: Branch[]): Promise<Doctor> {
  const response = await fetch(`https://www.ss.mastersclinics.com/doctors/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch doctor');

  const data = await response.json();
  
  // Convert branch names to IDs
  const branchNames = Array.isArray(data.branches) ? data.branches : 
                     typeof data.branches === 'string' ? JSON.parse(data.branches) : [];
  
  const branchIds = branchNames.map((name: string) => {
  const branch = allBranches.find(b => b.name === name);
  return branch ? branch.id : null;
}).filter((id: number | null) => id !== null) as number[];  return {
    ...data,
    working_hours_slots: data.working_hours_slots || [],
    branches: branchIds,
    branch_names: branchNames,
    department_id: data.department_id || data.department?.id || 0,
  };
}

async function fetchDepartments(): Promise<Department[]> {
  const response = await fetch('https://www.ss.mastersclinics.com/departments', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch departments');

  return response.json();
}

async function fetchBranches(): Promise<Branch[]> {
  const response = await fetch('https://www.ss.mastersclinics.com/branches', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
  });

  if (!response.ok) throw new Error('Failed to fetch branches');
  
  const data = await response.json();
  return data;
}

async function updateDoctor(id: string, data: Partial<Doctor>, branches: number[], imageFile?: File): Promise<Doctor> {
  const token = sessionStorage.getItem('token');
  
  // Convert branch IDs to names for API
 

  const formData = new FormData();
  formData.append('name', data.name || '');
  formData.append('specialty', data.specialty || '');
  formData.append('bio', data.bio || '');
  formData.append('department_id', String(data.department_id || ''));
  
  if (data.working_hours_slots) {
    formData.append('working_hours_slots', JSON.stringify(data.working_hours_slots));
  }
  
    formData.append('branches', JSON.stringify(branches));
  
  if (imageFile) {
    formData.append('image', imageFile);
  } else if (data.image && typeof data.image === 'string') {
    formData.append('image', data.image);
  }
  
  const response = await fetch(`https://www.ss.mastersclinics.com/doctors/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update doctor');
  }

  return response.json();
}

const DoctorSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [form, setForm] = useState<Partial<Doctor>>({
    name: '',
    specialty: '',
    bio: '',
    image: null,
    working_hours_slots: [],
    department_id: 0,
    branches: [],
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [departmentsData, branchesData] = await Promise.all([
          fetchDepartments(),
          fetchBranches()
        ]);
        
        setDepartments(departmentsData);
        setBranches(branchesData);

        if (id) {
          const doctorData = await fetchDoctor(id, branchesData);
          setDoctor(doctorData);
          setForm({
            ...doctorData,
            branches: doctorData.branches || []
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (e: any) => {
    const department_id = e.target.value;
    setForm(prev => ({ ...prev, department_id }));
  };

  const handleBranchChange = (e: any) => {
    const selectedBranchIds = e.target.value as number[];
    setForm(prev => ({ ...prev, branches: selectedBranchIds }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHoursSlot, value: any) => {
    setForm(prev => {
      const working_hours_slots = [...(prev.working_hours_slots || [])];
      working_hours_slots[index] = { ...working_hours_slots[index], [field]: value };
      return { ...prev, working_hours_slots };
    });
  };

  const addWorkingHoursSlot = () => {
    setForm(prev => ({
      ...prev,
      working_hours_slots: [...(prev.working_hours_slots || []), { days: [], openingTime: '', closingTime: '' }],
    }));
  };

  const removeWorkingHoursSlot = (index: number) => {
    setForm(prev => {
      const working_hours_slots = [...(prev.working_hours_slots || [])];
      working_hours_slots.splice(index, 1);
      return { ...prev, working_hours_slots };
    });
  };

  const handleDayToggle = (index: number, day: string) => {
    setForm(prev => {
      const working_hours_slots = [...(prev.working_hours_slots || [])];
      const currentDays = working_hours_slots[index]?.days || [];
      const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
      working_hours_slots[index] = { ...working_hours_slots[index], days: newDays };
      return { ...prev, working_hours_slots };
    });
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const imageInput = document.getElementById('upload-image') as HTMLInputElement;
      const imageFile = imageInput?.files?.[0];
      console.log(form);
      
      const updated = await updateDoctor(id, form, form.branches || [], imageFile);
      
      setDoctor(updated);
      setForm(updated);
      setImagePreview(null);
      setEditMode(false);
      
      if (imageInput) {
        imageInput.value = '';
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    if (doctor) {
      setForm(doctor);
      setImagePreview(null);
      setEditMode(false);
    }
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
    <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">{doctor.name}</Typography>
        <Box flexGrow={1} />
        {editMode ? (
          <>
            <Button color="success" startIcon={<Save />} onClick={handleSave} sx={{ mr: 2 }}>حفظ</Button>
            <Button color="error" startIcon={<Cancel />} onClick={handleCancel}>إلغاء</Button>
          </>
        ) : (
          <Button startIcon={<Edit />} onClick={() => setEditMode(true)}>تعديل</Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <TextField
          label="الاسم"
          name="name"
          value={editMode ? form.name || '' : doctor.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
          sx={{ '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } }}
        />

        <TextField
          label="التخصص"
          name="specialty"
          value={editMode ? form.specialty || '' : doctor.specialty}
          onChange={handleChange}
          fullWidth
          margin="normal"
          disabled={!editMode}
          sx={{ '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } }}
        />

        <TextField
          label="السيرة الذاتية"
          name="bio"
          value={editMode ? form.bio || '' : doctor.bio}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          placeholder="أدخل سيرتك الذاتية هنا"
          disabled={!editMode}
          InputLabelProps={{ shrink: true }}
          sx={{
            '& label': { right: 0, left: 'auto' },
            '& textarea': { textAlign: 'right' },
          }}
        />

        <FormControl fullWidth margin="normal" sx={{ textAlign: 'right' }}>
          <InputLabel id="department-label" sx={{ right: 0, left: 'auto' }}>القسم</InputLabel>
          <Select
            labelId="department-label"
            id="department"
            value={editMode ? form.department_id || 0 : doctor.department_id || 0}
            onChange={handleDepartmentChange}
            label="القسم"
            disabled={!editMode}
            sx={{ textAlign: 'right' }}
          >
            {departments.map((department) => (
              <MenuItem key={department.id} value={department.id} sx={{ justifyContent: 'flex-end' }}>
                {department.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal" sx={{ textAlign: 'right' }}>
          <InputLabel id="branches-label" sx={{ right: 0, left: 'auto' }}>الفروع</InputLabel>
          <Select
            labelId="branches-label"
            id="branches"
            multiple
            value={editMode ? form.branches || [] : doctor.branches || []}
            onChange={handleBranchChange}
            label="الفروع"
            disabled={!editMode}
            sx={{ textAlign: 'right' }}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-end' }}>
                {selected.map((branchId) => {
                  const branch = branches.find(b => b.id === branchId);
                  return branch ? (
                    <Chip 
                      key={branch.id} 
                      label={branch.name} 
                      sx={{ direction: 'rtl' }} 
                    />
                  ) : null;
                })}
              </Box>
            )}
          >
            {branches.map((branch) => (
              <MenuItem 
                key={branch.id} 
                value={branch.id} 
                sx={{ justifyContent: 'flex-end' }}
              >
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box borderTop="1px solid" borderColor="divider" pt={3} mt={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h6" sx={{ textAlign: 'right' }}>ساعات العمل</Typography>
            {editMode && (
              <Button 
                startIcon={<Add />} 
                onClick={addWorkingHoursSlot}
                sx={{ bgcolor: 'indigo.100', color: 'indigo.700', '&:hover': { bgcolor: 'indigo.200' } }}
              >
                إضافة وقت
              </Button>
            )}
          </Box>
          
          <Stack spacing={2}>
            {(editMode ? form.working_hours_slots || [] : doctor.working_hours_slots || []).map((slot, index) => (
              <Paper key={index} elevation={2} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={3}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" sx={{ textAlign: 'right', mb: 1 }}>الأيام</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'flex-end' }}>
                      {daysOfWeek.map(day => (
                        <FormControlLabel
                          key={day}
                          control={
                            <Checkbox
                              checked={slot.days?.includes(day) || false}
                              onChange={() => handleDayToggle(index, day)}
                              disabled={!editMode}
                            />
                          }
                          label={getDayName(day)}
                          labelPlacement="start"
                          sx={{ mr: 0, ml: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box flex={1}>
                    <Box display="flex" gap={2}>
                      <Box flex={1}>
                        <TextField
                          label="وقت الفتح"
                          type="time"
                          value={slot.openingTime || ''}
                          onChange={(e) => handleWorkingHoursChange(index, 'openingTime', e.target.value)}
                          disabled={!editMode}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={{ '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } }}
                        />
                      </Box>
                      <Box flex={1}>
                        <TextField
                          label="وقت الإغلاق"
                          type="time"
                          value={slot.closingTime || ''}
                          onChange={(e) => handleWorkingHoursChange(index, 'closingTime', e.target.value)}
                          disabled={!editMode}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                          sx={{ '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                
                {editMode && (
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <IconButton onClick={() => removeWorkingHoursSlot(index)} color="error" size="small">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                
                {slot.days?.length > 0 && slot.openingTime && slot.closingTime && (
                  <Typography variant="body2" sx={{ textAlign: 'right', mt: 1, color: 'text.secondary' }}>
                    {formatDaysRange(slot.days)}: {formatTime(slot.openingTime)} - {formatTime(slot.closingTime)}
                  </Typography>
                )}
              </Paper>
            ))}
          </Stack>
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ textAlign: 'right' }}>صورة الطبيب</Typography>
        {editMode ? (
          <>
            <input type="file" accept="image/*" id="upload-image" hidden onChange={handleImageChange} />
            <label htmlFor="upload-image">
              <Button variant="contained" component="span" sx={{ mb: 2 }}>
                رفع صورة
              </Button>
            </label>
            {(imagePreview || doctor.image) && (
              <img
                src={imagePreview || doctor.image || undefined}
                alt={doctor.name}
                style={{ maxWidth: '100%', borderRadius: 8 }}
              />
            )}
          </>
        ) : doctor.image ? (
          <img
            src={doctor.image}
            alt={doctor.name}
            style={{ maxWidth: '100%', borderRadius: 8 }}
          />
        ) : (
          <Typography>لا توجد صورة متاحة</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default DoctorSingle;