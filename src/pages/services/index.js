import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import ServiceCard from "../../components/serviceCard";
import { message, Select } from "antd";
const safeJsonParse = (input) => {
    // Handle null/undefined cases
    if (input === null || input === undefined) {
        return [];
    }
    // If input is already an array, return it directly
    if (Array.isArray(input)) {
        return input;
    }
    // Handle non-string values (numbers, booleans, objects)
    if (typeof input !== 'string') {
        try {
            // Try to stringify and parse non-string values
            const stringified = JSON.stringify(input);
            const parsed = JSON.parse(stringified);
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    // Handle empty string cases
    const trimmed = input.trim();
    if (trimmed === '' || trimmed === '[]' || trimmed === '""') {
        return [];
    }
    try {
        // Handle string that might be double-encoded
        let parsedValue = input;
        // First try to parse the outer string
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            parsedValue = JSON.parse(trimmed);
        }
        // If the result is still a string, try parsing again
        if (typeof parsedValue === 'string') {
            try {
                parsedValue = JSON.parse(parsedValue);
            }
            catch {
                // If it fails, try to handle as a single string value
                if (parsedValue.startsWith('[') && parsedValue.endsWith(']')) {
                    try {
                        parsedValue = JSON.parse(parsedValue);
                    }
                    catch {
                        return [];
                    }
                }
                else {
                    // Handle as single value in array
                    return [parsedValue];
                }
            }
        }
        return Array.isArray(parsedValue) ? parsedValue : [];
    }
    catch (e) {
        console.error('Failed to parse input:', input, e);
        return [];
    }
};
export default function AddService() {
    const [name_ar, setNameAr] = useState("");
    const [name_en, setNameEn] = useState("");
    const [description, setDescription] = useState("");
    const [departmentId, setDepartmentId] = useState();
    const [categoryId, setCategoryId] = useState(null);
    const [is_active, setIsActive] = useState(1);
    const [priority, setPriority] = useState(0);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allBranches, setAllBranches] = useState([]);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isLoading, setIsLoading] = useState({
        services: false,
        departments: false,
        categories: false,
        doctors: false,
        branches: false
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading({
                    services: true,
                    departments: true,
                    categories: true,
                    doctors: true,
                    branches: true
                });
                const [servicesRes, departmentsRes, categoriesRes, doctorsRes, branchesRes] = await Promise.all([
                    fetch("https://www.ss.mastersclinics.com/services", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("https://www.ss.mastersclinics.com/departments", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("https://www.ss.mastersclinics.com/service-categories", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("https://www.ss.mastersclinics.com/doctors", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("https://www.ss.mastersclinics.com/branches", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    })
                ]);
                if (!servicesRes.ok)
                    throw new Error("Failed to load services");
                if (!departmentsRes.ok)
                    throw new Error("Failed to load departments");
                if (!categoriesRes.ok)
                    throw new Error("Failed to load categories");
                if (!doctorsRes.ok)
                    throw new Error("Failed to load doctors");
                if (!branchesRes.ok)
                    throw new Error("Failed to load branches");
                const servicesData = await servicesRes.json();
                console.log(servicesData);
                const departmentsData = await departmentsRes.json();
                const categoriesData = await categoriesRes.json();
                console.log(categoriesData);
                const doctorsData = await doctorsRes.json();
                const branchesData = await branchesRes.json();
                const normalizedServices = servicesData.map((service) => {
                    // Handle branches - first try raw, then regular
                    const branches = service.branches_raw
                        ? safeJsonParse(service.branches_raw)
                        : safeJsonParse(service.branches || '[]');
                    // Handle doctors_ids - first try raw, then regular
                    const doctors_ids = service.doctors_ids_raw
                        ? safeJsonParse(service.doctors_ids_raw)
                        : safeJsonParse(service.doctors_ids || '[]');
                    return {
                        ...service,
                        branches: branches.map(String), // Ensure all are strings
                        doctors_ids: doctors_ids.map(String), // Ensure all are strings
                    };
                });
                setServices(normalizedServices);
                setDepartments(departmentsData);
                setCategories(categoriesData);
                setAllDoctors(doctorsData.map((d) => ({ ...d, id: String(d.id) })));
                setAllBranches(branchesData.map((b) => ({ ...b, id: String(b.id) })));
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
                console.error("Error fetching data:", err);
            }
            finally {
                setIsLoading({
                    services: false,
                    departments: false,
                    categories: false,
                    doctors: false,
                    branches: false
                });
            }
        };
        fetchData();
    }, []);
    useEffect(() => {
        if (departmentId) {
            const deptCategories = categories.filter(cat => cat.department_id === departmentId);
            setCategories(deptCategories);
            setCategoryId(null);
        }
    }, [departmentId, categories]);
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("Please upload a valid image (JPEG, PNG, GIF)");
            return;
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("Image size should be less than 5MB");
            return;
        }
        setImageFile(file);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };
    const resetForm = () => {
        setNameAr("");
        setNameEn("");
        setDescription("");
        setDepartmentId(undefined);
        setCategoryId(null);
        setIsActive(1);
        setPriority(0);
        setImageFile(null);
        setImagePreview(undefined);
        setSelectedBranches([]);
        setSelectedDoctors([]);
        setIsEditing(false);
        setEditingService(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(prev => ({ ...prev, services: true }));
        const formData = new FormData();
        formData.append("name_ar", name_ar);
        formData.append("name_en", name_en || "");
        formData.append("description", description || "");
        formData.append("doctors_ids", JSON.stringify(selectedDoctors));
        formData.append("branches", JSON.stringify(selectedBranches));
        if (departmentId)
            formData.append("department_id", departmentId.toString());
        if (categoryId)
            formData.append("category_id", categoryId.toString());
        formData.append("is_active", is_active.toString());
        formData.append("priority", priority.toString());
        if (imageFile)
            formData.append("image", imageFile);
        try {
            const url = isEditing && editingService
                ? `https://www.ss.mastersclinics.com/services/${editingService.id}`
                : "https://www.ss.mastersclinics.com/services";
            const method = isEditing ? "PUT" : "POST";
            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                },
                body: formData
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || (isEditing ? "Failed to update service" : "Failed to add service"));
            }
            const savedService = await response.json();
            const normalizedService = {
                ...savedService,
                branches: safeJsonParse(savedService.branches_raw || savedService.branches),
                doctors_ids: safeJsonParse(savedService.doctors_ids_raw || savedService.doctors_ids).map(String),
            };
            setServices(prev => isEditing
                ? prev.map(s => s.id === normalizedService.id ? normalizedService : s)
                : [...prev, normalizedService]);
            resetForm();
            message.success(isEditing ? "Service updated successfully" : "Service added successfully");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save service");
            console.error(err);
        }
        finally {
            setIsLoading(prev => ({ ...prev, services: false }));
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this service?"))
            return;
        try {
            const response = await fetch(`https://www.ss.mastersclinics.com/services/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });
            if (!response.ok)
                throw new Error("Failed to delete service");
            setServices(prev => prev.filter(service => service.id !== id));
            message.success("Service deleted successfully");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete service");
            console.error(err);
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-4 space-y-6", dir: "rtl", children: [error && (_jsxs("div", { className: "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded", children: [_jsx("p", { children: error }), _jsx("button", { onClick: () => setError(null), className: "mt-1 text-yellow-700 hover:underline", children: "\u0625\u063A\u0644\u0627\u0642" })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 bg-white shadow p-6 rounded-xl", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة" }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0639\u0631\u0628\u064A\u0629*" }), _jsx("input", { value: name_ar, onChange: (e) => setNameAr(e.target.value), className: "w-full border px-3 py-2 rounded", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629" }), _jsx("input", { value: name_en, onChange: (e) => setNameEn(e.target.value), className: "w-full border px-3 py-2 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0648\u0635\u0641" }), _jsx("textarea", { value: description || "", onChange: (e) => setDescription(e.target.value), className: "w-full border px-3 py-2 rounded", rows: 4 })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0642\u0633\u0645*" }), _jsx(Select, { value: departmentId, onChange: (value) => setDepartmentId(value), className: "w-full", options: departments.map(dep => ({
                                    value: dep.id,
                                    label: dep.name
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0642\u0633\u0645", loading: isLoading.departments })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u062A\u0635\u0646\u064A\u0641" }), _jsx(Select, { value: categoryId, onChange: (value) => setCategoryId(value), className: "w-full", options: categories
                                    .filter(cat => !departmentId || cat.department_id === departmentId)
                                    .map(cat => ({
                                    value: cat.id,
                                    label: cat.name_ar
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062A\u0635\u0646\u064A\u0641", loading: isLoading.categories, disabled: !departmentId })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx(Select, { value: is_active, onChange: (value) => setIsActive(value), className: "w-full", options: [
                                    { value: 1, label: "مفعل" },
                                    { value: 0, label: "غير مفعل" }
                                ] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0623\u0648\u0644\u0648\u064A\u0629" }), _jsx("input", { type: "number", value: priority, onChange: (e) => setPriority(Number(e.target.value)), className: "w-full border px-3 py-2 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u062E\u062F\u0645\u0629" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange, className: "block w-full text-sm text-gray-500" }), imagePreview && (_jsx("img", { src: imagePreview, alt: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0635\u0648\u0631\u0629", className: "mt-2 h-32 rounded border object-cover" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(Select, { mode: "multiple", value: selectedBranches, onChange: (values) => setSelectedBranches(values), className: "w-full", options: allBranches.map(branch => ({
                                    value: branch.id,
                                    label: branch.name
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0641\u0631\u0648\u0639", loading: isLoading.branches })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), _jsx(Select, { mode: "multiple", value: selectedDoctors, onChange: (values) => setSelectedDoctors(values), className: "w-full", options: allDoctors.map(doctor => ({
                                    value: doctor.id,
                                    label: doctor.name
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0623\u0637\u0628\u0627\u0621", loading: isLoading.doctors })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: resetForm, className: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400", children: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646" }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", disabled: isLoading.services, children: isLoading.services ? (_jsxs("span", { className: "flex items-center", children: [_jsx("span", { className: "animate-spin mr-2", children: "\u21BB" }), isEditing ? "جاري التحديث..." : "جاري الإضافة..."] })) : isEditing ? "تحديث الخدمة" : "إضافة الخدمة" })] })] }), _jsxs("div", { className: "bg-white shadow p-6 rounded-xl", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), isLoading.services ? (_jsx("div", { className: "flex justify-center p-4", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })) : services.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0645\u0636\u0627\u0641\u0629" })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: services.map((service) => {
                            const serviceCategory = categories.find(cat => cat.id === service.category_id);
                            const serviceDepartment = departments.find(dep => dep.id === service.department_id);
                            const serviceDoctors = service.doctors_ids
                                .map(id => allDoctors.find(d => d.id === id))
                                .filter(Boolean);
                            const serviceBranches = service.branches
                                .map(id => allBranches.find(b => b.id === id))
                                .filter(Boolean);
                            return (_jsx(ServiceCard, { service: {
                                    id: service.id,
                                    name_ar: service.name_ar,
                                    name_en: service.name_en,
                                    description: service.description,
                                    image: service.image,
                                    is_active: service.is_active,
                                    priority: service.priority,
                                    created_at: service.created_at,
                                    updated_at: service.updated_at,
                                    department: serviceDepartment,
                                    category: serviceCategory ? {
                                        id: serviceCategory.id,
                                        name_ar: serviceCategory.name_ar,
                                        name_en: serviceCategory.name_en
                                    } : undefined,
                                    doctors: serviceDoctors,
                                    branches: serviceBranches
                                }, onEdit: () => {
                                    setIsEditing(true);
                                    setEditingService(service);
                                    setNameAr(service.name_ar);
                                    setNameEn(service.name_en || "");
                                    setDescription(service.description || "");
                                    setDepartmentId(service.department_id);
                                    setCategoryId(service.category_id);
                                    setIsActive(service.is_active);
                                    setPriority(service.priority);
                                    setSelectedBranches(service.branches);
                                    setSelectedDoctors(service.doctors_ids);
                                    setImagePreview(service.image ? `https://www.ss.mastersclinics.com${service.image}` : undefined);
                                    window.scrollTo({ top: 0, behavior: "smooth" });
                                }, onDelete: () => handleDelete(service.id) }, service.id));
                        }) }))] })] }));
}
