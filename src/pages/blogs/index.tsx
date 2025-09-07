"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Blog } from "./type";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { getImageUrl } from "../../hooks/imageUrl";

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<Omit<Blog, "id"> & { imageFile?: File }>({
    slug: "",
    title2: "",
    author: "",
    content: "",
    image: "",
    created_at: "",
    is_active: 1,
    priority: 0 // Add priority to form state
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axios.get<Blog[]>("https://www.ss.mastersclinics.com/blogs");
      setBlogs(res.data);
    } catch (error) {
      console.error("فشل تحميل المدونات:", error);
      setError("فشل تحميل المدونات. حاول مرة أخرى لاحقًا.");
      toast.error("فشل تحميل المدونات");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!form.slug.trim()) errors.slug = "الاسم المختصر مطلوب";
    if (!form.title2.trim()) errors.title2 = "العنوان مطلوب";
    if (!form.author.trim()) errors.author = "اسم الكاتب مطلوب";
    if (!form.content?.trim()) errors.content = "المحتوى مطلوب";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const formData = new FormData();
      formData.append("slug", form.slug);
      formData.append("title2", form.title2);
      formData.append("author", form.author);
      formData.append("content", form.content || "");
      formData.append("is_active", form.is_active ? "true" : "false");
      formData.append("priority", form.priority?.toString()); // Add priority

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
        image: "",
        created_at: "",
        is_active: 1,
        priority: 0,
        imageFile: undefined,
      });

      toast.success("تمت إضافة المدونة بنجاح!");
    } catch (error) {
      console.error("فشل في إضافة المدونة:", error);
      toast.error("فشل في إضافة المدونة");
    }
  };

  const handleDeleteBlog = async (id: number) => {
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذه المدونة؟")) {
      try {
        await axios.delete(`https://www.ss.mastersclinics.com/blogs/${id}`);
        setBlogs(blogs.filter(blog => blog.id !== id));
        toast.success("تم حذف المدونة بنجاح");
      } catch (error) {
        console.error("فشل في حذف المدونة:", error);
        toast.error("فشل في حذف المدونة");
      }
    }
  };

  const handleToggleActive = async (id: number, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    
    try {
      // Optimistically update UI first
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog.id === id ? { ...blog, is_active: newStatus } : blog
        )
      );

      // Then make API call
      await axios.put(`https://www.ss.mastersclinics.com/blogs/${id}`, {
        is_active: newStatus
      });

      toast.success(`تم ${newStatus === 1 ? "تفعيل" : "تعطيل"} المدونة بنجاح`);
    } catch (error) {
      console.error("فشل في تغيير حالة المدونة:", error);
      toast.error("فشل في تغيير حالة المدونة");
      
      // Revert state on error
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog.id === id ? { ...blog, is_active: currentStatus } : blog
        )
      );
    }
  };

  const handlePriorityChange = async (id: number, newPriority: number) => {
    try {
      // Optimistically update UI first
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog.id === id ? { ...blog, priority: newPriority } : blog
        )
      );

      // Then make API call
      await axios.put(`https://www.ss.mastersclinics.com/blogs/${id}`, {
        priority: newPriority
      });

      toast.success("تم تحديث الأولوية بنجاح");
    } catch (error) {
      console.error("فشل في تحديث الأولوية:", error);
      toast.error("فشل في تحديث الأولوية");
      
      // Revert state on error
      fetchBlogs(); // Refetch to ensure consistency
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title2?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={fetchBlogs}
            className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">إدارة المدونات</h1>

        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              placeholder="بحث بعنوان المدونة..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 pl-10 border rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">إضافة مدونة جديدة</h2>
              <form onSubmit={handleAddBlog} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الاسم المختصر *</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${formErrors.slug ? "border-red-500" : "border-gray-300"}`}
                  />
                  {formErrors.slug && <p className="text-red-500 text-xs mt-1">{formErrors.slug}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العنوان *</label>
                  <input
                    type="text"
                    value={form.title2}
                    onChange={(e) => setForm({ ...form, title2: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${formErrors.title2 ? "border-red-500" : "border-gray-300"}`}
                  />
                  {formErrors.title2 && <p className="text-red-500 text-xs mt-1">{formErrors.title2}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم الكاتب *</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    className={`w-full p-2 border rounded-lg ${formErrors.author ? "border-red-500" : "border-gray-300"}`}
                  />
                  {formErrors.author && <p className="text-red-500 text-xs mt-1">{formErrors.author}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المحتوى *</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={4}
                    className={`w-full p-2 border rounded-lg ${formErrors.content ? "border-red-500" : "border-gray-300"}`}
                  />
                  {formErrors.content && <p className="text-red-500 text-xs mt-1">{formErrors.content}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                  <input
                    type="number"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">كلما زاد الرقم زادت الأولوية</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملف الصورة</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active === 1}
                    onChange={(e) => setForm({ ...form, is_active: +e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    تفعيل المدونة
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  إضافة
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            {filteredBlogs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">لم يتم العثور على مدونات</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog.id} className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200 relative ${!blog.is_active ? 'opacity-70' : ''}`}>
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleToggleActive(blog.id, blog.is_active)}
                        className={`p-2 rounded-full ${blog.is_active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white transition`}
                        title={blog.is_active ? "تعطيل المدونة" : "تفعيل المدونة"}
                      >
                        {blog.is_active ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                        title="حذف المدونة"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {!blog.is_active && (
                      <div className="absolute top-2 left-2 bg-gray-500 text-white text-xs px-2 py-1 rounded">
                        معطلة
                      </div>
                    )}

                    <div className="absolute top-2 right-22 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      الأولوية: {blog.priority || 0}
                    </div>

                    <div className="h-48 overflow-hidden">
                      <img
                        src={getImageUrl(blog.image || "") || "/placeholder.png"}
                        alt={blog.title2}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{blog.title2}</h3>
                      <p className="text-sm text-gray-600 mb-4">بواسطة {blog.author}</p>
                      <p className="text-gray-700 mb-4 line-clamp-2">{blog.content}</p>
                      
                      <div className="flex items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700 mr-2">تغيير الأولوية:</label>
                        <input
                          type="number"
                          value={blog.priority || 0}
                          onChange={(e) => handlePriorityChange(blog.id, parseInt(e.target.value) || 0)}
                          className="w-20 p-1 border border-gray-300 rounded"
                          min="0"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Link to={`/blogs/${blog.id}`} className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
                          اقرأ المزيد
                          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <span className="text-xs text-gray-500">
                          {new Date(blog.created_at).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;