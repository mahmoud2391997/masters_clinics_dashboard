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
  IconButton,
  Avatar,
  TableBody,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
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
  image: string | null;
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
    image: null,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get<Doctor[]>('http://localhost:3000/doctors', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });
        setDoctors(response.data);
        setFilteredDoctors(response.data);
      } catch (err) {
        setError('فشل تحميل بيانات الأطباء');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    let filtered = [...doctors];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          (d.title && d.title.toLowerCase().includes(query)) ||
          (d.practice_area && d.practice_area.toLowerCase().includes(query))
      );
    }
    setFilteredDoctors(filtered);
  }, [searchQuery, doctors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleListChange = (name: keyof Doctor, value: string) => {
    setNewDoctor((prev) => ({ ...prev, [name]: value.split(',').map((item) => item.trim()) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl('');
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImageFile(null);
  };

  const addWorkingHoursSlot = () => {
    setNewDoctor((prev) => ({
      ...prev,
      working_hours: [
        ...(prev.working_hours || []).map((slot) => ({ ...slot, days: [...slot.days] })),
        { days: [], openingTime: '', closingTime: '' },
      ],
    }));
  };

  const removeWorkingHoursSlot = (index: number) => {
    setNewDoctor((prev) => {
      const updated = [...(prev.working_hours || []).map((slot) => ({ ...slot, days: [...slot.days] }))];
      updated.splice(index, 1);
      return { ...prev, working_hours: updated };
    });
  };

  const handleDayToggle = (slotIndex: number, day: string) => {
    setNewDoctor((prev) => {
      const slots = (prev.working_hours || []).map((slot) => ({ ...slot, days: [...slot.days] }));
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
    setNewDoctor((prev) => {
      const slots = (prev.working_hours || []).map((slot) => ({ ...slot, days: [...slot.days] }));
      slots[slotIndex] = { ...slots[slotIndex], [field]: value };
      return { ...prev, working_hours: slots };
    });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newDoctor.name || '');
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

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const response = await axios.post('http://localhost:3000/doctors', formData, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      setDoctors((prev) => [...prev, response.data]);
      setFilteredDoctors((prev) => [...prev, response.data]);
      setOpenAddDialog(false);

      // Reset
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
        image: null,
      });
      setImageFile(null);
      setImageUrl('');
    } catch (err) {
      setError('فشل في إضافة الطبيب');
      console.error(err);
    }
  };

  return (
    <Box dir="rtl" className="p-5">
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          label="بحث بالاسم أو اللقب أو المجال"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAddDialog(true)}>
          إضافة طبيب
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">الاسم</TableCell>
              <TableCell align="center">اللقب</TableCell>
              <TableCell align="center">المنصب</TableCell>
              <TableCell align="center">المجال</TableCell>
              <TableCell align="center">الهاتف</TableCell>
              <TableCell align="center">البريد</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">جاري التحميل...</TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell align="center">{doctor.name}</TableCell>
                  <TableCell align="center">{doctor.title || '-'}</TableCell>
                  <TableCell align="center">{doctor.position || '-'}</TableCell>
                  <TableCell align="center">{doctor.practice_area || '-'}</TableCell>
                  <TableCell align="center">{doctor.phone || '-'}</TableCell>
                  <TableCell align="center">{doctor.email || '-'}</TableCell>
                  <TableCell align="center">
                    <Link to={`/doctors/${doctor.id}`}>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">عرض</button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">لا يوجد بيانات</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>إضافة طبيب جديد</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="الاسم" name="name" value={newDoctor.name} onChange={handleInputChange} required />
            <TextField label="اللقب" name="title" value={newDoctor.title} onChange={handleInputChange} />
            <TextField label="الوصف" name="description" value={newDoctor.description} onChange={handleInputChange} />
            <TextField label="المنصب" name="position" value={newDoctor.position} onChange={handleInputChange} />
            <TextField label="المجال" name="practice_area" value={newDoctor.practice_area} onChange={handleInputChange} />
            <TextField label="الخبرة" name="experience" value={newDoctor.experience} onChange={handleInputChange} />
            <TextField label="العنوان" name="address" value={newDoctor.address} onChange={handleInputChange} />
            <TextField label="الهاتف" name="phone" value={newDoctor.phone} onChange={handleInputChange} />
            <TextField label="البريد الإلكتروني" name="email" value={newDoctor.email} onChange={handleInputChange} />
            <TextField label="الخبرات الشخصية" name="personal_experience" value={newDoctor.personal_experience} onChange={handleInputChange} />
            <TextField label="التعليم (افصل بفواصل)" value={newDoctor.education?.join(', ') || ''} onChange={(e) => handleListChange('education', e.target.value)} />
            <TextField label="المهارات (افصل بفواصل)" value={newDoctor.skills?.join(', ') || ''} onChange={(e) => handleListChange('skills', e.target.value)} />
            <TextField label="الإنجازات (افصل بفواصل)" value={newDoctor.achievements?.join(', ') || ''} onChange={(e) => handleListChange('achievements', e.target.value)} />

            <Box>
              <Typography variant="subtitle2">مواعيد العمل</Typography>
              <Button onClick={addWorkingHoursSlot} startIcon={<Add />} sx={{ mt: 1, mb: 2 }}>
                إضافة فترة عمل
              </Button>
              <Stack spacing={2}>
                {(newDoctor.working_hours || []).map((slot, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Typography>الأيام</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {daysOfWeek.map((day) => (
                        <FormControlLabel
                          key={day}
                          control={<Checkbox checked={slot.days.includes(day)} onChange={() => handleDayToggle(index, day)} />}
                          label={getDayName(day)}
                        />
                      ))}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                      <TextField label="وقت الفتح" type="time" value={slot.openingTime} onChange={(e) => handleWorkingHoursChange(index, 'openingTime', e.target.value)} fullWidth />
                      <TextField label="وقت الإغلاق" type="time" value={slot.closingTime} onChange={(e) => handleWorkingHoursChange(index, 'closingTime', e.target.value)} fullWidth />
                    </Box>
                    <IconButton onClick={() => removeWorkingHoursSlot(index)} color="error" sx={{ mt: 1 }}>
                      <Delete />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>صورة الطبيب</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="outlined" component="label">
                  اختر صورة
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {imageFile && <Typography>{imageFile.name}</Typography>}
              </Stack>
              <Typography variant="body2" sx={{ mt: 1 }}>أو</Typography>
              <TextField fullWidth label="رابط الصورة" value={imageUrl} onChange={handleImageUrlChange} sx={{ mt: 1 }} />
              {(imageFile || imageUrl) && (
                <Avatar src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} sx={{ width: 100, height: 100, mt: 2 }} />
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!newDoctor.name}>حفظ</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorTable;
