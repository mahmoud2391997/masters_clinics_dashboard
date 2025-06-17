import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import axios from 'axios';
const daysOfWeek = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY'
];
const Form = ({ regions }) => {
    console.log(regions);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        location_link: '',
        region_id: '',
        image: null,
    });
    const [workingHours, setWorkingHours] = useState([
        {
            days: ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'],
            openingTime: '09:00',
            closingTime: '22:00'
        }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files) {
            setFormData({ ...formData, image: files[0] });
        }
        else {
            setFormData({ ...formData, [name]: value });
        }
    };
    const handleWorkingHoursChange = (index, field, value) => {
        const updatedHours = [...workingHours];
        if (field === 'days') {
            // Handle day selection changes
            updatedHours[index].days = value;
        }
        else {
            updatedHours[index] = { ...updatedHours[index], [field]: value };
        }
        setWorkingHours(updatedHours);
    };
    const addNewTimeSlot = () => {
        setWorkingHours([...workingHours, {
                days: [],
                openingTime: '09:00',
                closingTime: '17:00'
            }]);
    };
    const removeTimeSlot = (index) => {
        const updatedHours = [...workingHours];
        updatedHours.splice(index, 1);
        setWorkingHours(updatedHours);
    };
    const formatTime = (time) => {
        if (!time)
            return '';
        const [hours, minutes] = time.split(':');
        const hourNum = parseInt(hours, 10);
        const period = hourNum >= 12 ? 'مساءً' : 'صباحًا';
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
        return `${displayHour}:${minutes} ${period}`;
    };
    const formatDaysRange = (days) => {
        if (days.length === 0)
            return '';
        if (days.length === 1)
            return getDayName(days[0]);
        const firstDay = getDayName(days[0]);
        const lastDay = getDayName(days[days.length - 1]);
        return `من ${firstDay} إلى ${lastDay}`;
    };
    const handleSubmit = async (e) => {
        console.log('Form data before submission:', formData);
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Step 2: Create FormData for file + text
            const payload = new FormData();
            payload.append('name', formData.name);
            payload.append('address', formData.address);
            payload.append('location_link', formData.location_link);
            payload.append('region_id', formData.region_id);
            // Format working hours as required
            const formattedWorkingHours = workingHours
                .filter(slot => slot.days.length > 0 && slot.openingTime && slot.closingTime)
                .map(slot => ({
                days: formatDaysRange(slot.days),
                time: `${formatTime(slot.openingTime)} - ${formatTime(slot.closingTime)}`
            }));
            payload.append('working_hours', JSON.stringify(formattedWorkingHours));
            // Show every attribute in FormData payload
            for (const [key, value] of payload.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: [File] name=${value.name}, size=${value.size}`);
                }
                else {
                    console.log(`${key}:`, value);
                }
            }
            console.log('Payload before submission:', payload);
            if (formData.image) {
                payload.append('image', formData.image);
            }
            // Step 3: Submit to backend
            await axios.post('http://localhost:3000/branches', payload, {
                headers: { 'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
                },
            });
            alert('تم إضافة الفرع بنجاح');
            // Reset form
            setFormData({
                name: '',
                address: '',
                location_link: '',
                region_id: '',
                image: null,
            });
            setWorkingHours([
                {
                    days: ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'],
                    openingTime: '09:00',
                    closingTime: '22:00'
                }
            ]);
        }
        catch (err) {
            console.error('Submission error:', err);
            alert(`فشل في إضافة الفرع: ${err.response?.data?.message || err.message}`);
        }
        finally {
            setIsSubmitting(false);
        }
    };
    console.log(regions);
    return (_jsxs("div", { className: "max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-6 text-right", children: "\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0639 \u062C\u062F\u064A\u062F" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 text-right", children: "\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u0639" }), _jsx("input", { type: "text", id: "name", name: "name", value: formData.name, onChange: handleChange, className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right", required: true })] }), _jsxs("select", { id: "region_id", name: "region_id", value: formData.region_id, onChange: handleChange, className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right", required: true, children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u0629" }), regions.map((region) => (_jsx("option", { value: region.id, children: region.name }, region.id)))] }), _jsxs("div", { className: "md:col-span-2 space-y-2", children: [_jsx("label", { htmlFor: "address", className: "block text-sm font-medium text-gray-700 text-right", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx("input", { type: "text", id: "address", name: "address", value: formData.address, onChange: handleChange, className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right", required: true })] }), _jsxs("div", { className: "md:col-span-2 space-y-2", children: [_jsx("label", { htmlFor: "location_link", className: "block text-sm font-medium text-gray-700 text-right", children: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 (Google Maps)" }), _jsx("input", { type: "url", id: "location_link", name: "location_link", value: formData.location_link, onChange: handleChange, className: "mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right", placeholder: "https://maps.google.com/...", required: true })] }), _jsxs("div", { className: "md:col-span-2 space-y-2", children: [_jsx("label", { htmlFor: "image", className: "block text-sm font-medium text-gray-700 text-right", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0641\u0631\u0639" }), _jsx("div", { className: "mt-1 flex items-center", children: _jsx("input", { type: "file", id: "image", name: "image", accept: "image/*", onChange: handleChange, className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" }) })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900 text-right", children: "\u0633\u0627\u0639\u0627\u062A \u0627\u0644\u0639\u0645\u0644" }), _jsx("button", { type: "button", onClick: addNewTimeSlot, className: "px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200", children: "+ \u0625\u0636\u0627\u0641\u0629 \u0648\u0642\u062A" })] }), _jsx("div", { className: "space-y-4", children: workingHours.map((slot, index) => (_jsxs("div", { className: "grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 text-right mb-1", children: "\u0627\u0644\u0623\u064A\u0627\u0645" }), _jsx("div", { className: "flex flex-wrap gap-2", children: daysOfWeek.map(day => (_jsxs("label", { className: "inline-flex items-center", children: [_jsx("input", { type: "checkbox", checked: slot.days.includes(day), onChange: (e) => {
                                                                            const updatedDays = e.target.checked
                                                                                ? [...slot.days, day]
                                                                                : slot.days.filter(d => d !== day);
                                                                            handleWorkingHoursChange(index, 'days', updatedDays);
                                                                        }, className: "h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" }), _jsx("span", { className: "mr-2 text-sm text-gray-700", children: getDayName(day) })] }, day))) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: `opening-${index}`, className: "block text-sm font-medium text-gray-700 text-right mb-1", children: "\u0648\u0642\u062A \u0627\u0644\u0641\u062A\u062D" }), _jsx("input", { type: "time", id: `opening-${index}`, value: slot.openingTime, onChange: (e) => handleWorkingHoursChange(index, 'openingTime', e.target.value), className: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: `closing-${index}`, className: "block text-sm font-medium text-gray-700 text-right mb-1", children: "\u0648\u0642\u062A \u0627\u0644\u0625\u063A\u0644\u0627\u0642" }), _jsx("input", { type: "time", id: `closing-${index}`, value: slot.closingTime, onChange: (e) => handleWorkingHoursChange(index, 'closingTime', e.target.value), className: "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" })] })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "button", onClick: () => removeTimeSlot(index), className: "text-sm text-red-600 hover:text-red-800", children: "\u062D\u0630\u0641" }) }), slot.days.length > 0 && slot.openingTime && slot.closingTime && (_jsxs("div", { className: "text-sm text-gray-500 text-right", children: [formatDaysRange(slot.days), ": ", formatTime(slot.openingTime), " - ", formatTime(slot.closingTime)] }))] }, index))) })] }), _jsx("div", { className: "flex justify-end pt-4", children: _jsx("button", { type: "submit", disabled: isSubmitting, className: "px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed", children: isSubmitting ? 'جاري الحفظ...' : 'إضافة الفرع' }) })] })] }));
};
// Helper function to display day names in Arabic
function getDayName(day) {
    const daysMap = {
        SUNDAY: 'الأحد',
        MONDAY: 'الإثنين',
        TUESDAY: 'الثلاثاء',
        WEDNESDAY: 'الأربعاء',
        THURSDAY: 'الخميس',
        FRIDAY: 'الجمعة',
        SATURDAY: 'السبت'
    };
    return daysMap[day];
}
export default Form;
