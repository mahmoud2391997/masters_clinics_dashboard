import { useState, type ChangeEvent } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

export const updateDepartment = async (_id: string, department: FormData) => {
    const response = await axios.put(`https://www.ss.mastersclinics.com/departments/${_id}`, department, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        }
    });
    return response.data;
};

export const deleteDepartment = async (_id: string) => {
    const response = await axios.delete(`https://www.ss.mastersclinics.com/departments/${_id}`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
    return response.data;
};

interface Department {
    _id: string;
    name: string;
    description: string;
    image?: string;
    imageUrl?: string;
}

interface CardStatsProps {
    department: Department;
    onDeleteSuccess?: () => void;
    onUpdateSuccess?: () => void;
}

export default function CardStats({ department, onUpdateSuccess, onDeleteSuccess }: CardStatsProps) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editName, setEditName] = useState(department.name);
    const [editDesc, setEditDesc] = useState(department.description);
    const [editImage, setEditImage] = useState(department.imageUrl || department.image);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrlInput, setImageUrlInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditClick = () => {
        setEditName(department.name);
        setEditDesc(department.description);
        setEditImage(department.imageUrl || department.image);
        setImageFile(null);
        setImageUrlInput("");
        setShowModal(true);
    };

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteDepartment(department._id);
            onDeleteSuccess?.();
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Error deleting department:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setEditImage(URL.createObjectURL(file));
            setImageUrlInput("");
        }
    };

    const handleImageUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setImageUrlInput(e.target.value);
        setEditImage(e.target.value);
        setImageFile(null);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            formData.append('description', editDesc);
            
            if (imageFile) {
                formData.append('image', imageFile);
            } else if (imageUrlInput) {
                formData.append('imageUrl', imageUrlInput);
            } else if (department.image) {
                formData.append('image', department.image);
            }

            await updateDepartment(department._id, formData);
            setShowModal(false);
            onUpdateSuccess?.();
        } catch (error) {
            console.error('Error updating department:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-w-[250px]">
            <div className="relative flex flex-col min-w-0 break-words bg-gray-100 rounded mb-6 xl:mb-0 shadow-lg text-[var(--main-gray)]">
                <div className="flex-auto p-4">
                    <div className="flex justify-between items-center mb-4">
                        <img
                            src={department.imageUrl || department.image || "https://via.placeholder.com/64x64.png?text=Dept"}
                            alt={`${department.name || "Department"} image`}
                            className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-md"
                        />
                        <div className="flex gap-2">
                            <button
                                className="text-blue-500 hover:text-blue-700"
                                onClick={handleEditClick}
                                title="Edit"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                                className="text-red-500 hover:text-red-700"
                                onClick={handleDeleteClick}
                                title="Delete"
                                type="button"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        </div>
                    </div>

                    <div className="relative w-full flex flex-col justify-between">
                        <div className="w-full relative">
                            <h4 className="text-xl font-semibold mb-1">{department.name || '-'}</h4>
                            <p className="text-blueGray-400 text-sm">{department.description || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Edit Department</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                                aria-label="Close"
                            >
                                <span className="text-xl">&times;</span>
                            </button>
                        </div>
                        <form
                            onSubmit={async (e) => {
                                e.preventDefault();
                                await handleSave();
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block text-gray-700 mb-1">Department Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    placeholder="e.g. Cardiology"
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={e => setEditDesc(e.target.value)}
                                    placeholder="Enter department description"
                                    rows={3}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1">Department Image</label>
                                <input
                                    type="text"
                                    value={imageUrlInput}
                                    onChange={handleImageUrlChange}
                                    placeholder="Or paste image URL here"
                                    className="w-full border border-gray-300 px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageFileChange}
                                    className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {editImage && (
                                <div className="mt-2">
                                    <p className="text-gray-600 text-sm mb-1">Image Preview:</p>
                                    <img
                                        src={editImage}
                                        alt="Department preview"
                                        className="w-full max-h-24 max-w-24 object-contain border rounded shadow-sm"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    disabled={isLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in relative">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Confirm Delete</h2>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="text-gray-500 hover:text-gray-700 transition"
                                aria-label="Close"
                            >
                                <span className="text-xl">&times;</span>
                            </button>
                        </div>
                        <p className="mb-4">Are you sure you want to delete this department?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}