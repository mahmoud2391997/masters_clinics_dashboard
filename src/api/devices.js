import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Modal, Form, Input, Select, TimePicker, Upload, message, Image, ConfigProvider } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { getBranches } from '../api/regions&branches';
import { fetchDepartments } from '../api/departments';
import { addDevice, getDevices, updateDevice, deleteDevice } from "./devices.ts";
import moment from 'moment';
import arabic from 'antd/lib/locale/ar_EG';

const { Option } = Select;
const { TextArea } = Input;

// Arabic translations
const arabicText = {
    deviceImage: 'صورة الجهاز',
    deviceName: 'اسم الجهاز',
    description: 'الوصف',
    departments: 'الأقسام',
    branches: 'الفروع',
    workingHours: 'ساعات العمل',
    sessionPeriod: 'مدة الجلسة (دقيقة)',
    actions: 'الإجراءات',
    addDevice: 'إضافة جهاز',
    editDevice: 'تعديل جهاز',
    delete: 'حذف',
    edit: 'تعديل',
    startTime: 'وقت البدء',
    endTime: 'وقت الانتهاء',
    remove: 'إزالة',
    addWorkingHours: 'إضافة ساعات عمل',
    confirmDelete: 'تأكيد الحذف',
    deleteConfirmMessage: 'هل أنت متأكد من رغبتك في حذف هذا الجهاز؟',
    deviceNameRequired: 'يرجى إدخال اسم الجهاز!',
    descriptionRequired: 'يرجى إدخال وصف الجهاز!',
    departmentsRequired: 'يرجى اختيار الأقسام!',
    branchesRequired: 'يرجى اختيار الفروع!',
    sessionPeriodRequired: 'يرجى إدخال مدة الجلسة!',
    missingTime: 'الوقت مطلوب',
    operationFailed: 'فشلت العملية',
    deviceAdded: 'تم إضافة الجهاز بنجاح',
    deviceUpdated: 'تم تحديث الجهاز بنجاح',
    deviceDeleted: 'تم حذف الجهاز بنجاح',
    uploadImage: 'رفع صورة',
    imageRequirements: 'يجب أن تكون الصورة أقل من 5MB وبصيغة صورة',
    medicalDevices: 'الأجهزة الطبية',
    to: 'إلى',
    cancel: 'إلغاء',
    ok: 'موافق',
    days: {
        sunday: 'الأحد',
        monday: 'الاثنين',
        tuesday: 'الثلاثاء',
        wednesday: 'الأربعاء',
        thursday: 'الخميس',
        friday: 'الجمعة',
        saturday: 'السبت'
    }
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
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();

    const daysOfWeek = [
        { id: 'sunday', name: arabicText.days.sunday },
        { id: 'monday', name: arabicText.days.monday },
        { id: 'tuesday', name: arabicText.days.tuesday },
        { id: 'wednesday', name: arabicText.days.wednesday },
        { id: 'thursday', name: arabicText.days.thursday },
        { id: 'friday', name: arabicText.days.friday },
        { id: 'saturday', name: arabicText.days.saturday }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [devicesData, branchesData, departmentsData] = await Promise.all([
                    getDevices(),
                    getBranches(),
                    fetchDepartments()
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

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        try {
            return moment(timeString, 'HH:mm').format('HH:mm');
        }
        catch {
            return timeString;
        }
    };

    const handleBeforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
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
            reader.onload = e => setImagePreview(e.target?.result);
            reader.readAsDataURL(newFileList[0].originFileObj);
            form.setFieldsValue({ imageFile: newFileList[0].originFileObj });
        }
        else {
            setImagePreview('');
            form.setFieldsValue({ imageFile: null });
        }
    };

    const handleAdd = () => {
        setEditingDevice(null);
        form.resetFields();
        setFileList([]);
        setImagePreview('');
        setIsModalVisible(true);
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        form.setFieldsValue({
            ...device,
            department_id: device.department_id,
            branches: device.branches,
            description: device.description,
            working_hours: daysOfWeek.map(day => ({
                day: day.id,
                isWorking: device.working_hours?.find(d => d.day === day.id)?.isWorking || false,
                startTime: device.working_hours?.find(d => d.day === day.id)?.startTime ? 
                    moment(device.working_hours.find(d => d.day === day.id).startTime, 'HH:mm') : null,
                endTime: device.working_hours?.find(d => d.day === day.id)?.endTime ? 
                    moment(device.working_hours.find(d => d.day === day.id).endTime, 'HH:mm') : null
            }))
        });
        setImagePreview(device.image || '');
        setIsModalVisible(true);
    };

    const handleDelete = (id) => {
        setDeviceToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (!deviceToDelete) return;
        try {
            setLoading(true);
            await deleteDevice(deviceToDelete);
            setDevices(devices.filter(device => device._id !== deviceToDelete));
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
            
            const workingHours = values.working_hours
                .filter(day => day.isWorking)
                .map(day => ({
                    day: day.day,
                    startTime: day.startTime?.format('HH:mm'),
                    endTime: day.endTime?.format('HH:mm')
                }));

            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('sessionPeriod', values.sessionPeriod);
            formData.append('department_id', JSON.stringify(values.department_id));
            formData.append('branches', JSON.stringify(values.branches));
            formData.append('working_hours', JSON.stringify(workingHours));
            
            if (values.imageFile) {
                formData.append('image', values.imageFile);
            }
            else if (editingDevice?.image && !values.imageFile) {
                formData.append('keepExistingImage', 'true');
            }

            if (editingDevice) {
                const updatedDevice = await updateDevice(editingDevice._id, formData);
                setDevices(devices.map(device => device._id === editingDevice._id ? updatedDevice : device));
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
            console.error('Error:', error);
            message.error(arabicText.operationFailed);
        }
        finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: arabicText.deviceImage,
            dataIndex: 'image',
            key: 'image',
            render: (url) => (url ? _jsx(Image, { src: url, alt: "device", width: 50, height: 50, style: { objectFit: 'cover' } }) : '-'),
        },
        {
            title: arabicText.deviceName,
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: arabicText.description,
            dataIndex: 'description',
            key: 'description',
            render: (text) => text || '-',
        },
        {
            title: arabicText.departments,
            dataIndex: 'department_id',
            key: 'departments',
            render: (departmentIds) => (_jsx("span", { children: departmentIds.map(id => departments.find(d => d.id === id)?.name || id).join(', ') })),
        },
        {
            title: arabicText.branches,
            dataIndex: 'branches',
            key: 'branches',
            render: (branchIds) => (_jsx("span", { children: branchIds.map(id => {
                const branch = branches.find(b => b.id.toString() === id.toString());
                return branch ? branch.name : id;
            }).join(', ') })),
        },
        {
            title: arabicText.workingHours,
            dataIndex: 'working_hours',
            key: 'working_hours',
            render: (hours) => (_jsx(Space, { direction: "vertical", children: hours?.filter(day => day.isWorking).map((day, index) => (
                _jsx("div", { children: _jsxs("span", { children: [
                    arabicText.days[day.day],
                    ": ",
                    formatTime(day.startTime),
                    " - ",
                    formatTime(day.endTime)
                ] }) }, index)
            )) })),
        },
        {
            title: arabicText.sessionPeriod,
            dataIndex: 'sessionPeriod',
            key: 'sessionPeriod',
            render: (period) => `${period} دقيقة`,
        },
        {
            title: arabicText.actions,
            key: 'actions',
            render: (_, record) => (_jsxs(Space, { size: "middle", children: [
                _jsx(Button, { onClick: () => handleEdit(record), children: arabicText.edit }),
                _jsx(Button, { 
                    danger: true, 
                    onClick: () => handleDelete(record._id), 
                    icon: _jsx(DeleteOutlined, {}), 
                    loading: loading && deviceToDelete === record._id, 
                    children: arabicText.delete 
                })
            ] })),
        },
    ];

    return (
        _jsx(ConfigProvider, { 
            direction: "rtl", 
            locale: arabic, 
            children: _jsxs("div", { 
                style: { padding: '24px', textAlign: 'right' }, 
                children: [
                    _jsxs("div", { 
                        style: { marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }, 
                        children: [
                            _jsx("h2", { children: arabicText.medicalDevices }),
                            _jsx(Button, { type: "primary", onClick: handleAdd, loading: loading, children: arabicText.addDevice })
                        ] 
                    }),
                    _jsx(Table, { 
                        columns: columns, 
                        dataSource: devices, 
                        rowKey: "_id", 
                        bordered: true, 
                        loading: loading, 
                        pagination: { pageSize: 10 } 
                    }),
                    _jsx(Modal, { 
                        title: editingDevice ? arabicText.editDevice : arabicText.addDevice, 
                        visible: isModalVisible, 
                        onOk: handleOk, 
                        onCancel: () => setIsModalVisible(false), 
                        width: 800, 
                        confirmLoading: loading, 
                        destroyOnClose: true, 
                        okText: arabicText.ok, 
                        cancelText: arabicText.cancel, 
                        children: _jsxs(Form, { 
                            form: form, 
                            layout: "vertical", 
                            children: [
                                _jsx(Form.Item, { 
                                    name: "imageFile", 
                                    label: arabicText.deviceImage, 
                                    valuePropName: "file", 
                                    getValueFromEvent: (e) => e?.fileList[0]?.originFileObj || null, 
                                    children: _jsx(Upload, { 
                                        accept: "image/*", 
                                        listType: "picture-card", 
                                        fileList: fileList, 
                                        beforeUpload: handleBeforeUpload, 
                                        onChange: handleImageChange, 
                                        maxCount: 1, 
                                        onRemove: () => {
                                            setImagePreview('');
                                            return true;
                                        }, 
                                        children: fileList.length >= 1 ? null : (_jsxs("div", { children: [
                                            _jsx(UploadOutlined, {}), 
                                            _jsx("div", { style: { marginTop: 8 }, children: arabicText.uploadImage })
                                        ] })) 
                                    }) 
                                }),
                                imagePreview && (_jsx("div", { 
                                    style: { marginBottom: 16, textAlign: 'center' }, 
                                    children: _jsx(Image, { 
                                        src: imagePreview, 
                                        alt: "preview", 
                                        width: 200, 
                                        style: { maxHeight: 200, objectFit: 'contain' } 
                                    }) 
                                })),
                                _jsx(Form.Item, { 
                                    name: "name", 
                                    label: arabicText.deviceName, 
                                    rules: [{ required: true, message: arabicText.deviceNameRequired }], 
                                    children: _jsx(Input, {}) 
                                }),
                                _jsx(Form.Item, { 
                                    name: "description", 
                                    label: arabicText.description, 
                                    rules: [{ required: true, message: arabicText.descriptionRequired }], 
                                    children: _jsx(TextArea, { rows: 3 }) 
                                }),
                                _jsx(Form.Item, { 
                                    name: "department_id", 
                                    label: arabicText.departments, 
                                    rules: [{ required: true, message: arabicText.departmentsRequired }], 
                                    children: _jsx(Select, { 
                                        mode: "multiple", 
                                        placeholder: arabicText.departments, 
                                        children: departments.map((department) => (
                                            _jsx(Option, { value: department.id, children: department.name }, department.id)
                                        ) 
                                  )}) 
                                }),
                                _jsx(Form.Item, { 
                                    name: "branches", 
                                    label: arabicText.branches, 
                                    rules: [{ required: true, message: arabicText.branchesRequired }], 
                                    children: _jsx(Select, { 
                                        mode: "multiple", 
                                        placeholder: arabicText.branches, 
                                        children: branches.map((branch) => (
                                            _jsx(Option, { value: branch.id, children: branch.name }, branch.id)
                                        )) 
                                    }) 
                                }),
                                _jsx(Form.Item, { 
                                    name: "sessionPeriod", 
                                    label: arabicText.sessionPeriod, 
                                    rules: [{ required: true, message: arabicText.sessionPeriodRequired }], 
                                    children: _jsx(Input, { type: "number", min: 1, addonAfter: "دقيقة" }) 
                                }),
                                _jsx("div", { 
                                    style: { marginBottom: 16 }, 
                                    children: _jsx("h4", { children: arabicText.workingHours }) 
                                }),
                                _jsx(Form.List, { 
                                    name: "working_hours", 
                                    initialValue: daysOfWeek.map(day => ({
                                        day: day.id,
                                        isWorking: false,
                                        startTime: null,
                                        endTime: null
                                    })),
                                    children: (fields) => (
                                        _jsx("div", { 
                                            children: fields.map(({ key, name, ...restField }) => {
                                                return (
                                                    _jsxs("div", { 
                                                        style: { 
                                                            display: 'flex', 
                                                            alignItems: 'center', 
                                                            marginBottom: 8,
                                                            gap: 8
                                                        }, 
                                                        children: [
                                                            _jsx(Form.Item, {
                                                                ...restField,
                                                                name: [name, 'isWorking'],
                                                                valuePropName: "checked",
                                                                style: { marginBottom: 0 },
                                                                children: _jsx(Input, type="checkbox")
                                                           }),
                                                            _jsx("span", { 
                                                                style: { width: 80 }, 
                                                                children: arabicText.days[fields[name].day] 
                                                            }),
                                                            _jsx(Form.Item, {
                                                                ...restField,
                                                                name: [name, 'startTime'],
                                                                rules: [
                                                                    ({ getFieldValue }) => ({
                                                                        validator(_, value) {
                                                                            if (!getFieldValue(['working_hours', name, 'isWorking']) || value) {
                                                                                return Promise.resolve();
                                                                            }
                                                                            return Promise.reject(new Error(arabicText.missingTime));
                                                                        }
                                                                    })
                                                                ],
                                                                style: { marginBottom: 0, flex: 1 },
                                                                children: _jsx(TimePicker, { 
                                                                    format: "HH:mm", 
                                                                    disabled: !form.getFieldValue(['working_hours', name, 'isWorking']) 
                                                                })
                                                            }),
                                                            _jsx("span", { children: arabicText.to }),
                                                            _jsx(Form.Item, {
                                                                ...restField,
                                                                name: [name, 'endTime'],
                                                                rules: [
                                                                    ({ getFieldValue }) => ({
                                                                        validator(_, value) {
                                                                            if (!getFieldValue(['working_hours', name, 'isWorking']) || value) {
                                                                                return Promise.resolve();
                                                                            }
                                                                            return Promise.reject(new Error(arabicText.missingTime));
                                                                        }
                                                                    })
                                                                ],
                                                                style: { marginBottom: 0, flex: 1 },
                                                                children: _jsx(TimePicker, { 
                                                                    format: "HH:mm", 
                                                                    disabled: !form.getFieldValue(['working_hours', name, 'isWorking']) 
                                                                })
                                                            })
                                                        ] 
                                                    }, key)
                                                );
                                            }
                                          )  })
                                    )
                                })
                            ] 
                        }) 
                    }),
                    _jsx(Modal, { 
                        title: arabicText.confirmDelete, 
                        visible: deleteModalVisible, 
                        onOk: confirmDelete, 
                        onCancel: () => setDeleteModalVisible(false), 
                        confirmLoading: loading, 
                        okText: arabicText.ok, 
                        cancelText: arabicText.cancel, 
                        children: _jsx("p", { children: arabicText.deleteConfirmMessage }) 
                    })
                ] 
            }) 
        })
    );
};

export default MedicalDevicesPage;