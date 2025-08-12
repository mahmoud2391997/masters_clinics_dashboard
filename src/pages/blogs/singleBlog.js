import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BlogSinglePage.css';
import { getImageUrl } from '../../hooks/imageUrl';
import { toast } from 'react-toastify';
const BlogSinglePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedBlog, setEditedBlog] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`https://www.ss.mastersclinics.com/blogs/${id}`);
                if (!response.data) {
                    throw new Error('لم يتم العثور على المقال');
                }
                setBlog(response.data);
                setEditedBlog(response.data);
                setImagePreview(getImageUrl(response.data.image));
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'فشل في جلب المقال');
                console.error('Error fetching blog:', err);
            }
            finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchBlog();
        }
        else {
            setError('معرّف المقال غير صالح');
            setLoading(false);
            navigate('/blogs');
        }
    }, [id, navigate]);
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedBlog(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setEditedBlog(prev => ({
            ...prev,
            [name]: checked,
        }));
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleToggleActive = async () => {
        if (!blog)
            return;
        try {
            setLoading(true);
            const newStatus = blog.is_active === 1 ? 0 : 1;
            await axios.put(`https://www.ss.mastersclinics.com/blogs/${blog.id}`, {
                is_active: newStatus
            });
            setBlog({ ...blog, is_active: newStatus });
            toast.success(`تم ${newStatus === 1 ? "تفعيل" : "تعطيل"} المقال بنجاح`);
        }
        catch (error) {
            console.error("فشل في تغيير حالة المقال:", error);
            toast.error("فشل في تغيير حالة المقال");
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        try {
            setLoading(true);
            const formData = new FormData();
            // Append all fields from editedBlog
            Object.entries(editedBlog).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formData.append(key, value.toString());
                }
            });
            if (imageFile) {
                formData.append('image', imageFile);
            }
            await axios.put(`https://www.ss.mastersclinics.com/blogs/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // Refresh data
            const response = await axios.get(`https://www.ss.mastersclinics.com/blogs/${id}`);
            setBlog(response.data);
            setEditedBlog(response.data);
            setImagePreview(getImageUrl(response.data.image));
            setIsEditing(false);
            setImageFile(null);
            toast.success('تم تحديث المقال بنجاح');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'فشل في تحديث المقال');
            console.error('Error updating blog:', err);
            toast.error('فشل في تحديث المقال');
        }
        finally {
            setLoading(false);
        }
    };
    const currentImage = imagePreview || getImageUrl(blog?.image ?? '');
    if (loading && !isEditing) {
        return (_jsxs("div", { className: "blog-loading", children: [_jsx("div", { className: "loading-image" }), _jsx("div", { className: "loading-title" }), _jsx("div", { className: "loading-content" })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "blog-error", children: [_jsx("h2", { children: "\u062E\u0637\u0623" }), _jsx("p", { children: error }), _jsx("button", { onClick: () => navigate('/blogs'), children: "\u0627\u0644\u0631\u062C\u0648\u0639 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062A" })] }));
    }
    if (!blog)
        return null;
    return (_jsx("article", { className: `blog-single ${!blog.is_active ? 'inactive-blog' : ''}`, children: isEditing ? (_jsxs("div", { className: "edit-controls", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646:" }), _jsx("input", { type: "text", name: "title2", value: editedBlog.title2 || '', onChange: handleInputChange })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u0627\u0644\u0643\u0627\u062A\u0628:" }), _jsx("input", { type: "text", name: "author", value: editedBlog.author || '', onChange: handleInputChange })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u0627\u0644\u0645\u062D\u062A\u0648\u0649:" }), _jsx("textarea", { name: "content", value: editedBlog.content || '', onChange: handleInputChange, rows: 6 })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0645\u0642\u0627\u0644:" }), _jsx("input", { type: "checkbox", name: "is_active", checked: editedBlog.is_active === 1, onChange: (e) => {
                                handleCheckboxChange({
                                    ...e,
                                    target: {
                                        ...e.target,
                                        name: e.target.name,
                                        checked: e.target.checked,
                                        value: e.target.checked ? '1' : '0' // Convert to string if needed
                                    }
                                });
                            }, className: "active-checkbox" })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "\u0627\u0644\u0635\u0648\u0631\u0629:" }), _jsxs("div", { className: "image-upload-container", children: [_jsx("img", { src: currentImage, alt: "\u0645\u0639\u0627\u064A\u0646\u0629", className: "image-preview", onError: (e) => {
                                        e.target.src = 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg';
                                    } }), _jsxs("div", { className: "upload-actions", children: [_jsx("button", { type: "button", onClick: () => fileInputRef.current?.click(), className: "upload-button", children: "\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629" }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleImageChange, accept: "image/*", style: { display: 'none' } })] })] })] }), _jsxs("div", { className: "button-group", children: [_jsx("button", { onClick: handleSave, className: "save-button", disabled: loading, children: loading ? 'جاري الحفظ...' : 'حفظ التغييرات' }), _jsx("button", { onClick: () => {
                                setIsEditing(false);
                                setImageFile(null);
                                setImagePreview(getImageUrl(blog.image));
                            }, className: "cancel-button", disabled: loading, children: "\u0625\u0644\u063A\u0627\u0621" })] })] })) : (_jsxs(_Fragment, { children: [!blog.is_active && (_jsx("div", { className: "inactive-badge", children: _jsx("span", { children: "\u0645\u0639\u0637\u0644\u0629" }) })), _jsx("img", { src: currentImage, alt: blog.title2, className: "blog-image", onError: (e) => {
                        e.target.src = 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg';
                    } }), _jsx("h1", { className: "blog-title", children: blog.title2 }), _jsxs("div", { className: "blog-meta", children: [_jsxs("span", { className: "blog-author", children: ["\u0628\u0648\u0627\u0633\u0637\u0629 ", blog.author] }), _jsxs("span", { className: "blog-date", children: ["\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0646\u0634\u0631: ", formatDate(blog.create_at)] }), blog.created_at !== blog.updated_at && (_jsxs("span", { className: "blog-updated", children: ["\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B: ", formatDate(blog.updated_at)] })), _jsxs("span", { className: "blog-comments", children: [blog.comment, " \u062A\u0639\u0644\u064A\u0642"] })] }), _jsx("div", { className: "blog-content", children: blog.content?.split('\n').map((paragraph, i) => (_jsx("p", { children: paragraph }, i))) }), _jsxs("div", { className: "button-group", children: [_jsx("button", { onClick: () => setIsEditing(true), className: "edit-button", children: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0642\u0627\u0644" }), _jsx("button", { onClick: handleToggleActive, className: `toggle-active-button ${blog.is_active ? 'deactivate' : 'activate'}`, disabled: loading, children: blog.is_active ? 'تعطيل المقال' : 'تفعيل المقال' }), _jsx("button", { onClick: () => navigate('/blogs'), className: "back-button", children: "\u0627\u0644\u0631\u062C\u0648\u0639 \u0625\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062A" })] })] })) }));
};
export default BlogSinglePage;
