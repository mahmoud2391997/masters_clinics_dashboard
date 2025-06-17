import React from 'react';
export type DayOfWeek = 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
interface Region {
    id: string;
    name: string;
}
interface FormProps {
    regions: Region[];
}
declare const Form: React.FC<FormProps>;
export default Form;
