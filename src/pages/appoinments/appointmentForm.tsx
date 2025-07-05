"use client";

import {  MenuItem, TextField, Button, CircularProgress, IconButton } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import React, { useState } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define types
interface CallLog {
  timestamp: string;
  status: string;
  notes: string;
}

interface Appointment {
  id: string;
  name: string;
  phone: string;
  branch: string;
  createdAt: string;
  landingPageId: string;
  utmSource: string;
  callLogs?: CallLog[];
  [key: string]: any;
}

type FormFields = Omit<Appointment, 'id' | 'createdAt' | 'callLogs'> & {
  callLogs: CallLog[];
};

const initialFormState: FormFields = {
  name: "",
  phone: "",
  branch: "",
  landingPageId: "",
  utmSource: "",
  callLogs: [],
};

type LeadFormProps = {
  setAddLead: (value: boolean) => void;
};

export default function LeadForm({ setAddLead }: LeadFormProps) {
  const [form, setForm] = useState<FormFields>({ 
    ...initialFormState,
    callLogs: [{ 
      timestamp: new Date().toISOString().slice(0, 16),
      status: "لم يتم التواصل",
      notes: "" 
    }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!form.name.trim()) {
      setError("الاسم مطلوب");
      return false;
    }
    
    if (!form.phone.trim() || !/^[0-9]{10,15}$/.test(form.phone)) {
      setError("رقم هاتف صحيح مطلوب");
      return false;
    }
    
    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCallLogChange = (index: number, field: keyof CallLog, value: string) => {
    setForm(prev => {
      const newCallLogs = [...prev.callLogs];
      newCallLogs[index] = { ...newCallLogs[index], [field]: value };
      return { ...prev, callLogs: newCallLogs };
    });
  };

  const addCallLog = () => {
    setForm(prev => ({
      ...prev,
      callLogs: [
        ...prev.callLogs, 
        { 
          timestamp: new Date().toISOString().slice(0, 16),
          status: "لم يتم التواصل",
          notes: "" 
        }
      ],
    }));
  };

  const removeCallLog = (index: number) => {
    if (form.callLogs.length <= 1) {
      toast.warning("يجب أن يحتوي على سجل مكالمة واحد على الأقل");
      return;
    }
    
    setForm(prev => {
      const newCallLogs = [...prev.callLogs];
      newCallLogs.splice(index, 1);
      return { ...prev, callLogs: newCallLogs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);

    const payload = {
      ...form,
      createdAt: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    };

    try {
      const res = await fetch("https://www.ss.mastersclinics.com/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("فشل إرسال البيانات");

      toast.success("تمت إضافة الرسالة بنجاح");
      setForm({ 
        ...initialFormState,
        callLogs: [{ 
          timestamp: new Date().toISOString().slice(0, 16),
          status: "لم يتم التواصل",
          notes: "" 
        }]
      });
      setAddLead(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء الإرسال";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow rounded-lg" dir="rtl">
      <h2 className="text-xl font-bold mb-4">إضافة رائد</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField
          label="الاسم"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          fullWidth
          error={!!error && !form.name.trim()}
        />

        <TextField
          label="رقم الهاتف"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          fullWidth
          type="tel"
          error={!!error && (!form.phone.trim() || !/^[0-9]{10,15}$/.test(form.phone))}
          helperText="يجب أن يحتوي على 10-15 رقم"
        />

        <TextField
          label="الفرع"
          name="branch"
          value={form.branch}
          onChange={handleChange}
          required
          fullWidth
        />


        <div className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">سجلات المكالمات</h3>
            <Button
              startIcon={<Add />}
              onClick={addCallLog}
              variant="outlined"
              size="small"
            >
              إضافة مكالمة
            </Button>
          </div>

          {form.callLogs.map((log, index) => (
            <div key={index} className="mb-4 p-3 border rounded-md bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  label="وقت المكالمة"
                  type="datetime-local"
                  value={log.timestamp}
                  onChange={(e) => 
                    handleCallLogChange(index, "timestamp", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                
                <TextField
                  select
                  label="حالة المكالمة"
                  value={log.status}
                  onChange={(e) => 
                    handleCallLogChange(index, "status", e.target.value)
                  }
                  fullWidth
                >
                  <MenuItem value="لم يتم التواصل">لم يتم التواصل</MenuItem>
                  <MenuItem value="استفسار">استفسار</MenuItem>
                  <MenuItem value="مهتم">مهتم</MenuItem>
                  <MenuItem value="غير مهتم">غير مهتم</MenuItem>
                  <MenuItem value="تم الحجز">تم الحجز</MenuItem>
                  <MenuItem value="تم التواصل">تم التواصل علي الواتس اب</MenuItem>
                  <MenuItem value="لم يتم الرد">لم يتم الرد</MenuItem>
                  <MenuItem value="طلب التواصل في وقت اخر">طلب التواصل في وقت اخر</MenuItem>
                </TextField>

                <TextField
                  label="ملاحظات"
                  value={log.notes}
                  onChange={(e) => 
                    handleCallLogChange(index, "notes", e.target.value)
                  }
                  fullWidth
                />
              </div>
              
              <div className="flex justify-end mt-2">
                <IconButton 
                  onClick={() => removeCallLog(index)}
                  color="error"
                  size="small"
                  aria-label="حذف"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outlined"
            onClick={() => setAddLead(false)}
            disabled={loading}
          >
            إلغاء
          </Button>
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? "جاري الإرسال..." : "إرسال"}
          </Button>
        </div>
      </form>
    </div>
  );
}