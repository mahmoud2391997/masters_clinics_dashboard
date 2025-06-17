export interface Department {
    _id: string;
    id: number;
    name: string;
    description?: string;
    imageUrl?: string;
}
export declare const fetchDepartments: () => Promise<Department[]>;
export declare const fetchDepartmentById: (_id: string) => Promise<Department>;
export declare const createDepartment: (department: Omit<Department, "id">) => Promise<Department>;
export declare const deleteDepartment: (_id: string) => Promise<void>;
