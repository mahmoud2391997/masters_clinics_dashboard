import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
export const updateDepartment = async (_id, department) => {
    const response = await axios.put(`https://www.ss.mastersclinics.com/departments/${_id}`, department, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        }
    });
    return response.data;
};
export const deleteDepartment = async (_id) => {
    const response = await axios.delete(`https://www.ss.mastersclinics.com/departments/${_id}`, {
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
    return response.data;
};
export default function CardStats({ department, onUpdateSuccess, onDeleteSuccess }) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [editName, setEditName] = useState(department.name);
    const [editDesc, setEditDesc] = useState(department.description);
    const [editImage, setEditImage] = useState(department.imageUrl || department.image);
    const [imageFile, setImageFile] = useState(null);
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
        }
        catch (error) {
            console.error('Error deleting department:', error);
        }
        finally {
            setIsDeleting(false);
        }
    };
    const handleImageFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setEditImage(URL.createObjectURL(file));
            setImageUrlInput("");
        }
    };
    const handleImageUrlChange = (e) => {
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
            }
            else if (imageUrlInput) {
                formData.append('imageUrl', imageUrlInput);
            }
            else if (department.image) {
                formData.append('image', department.image);
            }
            await updateDepartment(department._id, formData);
            setShowModal(false);
            onUpdateSuccess?.();
        }
        catch (error) {
            console.error('Error updating department:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-w-[250px]", children: [_jsx("div", { className: "relative flex flex-col min-w-0 break-words bg-gray-100 rounded mb-6 xl:mb-0 shadow-lg text-[var(--main-gray)]", children: _jsxs("div", { className: "flex-auto p-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("img", { src: department.imageUrl || department.image || "https://via.placeholder.com/64x64.png?text=Dept", alt: `${department.name || "Department"} image`, className: "w-16 h-16 object-cover rounded-full border-2 border-white shadow-md" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { className: "text-blue-500 hover:text-blue-700", onClick: handleEditClick, title: "Edit", type: "button", children: _jsx(FontAwesomeIcon, { icon: faEdit }) }), _jsx("button", { className: "text-red-500 hover:text-red-700", onClick: handleDeleteClick, title: "Delete", type: "button", children: _jsx(FontAwesomeIcon, { icon: faTrash }) })] })] }), _jsx("div", { className: "relative w-full flex flex-col justify-between", children: _jsxs("div", { className: "w-full relative", children: [_jsx("h4", { className: "text-xl font-semibold mb-1", children: department.name || '-' }), _jsx("p", { className: "text-blueGray-400 text-sm", children: department.description || '-' })] }) })] }) }), showModal && (_jsx("div", { className: "fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in relative", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "Edit Department" }), _jsx("button", { onClick: () => setShowModal(false), className: "text-gray-500 hover:text-gray-700 transition", "aria-label": "Close", children: _jsx("span", { className: "text-xl", children: "\u00D7" }) })] }), _jsxs("form", { onSubmit: async (e) => {
                                e.preventDefault();
                                await handleSave();
                            }, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "Department Name" }), _jsx("input", { type: "text", value: editName, onChange: e => setEditName(e.target.value), placeholder: "e.g. Cardiology", className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { value: editDesc, onChange: e => setEditDesc(e.target.value), placeholder: "Enter department description", rows: 3, className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700 mb-1", children: "Department Image" }), _jsx("input", { type: "text", value: imageUrlInput, onChange: handleImageUrlChange, placeholder: "Or paste image URL here", className: "w-full border border-gray-300 px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageFileChange, className: "w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })] }), editImage && (_jsxs("div", { className: "mt-2", children: [_jsx("p", { className: "text-gray-600 text-sm mb-1", children: "Image Preview:" }), _jsx("img", { src: editImage, alt: "Department preview", className: "w-full max-h-24 max-w-24 object-contain border rounded shadow-sm" })] })), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setShowModal(false), className: "px-4 py-2 text-gray-600 hover:text-gray-800", disabled: isLoading, children: "Cancel" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50", disabled: isLoading, children: isLoading ? 'Saving...' : 'Save' })] })] })] }) })), showDeleteConfirm && (_jsx("div", { className: "fixed h-screen inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm", children: _jsxs("div", { className: "bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-fade-in relative", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-800", children: "Confirm Delete" }), _jsx("button", { onClick: () => setShowDeleteConfirm(false), className: "text-gray-500 hover:text-gray-700 transition", "aria-label": "Close", children: _jsx("span", { className: "text-xl", children: "\u00D7" }) })] }), _jsx("p", { className: "mb-4", children: "Are you sure you want to delete this department?" }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => setShowDeleteConfirm(false), className: "px-4 py-2 text-gray-600 hover:text-gray-800", disabled: isDeleting, children: "Cancel" }), _jsx("button", { onClick: handleConfirmDelete, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50", disabled: isDeleting, children: isDeleting ? 'Deleting...' : 'Delete' })] })] }) }))] }));
}
