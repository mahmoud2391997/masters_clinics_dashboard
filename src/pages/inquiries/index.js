"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
const Inquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const limit = 10;
    const fetchInquiries = async (pageNum = 1) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`https://www.ss.mastersclinics.com/api/inquiries?page=${pageNum}&limit=${limit}`);
            console.log(response.data);
            setInquiries(response.data.data);
            setTotalPages(response.data.pagination.totalPages);
        }
        catch (err) {
            console.error("Error fetching inquiries:", err);
            setError("فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.");
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchInquiries(page);
    }, [page]);
    const handlePageChange = (newPage) => {
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
    return (_jsx("div", { className: "min-h-screen  p-4 md:p-8", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsx("div", { className: "bg-white rounded-2xl shadow-xl overflow-hidden mb-6", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800 mb-2 md:mb-0", children: "\u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A" }), _jsxs("div", { className: "flex items-center space-x-2 space-x-reverse", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0627\u0644\u0646\u062A\u0627\u0626\u062C \u0641\u064A \u0627\u0644\u0635\u0641\u062D\u0629:" }), _jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm", children: limit })] })] }), error && (_jsx("div", { className: "bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6", role: "alert", children: _jsx("p", { children: error }) })), loading ? (_jsxs("div", { className: "flex justify-center items-center h-64", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" }), _jsx("span", { className: "mr-3 text-gray-600", children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { className: "overflow-x-auto rounded-lg shadow", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "bg-gray-100 text-right", children: [_jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-700", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-700", children: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641" }), _jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-700", children: "\u0627\u0644\u0633\u0624\u0627\u0644" }), _jsx("th", { className: "px-4 py-3 text-right font-semibold text-gray-700", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0631\u0633\u0627\u0644" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: inquiries.map((inq) => (_jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [_jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center", children: _jsx("span", { className: "text-blue-800 font-medium", children: inq.name.split(' ').map(n => n[0]).join('').toUpperCase() }) }), _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: inq.name }) })] }) }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-700 [direction:ltr] text-right", children: inq.phone }) }), _jsx("td", { className: "px-4 py-3", children: _jsx("div", { className: "text-sm text-gray-700 max-w-xs", children: inq.question }) }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-500", children: new Date(inq.createdAt).toLocaleString("ar-EG") }) })] }, inq.id))) })] }) }), inquiries.length === 0 && !loading && (_jsxs("div", { className: "text-center py-12", children: [_jsx("svg", { className: "mx-auto h-12 w-12 text-gray-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }), _jsx("h3", { className: "mt-2 text-sm font-medium text-gray-900", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645" })] }))] })), totalPages > 1 && (_jsxs("div", { className: "mt-8 flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "text-sm text-gray-700", children: ["\u0639\u0631\u0636 ", _jsx("span", { className: "font-medium", children: (page - 1) * limit + 1 }), " \u0625\u0644\u0649 ", _jsx("span", { className: "font-medium", children: Math.min(page * limit, inquiries.length) }), " \u0645\u0646", ' ', _jsx("span", { className: "font-medium", children: inquiries.length }), " \u0646\u062A\u0627\u0626\u062C"] }), _jsxs("div", { className: "flex items-center space-x-1 space-x-reverse", children: [_jsx("button", { onClick: () => handlePageChange(1), disabled: page <= 1, className: "px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u0627\u0644\u0623\u0648\u0644\u0649" }), _jsx("button", { onClick: () => handlePageChange(page - 1), disabled: page <= 1, className: "px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u0627\u0644\u0633\u0627\u0628\u0642" }), getPageNumbers().map((pageNum) => (_jsx("button", { onClick: () => handlePageChange(pageNum), className: `px-3 py-1 rounded-md text-sm font-medium ${page === pageNum
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'}`, children: pageNum }, pageNum))), _jsx("button", { onClick: () => handlePageChange(page + 1), disabled: page >= totalPages, className: "px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u0627\u0644\u062A\u0627\u0644\u064A" }), _jsx("button", { onClick: () => handlePageChange(totalPages), disabled: page >= totalPages, className: "px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u0627\u0644\u0623\u062E\u064A\u0631\u0629" })] })] }))] }) }), _jsxs("div", { className: "text-center text-sm text-gray-500", children: ["\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0627\u0633\u062A\u0641\u0633\u0627\u0631\u0627\u062A - Masters Clinics \u00A9 ", new Date().getFullYear()] })] }) }));
};
export default Inquiries;
