"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from "react";
import { Table, Space, Button, Modal, Form, Input, Select, Upload, message, Image, ConfigProvider, Row, Col, Checkbox, Tag, Spin } from "antd";
import { UploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { getBranches } from "../../api/regions&branches";
import arabic from "antd/lib/locale/ar_EG";
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices";
import { getImageUrl } from "../../hooks/imageUrl";
const { Option } = Select;
const { TextArea } = Input;
const arabicText = {
    deviceImage: "صورة الجهاز",
    deviceName: "اسم الجهاز",
    deviceType: "نوع الجهاز",
    branches: "الفروع",
    availableTimes: "مواعيد العمل",
    actions: "الإجراءات",
    addDevice: "إضافة جهاز",
    editDevice: "تعديل جهاز",
    delete: "حذف",
    edit: "تعديل",
    confirmDelete: "تأكيد الحذف",
    deleteConfirmMessage: "هل أنت متأكد من رغبتك في حذف هذا الجهاز؟",
    deviceNameRequired: "يرجى إدخال اسم الجهاز!",
    deviceTypeRequired: "يرجى اختيار نوع الجهاز!",
    branchesRequired: "يرجى اختيار فرع واحد على الأقل!",
    operationFailed: "فشلت العملية",
    deviceAdded: "تم إضافة الجهاز بنجاح",
    deviceUpdated: "تم تحديث الجهاز بنجاح",
    deviceDeleted: "تم حذف الجهاز بنجاح",
    uploadImage: "رفع صورة",
    imageRequirements: "يجب أن تكون الصورة أقل من 5MB وبصيغة صورة",
    medicalDevices: "الأجهزة الطبية",
    cancel: "إلغاء",
    ok: "موافق",
    active: "نشط",
    inactive: "غير نشط",
    priority: "الأولوية",
    unknownBranch: "فرع غير معروف",
};
const deviceTypes = [
    "ليزر إزالة الشعر",
    "ليزر إزالة الشعر (تشقير)",
    "أجهزة تنظيف البشرة",
    "أجهزة التغذية ونحت القوام",
    "أجهزة معالجة البشرة",
    "أجهزة التجميل النسائي"
];
const MedicalDevicesPage = () => {
    const [devices, setDevices] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [deviceToDelete, setDeviceToDelete] = useState(null);
    const [branches, setBranches] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [devicesResponse, branchesResponse] = await Promise.all([
                    getDevices(),
                    getBranches(),
                ]);
                // Normalize branches data
                const branchesData = branchesResponse.data.map(branch => ({
                    ...branch,
                    id: Number(branch.id),
                }));
                // Normalize devices data
                const normalizedDevices = devicesResponse.map(device => ({
                    ...device,
                    branches_ids: device.branches_ids.map(id => Number(id)),
                }));
                setDevices(normalizedDevices);
                setBranches(branchesData);
            }
            catch (error) {
                console.error("Failed to fetch data:", error);
                message.error(arabicText.operationFailed);
            }
            finally {
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
            name: device.name,
            type: device.type,
            branches_ids: device.branches_ids,
            available_times: device.available_times,
            priority: device.priority,
            is_active: device.is_active,
        });
        if (device.image_url) {
            setImagePreview(getImageUrl(device.image_url));
            setFileList([{
                    uid: '-1',
                    name: 'existing-image',
                    status: 'done',
                    url: getImageUrl(device.image_url),
                }]);
        }
        else {
            setImagePreview("");
            setFileList([]);
        }
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
            console.error("Failed to delete device:", error);
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
            formData.append("type", values.type);
            formData.append("priority", values.priority?.toString() || "0");
            formData.append("is_active", values.is_active ? "true" : "false");
            values.branches_ids.forEach((id) => {
                formData.append("branches_ids[]", id.toString());
            });
            formData.append("available_times", values.available_times || "");
            if (fileList.length > 0 && fileList[0].originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }
            else if (editingDevice?.image_url && !fileList.length) {
                formData.append("keepExistingImage", "true");
            }
            let response;
            if (editingDevice) {
                response = await updateDevice(editingDevice._id, formData);
                setDevices(devices.map(d => d._id === editingDevice._id ? response.data : d));
                message.success(arabicText.deviceUpdated);
            }
            else {
                response = await addDevice(formData);
                setDevices([...devices, response.data]);
                message.success(arabicText.deviceAdded);
            }
            setIsModalVisible(false);
        }
        catch (error) {
            console.error("Operation failed:", error);
            message.error(arabicText.operationFailed);
        }
        finally {
            setLoading(false);
        }
    };
    const columns = [
        {
            title: arabicText.deviceImage,
            dataIndex: "image_url",
            key: "image",
            render: (url) => url ? (_jsx(Image, { src: getImageUrl(url), alt: "device", width: 50, height: 50, style: { objectFit: "cover" }, preview: false })) : "-",
        },
        {
            title: arabicText.deviceName,
            dataIndex: "name",
            key: "name",
        },
        {
            title: arabicText.deviceType,
            dataIndex: "type",
            key: "type",
        },
        {
            title: arabicText.priority,
            dataIndex: "priority",
            key: "priority",
            render: (val) => val ?? "-",
        },
        {
            title: "الحالة",
            dataIndex: "is_active",
            key: "is_active",
            render: (val) => (_jsx(Tag, { color: val ? "green" : "red", children: val ? arabicText.active : arabicText.inactive })),
        },
        {
            title: arabicText.branches,
            dataIndex: "branches_ids",
            key: "branches",
            render: (branchIds) => {
                return branchIds
                    .map(id => {
                    const branch = branches.find(b => b.id === id);
                    return branch ? branch.name : `${arabicText.unknownBranch} (ID: ${id})`;
                })
                    .join(", ");
            }
        },
        {
            title: arabicText.availableTimes,
            dataIndex: "available_times",
            key: "available_times",
            render: (times) => times || "-",
        },
        {
            title: arabicText.actions,
            key: "actions",
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [_jsx(Button, { icon: _jsx(EditOutlined, {}), onClick: () => handleEdit(record), children: arabicText.edit }), _jsx(Button, { danger: true, onClick: () => handleDelete(record._id), icon: _jsx(DeleteOutlined, {}), loading: loading && deviceToDelete === record._id, children: arabicText.delete })] })),
        },
    ];
    return (_jsx(ConfigProvider, { direction: "rtl", locale: arabic, children: _jsxs("div", { style: { padding: "24px", textAlign: "right" }, children: [_jsxs("div", { style: { marginBottom: "16px", display: "flex", justifyContent: "space-between" }, children: [_jsx("h2", { children: arabicText.medicalDevices }), _jsx(Button, { type: "primary", onClick: handleAdd, loading: loading, children: arabicText.addDevice })] }), _jsx(Spin, { spinning: loading, tip: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...", children: _jsx(Table, { columns: columns, dataSource: devices, rowKey: "_id", bordered: true, loading: loading, pagination: { pageSize: 10 }, scroll: { x: true } }) }), _jsx(Modal, { title: editingDevice ? arabicText.editDevice : arabicText.addDevice, open: isModalVisible, onOk: handleOk, onCancel: () => setIsModalVisible(false), okText: arabicText.ok, cancelText: arabicText.cancel, confirmLoading: loading, width: 800, children: _jsxs(Form, { form: form, layout: "vertical", children: [_jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.deviceName, name: "name", rules: [{ required: true, message: arabicText.deviceNameRequired }], children: _jsx(Input, {}) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.deviceType, name: "type", rules: [{ required: true, message: arabicText.deviceTypeRequired }], children: _jsx(Select, { placeholder: arabicText.deviceType, children: deviceTypes.map(type => (_jsx(Option, { value: type, children: type }, type))) }) }) })] }), _jsxs(Row, { gutter: 16, children: [_jsx(Col, { span: 12, children: _jsx(Form.Item, { label: arabicText.priority, name: "priority", children: _jsx(Input, { type: "number", min: 0, placeholder: "\u0645\u062B\u0627\u0644: 1 (\u0623\u0639\u0644\u0649 \u0623\u0648\u0644\u0648\u064A\u0629)" }) }) }), _jsx(Col, { span: 12, children: _jsx(Form.Item, { label: "\u0627\u0644\u062D\u0627\u0644\u0629", name: "is_active", valuePropName: "checked", children: _jsx(Checkbox, { children: arabicText.active }) }) })] }), _jsx(Row, { gutter: 16, children: _jsx(Col, { span: 24, children: _jsx(Form.Item, { label: arabicText.branches, name: "branches_ids", rules: [{ required: true, message: arabicText.branchesRequired }], children: _jsx(Select, { mode: "multiple", placeholder: arabicText.branches, showSearch: true, optionFilterProp: "children", filterOption: (input, option) => (option?.children).toLowerCase().includes(input.toLowerCase()), children: branches.map(branch => (_jsx(Option, { value: branch.id, children: branch.name }, branch.id))) }) }) }) }), _jsx(Row, { gutter: 16, children: _jsx(Col, { span: 24, children: _jsx(Form.Item, { label: arabicText.availableTimes, name: "available_times", children: _jsx(TextArea, { rows: 3, placeholder: "\u0645\u062B\u0627\u0644: \u0627\u0644\u0633\u0628\u062A (2 \u0638 - 10\u0645), \u0627\u0644\u0623\u062D\u062F (9:30 \u0635 _ 2 \u0645 ) & ( 6:30 \u0645 _ 10\u0645), \u0627\u0644\u062E\u0645\u064A\u0633 (9:30 \u0635 -7\u0645)" }) }) }) }), _jsxs(Form.Item, { label: arabicText.deviceImage, children: [_jsx(Upload, { listType: "picture-card", fileList: fileList, beforeUpload: handleBeforeUpload, onChange: handleImageChange, maxCount: 1, accept: "image/*", children: fileList.length >= 1 ? null : (_jsxs("div", { children: [_jsx(UploadOutlined, {}), _jsx("div", { style: { marginTop: 8 }, children: arabicText.uploadImage })] })) }), imagePreview && (_jsx(Image, { src: imagePreview, alt: "Preview", style: { marginTop: 8, maxHeight: 150 }, preview: false }))] })] }) }), _jsx(Modal, { title: arabicText.confirmDelete, open: deleteModalVisible, onOk: confirmDelete, onCancel: () => setDeleteModalVisible(false), okText: arabicText.ok, cancelText: arabicText.cancel, confirmLoading: loading, children: _jsx("p", { children: arabicText.deleteConfirmMessage }) })] }) }));
};
export default MedicalDevicesPage;
