import React, { useState } from 'react';
import axios from 'axios';

export type DayOfWeek =
  | 'SUNDAY'
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';


interface WorkingHoursSlot {
  days: DayOfWeek[];
  openingTime: string;
  closingTime: string;
}

const daysOfWeek: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
];
interface Region {
  id: string;
  name: string;
}

interface FormProps {
  regions: Region[];
}

const Form: React.FC<FormProps> = ({ regions }) => {
    console.log(regions);
    
const [formData, setFormData] = useState({
  name: '',
  address: '',
  location_link: '',
  region_id: '',
  image: null as File | null,
});


  const [workingHours, setWorkingHours] = useState<WorkingHoursSlot[]>([
    {
      days: ['SATURDAY', 'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY'],
      openingTime: '09:00',
      closingTime: '22:00'
    }]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === 'image' && files) {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHoursSlot, value: any) => {
    const updatedHours = [...workingHours];
    if (field === 'days') {
      // Handle day selection changes
      updatedHours[index].days = value;
    } else {
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

  const removeTimeSlot = (index: number) => {
    const updatedHours = [...workingHours];
    updatedHours.splice(index, 1);
    setWorkingHours(updatedHours);
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'مساءً' : 'صباحًا';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minutes} ${period}`;
  };

  const formatDaysRange = (days: DayOfWeek[]) => {
    if (days.length === 0) return '';
    if (days.length === 1) return getDayName(days[0]);
    
    const firstDay = getDayName(days[0]);
    const lastDay = getDayName(days[days.length - 1]);
    return `من ${firstDay} إلى ${lastDay}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
          } else {
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
          "Authorization":`Bearer ${sessionStorage.getItem("token")}`
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
    } catch (err: any) {
      console.error('Submission error:', err);
      alert(`فشل في إضافة الفرع: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
console.log(regions);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-right">إضافة فرع جديد</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Branch Name */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-right">
              اسم الفرع
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
              required
            />
          </div>

          {/* Region */}
    <select
  id="region_id"
  name="region_id"
  value={formData.region_id}
  onChange={handleChange}
  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
  required
>
  <option value="">اختر المنطقة</option>
  {regions.map((region) => (
    <option key={region.id} value={region.id}>{region.name}</option>
  ))}
</select>

          {/* Address */}
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 text-right">
              العنوان
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
              required
            />
          </div>

          {/* Location Link */}
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="location_link" className="block text-sm font-medium text-gray-700 text-right">
              رابط الموقع (Google Maps)
            </label>
            <input
              type="url"
              id="location_link"
              name="location_link"
              value={formData.location_link}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-right"
              placeholder="https://maps.google.com/..."
              required
            />
          </div>

          {/* Image Upload */}
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 text-right">
              صورة الفرع
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>
        </div>

        {/* Working Hours Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 text-right">ساعات العمل</h3>
            <button
              type="button"
              onClick={addNewTimeSlot}
              className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
            >
              + إضافة وقت
            </button>
          </div>
          
          <div className="space-y-4">
            {workingHours.map((slot, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 text-right mb-1">
                      الأيام
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map(day => (
                        <label key={day} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={slot.days.includes(day)}
                            onChange={(e) => {
                              const updatedDays = e.target.checked
                                ? [...slot.days, day]
                                : slot.days.filter(d => d !== day);
                              handleWorkingHoursChange(index, 'days', updatedDays);
                            }}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="mr-2 text-sm text-gray-700">{getDayName(day)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor={`opening-${index}`} className="block text-sm font-medium text-gray-700 text-right mb-1">
                        وقت الفتح
                      </label>
                      <input
                        type="time"
                        id={`opening-${index}`}
                        value={slot.openingTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'openingTime', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor={`closing-${index}`} className="block text-sm font-medium text-gray-700 text-right mb-1">
                        وقت الإغلاق
                      </label>
                      <input
                        type="time"
                        id={`closing-${index}`}
                        value={slot.closingTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'closingTime', e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeTimeSlot(index)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    حذف
                  </button>
                </div>
                
                {slot.days.length > 0 && slot.openingTime && slot.closingTime && (
                  <div className="text-sm text-gray-500 text-right">
                    {formatDaysRange(slot.days)}: {formatTime(slot.openingTime)} - {formatTime(slot.closingTime)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'جاري الحفظ...' : 'إضافة الفرع'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Helper function to display day names in Arabic
function getDayName(day: DayOfWeek): string {
  const daysMap: Record<DayOfWeek, string> = {
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