import React from "react";
interface Doctor {
    name: string;
}
interface Branch {
    name: string;
}
interface Category {
    id: string | number;
    name: string;
    description: string;
    imageUrl: string;
    doctors?: Doctor[];
    branches?: Branch[];
}
interface ServiceCardProps {
    category: Category;
    handleEdit: (category: Category) => void;
    handleDelete: (id: string | number) => void;
}
declare const ServiceCard: React.FC<ServiceCardProps>;
export default ServiceCard;
