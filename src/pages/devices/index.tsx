"use client"

import type React from "react"
import { useEffect, useState } from "react"
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
  TimePicker,
  Checkbox,
  Card,
  Row,
  Col
} from "antd"
import { UploadOutlined, DeleteOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons"
import { getBranches } from "../../api/regions&branches"
import { fetchDepartments } from "../../api/departments"
import arabic from "antd/lib/locale/ar_EG"
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices"
import dayjs from "dayjs"

const { Option } = Select
const { TextArea } = Input

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
}

interface WorkingTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface Branch {
  id: string
  name: string
  address: string
  location_link: string
  region: string
  image?: string
  coordinates: { latitude: number; longitude: number }
}

interface Department {
  id: string
  name: string
  description?: string
  imageUrl?: string
}

interface Device {
  id: string
  name: string
  description?: string
  department_id: number[]
  branches: number[]
  working_time_slots: WorkingTimeSlot[]
  sessionPeriod: string
  imageUrl?: string
  image?: string
}

const MedicalDevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [editingDevice, setEditingDevice] = useState<Device | null>(null)
  const [deviceToDelete, setDeviceToDelete] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [fileList, setFileList] = useState<any[]>([])
  const [imagePreview, setImagePreview] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [devicesData, branchesData, departmentsData] = await Promise.all([
          getDevices(),
          getBranches(),
          fetchDepartments(),
        ])
        console.log(devicesData);
        
        setDevices(devicesData.map(device => ({
          ...device,
          working_time_slots: device.working_time_slots.map(slot => ({
            ...slot,
            startTime: slot.startTime || '',
            endTime: slot.endTime || '',
            isActive: true
          }))
        })))
        setBranches(branchesData.data)

        setDepartments(departmentsData.map(dept => ({
          ...dept,
          id: dept.id.toString()
        })))
        setLoading(false)
      } catch (error) {
        message.error(arabicText.operationFailed)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/")
    if (!isImage) {
      message.error(arabicText.imageRequirements)
      return Upload.LIST_IGNORE
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error(arabicText.imageRequirements)
      return Upload.LIST_IGNORE
    }
    return true
  }

  const handleImageChange = ({ fileList }: any) => {
    const newFileList = fileList.slice(-1)
    setFileList(newFileList)

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(newFileList[0].originFileObj)
      form.setFieldsValue({ imageFile: newFileList[0].originFileObj })
    } else {
      setImagePreview("")
      form.setFieldsValue({ imageFile: null })
    }
  }

  const handleAdd = () => {
    setEditingDevice(null)
    form.resetFields()
    setFileList([])
    setImagePreview("")
    setIsModalVisible(true)
  }

  const handleEdit = (device: Device) => {
    setEditingDevice(device)
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
    })
    setImagePreview(device.image || "")
    setIsModalVisible(true)
  }

  const handleDelete = (id: string) => {
    setDeviceToDelete(id)
    setDeleteModalVisible(true)
  }

  const confirmDelete = async () => {
    if (!deviceToDelete) return
    try {
      setLoading(true)
      await deleteDevice(deviceToDelete)
      setDevices(devices.filter((device) => device.id !== deviceToDelete))
      message.success(arabicText.deviceDeleted)
    } catch (error) {
      message.error(arabicText.operationFailed)
    } finally {
      setLoading(false)
      setDeleteModalVisible(false)
    }
  }

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
      const processedSlots = values.working_time_slots.map((slot: { day: string; startTime: any; endTime: any; isActive?: boolean }) => ({
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
    } else if (editingDevice?.image) {
      formData.append("keepExistingImage", "true");
    }

    let device: Device;
    if (editingDevice) {
      device = await updateDevice(editingDevice.id, formData);
      setDevices(devices.map((d) => (d.id === editingDevice.id ? device : d)));
      message.success(arabicText.deviceUpdated);
    } else {
      device = await addDevice(formData);
      setDevices([...devices, device]);
      message.success(arabicText.deviceAdded);
    }

    setIsModalVisible(false);
  } catch (error) {
    console.error("Error:", error);
    message.error(arabicText.operationFailed);
  } finally {
    setLoading(false);
  }
};


  const columns = [
    {
      title: arabicText.deviceImage,
      dataIndex: "image",
      key: "image",
      render: (url: string) =>
        url ? <Image src={url} alt="device" width={50} height={50} style={{ objectFit: "cover" }} /> : "-",
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
      render: (text: string) => text || "-",
    },
    {
      title: arabicText.departments,
      dataIndex: "department_id",
      key: "departments",
      render: (departmentIds: number[]) =>
        departmentIds && departmentIds.length ? (
          <span>{departmentIds.map((id) => departments.find((d) => d.id.toString() === id.toString())?.name || id).join(", ")}</span>
        ) : (
          "-"
        ),
    },
    {
      title: arabicText.branches,
      dataIndex: "branches",
      key: "branches",
      render: (branchIds: number[]) =>
        branchIds && branchIds.length ? (
          <span>
            {branchIds
              .map((id) => {
                const branch = branches.find((b) => b.id.toString() === id.toString())
                return branch ? branch.name : id
              })
              .join(", ")}
          </span>
        ) : (
          "-"
        ),
    },
    {
      title: arabicText.sessionPeriod,
      dataIndex: "sessionPeriod",
      key: "sessionPeriod",
      render: (period: string) => `${period} ${arabicText.sessionPeriod}`,
    },
    {
      title: arabicText.workingHours,
      dataIndex: "working_time_slots",
      key: "working_time_slots",
      render: (slots: WorkingTimeSlot[]) => (
        <div>
          {slots?.map((slot, index) => (
            <div key={index}>
              {arabicText[slot.day as keyof typeof arabicText] || slot.day}: {slot.startTime} - {slot.endTime} {slot.isActive ? `(${arabicText.active})` : ""}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: arabicText.actions,
      key: "actions",
      render: (_: any, record: Device) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>{arabicText.edit}</Button>
          <Button
            danger
            onClick={() => handleDelete(record.id)}
            icon={<DeleteOutlined />}
            loading={loading && deviceToDelete === record.id}
          >
            {arabicText.delete}
          </Button>
        </Space>
      ),
    },
  ]

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

        {/* Add/Edit Modal */}
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
          <Form
            form={form}
            layout="vertical"
            initialValues={{}}
          >
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
                  label={arabicText.sessionPeriod}
                  name="sessionPeriod"
                  rules={[{ required: true, message: arabicText.sessionPeriodRequired }]}
                >
                  <Input type="number" addonAfter="دقيقة" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={arabicText.description}
              name="description"
              rules={[{ required: true, message: arabicText.descriptionRequired }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={arabicText.departments}
                  name="department_id"
                  rules={[{ required: true, message: arabicText.departmentsRequired }]}
                >
                  <Select mode="multiple" placeholder={arabicText.departments}>
                    {departments.map((dep) => (
                      <Option key={dep.id} value={dep.id}>
                        {dep.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={arabicText.branches}
                  name="branches"
                  rules={[{ required: true, message: arabicText.branchesRequired }]}
                >
                  <Select mode="multiple" placeholder={arabicText.branches}>
                    {branches.map((branch) => (
                      <Option key={branch.id} value={parseInt(branch.id)}>
                        {branch.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Card title={arabicText.workingTimeSlots} style={{ marginBottom: 16 }}>
              <Form.List name="working_time_slots">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }) => (
                      <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                        <Form.Item
                          {...restField}
                          name={[name, 'day']}
                          rules={[{ required: true, message: 'اختر اليوم' }]}
                        >
                          <Select placeholder={arabicText.day} style={{ width: 120 }}>
                            <Option value="saturday">{arabicText.saturday}</Option>
                            <Option value="sunday">{arabicText.sunday}</Option>
                            <Option value="monday">{arabicText.monday}</Option>
                            <Option value="tuesday">{arabicText.tuesday}</Option>
                            <Option value="wednesday">{arabicText.wednesday}</Option>
                            <Option value="thursday">{arabicText.thursday}</Option>
                            <Option value="friday">{arabicText.friday}</Option>
                          </Select>
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'startTime']}
                          rules={[{ required: true, message: arabicText.startTime }]}
                        >
                          <TimePicker format="HH:mm" placeholder={arabicText.startTime} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'endTime']}
                          rules={[{ required: true, message: arabicText.endTime }]}
                        >
                          <TimePicker format="HH:mm" placeholder={arabicText.endTime} />
                        </Form.Item>
                        <Form.Item
                          {...restField}
                          name={[name, 'isActive']}
                          valuePropName="checked"
                          initialValue={true}
                        >
                          <Checkbox>{arabicText.active}</Checkbox>
                        </Form.Item>
                        <MinusCircleOutlined onClick={() => remove(name)} />
                      </Space>
                    ))}
                    <Form.Item>
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        {arabicText.addTimeSlot}
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Card>

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

        {/* Delete confirmation modal */}
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
  )
}

export default MedicalDevicesPage