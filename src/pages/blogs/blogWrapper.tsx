import { useState } from "react";
import { BlogForm } from "./blogForm";
import type { Blog } from "./type";

interface Props {
  onAdd: (blog: Blog) => void;
}

const BlogFormWrapper: React.FC<Props> = ({ onAdd }) => {
  const [formData, setFormData] = useState<Blog>({
    slug: "",
    title2: "",
    author: "",
    content: "",
    tags: [],
    categories: [],
    image: "",
  });

  const handleAdd = (newBlog: Blog) => {
    onAdd(newBlog);
    // Reset form
    setFormData({
      slug: "",
      title2: "",
      author: "",
      content: "",
      tags: [],
      categories: [],
      image: "",
    });
  };

  return (
    <BlogForm
      blog={formData}
      isNew={true}
      onSubmit={handleAdd}
    />
  );
};

export default BlogFormWrapper;