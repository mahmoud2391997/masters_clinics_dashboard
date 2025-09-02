import React, { useState, useCallback, useMemo, useEffect } from "react"
import { 
  Calendar, 
  Clock, 
  Trash2, 
  History, 
  Plus, 
  Edit, 
  X, 
  Search, 
  Filter, 
  StickyNote, 
  Check, 
  XCircle, 
  User,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
 
} from "lucide-react"

// Date utility functions
const formatDateTimeForMySQL = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const formatDisplayDateTime = (dateTime: string | Date): string => {
  if (!dateTime) return '-';
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / (1000 * 60));
  const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHrs < 24) return `منذ ${diffHrs} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-EG');
};

const createTimestamp = (): string => {
  return new Date().toISOString();
};

const isValidTimestamp = (timestamp: string): boolean => {
  return !isNaN(Date.parse(timestamp));
};

const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

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
  timezone?: string
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
  is_authed: number
  payment_status: string
  status: string
  callLogs?: CallLog[]
  pageCreator?: string
  pageTitle?: string
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
  statusFilter: string
  loading: boolean
  error: string | null
  fetchedData: Appointment[]
  selectedAppointment: Appointment | null
  callLogDialogOpen: boolean
  deleteConfirmOpen: boolean
  appointmentToDelete: string | null
  currentPage: number
  totalPages: number
  schedulePopupOpen: boolean
  schedulingAppointment: Appointment | null
  newScheduledDateTime: string
  isScheduling: boolean
}

// Status options and colors
const appointmentStatusOptions = ["pending", "confirmed", "completed", "cancelled"]

const appointmentStatusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const appointmentStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "أُلغيت",
};

const callLogStatusOptions = [
  'لم يتم التواصل',
  'استفسار',
  'مهتم',
  'غير مهتم',
  'تم الحجز',
  'تم التواصل علي الواتس اب',
  'لم يتم الرد',
  'طلب التواصل في وقت اخر',
];

const statusColors: Record<string, string> = {
  'لم يتم التواصل': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'استفسار': 'bg-blue-100 text-blue-800 border-blue-200',
  'مهتم': 'bg-green-100 text-green-800 border-green-200',
  'غير مهتم': 'bg-red-100 text-red-800 border-red-200',
  'تم الحجز': 'bg-green-100 text-green-800 border-green-200',
  'تم التواصل علي الواتس اب': 'bg-green-100 text-green-800 border-green-200',
  'لم يتم الرد': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'طلب التواصل في وقت اخر': 'bg-blue-100 text-blue-800 border-blue-200',
};

const paymentStatusColors: Record<string, string> = {
  "paid": "bg-green-100 text-green-800 border-green-200",
  "pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "unpaid": "bg-red-100 text-red-800 border-red-200",
}

const authStatusColors: Record<string, string> = {
  "1": "bg-green-100 text-green-800",
  "0": "bg-red-100 text-red-800",
}

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

// API functions
const updateAppointments = async (id: string, data: Partial<Appointment>) => {
  console.log(`Updating appointment ${id} with data:`, data);
  if (data.callLogs) {
    data.callLogs = data.callLogs.map(log => ({
      ...log,
      timestamp: log.timestamp || createTimestamp(),
      timezone: log.timezone || getUserTimezone(),
    }));
  }
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

// Chip Component
const Chip: React.FC<{
  label: string
  className?: string
  size?: 'small' | 'medium'
}> = ({ label, className = "", size = 'small' }) => {
  const sizeClass = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${className}`}>
      {label}
    </span>
  )
}

// Badge Component
const Badge: React.FC<{
  children: React.ReactNode
  className?: string
  badgeContent: string | number
}> = ({ children, className = "", badgeContent }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badgeContent}
      </span>
    </div>
  )
}

