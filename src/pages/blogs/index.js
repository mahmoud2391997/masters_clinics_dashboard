"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getImageUrl } from "../../hooks/imageUrl";
const BlogsPage = () => {
    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [form, setForm] = useState({
        slug: "",
        title2: "",
        author: "",
        content: "",
        tags: [],
        categories: [],
        image: "",
    });
    useEffect(() => {
        fetchBlogs();
    }, []);
    const fetchBlogs = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await axios.get("https://www.ss.mastersclinics.com/blogs");
            setBlogs(res.data);
        }
        catch (error) {
            console.error("فشل تحميل المدونات:", error);
            setError("فشل تحميل المدونات. حاول مرة أخرى لاحقًا.");
            toast.error("فشل تحميل المدونات");
        }
        finally {
            setIsLoading(false);
        }
    };
    const validateForm = () => {
        const errors = {};
        if (!form.slug.trim())
            errors.slug = "الاسم المختصر مطلوب";
        if (!form.title2.trim())
            errors.title2 = "العنوان مطلوب";
        if (!form.author.trim())
            errors.author = "اسم الكاتب مطلوب";
        if (!form.content?.trim())
            errors.content = "المحتوى مطلوب";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleAddBlog = async (e) => {
        e.preventDefault();
        if (!validateForm())
            return;
        try {
            const formData = new FormData();
            formData.append("slug", form.slug);
            formData.append("title2", form.title2);
            formData.append("author", form.author);
            formData.append("content", form.content || "");
            formData.append("tags", JSON.stringify(form.tags));
            formData.append("categories", JSON.stringify(form.categories));
            if (form.imageFile) {
                formData.append("image", form.imageFile);
            }
            const res = await axios.post("https://www.ss.mastersclinics.com/blogs", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setBlogs([res.data, ...blogs]);
            setForm({
                slug: "",
                title2: "",
                author: "",
                content: "",
                tags: [],
                categories: [],
                image: "",
                imageFile: undefined,
            });
            toast.success("تمت إضافة المدونة بنجاح!");
        }
        catch (error) {
            console.error("فشل في إضافة المدونة:", error);
            toast.error("فشل في إضافة المدونة");
        }
    };
    const filteredBlogs = blogs.filter((blog) => blog.title2?.toLowerCase().includes(search.toLowerCase()));
    if (isLoading) {
        return (_jsx("div", { className: "flex justify-center items-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" }) }));
    }
    if (error) {
        return (_jsx("div", { className: "p-8 text-center", children: _jsxs("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", children: [error, _jsx("button", { onClick: fetchBlogs, className: "ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600", children: "\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629" })] }) }));
    }
    return (_jsx("div", { className: "p-4 md:p-8 bg-gray-50 min-h-screen", children: _jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 mb-8 text-center", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062F\u0648\u0646\u0627\u062A" }), _jsx("div", { className: "mb-8", children: _jsxs("div", { className: "relative max-w-md mx-auto", children: [_jsx("input", { type: "text", placeholder: "\u0628\u062D\u062B \u0628\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u062F\u0648\u0646\u0629...", value: search, onChange: (e) => setSearch(e.target.value), className: "w-full p-3 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent" }), _jsx("svg", { className: "absolute left-3 top-3.5 h-5 w-5 text-gray-400", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" }) })] }) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white rounded-xl shadow-md p-6 sticky top-6", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 mb-4", children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u062F\u0648\u0646\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsxs("form", { onSubmit: handleAddBlog, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0645\u062E\u062A\u0635\u0631 *" }), _jsx("input", { type: "text", value: form.slug, onChange: (e) => setForm({ ...form, slug: e.target.value }), className: `w-full p-2 border rounded-lg ${formErrors.slug ? "border-red-500" : "border-gray-300"}` }), formErrors.slug && _jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.slug })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 *" }), _jsx("input", { type: "text", value: form.title2, onChange: (e) => setForm({ ...form, title2: e.target.value }), className: `w-full p-2 border rounded-lg ${formErrors.title2 ? "border-red-500" : "border-gray-300"}` }), formErrors.title2 && _jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.title2 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u062A\u0628 *" }), _jsx("input", { type: "text", value: form.author, onChange: (e) => setForm({ ...form, author: e.target.value }), className: `w-full p-2 border rounded-lg ${formErrors.author ? "border-red-500" : "border-gray-300"}` }), formErrors.author && _jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.author })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0645\u062D\u062A\u0648\u0649 *" }), _jsx("textarea", { value: form.content, onChange: (e) => setForm({ ...form, content: e.target.value }), rows: 4, className: `w-full p-2 border rounded-lg ${formErrors.content ? "border-red-500" : "border-gray-300"}` }), formErrors.content && _jsx("p", { className: "text-red-500 text-xs mt-1", children: formErrors.content })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0648\u0633\u0648\u0645" }), _jsx("input", { type: "text", value: form.tags?.join(", "), onChange: (e) => setForm({ ...form, tags: e.target.value.split(",").map(tag => tag.trim()) }), className: "w-full p-2 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641\u0627\u062A" }), _jsx("input", { type: "text", value: form.categories?.join(", "), onChange: (e) => setForm({ ...form, categories: e.target.value.split(",").map(cat => cat.trim()) }), className: "w-full p-2 border border-gray-300 rounded-lg" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0645\u0644\u0641 \u0627\u0644\u0635\u0648\u0631\u0629" }), _jsx("input", { type: "file", onChange: (e) => setForm({ ...form, imageFile: e.target.files?.[0] }), className: "w-full p-2 border border-gray-300 rounded-lg" })] }), _jsx("button", { type: "submit", className: "w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200", children: "\u0625\u0636\u0627\u0641\u0629" })] })] }) }), _jsx("div", { className: "lg:col-span-2", children: filteredBlogs.length === 0 ? (_jsx("div", { className: "bg-white rounded-xl shadow-md p-8 text-center", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0645\u062F\u0648\u0646\u0627\u062A" })) : (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: filteredBlogs.map((blog) => (_jsxs("div", { className: "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200", children: [_jsx("div", { className: "h-48 overflow-hidden", children: _jsx("img", { src: getImageUrl(blog.image || "") || "/placeholder.png", alt: blog.title2, className: "w-full h-full object-cover" }) }), _jsxs("div", { className: "p-6", children: [_jsx("div", { className: "flex items-center space-x-2 mb-2", children: blog.tags?.map((tag, index) => (_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded", children: tag }, index))) }), _jsx("h3", { className: "text-xl font-bold text-gray-800 mb-2", children: blog.title2 }), _jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["\u0628\u0648\u0627\u0633\u0637\u0629 ", blog.author] }), _jsx("p", { className: "text-gray-700 mb-4 line-clamp-2", children: blog.content }), _jsxs(Link, { to: `/blogs/${blog.id}`, className: "inline-flex items-center text-green-600 hover:text-green-700 font-medium", children: ["\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064A\u062F", _jsx("svg", { className: "ml-1 w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M9 5l7 7-7 7" }) })] })] })] }, blog.slug))) })) })] })] }) }));
};
export default BlogsPage;
