import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Alert,
  CircularProgress,
  Autocomplete,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Stack,
} from '@mui/material';
import {
  Edit,
  Save,
  Cancel,
  Delete,
  Add,
  CloudUpload,
  Image as ImageIcon,
  ArrowBack,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import {
  fetchLandingPageById,
  updateLandingPage,
  deleteLandingPage,
  fetchExistingItems,
  updateCurrentLandingPageSettings,
} from '../../store/slices/landingPageSlice';

interface LandingPageContent {
  landingScreen: {
    title: string;
    subtitle: string;
    description: string;
    image: string | File;
  };
  services: Array<{
    id?: string;
    name: string;
    description: string;
    branches: string[];
  }>;
  offers: Array<{
    id?: string;
    offer: string;
    price: string;
    description?: string;
    image: string | File;
    branches: string[];
  }>;
  doctors: Array<{
    id?: string;
    name: string;
    specialization: string;
    image: string | File;
    branches: string[];
  }>;
}

interface BranchSelectorProps {
  selectedBranches: string[];
  onChange: (newValue: string[]) => void;
}

const BranchSelector = ({ selectedBranches, onChange }: BranchSelectorProps) => {
  const branchOptions = [
    "فرع العوالي",
    "فرع الخالدية", 
    "فرع الشاطئ",
    "فرع البساتين",
    "ابحر الشمالية",
    "فرع الطائف"
  ];

  return (
    <Autocomplete
      multiple
      options={branchOptions}
      value={selectedBranches}
      onChange={(_, newValue) => onChange(newValue || [])}
      renderInput={(params) => (
        <TextField {...params} label="الفروع" />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            variant="outlined"
            label={option}
            {...getTagProps({ index })}
            key={index}
          />
        ))
      }
    />
  );
};

