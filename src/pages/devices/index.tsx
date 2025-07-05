"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  Table,
  Tag,
  Space,
  Button,
  Modal,
  Form,
  Input,
  Select,
  TimePicker,
  DatePicker,
  Upload,
  message,
  Image,
  ConfigProvider,
} from "antd"
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons"
import { getBranches } from "../../api/regions&branches"
import { fetchDepartments } from "../../api/departments"
import moment from "moment"
import arabic from "antd/lib/locale/ar_EG"
import { addDevice, deleteDevice, getDevices, updateDevice } from "../../api/devices"

const { Option } = Select
const { TextArea } = Input

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
}

type WeekDay = "الأحد" | "الاثنين" | "الثلاثاء" | "الأربعاء" | "الخميس" | "الجمعة" | "السبت"

interface WorkingTimeSlot {
  type: "singleDate" | "dateRange"
  date?: string
  startTime?: string
  endTime?: string
  startDay?: WeekDay
  endDay?: WeekDay
  recurringTime?: {
    startTime: string
    endTime: string
  }
}

interface Branch {
  id: string
  name: string
  address: string
  location_link: string
  working_hours?: Array<{
    days: string
    time: string
  }>
  region: string
  image?: string
  coordinates: { latitude: number; longitude: number }
}

interface Department {
  _id: string
  id: number
  name: string
  description?: string
  imageUrl?: string
}

interface Device {
  id: string
  _id: string
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

