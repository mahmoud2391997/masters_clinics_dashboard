"use client"

import type React from "react"
import { useState, useEffect, useMemo, useCallback } from "react"
import type { ChangeEvent } from "react"
import {
  Box,
  TextField,
  MenuItem,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Typography,
  IconButton,
  ListItemSecondaryAction,
  Chip,
  Tooltip,
  Alert,
  Popover,
  Badge,

} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import CloseIcon from "@mui/icons-material/Close"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import ScheduleIcon from "@mui/icons-material/Schedule"
import PaidIcon from "@mui/icons-material/Paid"
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { ar } from "date-fns/locale"

// Interfaces
interface FormField {
  key: string
  label?: string
}

interface CallLog {
  id?: string
  timestamp: string
  status: string
  notes?: string
  agentName?: string
  editedBy?: string
}

interface Appointment {
  id: string
  _id?: string
  name: string
  phone: string
  branch: string
  createdAt: string
  scheduledAt?: string | null
  landingPageId: string
  utmSource?: string
  doctor?: string
  offer?: string
  device?: string
  type?: string
  clientId?: number | null
  bookingId?: string | null
  is_authed: number
  payment_session_id?: string | null
  payment_status: string
  paid_at?: string | null
  stripe_payment_intent_id?: string | null
  pageCreator?: string | null
  pageTitle?: string | null
  callLogs?: CallLog[]
  [key: string]: any
}

interface DataTableProps {
  formFields?: FormField[]
  data?: Appointment[]
  onDelete?: (id: string) => void
  onView?: (row: Appointment) => void
  userRole: "customercare" | "mediabuyer" | "admin"
}

interface State {
  search: string
  branchFilter: string
  paymentFilter: string
  authFilter: string
  loading: boolean
  error: string | null
  fetchedData: Appointment[]
  selectedAppointment: Appointment | null
  callLogDialogOpen: boolean
  newCallLogStatus: string
  newCallLogNotes: string
  editingLogId: string | null
  editedLogStatus: string
  editedLogNotes: string
  deleteConfirmOpen: boolean
  appointmentToDelete: string | null
  currentPage: number
  totalPages: number
  scheduleAnchorEl: HTMLElement | null
  schedulingAppointment: Appointment | null
  newScheduledDateTime: Date | null
  isScheduling: boolean
}

