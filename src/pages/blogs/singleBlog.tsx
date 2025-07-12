"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import type { Blog } from "./type";

const BlogSinglePage: React.FC = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlog(slug as string);
    }
  }, [slug]);

  const fetchBlog = async (slug: string) => {
    try {
      const res = await axios.get<Blog[]>(`http://localhost:3000/blogs`);
      const found = res.data.find((b) => b.slug === slug);
      setBlog(found || null);
    } catch (error) {
      console.error(error);
    }
  };

  if (!blog) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <img
        src={blog.image || "/placeholder.png"}
        alt={blog.title2}
        className="w-full h-64 object-cover rounded mb-6"
      />
      <h1 className="text-3xl font-bold mb-2">{blog.title2}</h1>
      <p className="text-gray-600 mb-4">بواسطة {blog.author}</p>
      <div className="prose mb-6">
        <p>{blog.content}</p>
      </div>
      {blog.tags && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag, idx) => (
            <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {blog.categories && (
        <div className="flex flex-wrap gap-2">
          {blog.categories.map((cat, idx) => (
            <span key={idx} className="bg-primary text-white px-2 py-1 rounded text-sm">
              {cat}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogSinglePage;
