"use client";
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, CardMedia,
  Button, Chip, CircularProgress, Container,
  Dialog, DialogActions, DialogContent, DialogTitle,
  TextField, Stack,
  IconButton
} from '@mui/material';
import { Add, Edit, Delete, ArrowBack } from '@mui/icons-material';
import SubserviceAddForm from './addSubSerivceForm';

interface Subservice {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price?: number;
  duration?: number;
  category?: string;
}

const SubservicesPage: React.FC = () => {
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const [subservices, setSubservices] = useState<Subservice[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedSubservice, setSelectedSubservice] = useState<Subservice | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Subservice>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubservices = async () => {
      try {
        const response = await fetch(`http://localhost:3000/subServices?serviceId=${id}`, {
          headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
        });
        const data = await response.json();
        console.log(data);
        
        setSubservices(data);
      } catch (error) {
        console.error('حدث خطأ أثناء جلب البيانات:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubservices();
  }, [id]);

  const handleDeleteClick = (subservice: Subservice) => {
    setSelectedSubservice(subservice);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubservice) return;
    try {
      await fetch(`http://localhost:3000/subServices/${selectedSubservice.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
      });
      setSubservices(subservices.filter(s => s.id !== selectedSubservice.id));
    } catch (error) {
      console.error('حدث خطأ أثناء الحذف:', error);
    } finally {
      setDeleteConfirmOpen(false);
      setSelectedSubservice(null);
    }
  };

  const handleEditClick = (subservice: Subservice) => {
    setSelectedSubservice(subservice);
    setFormData(subservice);
    setImagePreview(subservice.imageUrl || null);
    setImageFile(null);
    setEditMode(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedSubservice) return;
    
    try {
      const formDataToSend = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Append image file if it exists
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      const response = await fetch(`http://localhost:3000/subServices/${selectedSubservice.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formDataToSend,
      });
      
      const updated = await response.json();
      setSubservices(subservices.map(s => s.id === updated.id ? updated : s));
      setEditMode(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('حدث خطأ أثناء التحديث:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }} dir="rtl">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => navigate(-1)} sx={{ ml: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h4">الخدمات الفرعية</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setShowAddForm(true)}>
          إضافة خدمة فرعية جديدة
        </Button>
      </Box>

      {showAddForm && <SubserviceAddForm id={id} />}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
        }}
      >
        {subservices.map((subservice) => (
          <Card key={subservice.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardMedia
              component="img"
              height="200"
              image={subservice.imageUrl || '/placeholder-image.jpg'}
              alt={subservice.name}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5">{subservice.name}</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {subservice.description}
              </Typography>
              {subservice.price && <Chip label={`$${subservice.price}`} color="primary" sx={{ mr: 1 }} />}
              {subservice.duration && <Chip label={`${subservice.duration} دقيقة`} sx={{ mr: 1 }} />}
              {subservice.category && <Chip label={subservice.category} variant="outlined" />}
            </CardContent>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button startIcon={<Edit />} onClick={() => handleEditClick(subservice)} variant="outlined" color="primary">
                تعديل
              </Button>
              <Button startIcon={<Delete />} onClick={() => handleDeleteClick(subservice)} variant="outlined" color="error">
                حذف
              </Button>
            </Box>
          </Card>
        ))}
      </Box>

      {/* تعديل */}
      <Dialog open={editMode} onClose={() => setEditMode(false)} maxWidth="sm" fullWidth>
        <DialogTitle>تعديل الخدمة الفرعية</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {imagePreview && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                />
              </Box>
            )}
            <Button
              variant="contained"
              component="label"
              fullWidth
            >
              {imageFile ? 'تغيير الصورة' : 'اختر صورة'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            <TextField
              label="الاسم"
              name="name"
              value={formData.name || ''}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="الوصف"
              name="description"
              value={formData.description || ''}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={4}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="السعر"
                name="price"
                type="number"
                value={formData.price || ''}
                onChange={handleFormChange}
                fullWidth
              />
              <TextField
                label="المدة (دقائق)"
                name="duration"
                type="number"
                value={formData.duration || ''}
                onChange={handleFormChange}
                fullWidth
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setEditMode(false);
            setImageFile(null);
            setImagePreview(null);
          }}>إلغاء</Button>
          <Button onClick={handleSave} variant="contained" color="primary">حفظ</Button>
        </DialogActions>
      </Dialog>

      {/* تأكيد الحذف */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد أنك تريد حذف "{selectedSubservice?.name}"؟
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>إلغاء</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">حذف</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SubservicesPage;