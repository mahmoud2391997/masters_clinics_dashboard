import React from "react";
type FormField = {
    name: string;
    label?: string;
    value?: string | File;
    required?: boolean;
    dataType?: string;
};
type Region = {
    id: number;
    name: string;
};
type FormProps = {
    formFields?: FormField[];
    status?: string;
    regions?: Region[];
    onChange?: (name: string, value: string | File) => void;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
};
declare const Form: React.FC<FormProps>;
export default Form;
