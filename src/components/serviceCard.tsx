import React from "react";
import { Link } from "react-router-dom";

interface Doctor {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Category {
  id: string | number;
  name: string;
  description: string;
  imageUrl: string;
  doctors?: Doctor[];
  branches?: Branch[];
  capabilities?: string[];
  approach?: string;
  department?: string;
}

interface ServiceCardProps {
  category: Category;
  handleEdit: (category: Category) => void;
  handleDelete: (id: string | number) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ category, handleEdit, handleDelete }) => (
  <div className="lg:h-auto m-auto w-full flex flex-col items-center border border-gray-200 rounded-lg p-4 shadow-md">
    {/* Image */}
    <div className="w-full h-[300px] flex justify-center items-center overflow-hidden">
      <img
        src={category.imageUrl || "/default-service-image.jpg"}
        alt={category.name}
        className="object-cover rounded-lg w-full h-full"
      />
    </div>

    {/* Title and description */}
    <h5 className="text-2xl leading-5 tracking-[0.16em] mt-2">{category.name}</h5>
    <p className="text-gray-600 my-3 text-center">{category.description}</p>

    {category.department && (
      <p className="text-gray-500 text-sm mb-2">القسم: {category.department}</p>
    )}

    {/* Doctors */}
    {category.doctors && category.doctors.length > 0 && (
      <div className="w-full my-2 p-2">
        <h6 className="text-lg font-semibold text-right mb-1 text-blue-600">الأطباء:</h6>
        <ul className="list-disc pl-5 text-gray-700 text-sm">
          {category.doctors.map((doctor) => (
            <li key={doctor.id}>{doctor.name}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Branches */}
    {category.branches && category.branches.length > 0 && (
      <div className="w-full my-2 p-2">
        <h6 className="text-lg font-semibold text-right mb-1 text-green-600">الفروع:</h6>
        <ul className="list-disc pl-5 text-gray-700 text-sm">
          {category.branches.map((branch) => (
            <li key={branch.id}>{branch.name}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Buttons */}
    <div className="flex justify-between w-full mt-4">
      <button
        onClick={() => handleEdit(category)}
        className="text-blue-500 border border-blue-500 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white"
      >
        تعديل
      </button>
      <Link to={`/services/${category.id}`}>
        <button className="text-purple-500 border border-purple-500 px-4 py-2 rounded-lg hover:bg-purple-500 hover:text-white">
          عرض
        </button>
      </Link>
      <button
        onClick={() => handleDelete(category.id)}
        className="text-red-500 border border-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white"
      >
        حذف
      </button>
    </div>
  </div>
);

export default ServiceCard;
