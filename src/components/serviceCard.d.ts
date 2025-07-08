import React from "react";
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
declare const ServiceCard: React.FC<ServiceCardProps>;
export default ServiceCard;