// API functions
const updateAppointments = async (id: string, data: Partial<Appointment>) => {
  try {
    const token = sessionStorage.getItem("token")
    const response = await fetch(`https://www.ss.mastersclinics.com/appointments/${id}`, {
      method: "PUT",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to update appointment")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating appointment:", error)
    throw error
  }
}

const deleteAppointment = async (id: string) => {
  try {
    const token = sessionStorage.getItem("token")
    const response = await fetch(`https://www.ss.mastersclinics.com/appointments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete appointment")
    }

    return await response.json()
  } catch (error) {
    console.error("Error deleting appointment:", error)
    throw error
  }
}

const statusColors: Record<string, "warning" | "info" | "success" | "error" | "default"> = {
  "لم يتم التواصل": "warning",
  استفسار: "info",
  مهتم: "success",
  "غير مهتم": "error",
  "تم الحجز": "success",
  "تم التواصل علي الواتس اب": "success",
  "لم يتم الرد": "warning",
  "طلب التواصل في وقت اخر": "info",
}

const paymentStatusColors: Record<string, "success" | "warning" | "error" | "default"> = {
  paid: "success",
  pending: "warning",
  unpaid: "error",
}

const statusOptions = [
  "لم يتم التواصل",
  "استفسار",
  "مهتم",
  "غير مهتم",
  "تم الحجز",
  "تم التواصل علي الواتس اب",
  "لم يتم الرد",
  "طلب التواصل في وقت اخر",
]

const defaultFormFields: FormField[] = [
  { key: "name", label: "الاسم" },
  { key: "phone", label: "الهاتف" },
  { key: "branch", label: "الفرع" },
  { key: "doctor_offer", label: "الطبيب/العرض" },
  { key: "pageCreator", label: "منشئ الصفحة" },
  { key: "pageTitle", label: "عنوان الصفحة" },
  { key: "utmSource", label: "المصدر" },
  { key: "createdAt", label: "تاريخ الإنشاء" },
]

const defaultData: Appointment[] = []

const DataTable: React.FC<Partial<DataTableProps>> = ({
  formFields = defaultFormFields,
  data = defaultData,
  userRole = "customercare",
}) => {
  const [state, setState] = useState<State>({
    search: "",
    branchFilter: "all",
    paymentFilter: "all",
    authFilter: "all",
    loading: false,
    error: null,
    fetchedData: data,
    selectedAppointment: null,
    callLogDialogOpen: false,
    newCallLogStatus: "",
    newCallLogNotes: "",
    editingLogId: null,
    editedLogStatus: "",
    editedLogNotes: "",
    deleteConfirmOpen: false,
    appointmentToDelete: null,
    currentPage: 1,
    totalPages: 1,
    scheduleAnchorEl: null,
    schedulingAppointment: null,
    newScheduledDateTime: null,
    isScheduling: false,
  })

  const {
    search,
    branchFilter,
    paymentFilter,
    authFilter,
    loading,
    error,
    fetchedData,
    selectedAppointment,
    callLogDialogOpen,
    newCallLogStatus,
    newCallLogNotes,
    editingLogId,
    editedLogStatus,
    editedLogNotes,
    deleteConfirmOpen,
    appointmentToDelete,
    currentPage,
    totalPages,
    scheduleAnchorEl,
    schedulingAppointment,
    newScheduledDateTime,
    isScheduling,
  } = state

  const role = userRole || (sessionStorage.getItem("role") ?? "customercare")
  const username = sessionStorage.getItem("username") || "غير معروف"

  const fetchWithToken = async (url: string, options: RequestInit = {}) => {
    const token = sessionStorage.getItem("token")
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    })
  }

  // Utility functions for datetime handling
  const formatDateTimeForMySQL = (datetime: Date): string => {
    if (!datetime) return ""

    const year = datetime.getFullYear()
    const month = String(datetime.getMonth() + 1).padStart(2, "0")
    const day = String(datetime.getDate()).padStart(2, "0")
    const hours = String(datetime.getHours()).padStart(2, "0")
    const minutes = String(datetime.getMinutes()).padStart(2, "0")

    return `${year}-${month}-${day} ${hours}:${minutes}:00`
  }


  const formatDisplayDateTime = (mysqlDateTime: string): string => {
    if (!mysqlDateTime) return "-"

    try {
      const [datePart, timePart] = mysqlDateTime.split(" ")
      if (!datePart || !timePart) return mysqlDateTime

      const [year, month, day] = datePart.split("-").map(Number)
      const [hours, minutes, seconds = 0] = timePart.split(":").map(Number)

      const date = new Date(year, month - 1, day, hours, minutes, seconds)

      if (isNaN(date.getTime())) {
        console.error("Invalid date for display:", mysqlDateTime)
        return mysqlDateTime
      }

      return date.toLocaleString("ar-EG", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    } catch (error) {
      console.error("Error formatting display date:", error, mysqlDateTime)
      return mysqlDateTime
    }
  }

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await fetchWithToken(`https://www.ss.mastersclinics.com/appointments?page=${currentPage}`)
      if (!response.ok) throw new Error("Network error")
      const data = await response.json()

      setState((prev) => ({
        ...prev,
        fetchedData: data.appointments || [],
        totalPages: data.totalPages || 1,
        loading: false,
      }))
    } catch (err) {
      setState((prev) => ({ ...prev, error: "فشل في تحميل البيانات", loading: false }))
    }
  }, [currentPage])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const branchOptions = useMemo(() => {
    const branches = (fetchedData || []).map((d) => d.branch).filter(Boolean)
    return Array.from(new Set(branches))
  }, [fetchedData])

  const hasUtmSource = useMemo(() => {
    return fetchedData.some((row) => !!row.utmSource)
  }, [fetchedData])

  const visibleFormFields = useMemo(() => {
    if (role === "customercare" && !hasUtmSource) {
      return formFields.filter((field) => field.key !== "utmSource")
    }
    return formFields
  }, [formFields, role, hasUtmSource])

  const deepSearch = (obj: any, searchTerm: string): boolean => {
    if (!obj) return false
    return Object.values(obj).some((val) => {
      if (typeof val === "object" && val !== null) return deepSearch(val, searchTerm)
      const stringValue = String(val ?? "").toLowerCase()
      return stringValue.includes(searchTerm.toLowerCase())
    })
  }

  const getLastCallStatus = (appointment: Appointment): CallLog | null => {
    if (!appointment.callLogs || appointment.callLogs.length === 0) {
      return null
    }
    const sortedLogs = [...appointment.callLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    return sortedLogs[0]
  }

  const filteredData = useMemo(() => {
    if (!fetchedData) return []
    return fetchedData
      .filter((row) => {
        const matchesBranch = branchFilter === "all" || row.branch === branchFilter
        const matchesPayment = paymentFilter === "all" || row.payment_status === paymentFilter
        const matchesAuth = authFilter === "all" || 
          (authFilter === "authed" && row.is_authed === 1) || 
          (authFilter === "notAuthed" && row.is_authed === 0)
        const matchesSearch = search.trim() ? deepSearch(row, search) : true
        return matchesBranch && matchesPayment && matchesAuth && matchesSearch
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, branchFilter, paymentFilter, authFilter, fetchedData])

  const handleChange = (field: keyof State) => (e: ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const openCallLogDialog = (appointment: Appointment) => {
    setState((prev) => ({
      ...prev,
      selectedAppointment: appointment,
      callLogDialogOpen: true,
      newCallLogStatus: "",
      newCallLogNotes: "",
      editingLogId: null,
      editedLogStatus: "",
      editedLogNotes: "",
    }))
  }

  const closeCallLogDialog = () => {
    setState((prev) => ({
      ...prev,
      callLogDialogOpen: false,
      selectedAppointment: null,
      editingLogId: null,
    }))
  }

  const openSchedulePopup = (event: React.MouseEvent<HTMLElement>, appointment: Appointment) => {
    let initialDate = new Date()

    if (appointment.scheduledAt) {
      const [datePart, timePart] = appointment.scheduledAt.split(" ")
      if (datePart && timePart) {
        const [year, month, day] = datePart.split("-")
        const [hours, minutes] = timePart.split(":")
        initialDate = new Date(
          Number.parseInt(year),
          Number.parseInt(month) - 1,
          Number.parseInt(day),
          Number.parseInt(hours),
          Number.parseInt(minutes),
        )
      }
    }

    setState((prev) => ({
      ...prev,
      scheduleAnchorEl: event.currentTarget,
      schedulingAppointment: appointment,
      newScheduledDateTime: initialDate,
    }))
  }

  const closeSchedulePopup = () => {
    setState((prev) => ({
      ...prev,
      scheduleAnchorEl: null,
      schedulingAppointment: null,
      newScheduledDateTime: null,
      isScheduling: false,
    }))
  }

  const scheduleAppointment = useCallback(async () => {
    if (!schedulingAppointment || !newScheduledDateTime) return

    setState((prev) => ({ ...prev, isScheduling: true, error: null }))

    try {
      const mysqlDateTime = formatDateTimeForMySQL(newScheduledDateTime)

      const schedulingLog: CallLog = {
        id: Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
        status: "تم الحجز",
        notes: `تم تحديد موعد الحجز: ${formatDisplayDateTime(mysqlDateTime)}`,
        agentName: username || "غير معروف",
      }

      const updatedLogs = [...(schedulingAppointment.callLogs || []), schedulingLog]

      await updateAppointments(schedulingAppointment.id, {
        scheduledAt: mysqlDateTime,
        callLogs: updatedLogs,
      })

      await fetchData()
      closeSchedulePopup()
    } catch (err: any) {
      console.error("[ERROR] Scheduling failed:", err)
      setState((prev) => ({
        ...prev,
        error: err.message || "فشل في تحديد الموعد",
      }))
    } finally {
      setState((prev) => ({ ...prev, isScheduling: false }))
    }
  }, [schedulingAppointment, newScheduledDateTime, username, fetchData])

  const unscheduleAppointment = useCallback(async () => {
    if (!schedulingAppointment) return

    setState((prev) => ({ ...prev, isScheduling: true, error: null }))

    try {
      const unschedulingLog: CallLog = {
        id: Math.random().toString(36).slice(2),
        timestamp: new Date().toISOString(),
        status: "تم إلغاء الحجز",
        notes: "تم إلغاء موعد الحجز",
        agentName: username || "غير معروف",
      }

      const updatedLogs = [...(schedulingAppointment.callLogs || []), unschedulingLog]

      await updateAppointments(schedulingAppointment.id, {
        scheduledAt: null,
        callLogs: updatedLogs,
      })

      await fetchData()
      closeSchedulePopup()
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        error: err.message || "فشل في إلغاء الموعد",
      }))
    } finally {
      setState((prev) => ({ ...prev, isScheduling: false }))
    }
  }, [schedulingAppointment, username, fetchData])

  const addNewCallLog = useCallback(async () => {
    if (!selectedAppointment || !newCallLogStatus || !statusOptions.includes(newCallLogStatus)) return

    try {
      const newLog: CallLog = {
        timestamp: new Date().toISOString(),
        status: newCallLogStatus,
        notes: newCallLogNotes,
        agentName: username || "غير معروف",
      }

      const updatedLogs = [...(selectedAppointment.callLogs || []), newLog]
      await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs })

      await fetchData()

      setState((prev) => ({
        ...prev,
        newCallLogStatus: "",
        newCallLogNotes: "",
      }))
    } catch (err) {
      console.error("Failed to add call log:", err)
      setState((prev) => ({
        ...prev,
        error: "فشل في إضافة سجل الاتصال",
      }))
    }
  }, [selectedAppointment, newCallLogStatus, newCallLogNotes, username, fetchData])

  const startEditingLog = (log: CallLog) => {
    setState((prev) => ({
      ...prev,
      editingLogId: log.id ?? null,
      editedLogStatus: log.status,
      editedLogNotes: log.notes || "",
    }))
  }

  const cancelEditing = () => {
    setState((prev) => ({
      ...prev,
      editingLogId: null,
      editedLogStatus: "",
      editedLogNotes: "",
    }))
  }

  const saveEditedLog = async () => {
    if (!selectedAppointment || !editingLogId) return

    try {
      const updatedLogs = (selectedAppointment.callLogs || []).map((log) =>
        log.id === editingLogId
          ? {
              ...log,
              status: editedLogStatus,
              notes: editedLogNotes,
              timestamp: new Date().toISOString(),
              editedBy: username,
            }
          : log,
      )

      await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs })

      await fetchData()

      setState((prev) => ({
        ...prev,
        editingLogId: null,
        editedLogStatus: "",
        editedLogNotes: "",
      }))
    } catch (err) {
      console.error("Failed to save edited call log:", err)
      setState((prev) => ({
        ...prev,
        error: "فشل في حفظ التعديلات",
      }))
    }
  }

  const deleteCallLog = async (logId: string) => {
    if (!selectedAppointment) return

    try {
      const updatedLogs = (selectedAppointment.callLogs || []).filter((log) => log.id !== logId)
      await updateAppointments(selectedAppointment.id, { callLogs: updatedLogs })

      await fetchData()
    } catch (err) {
      console.error("Failed to delete call log:", err)
      setState((prev) => ({
        ...prev,
        error: "فشل في حذف سجل الاتصال",
      }))
    }
  }

  const openDeleteConfirm = (appointmentId: string) => {
    setState((prev) => ({
      ...prev,
      deleteConfirmOpen: true,
      appointmentToDelete: appointmentId,
    }))
  }

  const closeDeleteConfirm = () => {
    setState((prev) => ({
      ...prev,
      deleteConfirmOpen: false,
      appointmentToDelete: null,
    }))
  }

  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return

    try {
      await deleteAppointment(appointmentToDelete)
      await fetchData()
      closeDeleteConfirm()
    } catch (err) {
      console.error("Failed to delete appointment:", err)
      setState((prev) => ({
        ...prev,
        error: "فشل في حذف الموعد",
        deleteConfirmOpen: false,
        appointmentToDelete: null,
      }))
    }
  }



  const renderDoctorOffer = (row: Appointment) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      {row.doctor && <Typography variant="body2">الطبيب: {row.doctor}</Typography>}
      {row.offer && <Typography variant="body2">العرض: {row.offer}</Typography>}
      {!row.doctor && !row.offer && "-"}
    </Box>
  )

  const renderScheduledAt = (scheduledAt: string | null | undefined) => {
    if (!scheduledAt) return "-"
    return formatDisplayDateTime(scheduledAt)
  }

  const isScheduleOpen = Boolean(scheduleAnchorEl)
  const scheduleId = isScheduleOpen ? "schedule-popover" : undefined

  const handleScheduleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!isScheduling && newScheduledDateTime) {
        scheduleAppointment()
      }
    },
    [isScheduling, newScheduledDateTime, scheduleAppointment],
  )

  const handleUnscheduleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!isScheduling) {
        unscheduleAppointment()
      }
    },
    [isScheduling, unscheduleAppointment],
  )

  const handlePaginationClick = useCallback(
    (direction: "prev" | "next") => (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setState((prev) => ({
        ...prev,
        currentPage: direction === "prev" ? prev.currentPage - 1 : prev.currentPage + 1,
      }))
    },
    [setState],
  )

  const handleAddCallLogClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (newCallLogStatus) {
        addNewCallLog()
      }
    },
    [newCallLogStatus, addNewCallLog],
  )

  return (
    <div className="p-2">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setState((prev) => ({ ...prev, error: null }))}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField label="بحث" value={search} onChange={handleChange("search")} sx={{ minWidth: 200 }} />
        <TextField
          select
          label="فرع"
          value={branchFilter}
          onChange={handleChange("branchFilter")}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">الكل</MenuItem>
          {branchOptions.map((branch) => (
            <MenuItem key={branch} value={branch}>
              {branch}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="حالة الدفع"
          value={paymentFilter}
          onChange={handleChange("paymentFilter")}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="paid">مدفوع</MenuItem>
          <MenuItem value="pending">قيد الانتظار</MenuItem>
          <MenuItem value="unpaid">غير مدفوع</MenuItem>
        </TextField>
        <TextField
          select
          label="حالة التوثيق"
          value={authFilter}
          onChange={handleChange("authFilter")}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">الكل</MenuItem>
          <MenuItem value="authed">موثوق</MenuItem>
          <MenuItem value="notAuthed">غير موثوق</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
        <Table stickyHeader size="small" aria-label="appointments table">
          <TableHead>
            <TableRow>
              {visibleFormFields.map((field) => (
                <TableCell key={field.key} align="left">
                  {field.label}
                </TableCell>
              ))}
              <TableCell>حالة الدفع</TableCell>
              <TableCell>حالة التوثيق</TableCell>
              <TableCell>موعد الحجز</TableCell>
              <TableCell>آخر حالة</TableCell>
              <TableCell>سجلات الاتصال</TableCell>
              <TableCell>إجراءات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={visibleFormFields.length + 6} align="center">
                  ... جاري التحميل
                </TableCell>
              </TableRow>
            )}
            {!loading && filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={visibleFormFields.length + 6} align="center">
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            )}
            {filteredData.map((row) => {
              const lastCall = getLastCallStatus(row)
              return (
                <TableRow key={row.id} hover>
                  {visibleFormFields.map((field) => (
                    <TableCell key={field.key}>
                      {field.key === "createdAt"
                        ? new Date(row[field.key]).toLocaleString("ar-EG", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : field.key === "doctor_offer"
                          ? renderDoctorOffer(row)
                          : (row[field.key] ?? "-")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Chip
                      label={row.payment_status === "paid" ? "مدفوع" : row.payment_status === "pending" ? "قيد الانتظار" : "غير مدفوع"}
                      color={paymentStatusColors[row.payment_status] || "default"}
                      size="small"
                      icon={row.payment_status === "paid" ? <PaidIcon /> : undefined}

                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Tooltip title={row.is_authed === 1 ? "موثوق" : "غير موثوق"}>
                        <Badge
                          color={row.is_authed === 1 ? "success" : "error"}
                          badgeContent={row.is_authed === 1 ? "✓" : "✗"}
                        >
                          <VerifiedUserIcon color={row.is_authed === 1 ? "success" : "disabled"} />
                        </Badge>
                      </Tooltip>
                      {/* {(role === "admin" || role === "mediabuyer") && (
                        <Switch
                          checked={row.is_authed === 1}
                          onChange={() => toggleAuthStatus(row)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )} */}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <span>{renderScheduledAt(row.scheduledAt)}</span>
                      {(role !== "mediabuyer" && row.is_authed === 1) && (
                        <IconButton
                          size="small"
                          onClick={(e) => openSchedulePopup(e, row)}
                          color={row.scheduledAt ? "primary" : "default"}
                        >
                          <ScheduleIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {lastCall ? (
                      <Tooltip
                        title={`${new Date(lastCall.timestamp).toLocaleString("ar-EG", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })} - ${lastCall.agentName}`}
                      >
                        <Chip
                          label={lastCall.status}
                          color={statusColors[lastCall.status] || "default"}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    ) : (
                      <Chip label="لا يوجد" color="default" size="small" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => openCallLogDialog(row)} sx={{ mr: 1 }}>
                      عرض ({row.callLogs?.length || 0})
                    </Button>
                  </TableCell>
                  <TableCell>
                    {role === "mediabuyer" && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => openDeleteConfirm(row.id)}
                        startIcon={<DeleteIcon fontSize="small" />}
                      >
                        حذف
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Schedule Popover */}
      <Popover
        id={scheduleId}
        open={isScheduleOpen}
        anchorEl={scheduleAnchorEl}
        onClose={closeSchedulePopup}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Box sx={{ p: 2, minWidth: 350 }}>
          <Typography variant="h6" gutterBottom>
            تحديد موعد الحجز
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {schedulingAppointment?.name} - {schedulingAppointment?.phone}
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
            <DateTimePicker
              label="تاريخ ووقت الموعد"
              value={newScheduledDateTime}
              onChange={(newValue) => {
                setState((prev) => ({ ...prev, newScheduledDateTime: newValue }))
              }}
              ampm={true}
              format="dd/MM/yyyy hh:mm a"
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: "normal",
                  dir: "rtl",
                },
              }}
            />
          </LocalizationProvider>

          <Box sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "space-between" }}>
            {schedulingAppointment?.scheduledAt && (
              <Button variant="outlined" color="error" onClick={handleUnscheduleClick} disabled={isScheduling}>
                إلغاء الموعد
              </Button>
            )}
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button onClick={closeSchedulePopup} disabled={isScheduling}>
                إلغاء
              </Button>
              <Button
                variant="contained"
                onClick={handleScheduleClick}
                disabled={isScheduling || !newScheduledDateTime}
              >
                {isScheduling ? "جاري الحفظ..." : "حفظ الموعد"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Popover>

      {/* Pagination Controls */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
        <Button variant="outlined" disabled={currentPage === 1} onClick={handlePaginationClick("prev")} size="small">
          الصفحة السابقة
        </Button>
        <Typography variant="body2" sx={{ alignSelf: "center" }}>
          الصفحة {currentPage} من {totalPages}
        </Typography>
        <Button
          variant="outlined"
          disabled={currentPage === totalPages}
          onClick={handlePaginationClick("next")}
          size="small"
        >
          الصفحة التالية
        </Button>
      </Box>

      {/* Call Log Dialog */}
      <Dialog open={callLogDialogOpen} onClose={closeCallLogDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box>
            <Typography variant="h6">
              سجلات الاتصال: {selectedAppointment?.name} - {selectedAppointment?.phone}
            </Typography>
            <Box sx={{ mt: 1 }}>
              {selectedAppointment?.doctor && (
                <Typography variant="body2">الطبيب: {selectedAppointment.doctor}</Typography>
              )}
              {selectedAppointment?.offer && (
                <Typography variant="body2">العرض: {selectedAppointment.offer}</Typography>
              )}
              {selectedAppointment?.scheduledAt && (
                <Typography variant="body2" color="primary">
                  موعد الحجز: {formatDisplayDateTime(selectedAppointment.scheduledAt)}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Chip
                  label={selectedAppointment?.payment_status === "paid" ? "مدفوع" : selectedAppointment?.payment_status === "pending" ? "قيد الانتظار" : "غير مدفوع"}
                  color={paymentStatusColors[selectedAppointment?.payment_status || "unpaid"] || "default"}
                  size="small"
                />
                <Chip
                  label={selectedAppointment?.is_authed === 1 ? "موثوق" : "غير موثوق"}
                  color={selectedAppointment?.is_authed === 1 ? "success" : "error"}
                  size="small"
                />
              </Box>
            </Box>
          </Box>
          <IconButton aria-label="close" onClick={closeCallLogDialog} sx={{ position: "absolute", left: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <List dense>
            {(selectedAppointment?.callLogs || []).map((log) => (
              <ListItem key={log.id} alignItems="flex-start" divider>
                {editingLogId === log.id ? (
                  <Box sx={{ width: "100%" }}>
                    <TextField
                      select
                      label="الحالة"
                      value={editedLogStatus}
                      onChange={(e) => setState((prev) => ({ ...prev, editedLogStatus: e.target.value }))}
                      fullWidth
                      margin="dense"
                      size="small"
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip
                              label={status}
                              color={statusColors[status] || "default"}
                              size="small"
                              sx={{ mr: 1 }}
                            />
                            {status}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="ملاحظات"
                      value={editedLogNotes}
                      onChange={(e) => setState((prev) => ({ ...prev, editedLogNotes: e.target.value }))}
                      fullWidth
                      multiline
                      rows={2}
                      margin="dense"
                      size="small"
                    />
                    <Box sx={{ mt: 1, display: "flex", gap: 1, justifyContent: "flex-end" }}>
                      <Button onClick={cancelEditing} size="small">
                        إلغاء
                      </Button>
                      <Button variant="contained" onClick={saveEditedLog} size="small">
                        حفظ
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip label={log.status} color={statusColors[log.status] || "default"} size="small" />
                          {log.editedBy && (
                            <Typography variant="caption" color="text.secondary">
                              (تم التعديل بواسطة: {log.editedBy})
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {log.notes || "لا توجد ملاحظات"}
                          </Typography>
                          <br />
                          <Typography component="span" variant="caption" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString("ar-EG", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}{" "}
                            - الوكيل: {log.agentName || "غير معروف"}
                          </Typography>
                        </>
                      }
                    />
                    {(role === "customercare" || role === "admin") && (
                      <ListItemSecondaryAction>
                        <Tooltip title="تعديل">
                          <IconButton edge="end" aria-label="edit" onClick={() => startEditingLog(log)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => log.id && deleteCallLog(log.id)}
                            size="small"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </>
                )}
              </ListItem>
            ))}
          </List>

          {(role === "customercare" || role === "admin") && (
            <Box sx={{ mt: 2, borderTop: "1px solid #eee", pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                إضافة سجل جديد
              </Typography>
              <TextField
                select
                label="الحالة"
                value={newCallLogStatus}
                onChange={handleChange("newCallLogStatus")}
                fullWidth
                margin="dense"
                size="small"
                required
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip label={status} color={statusColors[status] || "default"} size="small" sx={{ mr: 1 }} />
                      {status}
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ملاحظات"
                value={newCallLogNotes}
                onChange={handleChange("newCallLogNotes")}
                fullWidth
                multiline
                rows={2}
                margin="dense"
                size="small"
              />
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ mt: 1 }}
                onClick={handleAddCallLogClick}
                disabled={!newCallLogStatus}
                size="small"
              >
                إضافة سجل
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCallLogDialog} size="small">
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={closeDeleteConfirm}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Alert severity="warning">هل أنت متأكد أنك تريد حذف هذا الموعد؟ هذا الإجراء لا يمكن التراجع عنه.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirm} color="primary">
            إلغاء
          </Button>
          <Button onClick={confirmDeleteAppointment} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default DataTable;