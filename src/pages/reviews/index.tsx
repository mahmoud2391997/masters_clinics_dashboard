import { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiUpload, FiStar } from 'react-icons/fi';
import Swal from 'sweetalert2';

interface Testimonial {
  id: number;
  img: string;
  des: string;
  title: string;
  sub: string;
  rating: number; // Added rating field
}

export default function TestimonialsDashboard() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Omit<Testimonial, 'id'>>({ 
    img: '', 
    des: '', 
    title: '', 
    sub: '',
    rating: 5 // Default to 5 stars
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
        Swal.fire({
          title: 'خطأ!',
          text: 'فشل تحميل الآراء',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
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
    const filtered = testimonials.filter(testimonial =>
      testimonial.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.sub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.des.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTestimonials(filtered);
    setCurrentPage(1);
  }, [searchTerm, testimonials]);

  const paginatedTestimonials = filteredTestimonials.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);

  const handleDelete = async (id: number) => {
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
          Swal.fire(
            'تم الحذف!',
            'تم حذف الرأي بنجاح.',
            'success'
          );
        } catch (err) {
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

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setImagePreview(testimonial.img);
    setImageFile(null);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingTestimonial) return;

    try {
      const formData = new FormData();
      formData.append('title', editingTestimonial.title);
      formData.append('sub', editingTestimonial.sub);
      formData.append('des', editingTestimonial.des);
      formData.append('rating', editingTestimonial.rating.toString());

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

      // Refresh local list
      setTestimonials(testimonials.map(t =>
        t.id === editingTestimonial.id ? updatedTestimonial : t
      ));
      setIsEditModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
      Swal.fire('تم التحديث!', 'تم تحديث الرأي بنجاح.', 'success');
    } catch (err) {
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
      setNewTestimonial({ img: '', des: '', title: '', sub: '', rating: 5 });
      setImageFile(null);
      setImagePreview(null);
      Swal.fire(
        'تمت الإضافة!',
        'تم إضافة الرأي الجديد بنجاح.',
        'success'
      );
    } catch (err) {
      Swal.fire({
        title: 'خطأ!',
        text: 'فشل إضافة رأي جديد',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FiStar 
            key={star}
            className={`h-5 w-5 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Star rating input component
  const StarRatingInput = ({ 
    value, 
    onChange 
  }: { 
    value: number; 
    onChange: (rating: number) => void 
  }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <FiStar 
              className={`h-6 w-6 ${star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-4">حدث خطأ</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الآراء</h1>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="ml-2" />
            إضافة رأي جديد
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي الآراء</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{testimonials.length}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">نشطة</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{testimonials.length}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">هذا الشهر</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{Math.floor(testimonials.length / 2)}</div>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">جميع الآراء</h3>
            <div className="relative w-64">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="ابحث عن آراء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الصورة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الوظيفة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التقييم
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الرأي
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTestimonials.length > 0 ? (
                  paginatedTestimonials.map((testimonial) => (
                    <tr key={testimonial.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full object-cover" src={testimonial.img} alt={testimonial.title} />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{testimonial.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{testimonial.sub}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(testimonial.rating)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 line-clamp-2">{testimonial.des}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => handleEdit(testimonial)}
                          className="text-indigo-600 hover:text-indigo-900 ml-3"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(testimonial.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      لا توجد آراء متاحة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    عرض <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> إلى{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, filteredTestimonials.length)}
                    </span>{' '}
                    من <span className="font-medium">{filteredTestimonials.length}</span> نتيجة
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">السابق</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                      <span className="sr-only">التالي</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && editingTestimonial && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          ></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">تعديل الرأي</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">الاسم</label>
                    <input
                      type="text"
                      id="edit-title"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editingTestimonial.title}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-sub" className="block text-sm font-medium text-gray-700">الوظيفة</label>
                    <input
                      type="text"
                      id="edit-sub"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editingTestimonial.sub}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, sub: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">التقييم</label>
                    <StarRatingInput 
                      value={editingTestimonial.rating} 
                      onChange={(rating) => setEditingTestimonial({...editingTestimonial, rating})} 
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-des" className="block text-sm font-medium text-gray-700">الرأي</label>
                    <textarea
                      id="edit-des"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={editingTestimonial.des}
                      onChange={(e) => setEditingTestimonial({...editingTestimonial, des: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">صورة الشهادة</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiUpload className="ml-1" />
                      اختر صورة
                    </button>
                    {(imagePreview || editingTestimonial.img) && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview || editingTestimonial.img} 
                          alt="Preview" 
                          className="h-20 w-20 rounded-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleUpdate}
                >
                  تحديث
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div 
              className="relative bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">إضافة رأي جديد</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="add-title" className="block text-sm font-medium text-gray-700">الاسم</label>
                    <input
                      type="text"
                      id="add-title"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTestimonial.title}
                      onChange={(e) => setNewTestimonial({...newTestimonial, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label htmlFor="add-sub" className="block text-sm font-medium text-gray-700">الوظيفة</label>
                    <input
                      type="text"
                      id="add-sub"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTestimonial.sub}
                      onChange={(e) => setNewTestimonial({...newTestimonial, sub: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">التقييم</label>
                    <StarRatingInput 
                      value={newTestimonial.rating} 
                      onChange={(rating) => setNewTestimonial({...newTestimonial, rating})} 
                    />
                  </div>
                  <div>
                    <label htmlFor="add-des" className="block text-sm font-medium text-gray-700">الرأي</label>
                    <textarea
                      id="add-des"
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={newTestimonial.des}
                      onChange={(e) => setNewTestimonial({...newTestimonial, des: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">صورة الشهادة</label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="mt-1 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FiUpload className="ml-1" />
                      اختر صورة
                    </button>
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="h-20 w-20 rounded-full object-cover" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleAdd}
                >
                  إضافة
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}