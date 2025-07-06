import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, IconButton, Paper, CircularProgress, FormControlLabel, Checkbox
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

const DoctorSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [form, setForm] = useState<Partial<Doctor>>({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/doctors/${id}`);
        const data = await res.json();

        const parsedDoctor: Doctor = {
          ...data,
          education: data.education || [],
          skills: data.skills || [],
          achievements: data.achievements || [],
          working_hours: data.working_hours
            ? data.working_hours.map((slot: WorkingHoursSlot) => ({
                ...slot,
                days: [...slot.days],
              }))
            : [],
        };

        setDoctor(parsedDoctor);
        setForm({
          ...parsedDoctor,
          education: [...parsedDoctor.education],
          skills: [...parsedDoctor.skills],
          achievements: [...parsedDoctor.achievements],
          working_hours: parsedDoctor.working_hours.map((slot) => ({
            ...slot,
            days: [...slot.days],
          })),
        });
      } catch (error) {
        console.error('Error fetching doctor:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDoctor();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addWorkingHoursSlot = () => {
    setForm((prev) => ({
      ...prev,
      working_hours: [
        ...(prev.working_hours || []).map((slot) => ({
          ...slot,
          days: [...slot.days],
        })),
        { days: [], openingTime: '', closingTime: '' },
      ],
    }));
  };

  const removeWorkingHoursSlot = (index: number) => {
    setForm((prev) => {
      const updated = [...(prev.working_hours || []).map((slot) => ({ ...slot, days: [...slot.days] }))];
      updated.splice(index, 1);
      return { ...prev, working_hours: updated };
    });
  };

  const handleDayToggle = (slotIndex: number, day: string) => {
    setForm((prev) => {
      const slots = (prev.working_hours || []).map((slot) => ({
        ...slot,
        days: [...slot.days],
      }));

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
      const slots = (prev.working_hours || []).map((slot) => ({
        ...slot,
        days: [...slot.days],
      }));
      slots[slotIndex] = { ...slots[slotIndex], [field]: value };
      return { ...prev, working_hours: slots };
    });
  };

  const handleSave = async () => {
    try {
      if (!id || !doctor) return;

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value ?? ''));
        }
      });

      const imageInput = document.getElementById('upload-image') as HTMLInputElement;
      const imageFile = imageInput?.files?.[0];
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`http://localhost:3000/doctors/${id}`, {
        method: 'PUT',
        body: formData,
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      const updated = await res.json();
      setDoctor(updated);
      setForm({
        ...updated,
        education: [...updated.education],
        skills: [...updated.skills],
        achievements: [...updated.achievements],
        working_hours: updated.working_hours.map((slot: WorkingHoursSlot) => ({
          ...slot,
          days: [...slot.days],
        })),
      });
      setEditMode(false);
      setImagePreview(null);
      if (imageInput) imageInput.value = '';
    } catch (error) {
      console.error('Error saving doctor:', error);
    }
  };

  const handleCancel = () => {
    if (doctor) {
      setForm({
        ...doctor,
        education: [...doctor.education],
        skills: [...doctor.skills],
        achievements: [...doctor.achievements],
        working_hours: doctor.working_hours.map((slot) => ({
          ...slot,
          days: [...slot.days],
        })),
      });
      setImagePreview(null);
      setEditMode(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmDelete = window.confirm('هل أنت متأكد أنك تريد حذف هذا الطبيب؟');
    if (!confirmDelete) return;

    try {
      await fetch(`http://localhost:3000/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      });
      navigate('/doctors'); // change this path if needed
    } catch (error) {
      console.error('Error deleting doctor:', error);
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
        {['name', 'title', 'description', 'position', 'practice_area', 'experience', 'address', 'phone', 'email', 'personal_experience'].map((field) => (
          <TextField
            key={field}
            label={field}
            name={field}
            value={editMode ? form[field as keyof Doctor] || '' : doctor[field as keyof Doctor] || ''}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editMode}
          />
        ))}

        <Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            ساعات العمل
          </Typography>
          {(form.working_hours || []).map((slot, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
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
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <TextField
                  label="وقت الفتح"
                  type="time"
                  value={slot.openingTime}
                  onChange={(e) => handleWorkingHoursChange(index, 'openingTime', e.target.value)}
                  fullWidth
                  disabled={!editMode}
                />
                <TextField
                  label="وقت الإغلاق"
                  type="time"
                  value={slot.closingTime}
                  onChange={(e) => handleWorkingHoursChange(index, 'closingTime', e.target.value)}
                  fullWidth
                  disabled={!editMode}
                />
              </Box>
              {editMode && (
                <IconButton onClick={() => removeWorkingHoursSlot(index)} color="error" sx={{ mt: 1 }}>
                  <Delete />
                </IconButton>
              )}
            </Paper>
          ))}
          {editMode && (
            <Button startIcon={<Add />} onClick={addWorkingHoursSlot}>
              إضافة فترة عمل
            </Button>
          )}
        </Box>

        <Box mt={4}>
          <Typography variant="h6" gutterBottom>صورة الطبيب</Typography>
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
        </Box>
      </Paper>
    </Box>
  );
};

export default DoctorSingle;
