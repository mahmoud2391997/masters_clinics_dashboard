import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  CardMedia,
  IconButton,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
  Box,
  Divider,
  CircularProgress
} from "@mui/material";
import {
  Delete,
  Edit,
  Close,
  Save,
  Cancel,
  CloudUpload,
  Business
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";

interface Branch {
  id: number;
  name: string;
}

interface DepartmentStat {
  id: number;
  name: string;
  description: string;
  image?: string;
  branch_ids?: number[] | string;
}

interface Props {
  department: DepartmentStat;
  branches: Branch[];
  onUpdateSuccess: () => void;
  onDeleteSuccess: () => void;
}

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const CardStats: React.FC<Props> = ({ department, branches, onUpdateSuccess, onDeleteSuccess }) => {
  const parseBranchIds = (branchIds: number[] | string | undefined): number[] => {
    if (!branchIds) return [];
    if (Array.isArray(branchIds)) return branchIds;
    if (typeof branchIds === 'string') {
      try {
        return JSON.parse(branchIds) || [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const initialBranchIds = parseBranchIds(department.branch_ids);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(department.name);
  const [description, setDescription] = useState(department.description);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>(initialBranchIds);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    setSelectedBranchIds(parseBranchIds(department.branch_ids));
  }, [editing, department.branch_ids]);

  const handleDelete = async () => {
    if (!window.confirm("هل أنت متأكد أنك تريد حذف هذا القسم؟")) return;
    setDeleting(true);
    try {
      await axios.delete(`https://www.ss.mastersclinics.com/departments/${department.id}`, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });
      onDeleteSuccess();
      setSuccess("تم حذف القسم بنجاح");
    } catch (error) {
      console.error("خطأ في حذف القسم:", error);
      setError("فشل في حذف القسم");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("branch_ids", JSON.stringify(selectedBranchIds));

      await axios.put(`https://www.ss.mastersclinics.com/departments/${department.id}`, formData, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
      });

      onUpdateSuccess();
      setEditing(false);
      setSuccess("تم تحديث القسم بنجاح");
      setPreviewImage(null);
    } catch (error) {
      console.error("خطأ في تحديث القسم:", error);
      setError("فشل في تحديث القسم");
    } finally {
      setUpdating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setError('يرجى اختيار ملف صورة (JPEG، PNG، إلخ)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('يجب ألا يزيد حجم الصورة عن 5 ميجابايت');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const getBranchName = (id: number) => {
    return branches.find(b => b.id === id)?.name || id.toString();
  };

  const currentBranchIds = parseBranchIds(department.branch_ids);

  return (
    <>
      <Card className="shadow-md rounded-xl hover:shadow-lg transition-shadow duration-300">
        {department.image ? (
          <Box position="relative">
            {imageLoading && (
              <Box display="flex" justifyContent="center" alignItems="center" height="180px">
                <CircularProgress />
              </Box>
            )}
            <CardMedia
              component="img"
              height="180"
              image={`https://www.ss.mastersclinics.com${department.image}`}
              alt={department.name}
              className="object-cover"
              onLoad={() => setImageLoading(false)}
              style={{ display: imageLoading ? 'none' : 'block' }}
            />
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="180px" bgcolor="action.hover">
            <Avatar sx={{ width: 60, height: 60 }}>
              <Business fontSize="large" />
            </Avatar>
          </Box>
        )}
        <CardHeader
          title={<Typography variant="h6" fontWeight="bold">{department.name}</Typography>}
          subheader={<Box display="flex" alignItems="center" gap={1} mt={0.5}><Business fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">{currentBranchIds.length} فروع</Typography></Box>}
          action={
            <div>
              <Tooltip title="تعديل القسم">
                <IconButton onClick={() => setEditing(true)} color="primary">
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="حذف القسم">
                <IconButton onClick={handleDelete} color="error">
                  {deleting ? <CircularProgress size={24} color="error" /> : <Delete />}
                </IconButton>
              </Tooltip>
            </div>
          }
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary" paragraph>{department.description}</Typography>
          <Divider sx={{ my: 2 }} />
          <div className="flex flex-wrap gap-2">
            {currentBranchIds.length ? (
              currentBranchIds.map(id => (
                <Chip key={id} label={getBranchName(id)} size="small" variant="outlined" color="primary" />
              ))
            ) : (
              <Typography variant="caption" color="text.disabled">لا توجد فروع محددة</Typography>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={editing} onClose={() => { setEditing(false); setPreviewImage(null); }} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">تعديل القسم</Typography>
            <IconButton onClick={() => setEditing(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleUpdate}>
          <DialogContent dividers>
            {updating && <LinearProgress />}
            <Box mb={3}>
              <TextField fullWidth label="اسم القسم" value={name} onChange={(e) => setName(e.target.value)} margin="normal" required variant="outlined" />
              <TextField fullWidth label="الوصف" value={description} onChange={(e) => setDescription(e.target.value)} margin="normal" multiline rows={4} variant="outlined" />
            </Box>

            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>صورة القسم</Typography>
              <Button component="label" variant="outlined" startIcon={<CloudUpload />} fullWidth sx={{ mb: 2 }}>رفع صورة جديدة<VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageChange} /></Button>
              {(previewImage || department.image) && (
                <Box mt={2} textAlign="center" position="relative">
                  <img src={previewImage || `https://www.ss.mastersclinics.com${department.image}`} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                  <IconButton onClick={handleRemoveImage} color="error" sx={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' } }}><Delete fontSize="small" /></IconButton>
                </Box>
              )}
            </Box>

            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>تعيين للفروع</Typography>
              <Box sx={{ maxHeight: 200, overflow: 'auto', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {branches.map((branch) => (
                  <FormControlLabel key={branch.id} control={<Checkbox checked={selectedBranchIds.includes(branch.id)} onChange={() => { setSelectedBranchIds((prev) => prev.includes(branch.id) ? prev.filter((id) => id !== branch.id) : [...prev, branch.id]); }} />} label={branch.name} sx={{ display: 'block', mr: 0 }} />
                ))}
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => { setEditing(false); setPreviewImage(null); }} startIcon={<Cancel />} disabled={updating}>إلغاء</Button>
            <Button type="submit" variant="contained" color="primary" startIcon={<Save />} disabled={updating}>{updating ? <CircularProgress size={24} /> : 'حفظ التغييرات'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </>
  );
};

export default CardStats;
