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
  Col
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
  branch: "الفرع",
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
  branchRequired: "يرجى اختيار الفرع!",
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

const deviceTypes = [
  "ليزر ازالة الشعر",
  "ليزر ازالة الشعر (تشقير)",
  "اجهزة تنظيف البشرة",
  "اجهزة التغذية ونحت القوام",
  "اجهزة معالجة البشرة",
  "اجهزة التجميل النسائي"
];
interface Device {
  id: number;
  _id: string;
  name: string;
  type: string;
  branch_id: number;
  available_times?: string;
  doctor_id?: number | null;
  image_url?: string | null;
  is_active?: boolean;
  priority?: number;
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
        console.log(branchesResponse);
        
        // Transform devices data to match our interface
        const devicesData = (devicesResponse as unknown as Device[]).map(device => ({
          ...device,
          _id: device._id || device.id.toString(),
          branch_id: Number(device.branch_id),
        }));

        // Transform branches data
        const branchesData = (branchesResponse.data as unknown as Branch[]).map(branch => ({
          ...branch,
          id: Number(branch.id),
        }));

        setDevices(devicesData);
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
  branch_id: device.branch_id,
  available_times: device.available_times,
  priority: device.priority ?? 0,
  is_active: device.is_active ?? true,
});

    setImagePreview(device.image_url || "");
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

      formData.append("branch_id", values.branch_id.toString());
      formData.append("available_times", values.available_times || "");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      } else if (editingDevice?.image_url) {
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
        url ? <Image src={ getImageUrl(url) } alt="device" width={50} height={50} style={{ objectFit: "cover" }} /> : "-",
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
  title: "الأولوية",
  dataIndex: "priority",
  key: "priority",
  render: (val: number) => val ?? "-",
},
{
  title: "نشط؟",
  dataIndex: "is_active",
  key: "is_active",
  render: (val: boolean) => (val ? "نعم" : "لا"),
},

    {
      title: arabicText.branch,
      dataIndex: "branch_id",
      key: "branch",
      render: (branchId: number) => {
        const branch = branches.find(b => b.id === branchId);
        return branch ? branch.name : branchId.toString();
      }
    },
    {
      title: arabicText.availableTimes,
      dataIndex: "available_times",
      key: "available_times",
      render: (times: string | undefined) => times || "-",
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

        <Table
          columns={columns}
          dataSource={devices}
          rowKey="_id"
          bordered
          loading={loading}
          pagination={{ pageSize: 10 }}
        />

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
    <Form.Item label="الأولوية" name="priority">
      <Input type="number" placeholder="مثال: 1 (أعلى أولوية)" />
    </Form.Item>
  </Col>
  <Col span={12}>
    <Form.Item label="نشط؟" name="is_active" valuePropName="checked">
      <Select>
        <Option value={true}>نعم</Option>
        <Option value={false}>لا</Option>
      </Select>
    </Form.Item>
  </Col>
</Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={arabicText.branch}
                  name="branch_id"
                  rules={[{ required: true, message: arabicText.branchRequired }]}
                >
                  <Select placeholder={arabicText.branch}>
                    {branches.map(branch => (
                      <Option key={branch.id} value={branch.id}>{branch.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={arabicText.availableTimes}
                  name="available_times"
                >
                  <TextArea rows={2} placeholder="مثال: السبت (1 ظ - 10م), الأحد (9:30 ص-10م)" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label={arabicText.uploadImage}>
              <Upload
                listType="picture"
                fileList={fileList}
                beforeUpload={handleBeforeUpload}
                onChange={handleImageChange}
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>{arabicText.uploadImage}</Button>
              </Upload>
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  style={{ marginTop: 8, maxHeight: 150 }}
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