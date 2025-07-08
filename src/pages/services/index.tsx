import { useState, useEffect } from "react";
import ServiceCard from "../../components/serviceCard";
import { message, Select } from "antd";

interface Service {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  capabilities: string[];
  approach: string;
  doctors_ids: string[];
  branches: string[];
  department_id?: number;
  image?: string;
  created_at?: string;
  updated_at?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function AddService() {
  // Form state
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [approach, setApproach] = useState("");
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [newCapability, setNewCapability] = useState("");

  // Media state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>("");
  
  // Selection state
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [allBranches, setAllBranches] = useState<Branch[]>([]);

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
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

        if (!servicesRes.ok) throw new Error("فشل تحميل الخدمات");
        if (!departmentsRes.ok) throw new Error("فشل تحميل الأقسام");
        if (!doctorsRes.ok) throw new Error("فشل تحميل الأطباء");
        if (!branchesRes.ok) throw new Error("فشل تحميل الفروع");

        const servicesData = await servicesRes.json();
        const departmentsData = await departmentsRes.json();
        const doctorsData = await doctorsRes.json();
        const branchesData = await branchesRes.json();

        // Normalize services data
        const normalizedServices = servicesData.map((service: any) => ({
          ...service,
          id: String(service.id),
          branches: service.branches ? JSON.parse(service.branches) : [],
          doctors_ids: service.doctors_ids ? JSON.parse(service.doctors_ids) : [],
          capabilities: service.capabilities ? JSON.parse(service.capabilities) : [],
          department_id: service.department_id || undefined
        }));

        setServices(normalizedServices);
        setDepartments(departmentsData);
        setAllDoctors(doctorsData.map((d: any) => ({ ...d, id: String(d.id) })));
        setAllBranches(branchesData.map((b: any) => ({ ...b, id: String(b.id) })));

      } catch (err) {
        setError(err instanceof Error ? err.message : "فشل تحميل البيانات");
        console.error("Error fetching data:", err);
      } finally {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setImagePreview(reader.result as string);
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

  const handleRemoveCapability = (index: number) => {
    setCapabilities(capabilities.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(prev => ({...prev, services: true}));

    const formData = new FormData();
    formData.append("title", title);
    formData.append("subtitle", subtitle || "");
    formData.append("description", description);
    formData.append("capabilities", JSON.stringify(capabilities));
    formData.append("approach", approach);
    formData.append("doctors_ids", JSON.stringify(selectedDoctors));
    formData.append("branches", JSON.stringify(selectedBranches));
    if (departmentId) formData.append("department_id", departmentId.toString());
    if (imageFile) formData.append("image", imageFile);

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

      setServices(prev => 
        isEditing
          ? prev.map(s => s.id === normalizedService.id ? normalizedService : s)
          : [...prev, normalizedService]
      );

      resetForm();
      message.success(isEditing ? "تم تحديث الخدمة بنجاح" : "تم إضافة الخدمة بنجاح");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حفظ الخدمة");
      console.error(err);
    } finally {
      setIsLoading(prev => ({...prev, services: false}));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;

    try {
      const response = await fetch(`http://localhost:3000/services/${id}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${sessionStorage.getItem("token")}`
        }
      });

      if (!response.ok) throw new Error("فشل حذف الخدمة");

      setServices(prev => prev.filter(service => service.id !== id));
      message.success("تم حذف الخدمة بنجاح");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الخدمة");
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="mt-1 text-yellow-700 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
        </h2>

        <div>
          <label className="block text-gray-700">العنوان*</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">العنوان الفرعي</label>
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700">الوصف*</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">المميزات</label>
          <div className="flex gap-2 mb-2">
            <input
              value={newCapability}
              onChange={(e) => setNewCapability(e.target.value)}
              className="flex-1 border px-3 py-2 rounded"
              placeholder="أضف مميزة جديدة"
            />
            <button
              type="button"
              onClick={handleAddCapability}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              إضافة
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {capabilities.map((cap, index) => (
              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                {cap}
                <button
                  type="button"
                  onClick={() => handleRemoveCapability(index)}
                  className="mr-2 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-gray-700">النهج المتبع*</label>
          <textarea
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-gray-700">القسم</label>
          <Select
            value={departmentId}
            onChange={(value) => setDepartmentId(value)}
            className="w-full"
            options={departments.map(dep => ({
              value: dep.id,
              label: dep.name
            }))}
            placeholder="اختر القسم"
            allowClear
          />
        </div>

        <div>
          <label className="block text-gray-700">صورة الخدمة</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500"
          />
          {imagePreview && (
            <img
              src={imagePreview}
              alt="معاينة الصورة"
              className="mt-2 h-32 rounded border object-cover"
            />
          )}
        </div>

        <div>
          <label className="block text-gray-700">الفروع</label>
          <Select
            mode="multiple"
            value={selectedBranches}
            onChange={(values) => setSelectedBranches(values)}
            className="w-full"
            options={allBranches.map(branch => ({
              value: branch.id,
              label: branch.name
            }))}
            placeholder="اختر الفروع"
            loading={isLoading.branches}
          />
        </div>

        <div>
          <label className="block text-gray-700">الأطباء</label>
          <Select
            mode="multiple"
            value={selectedDoctors}
            onChange={(values) => setSelectedDoctors(values)}
            className="w-full"
            options={allDoctors.map(doctor => ({
              value: doctor.id,
              label: doctor.name
            }))}
            placeholder="اختر الأطباء"
            loading={isLoading.doctors}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={resetForm}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            إعادة تعيين
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={isLoading.services}
          >
            {isLoading.services ? (
              <span className="flex items-center">
                <span className="animate-spin mr-2">↻</span>
                {isEditing ? "جاري التحديث..." : "جاري الإضافة..."}
              </span>
            ) : isEditing ? "تحديث الخدمة" : "إضافة الخدمة"}
          </button>
        </div>
      </form>

      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">الخدمات</h3>
        {isLoading.services ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : services.length === 0 ? (
          <p className="text-gray-500">لا توجد خدمات مضافة</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                category={{
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
                }}
                handleEdit={() => {
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
                }}
                handleDelete={() => handleDelete(service.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}