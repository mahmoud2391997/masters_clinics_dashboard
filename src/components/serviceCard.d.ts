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
declare const ServiceCard: React.FC<ServiceCardProps>;
export default ServiceCard;
