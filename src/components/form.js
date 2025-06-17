"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FormControl, FormLabel, TextField, Button, MenuItem, Select, Box, Typography, IconButton, } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import axios from "axios";
import * as cheerio from "cheerio";
const defaultFormFields = [
    { name: "name", label: "اسم الفرع", required: true },
    { name: "region_id", label: "المنطقة", required: true },
    { name: "district", label: "العنوان", required: true },
    { name: "working_hours", label: "ساعات العمل" },
    { name: "location_link", label: "رابط الموقع", dataType: "url" },
    { name: "latitude" },
    { name: "longitude" },
    { name: "image", label: "صورة الفرع", dataType: "file" },
];
const Form = ({ formFields = defaultFormFields, regions = [], status, onChange, onSubmit, }) => {
    const [fields, setFields] = useState(formFields);
    const [coordinates, setCoordinates] = useState(null);
    const [isFetchingCoords, setIsFetchingCoords] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const isLoading = status === "loading";
    useEffect(() => {
        setFields(formFields);
        initializeCoordinates();
        initializeImagePreview();
    }, [formFields]);
    const initializeCoordinates = useCallback(() => {
        const latField = formFields.find((f) => f.name === "latitude")?.value;
        const lngField = formFields.find((f) => f.name === "longitude")?.value;
        if (latField && lngField) {
            const lat = parseFloat(latField);
            const lng = parseFloat(lngField);
            if (!isNaN(lat) && !isNaN(lng)) {
                setCoordinates({ lat, lng });
                return;
            }
        }
        const linkField = formFields.find((f) => f.name === "location_link")?.value;
        if (linkField) {
            handleLocationLinkChange(linkField);
        }
    }, [formFields]);
    const initializeImagePreview = useCallback(() => {
        const imageField = formFields.find((f) => f.name === "image");
        if (imageField?.value && typeof imageField.value === "string") {
            setImagePreview(imageField.value);
        }
    }, [formFields]);
    const updateFieldValue = useCallback((name, value) => {
        setFields((prevFields) => prevFields.map((field) => field.name === name ? { ...field, value } : field));
        onChange?.(name, value);
    }, [onChange]);
    const handleFieldChange = useCallback((name, value) => {
        if (isLoading)
            return;
        updateFieldValue(name, value);
        if (name === "location_link") {
            handleLocationLinkChange(value);
        }
    }, [isLoading, updateFieldValue]);
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            handleFieldChange("image", file);
        }
    };
    const handleRemoveImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
            setImagePreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        handleFieldChange("image", "");
    };
    const handleLocationLinkChange = useCallback(async (url) => {
        if (!url) {
            setCoordinates(null);
            return;
        }
        setIsFetchingCoords(true);
        try {
            const coords = await extractCoordinatesFromLink(url);
            if (coords) {
                setCoordinates(coords);
                updateFieldValue("latitude", coords.lat.toString());
                updateFieldValue("longitude", coords.lng.toString());
            }
        }
        catch (error) {
            console.error("Failed to extract coordinates:", error);
        }
        finally {
            setIsFetchingCoords(false);
        }
    }, [updateFieldValue]);
    const extractCoordinatesFromLink = useCallback(async (shortUrl) => {
        try {
            const directPatterns = [
                /@(-?\d+\.\d+),(-?\d+\.\d+)/,
                /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
                /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,
            ];
            for (const pattern of directPatterns) {
                const match = shortUrl.match(pattern);
                if (match) {
                    return {
                        lat: parseFloat(match[1]),
                        lng: parseFloat(match[2]),
                    };
                }
            }
            const response = await axios.get(shortUrl, {
                maxRedirects: 5,
                validateStatus: () => true,
            });
            const finalUrl = response.request?.res?.responseUrl || response.config.url;
            if (finalUrl) {
                for (const pattern of directPatterns) {
                    const match = finalUrl.match(pattern);
                    if (match) {
                        return {
                            lat: parseFloat(match[1]),
                            lng: parseFloat(match[2]),
                        };
                    }
                }
                const $ = cheerio.load(response.data);
                const metaImage = $('meta[property="og:image"]').attr("content");
                if (metaImage) {
                    const imageMatch = metaImage.match(/center=([-0-9.]+),([-0-9.]+)/);
                    if (imageMatch) {
                        return {
                            lat: parseFloat(imageMatch[1]),
                            lng: parseFloat(imageMatch[2]),
                        };
                    }
                }
            }
            throw new Error("No coordinates found in URL or page content");
        }
        catch (error) {
            console.error("Error extracting coordinates:", error);
            return null;
        }
    }, []);
    return (_jsxs("div", { className: "text-right mb-4 p-5", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: "\u0625\u0636\u0627\u0641\u0629 \u0641\u0631\u0639 \u062C\u062F\u064A\u062F" }), _jsxs("form", { onSubmit: onSubmit, className: "grid grid-cols-1 gap-4 md:grid-cols-3", dir: "rtl", children: [fields
                        .filter((field) => !["latitude", "longitude"].includes(field.name))
                        .map((field) => (_jsxs(FormControl, { fullWidth: true, children: [_jsxs(FormLabel, { className: "min-w-[150px] text-right", children: [field.label || field.name, field.required && _jsx("span", { className: "text-red-500", children: " *" })] }), field.name === "region_id" ? (_jsxs(Select, { value: field.value || "", onChange: (e) => handleFieldChange(field.name, e.target.value), required: field.required, disabled: isLoading, displayEmpty: true, inputProps: { dir: "rtl" }, children: [_jsx(MenuItem, { value: "", disabled: true, children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0646\u0637\u0642\u0629" }), regions.map((region) => (_jsx(MenuItem, { value: region.id, children: region.name }, region.id)))] })) : field.dataType === "file" ? (_jsxs(Box, { sx: { mt: 1 }, children: [_jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange, required: field.required, style: { display: 'none' }, id: "file-upload", ref: fileInputRef }), _jsx("label", { htmlFor: "file-upload", children: _jsx(Button, { variant: "outlined", component: "span", startIcon: _jsx(CloudUploadIcon, {}), fullWidth: true, disabled: isLoading, children: "\u0627\u062E\u062A\u0631 \u0635\u0648\u0631\u0629" }) }), imagePreview && (_jsxs(Box, { sx: { mt: 2, textAlign: 'center', position: 'relative' }, children: [_jsx("img", { src: imagePreview, alt: "Preview", style: {
                                                    maxWidth: '100%',
                                                    maxHeight: '200px',
                                                    borderRadius: '4px',
                                                    marginTop: '8px'
                                                } }), _jsx(IconButton, { onClick: handleRemoveImage, sx: {
                                                    position: 'absolute',
                                                    top: 8,
                                                    left: 8,
                                                    backgroundColor: 'rgba(255,255,255,0.7)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                                    }
                                                }, children: _jsx(ClearIcon, { color: "error" }) })] })), !imagePreview && (_jsxs(Box, { sx: {
                                            mt: 2,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: '100px',
                                            border: '1px dashed #ccc',
                                            borderRadius: '4px',
                                            backgroundColor: '#f5f5f5'
                                        }, children: [_jsx(ImageIcon, { sx: { fontSize: 40, color: '#aaa' } }), _jsx(Typography, { variant: "body2", color: "textSecondary", children: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u062E\u062A\u064A\u0627\u0631 \u0635\u0648\u0631\u0629" })] }))] })) : (_jsx(TextField, { type: field.dataType || "text", value: field.value || "", onChange: (e) => handleFieldChange(field.name, e.target.value), variant: "outlined", required: field.required, fullWidth: true, inputProps: { dir: "rtl" }, disabled: isLoading }))] }, field.name))), _jsx("input", { type: "hidden", name: "latitude", value: coordinates?.lat ?? "" }), _jsx("input", { type: "hidden", name: "longitude", value: coordinates?.lng ?? "" }), _jsx("div", { className: "flex justify-end md:col-span-3", children: _jsx(Button, { variant: "contained", color: "primary", type: "submit", size: "large", disabled: isLoading || !coordinates || isFetchingCoords, sx: { minWidth: '120px' }, children: isLoading ? "جاري الحفظ..." : "حفظ البيانات" }) })] })] }));
};
export default Form;
