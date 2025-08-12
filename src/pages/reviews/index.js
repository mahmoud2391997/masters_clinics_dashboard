import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiUpload, FiStar, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { getImageUrl } from '../../hooks/imageUrl';
export default function TestimonialsDashboard() {
    const [testimonials, setTestimonials] = useState([]);
    const [filteredTestimonials, setFilteredTestimonials] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newTestimonial, setNewTestimonial] = useState({
        img: '',
        des: '',
        title: '',
        sub: '',
        rating: 5,
        is_active: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const itemsPerPage = 5;
    // Fetch testimonials from API
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('https://www.ss.mastersclinics.com/testimonials');
                if (!response.ok) {
                    throw new Error('فشل تحميل البيانات');
                }
                const data = await response.json();
                setTestimonials(data);
                setFilteredTestimonials(data);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
                Swal.fire({
                    title: 'خطأ!',
                    text: 'فشل تحميل الآراء',
                    icon: 'error',
                    confirmButtonText: 'حسناً'
                });
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchTestimonials();
    }, []);
    // Handle image file selection
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    // Trigger file input click
    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };
    // Filter testimonials based on search
    useEffect(() => {
        const filtered = testimonials.filter(testimonial => testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testimonial.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
            testimonial.des.toLowerCase().includes(searchTerm.toLowerCase()));
        setFilteredTestimonials(filtered);
        setCurrentPage(1);
    }, [searchTerm, testimonials]);
    const paginatedTestimonials = filteredTestimonials.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
    const toggleActivation = async (id, currentStatus) => {
        try {
            const response = await fetch(`https://www.ss.mastersclinics.com/testimonials/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ is_active: !currentStatus }),
            });
            if (!response.ok) {
                throw new Error('Failed to toggle activation status');
            }
            setTestimonials(testimonials.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
            Swal.fire('تم التحديث!', 'تم تغيير حالة التفعيل بنجاح.', 'success');
        }
        catch (err) {
            Swal.fire({
                title: 'خطأ!',
                text: 'فشل تغيير حالة التفعيل',
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
        }
    };
    const handleDelete = async (id) => {
        Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "لن تتمكن من التراجع عن هذا!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'نعم، احذف!',
            cancelButtonText: 'إلغاء'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`https://www.ss.mastersclinics.com/testimonials/${id}`, {
                        method: 'DELETE'
                    });
                    if (!response.ok) {
                        throw new Error('فشل حذف الرأي');
                    }
                    setTestimonials(testimonials.filter(t => t.id !== id));
                    Swal.fire('تم الحذف!', 'تم حذف الرأي بنجاح.', 'success');
                }
                catch (err) {
                    Swal.fire({
                        title: 'خطأ!',
                        text: 'فشل حذف الرأي',
                        icon: 'error',
                        confirmButtonText: 'حسناً'
                    });
                }
            }
        });
    };
    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setImagePreview(testimonial.img);
        setImageFile(null);
        setIsEditModalOpen(true);
    };
    const handleUpdate = async () => {
        if (!editingTestimonial)
            return;
        try {
            const formData = new FormData();
            formData.append('title', editingTestimonial.title);
            formData.append('sub', editingTestimonial.sub);
            formData.append('des', editingTestimonial.des);
            formData.append('rating', editingTestimonial.rating.toString());
            formData.append('is_active', editingTestimonial.is_active.toString());
            if (imageFile) {
                formData.append('image', imageFile);
            }
            const response = await fetch(`https://www.ss.mastersclinics.com/testimonials/${editingTestimonial.id}`, {
                method: 'PUT',
                body: formData
            });
            if (!response.ok) {
                throw new Error('فشل تحديث الرأي');
            }
            const updatedTestimonial = await response.json();
            setTestimonials(testimonials.map(t => t.id === editingTestimonial.id ? updatedTestimonial : t));
            setIsEditModalOpen(false);
            setImageFile(null);
            setImagePreview(null);
            Swal.fire('تم التحديث!', 'تم تحديث الرأي بنجاح.', 'success');
        }
        catch (err) {
            Swal.fire({
                title: 'خطأ!',
                text: 'فشل تحديث الرأي',
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
        }
    };
    const handleAdd = async () => {
        if (!newTestimonial.title || !newTestimonial.sub || !newTestimonial.des) {
            Swal.fire({
                title: 'تنبيه!',
                text: 'يرجى تعبئة جميع الحقول',
                icon: 'warning',
                confirmButtonText: 'حسناً'
            });
            return;
        }
        if (!imageFile) {
            Swal.fire({
                title: 'تنبيه!',
                text: 'يرجى اختيار صورة',
                icon: 'warning',
                confirmButtonText: 'حسناً'
            });
            return;
        }
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('title', newTestimonial.title);
            formData.append('sub', newTestimonial.sub);
            formData.append('des', newTestimonial.des);
            formData.append('rating', newTestimonial.rating.toString());
            formData.append('is_active', newTestimonial.is_active.toString());
            const response = await fetch('https://www.ss.mastersclinics.com/testimonials', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('فشل إضافة رأي جديد');
            }
            const addedTestimonial = await response.json();
            setTestimonials([addedTestimonial, ...testimonials]);
            setIsAddModalOpen(false);
            setNewTestimonial({ img: '', des: '', title: '', sub: '', rating: 5, is_active: true });
            setImageFile(null);
            setImagePreview(null);
            Swal.fire('تمت الإضافة!', 'تم إضافة الرأي الجديد بنجاح.', 'success');
        }
        catch (err) {
            Swal.fire({
                title: 'خطأ!',
                text: 'فشل إضافة رأي جديد',
                icon: 'error',
                confirmButtonText: 'حسناً'
            });
        }
    };
    // Render star rating
    const renderStars = (rating) => {
        return (_jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx(FiStar, { className: `h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}` }, star))) }));
    };
    // Star rating input component
    const StarRatingInput = ({ value, onChange }) => {
        return (_jsx("div", { className: "flex", children: [1, 2, 3, 4, 5].map((star) => (_jsx("button", { type: "button", onClick: () => onChange(star), className: "focus:outline-none", children: _jsx(FiStar, { className: `h-6 w-6 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}` }) }, star))) }));
    };
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", dir: "rtl", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-600", children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." })] }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", dir: "rtl", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-500 text-2xl mb-4", children: "\u062D\u062F\u062B \u062E\u0637\u0623" }), _jsx("p", { className: "text-gray-600", children: error }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700", children: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", dir: "rtl", children: [_jsx("header", { className: "bg-white shadow", children: _jsxs("div", { className: "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 \u0627\u0644\u0622\u0631\u0627\u0621" }), _jsxs("button", { onClick: () => setIsAddModalOpen(true), className: "inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: [_jsx(FiPlus, { className: "ml-2" }), "\u0625\u0636\u0627\u0641\u0629 \u0631\u0623\u064A \u062C\u062F\u064A\u062F"] })] }) }), _jsxs("main", { className: "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "px-4 py-5 sm:p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 bg-indigo-500 rounded-md p-3", children: _jsx("svg", { className: "h-6 w-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" }) }) }), _jsxs("div", { className: "mr-5 w-0 flex-1", children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0622\u0631\u0627\u0621" }), _jsx("dd", { className: "flex items-baseline", children: _jsx("div", { className: "text-2xl font-semibold text-gray-900", children: testimonials.length }) })] })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "px-4 py-5 sm:p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 bg-green-500 rounded-md p-3", children: _jsx("svg", { className: "h-6 w-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsxs("div", { className: "mr-5 w-0 flex-1", children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0646\u0634\u0637\u0629" }), _jsx("dd", { className: "flex items-baseline", children: _jsx("div", { className: "text-2xl font-semibold text-gray-900", children: testimonials.filter(t => t.is_active).length }) })] })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "px-4 py-5 sm:p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 bg-blue-500 rounded-md p-3", children: _jsx("svg", { className: "h-6 w-6 text-white", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) }), _jsxs("div", { className: "mr-5 w-0 flex-1", children: [_jsx("dt", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0647\u0630\u0627 \u0627\u0644\u0634\u0647\u0631" }), _jsx("dd", { className: "flex items-baseline", children: _jsx("div", { className: "text-2xl font-semibold text-gray-900", children: Math.floor(testimonials.length / 2) }) })] })] }) }) })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsxs("div", { className: "px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0622\u0631\u0627\u0621" }), _jsxs("div", { className: "relative w-64", children: [_jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none", children: _jsx(FiSearch, { className: "text-gray-400" }) }), _jsx("input", { type: "text", className: "block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", placeholder: "\u0627\u0628\u062D\u062B \u0639\u0646 \u0622\u0631\u0627\u0621...", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value) })] })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u0635\u0648\u0631\u0629" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u0648\u0638\u064A\u0641\u0629" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u0631\u0623\u064A" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: paginatedTestimonials.length > 0 ? (paginatedTestimonials.map((testimonial) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "flex-shrink-0 h-10 w-10", children: _jsx("img", { className: "h-10 w-10 rounded-full object-cover", src: getImageUrl(testimonial.img), alt: testimonial.title }) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: testimonial.title }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: testimonial.sub }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: renderStars(testimonial.rating) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-gray-500 line-clamp-2", children: testimonial.des }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: testimonial.is_active ? 'نشط' : 'غير نشط' }) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-left text-sm font-medium", children: [_jsx("button", { onClick: () => toggleActivation(testimonial.id, testimonial.is_active), className: `p-1 rounded-full focus:outline-none ${testimonial.is_active ? 'text-green-500' : 'text-gray-400'}`, children: testimonial.is_active ? (_jsx(FiToggleRight, { className: "h-6 w-6" })) : (_jsx(FiToggleLeft, { className: "h-6 w-6" })) }), _jsx("button", { onClick: () => handleEdit(testimonial), className: "text-indigo-600 hover:text-indigo-900 ml-3", children: _jsx(FiEdit2, {}) }), _jsx("button", { onClick: () => handleDelete(testimonial.id), className: "text-red-600 hover:text-red-900", children: _jsx(FiTrash2, {}) })] })] }, testimonial.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-6 py-4 text-center text-sm text-gray-500", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0622\u0631\u0627\u0621 \u0645\u062A\u0627\u062D\u0629" }) })) })] }) }), totalPages > 1 && (_jsxs("div", { className: "px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6", children: [_jsxs("div", { className: "flex-1 flex justify-between sm:hidden", children: [_jsx("button", { onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50", children: "\u0627\u0644\u0633\u0627\u0628\u0642" }), _jsx("button", { onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50", children: "\u0627\u0644\u062A\u0627\u0644\u064A" })] }), _jsxs("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between", children: [_jsx("div", { children: _jsxs("p", { className: "text-sm text-gray-700", children: ["\u0639\u0631\u0636 ", _jsx("span", { className: "font-medium", children: (currentPage - 1) * itemsPerPage + 1 }), " \u0625\u0644\u0649", ' ', _jsx("span", { className: "font-medium", children: Math.min(currentPage * itemsPerPage, filteredTestimonials.length) }), ' ', "\u0645\u0646 ", _jsx("span", { className: "font-medium", children: filteredTestimonials.length }), " \u0646\u062A\u064A\u062C\u0629"] }) }), _jsx("div", { children: _jsxs("nav", { className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px", "aria-label": "Pagination", children: [_jsxs("button", { onClick: () => setCurrentPage(Math.max(1, currentPage - 1)), disabled: currentPage === 1, className: "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50", children: [_jsx("span", { className: "sr-only", children: "\u0627\u0644\u0633\u0627\u0628\u0642" }), _jsx("svg", { className: "h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z", clipRule: "evenodd" }) })] }), Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (_jsx("button", { onClick: () => setCurrentPage(page), className: `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`, children: page }, page))), _jsxs("button", { onClick: () => setCurrentPage(Math.min(totalPages, currentPage + 1)), disabled: currentPage === totalPages, className: "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50", children: [_jsx("span", { className: "sr-only", children: "\u0627\u0644\u062A\u0627\u0644\u064A" }), _jsx("svg", { className: "h-5 w-5", xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { fillRule: "evenodd", d: "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z", clipRule: "evenodd" }) })] })] }) })] })] }))] })] }), isEditModalOpen && editingTestimonial && (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-75 transition-opacity", onClick: () => setIsEditModalOpen(false) }), _jsx("div", { className: "flex items-center justify-center min-h-screen p-4", children: _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg", onClick: (e) => e.stopPropagation(), dir: "rtl", children: [_jsxs("div", { className: "px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900 mb-4", children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0631\u0623\u064A" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "edit-title", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("input", { type: "text", id: "edit-title", className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", value: editingTestimonial.title, onChange: (e) => setEditingTestimonial({ ...editingTestimonial, title: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "edit-sub", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0648\u0638\u064A\u0641\u0629" }), _jsx("input", { type: "text", id: "edit-sub", className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", value: editingTestimonial.sub, onChange: (e) => setEditingTestimonial({ ...editingTestimonial, sub: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645" }), _jsx(StarRatingInput, { value: editingTestimonial.rating, onChange: (rating) => setEditingTestimonial({ ...editingTestimonial, rating }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "edit-des", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0631\u0623\u064A" }), _jsx("textarea", { id: "edit-des", rows: 3, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", value: editingTestimonial.des, onChange: (e) => setEditingTestimonial({ ...editingTestimonial, des: e.target.value }) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("label", { htmlFor: "edit-active", className: "block text-sm font-medium text-gray-700 mr-3", children: "\u0627\u0644\u062D\u0627\u0644\u0629:" }), _jsxs("div", { className: "relative inline-block w-10 mr-2 align-middle select-none", children: [_jsx("input", { type: "checkbox", id: "edit-active", checked: editingTestimonial.is_active, onChange: (e) => setEditingTestimonial({
                                                                        ...editingTestimonial,
                                                                        is_active: e.target.checked
                                                                    }), className: "toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" }), _jsx("label", { htmlFor: "edit-active", className: `toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${editingTestimonial.is_active ? 'bg-indigo-600' : 'bg-gray-300'}` })] }), _jsx("span", { className: "text-sm text-gray-700", children: editingTestimonial.is_active ? 'نشط' : 'غير نشط' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0634\u0647\u0627\u062F\u0629" }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleImageChange, className: "hidden", accept: "image/*" }), _jsxs("button", { type: "button", onClick: triggerFileInput, className: "mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: [_jsx(FiUpload, { className: "ml-1" }), "\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629"] }), (imagePreview || editingTestimonial.img) && (_jsx("div", { className: "mt-2", children: _jsx("img", { src: imagePreview || editingTestimonial.img, alt: "Preview", className: "h-20 w-20 rounded-full object-cover" }) }))] })] })] }), _jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "button", className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm", onClick: handleUpdate, children: "\u062A\u062D\u062F\u064A\u062B" }), _jsx("button", { type: "button", className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm", onClick: () => {
                                                setIsEditModalOpen(false);
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) })] })), isAddModalOpen && (_jsxs("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-75 transition-opacity", onClick: () => setIsAddModalOpen(false) }), _jsx("div", { className: "flex items-center justify-center min-h-screen p-4", children: _jsxs("div", { className: "relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg", onClick: (e) => e.stopPropagation(), dir: "rtl", children: [_jsxs("div", { className: "px-4 pt-5 pb-4 sm:p-6 sm:pb-4", children: [_jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900 mb-4", children: "\u0625\u0636\u0627\u0641\u0629 \u0631\u0623\u064A \u062C\u062F\u064A\u062F" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "add-title", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("input", { type: "text", id: "add-title", className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", value: newTestimonial.title, onChange: (e) => setNewTestimonial({ ...newTestimonial, title: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "add-sub", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0648\u0638\u064A\u0641\u0629" }), _jsx("input", { type: "text", id: "add-sub", className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", value: newTestimonial.sub, onChange: (e) => setNewTestimonial({ ...newTestimonial, sub: e.target.value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u062A\u0642\u064A\u064A\u0645" }), _jsx(StarRatingInput, { value: newTestimonial.rating, onChange: (rating) => setNewTestimonial({ ...newTestimonial, rating }) })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "add-des", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0631\u0623\u064A" }), _jsx("textarea", { id: "add-des", rows: 3, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm", value: newTestimonial.des, onChange: (e) => setNewTestimonial({ ...newTestimonial, des: e.target.value }) })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("label", { htmlFor: "add-active", className: "block text-sm font-medium text-gray-700 mr-3", children: "\u0627\u0644\u062D\u0627\u0644\u0629:" }), _jsxs("div", { className: "relative inline-block w-10 mr-2 align-middle select-none", children: [_jsx("input", { type: "checkbox", id: "add-active", checked: newTestimonial.is_active, onChange: (e) => setNewTestimonial({
                                                                        ...newTestimonial,
                                                                        is_active: e.target.checked
                                                                    }), className: "toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" }), _jsx("label", { htmlFor: "add-active", className: `toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${newTestimonial.is_active ? 'bg-indigo-600' : 'bg-gray-300'}` })] }), _jsx("span", { className: "text-sm text-gray-700", children: newTestimonial.is_active ? 'نشط' : 'غير نشط' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0634\u0647\u0627\u062F\u0629" }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleImageChange, className: "hidden", accept: "image/*" }), _jsxs("button", { type: "button", onClick: triggerFileInput, className: "mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500", children: [_jsx(FiUpload, { className: "ml-1" }), "\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629"] }), imagePreview && (_jsx("div", { className: "mt-2", children: _jsx("img", { src: imagePreview, alt: "Preview", className: "h-20 w-20 rounded-full object-cover" }) }))] })] })] }), _jsxs("div", { className: "bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse", children: [_jsx("button", { type: "button", className: "w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm", onClick: handleAdd, children: "\u0625\u0636\u0627\u0641\u0629" }), _jsx("button", { type: "button", className: "mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm", onClick: () => {
                                                setIsAddModalOpen(false);
                                                setImageFile(null);
                                                setImagePreview(null);
                                            }, children: "\u0625\u0644\u063A\u0627\u0621" })] })] }) })] }))] }));
}
