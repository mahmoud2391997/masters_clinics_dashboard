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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
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
  name: string;
  department_id?: number;
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
  branches: string[];
  services_ids: number[];
  doctors_ids: number[];
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
}

const OfferDialog: React.FC<OfferDialogProps> = ({
  open,
  onClose,
  offer,
  mode,
  onSave,
  services,
  branches,
  doctors: allDoctors
}) => {
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
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate discount percentage
const calculateDiscount = (before: number, after: number) => {
  return before > 0 ? Math.round(((before - after) / before) * 100) : 0;
};

  // Filter doctors based on selected branches
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

  // Initialize form data when offer changes
  useEffect(() => {
    if (offer) {
      const initialData: OfferFormData = {
        title: offer.title || '',
        description: offer.description || '',
        priceBefore: parseFloat(offer.priceBefore) || 0,
        priceAfter: parseFloat(offer.priceAfter) || 0,
        discountPercentage: parseFloat(offer.discountPercentage) || 0,
        branches: offer.branches.map(b => parseInt(b, 10)) || [],
        services_ids: offer.services_ids || [],
        doctors_ids: offer.doctors_ids || [],
        imageUrl: offer.image || '',
        imageFile: null
      };
      setEditData(initialData);
      setImagePreview(offer.image || null);
    }
  }, [offer]);

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
        newData.branches = values;
        // Reset doctors when branches change
        newData.doctors_ids = values.length === 0 ? [] : 
          prev.doctors_ids.filter(id => 
            filteredDoctors.some(d => d.id === id)
          );
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
      // Create FormData for the update
      const formPayload = new FormData();
      formPayload.append('title', editData.title);
      formPayload.append('description', editData.description);
      formPayload.append('priceBefore', editData.priceBefore.toString());
      formPayload.append('priceAfter', editData.priceAfter.toString());
      formPayload.append('discountPercentage', editData.discountPercentage.toString());
      formPayload.append('branches', editData.branches.join(','));
      formPayload.append('services_ids', editData.services_ids.join(','));
      formPayload.append('doctors_ids', editData.doctors_ids.join(','));

      // Handle image updates
      if (editData.imageFile) {
        formPayload.append('image', editData.imageFile);
      } else if (editData.imageUrl) {
        formPayload.append('imageUrl', editData.imageUrl);
      }

      // Call the onSave callback with updated data
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
            
            <Typography variant="h6">التسعير</Typography>
            <Typography><strong>السعر الأصلي:</strong> {offer.priceBefore} ر.س</Typography>
            <Typography><strong>السعر بعد الخصم:</strong> {offer.priceAfter} ر.س</Typography>
            <Typography><strong>نسبة الخصم:</strong> {offer.discountPercentage}%</Typography>
            
            <Typography variant="h6">العناصر المرتبطة</Typography>
            <Typography>
              <strong>الفروع:</strong> {offer.branches.map(branchId => 
                branches.find(b => b.id === parseInt(branchId))?.name).filter(Boolean).join(', ')}
            </Typography>
            <Typography>
              <strong>الخدمات:</strong> {offer.services_ids.map(id => 
                services.find(s => s.id === id)?.name).filter(Boolean).join(', ')}
            </Typography>
            <Typography>
              <strong>الأطباء:</strong> {offer.doctors_ids.map(id => 
                allDoctors.find(d => d.id === id)?.name).filter(Boolean).join(', ')}
            </Typography>
            
            {offer.image && (
              <>
                <Typography variant="h6">صورة العرض</Typography>
                <Avatar 
                  src={offer.image} 
                  variant="rounded"
                  sx={{ width: 200, height: 200 }}
                />
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
                  <Avatar 
                    src={imagePreview} 
                    variant="rounded"
                    sx={{ width: 100, height: 100 }}
                  />
                )}
                <TextField
                  fullWidth
                  label="رابط الصورة"
                  name="imageUrl"
                  value={editData.imageUrl}
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
                          onClick={() => fileInputRef.current?.click()}
                        >
                          رفع صورة
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  disabled={!!editData.imageFile}
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
              onChange={(_, value) => handleMultiSelect('branches', value.map(v => v.id))}
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
              getOptionLabel={(option) => option.name}
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
    imageFile: null
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
      Authorization: token ? `Bearer ${token}` : '',
    };
  }