const getImageUrl = (image: string | File | undefined): string => {
  if (!image) return "";
  if (image instanceof File) return URL.createObjectURL(image);
  if (/^https?:\/\//.test(image)) return image;
  return `https://www.ss.mastersclinics.com${image}`;
};

const LandingPageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [objectUrls, setObjectUrls] = useState<string[]>([]);

  const {
    currentLandingPage,
    loading,
    error,
    existingItems,
  } = useAppSelector((state) => state.landingPages);

  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState<LandingPageContent | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [addItemDialog, setAddItemDialog] = useState<{
    open: boolean;
    type: 'service' | 'offer' | 'doctor' | null;
  }>({ open: false, type: null });
  const [ setSelectedExistingItem] = useState<any>(null);

  useEffect(() => {
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  useEffect(() => {
    if (id) {
      dispatch(fetchLandingPageById(id));
      dispatch(fetchExistingItems());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentLandingPage) {
      setLocalContent(currentLandingPage.content);
    }
  }, [currentLandingPage]);

  const createObjectUrl = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setObjectUrls(prev => [...prev, url]);
    return url;
  }, []);

const handleSave = async () => {
  if (!id || !currentLandingPage || !localContent) return;

  try {
    const formData = new FormData();
    
    // Prepare the updated page data
    const updatedPage = {
      ...currentLandingPage,
      content: localContent,
      platforms: currentLandingPage.platforms,
      showSections: currentLandingPage.showSections,
      activated: currentLandingPage.activated
    };
    
    // Append the JSON data
    formData.append('data', JSON.stringify(updatedPage));

    // Handle landing screen image
    if (localContent.landingScreen.image instanceof File) {
      formData.append('landingImage', localContent.landingScreen.image);
    }

    // Handle offer images
    localContent.offers.forEach((offer, index) => {
      if (offer.image instanceof File) {
        formData.append('offerImages', offer.image);
      }
    });

    // Handle doctor images
    localContent.doctors.forEach((doctor, index) => {
      if (doctor.image instanceof File) {
        formData.append('doctorImages', doctor.image);
      }
    });

    // Dispatch the update action
    await dispatch(updateLandingPage({ id, data: formData })).unwrap();
    
    // Refresh the data
    dispatch(fetchLandingPageById(id));
    setIsEditing(false);
    setImagePreview(null);
    
  } catch (error) {
    console.error('Failed to save:', error);
    // Show error to user
    alert('Failed to save changes: ' + error);
  }
};

  const handleCancel = () => {
    if (currentLandingPage) {
      setLocalContent(currentLandingPage.content);
      setImagePreview(null);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      try {
        await dispatch(deleteLandingPage(id)).unwrap();
        navigate('/landingPage');
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

const toggleStatus = async () => {
  if (!currentLandingPage || !id) return;

  try {
    const formData = new FormData();
    const updatedPage = {
      ...currentLandingPage,
      activated: !currentLandingPage.activated,
    };
    
    formData.append('data', JSON.stringify(updatedPage));
    
    await dispatch(updateLandingPage({ id, data: formData })).unwrap();
  } catch (error) {
    console.error('Failed to toggle status:', error);
  }
};
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'landing' | 'offer' | 'doctor', index?: number) => {
    const file = e.target.files?.[0];
    if (!file || !localContent) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (type === 'landing') {
        setLocalContent({
          ...localContent,
          landingScreen: {
            ...localContent.landingScreen,
            image: file,
          },
        });
        setImagePreview(createObjectUrl(file));
      } else if (type === 'offer' && index !== undefined) {
        const newOffers = [...localContent.offers];
        newOffers[index] = { ...newOffers[index], image: file };
        setLocalContent({ ...localContent, offers: newOffers });
      } else if (type === 'doctor' && index !== undefined) {
        const newDoctors = [...localContent.doctors];
        newDoctors[index] = { ...newDoctors[index], image: file };
        setLocalContent({ ...localContent, doctors: newDoctors });
      }
    };
    reader.readAsDataURL(file);
  };

  const addExistingItem = (type: 'doctor' | 'service' | 'offer', item: any) => {
    if (!localContent) return;

    if (type === 'doctor') {
      const newDoctor = {
        name: item.name,
        specialization: item.specialty,
        image: item.image || '',
        branches: item.branches || [],
      };
      setLocalContent({
        ...localContent,
        doctors: [...localContent.doctors, newDoctor],
      });
    } else if (type === 'service') {
      const newService = {
        name: item.name,
        description: item.description,
        branches: item.branches || [],
      };
      setLocalContent({
        ...localContent,
        services: [...localContent.services, newService],
      });
    } else if (type === 'offer') {
      const newOffer = {
        offer: item.title,
        price: item.price,
        description: item.description,
        image: item.image || '',
        branches: item.branches || [],
      };
      setLocalContent({
        ...localContent,
        offers: [...localContent.offers, newOffer],
      });
    }

    setAddItemDialog({ open: false, type: null });
    setSelectedExistingItem(null);
  };

  const addNewItem = (type: 'service' | 'offer' | 'doctor') => {
    if (!localContent) return;

    if (type === 'service') {
      setLocalContent({
        ...localContent,
        services: [
          ...localContent.services,
          { name: '', description: '', branches: [] },
        ],
      });
    } else if (type === 'offer') {
      setLocalContent({
        ...localContent,
        offers: [
          ...localContent.offers,
          { offer: '', price: '', description: '', image: '', branches: [] },
        ],
      });
    } else if (type === 'doctor') {
      setLocalContent({
        ...localContent,
        doctors: [
          ...localContent.doctors,
          { name: '', specialization: '', image: '', branches: [] },
        ],
      });
    }
  };

  const removeItem = (type: 'service' | 'offer' | 'doctor', index: number) => {
    if (!localContent) return;

    if (type === 'service') {
      const newServices = localContent.services.filter((_, i) => i !== index);
      setLocalContent({ ...localContent, services: newServices });
    } else if (type === 'offer') {
      const newOffers = localContent.offers.filter((_, i) => i !== index);
      setLocalContent({ ...localContent, offers: newOffers });
    } else if (type === 'doctor') {
      const newDoctors = localContent.doctors.filter((_, i) => i !== index);
      setLocalContent({ ...localContent, doctors: newDoctors });
    }
  };

  const updateItemField = (
    type: 'service' | 'offer' | 'doctor',
    index: number,
    field: string,
    value: any
  ) => {
    if (!localContent) return;

    if (type === 'service') {
      const newServices = [...localContent.services];
      newServices[index] = { ...newServices[index], [field]: value };
      setLocalContent({ ...localContent, services: newServices });
    } else if (type === 'offer') {
      const newOffers = [...localContent.offers];
      newOffers[index] = { ...newOffers[index], [field]: value };
      setLocalContent({ ...localContent, offers: newOffers });
    } else if (type === 'doctor') {
      const newDoctors = [...localContent.doctors];
      newDoctors[index] = { ...newDoctors[index], [field]: value };
      setLocalContent({ ...localContent, doctors: newDoctors });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentLandingPage || !localContent) {
    return (
      <Box p={3}>
        <Alert severity="info">لا توجد بيانات</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }} dir="rtl">
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h4">
              {isEditing ? 'تعديل صفحة الهبوط' : 'عرض صفحة الهبوط'}
            </Typography>
          </Box>

          <Box display="flex" gap={2}>
            {!isEditing ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={() => setIsEditing(true)}
                >
                  تعديل
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      checked={currentLandingPage.activated}
                      onChange={toggleStatus}
                    />
                  }
                  label={currentLandingPage.activated ? 'مفعلة' : 'معطلة'}
                />
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDelete}
                >
                  حذف
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Save />}
                  onClick={handleSave}
                >
                  حفظ
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                >
                  إلغاء
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Basic Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            المعلومات الأساسية
          </Typography>
          
          {isEditing ? (
            <Box>
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  label="عنوان الصفحة"
                  value={currentLandingPage.title}
                  onChange={(e) =>
                    dispatch(updateCurrentLandingPageSettings({ title: e.target.value }))
                  }
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  المنصات
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.entries(currentLandingPage.platforms || {}).map(([platform, enabled]) => (
                    <FormControlLabel
                      key={platform}
                      control={
                        <Switch
                          checked={Boolean(enabled)}
                          onChange={(e) =>
                            dispatch(updateCurrentLandingPageSettings({
                              platforms: {
                                ...currentLandingPage.platforms,
                                [platform]: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label={platform}
                    />
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  إظهار الأقسام
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {Object.entries(currentLandingPage.showSections || {}).map(([section, enabled]) => (
                    <FormControlLabel
                      key={section}
                      control={
                        <Switch
                          checked={Boolean(enabled)}
                          onChange={(e) =>
                            dispatch(updateCurrentLandingPageSettings({
                              showSections: {
                                ...currentLandingPage.showSections,
                                [section]: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label={section}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>العنوان:</strong> {currentLandingPage.title}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography><strong>الحالة:</strong> {currentLandingPage.activated ? 'مفعلة' : 'معطلة'}</Typography>
              </Box>
              <Box>
                <Typography><strong>المنصات:</strong></Typography>
                <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                  {Object.entries(currentLandingPage.platforms || {})
                    .filter(([_, enabled]) => enabled)
                    .map(([platform]) => (
                      <Chip key={platform} label={platform} size="small" />
                    ))}
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Landing Screen Section */}
      {currentLandingPage.showSections?.landingScreen && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              شاشة الترحيب
            </Typography>
            
            {isEditing ? (
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                <Box flex={1}>
                  <TextField
                    fullWidth
                    label="العنوان"
                    value={localContent.landingScreen.title}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        landingScreen: {
                          ...localContent.landingScreen,
                          title: e.target.value,
                        },
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    label="العنوان الفرعي"
                    value={localContent.landingScreen.subtitle}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        landingScreen: {
                          ...localContent.landingScreen,
                          subtitle: e.target.value,
                        },
                      })
                    }
                    sx={{ mb: 2 }}
                  />
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="الوصف"
                    value={localContent.landingScreen.description}
                    onChange={(e) =>
                      setLocalContent({
                        ...localContent,
                        landingScreen: {
                          ...localContent.landingScreen,
                          description: e.target.value,
                        },
                      })
                    }
                  />
                </Box>
                
                <Box flex={1} display="flex" flexDirection="column" alignItems="center">
                  <Typography variant="subtitle2" gutterBottom>
                    صورة شاشة الترحيب
                  </Typography>
                  
                  {(imagePreview || (typeof localContent.landingScreen.image === 'string' && localContent.landingScreen.image)) && (
                    <Avatar
                      src={imagePreview || getImageUrl(localContent.landingScreen.image)}
                      variant="rounded"
                      sx={{ width: 200, height: 200, mx: 'auto', mb: 2 }}
                    />
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleImageUpload(e, 'landing')}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    fullWidth
                  >
                    رفع صورة
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
                <Box flex={2}>
                  <Typography variant="h5" gutterBottom>
                    {localContent.landingScreen.title}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {localContent.landingScreen.subtitle}
                  </Typography>
                  <Typography>
                    {localContent.landingScreen.description}
                  </Typography>
                </Box>
                <Box flex={1}>
                  {localContent.landingScreen.image && (
                    <Avatar
                      src={getImageUrl(localContent.landingScreen.image)}
                      variant="rounded"
                      sx={{ width: '100%', height: 200 }}
                    />
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services Section */}
      {currentLandingPage.showSections?.services && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">الخدمات</Typography>
              {isEditing && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setAddItemDialog({ open: true, type: 'service' })}
                    sx={{ mr: 1 }}
                  >
                    إضافة من الموجود
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => addNewItem('service')}
                  >
                    إضافة جديد
                  </Button>
                </Box>
              )}
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={2}>
              {localContent.services.map((service, index) => (
                <Paper elevation={1} sx={{ p: 2, width: { xs: '100%', sm: '48%', md: '48%' } }} key={index}>
                  {isEditing ? (
                    <>
                      <Box display="flex" justifyContent="flex-end" mb={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeItem('service', index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                      
                      <TextField
                        fullWidth
                        label="اسم الخدمة"
                        value={service.name}
                        onChange={(e) => updateItemField('service', index, 'name', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="الوصف"
                        value={service.description}
                        onChange={(e) => updateItemField('service', index, 'description', e.target.value)}
                        sx={{ mb: 2 }}
                      />
                      
                      <BranchSelector 
                        selectedBranches={service.branches}
                        onChange={(newValue) => updateItemField('service', index, 'branches', newValue)}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" gutterBottom>
                        {service.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {service.description}
                      </Typography>
                      {service.branches.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            الفروع:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {service.branches.map((branch, branchIndex) => (
                              <Chip key={branchIndex} label={branch} size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Offers Section */}
      {currentLandingPage.showSections?.offers && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">العروض</Typography>
              {isEditing && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setAddItemDialog({ open: true, type: 'offer' })}
                    sx={{ mr: 1 }}
                  >
                    إضافة من الموجود
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => addNewItem('offer')}
                  >
                    إضافة جديد
                  </Button>
                </Box>
              )}
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={2}>
              {localContent.offers.map((offer, index) => (
                <Paper elevation={1} sx={{ p: 2, width: { xs: '100%', sm: '48%', md: '48%' } }} key={index}>
                  {isEditing ? (
                    <>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1">عرض {index + 1}</Typography>
                        <IconButton
                          color="error"
                          onClick={() => removeItem('offer', index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Box textAlign="center" mb={2}>
                        {offer.image && (
                          <Avatar
                            src={getImageUrl(offer.image)}
                            variant="rounded"
                            sx={{ width: 120, height: 120, mx: 'auto', mb: 1 }}
                          />
                        )}
                        <input
                          type="file"
                          onChange={(e) => handleImageUpload(e, 'offer', index)}
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`offer-image-${index}`}
                        />
                        <label htmlFor={`offer-image-${index}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<ImageIcon />}
                            size="small"
                          >
                            صورة العرض
                          </Button>
                        </label>
                      </Box>

                      <TextField
                        fullWidth
                        label="اسم العرض"
                        value={offer.offer}
                        onChange={(e) => updateItemField('offer', index, 'offer', e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        label="السعر"
                        value={offer.price}
                        onChange={(e) => updateItemField('offer', index, 'price', e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="الوصف"
                        value={offer.description || ''}
                        onChange={(e) => updateItemField('offer', index, 'description', e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <BranchSelector 
                        selectedBranches={offer.branches}
                        onChange={(newValue) => updateItemField('offer', index, 'branches', newValue)}
                      />
                    </>
                  ) : (
                    <>
                      {offer.image && (
                        <Avatar
                          src={getImageUrl(offer.image)}
                          variant="rounded"
                          sx={{ width: '100%', height: 150, mb: 2 }}
                        />
                      )}
                      <Typography variant="h6" gutterBottom>
                        {offer.offer}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {offer.price}
                      </Typography>
                      {offer.description && (
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {offer.description}
                        </Typography>
                      )}
                      {offer.branches.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            الفروع:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {offer.branches.map((branch, branchIndex) => (
                              <Chip key={branchIndex} label={branch} size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Doctors Section */}
      {currentLandingPage.showSections?.doctors && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">الأطباء</Typography>
              {isEditing && (
                <Box>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setAddItemDialog({ open: true, type: 'doctor' })}
                    sx={{ mr: 1 }}
                  >
                    إضافة من الموجود
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => addNewItem('doctor')}
                  >
                    إضافة جديد
                  </Button>
                </Box>
              )}
            </Box>

            <Stack direction="row" flexWrap="wrap" gap={2} justifyContent="center">
              {localContent.doctors.map((doctor, index) => (
                <Paper elevation={1} sx={{ p: 2, width: { xs: '100%', sm: '48%', md: '30%' }, textAlign: 'center' }} key={index}>
                  {isEditing ? (
                    <>
                      <Box display="flex" justifyContent="flex-end" mb={1}>
                        <IconButton
                          color="error"
                          onClick={() => removeItem('doctor', index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>

                      <Box mb={2}>
                        {doctor.image && (
                          <Avatar
                            src={getImageUrl(doctor.image)}
                            sx={{ width: 100, height: 100, mx: 'auto', mb: 1 }}
                          />
                        )}
                        <input
                          type="file"
                          onChange={(e) => handleImageUpload(e, 'doctor', index)}
                          accept="image/*"
                          style={{ display: 'none' }}
                          id={`doctor-image-${index}`}
                        />
                        <label htmlFor={`doctor-image-${index}`}>
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<ImageIcon />}
                            size="small"
                          >
                            صورة الطبيب
                          </Button>
                        </label>
                      </Box>

                      <TextField
                        fullWidth
                        label="اسم الطبيب"
                        value={doctor.name}
                        onChange={(e) => updateItemField('doctor', index, 'name', e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <TextField
                        fullWidth
                        label="التخصص"
                        value={doctor.specialization}
                        onChange={(e) => updateItemField('doctor', index, 'specialization', e.target.value)}
                        sx={{ mb: 2 }}
                      />

                      <BranchSelector 
                        selectedBranches={doctor.branches}
                        onChange={(newValue) => updateItemField('doctor', index, 'branches', newValue)}
                      />
                    </>
                  ) : (
                    <>
                      {doctor.image && (
                        <Avatar
                          src={getImageUrl(doctor.image)}
                          sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                        />
                      )}
                      <Typography variant="h6" gutterBottom>
                        {doctor.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {doctor.specialization}
                      </Typography>
                      {doctor.branches.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            الفروع:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
                            {doctor.branches.map((branch, branchIndex) => (
                              <Chip key={branchIndex} label={branch} size="small" />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </>
                  )}
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Add Existing Item Dialog */}
      <Dialog
        open={addItemDialog.open}
        onClose={() => setAddItemDialog({ open: false, type: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          إضافة {addItemDialog.type === 'service' ? 'خدمة' : addItemDialog.type === 'offer' ? 'عرض' : 'طبيب'} من الموجود
        </DialogTitle>
        <DialogContent>
          <List>
            {addItemDialog.type === 'service' &&
              existingItems.services?.map((service) => (
                <ListItem key={service.id} divider>
                  <ListItemText
                    primary={service.name}
                    secondary={service.description}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      onClick={() => addExistingItem('service', service)}
                    >
                      إضافة
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}

            {addItemDialog.type === 'offer' &&
              existingItems.offers?.map((offer) => (
                <ListItem key={offer.id} divider>
                  <ListItemText
                    primary={offer.title}
                    secondary={`${offer.price} - ${offer.description}`}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      onClick={() => addExistingItem('offer', offer)}
                    >
                      إضافة
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}

            {addItemDialog.type === 'doctor' &&
              existingItems.doctors?.map((doctor) => (
                <ListItem key={doctor.id} divider>
                  <ListItemText
                    primary={doctor.name}
                    secondary={doctor.specialty}
                  />
                  <ListItemSecondaryAction>
                    <Button
                      variant="outlined"
                      onClick={() => addExistingItem('doctor', doctor)}
                    >
                      إضافة
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemDialog({ open: false, type: null })}>
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LandingPageEditor;