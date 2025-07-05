import React, { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TableBody,
  TextField,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Checkbox,
  FormControlLabel,
  IconButton,
  Avatar,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Doctor {
  _id: string;
  id: number;
  name: string;
  specialty: string;
  bio:string;
  department: string;
  branches: string[];
  imageUrl?: string;
  working_hours_slots?: WorkingHoursSlot[];
}

interface WorkingHoursSlot {
  days: string[];
  openingTime: string;
  closingTime: string;
}

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const defaultFormFields = [
  { name: 'name', label: 'اسم الطبيب' },
  { name: 'specialty', label: 'التخصص' },
  { name: 'department', label: 'القسم' },
  { name: 'branch', label: 'الفرع' },
];

const DataTableHeaders: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '',
    specialty: '',
    department: '',
    branches: [],
    working_hours_slots: [],
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get<Doctor[]>('https://www.ss.mastersclinics.com/doctors',
          {
            headers: {
              'Content-Type': 'application/json',
              "Authorization": `Bearer ${sessionStorage.getItem('token')}`,
            },
          }
        );
        const data = response.data;
        console.log('Fetched Doctors:', data);

        setDoctors(data);

        // Extract unique branches and departments
        const allBranches = data.flatMap(doctor => doctor.branches);
        const uniqueBranches = Array.from(new Set(allBranches));
        const uniqueDepartments = Array.from(new Set(data.map(d => d.department)));

        setBranches(['الكل', ...uniqueBranches]);
        setDepartments(['الكل', ...uniqueDepartments]);

        setFilteredDoctors(data);
      } catch (err) {
        setError('فشل تحميل بيانات الأطباء');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...doctors];

    // Branch filter
    if (selectedBranch && selectedBranch !== 'الكل') {
      filtered = filtered.filter(d => d.branches.includes(selectedBranch));
    }

    // Department filter
    if (selectedDepartment && selectedDepartment !== 'الكل') {
      filtered = filtered.filter(d => d.department === selectedDepartment);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.name.toLowerCase().includes(query) ||
          d.specialty.toLowerCase().includes(query)
      );
    }

    setFilteredDoctors(filtered);
  }, [selectedBranch, selectedDepartment, searchQuery, doctors]);

  const handleAddDoctor = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setNewDoctor({
      name: '',
      specialty: '',
      department: '',
      branches: [],
      working_hours_slots: [],
    });
    setImageFile(null);
    setImageUrl('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({ ...prev, [name]: value }));
  };

  const handleBranchChange = (e: any) => {
    const { value } = e.target;
    setNewDoctor(prev => ({ ...prev, branches: [value] }));
  };

  const handleDepartmentChange = (e: any) => {
    const { value } = e.target;
    setNewDoctor(prev => ({ ...prev, department: value }));
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
    setNewDoctor(prev => ({
      ...prev,
      working_hours_slots: [
        ...(prev.working_hours_slots || []),
        { days: [], openingTime: '', closingTime: '' }
      ]
    }));
  };

  const removeWorkingHoursSlot = (index: number) => {
    setNewDoctor(prev => {
      const updatedSlots = [...(prev.working_hours_slots || [])];
      updatedSlots.splice(index, 1);
      return { ...prev, working_hours_slots: updatedSlots };
    });
  };

  const handleDayToggle = (slotIndex: number, day: string) => {
    setNewDoctor(prev => {
      const updatedSlots = [...(prev.working_hours_slots || [])];
      const currentDays = updatedSlots[slotIndex].days || [];
      
      if (currentDays.includes(day)) {
        updatedSlots[slotIndex].days = currentDays.filter(d => d !== day);
      } else {
        updatedSlots[slotIndex].days = [...currentDays, day];
      }
      
      return { ...prev, working_hours_slots: updatedSlots };
    });
  };

  const handleWorkingHoursChange = (slotIndex: number, field: string, value: string) => {
    setNewDoctor(prev => {
      const updatedSlots = [...(prev.working_hours_slots || [])];
      updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], [field]: value };
      return { ...prev, working_hours_slots: updatedSlots };
    });
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newDoctor.name || '');
      formData.append('specialty', newDoctor.specialty || '');
      formData.append('bio', newDoctor.bio || '');
      formData.append('department', newDoctor.department || '');
      formData.append('branches', JSON.stringify(newDoctor.branches || []));
      formData.append('working_hours_slots', JSON.stringify(newDoctor.working_hours_slots || []));
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      const response = await axios.post('https://www.ss.mastersclinics.com/doctors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          "Authorization": `Bearer ${sessionStorage.getItem('token')}`,
        },
      });

      setDoctors(prev => [...prev, response.data]);
      setFilteredDoctors(prev => [...prev, response.data]);
      handleCloseAddDialog();
    } catch (err) {
      setError('فشل في إضافة الطبيب');
      console.error(err);
    }
  };

  const getDayName = (day: string) => {
    const dayNames: Record<string, string> = {
      sunday: 'الأحد',
      monday: 'الإثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت'
    };
    return dayNames[day] || day;
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const formatDaysRange = (days: string[]) => {
    if (days.length === 7) return 'كل الأيام';
    if (days.length === 5 && 
        !days.includes('friday') && 
        !days.includes('saturday')) return 'أيام العمل (الأحد - الخميس)';
    
    return days.map(getDayName).join('، ');
  };

  return (
    <Box dir="rtl" className="p-5">
      {/* Filter Section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Input */}
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <TextField
              fullWidth
              label="بحث بالاسم أو التخصص"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          {/* Branch Filter */}
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <FormControl fullWidth>
              <InputLabel id="branch-filter-label">تصفية حسب الفرع</InputLabel>
              <Select
                labelId="branch-filter-label"
                value={selectedBranch}
                label="تصفية حسب الفرع"
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {branches.map((branch, index) => (
                  <MenuItem key={index} value={branch}>
                    {branch}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Department Filter */}
          <Box sx={{ flex: 1, minWidth: '200px' }}>
            <FormControl fullWidth>
              <InputLabel id="department-filter-label">تصفية حسب القسم</InputLabel>
              <Select
                labelId="department-filter-label"
                value={selectedDepartment}
                label="تصفية حسب القسم"
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept, index) => (
                  <MenuItem key={index} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Add Doctor Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleAddDoctor}
            sx={{ height: '56px' }}
          >
            إضافة طبيب
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {defaultFormFields.map((field) => (
                <TableCell
                  key={field.name}
                  sx={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  {field.label || field.name}
                </TableCell>
              ))}
              <TableCell
                align="center"
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  backgroundColor: '#f5f5f5',
                }}
              >
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>جاري التحميل...</Typography>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={5} align="center" color="error">
                  <Typography color="error">{error}</Typography>
                </TableCell>
              </TableRow>
            ) : filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell align="center">{doctor.name}</TableCell>
                  <TableCell align="center">{doctor.specialty}</TableCell>
                  <TableCell align="center">{doctor.department}</TableCell>
                  <TableCell align="center">{doctor.branches.join(', ')}</TableCell>
                  <TableCell align="center">
                    <Link to={`/doctors/${doctor.id}`}>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                        عرض
                      </button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>لا يوجد أطباء متاحين</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Doctor Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} fullWidth maxWidth="md">
        <DialogTitle>إضافة طبيب جديد</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
              <Box flex={1} display="flex" flexDirection="column" gap={3}>
                {/* Name */}
                <TextField
                  fullWidth
                  label="اسم الطبيب"
                  name="name"
                  value={newDoctor.name}
                  onChange={handleInputChange}
                />

                {/* Specialty */}
                <TextField
                  fullWidth
                  label="التخصص"
                  name="specialty"
                  value={newDoctor.specialty}
                  onChange={handleInputChange}
                />
                {/* Specialty */}
                <TextField
                  fullWidth
                  label="السيرة الذاتية"
                  name="bio"
                  value={newDoctor.bio}
                  onChange={handleInputChange}
                />

                {/* Department */}
                <FormControl fullWidth>
                  <InputLabel id="department-label">القسم</InputLabel>
                  <Select
                    labelId="department-label"
                    label="القسم"
                    value={newDoctor.department}
                    onChange={handleDepartmentChange}
                  >
                    {departments.filter(d => d !== 'الكل').map((dept, index) => (
                      <MenuItem key={index} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Branch */}
                <FormControl fullWidth>
                  <InputLabel id="branch-label">الفرع</InputLabel>
                  <Select
                    labelId="branch-label"
                    label="الفرع"
                    value={newDoctor.branches?.[0] || ''}
                    onChange={handleBranchChange}
                  >
                    {branches.filter(b => b !== 'الكل').map((branch, index) => (
                      <MenuItem key={index} value={branch}>
                        {branch}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Image Upload */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>صورة الطبيب</Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <Button variant="outlined" component="label">
                      اختر صورة
                      <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                    </Button>
                    {imageFile && (
                      <Typography variant="body2">{imageFile.name}</Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    أو
                  </Typography>
                  <TextField
                    fullWidth
                    label="رابط الصورة"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    sx={{ mt: 1 }}
                  />
                  {(imageFile || imageUrl) && (
                    <Avatar
                      src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                      sx={{ width: 100, height: 100, mt: 2 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Working Hours */}
              <Box flex={1}>
                <Box borderTop="1px solid" borderColor="divider" pt={3}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6">ساعات العمل</Typography>
                    <Button 
                      startIcon={<Add />} 
                      onClick={addWorkingHoursSlot}
                      sx={{ bgcolor: 'indigo.100', color: 'indigo.700', '&:hover': { bgcolor: 'indigo.200' } }}
                    >
                      إضافة وقت
                    </Button>
                  </Box>
                  
                  <Stack spacing={2}>
                    {(newDoctor.working_hours_slots || []).map((slot, index) => (
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
                                  fullWidth
                                  InputLabelProps={{ shrink: true }}
                                  sx={{ '& label': { right: 0, left: 'auto' }, '& input': { textAlign: 'right' } }}
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Box display="flex" justifyContent="flex-end" mt={1}>
                          <IconButton onClick={() => removeWorkingHoursSlot(index)} color="error" size="small">
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        {slot.days?.length > 0 && slot.openingTime && slot.closingTime && (
                          <Typography variant="body2" sx={{ textAlign: 'right', mt: 1, color: 'text.secondary' }}>
                            {formatDaysRange(slot.days)}: {formatTime(slot.openingTime)} - {formatTime(slot.closingTime)}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>إلغاء</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={!newDoctor.name || !newDoctor.specialty || !newDoctor.department || !newDoctor.branches?.length}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTableHeaders;