import React, { useState, useEffect } from 'react';
import {
    Box, Typography, TextField, Button, Paper, Avatar, Divider, CircularProgress
} from '@mui/material';
import { Edit, Save, Cancel, Delete } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import SubservicesPage from './subServices';

interface Doctor {
    name: string;
}

interface Category {
    id: string | number;
    name: string;
    description: string;
    doctorNames: string[];
    image: string;
    doctors?: Doctor[];
    branches?: string[];
}

const API_BASE_URL = 'http://localhost:3000';

const fetchCategoryById = async (id: string | number): Promise<Category> => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في جلب البيانات');
    }
    
    return await response.json();
};

const CategorySinglePage: React.FC = () => {
    const [category, setCategory] = useState<Category | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState<Omit<Category, 'id'>>({
        name: '',
        description: '',
        doctorNames: [],
        image: '',
        branches: []
    });
    const [previewImage, setPreviewImage] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();

    useEffect(() => {
        const loadData = async () => {
            try {
                if (id) {
                    const data = await fetchCategoryById(id);
                    setCategory(data);
                    setForm(data);
                    setPreviewImage(data.image);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف');
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.match('image.*')) {
                setError('يرجى اختيار ملف صورة');
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

    const handleSave = async () => {
        if (!form || !id) return;
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("description", form.description);
            if (form.doctorNames?.length) {
                formData.append("doctorNames", JSON.stringify(form.doctorNames));
            }
            if (form.branches?.length) {
                formData.append("branches", JSON.stringify(form.branches));
            }
            if (imageFile) {
                formData.append("image", imageFile);
            }

            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'فشل في التحديث');
            }

            const updatedCategory = await fetchCategoryById(id);
            setCategory(updatedCategory);
            setForm(updatedCategory);
            setImageFile(null);
            setEditMode(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل في التحديث');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (category) {
            setForm(category);
            setPreviewImage(category.image);
            setImageFile(null);
            setEditMode(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        if (!window.confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/services/${id}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error('فشل في الحذف');
            }

            // يمكنك إعادة التوجيه أو عرض رسالة نجاح
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

    if (error) return <Typography color="error">{error}</Typography>;

    if (!category) return <Typography>الخدمة غير موجودة</Typography>;

    return (
        <>
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
            <Paper elevation={3} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h4">تفاصيل الخدمة</Typography>
                    {editMode ? (
                        <Box>
                            <Button
                                color="success"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={loading}
                                sx={{ mr: 2 }}
                                >
                                حفظ
                            </Button>
                            <Button 
                                color="inherit" 
                                startIcon={<Cancel />} 
                                onClick={handleCancel}
                                disabled={loading}
                                >
                                إلغاء
                            </Button>
                        </Box>
                    ) : (
                        <Box>
                            <Button 
                                startIcon={<Edit />} 
                                onClick={() => setEditMode(true)}
                                sx={{ mr: 2 }}
                                >
                                تعديل
                            </Button>
                            <Button 
                                color="error" 
                                startIcon={<Delete />} 
                                onClick={handleDelete}
                                disabled={loading}
                                >
                                حذف
                            </Button>
                        </Box>
                    )}
                </Box>

                <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={4}>
                    <Box flex={{ xs: "1 1 100%", md: "0 0 30%" }} textAlign="center">
                        <Avatar
                            src={previewImage}
                            alt={form.name}
                            sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                            />
                        {editMode && (
                            <label>
                                <Button variant="contained" component="span" disabled={loading}>
                                    تحميل صورة
                                    <input 
                                        type="file" 
                                        hidden 
                                        accept="image/*" 
                                        onChange={handleImageChange} 
                                        />
                                </Button>
                            </label>
                        )}
                    </Box>

                    <Box flex={{ xs: "1 1 100%", md: "1 1 70%" }}>
                        <TextField
                            fullWidth
                            label="اسم الخدمة"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            margin="normal"
                            disabled={!editMode || loading}
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
                            disabled={!editMode || loading}
                            />
                    </Box>
                </Box>

                <Divider sx={{ my: 4 }} />

                <Typography variant="h6" gutterBottom>الأطباء</Typography>
                <Box sx={{ pl: 2 }}>
                    {category.doctorNames?.length ? (
                        category.doctorNames.map((doc, index) => (
                            <Typography key={index}>• {doc}</Typography>
                        ))
                    ) : (
                        <Typography color="textSecondary">لا يوجد أطباء مخصصون.</Typography>
                    )}
                </Box>

                <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>الفروع</Typography>
                <Box sx={{ pl: 2 }}>
                    {category.branches?.length ? (
                        category.branches.map((branch, index) => (
                            <Typography key={index}>• {branch}</Typography>
                        ))
                    ) : (
                        <Typography color="textSecondary">لا توجد فروع مخصصة.</Typography>
                    )}
                </Box>
            </Paper>
        </Box>

        <SubservicesPage />
        </>
    );
};

export default CategorySinglePage;
