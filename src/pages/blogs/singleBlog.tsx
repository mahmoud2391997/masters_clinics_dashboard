import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BlogSinglePage.css';
import { getImageUrl } from '../../hooks/imageUrl';

interface Blog {
  id: number;
  slug: string;
  title2: string;
  author: string;
  image: string;
  blogSingleImg: string | null;
  content: string;
  create_at: string;
  created_at: string;
  updated_at: string;
  comment: number;
}

const BlogSinglePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedBlog, setEditedBlog] = useState<Partial<Blog>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await axios.get<Blog>(`https://www.ss.mastersclinics.com/blogs/${id}`);
        if (!response.data) {
          throw new Error('لم يتم العثور على المقال');
        }
        setBlog(response.data);
        setEditedBlog(response.data);
        setImagePreview(getImageUrl(response.data.image));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'فشل في جلب المقال');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    } else {
      setError('معرّف المقال غير صالح');
      setLoading(false);
      navigate('/blogs');
    }
  }, [id, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedBlog(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title2', editedBlog.title2 || '');
      formData.append('author', editedBlog.author || '');
      formData.append('content', editedBlog.content || '');
      formData.append('slug', editedBlog.slug || '');
      formData.append('blogSingleImg', editedBlog.blogSingleImg || '');
      formData.append('comment', String(editedBlog.comment ?? 0));

      if (imageFile) {
        formData.append('image', imageFile);
      }

      await axios.put(`https://www.ss.mastersclinics.com/blogs/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refresh data
      const updated = await axios.get<Blog>(`https://www.ss.mastersclinics.com/blogs/${id}`);
      setBlog(updated.data);
      setEditedBlog(updated.data);
      setImagePreview(getImageUrl(updated.data.image));
      setIsEditing(false);
      setImageFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في تحديث المقال');
      console.error('Error updating blog:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentImage = imagePreview || getImageUrl(blog?.image ?? '');

  if (loading && !isEditing) {
    return (
      <div className="blog-loading">
        <div className="loading-image"></div>
        <div className="loading-title"></div>
        <div className="loading-content"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-error">
        <h2>خطأ</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/blogs')}>الرجوع إلى جميع المقالات</button>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <article className="blog-single">
      {isEditing ? (
        <div className="edit-controls">
          <div className="form-group">
            <label>العنوان:</label>
            <input
              type="text"
              name="title2"
              value={editedBlog.title2 || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>الكاتب:</label>
            <input
              type="text"
              name="author"
              value={editedBlog.author || ''}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>الصورة:</label>
            <div className="image-upload-container">
              <img
                src={currentImage}
                alt="معاينة"
                className="image-preview"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg';
                }}
              />
              <div className="upload-actions">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="upload-button"
                >
                  اختر صورة
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>المحتوى:</label>
            <textarea
              name="content"
              value={editedBlog.content || ''}
              onChange={handleInputChange}
              rows={6}
            />
          </div>

          <div className="button-group">
            <button onClick={handleSave} className="save-button" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setImageFile(null);
                setImagePreview(getImageUrl(blog.image));
              }}
              className="cancel-button"
              disabled={loading}
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : (
        <>
          <img
            src={currentImage}
            alt={blog.title2}
            className="blog-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/3998419/pexels-photo-3998419.jpeg';
            }}
          />

          <h1 className="blog-title">{blog.title2}</h1>

          <div className="blog-meta">
            <span className="blog-author">بواسطة {blog.author}</span>
            <span className="blog-date">تاريخ النشر: {formatDate(blog.create_at)}</span>
            {blog.created_at !== blog.updated_at && (
              <span className="blog-updated">
                آخر تحديث: {formatDate(blog.updated_at)}
              </span>
            )}
            <span className="blog-comments">{blog.comment} تعليق</span>
          </div>

          <div className="blog-content">
            {blog.content?.split('\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          <div className="button-group">
            <button onClick={() => setIsEditing(true)} className="edit-button">
              تعديل المقال
            </button>
            <button onClick={() => navigate('/blogs')} className="back-button">
              الرجوع إلى جميع المقالات
            </button>
          </div>
        </>
      )}
    </article>
  );
};

export default BlogSinglePage;