function parseIdsString(field: any): number[] {
  if (!field) return [];
  if (Array.isArray(field)) {
    // Example: ["3,4"]
    if (typeof field[0] === "string") {
      return field[0]
        .split(",")
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));
    } else if (typeof field[0] === "number") {
      return field;
    }
  } else if (typeof field === "string") {
    return field
      .split(",")
      .map(id => parseInt(id.trim(), 10))
      .filter(id => !isNaN(id));
  } else if (typeof field === "number") {
    return [field];
  }
  return [];
}

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch services
        const servicesRes = await fetch('http://localhost:3000/services', {
          headers: getAuthHeaders()
        });
        const servicesData = await servicesRes.json();
        console.log(servicesData);
        
        setServices(servicesData.map((service: any) => ({
          id: service.id,
          name: service.title,
          department_id: service.department_id
        })));

        // Fetch all doctors
        const doctorsRes = await fetch('http://localhost:3000/doctors', {
          headers: getAuthHeaders()
        });
        const doctorsData = await doctorsRes.json();
        
        // Transform doctors data to include branches as array
        const transformedDoctors = doctorsData.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name,
          branches: parseIdsString(doctor.branches_ids),
          department_id: doctor.department_id
        }));
        setAllDoctors(transformedDoctors);
        
        // Fetch branches
        const branchesRes = await fetch('http://localhost:3000/branches', {
          headers: getAuthHeaders()
        });
        console.log(branchesRes);

        const branchesData = await branchesRes.json();
        setBranches(branchesData);

        // Fetch offers
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
      const response = await fetch('http://localhost:3000/offers', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      console.log(data);
      
      // Transform offers data to match the expected interface
      const transformedOffers = data.map((offer: any) => ({
        ...offer,
        branches: parseIdsString(offer.branches),
        services_ids: parseIdsString(offer.services_ids),
        doctors_ids: parseIdsString(offer.doctors_ids),
        createdAt: {
          _seconds: Math.floor(new Date(offer.created_at).getTime() / 1000),
          _nanoseconds: 0
        }
      }));
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

  // Filter doctors when branches are selected
  useEffect(() => {
    if (formData.branches.length === 0) {
      setFilteredDoctors([]);
      setFormData(prev => ({ ...prev, doctors_ids: [] }));
    } else {
      const filtered = allDoctors.filter(doctor =>
        doctor.branches.some(branchId => formData.branches.includes(branchId))
      );
      setFilteredDoctors(filtered);
      // Clear selected doctors if they're not in the filtered list
      setFormData(prev => ({
        ...prev,
        doctors_ids: prev.doctors_ids.filter(id => 
          filtered.some(doctor => doctor.id === id))
      }));
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
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setNotification({
          open: true,
          message: 'الرجاء اختيار ملف صورة',
          severity: 'error'
        });
        return;
      }

      // Validate file size (5MB limit)
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
        imageUrl: '' // Clear URL when file is selected
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        branches: values,
        doctors_ids: [] // Reset doctors when branches change
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
      formPayload.append('branches', formData.branches.join(','));
      formPayload.append('services_ids', formData.services_ids.join(','));
      formPayload.append('doctors_ids', formData.doctors_ids.join(','));

      if (formData.imageFile) {
        formPayload.append('image', formData.imageFile);
      } else if (formData.imageUrl) {
        formPayload.append('imageUrl', formData.imageUrl);
      }

      const response = await fetch('http://localhost:3000/offers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formPayload,
      });

      if (!response.ok) throw new Error('فشل إنشاء العرض');

      setNotification({
        open: true,
        message: 'تم إنشاء العرض بنجاح!',
        severity: 'success'
      });
      
      // Reset form and fetch updated offers list
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
        imageFile: null
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
  };

  const handleDeleteOffer = (id: number) => {
    setOfferToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3000/offers/${offerToDelete}`, {
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

  const handleSaveOffer = async (updatedOffer: Offer) => {
    try {
      const formPayload = new FormData();
      formPayload.append('title', updatedOffer.title);
      formPayload.append('description', updatedOffer.description);
      formPayload.append('priceBefore', updatedOffer.priceBefore);
      formPayload.append('priceAfter', updatedOffer.priceAfter);
      formPayload.append('discountPercentage', updatedOffer.discountPercentage);
      formPayload.append('branches', updatedOffer.branches.join(','));
      formPayload.append('services_ids', updatedOffer.services_ids.join(','));
      formPayload.append('doctors_ids', updatedOffer.doctors_ids.join(','));

      if (updatedOffer.image && !updatedOffer.image.startsWith('http')) {
        // Handle image update if needed
      }

      const response = await fetch(`http://localhost:3000/offers/${updatedOffer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formPayload
      });

      if (!response.ok) throw new Error('Failed to update offer');

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
        message: 'فشل تحديث العرض',
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
                          <Avatar 
                            src={offer.image} 
                            alt={offer.title}
                            variant="rounded"
                            sx={{ width: 60, height: 60 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">{offer.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {offer.description.substring(0, 50)}...
                          </Typography>
                        </TableCell>
                        <TableCell>{offer.priceBefore}ر.س</TableCell>
                        <TableCell>{offer.priceAfter}ر.س</TableCell>
                        <TableCell>{offer.discountPercentage}%</TableCell>
                        <TableCell>
                          {offer.branches.slice(0, 2).map(branchId => {
                            const branch = branches.find(b => b.id === parseInt(branchId));
                            return branch ? (
                              <Chip key={branch.id} label={branch.name} size="small" sx={{ m: 0.5 }} />
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
                      <TableCell colSpan={8} align="center">
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

              <Box>
                <Typography variant="subtitle1" gutterBottom>صورة العرض</Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  {imagePreview && (
                    <Avatar 
                      src={imagePreview} 
                      variant="rounded"
                      sx={{ width: 100, height: 100 }}
                    />
                  )}
                  <TextField
                    fullWidth
                    label="رابط الصورة"
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
                            رفع صورة
                          </Button>
                        </InputAdornment>
                      ),
                    }}
                    disabled={!!formData.imageFile}
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
  onChange={(_, value) => handleMultiSelect('branches', value.map(v => v.id))}
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
                getOptionLabel={(option) => option.name}
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
  options={filteredDoctors}  // or allDoctors depending on your needs
  getOptionLabel={(option) => option.name}
  value={filteredDoctors.filter(d => formData.doctors_ids.includes(d.id))}
  onChange={(_, value) => handleMultiSelect('doctors', value)}
  disabled={formData.branches.length === 0}
  renderInput={(params) => (
    <TextField
      {...params}
      label="الأطباء"
      placeholder={formData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء"}
    />
  )}
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
                      imageFile: null
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