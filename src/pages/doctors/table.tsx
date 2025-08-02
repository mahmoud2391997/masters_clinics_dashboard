import React, { useState, useEffect } from 'react';
import {
  Table, TableContainer, TableHead, TableRow, TableCell, Paper,
  Box, TextField, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, LinearProgress, CircularProgress,
  IconButton, MenuItem, FormControl, InputLabel, Select,
  Switch, FormControlLabel,
  TableBody
} from '@mui/material';
import { Add,  Delete } from '@mui/icons-material';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  branch_id: number;
  department_id: number;
  services: string;
  image: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Branch { id: number; name: string; }
interface Department { id: number; name: string; }

const DoctorTable: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newDoctor, setNewDoctor] = useState<Partial<Doctor>>({
    name: '', specialty: '', branch_id: 0, department_id: 0,
    services: '', image: null, priority: 0, is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<Department[]>([]);

  useEffect(() => {
    fetchDoctors();
    fetchOptions();
  }, []);

  const fetchDoctors = async () => {
    try {
      const resp = await axios.get<Doctor[]>('https://www.ss.mastersclinics.com/doctors', {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      console.log(resp.data);
      
      setDoctors(resp.data);
      setFilteredDoctors(resp.data);
    } catch (err) { console.error(err); setError('فشل تحميل الأطباء'); }
    finally { setLoading(false); }
  };

  const fetchOptions = async () => {
    try {
      const [b, d] = await Promise.all([
        axios.get<Branch[]>('https://www.ss.mastersclinics.com/branches', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
        axios.get<Department[]>('https://www.ss.mastersclinics.com/departments', { headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` } }),
      ]);
      setBranchOptions(b.data);
      setDepartmentOptions(d.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const f = doctors.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.specialty && doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredDoctors(f);
  }, [searchQuery, doctors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({ ...prev, [name]: name === 'priority' ? Number(value) : value }));
  };
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDoctor(prev => ({ ...prev, is_active: e.target.checked }));
  };
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewDoctor(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!newDoctor.name) { setError('الاسم مطلوب'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(newDoctor).forEach(([k, v]) => {
        if (v !== undefined) formData.append(k, String(v));
      });
      if (imageFile) formData.append('image', imageFile);
      const resp = await axios.post('https://www.ss.mastersclinics.com/doctors', formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}`, 'Content-Type': 'multipart/form-data' }
      });
      setDoctors(prev => [...prev, resp.data]);
      setFilteredDoctors(prev => [...prev, resp.data]);
      setOpenAddDialog(false); resetForm();
    } catch (err) { console.error(err); setError('فشل إضافة الطبيب'); }
    finally { setSubmitting(false); }
  };

  const resetForm = () => {
    setNewDoctor({ name: '', specialty: '', branch_id: 0, department_id: 0, services: '', image: null, priority: 0, is_active: true });
    setImageFile(null); setImagePreview(null);
  };

  const handleDeleteClick = (id: number) => {
    setDoctorToDelete(id); setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!doctorToDelete) return;
    setDeleting(true);
    try {
      await axios.delete(`https://www.ss.mastersclinics.com/doctors/${doctorToDelete}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` }
      });
      setDoctors(prev => prev.filter(d => d.id !== doctorToDelete));
      setFilteredDoctors(prev => prev.filter(d => d.id !== doctorToDelete));
      setDeleteDialogOpen(false);
    } catch (err) { console.error(err); setError('فشل الحذف'); }
    finally { setDeleting(false); setDoctorToDelete(null); }
  };

  const getBranchName = (id: number) => branchOptions.find(b => b.id === id)?.name || '';
  const getDepartmentName = (id: number) => departmentOptions.find(d => d.id === id)?.name || '';

  return (
    <Box dir="rtl" className="p-5">
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth label="ابحث بالاسم أو التخصص" variant="outlined"
          value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenAddDialog(true)}>
          إضافة طبيب
        </Button>
      </Box>
      {error && <Typography color="error" mb={2}>{error}</Typography>}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">الاسم</TableCell>
              <TableCell align="center">التخصص</TableCell>
              <TableCell align="center">الفرع</TableCell>
              <TableCell align="center">القسم</TableCell>
              <TableCell align="center">الخدمات</TableCell>
              <TableCell align="center">الأولوية</TableCell>
              <TableCell align="center">نشط</TableCell>
              <TableCell align="center">الإجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center"><LinearProgress/></TableCell></TableRow>
            ) : filteredDoctors.length ? (
              filteredDoctors.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell align="center">{doc.name}</TableCell>
                  <TableCell align="center">{doc.specialty || '-'}</TableCell>
                  <TableCell align="center">{getBranchName(doc.branch_id)}</TableCell>
                  <TableCell align="center">{getDepartmentName(doc.department_id)}</TableCell>
                  <TableCell align="center">{doc.services?.substring(0,50)+'...'}</TableCell>
                  <TableCell align="center">{doc.priority}</TableCell>
                  <TableCell align="center">{doc.is_active ? 'نعم' : 'لا'}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Link to={`/doctors/${doc.id}`}><Button variant="outlined" size="small">عرض</Button></Link>
                      <IconButton color="error" onClick={() => handleDeleteClick(doc.id)}><Delete/></IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={8} align="center">لا توجد بيانات</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent><Typography>هل تريد حذف هذا الطبيب؟</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>إلغاء</Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20}/> : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAddDialog} onClose={() => { setOpenAddDialog(false); resetForm(); }} fullWidth maxWidth="md">
        <DialogTitle>إضافة طبيب جديد</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3} pt={2}>
            <TextField label="الاسم" name="name" value={newDoctor.name} onChange={handleInputChange} fullWidth />
            <TextField label="التخصص" name="specialty" value={newDoctor.specialty} onChange={handleInputChange} fullWidth />
            <TextField label="الخدمات" name="services" value={newDoctor.services} onChange={handleInputChange} multiline rows={3} fullWidth />
            <FormControl fullWidth>
              <InputLabel>الفرع</InputLabel>
              <Select name="branch_id" value={newDoctor.branch_id || ''} onChange={handleSelectChange}>
                {branchOptions.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>القسم</InputLabel>
              <Select name="department_id" value={newDoctor.department_id || ''} onChange={handleSelectChange}>
                {departmentOptions.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="الأولوية" name="priority" type="number" value={newDoctor.priority} onChange={handleInputChange} fullWidth />
            <FormControlLabel control={<Switch checked={newDoctor.is_active!} onChange={handleSwitchChange} />} label="نشط" />
            <Box>
              <Typography variant="subtitle1">صورة الحساب</Typography>
              <Button variant="outlined" component="label" fullWidth>
                رفع صورة<input type="file" hidden accept="image/*" onChange={handleFileChange} />
              </Button>
              {imagePreview && <Box mt={2} textAlign="center"><img src={imagePreview} alt="Preview" style={{ maxHeight: 200, maxWidth: '100%', borderRadius: 4 }} /></Box>}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpenAddDialog(false); resetForm(); }}>إلغاء</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>
            {submitting ? <CircularProgress size={20}/> : 'حفظ'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorTable;