  const weekDays: WeekDay[] = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [devicesData, branchesData, departmentsData] = await Promise.all([
          getDevices(),
          getBranches(),
          fetchDepartments(),
        ])
        setDevices(devicesData)
        setBranches(branchesData.data)
        setDepartments(departmentsData)
        setLoading(false)
      } catch (error) {
        message.error(arabicText.operationFailed)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "-"
    try {
      return moment(dateString).format("DD MMMM YYYY")
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString?: string): string => {
    if (!timeString) return "-"
    try {
      return moment(timeString, "HH:mm").format("HH:mm")
    } catch {
      return timeString
    }
  }

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
    // Set initial working time slots
    form.setFieldsValue({
      working_time_slots: [],
    })
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
      setDevices(devices.filter((device) => device._id !== deviceToDelete))
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
      setLoading(true)
      const values = await form.validateFields()

      // Handle empty working_time_slots
      const workingTimeSlots = values.working_time_slots || []

      const formattedSlots = workingTimeSlots.map((slot: any) => {
        if (slot.type === "singleDate") {
          return {
            ...slot,
            date: slot.date?.format("YYYY-MM-DD"),
            startTime: slot.startTime?.format("HH:mm"),
            endTime: slot.endTime?.format("HH:mm"),
          }
        } else {
          return {
            ...slot,
            recurringTime: slot.recurringTime
              ? {
                  startTime: slot.recurringTime.startTime?.format("HH:mm"),
                  endTime: slot.recurringTime.endTime?.format("HH:mm"),
                }
              : undefined,
          }
        }
      })

      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("description", values.description || "")
      formData.append("sessionPeriod", values.sessionPeriod)
      formData.append("department_id", JSON.stringify(values.department_id))
      formData.append("branches", JSON.stringify(values.branches))
      formData.append("working_time_slots", JSON.stringify(formattedSlots))

      if (values.imageFile) {
        formData.append("image", values.imageFile)
      } else if (editingDevice?.image && !values.imageFile) {
        formData.append("keepExistingImage", "true")
      }

      if (editingDevice) {
        const updatedDevice = await updateDevice(editingDevice._id, formData)
        setDevices(devices.map((device) => (device._id === editingDevice._id ? updatedDevice : device)))
        message.success(arabicText.deviceUpdated)
      } else {
        const newDevice = await addDevice(formData)
        setDevices([...devices, newDevice])
        message.success(arabicText.deviceAdded)
      }

      setIsModalVisible(false)
    } catch (error) {
      console.error("Error:", error)
      message.error(arabicText.operationFailed)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: arabicText.deviceImage,
      dataIndex: "image",
      key: "image",
      render: (url: string) =>
        url ? (
          <Image src={url || "/placeholder.svg"} alt="device" width={50} height={50} style={{ objectFit: "cover" }} />
        ) : (
          "-"
        ),
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
      render: (departmentIds: number[]) => (
        <span>{departmentIds.map((id) => departments.find((d) => d.id === id)?.name || id).join(", ")}</span>
      ),
    },
    {
      title: arabicText.branches,
      dataIndex: "branches",
      key: "branches",
      render: (branchIds: number[]) => (
        <span>
          {branchIds
            .map((id) => {
              const branch = branches.find((b) => b.id.toString() === id.toString())
              return branch ? branch.name : id
            })
            .join(", ")}
        </span>
      ),
    },
    {
      title: arabicText.workingTimeSlots,
      dataIndex: "working_time_slots",
      key: "working_time_slots",
      render: (slots: WorkingTimeSlot[]) => (
        <Space direction="vertical">
          {slots.map((slot, index) => (
            <div key={index}>
              {slot.type === "singleDate" ? (
                <div>
                  <Tag color="blue">{arabicText.singleDate}</Tag>
                  {formatDateTime(slot.date)}
                  {slot.startTime && (
                    <>
                      {" "}
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </>
                  )}
                </div>
              ) : (
                <div>
                  <Tag color="green">{arabicText.dateRange}</Tag>
                  {slot.startDay} {arabicText.to} {slot.endDay}
                  {slot.recurringTime && (
                    <>
                      {" "}
                      {formatTime(slot.recurringTime.startTime)} - {formatTime(slot.recurringTime.endTime)}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </Space>
      ),
    },
    {
      title: arabicText.sessionPeriod,
      dataIndex: "sessionPeriod",
      key: "sessionPeriod",
      render: (period: string) => `${period} دقيقة`,
    },
    {
      title: arabicText.actions,
      key: "actions",
      render: (_: any, record: Device) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>{arabicText.edit}</Button>
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

        <Modal
          title={editingDevice ? arabicText.editDevice : arabicText.addDevice}
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={() => setIsModalVisible(false)}
          width={800}
          confirmLoading={loading}
          destroyOnClose={true}
          okText={arabicText.ok}
          cancelText={arabicText.cancel}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="imageFile"
              label={arabicText.deviceImage}
              valuePropName="file"
              getValueFromEvent={(e) => e?.fileList[0]?.originFileObj || null}
            >
              <Upload
                accept="image/*"
                listType="picture-card"
                fileList={fileList}
                beforeUpload={handleBeforeUpload}
                onChange={handleImageChange}
                maxCount={1}
                onRemove={() => {
                  setImagePreview("")
                  return true
                }}
              >
                {fileList.length >= 1 ? null : (
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>{arabicText.uploadImage}</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            {imagePreview && (
              <div style={{ marginBottom: 16, textAlign: "center" }}>
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="preview"
                  width={200}
                  style={{ maxHeight: 200, objectFit: "contain" }}
                />
              </div>
            )}

            <Form.Item
              name="name"
              label={arabicText.deviceName}
              rules={[{ required: true, message: arabicText.deviceNameRequired }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="description" label={arabicText.description}>
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item
              name="department_id"
              label={arabicText.departments}
              rules={[{ required: true, message: arabicText.departmentsRequired }]}
            >
              <Select mode="multiple" placeholder={arabicText.departments}>
                {departments.map((department) => (
                  <Option key={department.id} value={department.id}>
                    {department.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="branches"
              label={arabicText.branches}
              rules={[{ required: true, message: arabicText.branchesRequired }]}
            >
              <Select mode="multiple" placeholder={arabicText.branches}>
                {branches.map((branch) => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="sessionPeriod"
              label={arabicText.sessionPeriod}
              rules={[{ required: true, message: arabicText.sessionPeriodRequired }]}
            >
              <Input type="number" min={1} addonAfter="دقيقة" />
            </Form.Item>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: "bold" }}>{arabicText.workingTimeSlots}</label>
              <div style={{ color: "#666", fontSize: "12px" }}>اختياري - يمكنك إضافة مواعيد العمل</div>
            </div>

            <Form.List name="working_time_slots">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, "type"]}
                        rules={[{ required: true, message: arabicText.missingType }]}
                      >
                        <Select placeholder="اختر النوع" style={{ width: 150 }}>
                          <Option value="singleDate">{arabicText.singleDate}</Option>
                          <Option value="dateRange">{arabicText.dateRange}</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        noStyle
                        shouldUpdate={(prevValues, currentValues) =>
                          prevValues.working_time_slots?.[name]?.type !== currentValues.working_time_slots?.[name]?.type
                        }
                      >
                        {({ getFieldValue }) => {
                          const type = getFieldValue(["working_time_slots", name, "type"])

                          if (type === "singleDate") {
                            return (
                              <>
                                <Form.Item
                                  {...restField}
                                  name={[name, "date"]}
                                  rules={[{ required: true, message: arabicText.missingDate }]}
                                >
                                  <DatePicker format="YYYY-MM-DD" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "startTime"]}
                                  rules={[{ required: true, message: arabicText.missingTime }]}
                                >
                                  <TimePicker format="HH:mm" />
                                </Form.Item>
                                <span>-</span>
                                <Form.Item
                                  {...restField}
                                  name={[name, "endTime"]}
                                  rules={[{ required: true, message: arabicText.missingTime }]}
                                >
                                  <TimePicker format="HH:mm" />
                                </Form.Item>
                              </>
                            )
                          } else if (type === "dateRange") {
                            return (
                              <>
                                <Form.Item
                                  {...restField}
                                  name={[name, "startDay"]}
                                  rules={[{ required: true, message: arabicText.missingDay }]}
                                >
                                  <Select placeholder={arabicText.startDay} style={{ width: 120 }}>
                                    {weekDays.map((day) => (
                                      <Option key={day} value={day}>
                                        {day}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                                <span>{arabicText.to}</span>
                                <Form.Item
                                  {...restField}
                                  name={[name, "endDay"]}
                                  rules={[{ required: true, message: arabicText.missingDay }]}
                                >
                                  <Select placeholder={arabicText.endDay} style={{ width: 120 }}>
                                    {weekDays.map((day) => (
                                      <Option key={day} value={day}>
                                        {day}
                                      </Option>
                                    ))}
                                  </Select>
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "recurringTime", "startTime"]}
                                  rules={[{ required: true, message: arabicText.missingTime }]}
                                >
                                  <TimePicker format="HH:mm" />
                                </Form.Item>
                                <span>-</span>
                                <Form.Item
                                  {...restField}
                                  name={[name, "recurringTime", "endTime"]}
                                  rules={[{ required: true, message: arabicText.missingTime }]}
                                >
                                  <TimePicker format="HH:mm" />
                                </Form.Item>
                              </>
                            )
                          }
                          return null
                        }}
                      </Form.Item>

                      <Button type="link" danger onClick={() => remove(name)}>
                        {arabicText.remove}
                      </Button>
                    </Space>
                  ))}

                  <Form.Item>
                    <Button type="dashed" onClick={() => add({ type: "singleDate" })} block>
                      {arabicText.addTimeSlot}
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </Modal>

        <Modal
          title={arabicText.confirmDelete}
          visible={deleteModalVisible}
          onOk={confirmDelete}
          onCancel={() => setDeleteModalVisible(false)}
          confirmLoading={loading}
          okText={arabicText.ok}
          cancelText={arabicText.cancel}
        >
          <p>{arabicText.deleteConfirmMessage}</p>
        </Modal>
      </div>
    </ConfigProvider>
  )
}

export default MedicalDevicesPage
