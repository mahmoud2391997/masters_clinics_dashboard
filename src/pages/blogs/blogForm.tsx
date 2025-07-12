"use client";
import React, {
  useState,
  useEffect,
  type ChangeEvent,
  type FormEvent,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import type { Blog } from "./type";

interface Props {
  blog?: Blog | null;
  isNew: boolean;
  onSubmit?: (blog: Blog) => void;
}

export const BlogForm: React.FC<Props> = ({ blog, isNew, onSubmit }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<Blog>({
    slug: "",
    title2: "",
    author: "",
    content: "",
    tags: [],
    categories: [],
    image: "",
  });

  useEffect(() => {
    if (blog) {
      setFormData({
        ...blog,
        tags: blog.tags || [],
        categories: blog.categories || [],
      });
    }
  }, [blog]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "tags" || name === "categories") {
      setFormData({ ...formData, [name]: value.split(",").map((t) => t.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (isNew) {
        res = await axios.post("http://localhost:3000/blogs", {
          ...formData,
          create_at: new Date().toISOString(),
        });
      } else if (blog?.id) {
        res = await axios.put(`http://localhost:3000/blogs/${blog.id}`, formData);
      }

      if (onSubmit && res?.data) {
        onSubmit(res.data);
      } else {
        router.push("/dashboard/blogs");
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
      <input
        name="title2"
        value={formData.title2}
        onChange={handleChange}
        placeholder="عنوان المقال"
        className="w-full p-3 border rounded"
        required
      />

      <input
        name="author"
        value={formData.author}
        onChange={handleChange}
        placeholder="اسم المؤلف"
        className="w-full p-3 border rounded"
        required
      />

      <textarea
        name="content"
        value={formData.content}
        onChange={handleChange}
        placeholder="محتوى المقال"
        rows={5}
        className="w-full p-3 border rounded"
      />

      <input
        name="tags"
        value={formData.tags?.join(",") ?? ""}
        onChange={handleChange}
        placeholder="وسوم (مفصولة بفواصل)"
        className="w-full p-3 border rounded"
      />

      <input
        name="categories"
        value={formData.categories?.join(",") ?? ""}
        onChange={handleChange}
        placeholder="تصنيفات (مفصولة بفواصل)"
        className="w-full p-3 border rounded"
      />

      <button
        type="submit"
        className="bg-primary text-white py-3 px-6 rounded hover:bg-primary-dark transition"
      >
        {isNew ? "إضافة" : "تحديث"}
      </button>
    </form>
  );
};




