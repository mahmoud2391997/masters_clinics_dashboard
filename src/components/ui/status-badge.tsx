import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const statusColors: Record<string, string> = {
  "لم يتم التواصل": "bg-warning/10 text-warning border-warning/20",
  استفسار: "bg-info/10 text-info border-info/20",
  مهتم: "bg-success/10 text-success border-success/20",
  "غير مهتم": "bg-destructive/10 text-destructive border-destructive/20",
  "تم الحجز": "bg-success/10 text-success border-success/20",
  "تم التواصل علي الواتس اب": "bg-success/10 text-success border-success/20",
  "لم يتم الرد": "bg-warning/10 text-warning border-warning/20",
  "طلب التواصل في وقت اخر": "bg-info/10 text-info border-info/20",
};

export const paymentStatusColors: Record<string, string> = {
  paid: "bg-success/10 text-success border-success/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  unpaid: "bg-destructive/10 text-destructive border-destructive/20",
};

export const authStatusColors: Record<string, string> = {
  "1": "bg-success/10 text-success border-success/20",
  "0": "bg-destructive/10 text-destructive border-destructive/20",
};

export const appointmentStatusColors: Record<string, string> = {
  pending: "status-pending",
  confirmed: "status-confirmed", 
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export const appointmentStatusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد", 
  completed: "مكتمل",
  cancelled: "ملغى",
};

interface StatusBadgeProps {
  status: string;
  type: "call" | "payment" | "auth" | "appointment";
  className?: string;
}

export function StatusBadge({ status, type, className }: StatusBadgeProps) {
  const getColorClass = () => {
    switch (type) {
      case "call":
        return statusColors[status] || "bg-muted text-muted-foreground";
      case "payment":
        return paymentStatusColors[status] || "bg-muted text-muted-foreground";
      case "auth":
        return authStatusColors[status] || "bg-muted text-muted-foreground";
      case "appointment":
        return appointmentStatusColors[status] || "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getLabel = () => {
    if (type === "appointment") {
      return appointmentStatusLabels[status] || status;
    }
    if (type === "payment") {
      return status === "paid" ? "مدفوع" : status === "pending" ? "معلق" : "غير مدفوع";
    }
    if (type === "auth") {
      return status === "1" ? "✓" : "✗";
    }
    return status;
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-medium border transition-colors",
        getColorClass(),
        className
      )}
    >
      {getLabel()}
    </Badge>
  );
}