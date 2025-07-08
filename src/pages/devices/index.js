"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Table, Space, Button, Modal, Form, Input, Select, Upload, message, Image, ConfigProvider, } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { getBranches } from "../../api/regions&branches";
import { fetchDepartments } from "../../api/departments";
import arabic from "antd/lib/locale/ar_EG";
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices";
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
            const formData = new FormData();
            formData.append("name", values.name);
            formData.append("description", values.description || "");
            formData.append("sessionPeriod", values.sessionPeriod);
            formData.append("department_id", JSON.stringify(values.department_id));
            formData.append("branches", JSON.stringify(values.branches));
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
            render: (departmentIds) => departmentIds && departmentIds.length ? (_jsx("span", { children: departmentIds.map((id) => departments.find((d) => d.id === id)?.name || id).join(", ") })) : ("-"),
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
            render: (period) => `${period} دقيقة`,
        },
        {
            title: arabicText.actions,
            key: "actions",
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { onClick: () => handleEdit(record), children: arabicText.edit }), _jsx(Button, { danger: true, onClick: () => handleDelete(record._id), icon: _jsx(DeleteOutlined, {}), loading: loading && deviceToDelete === record._id, children: arabicText.delete })] })),
        },
    ];
    return (_jsx(ConfigProvider, { direction: "rtl", locale: arabic, children: _jsxs("div", { style: { padding: "24px", textAlign: "right" }, children: [_jsxs("div", { style: { marginBottom: "16px", display: "flex", justifyContent: "space-between" }, children: [_jsx("h2", { children: arabicText.medicalDevices }), _jsx(Button, { type: "primary", onClick: handleAdd, loading: loading, children: arabicText.addDevice })] }), _jsx(Table, { columns: columns, dataSource: devices, rowKey: "_id", bordered: true, loading: loading, pagination: { pageSize: 10 } }), _jsx(Modal, { title: editingDevice ? arabicText.editDevice : arabicText.addDevice, open: isModalVisible, onOk: handleOk, onCancel: () => setIsModalVisible(false), okText: arabicText.ok, cancelText: arabicText.cancel, confirmLoading: loading, width: 800, children: _jsxs(Form, { form: form, layout: "vertical", initialValues: {}, children: [_jsx(Form.Item, { label: arabicText.deviceName, name: "name", rules: [{ required: true, message: arabicText.deviceNameRequired }], children: _jsx(Input, {}) }), _jsx(Form.Item, { label: arabicText.description, name: "description", rules: [{ required: true, message: arabicText.descriptionRequired }], children: _jsx(TextArea, { rows: 3 }) }), _jsx(Form.Item, { label: arabicText.departments, name: "department_id", rules: [{ required: true, message: arabicText.departmentsRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.departments, children: departments.map((dep) => (_jsx(Option, { value: dep.id, children: dep.name }, dep.id))) }) }), _jsx(Form.Item, { label: arabicText.branches, name: "branches", rules: [{ required: true, message: arabicText.branchesRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.branches, children: branches.map((branch) => (_jsx(Option, { value: parseInt(branch.id), children: branch.name }, branch.id))) }) }), _jsx(Form.Item, { label: arabicText.sessionPeriod, name: "sessionPeriod", rules: [{ required: true, message: arabicText.sessionPeriodRequired }], children: _jsx(Input, { type: "number" }) }), _jsxs(Form.Item, { label: arabicText.uploadImage, children: [_jsx(Upload, { listType: "picture", fileList: fileList, beforeUpload: handleBeforeUpload, onChange: handleImageChange, maxCount: 1, children: _jsx(Button, { icon: _jsx(UploadOutlined, {}), children: arabicText.uploadImage }) }), imagePreview && (_jsx(Image, { src: imagePreview, alt: "Preview", style: { marginTop: 8, maxHeight: 150 } }))] })] }) }), _jsx(Modal, { title: arabicText.confirmDelete, open: deleteModalVisible, onOk: confirmDelete, onCancel: () => setDeleteModalVisible(false), okText: arabicText.ok, cancelText: arabicText.cancel, confirmLoading: loading, children: _jsx("p", { children: arabicText.deleteConfirmMessage }) })] }) }));
};
export default MedicalDevicesPage;
