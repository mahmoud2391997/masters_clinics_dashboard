"use client";
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Table, Tag, Space, Button, Modal, Form, Input, Select, TimePicker, DatePicker, Upload, message, Image, ConfigProvider, } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBranches } from "../../api/regions&branches";
import { fetchDepartments } from "../../api/departments";
import moment from "moment";
import arabic from "antd/lib/locale/ar_EG";
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices";
const { Option } = Select;
const { TextArea } = Input;
// Arabic translations
const arabicText = {
    deviceImage: "صورة الجهاز",
    deviceName: "اسم الجهاز",
    description: "الوصف",
    departments: "الأقسام",
    branches: "الفروع",
    workingTimeSlots: "مواعيد العمل",
    sessionPeriod: "مدة الجلسة (دقيقة)",
    actions: "الإجراءات",
    addDevice: "إضافة جهاز",
    editDevice: "تعديل جهاز",
    delete: "حذف",
    edit: "تعديل",
    singleDate: "تاريخ واحد",
    dateRange: "نطاق زمني",
    startDay: "يوم البدء",
    endDay: "يوم الانتهاء",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",
    remove: "إزالة",
    addTimeSlot: "إضافة موعد عمل",
    confirmDelete: "تأكيد الحذف",
    deleteConfirmMessage: "هل أنت متأكد من رغبتك في حذف هذا الجهاز؟",
    deviceNameRequired: "يرجى إدخال اسم الجهاز!",
    descriptionRequired: "يرجى إدخال وصف الجهاز!",
    departmentsRequired: "يرجى اختيار الأقسام!",
    branchesRequired: "يرجى اختيار الفروع!",
    sessionPeriodRequired: "يرجى إدخال مدة الجلسة!",
    missingType: "النوع مطلوب",
    missingDate: "التاريخ مطلوب",
    missingTime: "الوقت مطلوب",
    missingDay: "اليوم مطلوب",
    operationFailed: "فشلت العملية",
    deviceAdded: "تم إضافة الجهاز بنجاح",
    deviceUpdated: "تم تحديث الجهاز بنجاح",
    deviceDeleted: "تم حذف الجهاز بنجاح",
    uploadImage: "رفع صورة",
    imageRequirements: "يجب أن تكون الصورة أقل من 5MB وبصيغة صورة",
    medicalDevices: "الأجهزة الطبية",
    to: "إلى",
    cancel: "إلغاء",
    ok: "موافق",
};
const MedicalDevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [deviceToDelete, setDeviceToDelete] = useState(null);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [devicesData, branchesData, departmentsData] = await Promise.all([
                    getDevices(),
                    getBranches(),
                    fetchDepartments(),
                ]);
                setDevices(devicesData);
                setBranches(branchesData.data);
                setDepartments(departmentsData);
                setLoading(false);
            }
            catch (error) {
                message.error(arabicText.operationFailed);
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const formatDateTime = (dateString) => {
        if (!dateString)
            return "-";
        try {
            return moment(dateString).format("DD MMMM YYYY");
        }
        catch {
            return dateString;
        }
    };
    const formatTime = (timeString) => {
        if (!timeString)
            return "-";
        try {
            return moment(timeString, "HH:mm").format("HH:mm");
        }
        catch {
            return timeString;
        }
    };
    const handleBeforeUpload = (file) => {
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            message.error(arabicText.imageRequirements);
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error(arabicText.imageRequirements);
            return Upload.LIST_IGNORE;
        }
        return true;
    };
    const handleImageChange = ({ fileList }) => {
        const newFileList = fileList.slice(-1);
        setFileList(newFileList);
        if (newFileList.length > 0 && newFileList[0].originFileObj) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target?.result);
            reader.readAsDataURL(newFileList[0].originFileObj);
            form.setFieldsValue({ imageFile: newFileList[0].originFileObj });
        }
        else {
            setImagePreview("");
            form.setFieldsValue({ imageFile: null });
        }
    };
    const handleAdd = () => {
        setEditingDevice(null);
        form.resetFields();
        // Set initial working time slots
        form.setFieldsValue({
            working_time_slots: [],
        });
        setFileList([]);
        setImagePreview("");
        setIsModalVisible(true);
    };
    const handleEdit = (device) => {
        setEditingDevice(device);
        form.setFieldsValue({
            ...device,
            department_id: device.department_id,
            branches: device.branches,
            working_time_slots: device.working_time_slots.map((slot) => ({
                ...slot,
                date: slot.date ? moment(slot.date) : undefined,
                startTime: slot.startTime ? moment(slot.startTime, "HH:mm") : undefined,
                endTime: slot.endTime ? moment(slot.endTime, "HH:mm") : undefined,
                recurringTime: slot.recurringTime
                    ? {
                        startTime: moment(slot.recurringTime.startTime, "HH:mm"),
                        endTime: moment(slot.recurringTime.endTime, "HH:mm"),
                    }
                    : undefined,
            })),
        });
        setImagePreview(device.image || "");
        setIsModalVisible(true);
    };
    const handleDelete = (id) => {
        setDeviceToDelete(id);
        setDeleteModalVisible(true);
    };
    const confirmDelete = async () => {
        if (!deviceToDelete)
            return;
        try {
            setLoading(true);
            await deleteDevice(deviceToDelete);
            setDevices(devices.filter((device) => device._id !== deviceToDelete));
            message.success(arabicText.deviceDeleted);
        }
        catch (error) {
            message.error(arabicText.operationFailed);
        }
        finally {
            setLoading(false);
            setDeleteModalVisible(false);
        }
    };
    const handleOk = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            // Handle empty working_time_slots
            const workingTimeSlots = values.working_time_slots || [];
            const formattedSlots = workingTimeSlots.map((slot) => {
                if (slot.type === "singleDate") {
                    return {
                        ...slot,
                        date: slot.date?.format("YYYY-MM-DD"),
                        startTime: slot.startTime?.format("HH:mm"),
                        endTime: slot.endTime?.format("HH:mm"),
                    };
                }
                else {
                    return {
                        ...slot,
                        recurringTime: slot.recurringTime
                            ? {
                                startTime: slot.recurringTime.startTime?.format("HH:mm"),
                                endTime: slot.recurringTime.endTime?.format("HH:mm"),
                            }
                            : undefined,
                    };
                }
            });
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append("sessionPeriod", values.sessionPeriod);
            formData.append("department_id", JSON.stringify(values.department_id));
            formData.append("branches", JSON.stringify(values.branches));
            formData.append("working_time_slots", JSON.stringify(formattedSlots));
            if (values.imageFile) {
                formData.append("image", values.imageFile);
            }
            else if (editingDevice?.image && !values.imageFile) {
                formData.append("keepExistingImage", "true");
            }
            if (editingDevice) {
                const updatedDevice = await updateDevice(editingDevice._id, formData);
                setDevices(devices.map((device) => (device._id === editingDevice._id ? updatedDevice : device)));
                message.success(arabicText.deviceUpdated);
            }
            else {
                const newDevice = await addDevice(formData);
                setDevices([...devices, newDevice]);
                message.success(arabicText.deviceAdded);
            }
            setIsModalVisible(false);
        }
        catch (error) {
            console.error("Error:", error);
            message.error(arabicText.operationFailed);
        }
        finally {
            setLoading(false);
        }
    };
    const columns = [
        {
            title: arabicText.deviceImage,
            dataIndex: "image",
            key: "image",
            render: (url) => url ? (_jsx(Image, { src: url || "/placeholder.svg", alt: "device", width: 50, height: 50, style: { objectFit: "cover" } })) : ("-"),
        },
        {
            title: arabicText.deviceName,
            dataIndex: "name",
            key: "name",
        },
        {
            title: arabicText.description,
            dataIndex: "description",
            key: "description",
            render: (text) => text || "-",
        },
        {
            title: arabicText.departments,
            dataIndex: "department_id",
            key: "departments",
            render: (departmentIds) => (_jsx("span", { children: departmentIds.map((id) => departments.find((d) => d.id === id)?.name || id).join(", ") })),
        },
        {
            title: arabicText.branches,
            dataIndex: "branches",
            key: "branches",
            render: (branchIds) => (_jsx("span", { children: branchIds
                    .map((id) => {
                    const branch = branches.find((b) => b.id.toString() === id.toString());
                    return branch ? branch.name : id;
                })
                    .join(", ") })),
        },
        {
            title: arabicText.workingTimeSlots,
            dataIndex: "working_time_slots",
            key: "working_time_slots",
            render: (slots) => (_jsx(Space, { direction: "vertical", children: slots.map((slot, index) => (_jsx("div", { children: slot.type === "singleDate" ? (_jsxs("div", { children: [_jsx(Tag, { color: "blue", children: arabicText.singleDate }), formatDateTime(slot.date), slot.startTime && (_jsxs(_Fragment, { children: [" ", formatTime(slot.startTime), " - ", formatTime(slot.endTime)] }))] })) : (_jsxs("div", { children: [_jsx(Tag, { color: "green", children: arabicText.dateRange }), slot.startDay, " ", arabicText.to, " ", slot.endDay, slot.recurringTime && (_jsxs(_Fragment, { children: [" ", formatTime(slot.recurringTime.startTime), " - ", formatTime(slot.recurringTime.endTime)] }))] })) }, index))) })),
        },
        {
            title: arabicText.sessionPeriod,
            dataIndex: "sessionPeriod",
            key: "sessionPeriod",
            render: (period) => `${period} دقيقة`,
        },
        {
            title: arabicText.actions,
            key: "actions",
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { onClick: () => handleEdit(record), children: arabicText.edit }), _jsx(Button, { danger: true, onClick: () => handleDelete(record._id), icon: _jsx(DeleteOutlined, {}), loading: loading && deviceToDelete === record._id, children: arabicText.delete })] })),
        },
    ];
    return (_jsx(ConfigProvider, { direction: "rtl", locale: arabic, children: _jsxs("div", { style: { padding: "24px", textAlign: "right" }, children: [_jsxs("div", { style: { marginBottom: "16px", display: "flex", justifyContent: "space-between" }, children: [_jsx("h2", { children: arabicText.medicalDevices }), _jsx(Button, { type: "primary", onClick: handleAdd, loading: loading, children: arabicText.addDevice })] }), _jsx(Table, { columns: columns, dataSource: devices, rowKey: "_id", bordered: true, loading: loading, pagination: { pageSize: 10 } }), _jsx(Modal, { title: editingDevice ? arabicText.editDevice : arabicText.addDevice, visible: isModalVisible, onOk: handleOk, onCancel: () => setIsModalVisible(false), width: 800, confirmLoading: loading, destroyOnClose: true, okText: arabicText.ok, cancelText: arabicText.cancel, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsx(Form.Item, { name: "imageFile", label: arabicText.deviceImage, valuePropName: "file", getValueFromEvent: (e) => e?.fileList[0]?.originFileObj || null, children: _jsx(Upload, { accept: "image/*", listType: "picture-card", fileList: fileList, beforeUpload: handleBeforeUpload, onChange: handleImageChange, maxCount: 1, onRemove: () => {
                                        setImagePreview("");
                                        return true;
                                    }, children: fileList.length >= 1 ? null : (_jsxs("div", { children: [_jsx(UploadOutlined, {}), _jsx("div", { style: { marginTop: 8 }, children: arabicText.uploadImage })] })) }) }), imagePreview && (_jsx("div", { style: { marginBottom: 16, textAlign: "center" }, children: _jsx(Image, { src: imagePreview || "/placeholder.svg", alt: "preview", width: 200, style: { maxHeight: 200, objectFit: "contain" } }) })), _jsx(Form.Item, { name: "name", label: arabicText.deviceName, rules: [{ required: true, message: arabicText.deviceNameRequired }], children: _jsx(Input, {}) }), _jsx(Form.Item, { name: "description", label: arabicText.description, children: _jsx(TextArea, { rows: 3 }) }), _jsx(Form.Item, { name: "department_id", label: arabicText.departments, rules: [{ required: true, message: arabicText.departmentsRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.departments, children: departments.map((department) => (_jsx(Option, { value: department.id, children: department.name }, department.id))) }) }), _jsx(Form.Item, { name: "branches", label: arabicText.branches, rules: [{ required: true, message: arabicText.branchesRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.branches, children: branches.map((branch) => (_jsx(Option, { value: branch.id, children: branch.name }, branch.id))) }) }), _jsx(Form.Item, { name: "sessionPeriod", label: arabicText.sessionPeriod, rules: [{ required: true, message: arabicText.sessionPeriodRequired }], children: _jsx(Input, { type: "number", min: 1, addonAfter: "\u062F\u0642\u064A\u0642\u0629" }) }), _jsxs("div", { style: { marginBottom: 16 }, children: [_jsx("label", { style: { fontWeight: "bold" }, children: arabicText.workingTimeSlots }), _jsx("div", { style: { color: "#666", fontSize: "12px" }, children: "\u0627\u062E\u062A\u064A\u0627\u0631\u064A - \u064A\u0645\u0643\u0646\u0643 \u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0627\u0639\u064A\u062F \u0627\u0644\u0639\u0645\u0644" })] }), _jsx(Form.List, { name: "working_time_slots", children: (fields, { add, remove }) => (_jsxs(_Fragment, { children: [fields.map(({ key, name, ...restField }) => (_jsxs(Space, { style: { display: "flex", marginBottom: 8 }, align: "baseline", children: [_jsx(Form.Item, { ...restField, name: [name, "type"], rules: [{ required: true, message: arabicText.missingType }], children: _jsxs(Select, { placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0646\u0648\u0639", style: { width: 150 }, children: [_jsx(Option, { value: "singleDate", children: arabicText.singleDate }), _jsx(Option, { value: "dateRange", children: arabicText.dateRange })] }) }), _jsx(Form.Item, { noStyle: true, shouldUpdate: (prevValues, currentValues) => prevValues.working_time_slots?.[name]?.type !== currentValues.working_time_slots?.[name]?.type, children: ({ getFieldValue }) => {
                                                        const type = getFieldValue(["working_time_slots", name, "type"]);
                                                        if (type === "singleDate") {
                                                            return (_jsxs(_Fragment, { children: [_jsx(Form.Item, { ...restField, name: [name, "date"], rules: [{ required: true, message: arabicText.missingDate }], children: _jsx(DatePicker, { format: "YYYY-MM-DD" }) }), _jsx(Form.Item, { ...restField, name: [name, "startTime"], rules: [{ required: true, message: arabicText.missingTime }], children: _jsx(TimePicker, { format: "HH:mm" }) }), _jsx("span", { children: "-" }), _jsx(Form.Item, { ...restField, name: [name, "endTime"], rules: [{ required: true, message: arabicText.missingTime }], children: _jsx(TimePicker, { format: "HH:mm" }) })] }));
                                                        }
                                                        else if (type === "dateRange") {
                                                            return (_jsxs(_Fragment, { children: [_jsx(Form.Item, { ...restField, name: [name, "startDay"], rules: [{ required: true, message: arabicText.missingDay }], children: _jsx(Select, { placeholder: arabicText.startDay, style: { width: 120 }, children: weekDays.map((day) => (_jsx(Option, { value: day, children: day }, day))) }) }), _jsx("span", { children: arabicText.to }), _jsx(Form.Item, { ...restField, name: [name, "endDay"], rules: [{ required: true, message: arabicText.missingDay }], children: _jsx(Select, { placeholder: arabicText.endDay, style: { width: 120 }, children: weekDays.map((day) => (_jsx(Option, { value: day, children: day }, day))) }) }), _jsx(Form.Item, { ...restField, name: [name, "recurringTime", "startTime"], rules: [{ required: true, message: arabicText.missingTime }], children: _jsx(TimePicker, { format: "HH:mm" }) }), _jsx("span", { children: "-" }), _jsx(Form.Item, { ...restField, name: [name, "recurringTime", "endTime"], rules: [{ required: true, message: arabicText.missingTime }], children: _jsx(TimePicker, { format: "HH:mm" }) })] }));
                                                        }
                                                        return null;
                                                    } }), _jsx(Button, { type: "link", danger: true, onClick: () => remove(name), children: arabicText.remove })] }, key))), _jsx(Form.Item, { children: _jsx(Button, { type: "dashed", onClick: () => add({ type: "singleDate" }), block: true, children: arabicText.addTimeSlot }) })] })) })] }) }), _jsx(Modal, { title: arabicText.confirmDelete, visible: deleteModalVisible, onOk: confirmDelete, onCancel: () => setDeleteModalVisible(false), confirmLoading: loading, okText: arabicText.ok, cancelText: arabicText.cancel, children: _jsx("p", { children: arabicText.deleteConfirmMessage }) })] }) }));
};
export default MedicalDevicesPage;
