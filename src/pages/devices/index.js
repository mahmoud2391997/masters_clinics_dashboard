"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Table, Space, Button, Modal, Form, Input, Select, Upload, message, Image, ConfigProvider, TimePicker, Checkbox, Card, Row, Col } from "antd";
import { UploadOutlined, DeleteOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { getBranches } from "../../api/regions&branches";
import { fetchDepartments } from "../../api/departments";
import arabic from "antd/lib/locale/ar_EG";
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices";
import dayjs from "dayjs";
const { Option } = Select;
const { TextArea } = Input;
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
    confirmDelete: "تأكيد الحذف",
    deleteConfirmMessage: "هل أنت متأكد من رغبتك في حذف هذا الجهاز؟",
    deviceNameRequired: "يرجى إدخال اسم الجهاز!",
    descriptionRequired: "يرجى إدخال وصف الجهاز!",
    departmentsRequired: "يرجى اختيار الأقسام!",
    branchesRequired: "يرجى اختيار الفروع!",
    sessionPeriodRequired: "يرجى إدخال مدة الجلسة!",
    operationFailed: "فشلت العملية",
    deviceAdded: "تم إضافة الجهاز بنجاح",
    deviceUpdated: "تم تحديث الجهاز بنجاح",
    deviceDeleted: "تم حذف الجهاز بنجاح",
    uploadImage: "رفع صورة",
    imageRequirements: "يجب أن تكون الصورة أقل من 5MB وبصيغة صورة",
    medicalDevices: "الأجهزة الطبية",
    cancel: "إلغاء",
    ok: "موافق",
    day: "اليوم",
    startTime: "وقت البدء",
    endTime: "وقت الانتهاء",
    active: "نشط",
    addTimeSlot: "إضافة موعد عمل",
    workingHours: "ساعات العمل",
    saturday: "السبت",
    sunday: "الأحد",
    monday: "الإثنين",
    tuesday: "الثلاثاء",
    wednesday: "الأربعاء",
    thursday: "الخميس",
    friday: "الجمعة"
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
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [devicesData, branchesData, departmentsData] = await Promise.all([
                    getDevices(),
                    getBranches(),
                    fetchDepartments(),
                ]);
                console.log(devicesData);
                setDevices(devicesData.map(device => ({
                    ...device,
                    working_time_slots: device.working_time_slots.map(slot => ({
                        ...slot,
                        startTime: slot.startTime || '',
                        endTime: slot.endTime || '',
                        isActive: true
                    }))
                })));
                setBranches(branchesData.data);
                setDepartments(departmentsData.map(dept => ({
                    ...dept,
                    id: dept.id.toString()
                })));
                setLoading(false);
            }
            catch (error) {
                message.error(arabicText.operationFailed);
                setLoading(false);
            }
        };
        fetchData();
    }, []);
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
            sessionPeriod: device.sessionPeriod,
            working_time_slots: device.working_time_slots?.map(slot => ({
                ...slot,
                startTime: slot.startTime ? dayjs(slot.startTime, 'HH:mm') : null,
                endTime: slot.endTime ? dayjs(slot.endTime, 'HH:mm') : null
            })) || []
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
            setDevices(devices.filter((device) => device.id !== deviceToDelete));
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
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append("sessionPeriod", values.sessionPeriod);
            formData.append("department_id", JSON.stringify(values.department_id));
            formData.append("branches", JSON.stringify(values.branches));
            if (values.working_time_slots) {
                const processedSlots = values.working_time_slots.map((slot) => ({
                    day: slot.day,
                    startTime: slot.startTime ? slot.startTime.format('HH:mm') : '',
                    endTime: slot.endTime ? slot.endTime.format('HH:mm') : '',
                    isActive: slot.isActive !== false,
                }));
                formData.append("working_time_slots", JSON.stringify(processedSlots));
            }
            // ✅ Fix: Always use fileList, not form value
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }
            else if (editingDevice?.image) {
                formData.append("keepExistingImage", "true");
            }
            let device;
            if (editingDevice) {
                device = await updateDevice(editingDevice.id, formData);
                setDevices(devices.map((d) => (d.id === editingDevice.id ? device : d)));
                message.success(arabicText.deviceUpdated);
            }
            else {
                device = await addDevice(formData);
                setDevices([...devices, device]);
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
            render: (url) => url ? _jsx(Image, { src: url, alt: "device", width: 50, height: 50, style: { objectFit: "cover" } }) : "-",
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
            render: (departmentIds) => departmentIds && departmentIds.length ? (_jsx("span", { children: departmentIds.map((id) => departments.find((d) => d.id.toString() === id.toString())?.name || id).join(", ") })) : ("-"),
        },
        {
            title: arabicText.branches,
            dataIndex: "branches",
            key: "branches",
            render: (branchIds) => branchIds && branchIds.length ? (_jsx("span", { children: branchIds
                    .map((id) => {
                    const branch = branches.find((b) => b.id.toString() === id.toString());
                    return branch ? branch.name : id;
                })
                    .join(", ") })) : ("-"),
        },
        {
            title: arabicText.sessionPeriod,
            dataIndex: "sessionPeriod",
            key: "sessionPeriod",
            render: (period) => `${period} ${arabicText.sessionPeriod}`,
        },
        {
            title: arabicText.workingHours,
            dataIndex: "working_time_slots",
            key: "working_time_slots",
            render: (slots) => (_jsx("div", { children: slots?.map((slot, index) => (_jsxs("div", { children: [arabicText[slot.day] || slot.day, ": ", slot.startTime, " - ", slot.endTime, " ", slot.isActive ? `(${arabicText.active})` : ""] }, index))) })),
        },
        {
            title: arabicText.actions,
            key: "actions",
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { onClick: () => handleEdit(record), children: arabicText.edit }), _jsx(Button, { danger: true, onClick: () => handleDelete(record.id), icon: _jsx(DeleteOutlined, {}), loading: loading && deviceToDelete === record.id, children: arabicText.delete })] })),
        },
    ];
    return (_jsx(ConfigProvider, { direction: "rtl", locale: arabic, children: _jsxs("div", { style: { padding: "24px", textAlign: "right" }, children: [_jsxs("div", { style: { marginBottom: "16px", display: "flex", justifyContent: "space-between" }, children: [_jsx("h2", { children: arabicText.medicalDevices }), _jsx(Button, { type: "primary", onClick: handleAdd, loading: loading, children: arabicText.addDevice })] }), _jsx(Table, { columns: columns, dataSource: devices, rowKey: "_id", bordered: true, loading: loading, pagination: { pageSize: 10 } }), _jsx(Modal, { title: editingDevice ? arabicText.editDevice : arabicText.addDevice, open: isModalVisible, onOk: handleOk, onCancel: () => setIsModalVisible(false), okText: arabicText.ok, cancelText: arabicText.cancel, confirmLoading: loading, width: 800, children: _jsxs(Form, { form: form, layout: "vertical", initialValues: {}, children: [_jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.deviceName, name: "name", rules: [{ required: true, message: arabicText.deviceNameRequired }], children: _jsx(Input, {}) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.sessionPeriod, name: "sessionPeriod", rules: [{ required: true, message: arabicText.sessionPeriodRequired }], children: _jsx(Input, { type: "number", addonAfter: "\u062F\u0642\u064A\u0642\u0629" }) }) })] }), _jsx(Form.Item, { label: arabicText.description, name: "description", rules: [{ required: true, message: arabicText.descriptionRequired }], children: _jsx(TextArea, { rows: 3 }) }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.departments, name: "department_id", rules: [{ required: true, message: arabicText.departmentsRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.departments, children: departments.map((dep) => (_jsx(Option, { value: dep.id, children: dep.name }, dep.id))) }) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.branches, name: "branches", rules: [{ required: true, message: arabicText.branchesRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.branches, children: branches.map((branch) => (_jsx(Option, { value: parseInt(branch.id), children: branch.name }, branch.id))) }) }) })] }), _jsx(Card, { title: arabicText.workingTimeSlots, style: { marginBottom: 16 }, children: _jsx(Form.List, { name: "working_time_slots", children: (fields, { add, remove }) => (_jsxs(_Fragment, { children: [fields.map(({ key, name, ...restField }) => (_jsxs(Space, { style: { display: 'flex', marginBottom: 8 }, align: "baseline", children: [_jsx(Form.Item, { ...restField, name: [name, 'day'], rules: [{ required: true, message: 'اختر اليوم' }], children: _jsxs(Select, { placeholder: arabicText.day, style: { width: 120 }, children: [_jsx(Option, { value: "saturday", children: arabicText.saturday }), _jsx(Option, { value: "sunday", children: arabicText.sunday }), _jsx(Option, { value: "monday", children: arabicText.monday }), _jsx(Option, { value: "tuesday", children: arabicText.tuesday }), _jsx(Option, { value: "wednesday", children: arabicText.wednesday }), _jsx(Option, { value: "thursday", children: arabicText.thursday }), _jsx(Option, { value: "friday", children: arabicText.friday })] }) }), _jsx(Form.Item, { ...restField, name: [name, 'startTime'], rules: [{ required: true, message: arabicText.startTime }], children: _jsx(TimePicker, { format: "HH:mm", placeholder: arabicText.startTime }) }), _jsx(Form.Item, { ...restField, name: [name, 'endTime'], rules: [{ required: true, message: arabicText.endTime }], children: _jsx(TimePicker, { format: "HH:mm", placeholder: arabicText.endTime }) }), _jsx(Form.Item, { ...restField, name: [name, 'isActive'], valuePropName: "checked", initialValue: true, children: _jsx(Checkbox, { children: arabicText.active }) }), _jsx(MinusCircleOutlined, { onClick: () => remove(name) })] }, key))), _jsx(Form.Item, { children: _jsx(Button, { type: "dashed", onClick: () => add(), block: true, icon: _jsx(PlusOutlined, {}), children: arabicText.addTimeSlot }) })] })) }) }), _jsxs(Form.Item, { label: arabicText.uploadImage, children: [_jsx(Upload, { listType: "picture", fileList: fileList, beforeUpload: handleBeforeUpload, onChange: handleImageChange, maxCount: 1, children: _jsx(Button, { icon: _jsx(UploadOutlined, {}), children: arabicText.uploadImage }) }), imagePreview && (_jsx(Image, { src: imagePreview, alt: "Preview", style: { marginTop: 8, maxHeight: 150 } }))] })] }) }), _jsx(Modal, { title: arabicText.confirmDelete, open: deleteModalVisible, onOk: confirmDelete, onCancel: () => setDeleteModalVisible(false), okText: arabicText.ok, cancelText: arabicText.cancel, confirmLoading: loading, children: _jsx("p", { children: arabicText.deleteConfirmMessage }) })] }) }));
};
export default MedicalDevicesPage;
