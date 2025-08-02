import React from "react";

interface Doctor {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name_ar: string;
  name_en?: string | null;
}

interface ServiceCardProps {
  service: {
    id: number;
    name_ar: string;
    name_en: string | null;
    description: string | null;
    image: string | null;
    is_active: number;
    priority: number;
    created_at: string;
    updated_at: string;
    department?: Department;
    category?: Category;
    doctors?: Doctor[];
    branches?: Branch[];
  };
  onEdit: () => void;
  onDelete: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit, onDelete }) => {
  return (
    <div className="lg:h-auto m-auto w-full flex flex-col items-center border border-gray-200 rounded-lg p-4 shadow-md">
      {/* Image */}
      <div className="w-full h-[300px] flex justify-center items-center overflow-hidden">
        <img
          src={service.image ? `https://www.ss.mastersclinics.com${service.image}` : "/default-service-image.jpg"}
          alt={service.name_ar}
          className="object-cover rounded-lg w-full h-full"
        />
      </div>

      {/* Title & Description */}
      <h5 className="text-2xl font-bold mt-2">{service.name_ar}</h5>
      {service.name_en && <h6 className="text-lg text-gray-600">{service.name_en}</h6>}
      <p className="text-gray-600 my-3 text-center">{service.description}</p>

      {/* Metadata */}
      <div className="text-sm text-gray-700 space-y-1 text-right w-full">
        {service.department && (
          <p>القسم: <span className="font-medium">{service.department.name}</span></p>
        )}
        {service.category && (
          <p>التصنيف: <span className="font-medium">{service.category.name_ar}</span></p>
        )}
        <p>الأولوية: <span className="font-medium">{service.priority}</span></p>
        <p>الحالة: <span className="font-medium">{service.is_active ? 'مفعلة' : 'غير مفعلة'}</span></p>
        <p>تاريخ الإضافة: <span className="font-medium">{new Date(service.created_at).toLocaleDateString()}</span></p>
      </div>

      {/* Doctors */}
      {service.doctors && service.doctors.length > 0 && (
        <div className="w-full my-2 p-2 bg-gray-50 rounded-md">
          <h6 className="text-lg font-semibold text-blue-600 mb-1">الأطباء:</h6>
          <ul className="list-disc pl-5 text-gray-700 text-sm">
            {service.doctors.map((doctor) => (
              <li key={doctor.id}>{doctor.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Branches */}
      {service.branches && service.branches.length > 0 && (
        <div className="w-full my-2 p-2 bg-gray-50 rounded-md">
          <h6 className="text-lg font-semibold text-green-600 mb-1">الفروع:</h6>
          <ul className="list-disc pl-5 text-gray-700 text-sm">
            {service.branches.map((branch) => (
              <li key={branch.id}>{branch.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between w-full mt-4 gap-2">
        <button
          onClick={onEdit}
          className="text-blue-500 border border-blue-500 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition"
        >
          تعديل
        </button>
        <button
          onClick={onDelete}
          className="text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
        >
          حذف
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
