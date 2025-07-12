"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import type { Blog } from "./type";
import { Link } from "react-router-dom";

const BlogsPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Omit<Blog, "id">>({
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
    try {
      const res = await axios.get<Blog[]>("http://localhost:3000/blogs");
      setBlogs(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBlog: Blog = {
        ...form,
        tags: form.tags ? form.tags.filter(Boolean) : [],
        categories: form.categories ? form.categories.filter(Boolean) : [],
        create_at: new Date().toISOString(),
      };

      // If you want to POST to backend
      // const res = await axios.post("http://localhost:3000/blogs", newBlog);
      // setBlogs([res.data, ...blogs]);

      // Local only for now
      setBlogs([newBlog, ...blogs]);
      setForm({ slug: "", title2: "", author: "", content: "", tags: [], categories: [], image: "" });
    } catch (error) {
      console.error(error);
    }
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title2?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">إدارة المقالات</h1>

      <form onSubmit={handleAddBlog} className="bg-white rounded shadow p-6 mb-8 space-y-4">
        <h2 className="text-xl font-bold">إضافة مقال</h2>

        <input
          type="text"
          placeholder="Slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="العنوان"
          value={form.title2}
          onChange={(e) => setForm({ ...form, title2: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="المؤلف"
          value={form.author}
          onChange={(e) => setForm({ ...form, author: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
        <textarea
          placeholder="المحتوى"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="w-full p-2 border rounded"
          rows={3}
        />
        <input
          type="text"
          placeholder="الوسوم (افصل بفاصلة)"
          value={form.tags?.join(", ")}
          onChange={(e) => setForm({ ...form, tags: e.target.value.split(",").map((tag) => tag.trim()) })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="التصنيفات (افصل بفاصلة)"
          value={form.categories?.join(", ")}
          onChange={(e) => setForm({ ...form, categories: e.target.value.split(",").map((cat) => cat.trim()) })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="رابط الصورة"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
          className="w-full p-2 border rounded"
        />

        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
          إضافة
        </button>
      </form>

      <input
        type="text"
        placeholder="ابحث بعنوان المقال..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-3 border rounded mb-4 focus:ring focus:ring-primary"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBlogs.map((blog) => (
          <div key={blog.slug} className="bg-white rounded shadow p-4 flex flex-col">
            <img
              src={blog.image || "/placeholder.png"}
              alt={blog.title2}
              className="w-full h-40 object-cover rounded mb-4"
            />
            <h3 className="font-bold text-lg mb-2">{blog.title2}</h3>
            <p className="text-sm text-gray-600 mb-2">بواسطة: {blog.author}</p>
            <Link
              to={`/blogs/${blog.slug}`}
              className="text-primary hover:underline mt-auto"
            >
              اقرأ المزيد →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogsPage;
