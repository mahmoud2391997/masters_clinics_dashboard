import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from "@mui/material";
import axios from "axios";
import CardStats from "./card";
import DeleteIcon from '@mui/icons-material/Delete';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Cancel, Close } from "@mui/icons-material";
import { Save } from "lucide-react";
import { Typography } from "@mui/material";

interface Branch {
  id: number;
  name: string;
}

interface DepartmentStat {
  id: number;
  name: string;
  description: string;
  image?: string;
  branch_ids?: number[];
}

const DepartmentsStatsGrid: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentStat[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptImageFile, setNewDeptImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedBranchIds, setSelectedBranchIds] = useState<number[]>([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchBranches();
  }, []);

const fetchDepartments = async () => {
  setLoading(true);
  try {
    const res = await axios.get("http://localhost:3000/departments", {
      headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
    });

  const parsedDepartments = res.data.map((dept: any) => ({
  ...dept,
  branch_ids: typeof dept.branch_ids === "string" && dept.branch_ids !== ""
    ? JSON.parse(dept.branch_ids)
    : Array.isArray(dept.branch_ids)
    ? dept.branch_ids
    : [],
}));
setDepartments(parsedDepartments);

  } catch (error) {
    console.error("خطأ في جلب الأقسام:", error);
  } finally {
    setLoading(false);
  }
};


  const fetchBranches = async () => {
    try {
      const res = await axios.get("http://localhost:3000/branches", {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });
      setBranches(res.data);
    } catch (error) {
      console.error("خطأ في جلب الفروع:", error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // تحقق من نوع الصورة
      if (!file.type.match('image.*')) {
        alert('يرجى اختيار ملف صورة (JPEG, PNG, إلخ)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('يجب أن يكون حجم الصورة أقل من 5 ميجابايت');
        return;
      }

      setNewDeptImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setNewDeptImageFile(null);
    setImagePreview(null);
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setAdding(true);

    try {
      const formData = new FormData();
      formData.append("name", newDeptName);
      formData.append("description", newDeptDesc);
      if (newDeptImageFile) {
        formData.append("image", newDeptImageFile);
      }
      formData.append("branch_ids", JSON.stringify(selectedBranchIds));

      const res = await axios.post("http://localhost:3000/departments", formData, {
        headers: { "Authorization": `Bearer ${sessionStorage.getItem("token")}` }
      });

      setDepartments((prev) => [...prev, res.data]);
      resetModalFields();
      setShowAddModal(false);
    } catch (error) {
      console.error("خطأ في إضافة القسم:", error);
    } finally {
      setAdding(false);
    }
  };

  const resetModalFields = () => {
    setNewDeptName('');
    setNewDeptDesc('');
    setNewDeptImageFile(null);
    setImagePreview(null);
    setSelectedBranchIds([]);
  };

  const filteredDepartments = departments.filter((department) =>
    department.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  );

  return (
    <>
      <div className="p-5 flex gap-4 items-center">
        <TextField
          label="بحث عن قسم"
          variant="outlined"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => setShowAddModal(true)}
          startIcon={<AddPhotoAlternateIcon />}
        >
          إضافة قسم
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5">
        {filteredDepartments.map((department) => (
          <CardStats
            key={department.id}
            department={department}
            branches={branches}
            onUpdateSuccess={fetchDepartments}
            onDeleteSuccess={fetchDepartments}
          />
        ))}
      </div>

      {/* نافذة إضافة قسم */}
      <Dialog
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetModalFields();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">إضافة قسم جديد</Typography>
            <IconButton onClick={() => {
              setShowAddModal(false);
              resetModalFields();
            }}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <form onSubmit={handleAddDepartment}>
          <DialogContent dividers>
            {adding && <LinearProgress />}
            
            <Box mb={3}>
              <TextField
                fullWidth
                label="اسم القسم"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
                margin="normal"
                required
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="الوصف"
                value={newDeptDesc}
                onChange={(e) => setNewDeptDesc(e.target.value)}
                margin="normal"
                multiline
                rows={4}
                variant="outlined"
              />
            </Box>
            
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                صورة القسم
              </Typography>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                رفع صورة
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              
              {imagePreview && (
                <Box 
                  mt={2} 
                  textAlign="center"
                  position="relative"
                >
                  <img
                    src={imagePreview}
                    alt="معاينة"
                    style={{ 
                      maxHeight: '200px', 
                      maxWidth: '100%', 
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    color="error"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)'
                      }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                ربط بالفروع
              </Typography>
              
              <Box
                sx={{
                  maxHeight: 200,
                  overflow: 'auto',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                {branches.map((branch) => (
                  <FormControlLabel
                    key={branch.id}
                    control={
                      <Checkbox
                        checked={selectedBranchIds.includes(branch.id)}
                        onChange={() => {
                          setSelectedBranchIds(prev =>
                            prev.includes(branch.id)
                              ? prev.filter(id => id !== branch.id)
                              : [...prev, branch.id]
                          );
                        }}
                      />
                    }
                    label={branch.name}
                    sx={{ display: 'block', mr: 0 }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions>
            <Button 
              onClick={() => {
                setShowAddModal(false);
                resetModalFields();
              }}
              startIcon={<Cancel />}
              disabled={adding}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              startIcon={<Save />}
              disabled={adding}
            >
              {adding ? <CircularProgress size={24} /> : 'إضافة القسم'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default DepartmentsStatsGrid;