import React, { useEffect, useState } from "react";
import { TextField, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import axios from "axios";
import CardStats from "./card";
import DeleteIcon from '@mui/icons-material/Delete';

interface DepartmentStat {
    _id: string;
    id: number;
    description: string;
    image?: string;
    imageUrl?: string;
    name: string;
    doctorsCount: number;
    patientsCount: number;
    appointmentsCount: number;
}


const DepartmentsStatsGrid: React.FC = () => {
    const [departments, setDepartments] = useState<DepartmentStat[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>("");
    const [showAddModal, setShowAddModal] = useState<boolean>(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
    const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    const [newDeptName, setNewDeptName] = useState('');
    const [newDeptDesc, setNewDeptDesc] = useState('');
    const [newDeptImage, setNewDeptImage] = useState('');
    const [adding, setAdding] = useState(false);
const [newDeptImageFile, setNewDeptImageFile] = useState<File | null>(null);

    const handleAddDepartment = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newDeptName.trim()) return;
        setAdding(true);
        
        try {
            const formData = new FormData();
            formData.append('name', newDeptName);
            formData.append('description', newDeptDesc);
            
            if (newDeptImageFile) {
                formData.append('image', newDeptImageFile);
            } else if (newDeptImage) {
                formData.append('image', newDeptImage);
            }

            const res = await axios.post<DepartmentStat>("https://www.ss.mastersclinics.com/departments", formData, {
                headers: {
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
                }
            });

            setDepartments((prev) => [...prev, res.data]);
            setNewDeptName("");
            setNewDeptDesc("");
            setNewDeptImage("");
            setNewDeptImageFile(null);
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding department:", error);
        } finally {
            setAdding(false);
        }
    };
    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await axios.get<DepartmentStat[]>("https://www.ss.mastersclinics.com/departments", {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
                }
            });
            setDepartments(res.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        } finally {
            setLoading(false);
        }
    };


  

    const handleConfirmDelete = async () => {
        if (!departmentToDelete) return;
        
        setDeleting(true);
        try {
            setDepartments(prev => prev.filter(dept => dept._id !== departmentToDelete));
            setDeleteConfirmOpen(false);
        } catch (error) {
            console.error("Error deleting department:", error);
        } finally {
            setDeleting(false);
            setDepartmentToDelete(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmOpen(false);
        setDepartmentToDelete(null);
    };

    if (loading) {
        return null;
    }

    const filteredDepartments = departments.filter((department) =>
        department.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <div className="p-5 flex gap-4 items-center">
                <TextField
                    label="بحث عن الأقسام"
                    variant="outlined"
                    fullWidth
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={() => setShowAddModal(true)}>
                    إضافة قسم
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-5">
           {filteredDepartments.map((department) => (
    <CardStats
        key={department._id}
        department={department}
        onDeleteSuccess={() => {
            // This will refresh the list after deletion
            fetchDepartments();
        }}
        onUpdateSuccess={() => {
            // This will refresh the list after update
            fetchDepartments();
        }}
    />
))}
            </div>

            {/* Add Department Modal */}
            {showAddModal && (
                <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">إضافة قسم جديد</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewDeptName('');
                                    setNewDeptDesc('');
                                    setNewDeptImage('');
                                }}
                                className="text-gray-500 hover:text-gray-700 transition"
                                aria-label="إغلاق"
                            >
                                <span className="text-xl">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddDepartment} className="space-y-4">
                            {/* Department Name */}
                            <div>
                                <label className="block text-gray-700 mb-1">اسم القسم</label>
                                <input
                                    type="text"
                                    value={newDeptName}
                                    onChange={(e) => setNewDeptName(e.target.value)}
                                    placeholder="مثال: القلب"
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-gray-700 mb-1">الوصف</label>
                                <textarea
                                    value={newDeptDesc}
                                    onChange={(e) => setNewDeptDesc(e.target.value)}
                                    placeholder="أدخل وصفًا للقسم"
                                    rows={3}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1">صورة القسم</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setNewDeptImageFile(file);
                                            setNewDeptImage(URL.createObjectURL(file));
                                        }
                                    }}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-sm text-gray-500 mt-1">أو</p>
                                <input
                                    type="text"
                                    value={newDeptImage}
                                    onChange={(e) => {
                                        setNewDeptImage(e.target.value);
                                        setNewDeptImageFile(null);
                                    }}
                                    placeholder="أدخل رابط الصورة"
                                    className="w-full border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Image Preview */}
                            {newDeptImage && (
                                <div className="mt-2">
                                    <p className="text-gray-600 text-sm mb-1">معاينة الصورة:</p>
                                    <img
                                        src={newDeptImage}
                                        alt="معاينة صورة القسم"
                                        className="w-full max-h-24 max-w-24 object-contain border rounded shadow-sm"
                                    />
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setNewDeptName('');
                                        setNewDeptDesc('');
                                        setNewDeptImage('');
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={adding}
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
                                    disabled={adding}
                                >
                                    {adding ? 'جاري الإضافة...' : 'إضافة'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onClose={handleCancelDelete}>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogContent>
                    <Typography>هل أنت متأكد أنك تريد حذف هذا القسم؟</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete} color="primary" disabled={deleting}>
                        إلغاء
                    </Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        disabled={deleting}
                    >
                        {deleting ? 'جاري الحذف...' : 'حذف'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DepartmentsStatsGrid;