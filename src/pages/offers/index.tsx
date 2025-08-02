import { useRef, useState, useEffect, type ChangeEvent, type FormEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Stack,
  CircularProgress,
  Chip,
  Divider,
  Autocomplete,
  Snackbar,
  Alert,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { 
  ArrowBack, 
  Save, 
  CloudUpload, 
  Link,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon
} from '@mui/icons-material';

interface Service {
  id: number;
  name_ar: string;
  name_en: string;
  department_id?: number;
  branches?: any;
  description?: string;
  doctors_ids?: any;
  is_active?: boolean;
}

interface Doctor {
  id: number;
  name: string;
  branches: number[];
  department_id?: number;
}

interface Branch {
  id: number;
  name: string;
  address: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  priceBefore: string;
  priceAfter: string;
  discountPercentage: string;
  branches: any[];
  services_ids: any[];
  doctors_ids: any[];
  is_active: boolean;
  priority: number;
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface OfferFormData {
  title: string;
  description: string;
  priceBefore: number;
  priceAfter: number;
  discountPercentage: number;
  branches: number[];
  services_ids: number[];
  doctors_ids: number[];
  imageUrl: string;
  imageFile: File | null;
  is_active: boolean;
  priority: number;
}

interface OfferDialogProps {
  open: boolean;
  onClose: () => void;
  offer: Offer | null;
  mode: 'view' | 'edit';
  onSave?: (updatedOffer: Offer) => void;
  services: Service[];
  branches: Branch[];
  doctors: Doctor[];
  editData: OfferFormData;
  setEditData: React.Dispatch<React.SetStateAction<OfferFormData>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
}

const OfferDialog: React.FC<OfferDialogProps> = ({
  open,
  onClose,
  offer,
  mode,
  onSave,
  services,
  branches,
  doctors: allDoctors,
  editData,
  setEditData,
  imagePreview,
  setImagePreview
}) => {
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const calculateDiscount = (before: number, after: number) => {
    return before > 0 ? Math.round(((before - after) / before) * 100) : 0;
  };

  useEffect(() => {
    if (editData.branches.length === 0) {
      setFilteredDoctors([]);
    } else {
      const filtered = allDoctors.filter(doctor =>
        doctor.branches.some(branchId => editData.branches.includes(branchId))
      );
      setFilteredDoctors(filtered);
    }
  }, [editData.branches, allDoctors]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        return;
      }

      setEditData(prev => ({
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
    }
  };

  const clearImageSelection = () => {
    setEditData(prev => ({
      ...prev,
      imageFile: null,
      imageUrl: ''
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    
    setEditData(prev => {
      const newData = {
        ...prev,
        [name]: numValue
      };
      
      if (name === 'priceBefore') {
        newData.discountPercentage = calculateDiscount(numValue, prev.priceAfter);
      } else if (name === 'priceAfter') {
        newData.discountPercentage = calculateDiscount(prev.priceBefore, numValue);
      }
      
      return newData;
    });
  };

  const handleMultiSelect = (type: 'branches' | 'services' | 'doctors', values: any[]) => {
    setEditData(prev => {
      const newData = {...prev};
      if (type === 'branches') {
        newData.branches = values.map(v => v.id);
        newData.doctors_ids = [];
      } else if (type === 'services') {
        newData.services_ids = values.map((item: Service) => item.id);
      } else if (type === 'doctors') {
        newData.doctors_ids = values.map((item: Doctor) => item.id);
      }
      return newData;
    });
  };

  const handleSubmit = async () => {
    if (!offer || !onSave) return;

    try {
      const updatedOffer: Offer = {
        ...offer,
        title: editData.title,
        description: editData.description,
        priceBefore: editData.priceBefore.toString(),
        priceAfter: editData.priceAfter.toString(),
        discountPercentage: editData.discountPercentage.toString(),
        branches: editData.branches.map(b => b.toString()),
        services_ids: editData.services_ids,
        doctors_ids: editData.doctors_ids,
        is_active: editData.is_active,
        priority: editData.priority,
        image: editData.imageUrl || offer.image
      };

      onSave(updatedOffer);
      onClose();
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'view' ? 'عرض التفاصيل' : 'تعديل العرض'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            left: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers>
        {mode === 'view' ? (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Typography variant="h6">معلومات العرض</Typography>
            <Typography><strong>العنوان:</strong> {offer.title}</Typography>
            <Typography><strong>الوصف:</strong> {offer.description}</Typography>
            <Typography><strong>الحالة:</strong> {offer.is_active ? 'نشط' : 'غير نشط'}</Typography>
            <Typography><strong>الأولوية:</strong> {offer.priority}</Typography>
            
            <Typography variant="h6">التسعير</Typography>
            <Typography><strong>السعر الأصلي:</strong> {offer.priceBefore} ر.س</Typography>
            <Typography><strong>السعر بعد الخصم:</strong> {offer.priceAfter} ر.س</Typography>
            <Typography><strong>نسبة الخصم:</strong> {offer.discountPercentage}%</Typography>
            
            <Typography variant="h6">العناصر المرتبطة</Typography>
            <Typography>
              <strong>الفروع:</strong> {offer.branches.map(branch => 
                typeof branch === 'object' ? branch.name : branches.find(b => b.id === parseInt(branch))?.name
              ).filter(Boolean).join(', ')}
            </Typography>
            <Typography>
              <strong>الخدمات:</strong> {offer.services_ids.map(service => 
                typeof service === 'object' ? service.name_ar : services.find(s => s.id === service)?.name_ar
              ).filter(Boolean).join(', ')}
            </Typography>
            <Typography>
              <strong>الأطباء:</strong> {offer.doctors_ids.map(doctor => 
                typeof doctor === 'object' ? doctor.name : allDoctors.find(d => d.id === doctor)?.name
              ).filter(Boolean).join(', ')}
            </Typography>
            
            {offer.image && (
              <>
                <Typography variant="h6">صورة العرض</Typography>
                <Box display="flex" justifyContent="center">
                  <img 
                    src={offer.image.startsWith('http') ? offer.image : `https://www.ss.mastersclinics.com${offer.image}`}
                    alt={offer.title}
                    style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }}
                  />
                </Box>
              </>
            )}
          </Stack>
        ) : (
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="عنوان العرض"
              name="title"
              value={editData.title}
              onChange={handleChange}
              variant="outlined"
              required
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="وصف العرض"
              name="description"
              value={editData.description}
              onChange={handleChange}
              variant="outlined"
            />

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editData.is_active}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      is_active: e.target.checked
                    }))}
                    name="is_active"
                    color="primary"
                  />
                }
                label="العرض نشط"
                labelPlacement="start"
              />

              <TextField
                fullWidth
                type="number"
                label="الأولوية"
                name="priority"
                value={editData.priority}
                onChange={handleChange}
                variant="outlined"
                inputProps={{ min: 0 }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="number"
                label="السعر الأصلي"
                name="priceBefore"
                value={editData.priceBefore}
                onChange={handleNumberChange}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">ر.س</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="السعر بعد الخصم"
                name="priceAfter"
                value={editData.priceAfter}
                onChange={handleNumberChange}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">ر.س</InputAdornment>,
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
              
              <TextField
                fullWidth
                type="number"
                label="نسبة الخصم"
                name="discountPercentage"
                value={editData.discountPercentage}
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  readOnly: true
                }}
              />
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>صورة العرض</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                {imagePreview && (
                  <>
                    <img 
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <IconButton onClick={clearImageSelection} color="error">
                      <CloseIcon />
                    </IconButton>
                  </>
                )}
                <TextField
                  fullWidth
                  label="رابط الصورة"
                  name="imageUrl"
                  value={editData.imageUrl}
                  onChange={handleChange}
                  variant="outlined"
                  placeholder="https://example.com/image.jpg"
                  disabled={!!editData.imageFile}
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
                          onClick={() => fileInputRef.current?.click()}
                        >
                          رفع صورة
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </Box>
            </Box>
            
            <Autocomplete
              multiple
              options={branches}
              getOptionLabel={(option) => option.name}
              value={branches.filter(b => editData.branches.includes(b.id))}
              onChange={(_, value) => handleMultiSelect('branches', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="الفروع"
                  placeholder="اختر الفروع"
                />
              )}
            />
            
            <Autocomplete
              multiple
              options={services}
              getOptionLabel={(option) => option.name_ar}
              value={services.filter(s => editData.services_ids.includes(s.id))}
              onChange={(_, value) => handleMultiSelect('services', value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="الخدمات"
                  placeholder="اختر الخدمات"
                />
              )}
            />
            
            <Autocomplete
              multiple
              options={filteredDoctors}
              getOptionLabel={(option) => option.name}
              value={allDoctors.filter(d => editData.doctors_ids.includes(d.id))}
              onChange={(_, value) => handleMultiSelect('doctors', value)}
              disabled={editData.branches.length === 0}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="الأطباء"
                  placeholder={editData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء"}
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                    size="small"
                  />
                ))
              }
            />
          </Stack>
        )}
      </DialogContent>
      
      {mode === 'edit' && (
        <DialogActions>
          <Button onClick={onClose} color="secondary">
            إلغاء
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            startIcon={<Save />}
          >
            حفظ التغييرات
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

const OfferAddForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    priceBefore: 0,
    priceAfter: 0,
    discountPercentage: 0,
    branches: [],
    services_ids: [],
    doctors_ids: [],
    imageUrl: '',
    imageFile: null,
    is_active: true,
    priority: 0
  });
  
  const [editData, setEditData] = useState<OfferFormData>({
    title: '',
    description: '',
    priceBefore: 0,
    priceAfter: 0,
    discountPercentage: 0,
    branches: [],
    services_ids: [],
    doctors_ids: [],
    imageUrl: '',
    imageFile: null,
    is_active: true,
    priority: 0
  });
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showOffersList, setShowOffersList] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentOffer, setCurrentOffer] = useState<Offer | null>(null);
  const [dialogMode, setDialogMode] = useState<'view' | 'edit'>('view');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);

  function getAuthHeaders() {
    const token = sessionStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  const toggleOffersList = () => {
    setShowOffersList(!showOffersList);
  };

  const handleViewOffer = (offer: Offer) => {
    setCurrentOffer(offer);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setCurrentOffer(offer);
    setDialogMode('edit');
    setDialogOpen(true);
    
    const branchIds = offer.branches.map(b => {
      if (typeof b === 'object') return b.id;
      return parseInt(b);
    });

    const serviceIds = offer.services_ids.map(s => {
      if (typeof s === 'object') return s.id;
      return s;
    });

    const doctorIds = offer.doctors_ids.map(d => {
      if (typeof d === 'object') return d.id;
      return d;
    });

    setEditData({
      title: offer.title,
      description: offer.description,
      priceBefore: parseFloat(offer.priceBefore),
      priceAfter: parseFloat(offer.priceAfter),
      discountPercentage: parseFloat(offer.discountPercentage),
      branches: branchIds,
      services_ids: serviceIds,
      doctors_ids: doctorIds,
      imageUrl: offer.image,
      imageFile: null,
      is_active: Boolean(offer.is_active),
      priority: offer.priority
    });
    
    setImagePreview(offer.image ? 
      (offer.image.startsWith('http') ? offer.image : `https://www.ss.mastersclinics.com${offer.image}`) 
      : null);

    if (branchIds.length > 0) {
      const filtered = allDoctors.filter(doctor =>
        doctor.branches.some(branchId => branchIds.includes(branchId))
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDeleteOffer = (id: number) => {
    setOfferToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    
    try {
      const response = await fetch(`https://www.ss.mastersclinics.com/offers/${offerToDelete}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete offer');

      setNotification({
        open: true,
        message: 'تم حذف العرض بنجاح',
        severity: 'success'
      });
      
      await fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
      setNotification({
        open: true,
        message: 'فشل حذف العرض',
        severity: 'error'
      });
    } finally {
      setDeleteConfirmOpen(false);
      setOfferToDelete(null);
    }
  };

  const clearImageSelection = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imageUrl: ''
    }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicesRes, doctorsRes, branchesRes] = await Promise.all([
          fetch('https://www.ss.mastersclinics.com/services/active', { headers: getAuthHeaders() }),
          fetch('https://www.ss.mastersclinics.com/doctors', { headers: getAuthHeaders() }),
          fetch('https://www.ss.mastersclinics.com/branches', { headers: getAuthHeaders() })
        ]);
        
        const [servicesData, doctorsData, branchesData] = await Promise.all([
          servicesRes.json(),
          doctorsRes.json(),
          branchesRes.json()
        ]);
        
        setServices(servicesData.map((service: any) => ({
          id: service.id,
          name_ar: service.name_ar,
          name_en: service.name_en,
          department_id: service.department_id,
          branches: service.branches,
          description: service.description,
          doctors_ids: service.doctors_ids,
          is_active: service.is_active
        })));

        setAllDoctors(doctorsData.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name,
          branches: doctor.branch_id ? [doctor.branch_id] : [],
          department_id: doctor.department_id
        })));
        
        setBranches(branchesData);
        await fetchOffers();

      } catch (error) {
        console.error('Error fetching data:', error);
        setNotification({
          open: true,
          message: 'فشل تحميل البيانات الأولية',
          severity: 'error'
        });
      } finally {
        setFetching(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch('https://www.ss.mastersclinics.com/offers', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      const transformedOffers = data.map((offer: any) => {
        let branchesArray = [];
        if (Array.isArray(offer.branches)) {
          branchesArray = offer.branches.map((b: any) => b.id.toString());
        } else if (typeof offer.branches === 'string') {
          try {
            branchesArray = JSON.parse(offer.branches);
          } catch {
            branchesArray = offer.branches.split(',').filter(Boolean);
          }
        }

        let servicesArray = [];
        if (Array.isArray(offer.services_ids)) {
          servicesArray = offer.services_ids.map((s: any) => s.id);
        } else if (typeof offer.services_ids === 'string') {
          try {
            servicesArray = JSON.parse(offer.services_ids);
          } catch {
            servicesArray = offer.services_ids.split(',').filter(Boolean).map(Number);
          }
        }

        let doctorsArray = [];
        if (Array.isArray(offer.doctors_ids)) {
          doctorsArray = offer.doctors_ids.map((d: any) => d.id);
        } else if (typeof offer.doctors_ids === 'string') {
          try {
            doctorsArray = JSON.parse(offer.doctors_ids);
          } catch {
            doctorsArray = offer.doctors_ids.split(',').filter(Boolean).map(Number);
          }
        }

        return {
          ...offer,
          branches: branchesArray,
          services_ids: servicesArray,
          doctors_ids: doctorsArray,
          image: offer.image || '',
          priceBefore: offer.priceBefore?.toString() || '0',
          priceAfter: offer.priceAfter?.toString() || '0',
          discountPercentage: offer.discountPercentage?.toString() || '0',
          is_active: Boolean(offer.is_active),
          priority: offer.priority || 0,
          createdAt: {
            _seconds: Math.floor(new Date(offer.created_at).getTime() / 1000),
            _nanoseconds: 0
          }
        };
      });
      
      setOffers(transformedOffers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setNotification({
        open: true,
        message: 'فشل تحميل قائمة العروض',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (formData.branches.length === 0) {
      setFilteredDoctors([]);
      setFormData(prev => ({ ...prev, doctors_ids: [] }));
    } else {
      const filtered = allDoctors.filter(doctor => {
        const doctorBranches = Array.isArray(doctor.branches) ? doctor.branches : [];
        return doctorBranches.some(branchId => formData.branches.includes(branchId));
      });
      setFilteredDoctors(filtered);
    }
  }, [formData.branches, allDoctors]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setNotification({
          open: true,
          message: 'الرجاء اختيار ملف صورة',
          severity: 'error'
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          open: true,
          message: 'يجب أن يكون حجم الملف أقل من 5 ميجابايت',
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
    }
  };

  const calculateDiscount = (before: number, after: number) => {
    return before > 0 ? Math.round(((before - after) / before) * 100) : 0;
  };

  const handleNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      [name]: numValue,
      ...(name === 'priceBefore' && { 
        discountPercentage: calculateDiscount(numValue, prev.priceAfter)
      }),
      ...(name === 'priceAfter' && { 
        discountPercentage: calculateDiscount(prev.priceBefore, numValue)
      })
    }));
  };

  const handleMultiSelect = (type: 'branches' | 'services' | 'doctors', values: any[]) => {
    if (type === 'branches') {
      setFormData(prev => ({
        ...prev,
        branches: values.map(v => v.id),
        doctors_ids: []
      }));
    } else if (type === 'services') {
      setFormData(prev => ({
        ...prev,
        services_ids: values.map(item => item.id)
      }));
    } else if (type === 'doctors') {
      setFormData(prev => ({
        ...prev,
        doctors_ids: values.map(item => item.id)
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('priceBefore', formData.priceBefore.toString());
      formPayload.append('priceAfter', formData.priceAfter.toString());
      formPayload.append('discountPercentage', formData.discountPercentage.toString());
      formPayload.append('branches', JSON.stringify(formData.branches));
      formPayload.append('services_ids', JSON.stringify(formData.services_ids));
      formPayload.append('doctors_ids', JSON.stringify(formData.doctors_ids));
      formPayload.append('is_active', formData.is_active ? '1' : '0');
      formPayload.append('priority', formData.priority.toString());

      if (formData.imageFile) {
        formPayload.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        formPayload.append('imageUrl', formData.imageUrl);
      }

      const response = await fetch('https://www.ss.mastersclinics.com/offers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create offer');
      }

      setNotification({
        open: true,
        message: 'تم إنشاء العرض بنجاح!',
        severity: 'success'
      });
      
      setFormData({
        title: '',
        description: '',
        priceBefore: 0,
        priceAfter: 0,
        discountPercentage: 0,
        branches: [],
        services_ids: [],
        doctors_ids: [],
        imageUrl: '',
        imageFile: null,
        is_active: true,
        priority: 0
      });
      setImagePreview(null);
      await fetchOffers();
      
    } catch (error) {
      console.error('Error creating offer:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'فشل إنشاء العرض',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOffer = async (updatedOffer: Offer) => {
    try {
      const formPayload = new FormData();
      formPayload.append('title', updatedOffer.title);
      formPayload.append('description', updatedOffer.description);
      formPayload.append('priceBefore', updatedOffer.priceBefore);
      formPayload.append('priceAfter', updatedOffer.priceAfter);
      formPayload.append('discountPercentage', updatedOffer.discountPercentage);
      formPayload.append('branches', JSON.stringify(updatedOffer.branches));
      formPayload.append('services_ids', JSON.stringify(updatedOffer.services_ids));
      formPayload.append('doctors_ids', JSON.stringify(updatedOffer.doctors_ids));
      formPayload.append('is_active', updatedOffer.is_active ? '1' : '0');
      formPayload.append('priority', updatedOffer.priority.toString());

      if (editData.imageFile) {
        formPayload.append('image', editData.imageFile);
      } else if (editData.imageUrl) {
        formPayload.append('imageUrl', editData.imageUrl);
      }

      const response = await fetch(`https://www.ss.mastersclinics.com/offers/${updatedOffer.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: formPayload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update offer');
      }

      setNotification({
        open: true,
        message: 'تم تحديث العرض بنجاح',
        severity: 'success'
      });
      
      await fetchOffers();
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating offer:', error);
      setNotification({
        open: true,
        message: error instanceof Error ? error.message : 'فشل تحديث العرض',
        severity: 'error'
      });
    }
  };

  if (fetching) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, direction: 'rtl' }}>
      <Box display="flex" alignItems="center" mb={4}>
        <Button
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          العودة إلى العروض
        </Button>
        <Typography variant="h4">إدارة العروض</Typography>
      </Box>

      <Button 
        variant="outlined" 
        onClick={toggleOffersList}
        sx={{ mb: 2 }}
      >
        {showOffersList ? 'إخفاء قائمة العروض' : 'عرض قائمة العروض الحالية'}
      </Button>

      {showOffersList && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              العروض الحالية
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>الصورة</TableCell>
                    <TableCell>العنوان</TableCell>
                    <TableCell>الحالة</TableCell>
                    <TableCell>الأولوية</TableCell>
                    <TableCell>السعر الأصلي</TableCell>
                    <TableCell>السعر بعد الخصم</TableCell>
                    <TableCell>الخصم</TableCell>
                    <TableCell>الفروع</TableCell>
                    <TableCell>تاريخ الإنشاء</TableCell>
                    <TableCell>إجراءات</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {offers.length > 0 ? (
                    offers.map((offer) => (
                      <TableRow key={offer.id}>
                        <TableCell>
                          {offer.image && (
                            <img 
                              src={offer.image.startsWith('http') ? offer.image : `https://www.ss.mastersclinics.com${offer.image}`}
                              alt={offer.title}
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">{offer.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {offer.description.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={offer.is_active ? 'نشط' : 'غير نشط'} 
                            color={offer.is_active ? 'success' : 'default'} 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell>{offer.priority}</TableCell>
                        <TableCell>{offer.priceBefore}ر.س</TableCell>
                        <TableCell>{offer.priceAfter}ر.س</TableCell>
                        <TableCell>{offer.discountPercentage}%</TableCell>
                        <TableCell>
                          {offer.branches.slice(0, 2).map(branch => {
                            const branchObj = typeof branch === 'object' ? 
                              branch : 
                              branches.find(b => b.id === parseInt(branch));
                            return branchObj ? (
                              <Chip key={branchObj.id} label={branchObj.name} size="small" sx={{ m: 0.5 }} />
                            ) : null;
                          })}
                          {offer.branches.length > 2 && (
                            <Chip label={`+${offer.branches.length - 2}`} size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(offer.createdAt._seconds * 1000).toLocaleDateString('ar-EG')}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="عرض التفاصيل">
                            <IconButton onClick={() => handleViewOffer(offer)}>
                              <ViewIcon color="info" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="تعديل">
                            <IconButton onClick={() => handleEditOffer(offer)}>
                              <EditIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="حذف">
                            <IconButton onClick={() => handleDeleteOffer(offer.id)}>
                              <DeleteIcon color="error" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={10} align="center">
                        لا توجد عروض متاحة
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {currentOffer ? 'تعديل العرض' : 'إضافة عرض جديد'}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                label="عنوان العرض"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="وصف العرض"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        is_active: e.target.checked
                      }))}
                      name="is_active"
                      color="primary"
                    />
                  }
                  label="العرض نشط"
                  labelPlacement="start"
                />

                <TextField
                  fullWidth
                  type="number"
                  label="الأولوية"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  variant="outlined"
                  inputProps={{ min: 0 }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" gutterBottom>صورة العرض</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  {imagePreview && (
                    <>
                      <img 
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' }}
                      />
                      <IconButton onClick={clearImageSelection} color="error">
                        <CloseIcon />
                      </IconButton>
                    </>
                  )}
                  <TextField
                    fullWidth
                    label="رابط الصورة"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    variant="outlined"
                    placeholder="https://example.com/image.jpg"
                    disabled={!!formData.imageFile}
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
                            component="label"
                            startIcon={<CloudUpload />}
                          >
                            رفع صورة
                            <input
                              type="file"
                              hidden
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              accept="image/*"
                            />
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Box>

              <Divider>
                <Chip label="معلومات التسعير" />
              </Divider>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="السعر الأصلي"
                  name="priceBefore"
                  value={formData.priceBefore}
                  onChange={handleNumberChange}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ر.س</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="السعر بعد الخصم"
                  name="priceAfter"
                  value={formData.priceAfter}
                  onChange={handleNumberChange}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">ر.س</InputAdornment>,
                    inputProps: { min: 0, step: 0.01 }
                  }}
                />
                
                <TextField
                  fullWidth
                  type="number"
                  label="نسبة الخصم"
                  name="discountPercentage"
                  value={formData.discountPercentage}
                  variant="outlined"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    readOnly: true
                  }}
                />
              </Box>

              <Divider>
                <Chip label="العناصر المرتبطة" />
              </Divider>

              <Autocomplete
                multiple
                options={branches}
                getOptionLabel={(option) => option.name}
                value={branches.filter(b => formData.branches.includes(b.id))}
                onChange={(_, value) => handleMultiSelect('branches', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="الفروع"
                    placeholder="اختر الفروع"
                  />
                )}
              />

              <Autocomplete
                multiple
                options={services}
                getOptionLabel={(option) => option.name_ar}
                value={services.filter(s => formData.services_ids.includes(s.id))}
                onChange={(_, value) => handleMultiSelect('services', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="الخدمات"
                    placeholder="اختر الخدمات"
                  />
                )}
              />

              <Autocomplete
                multiple
                options={filteredDoctors}
                getOptionLabel={(option) => option.name}
                value={allDoctors.filter(d => formData.doctors_ids.includes(d.id))}
                onChange={(_, value) => handleMultiSelect('doctors', value)}
                disabled={formData.branches.length === 0}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="الأطباء"
                    placeholder={formData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء"}
                  />
                )}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                      size="small"
                    />
                  ))
                }
              />

              <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
                <Button
                  variant="outlined"
                  color="secondary"
                  disabled={loading}
                  onClick={() => {
                    setFormData({
                      title: '',
                      description: '',
                      priceBefore: 0,
                      priceAfter: 0,
                      discountPercentage: 0,
                      branches: [],
                      services_ids: [],
                      doctors_ids: [],
                      imageUrl: '',
                      imageFile: null,
                      is_active: true,
                      priority: 0
                    });
                    setImagePreview(null);
                  }}
                >
                  مسح النموذج
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ العرض'}
                </Button>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      <OfferDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        offer={currentOffer}
        mode={dialogMode}
        onSave={handleSaveOffer}
        services={services}
        branches={branches}
        doctors={allDoctors}
        editData={editData}
        setEditData={setEditData}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>هل أنت متأكد من رغبتك في حذف هذا العرض؟ لا يمكن التراجع عن هذا الإجراء.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>إلغاء</Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
          >
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default OfferAddForm;