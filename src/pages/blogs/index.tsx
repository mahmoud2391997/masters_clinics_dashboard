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
    } catch (error) {
      console.error("فشل في إضافة المدونة:", error);
      toast.error("فشل في إضافة المدونة");
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

        {/* Search */}
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
          {/* Add Form */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوسوم</label>
                  <input
                    type="text"
                    value={form.tags?.join(", ")}
                    onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map(tag => tag.trim()) })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التصنيفات</label>
                  <input
                    type="text"
                    value={form.categories?.join(", ")}
                    onChange={(e) => setForm({ ...form, categories: e.target.value.split(",").map(cat => cat.trim()) })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملف الصورة</label>
                  <input
                    type="file"
                    onChange={(e) => setForm({ ...form, imageFile: e.target.files?.[0] })}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
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

          {/* Blog List */}
          <div className="lg:col-span-2">
            {filteredBlogs.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">لم يتم العثور على مدونات</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBlogs.map((blog) => (
                  <div key={blog.slug} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={getImageUrl(blog.image || "") || "/placeholder.png"}
                        alt={blog.title2}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-2">
                        {blog.tags?.map((tag, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">{tag}</span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{blog.title2}</h3>
                      <p className="text-sm text-gray-600 mb-4">بواسطة {blog.author}</p>
                      <p className="text-gray-700 mb-4 line-clamp-2">{blog.content}</p>
                      <Link to={`/blogs/${blog.id}`} className="inline-flex items-center text-green-600 hover:text-green-700 font-medium">
                        اقرأ المزيد
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
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
