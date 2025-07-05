'use client';

import type { FormEvent, ChangeEvent } from 'react';
import { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { ArrowBack, CloudUpload, Link, Add } from '@mui/icons-material';

interface Subservice {
  _id?: string;
  name: string;
  description?: string;
  imageUrl?: string;
  imageFile?: File | null;
  price?: number;
  duration?: number;
  category?: string;
}

interface SubserviceAddFormProps {
  id?: string; // مُعرّف للخدمة الأب
}

const SubserviceAddForm = ({ id }: SubserviceAddFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<Subservice>({
    name: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    price: 0,
    duration: 0,
    category: ''
  });
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    duration: ''
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'duration' ? Number(value) : value,
      ...(name === 'imageUrl' && { imageFile: null, imageUrl: value })
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith('image/')) {
      setNotification({
        open: true,
        message: 'الرجاء اختيار ملف صورة فقط',
        severity: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotification({
        open: true,
        message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت',
        severity: 'error'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: ''
    }));

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setImagePreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      price: '',
      duration: ''
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
      isValid = false;
    }

    if (formData.price && formData.price < 0) {
      newErrors.price = 'يجب أن يكون السعر رقمًا موجبًا';
      isValid = false;
    }

    if (formData.duration && formData.duration <= 0) {
      newErrors.duration = 'المدة يجب أن تكون أكبر من صفر';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (typeof window === 'undefined') return;

    setLoading(true);

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        throw new Error('لم يتم العثور على رمز المصادقة');
      }

      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description || '');
      formPayload.append('price', String(formData.price));
      formPayload.append('duration', String(formData.duration));
      formPayload.append('category', formData.category || '');
      formPayload.append('serviceId', id || '');

      if (formData.imageFile) {
        formPayload.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        formPayload.append('imageUrl', formData.imageUrl);
      }

      const response = await fetch('https://www.ss.mastersclinics.com/subServices', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formPayload,
      });

      if (!response.ok) {
        throw new Error('فشل في إنشاء الخدمة الفرعية');
      }

      setNotification({
        open: true,
        message: 'تم إنشاء الخدمة الفرعية بنجاح!',
        severity: 'success'
      });

      // إعادة تعيين النموذج
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        imageFile: null,
        price: 0,
        duration: 0,
        category: ''
      });
      setImagePreview(null);

    } catch (error) {
      console.error('خطأ في إنشاء الخدمة الفرعية:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'فشل في إنشاء الخدمة الفرعية',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      price: 0,
      duration: 0,
      category: ''
    });
    setImagePreview(null);
    setErrors({ name: '', price: '', duration: '' });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={4}>
        <IconButton onClick={handleBack} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4">إضافة خدمة فرعية جديدة</Typography>
      </Box>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="اسم الخدمة الفرعية"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name}
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="الوصف"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />

              <Box>
                <TextField
                  fullWidth
                  label="رابط الصورة أو تحميل"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="https://example.com/image.jpg"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Link />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          startIcon={<CloudUpload />}
                          onClick={triggerFileInput}
                        >
                          تحميل
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  disabled={!!formData.imageFile}
                />
                {formData.imageFile && (
                  <Box mt={1} display="flex" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      الملف المختار: {formData.imageFile.name}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, imageFile: null }));
                        setImagePreview(null);
                      }}
                    >
                      إزالة
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider>
                <Chip label="السعر والمدة" />
              </Divider>

              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  type="number"
                  label="السعر (جنيه)"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 0 } }}
                  error={!!errors.price}
                  helperText={errors.price}
                />

                <TextField
                  fullWidth
                  type="number"
                  label="المدة (بالدقائق)"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  variant="outlined"
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!errors.duration}
                  helperText={errors.duration}
                />
              </Box>

              <TextField
                fullWidth
                label="التصنيف"
                name="category"
                value={formData.category}
                onChange={handleChange}
                variant="outlined"
              />

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  إلغاء
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  loading={loading}
                  loadingPosition="start"
                  startIcon={<Add />}
                >
                  {loading ? 'جاري الإرسال...' : 'إنشاء الخدمة'}
                </LoadingButton>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SubserviceAddForm;