// DataTable Component
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
    statusFilter: "all",
    loading: false,
    error: null,
    fetchedData: data,
    selectedAppointment: null,
    callLogDialogOpen: false,
    deleteConfirmOpen: false,
    appointmentToDelete: null,
    currentPage: 1,
    totalPages: 1,
    schedulePopupOpen: false,
    schedulingAppointment: null,
    newScheduledDateTime: "",
    isScheduling: false,
  })

  const {
    search,
    branchFilter,
    paymentFilter,
    authFilter,
    statusFilter,
    loading,
    error,
    fetchedData,
    selectedAppointment,
    callLogDialogOpen,
    deleteConfirmOpen,
    appointmentToDelete,
    currentPage,
    totalPages,
    schedulePopupOpen,
    schedulingAppointment,
    newScheduledDateTime,
    isScheduling,
  } = state

  const role = userRole || (sessionStorage.getItem("role") ?? "customercare")
  const username = sessionStorage.getItem("username") || "غير معروف"

  const canScheduleAppointments = role === "customercare"

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
        const matchesSearch = search.trim() ? deepSearch(row, search) : true
        const matchesPayment = paymentFilter === "all" || row.payment_status === paymentFilter
        const matchesAuth = authFilter === "all" ||
          (authFilter === "authed" && row.is_authed === 1) ||
          (authFilter === "notAuthed" && row.is_authed === 0)
        const matchesStatus = statusFilter === "all" || row.status === statusFilter
        return matchesSearch && matchesBranch && matchesPayment && matchesAuth && matchesStatus
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [search, branchFilter, paymentFilter, authFilter, statusFilter, fetchedData])

  const handleChange = (field: keyof State) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSelectChange = (field: keyof State) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const openCallLogDialog = (appointment: Appointment) => {
    setState((prev) => ({
      ...prev,
      selectedAppointment: appointment,
      callLogDialogOpen: true,
    }))
  }

  const closeCallLogDialog = () => {
    setState((prev) => ({
      ...prev,
      callLogDialogOpen: false,
      selectedAppointment: null,
    }))
  }

  const handleUpdateCallLogs = useCallback(async (appointmentId: string, callLogs: CallLog[]) => {
    await updateAppointments(appointmentId, { callLogs })
    await fetchData()
    setState(prev => {
      if (prev.selectedAppointment?.id === appointmentId) {
        return {
          ...prev,
          selectedAppointment: {
            ...prev.selectedAppointment,
            callLogs
          }
        }
      }
      return prev
    })
  }, [fetchData])

  const openSchedulePopup = (appointment: Appointment) => {
    if (!canScheduleAppointments) {
      setState((prev) => ({ ...prev, error: "غير مصرح لك بتحديد المواعيد" }))
      return
    }
    let initialDate = new Date()
    if (appointment.scheduledAt) {
      initialDate = new Date(appointment.scheduledAt)
    }
    const formattedDate = initialDate.toISOString().slice(0, 16)
    setState((prev) => ({
      ...prev,
      schedulePopupOpen: true,
      schedulingAppointment: appointment,
      newScheduledDateTime: formattedDate,
    }))
  }

  const closeSchedulePopup = () => {
    setState((prev) => ({
      ...prev,
      schedulePopupOpen: false,
      schedulingAppointment: null,
      newScheduledDateTime: "",
      isScheduling: false,
    }))
  }

  const scheduleAppointment = useCallback(async () => {
    if (!schedulingAppointment || !newScheduledDateTime) return
    setState((prev) => ({ ...prev, isScheduling: true, error: null }))
    try {
      const scheduledDate = new Date(newScheduledDateTime)
      const mysqlDateTime = formatDateTimeForMySQL(scheduledDate)
      const schedulingLog: CallLog = {
        id: `schedule_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp: createTimestamp(),
        status: "تم الحجز",
        notes: `تم تحديد موعد الحجز: ${formatDisplayDateTime(mysqlDateTime)}`,
        agentName: username || "غير معروف",
        timezone: getUserTimezone(),
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
        id: `unschedule_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp: createTimestamp(),
        status: "تم إلغاء الحجز",
        notes: "تم إلغاء موعد الحجز",
        agentName: username || "غير معروف",
        timezone: getUserTimezone(),
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

  const updateAppointmentStatus = async (id: string, status: string) => {
    try {
      await updateAppointments(id, { status })
      await fetchData()
    } catch (err) {
      console.error("Failed to update appointment status:", err)
      setState((prev) => ({
        ...prev,
        error: "فشل في تحديث حالة الموعد",
      }))
    }
  }

  const renderDoctorOffer = (row: Appointment) => (
    <div className="flex flex-col gap-1">
      {row.doctor && <div className="text-sm">الطبيب: {row.doctor}</div>}
      {row.offer && <div className="text-sm">العرض: {row.offer}</div>}
      {!row.doctor && !row.offer && "-"}
    </div>
  )

  const renderScheduledAt = (scheduledAt: string | null | undefined) => {
    if (!scheduledAt) return "-"
    return formatDisplayDateTime(scheduledAt)
  }

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

  return (
    <div className="overflow-auto pr-2 bg-gray-50 min-h-screen">
      {error && (
        <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setState((prev) => ({ ...prev, error: null }))}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في المواعيد..."
              value={search}
              onChange={handleChange("search")}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={branchFilter}
            onChange={handleSelectChange("branchFilter")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الفروع</option>
            {branchOptions.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={handleSelectChange("paymentFilter")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع حالات الدفع</option>
            <option value="paid">مدفوع</option>
            <option value="pending">معلق</option>
            <option value="unpaid">غير مدفوع</option>
          </select>

          <select
            value={authFilter}
            onChange={handleSelectChange("authFilter")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع حالات التوثيق</option>
            <option value="authed">موثق</option>
            <option value="notAuthed">غير موثق</option>
          </select>

          <select
            value={statusFilter}
            onChange={handleSelectChange("statusFilter")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">جميع الحالات</option>
            {appointmentStatusOptions.map((status) => (
              <option key={status} value={status}>
                {appointmentStatusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto max-h-[75vh]">
          <table className="w-full">
            <thead className="bg-gray-50 border-b sticky top-0 z-10">
              <tr>
                {visibleFormFields.map((field) => (
                  <th key={field.key} className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {field.label}
                  </th>
                ))}
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">حالة الدفع</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">التوثيق</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">الحالة</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">موعد الحجز</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">آخر حالة</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">سجلات الاتصال</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading && (
                <tr>
                  <td colSpan={visibleFormFields.length + 7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="text-gray-600">جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={visibleFormFields.length + 7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">لا توجد بيانات</div>
                  </td>
                </tr>
              )}
              {filteredData.map((row) => {
                const lastCall = getLastCallStatus(row)
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    {visibleFormFields.map((field) => (
                      <td key={field.key} className="px-6 py-4 text-sm text-gray-900">
                        {field.key === "createdAt"
                          ? formatDisplayDateTime(row[field.key])
                          : field.key === "doctor_offer"
                            ? renderDoctorOffer(row)
                            : (row[field.key] ?? "-")}
                      </td>
                    ))}
                    <td className="px-6 py-4">
                      <Chip
                        label={row.payment_status === "paid" ? "مدفوع" : row.payment_status === "pending" ? "معلق" : "غير مدفوع"}
                        className={paymentStatusColors[row.payment_status] || "bg-gray-100 text-gray-800"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${row.is_authed ? 'bg-green-500' : 'bg-red-500'}`}>
                        {row.is_authed ? '✓' : '✗'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {userRole === "customercare" ? (
                        <select
                          value={row.status}
                          onChange={(e) => updateAppointmentStatus(row.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {appointmentStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {appointmentStatusLabels[status]}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Chip
                          label={appointmentStatusLabels[row.status] || row.status}
                          className={appointmentStatusColors[row.status] || "bg-gray-100 text-gray-800"}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {renderScheduledAt(row.scheduledAt)}
                          </div>
                          {row.scheduledAt && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              المنطقة: {getUserTimezone()}
                            </div>
                          )}
                        </div>
                        {(canScheduleAppointments && row.is_authed) ? (
                          <button
                            onClick={() => openSchedulePopup(row)}
                            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${row.scheduledAt ? 'text-blue-600' : 'text-gray-400'}`}
                            title={row.scheduledAt ? "تعديل الموعد" : "تحديد موعد"}
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                        ) : "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lastCall ? (
                        <div className="group relative">
                          <Chip
                            label={lastCall.status}
                            className={statusColors[lastCall.status] || "bg-gray-100 text-gray-800 border-gray-200"}
                          />
                          <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            <div className="font-medium">{formatDisplayDateTime(lastCall.timestamp)}</div>
                            <div className="mt-1">بواسطة: {lastCall.agentName || 'غير معروف'}</div>
                            {lastCall.notes && (
                              <div className="mt-1">ملاحظة: {lastCall.notes}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <Chip label="لا يوجد" className="bg-gray-100 text-gray-800 border-gray-200" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openCallLogDialog(row)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-200 rounded-md hover:bg-blue-200 transition-colors"
                      >
                        <History className="h-4 w-4" />
                        السجلات ({row.callLogs?.length || 0})
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {role === "mediabuyer" && (
                        <button
                          onClick={() => openDeleteConfirm(row.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          onClick={handlePaginationClick("prev")}
          disabled={currentPage === 1 || loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-4 w-4" />
          الصفحة السابقة
        </button>
        <span className="text-sm text-gray-600">
          الصفحة {currentPage} من {totalPages}
        </span>
        <button
          onClick={handlePaginationClick("next")}
          disabled={currentPage === totalPages || loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          الصفحة التالية
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Call Log Dialog */}
      {callLogDialogOpen && selectedAppointment && (
        <CallLogManager
          open={callLogDialogOpen}
          onClose={closeCallLogDialog}
          appointment={selectedAppointment}
          onUpdateCallLogs={handleUpdateCallLogs}
          userRole={role as any}
          username={username}
        />
      )}

      {/* Schedule Popup */}
      {schedulePopupOpen && schedulingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  تحديد موعد الحجز
                </h3>
                <button
                  onClick={closeSchedulePopup}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-600">
                  {schedulingAppointment.name} - {schedulingAppointment.phone}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  المنطقة الزمنية الحالية: <strong>{getUserTimezone()}</strong>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تاريخ ووقت الموعد
                </label>
                <input
                  type="datetime-local"
                  value={newScheduledDateTime}
                  onChange={(e) => setState(prev => ({ ...prev, newScheduledDateTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  سيتم حفظ الموعد بالمنطقة الزمنية المحلية
                </p>
              </div>

              <div className="flex justify-between items-center gap-3">
                {schedulingAppointment.scheduledAt && (
                  <button
                    onClick={unscheduleAppointment}
                    disabled={isScheduling}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isScheduling ? "جاري الإلغاء..." : "إلغاء الموعد"}
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={closeSchedulePopup}
                    disabled={isScheduling}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={scheduleAppointment}
                    disabled={isScheduling || !newScheduledDateTime}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isScheduling ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Calendar className="h-4 w-4" />
                    )}
                    {isScheduling ? "جاري الحفظ..." : "حفظ الموعد"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">تأكيد الحذف</h3>
              </div>
              
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  هل أنت متأكد أنك تريد حذف هذا الموعد؟ هذا الإجراء لا يمكن التراجع عنه.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDeleteAppointment}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// CallLogManager Component
interface CallLogManagerProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onUpdateCallLogs: (appointmentId: string, callLogs: CallLog[]) => Promise<void>;
  userRole: 'customercare' | 'mediabuyer' | 'admin';
  username: string;
}

const CallLogManager: React.FC<CallLogManagerProps> = ({
  open,
  onClose,
  appointment,
  onUpdateCallLogs,
  userRole,
  username,
}) => {
  const [state, setState] = useState({
    newCallLogStatus: '',
    newCallLogNotes: '',
    editingLogId: null as string | null,
    editedLogStatus: '',
    editedLogNotes: '',
    searchTerm: '',
    statusFilter: 'all',
    showFilters: false,
    loading: false,
    error: null as string | null,
  });

  const canEditLogs = userRole === 'customercare' || userRole === 'admin';

  const processedLogs = useMemo(() => {
    if (!appointment?.callLogs) return [];
    return appointment.callLogs
      .filter(log => {
        const matchesSearch = state.searchTerm === '' ||
          log.status.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          (log.notes || '').toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          (log.agentName || '').toLowerCase().includes(state.searchTerm.toLowerCase());
        const matchesStatus = state.statusFilter === 'all' || log.status === state.statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });
  }, [appointment?.callLogs, state.searchTerm, state.statusFilter]);

  const handleStateChange = (field: string, value: any) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const addNewCallLog = useCallback(async () => {
    if (!appointment || !state.newCallLogStatus || !callLogStatusOptions.includes(state.newCallLogStatus)) {
      setState(prev => ({ ...prev, error: 'يرجى اختيار حالة صحيحة' }));
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const newLog: CallLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        timestamp: createTimestamp(),
        status: state.newCallLogStatus,
        notes: state.newCallLogNotes.trim() || undefined,
        agentName: username || 'غير معروف',
        timezone: getUserTimezone(),
      };
      const updatedLogs = [...(appointment.callLogs || []), newLog];
      await onUpdateCallLogs(appointment.id, updatedLogs);
      setState(prev => ({
        ...prev,
        newCallLogStatus: '',
        newCallLogNotes: '',
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to add call log:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'فشل في إضافة سجل الاتصال',
        loading: false,
      }));
    }
  }, [appointment, state.newCallLogStatus, state.newCallLogNotes, username, onUpdateCallLogs]);

  const startEditingLog = (log: CallLog) => {
    setState(prev => ({
      ...prev,
      editingLogId: log.id || null,
      editedLogStatus: log.status,
      editedLogNotes: log.notes || '',
    }));
  };

  const cancelEditing = () => {
    setState(prev => ({
      ...prev,
      editingLogId: null,
      editedLogStatus: '',
      editedLogNotes: '',
    }));
  };

  const saveEditedLog = async () => {
    if (!appointment || !state.editingLogId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedLogs = (appointment.callLogs || []).map(log =>
        log.id === state.editingLogId
          ? {
              ...log,
              status: state.editedLogStatus,
              notes: state.editedLogNotes.trim() || undefined,
              timestamp: createTimestamp(),
              editedBy: username || 'غير معروف',
              timezone: getUserTimezone(),
            }
          : log
      );
      await onUpdateCallLogs(appointment.id, updatedLogs);
      setState(prev => ({
        ...prev,
        editingLogId: null,
        editedLogStatus: '',
        editedLogNotes: '',
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to save edited call log:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'فشل في حفظ التعديلات',
        loading: false,
      }));
    }
  };

  const deleteCallLog = async (logId: string) => {
    if (!appointment || !window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const updatedLogs = (appointment.callLogs || []).filter(log => log.id !== logId);
      await onUpdateCallLogs(appointment.id, updatedLogs);
      setState(prev => ({ ...prev, loading: false }));
    } catch (error: any) {
      console.error('Failed to delete call log:', error);
      setState(prev => ({
        ...prev,
        error: error.message || 'فشل في حذف سجل الاتصال',
        loading: false,
      }));
    }
  };

  const renderLogItem = (log: CallLog) => {
    const isEditing = state.editingLogId === log.id;
    const timestamp = isValidTimestamp(log.timestamp) ? new Date(log.timestamp) : new Date();
    
    return (
      <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                <select
                  value={state.editedLogStatus}
                  onChange={(e) => handleStateChange('editedLogStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {callLogStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <textarea
                value={state.editedLogNotes}
                onChange={(e) => handleStateChange('editedLogNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل ملاحظات..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEditing}
                disabled={state.loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                إلغاء
              </button>
              <button
                onClick={saveEditedLog}
                disabled={state.loading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                {state.loading ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Chip
                  label={log.status}
                  className={statusColors[log.status] || "bg-gray-100 text-gray-800 border-gray-200"}
                />
                {log.editedBy && (
                  <span className="text-xs text-gray-500">(تم التعديل بواسطة: {log.editedBy})</span>
                )}
              </div>
              {canEditLogs && (
                <div className="flex gap-1">
                  <button
                    onClick={() => startEditingLog(log)}
                    disabled={state.loading}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="تعديل"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => log.id && deleteCallLog(log.id)}
                    disabled={state.loading}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {log.notes && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md border-l-4 border-blue-200">
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <StickyNote className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                  <span>{log.notes}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDisplayDateTime(timestamp)}</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{log.agentName || 'غير معروف'}</span>
              </div>
              <span className="text-blue-600 font-medium">
                {getRelativeTime(timestamp)}
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!open || !appointment) return null;

  return (



    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col mx-auto overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <History className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">سجلات الاتصال</h2>
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">
                {appointment.name} - {appointment.phone}
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {appointment.doctor && (
                  <Chip 
                    label={`الطبيب: ${appointment.doctor}`} 
                    className="bg-blue-100 text-blue-800 border-blue-200 text-xs" 
                    size="small" 
                  />
                )}
                {appointment.offer && (
                  <Chip 
                    label={`العرض: ${appointment.offer}`} 
                    className="bg-green-100 text-green-800 border-green-200 text-xs" 
                    size="small" 
                  />
                )}
                {appointment.scheduledAt && (
                  <Chip
                    label={`الموعد: ${formatDisplayDateTime(appointment.scheduledAt)}`}
                    className="bg-purple-100 text-purple-800 border-purple-200 text-xs"
                    size="small"
                  />
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0 ml-2"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Error Alert */}
          {state.error && (
            <div className="m-3 sm:m-4 p-3 sm:p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-sm">
              <div className="flex justify-between items-start">
                <span>{state.error}</span>
                <button onClick={clearError} className="text-red-500 hover:text-red-700 flex-shrink-0 ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="بحث في السجلات..."
                  value={state.searchTerm}
                  onChange={(e) => handleStateChange('searchTerm', e.target.value)}
                  className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  dir="rtl"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStateChange('showFilters', !state.showFilters)}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-shrink-0"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden xs:inline">مرشحات</span>
                </button>
                <Badge 
                  badgeContent={processedLogs.length} 
                  className="text-xs sm:text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded-md"
                >
                  السجلات: {processedLogs.length}
                </Badge>
              </div>
            </div>

            {state.showFilters && (
              <div className="pt-3 border-t border-gray-200">
                <select
                  value={state.statusFilter}
                  onChange={(e) => handleStateChange('statusFilter', e.target.value)}
                  className="w-full xs:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  dir="rtl"
                >
                  <option value="all">جميع الحالات</option>
                  {callLogStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Logs List */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
            {processedLogs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <History className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {state.searchTerm || state.statusFilter !== 'all'
                    ? 'لا توجد سجلات تطابق معايير البحث'
                    : 'لا توجد سجلات اتصال حتى الآن'
                  }
                </h3>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {processedLogs.map((log, index) => (
                  <div key={index} className="p-3 bg-white border border-gray-200 rounded-md shadow-sm">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{log.status}</span>
                      <span>{formatDisplayDateTime(log.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-800">{log.notes || 'لا توجد ملاحظات.'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add New Log Form */}
          {canEditLogs && (
            <div className="p-4 sm:p-6 bg-blue-50 border-t border-blue-200 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3 sm:mb-4">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                إضافة سجل جديد
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">الحالة *</label>
                    <select
                      value={state.newCallLogStatus}
                      onChange={(e) => handleStateChange('newCallLogStatus', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      required
                      dir="rtl"
                    >
                      <option value="">اختر الحالة</option>
                      {callLogStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                  <textarea
                    value={state.newCallLogNotes}
                    onChange={(e) => handleStateChange('newCallLogNotes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="أدخل أي ملاحظات إضافية..."
                    dir="rtl"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={addNewCallLog}
                    disabled={!state.newCallLogStatus || state.loading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                    {state.loading ? 'جاري الإضافة...' : 'إضافة سجل'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <div>المنطقة الزمنية: {getUserTimezone()}</div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>

  );
};

export default DataTable;
// CallLogManager.tsx
// "use client";
// import React, { useState, useMemo, useCallback } from "react";
// import {
//   Plus,
//   X,
//   Filter,
//   History,
//   Search,
//   Edit,
//   Trash2,
//   StickyNote,
//   Clock,
//   User,
// } from "lucide-react";
// import { Badge, Chip } from "../../components/ui"; // adjust imports

// interface CallLog {
//   id: string;
//   timestamp: string;
//   status: string;
//   notes?: string;
//   agentName?: string;
//   editedBy?: string;
//   timezone?: string;
// }

// interface Appointment {
//   id: string;
//   name: string;
//   phone: string;
//   doctor?: string;
//   offer?: string;
//   scheduledAt?: string;
//   callLogs: CallLog[];
// }

// interface CallLogManagerProps {
//   open: boolean;
//   onClose: () => void;
//   appointment: Appointment | null;
//   onUpdateCallLogs: (appointmentId: string, callLogs: CallLog[]) => Promise<void>;
//   userRole: "customercare" | "mediabuyer" | "admin";
//   username: string;
// }

// // Mocked helper functions (replace with your real ones)
// const callLogStatusOptions = ["نجح الاتصال", "لم يرد", "مغلق", "مجدول"];
// const createTimestamp = () => new Date().toISOString();
// const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
// const isValidTimestamp = (ts: string) => !isNaN(new Date(ts).getTime());
// const formatDisplayDateTime = (ts: string | Date) =>
//   new Date(ts).toLocaleString("ar-EG");
// const getRelativeTime = (date: Date) =>
//   new Intl.RelativeTimeFormat("ar", { numeric: "auto" }).format(
//     Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60)),
//     "hour"
//   );

// const CallLogManager: React.FC<CallLogManagerProps> = ({
//   open,
//   onClose,
//   appointment,
//   onUpdateCallLogs,
//   userRole,
//   username,
// }) => {
//   const [state, setState] = useState({
//     searchTerm: "",
//     statusFilter: "all",
//     showFilters: false,
//     loading: false,
//     error: null as string | null,
//   });

//   // Popup controls
//   const [addPopupOpen, setAddPopupOpen] = useState(false);
//   const [editPopupOpen, setEditPopupOpen] = useState(false);

//   // Add form state
//   const [newCallLogStatus, setNewCallLogStatus] = useState("");
//   const [newCallLogNotes, setNewCallLogNotes] = useState("");

//   // Edit form state
//   const [editingLog, setEditingLog] = useState<CallLog | null>(null);
//   const [editedStatus, setEditedStatus] = useState("");
//   const [editedNotes, setEditedNotes] = useState("");

//   const canEditLogs = userRole === "customercare" || userRole === "admin";

//   const processedLogs = useMemo(() => {
//     if (!appointment?.callLogs) return [];
//     return appointment.callLogs
//       .filter((log) => {
//         const matchesSearch =
//           state.searchTerm === "" ||
//           log.status.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
//           (log.notes || "").toLowerCase().includes(state.searchTerm.toLowerCase()) ||
//           (log.agentName || "").toLowerCase().includes(state.searchTerm.toLowerCase());
//         const matchesStatus =
//           state.statusFilter === "all" || log.status === state.statusFilter;
//         return matchesSearch && matchesStatus;
//       })
//       .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
//   }, [appointment?.callLogs, state.searchTerm, state.statusFilter]);

//   const addNewCallLog = useCallback(async () => {
//     if (!appointment || !newCallLogStatus) return;
//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     try {
//       const newLog: CallLog = {
//         id: `log_${Date.now()}_${Math.random().toString(36).slice(2)}`,
//         timestamp: createTimestamp(),
//         status: newCallLogStatus,
//         notes: newCallLogNotes.trim() || undefined,
//         agentName: username || "غير معروف",
//         timezone: getUserTimezone(),
//       };
//       const updatedLogs = [...(appointment.callLogs || []), newLog];
//       await onUpdateCallLogs(appointment.id, updatedLogs);

//       setNewCallLogStatus("");
//       setNewCallLogNotes("");
//       setAddPopupOpen(false);
//     } catch (error: any) {
//       setState((prev) => ({
//         ...prev,
//         error: error.message || "فشل في إضافة سجل الاتصال",
//       }));
//     } finally {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   }, [appointment, newCallLogStatus, newCallLogNotes, username, onUpdateCallLogs]);

//   const saveEditedLog = async () => {
//     if (!appointment || !editingLog) return;
//     setState((prev) => ({ ...prev, loading: true, error: null }));

//     try {
//       const updatedLogs = (appointment.callLogs || []).map((log) =>
//         log.id === editingLog.id
//           ? {
//               ...log,
//               status: editedStatus,
//               notes: editedNotes.trim() || undefined,
//               timestamp: createTimestamp(),
//               editedBy: username || "غير معروف",
//               timezone: getUserTimezone(),
//             }
//           : log
//       );
//       await onUpdateCallLogs(appointment.id, updatedLogs);

//       setEditingLog(null);
//       setEditPopupOpen(false);
//     } catch (error: any) {
//       setState((prev) => ({
//         ...prev,
//         error: error.message || "فشل في حفظ التعديلات",
//       }));
//     } finally {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   };

//   const deleteCallLog = async (logId: string) => {
//     if (!appointment || !window.confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
//     setState((prev) => ({ ...prev, loading: true, error: null }));
//     try {
//       const updatedLogs = (appointment.callLogs || []).filter((log) => log.id !== logId);
//       await onUpdateCallLogs(appointment.id, updatedLogs);
//     } catch (error: any) {
//       setState((prev) => ({
//         ...prev,
//         error: error.message || "فشل في حذف سجل الاتصال",
//       }));
//     } finally {
//       setState((prev) => ({ ...prev, loading: false }));
//     }
//   };

//   if (!open || !appointment) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] flex flex-col mx-auto overflow-hidden">
//         {/* Header */}
//         <div className="flex-shrink-0 p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
//           <div>
//             <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-2">
//               <History className="h-5 w-5 text-blue-600" />
//               سجلات الاتصال
//             </h2>
//             <p className="text-xs text-gray-600 mt-1">
//               {appointment.name} - {appointment.phone}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"
//           >
//             <X className="h-5 w-5" />
//           </button>
//         </div>

//         {/* Logs */}
//         <div className="flex-1 overflow-y-auto p-4">
//           {processedLogs.length === 0 ? (
//             <p className="text-center text-gray-500">لا توجد سجلات</p>
//           ) : (
//             processedLogs.map((log) => (
//               <div
//                 key={log.id}
//                 className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm"
//               >
//                 <div className="flex justify-between items-start">
//                   <Chip
//                     label={log.status}
//                     className="bg-blue-100 text-blue-800 border-blue-200 text-xs"
//                   />
//                   {canEditLogs && (
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => {
//                           setEditingLog(log);
//                           setEditedStatus(log.status);
//                           setEditedNotes(log.notes || "");
//                           setEditPopupOpen(true);
//                         }}
//                         className="p-2 text-gray-400 hover:text-blue-600 rounded-md"
//                       >
//                         <Edit className="h-4 w-4" />
//                       </button>
//                       <button
//                         onClick={() => deleteCallLog(log.id)}
//                         className="p-2 text-gray-400 hover:text-red-600 rounded-md"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//                 {log.notes && (
//                   <p className="mt-2 text-sm text-gray-700 flex items-start gap-2">
//                     <StickyNote className="h-4 w-4 text-blue-500" />
//                     {log.notes}
//                   </p>
//                 )}
//                 <div className="mt-2 text-xs text-gray-500 flex gap-4">
//                   <span className="flex items-center gap-1">
//                     <Clock className="h-3 w-3" />
//                     {formatDisplayDateTime(log.timestamp)}
//                   </span>
//                   <span className="flex items-center gap-1">
//                     <User className="h-3 w-3" />
//                     {log.agentName || "غير معروف"}
//                   </span>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>

//         {/* Footer */}
//         {canEditLogs && (
//           <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
//             <button
//               onClick={() => setAddPopupOpen(true)}
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               <Plus className="h-4 w-4 inline mr-1" />
//               إضافة سجل جديد
//             </button>
//           </div>
//         )}
//       </div>

//       {/* Add Popup */}
//       {addPopupOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
//             <h3 className="text-lg font-semibold mb-4">إضافة سجل جديد</h3>
//             <label className="block mb-2 text-sm">الحالة *</label>
//             <select
//               value={newCallLogStatus}
//               onChange={(e) => setNewCallLogStatus(e.target.value)}
//               className="w-full mb-3 border rounded p-2"
//             >
//               <option value="">اختر الحالة</option>
//               {callLogStatusOptions.map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//             <label className="block mb-2 text-sm">ملاحظات</label>
//             <textarea
//               value={newCallLogNotes}
//               onChange={(e) => setNewCallLogNotes(e.target.value)}
//               rows={3}
//               className="w-full border rounded p-2 mb-4"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setAddPopupOpen(false)}
//                 className="px-4 py-2 bg-gray-100 rounded-md"
//               >
//                 إلغاء
//               </button>
//               <button
//                 onClick={addNewCallLog}
//                 disabled={!newCallLogStatus || state.loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md"
//               >
//                 {state.loading ? "جاري الإضافة..." : "إضافة"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit Popup */}
//       {editPopupOpen && editingLog && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
//             <h3 className="text-lg font-semibold mb-4">تعديل السجل</h3>
//             <label className="block mb-2 text-sm">الحالة *</label>
//             <select
//               value={editedStatus}
//               onChange={(e) => setEditedStatus(e.target.value)}
//               className="w-full mb-3 border rounded p-2"
//             >
//               {callLogStatusOptions.map((status) => (
//                 <option key={status} value={status}>
//                   {status}
//                 </option>
//               ))}
//             </select>
//             <label className="block mb-2 text-sm">ملاحظات</label>
//             <textarea
//               value={editedNotes}
//               onChange={(e) => setEditedNotes(e.target.value)}
//               rows={3}
//               className="w-full border rounded p-2 mb-4"
//             />
//             <div className="flex justify-end gap-2">
//               <button
//                 onClick={() => setEditPopupOpen(false)}
//                 className="px-4 py-2 bg-gray-100 rounded-md"
//               >
//                 إلغاء
//               </button>
//               <button
//                 onClick={saveEditedLog}
//                 disabled={state.loading}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-md"
//               >
//                 {state.loading ? "جاري الحفظ..." : "حفظ"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CallLogManager;
