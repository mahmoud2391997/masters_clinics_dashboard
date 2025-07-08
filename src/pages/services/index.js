import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import ServiceCard from "../../components/serviceCard";
import { message, Select } from "antd";
export default function AddService() {
    // Form state
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [description, setDescription] = useState("");
    const [capabilities, setCapabilities] = useState([]);
    const [approach, setApproach] = useState("");
    const [departmentId, setDepartmentId] = useState();
    const [newCapability, setNewCapability] = useState("");
    // Media state
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    // Selection state
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    // Data state
    const [services, setServices] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [allBranches, setAllBranches] = useState([]);
    // UI state
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [isLoading, setIsLoading] = useState({
        services: false,
        departments: false,
        doctors: false,
        branches: false
    });
    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading({
                    services: true,
                    departments: true,
                    doctors: true,
                    branches: true
                });
                // Fetch all data in parallel
                const [servicesRes, departmentsRes, doctorsRes, branchesRes] = await Promise.all([
                    fetch("http://localhost:3000/services", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("http://localhost:3000/departments", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("http://localhost:3000/doctors", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    }),
                    fetch("http://localhost:3000/branches", {
                        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` }
                    })
                ]);
                if (!servicesRes.ok)
                    throw new Error("فشل تحميل الخدمات");
                if (!departmentsRes.ok)
                    throw new Error("فشل تحميل الأقسام");
                if (!doctorsRes.ok)
                    throw new Error("فشل تحميل الأطباء");
                if (!branchesRes.ok)
                    throw new Error("فشل تحميل الفروع");
                const servicesData = await servicesRes.json();
                const departmentsData = await departmentsRes.json();
                const doctorsData = await doctorsRes.json();
                const branchesData = await branchesRes.json();
                // Normalize services data
                const normalizedServices = servicesData.map((service) => ({
                    ...service,
                    id: String(service.id),
                    branches: service.branches ? JSON.parse(service.branches) : [],
                    doctors_ids: service.doctors_ids ? JSON.parse(service.doctors_ids) : [],
                    capabilities: service.capabilities ? JSON.parse(service.capabilities) : [],
                    department_id: service.department_id || undefined
                }));
                setServices(normalizedServices);
                setDepartments(departmentsData);
                setAllDoctors(doctorsData.map((d) => ({ ...d, id: String(d.id) })));
                setAllBranches(branchesData.map((b) => ({ ...b, id: String(b.id) })));
            }
            catch (err) {
                setError(err instanceof Error ? err.message : "فشل تحميل البيانات");
                console.error("Error fetching data:", err);
            }
            finally {
                setIsLoading({
                    services: false,
                    departments: false,
                    doctors: false,
                    branches: false
                });
            }
        };
        fetchData();
    }, []);
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("يرجى رفع صورة بصيغة صحيحة (JPEG, PNG, GIF)");
            return;
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("حجم الصورة يجب أن يكون أقل من 5 ميجا");
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
        setTitle("");
        setSubtitle("");
        setDescription("");
        setCapabilities([]);
        setApproach("");
        setDepartmentId(undefined);
        setImageFile(null);
        setImagePreview(undefined);
        setSelectedBranches([]);
        setSelectedDoctors([]);
        setIsEditing(false);
        setEditingService(null);
    };
    const handleAddCapability = () => {
        if (newCapability.trim()) {
            setCapabilities([...capabilities, newCapability.trim()]);
            setNewCapability("");
        }
    };
    const handleRemoveCapability = (index) => {
        setCapabilities(capabilities.filter((_, i) => i !== index));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(prev => ({ ...prev, services: true }));
        const formData = new FormData();
        formData.append("title", title);
        formData.append("subtitle", subtitle || "");
        formData.append("description", description);
        formData.append("capabilities", JSON.stringify(capabilities));
        formData.append("approach", approach);
        formData.append("doctors_ids", JSON.stringify(selectedDoctors));
        formData.append("branches", JSON.stringify(selectedBranches));
        if (departmentId)
            formData.append("department_id", departmentId.toString());
        if (imageFile)
            formData.append("image", imageFile);
        try {
            const url = isEditing && editingService
                ? `http://localhost:3000/services/${editingService.id}`
                : "http://localhost:3000/services";
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
                throw new Error(errorData.message || (isEditing ? "فشل تحديث الخدمة" : "فشل إضافة الخدمة"));
            }
            const savedService = await response.json();
            const normalizedService = {
                ...savedService,
                id: String(savedService.id),
                branches: savedService.branches ? JSON.parse(savedService.branches) : [],
                doctors_ids: savedService.doctors_ids ? JSON.parse(savedService.doctors_ids) : [],
                capabilities: savedService.capabilities ? JSON.parse(savedService.capabilities) : [],
                department_id: savedService.department_id || undefined
            };
            setServices(prev => isEditing
                ? prev.map(s => s.id === normalizedService.id ? normalizedService : s)
                : [...prev, normalizedService]);
            resetForm();
            message.success(isEditing ? "تم تحديث الخدمة بنجاح" : "تم إضافة الخدمة بنجاح");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "فشل حفظ الخدمة");
            console.error(err);
        }
        finally {
            setIsLoading(prev => ({ ...prev, services: false }));
        }
    };
    const handleDelete = async (id) => {
        if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟"))
            return;
        try {
            const response = await fetch(`http://localhost:3000/services/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`
                }
            });
            if (!response.ok)
                throw new Error("فشل حذف الخدمة");
            setServices(prev => prev.filter(service => service.id !== id));
            message.success("تم حذف الخدمة بنجاح");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "فشل حذف الخدمة");
            console.error(err);
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-4 space-y-6", dir: "rtl", children: [error && (_jsxs("div", { className: "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded", children: [_jsx("p", { children: error }), _jsx("button", { onClick: () => setError(null), className: "mt-1 text-yellow-700 hover:underline", children: "\u0625\u063A\u0644\u0627\u0642" })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 bg-white shadow p-6 rounded-xl", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة" }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646*" }), _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value), className: "w-full border px-3 py-2 rounded", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639\u064A" }), _jsx("input", { value: subtitle, onChange: (e) => setSubtitle(e.target.value), className: "w-full border px-3 py-2 rounded" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0648\u0635\u0641*" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), className: "w-full border px-3 py-2 rounded", rows: 4, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0645\u0645\u064A\u0632\u0627\u062A" }), _jsxs("div", { className: "flex gap-2 mb-2", children: [_jsx("input", { value: newCapability, onChange: (e) => setNewCapability(e.target.value), className: "flex-1 border px-3 py-2 rounded", placeholder: "\u0623\u0636\u0641 \u0645\u0645\u064A\u0632\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx("button", { type: "button", onClick: handleAddCapability, className: "bg-blue-500 text-white px-4 py-2 rounded", children: "\u0625\u0636\u0627\u0641\u0629" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: capabilities.map((cap, index) => (_jsxs("div", { className: "bg-gray-100 px-3 py-1 rounded-full flex items-center", children: [cap, _jsx("button", { type: "button", onClick: () => handleRemoveCapability(index), className: "mr-2 text-red-500", children: "\u00D7" })] }, index))) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0646\u0647\u062C \u0627\u0644\u0645\u062A\u0628\u0639*" }), _jsx("textarea", { value: approach, onChange: (e) => setApproach(e.target.value), className: "w-full border px-3 py-2 rounded", rows: 4, required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0642\u0633\u0645" }), _jsx(Select, { value: departmentId, onChange: (value) => setDepartmentId(value), className: "w-full", options: departments.map(dep => ({
                                    value: dep.id,
                                    label: dep.name
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0642\u0633\u0645", allowClear: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u062E\u062F\u0645\u0629" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange, className: "block w-full text-sm text-gray-500" }), imagePreview && (_jsx("img", { src: imagePreview, alt: "\u0645\u0639\u0627\u064A\u0646\u0629 \u0627\u0644\u0635\u0648\u0631\u0629", className: "mt-2 h-32 rounded border object-cover" }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(Select, { mode: "multiple", value: selectedBranches, onChange: (values) => setSelectedBranches(values), className: "w-full", options: allBranches.map(branch => ({
                                    value: branch.id,
                                    label: branch.name
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0641\u0631\u0648\u0639", loading: isLoading.branches })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), _jsx(Select, { mode: "multiple", value: selectedDoctors, onChange: (values) => setSelectedDoctors(values), className: "w-full", options: allDoctors.map(doctor => ({
                                    value: doctor.id,
                                    label: doctor.name
                                })), placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0623\u0637\u0628\u0627\u0621", loading: isLoading.doctors })] }), _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: resetForm, className: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400", children: "\u0625\u0639\u0627\u062F\u0629 \u062A\u0639\u064A\u064A\u0646" }), _jsx("button", { type: "submit", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", disabled: isLoading.services, children: isLoading.services ? (_jsxs("span", { className: "flex items-center", children: [_jsx("span", { className: "animate-spin mr-2", children: "\u21BB" }), isEditing ? "جاري التحديث..." : "جاري الإضافة..."] })) : isEditing ? "تحديث الخدمة" : "إضافة الخدمة" })] })] }), _jsxs("div", { className: "bg-white shadow p-6 rounded-xl", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), isLoading.services ? (_jsx("div", { className: "flex justify-center p-4", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" }) })) : services.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0645\u0636\u0627\u0641\u0629" })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: services.map((service) => (_jsx(ServiceCard, { category: {
                                id: service.id,
                                name: service.title,
                                description: service.description,
                                imageUrl: service.image ? `http://localhost:3000${service.image}` : "",
                                capabilities: service.capabilities,
                                approach: service.approach,
                                doctors: service.doctors_ids.map(id => {
                                    const doctor = allDoctors.find(d => d.id === id);
                                    return { id, name: doctor?.name || "غير معروف" };
                                }),
                                branches: service.branches.map(id => {
                                    const branch = allBranches.find(b => b.id === id);
                                    return { id, name: branch?.name || "غير معروف" };
                                }),
                                department: service.department_id
                                    ? departments.find(d => d.id === service.department_id)?.name
                                    : undefined
                            }, handleEdit: () => {
                                setIsEditing(true);
                                setEditingService(service);
                                setTitle(service.title);
                                setSubtitle(service.subtitle || "");
                                setDescription(service.description);
                                setCapabilities(service.capabilities);
                                setApproach(service.approach);
                                setDepartmentId(service.department_id);
                                setSelectedBranches(service.branches);
                                setSelectedDoctors(service.doctors_ids);
                                setImagePreview(service.image ? `http://localhost:3000${service.image}` : undefined);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }, handleDelete: () => handleDelete(service.id) }, service.id))) }))] })] }));
}
