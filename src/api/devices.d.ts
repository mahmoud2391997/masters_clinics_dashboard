interface WorkingTimeSlot {
    day: string;
    type: 'singleDate' | 'dateRange';
    date?: string;
    startTime?: string;
    endTime?: string;
    startDay?: WeekDay;
    endDay?: WeekDay;
    recurringTime?: {
        startTime: string;
        endTime: string;
    };
}
type WeekDay = 'الأحد' | 'الاثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس' | 'الجمعة' | 'السبت';
interface Device {
    id: string;
    _id: string;
    description?: string;
    name: string;
    department_id: number[];
    branches: number[];
    working_time_slots: WorkingTimeSlot[];
    sessionPeriod: string;
    imageUrl?: string;
}
export declare const getDevices: () => Promise<Device[]>;
export declare const addDevice: (formData: FormData) => Promise<any>;
export declare const updateDevice: (id: string, formData: FormData) => Promise<any>;
export declare const deleteDevice: (id: string) => Promise<{
    message: string;
}>;
export {};
