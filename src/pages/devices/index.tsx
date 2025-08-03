"use client"

import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Image,
  ConfigProvider,
  Row,
  Col,
  Checkbox,
  Tag,
  Spin
} from "antd";
import { UploadOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { getBranches } from "../../api/regions&branches";
import arabic from "antd/lib/locale/ar_EG";
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices";
import type { AxiosResponse } from "axios";
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

interface Device {
  _id: string;
  name: string;
  type: string;
  branches_ids: number[];
  available_times?: string | null;
  image_url?: string | null;
  priority: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  location_link: string;
  region_id: number;
  image_url?: string | null;
  latitude: number;
  longitude: number;
}

const MedicalDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
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
        const branchesData = (branchesResponse.data as unknown as Branch[]).map(branch => ({
          ...branch,
          id: Number(branch.id),
        }));

        // Normalize devices data
        const normalizedDevices = (devicesResponse as unknown as Device[]).map(device => ({
          ...device,
          branches_ids: device.branches_ids.map(id => Number(id)),
        }));

        setDevices(normalizedDevices);
        setBranches(branchesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        message.error(arabicText.operationFailed);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBeforeUpload = (file: File) => {
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

  const handleImageChange = ({ fileList }: any) => {
    const newFileList = fileList.slice(-1);
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(newFileList[0].originFileObj);
      form.setFieldsValue({ imageFile: newFileList[0].originFileObj });
    } else {
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

  const handleEdit = (device: Device) => {
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
    } else {
      setImagePreview("");
      setFileList([]);
    }
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setDeviceToDelete(id);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;
    try {
      setLoading(true);
      await deleteDevice(deviceToDelete);
      setDevices(devices.filter((device) => device._id !== deviceToDelete));
      message.success(arabicText.deviceDeleted);
    } catch (error) {
      console.error("Failed to delete device:", error);
      message.error(arabicText.operationFailed);
    } finally {
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
      
      values.branches_ids.forEach((id: number) => {
        formData.append("branches_ids[]", id.toString());
      });
      
      formData.append("available_times", values.available_times || "");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (editingDevice?.image_url && !fileList.length) {
        formData.append("keepExistingImage", "true");
      }

      let response: AxiosResponse<Device>;
      if (editingDevice) {
        response = await updateDevice(editingDevice._id, formData);
        setDevices(devices.map(d => d._id === editingDevice._id ? response.data : d));
        message.success(arabicText.deviceUpdated);
      } else {
        response = await addDevice(formData);
        setDevices([...devices, response.data]);
        message.success(arabicText.deviceAdded);
      }

      setIsModalVisible(false);
    } catch (error) {
      console.error("Operation failed:", error);
      message.error(arabicText.operationFailed);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: arabicText.deviceImage,
      dataIndex: "image_url",
      key: "image",
      render: (url: string | null) =>
        url ? (
          <Image 
            src={getImageUrl(url)} 
            alt="device" 
            width={50} 
            height={50} 
            style={{ objectFit: "cover" }} 
            preview={false}
          />
        ) : "-",
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
      render: (val: number) => val ?? "-",
    },
    {
      title: "الحالة",
      dataIndex: "is_active",
      key: "is_active",
      render: (val: boolean) => (
        <Tag color={val ? "green" : "red"}>
          {val ? arabicText.active : arabicText.inactive}
        </Tag>
      ),
    },
    {
      title: arabicText.branches,
      dataIndex: "branches_ids",
      key: "branches",
      render: (branchIds: number[]) => {
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
      render: (times: string | undefined | null) => times || "-",
    },
    {
      title: arabicText.actions,
      key: "actions",
      render: (_: any, record: Device) => (
        <Space size="middle">
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            {arabicText.edit}
          </Button>
          <Button
            danger
            onClick={() => handleDelete(record._id)}
            icon={<DeleteOutlined />}
            loading={loading && deviceToDelete === record._id}
          >
            {arabicText.delete}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <ConfigProvider direction="rtl" locale={arabic}>
      <div style={{ padding: "24px", textAlign: "right" }}>
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
          <h2>{arabicText.medicalDevices}</h2>
          <Button type="primary" onClick={handleAdd} loading={loading}>
            {arabicText.addDevice}
          </Button>
        </div>

        <Spin spinning={loading} tip="جاري التحميل...">
          <Table
            columns={columns}
            dataSource={devices}
            rowKey="_id"
            bordered
            loading={loading}
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Spin>

        <Modal
          title={editingDevice ? arabicText.editDevice : arabicText.addDevice}
          open={isModalVisible}
          onOk={handleOk}
          onCancel={() => setIsModalVisible(false)}
          okText={arabicText.ok}
          cancelText={arabicText.cancel}
          confirmLoading={loading}
          width={800}
        >
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={arabicText.deviceName}
                  name="name"
                  rules={[{ required: true, message: arabicText.deviceNameRequired }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={arabicText.deviceType}
                  name="type"
                  rules={[{ required: true, message: arabicText.deviceTypeRequired }]}
                >
                  <Select placeholder={arabicText.deviceType}>
                    {deviceTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label={arabicText.priority} name="priority">
                  <Input type="number" min={0} placeholder="مثال: 1 (أعلى أولوية)" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="الحالة" name="is_active" valuePropName="checked">
                  <Checkbox>{arabicText.active}</Checkbox>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={arabicText.branches}
                  name="branches_ids"
                  rules={[{ required: true, message: arabicText.branchesRequired }]}
                >
                  <Select 
                    mode="multiple"
                    placeholder={arabicText.branches}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {branches.map(branch => (
                      <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={arabicText.availableTimes}
                  name="available_times"
                >
                  <TextArea 
                    rows={3} 
                    placeholder="مثال: السبت (2 ظ - 10م), الأحد (9:30 ص _ 2 م ) & ( 6:30 م _ 10م), الخميس (9:30 ص -7م)" 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={arabicText.deviceImage}>
              <Upload
                listType="picture-card"
                fileList={fileList}
                beforeUpload={handleBeforeUpload}
                onChange={handleImageChange}
                maxCount={1}
                accept="image/*"
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>{arabicText.uploadImage}</div>
                  </div>
                )}
              </Upload>
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={{ marginTop: 8, maxHeight: 150 }}
                  preview={false}
                />
              )}
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={arabicText.confirmDelete}
          open={deleteModalVisible}
          onOk={confirmDelete}
          onCancel={() => setDeleteModalVisible(false)}
          okText={arabicText.ok}
          cancelText={arabicText.cancel}
          confirmLoading={loading}
        >
          <p>{arabicText.deleteConfirmMessage}</p>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default MedicalDevicesPage;