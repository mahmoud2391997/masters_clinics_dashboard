"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

// Define types for our data
interface Inquiry {
  id: string;
  name: string;
  phone: string;
  question: string;
  createdAt: string;
}

interface PaginationInfo {
  totalPages: number;
  currentPage: number;
  totalItems: number;
}

interface ApiResponse {
  data: Inquiry[];
  pagination: PaginationInfo;
}

const Inquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 10;

  const fetchInquiries = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(
        `https://www.ss.mastersclinics.com/api/inquiries?page=${pageNum}&limit=${limit}`
      );
      console.log(response.data);

      setInquiries(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
      setError("فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(page);
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">نظام إدارة الاستفسارات</h1>
            <p className="mt-2 opacity-90">عرض وتتبع جميع استفسارات العملاء في مكان واحد</p>
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">الاستفسارات</h2>
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm text-gray-600">النتائج في الصفحة:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">{limit}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="mr-3 text-gray-600">جاري التحميل...</span>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 text-right">
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">الاسم</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">رقم الهاتف</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">السؤال</th>
                        <th className="px-4 py-3 text-right font-semibold text-gray-700">تاريخ الإرسال</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inquiries.map((inq) => (
                        <tr key={inq.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-800 font-medium">
                                  {inq.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div className="mr-3">
                                <div className="text-sm font-medium text-gray-900">{inq.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                         <div className="text-sm text-gray-700 [direction:ltr] text-right">{inq.phone}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-700 max-w-xs">{inq.question}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(inq.createdAt).toLocaleString("ar-EG")}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {inquiries.length === 0 && !loading && (
                  <div className="text-center py-12">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد استفسارات</h3>
                    <p className="mt-1 text-sm text-gray-500">لم يتم العثور على أي استفسارات في النظام</p>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  عرض <span className="font-medium">{(page - 1) * limit + 1}</span> إلى <span className="font-medium">{Math.min(page * limit, inquiries.length)}</span> من{' '}
                  <span className="font-medium">{inquiries.length}</span> نتائج
                </div>
                
                <div className="flex items-center space-x-1 space-x-reverse">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    الأولى
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    السابق
                  </button>
                  
                  {getPageNumbers().map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    التالي
                  </button>
                  
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page >= totalPages}
                    className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    الأخيرة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center text-sm text-gray-500">
          نظام إدارة الاستفسارات - Masters Clinics © {new Date().getFullYear()}
        </div>
      </div>

     
    </div>
  );
};

export default Inquiries;