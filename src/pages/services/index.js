import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import ServiceCard from "../../components/serviceCard";
import { message } from "antd";
export default function AddService() {
    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [selectedBranches, setSelectedBranches] = useState([]);
    const [selectedDoctors, setSelectedDoctors] = useState([]);
    const [selectedDoctorNames, setSelectedDoctorNames] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    // Data loading
    const [services, setServices] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [availableBranches, setAvailableBranches] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [isLoading, setIsLoading] = useState({
        doctors: false,
        branches: false,
        services: false,
    });
    const [error, setError] = useState(null);
    const [editingService, setEditingService] = useState(null);
    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading({ doctors: true, branches: true, services: true });
                setError(null);
                // Fetch doctors
                const doctorsRes = await fetch("https://www.ss.mastersclinics.com/doctors", {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                });
                if (!doctorsRes.ok)
                    throw new Error("فشل تحميل بيانات الأطباء");
                const doctorsDataRaw = await doctorsRes.json();
                setAllDoctors(doctorsDataRaw);
                // Extract unique branch names
                const uniqueBranchNames = Array.from(new Set(doctorsDataRaw.flatMap((d) => d.branches)));
                const branchObjects = uniqueBranchNames.map((name) => ({
                    name,
                }));
                setAvailableBranches(branchObjects);
                // Fetch services
                const servicesRes = await fetch("https://www.ss.mastersclinics.com/services", {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                });
                if (!servicesRes.ok)
                    throw new Error("فشل تحميل بيانات الخدمات");
                const servicesData = await servicesRes.json();
                setServices(servicesData);
            }
            catch (err) {
                setError("فشل تحميل البيانات الأولية. لا يزال بإمكانك إضافة خدمات.");
                console.error("خطأ أثناء جلب البيانات:", err);
            }
            finally {
                setIsLoading({ doctors: false, branches: false, services: false });
            }
        };
        fetchData();
    }, []);
    // Filter doctors by selected branches
    useEffect(() => {
        if (selectedBranches.length === 0) {
            setFilteredDoctors(allDoctors);
        }
        else {
            const filtered = allDoctors.filter((doctor) => doctor.branches.some((branchName) => selectedBranches.includes(branchName)));
            setFilteredDoctors(filtered);
        }
    }, [selectedBranches, allDoctors]);
    // Handle image change
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
            setError("يرجى رفع صورة صالحة (JPEG، PNG، GIF)");
            return;
        }
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError("يجب أن تكون الصورة أقل من 5 ميجا بايت");
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
    // Reset form fields
    const resetForm = () => {
        setName("");
        setDescription("");
        setImageFile(null);
        setImagePreview(undefined);
        setSelectedBranches([]);
        setSelectedDoctors([]);
        setSelectedDoctorNames([]);
        setIsEditing(false);
        setEditingService(null);
    };
    // Add new service
    const handleAddService = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        if (imageFile)
            formData.append("image", imageFile);
        formData.append("doctors_ids", JSON.stringify(selectedDoctors));
        formData.append("branches", JSON.stringify(selectedBranches));
        try {
            const response = await fetch("https://www.ss.mastersclinics.com/services", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "فشل إضافة الخدمة");
            }
            const savedService = await response.json();
            setServices((prev) => [...prev, savedService]);
            resetForm();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "فشل إضافة الخدمة");
            console.error(err);
        }
    };
    // Edit existing service
    const handleEditService = async () => {
        if (!editingService || !name || !description || selectedDoctors.length === 0)
            return;
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        if (imageFile)
            formData.append("image", imageFile);
        formData.append("doctors_ids", JSON.stringify(selectedDoctors));
        formData.append("branches", JSON.stringify(selectedBranches));
        try {
            const serviceId = editingService._id || String(editingService.id);
            const response = await fetch(`https://www.ss.mastersclinics.com/services/${serviceId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "فشل تعديل الخدمة");
            }
            const updatedService = await response.json();
            setServices((prev) => prev.map((s) => s._id === updatedService._id || s.id === updatedService.id
                ? updatedService
                : s));
            message.success("تم تحديث الخدمة بنجاح");
            resetForm();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "فشل تعديل الخدمة");
            console.error(err);
        }
    };
    // Delete service
    const handleDeleteService = async (id) => {
        if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الخدمة؟"))
            return;
        try {
            const response = await fetch(`https://www.ss.mastersclinics.com/services/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            if (!response.ok)
                throw new Error("فشل حذف الخدمة");
            setServices((prev) => prev.filter((service) => service.id !== id));
            message.success("تم حذف الخدمة بنجاح");
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "فشل حذف الخدمة");
            console.error(err);
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto p-4 space-y-6", dir: "rtl", children: [error && (_jsxs("div", { className: "bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded", children: [_jsx("p", { children: error }), _jsx("button", { onClick: () => setError(null), className: "mt-1 text-yellow-700 hover:underline", children: "\u0625\u063A\u0644\u0627\u0642" })] })), _jsxs("form", { onSubmit: handleAddService, className: "space-y-4 bg-white shadow p-6 rounded-xl", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-800", children: isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة" }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("input", { value: name, onChange: (e) => setName(e.target.value), className: "w-full border px-3 py-2 rounded", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0648\u0635\u0641" }), _jsx("textarea", { value: description, onChange: (e) => setDescription(e.target.value), className: "w-full border px-3 py-2 rounded", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0635\u0648\u0631\u0629" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange, className: "block w-full text-sm text-gray-500\n              file:mr-4 file:py-2 file:px-4\n              file:rounded file:border-0\n              file:text-sm file:font-semibold\n              file:bg-blue-50 file:text-blue-700\n              hover:file:bg-blue-100" }), imagePreview && (_jsx("img", { src: imagePreview, alt: "\u0645\u0639\u0627\u064A\u0646\u0629", className: "mt-2 h-32 rounded border" }))] }), _jsxs("div", { className: "relative", children: [_jsxs("select", { value: "", className: "w-full border px-3 py-2 rounded", onChange: (e) => {
                                    const value = e.target.value;
                                    if (!selectedBranches.includes(value)) {
                                        setSelectedBranches([...selectedBranches, value]);
                                    }
                                }, children: [_jsx("option", { value: "", disabled: true, children: "\u0627\u062E\u062A\u0631 \u0641\u0631\u0639" }), availableBranches.map((branch) => (_jsx("option", { value: branch.name, children: branch.name }, branch.name)))] }), selectedBranches.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: selectedBranches.map((branch) => (_jsxs("span", { className: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center", children: [branch, _jsx("button", { onClick: () => {
                                                const updatedBranches = selectedBranches.filter((b) => b !== branch);
                                                setSelectedBranches(updatedBranches);
                                                const updatedDoctors = [];
                                                const updatedDoctorNames = [];
                                                filteredDoctors.forEach((doctor) => {
                                                    if (doctor.branches.some((b) => updatedBranches.includes(b))) {
                                                        if (selectedDoctors.includes(doctor.id)) {
                                                            updatedDoctors.push(doctor.id);
                                                            updatedDoctorNames.push(doctor.name);
                                                        }
                                                    }
                                                });
                                                setSelectedDoctors(updatedDoctors);
                                                setSelectedDoctorNames(updatedDoctorNames);
                                            }, className: "ml-2 text-red-500 hover:text-red-700", children: "\u00D7" })] }, branch))) }))] }), _jsxs("div", { children: [_jsx("label", { className: "block text-gray-700", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), isLoading.doctors ? (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("div", { className: "w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" }), _jsx("span", { children: "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0623\u0637\u0628\u0627\u0621..." })] })) : (_jsx(_Fragment, { children: _jsxs("div", { className: "relative", children: [_jsxs("select", { value: "", onChange: (e) => {
                                                const value = e.target.value;
                                                const doctor = filteredDoctors.find((d) => d.id === value);
                                                if (doctor && !selectedDoctors.includes(doctor.id)) {
                                                    setSelectedDoctors([...selectedDoctors, doctor.id]);
                                                    setSelectedDoctorNames([...selectedDoctorNames, doctor.name]);
                                                }
                                            }, disabled: selectedBranches.length === 0, className: "w-full border px-3 py-2 rounded", children: [_jsx("option", { value: "", disabled: true, children: selectedBranches.length === 0 ? "اختر فرع أولًا" : "اختر طبيبًا لإضافته" }), filteredDoctors.map((doctor) => (_jsxs("option", { value: doctor.id, children: [doctor.name, " (", doctor.branches.join(", "), ")"] }, doctor.id)))] }), selectedDoctors.length > 0 && (_jsx("div", { className: "flex flex-wrap gap-2 mt-2", children: selectedDoctorNames.map((name, index) => (_jsxs("span", { className: "bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center", children: [name, _jsx("button", { onClick: () => {
                                                            const idToRemove = selectedDoctors[index];
                                                            setSelectedDoctors(selectedDoctors.filter((id) => id !== idToRemove));
                                                            setSelectedDoctorNames(selectedDoctorNames.filter((n) => n !== name));
                                                        }, className: "ml-2 text-red-500 hover:text-red-700", children: "\u00D7" })] }, name))) }))] }) }))] }), _jsx("div", { className: "flex justify-end", children: isEditing ? (_jsxs("div", { children: [_jsx("button", { type: "button", className: "bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2", onClick: handleEditService, disabled: selectedDoctors.length === 0 || !name || !description, children: "\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062E\u062F\u0645\u0629" }), _jsx("button", { type: "button", className: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400", onClick: resetForm, children: "\u0625\u0644\u063A\u0627\u0621" })] })) : (_jsx("button", { type: "submit", className: "bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700", children: "\u0625\u0636\u0627\u0641\u0629 \u062E\u062F\u0645\u0629" })) })] }), _jsxs("div", { className: "bg-white shadow p-6 rounded-xl", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-800 mb-4", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), isLoading.services ? (_jsxs("div", { className: "flex items-center justify-center p-4", children: [_jsx("div", { className: "w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" }), _jsx("span", { className: "mr-2", children: "\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u062E\u062F\u0645\u0627\u062A..." })] })) : services.length === 0 ? (_jsx("p", { className: "text-gray-500", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u062E\u062F\u0645\u0627\u062A \u0645\u0636\u0627\u0641\u0629 \u062D\u062A\u0649 \u0627\u0644\u0622\u0646" })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: services.map((service) => (_jsx(ServiceCard, { category: {
                                id: service._id || service.id,
                                name: service.name,
                                description: service.description,
                                imageUrl: service.image || "",
                                doctors: allDoctors.filter((d) => service.doctors_ids.includes(d.id)),
                                branches: service.branches.map((b) => ({ name: b })),
                            }, handleEdit: () => {
                                setIsEditing(true);
                                setEditingService(service);
                                setName(service.name);
                                setDescription(service.description);
                                setImagePreview(service.image);
                                setSelectedBranches(service.branches);
                                setSelectedDoctors(service.doctors_ids);
                                const doctorNames = service.doctors_ids
                                    .map((id) => allDoctors.find((d) => d.id === id)?.name)
                                    .filter(Boolean);
                                setSelectedDoctorNames(doctorNames);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }, handleDelete: () => handleDeleteService(service.id) }, service._id || service.id))) }))] })] }));
}
