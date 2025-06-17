import { useState, useEffect } from "react";
import ServiceCard from "../../components/serviceCard";
import { message } from "antd";

interface Service {
  _id: string;
  id: number;
  name: string;
  description: string;
  image?: string;
  doctors_ids: string[];
  branches: string[];
}

interface Doctor {
  id: string;
  name: string;
  branches: string[];
}

export default function AddService() {
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>("");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([]);
  const [selectedDoctorNames, setSelectedDoctorNames] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Data loading
  const [services, setServices] = useState<Service[]>([]);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [availableBranches, setAvailableBranches] = useState<{ name: string }[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  const [isLoading, setIsLoading] = useState({
    doctors: false,
    branches: false,
    services: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading({ doctors: true, branches: true, services: true });
        setError(null);

        // Fetch doctors
        const doctorsRes = await fetch("http://localhost:3000/doctors", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (!doctorsRes.ok) throw new Error("فشل تحميل بيانات الأطباء");
        const doctorsDataRaw: Doctor[] = await doctorsRes.json();
        setAllDoctors(doctorsDataRaw);

        // Extract unique branch names
        const uniqueBranchNames = Array.from(
          new Set(doctorsDataRaw.flatMap((d) => d.branches))
        );
        const branchObjects = uniqueBranchNames.map((name) => ({
          name,
        }));
        setAvailableBranches(branchObjects);

        // Fetch services
        const servicesRes = await fetch("http://localhost:3000/services", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });
        if (!servicesRes.ok) throw new Error("فشل تحميل بيانات الخدمات");
        const servicesData = await servicesRes.json();
        setServices(servicesData);
      } catch (err) {
        setError("فشل تحميل البيانات الأولية. لا يزال بإمكانك إضافة خدمات.");
        console.error("خطأ أثناء جلب البيانات:", err);
      } finally {
        setIsLoading({ doctors: false, branches: false, services: false });
      }
    };

    fetchData();
  }, []);

  // Filter doctors by selected branches
  useEffect(() => {
    if (selectedBranches.length === 0) {
      setFilteredDoctors(allDoctors);
    } else {
      const filtered = allDoctors.filter((doctor) =>
        doctor.branches.some((branchName) => selectedBranches.includes(branchName))
      );
      setFilteredDoctors(filtered);
    }
  }, [selectedBranches, allDoctors]);

  // Handle image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      setImagePreview(reader.result as string);
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
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);
    formData.append("doctors_ids", JSON.stringify(selectedDoctors));
    formData.append("branches", JSON.stringify(selectedBranches));

    try {
      const response = await fetch("http://localhost:3000/services", {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل إضافة الخدمة");
      console.error(err);
    }
  };

  // Edit existing service
  const handleEditService = async () => {
    if (!editingService || !name || !description || selectedDoctors.length === 0) return;

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);
    formData.append("doctors_ids", JSON.stringify(selectedDoctors));
    formData.append("branches", JSON.stringify(selectedBranches));

    try {
      const serviceId = editingService._id || String(editingService.id);
      const response = await fetch(`http://localhost:3000/services/${serviceId}`, {
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
      setServices((prev) =>
        prev.map((s) =>
          s._id === updatedService._id || s.id === updatedService.id
            ? updatedService
            : s
        )
      );

      message.success("تم تحديث الخدمة بنجاح");
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل تعديل الخدمة");
      console.error(err);
    }
  };

  // Delete service
  const handleDeleteService = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذه الخدمة؟")) return;

    try {
      const response = await fetch(`http://localhost:3000/services/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("فشل حذف الخدمة");

      setServices((prev) => prev.filter((service) => service.id !== id));
      message.success("تم حذف الخدمة بنجاح");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل حذف الخدمة");
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6" dir="rtl">
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="mt-1 text-yellow-700 hover:underline">
            إغلاق
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      <form onSubmit={handleAddService} className="space-y-4 bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-gray-800">
          {isEditing ? "تعديل الخدمة" : "إضافة خدمة جديدة"}
        </h2>

        {/* Name */}
        <div>
          <label className="block text-gray-700">الاسم</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700">الوصف</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-gray-700">الصورة</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {imagePreview && (
            <img src={imagePreview} alt="معاينة" className="mt-2 h-32 rounded border" />
          )}
        </div>

        {/* Branch Selection */}
        <div className="relative">
          <select
            value=""
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => {
              const value = e.target.value;
              if (!selectedBranches.includes(value)) {
                setSelectedBranches([...selectedBranches, value]);
              }
            }}
          >
            <option value="" disabled>اختر فرع</option>
            {availableBranches.map((branch) => (
              <option key={branch.name} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </select>

          {/* Selected Branch Tags */}
          {selectedBranches.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedBranches.map((branch) => (
                <span
                  key={branch}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {branch}
                  <button
                    onClick={() => {
                      const updatedBranches = selectedBranches.filter((b) => b !== branch);
                      setSelectedBranches(updatedBranches);
                      const updatedDoctors: string[] = [];
                      const updatedDoctorNames: string[] = [];
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
                    }}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Doctor Selection */}
        <div>
          <label className="block text-gray-700">الأطباء</label>
          {isLoading.doctors ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <span>جارٍ تحميل الأطباء...</span>
            </div>
          ) : (
            <>
              <div className="relative">
                <select
                  value=""
                  onChange={(e) => {
                    const value = e.target.value;
                    const doctor = filteredDoctors.find((d) => d.id === value);
                    if (doctor && !selectedDoctors.includes(doctor.id)) {
                      setSelectedDoctors([...selectedDoctors, doctor.id]);
                      setSelectedDoctorNames([...selectedDoctorNames, doctor.name]);
                    }
                  }}
                  disabled={selectedBranches.length === 0}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="" disabled>
                    {selectedBranches.length === 0 ? "اختر فرع أولًا" : "اختر طبيبًا لإضافته"}
                  </option>
                  {filteredDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.branches.join(", ")})
                    </option>
                  ))}
                </select>

                {/* Selected Doctors Tags */}
                {selectedDoctors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedDoctorNames.map((name, index) => (
                      <span
                        key={name}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center"
                      >
                        {name}
                        <button
                          onClick={() => {
                            const idToRemove = selectedDoctors[index];
                            setSelectedDoctors(selectedDoctors.filter((id) => id !== idToRemove));
                            setSelectedDoctorNames(selectedDoctorNames.filter((n) => n !== name));
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          {isEditing ? (
            <div>
              <button
                type="button"
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 mr-2"
                onClick={handleEditService}
                disabled={selectedDoctors.length === 0 || !name || !description}
              >
                تحديث الخدمة
              </button>
              <button
                type="button"
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
                onClick={resetForm}
              >
                إلغاء
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              إضافة خدمة
            </button>
          )}
        </div>
      </form>

      {/* Services List */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">الخدمات</h3>
        {isLoading.services ? (
          <div className="flex items-center justify-center p-4">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="mr-2">جارٍ تحميل الخدمات...</span>
          </div>
        ) : services.length === 0 ? (
          <p className="text-gray-500">لا توجد خدمات مضافة حتى الآن</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service._id || service.id}
                category={{
                  id: service._id || service.id,
                  name: service.name,
                  description: service.description,
                  imageUrl: service.image || "",
                  doctors: allDoctors.filter((d) => service.doctors_ids.includes(d.id)),
                  branches: service.branches.map((b) => ({ name: b })),
                }}
                handleEdit={() => {
                  setIsEditing(true);
                  setEditingService(service);
                  setName(service.name);
                  setDescription(service.description);
                  setImagePreview(service.image);
                  setSelectedBranches(service.branches);
                  setSelectedDoctors(service.doctors_ids);
                  const doctorNames = service.doctors_ids
                    .map((id) => allDoctors.find((d) => d.id === id)?.name)
                    .filter(Boolean) as string[];
                  setSelectedDoctorNames(doctorNames);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                handleDelete={() => handleDeleteService(service.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}