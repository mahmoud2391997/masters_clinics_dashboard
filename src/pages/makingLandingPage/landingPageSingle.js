import { createElement as _createElement } from "react";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, TextField, Button, Switch, FormControlLabel, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Alert, CircularProgress, Autocomplete, Avatar, List, ListItem, ListItemText, ListItemSecondaryAction, Stack, } from '@mui/material';
import { Edit, Save, Cancel, Delete, Add, CloudUpload, Image as ImageIcon, ArrowBack, } from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLandingPageById, updateLandingPage, deleteLandingPage, fetchExistingItems, updateCurrentLandingPageSettings, } from '../../store/slices/landingPageSlice';
import "./css.css";
const BranchSelector = ({ selectedBranches, onChange }) => {
    const branchOptions = [
        "فرع العوالي",
        "فرع الخالدية",
        "فرع الشاطئ",
        "فرع البساتين",
        "ابحر الشمالية",
        "فرع الطائف"
    ];
    return (_jsx(Autocomplete, { multiple: true, options: branchOptions, value: selectedBranches, onChange: (_, newValue) => onChange(newValue || []), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0641\u0631\u0648\u0639" })), renderTags: (value, getTagProps) => value.map((option, index) => (_createElement(Chip, { variant: "outlined", label: option, ...getTagProps({ index }), key: index }))) }));
};
const getImageUrl = (image) => {
    if (!image)
        return "";
    if (image instanceof File)
        return "";
    if (/^https?:\/\//.test(image))
        return image;
    if (image.startsWith("/public") || image.startsWith("/uploads")) {
        return `http://localhost:3000${image}`;
    }
    return `http://localhost:3000/public/uploads/${image}`;
};
const LandingPageEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const fileInputRef = useRef(null);
    const [objectUrls, setObjectUrls] = useState([]);
    const { currentLandingPage, loading, error, existingItems, } = useAppSelector((state) => state.landingPages);
    const [isEditing, setIsEditing] = useState(false);
    const [localContent, setLocalContent] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [addItemDialog, setAddItemDialog] = useState({ open: false, type: null });
    const [, setSelectedExistingItem] = useState(null);
    // Clean up object URLs when unmounting
    useEffect(() => {
        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [objectUrls]);
    useEffect(() => {
        if (id) {
            dispatch(fetchLandingPageById(id));
            dispatch(fetchExistingItems());
        }
    }, [dispatch, id]);
    useEffect(() => {
        if (currentLandingPage) {
            setLocalContent(currentLandingPage.content);
        }
    }, [currentLandingPage]);
    const createObjectUrl = useCallback((file) => {
        const url = URL.createObjectURL(file);
        setObjectUrls(prev => [...prev, url]);
        return url;
    }, []);
    const handleSave = async () => {
        if (!id || !currentLandingPage || !localContent)
            return;
        try {
            const formData = new FormData();
            const updatedPage = {
                ...currentLandingPage,
                content: {
                    ...localContent,
                    landingScreen: {
                        ...localContent.landingScreen,
                        image: typeof localContent.landingScreen.image === 'string'
                            ? localContent.landingScreen.image
                            : '',
                    },
                    offers: localContent.offers.map(offer => ({
                        ...offer,
                        image: typeof offer.image === 'string' ? offer.image : '',
                    })),
                    doctors: localContent.doctors.map(doctor => ({
                        ...doctor,
                        image: typeof doctor.image === 'string' ? doctor.image : '',
                    })),
                },
            };
            formData.append('data', JSON.stringify(updatedPage));
            if (localContent.landingScreen.image instanceof File) {
                formData.append('landingImage', localContent.landingScreen.image);
            }
            localContent.offers.forEach((offer) => {
                if (offer.image instanceof File) {
                    formData.append(`offerImages`, offer.image);
                }
            });
            localContent.doctors.forEach((doctor) => {
                if (doctor.image instanceof File) {
                    formData.append(`doctorImages`, doctor.image);
                }
            });
            await dispatch(updateLandingPage({ id, data: formData })).unwrap();
            setIsEditing(false);
            setImagePreview(null);
        }
        catch (error) {
            console.error('Failed to save:', error);
        }
    };
    const handleCancel = () => {
        if (currentLandingPage) {
            setLocalContent(currentLandingPage.content);
            setImagePreview(null);
            setIsEditing(false);
        }
    };
    const handleDelete = async () => {
        if (!id)
            return;
        if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
            try {
                await dispatch(deleteLandingPage(id)).unwrap();
                navigate('/landingPage');
            }
            catch (error) {
                console.error('Failed to delete:', error);
            }
        }
    };
    const toggleStatus = async () => {
        if (!currentLandingPage || !id)
            return;
        try {
            const updatedPage = {
                ...currentLandingPage,
                enabled: !currentLandingPage.enabled,
            };
            await dispatch(updateLandingPage({ id, data: updatedPage })).unwrap();
        }
        catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };
    const handleImageUpload = (e, type, index) => {
        const file = e.target.files?.[0];
        if (!file || !localContent)
            return;
        if (!file.type.startsWith('image/')) {
            alert('يرجى اختيار ملف صورة صالح');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            if (type === 'landing') {
                setLocalContent({
                    ...localContent,
                    landingScreen: {
                        ...localContent.landingScreen,
                        image: file,
                    },
                });
                setImagePreview(createObjectUrl(file));
            }
            else if (type === 'offer' && index !== undefined) {
                const newOffers = [...localContent.offers];
                newOffers[index] = { ...newOffers[index], image: file };
                setLocalContent({ ...localContent, offers: newOffers });
            }
            else if (type === 'doctor' && index !== undefined) {
                const newDoctors = [...localContent.doctors];
                newDoctors[index] = { ...newDoctors[index], image: file };
                setLocalContent({ ...localContent, doctors: newDoctors });
            }
        };
        reader.readAsDataURL(file);
    };
    const addExistingItem = (type, item) => {
        if (!localContent)
            return;
        if (type === 'doctor') {
            const newDoctor = {
                name: item.name,
                specialization: item.specialty,
                image: item.image || '',
                branches: item.branches || [],
            };
            setLocalContent({
                ...localContent,
                doctors: [...localContent.doctors, newDoctor],
            });
        }
        else if (type === 'service') {
            const newService = {
                name: item.name,
                description: item.description,
                branches: item.branches || [],
            };
            setLocalContent({
                ...localContent,
                services: [...localContent.services, newService],
            });
        }
        else if (type === 'offer') {
            const newOffer = {
                offer: item.title,
                price: item.price,
                description: item.description,
                image: item.image || '',
                branches: item.branches || [],
            };
            setLocalContent({
                ...localContent,
                offers: [...localContent.offers, newOffer],
            });
        }
        setAddItemDialog({ open: false, type: null });
        setSelectedExistingItem(null);
    };
    const addNewItem = (type) => {
        if (!localContent)
            return;
        if (type === 'service') {
            setLocalContent({
                ...localContent,
                services: [
                    ...localContent.services,
                    { name: '', description: '', branches: [] },
                ],
            });
        }
        else if (type === 'offer') {
            setLocalContent({
                ...localContent,
                offers: [
                    ...localContent.offers,
                    { offer: '', price: '', description: '', image: '', branches: [] },
                ],
            });
        }
        else if (type === 'doctor') {
            setLocalContent({
                ...localContent,
                doctors: [
                    ...localContent.doctors,
                    { name: '', specialization: '', image: '', branches: [] },
                ],
            });
        }
    };
    const removeItem = (type, index) => {
        if (!localContent)
            return;
        if (type === 'service') {
            const newServices = localContent.services.filter((_, i) => i !== index);
            setLocalContent({ ...localContent, services: newServices });
        }
        else if (type === 'offer') {
            const newOffers = localContent.offers.filter((_, i) => i !== index);
            setLocalContent({ ...localContent, offers: newOffers });
        }
        else if (type === 'doctor') {
            const newDoctors = localContent.doctors.filter((_, i) => i !== index);
            setLocalContent({ ...localContent, doctors: newDoctors });
        }
    };
    const updateItemField = (type, index, field, value) => {
        if (!localContent)
            return;
        if (type === 'service') {
            const newServices = [...localContent.services];
            newServices[index] = { ...newServices[index], [field]: value };
            setLocalContent({ ...localContent, services: newServices });
        }
        else if (type === 'offer') {
            const newOffers = [...localContent.offers];
            newOffers[index] = { ...newOffers[index], [field]: value };
            setLocalContent({ ...localContent, offers: newOffers });
        }
        else if (type === 'doctor') {
            const newDoctors = [...localContent.doctors];
            newDoctors[index] = { ...newDoctors[index], [field]: value };
            setLocalContent({ ...localContent, doctors: newDoctors });
        }
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px", children: _jsx(CircularProgress, {}) }));
    }
    if (error) {
        return (_jsx(Box, { p: 3, children: _jsx(Alert, { severity: "error", children: error }) }));
    }
    if (!currentLandingPage || !localContent) {
        return (_jsx(Box, { p: 3, children: _jsx(Alert, { severity: "info", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A" }) }));
    }
    return (_jsxs(Box, { sx: { maxWidth: 1200, mx: 'auto', p: 3 }, dir: "rtl", children: [_jsx(Paper, { elevation: 2, sx: { p: 3, mb: 3 }, children: _jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", children: [_jsxs(Box, { display: "flex", alignItems: "center", children: [_jsx(IconButton, { onClick: () => navigate(-1), sx: { mr: 2 }, children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h4", children: isEditing ? 'تعديل صفحة الهبوط' : 'عرض صفحة الهبوط' })] }), _jsx(Box, { display: "flex", gap: 2, children: !isEditing ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "contained", startIcon: _jsx(Edit, {}), onClick: () => setIsEditing(true), children: "\u062A\u0639\u062F\u064A\u0644" }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: currentLandingPage.enabled, onChange: toggleStatus }), label: currentLandingPage.enabled ? 'مفعلة' : 'معطلة' }), _jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(Delete, {}), onClick: handleDelete, children: "\u062D\u0630\u0641" })] })) : (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "contained", color: "success", startIcon: _jsx(Save, {}), onClick: handleSave, children: "\u062D\u0641\u0638" }), _jsx(Button, { variant: "outlined", startIcon: _jsx(Cancel, {}), onClick: handleCancel, children: "\u0625\u0644\u063A\u0627\u0621" })] })) })] }) }), _jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0623\u0633\u0627\u0633\u064A\u0629" }), isEditing ? (_jsxs(Box, { children: [_jsx(Box, { sx: { mb: 2 }, children: _jsx(TextField, { fullWidth: true, label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0635\u0641\u062D\u0629", value: currentLandingPage.title, onChange: (e) => dispatch(updateCurrentLandingPageSettings({ title: e.target.value })) }) }), _jsxs(Box, { sx: { mb: 2 }, children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0627\u0644\u0645\u0646\u0635\u0627\u062A" }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 1, children: Object.entries(currentLandingPage.platforms).map(([platform, enabled]) => (_jsx(FormControlLabel, { control: _jsx(Switch, { checked: enabled, onChange: (e) => dispatch(updateCurrentLandingPageSettings({
                                                        platforms: {
                                                            ...currentLandingPage.platforms,
                                                            [platform]: e.target.checked,
                                                        },
                                                    })) }), label: platform }, platform))) })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0625\u0638\u0647\u0627\u0631 \u0627\u0644\u0623\u0642\u0633\u0627\u0645" }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 1, children: Object.entries(currentLandingPage.showSections).map(([section, enabled]) => (_jsx(FormControlLabel, { control: _jsx(Switch, { checked: enabled, onChange: (e) => dispatch(updateCurrentLandingPageSettings({
                                                        showSections: {
                                                            ...currentLandingPage.showSections,
                                                            [section]: e.target.checked,
                                                        },
                                                    })) }), label: section }, section))) })] })] })) : (_jsxs(Box, { children: [_jsx(Box, { sx: { mb: 2 }, children: _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646:" }), " ", currentLandingPage.title] }) }), _jsx(Box, { sx: { mb: 2 }, children: _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u062D\u0627\u0644\u0629:" }), " ", currentLandingPage.enabled ? 'مفعلة' : 'معطلة'] }) }), _jsxs(Box, { children: [_jsx(Typography, { children: _jsx("strong", { children: "\u0627\u0644\u0645\u0646\u0635\u0627\u062A:" }) }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 1, mt: 1, children: Object.entries(currentLandingPage.platforms)
                                                .filter(([_, enabled]) => enabled)
                                                .map(([platform]) => (_jsx(Chip, { label: platform, size: "small" }, platform))) })] })] }))] }) }), currentLandingPage.showSections.landingScreen && (_jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0634\u0627\u0634\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628" }), isEditing ? (_jsxs(Box, { display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: 3, children: [_jsxs(Box, { flex: 1, children: [_jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", value: localContent.landingScreen.title, onChange: (e) => setLocalContent({
                                                ...localContent,
                                                landingScreen: {
                                                    ...localContent.landingScreen,
                                                    title: e.target.value,
                                                },
                                            }), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0641\u0631\u0639\u064A", value: localContent.landingScreen.subtitle, onChange: (e) => setLocalContent({
                                                ...localContent,
                                                landingScreen: {
                                                    ...localContent.landingScreen,
                                                    subtitle: e.target.value,
                                                },
                                            }), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 4, label: "\u0627\u0644\u0648\u0635\u0641", value: localContent.landingScreen.description, onChange: (e) => setLocalContent({
                                                ...localContent,
                                                landingScreen: {
                                                    ...localContent.landingScreen,
                                                    description: e.target.value,
                                                },
                                            }) })] }), _jsxs(Box, { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0634\u0627\u0634\u0629 \u0627\u0644\u062A\u0631\u062D\u064A\u0628" }), (imagePreview || (typeof localContent.landingScreen.image === 'string' && localContent.landingScreen.image)) && (_jsx(Avatar, { src: imagePreview || getImageUrl(localContent.landingScreen.image), variant: "rounded", sx: { width: 200, height: 200, mx: 'auto', mb: 2 } })), _jsx("input", { type: "file", ref: fileInputRef, onChange: (e) => handleImageUpload(e, 'landing'), accept: "image/*", style: { display: 'none' } }), _jsx(Button, { variant: "outlined", startIcon: _jsx(CloudUpload, {}), onClick: () => fileInputRef.current?.click(), fullWidth: true, children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" })] })] })) : (_jsxs(Box, { display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: 3, children: [_jsxs(Box, { flex: 2, children: [_jsx(Typography, { variant: "h5", gutterBottom: true, children: localContent.landingScreen.title }), _jsx(Typography, { variant: "h6", color: "text.secondary", gutterBottom: true, children: localContent.landingScreen.subtitle }), _jsx(Typography, { children: localContent.landingScreen.description })] }), _jsx(Box, { flex: 1, children: localContent.landingScreen.image && (_jsx(Avatar, { src: typeof localContent.landingScreen.image === 'string'
                                            ? getImageUrl(localContent.landingScreen.image)
                                            : URL.createObjectURL(localContent.landingScreen.image), variant: "rounded", sx: { width: '100%', height: 200 } })) })] }))] }) })), currentLandingPage.showSections.services && (_jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h6", children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A" }), isEditing && (_jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(Add, {}), onClick: () => setAddItemDialog({ open: true, type: 'service' }), sx: { mr: 1 }, children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u062C\u0648\u062F" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => addNewItem('service'), children: "\u0625\u0636\u0627\u0641\u0629 \u062C\u062F\u064A\u062F" })] }))] }), _jsx(Stack, { direction: "row", flexWrap: "wrap", gap: 2, children: localContent.services.map((service, index) => (_jsx(Paper, { elevation: 1, sx: { p: 2, width: { xs: '100%', sm: '48%', md: '48%' } }, children: isEditing ? (_jsxs(_Fragment, { children: [_jsx(Box, { display: "flex", justifyContent: "flex-end", mb: 1, children: _jsx(IconButton, { color: "error", onClick: () => removeItem('service', index), children: _jsx(Delete, {}) }) }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u062E\u062F\u0645\u0629", value: service.name, onChange: (e) => updateItemField('service', index, 'name', e.target.value), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "\u0627\u0644\u0648\u0635\u0641", value: service.description, onChange: (e) => updateItemField('service', index, 'description', e.target.value), sx: { mb: 2 } }), _jsx(BranchSelector, { selectedBranches: service.branches, onChange: (newValue) => updateItemField('service', index, 'branches', newValue) })] })) : (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: service.name }), _jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: service.description }), service.branches.length > 0 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0627\u0644\u0641\u0631\u0648\u0639:" }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 0.5, children: service.branches.map((branch, branchIndex) => (_jsx(Chip, { label: branch, size: "small" }, branchIndex))) })] }))] })) }, index))) })] }) })), currentLandingPage.showSections.offers && (_jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0639\u0631\u0648\u0636" }), isEditing && (_jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(Add, {}), onClick: () => setAddItemDialog({ open: true, type: 'offer' }), sx: { mr: 1 }, children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u062C\u0648\u062F" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => addNewItem('offer'), children: "\u0625\u0636\u0627\u0641\u0629 \u062C\u062F\u064A\u062F" })] }))] }), _jsx(Stack, { direction: "row", flexWrap: "wrap", gap: 2, children: localContent.offers.map((offer, index) => (_jsx(Paper, { elevation: 1, sx: { p: 2, width: { xs: '100%', sm: '48%', md: '48%' } }, children: isEditing ? (_jsxs(_Fragment, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsxs(Typography, { variant: "subtitle1", children: ["\u0639\u0631\u0636 ", index + 1] }), _jsx(IconButton, { color: "error", onClick: () => removeItem('offer', index), children: _jsx(Delete, {}) })] }), _jsxs(Box, { textAlign: "center", mb: 2, children: [offer.image && (_jsx(Avatar, { src: typeof offer.image === 'string'
                                                        ? getImageUrl(offer.image)
                                                        : URL.createObjectURL(offer.image), variant: "rounded", sx: { width: 120, height: 120, mx: 'auto', mb: 1 } })), _jsx("input", { type: "file", onChange: (e) => handleImageUpload(e, 'offer', index), accept: "image/*", style: { display: 'none' }, id: `offer-image-${index}` }), _jsx("label", { htmlFor: `offer-image-${index}`, children: _jsx(Button, { variant: "outlined", component: "span", startIcon: _jsx(ImageIcon, {}), size: "small", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }) })] }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0631\u0636", value: offer.offer, onChange: (e) => updateItemField('offer', index, 'offer', e.target.value), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u0633\u0639\u0631", value: offer.price, onChange: (e) => updateItemField('offer', index, 'price', e.target.value), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 2, label: "\u0627\u0644\u0648\u0635\u0641", value: offer.description || '', onChange: (e) => updateItemField('offer', index, 'description', e.target.value), sx: { mb: 2 } }), _jsx(BranchSelector, { selectedBranches: offer.branches, onChange: (newValue) => updateItemField('offer', index, 'branches', newValue) })] })) : (_jsxs(_Fragment, { children: [offer.image && (_jsx(Avatar, { src: typeof offer.image === 'string'
                                                ? getImageUrl(offer.image)
                                                : URL.createObjectURL(offer.image), variant: "rounded", sx: { width: '100%', height: 150, mb: 2 } })), _jsx(Typography, { variant: "h6", gutterBottom: true, children: offer.offer }), _jsx(Typography, { variant: "h6", color: "primary", gutterBottom: true, children: offer.price }), offer.description && (_jsx(Typography, { variant: "body2", color: "text.secondary", paragraph: true, children: offer.description })), offer.branches.length > 0 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0627\u0644\u0641\u0631\u0648\u0639:" }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 0.5, children: offer.branches.map((branch, branchIndex) => (_jsx(Chip, { label: branch, size: "small" }, branchIndex))) })] }))] })) }, index))) })] }) })), currentLandingPage.showSections.doctors && (_jsx(Card, { sx: { mb: 3 }, children: _jsxs(CardContent, { children: [_jsxs(Box, { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, children: [_jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621" }), isEditing && (_jsxs(Box, { children: [_jsx(Button, { variant: "outlined", startIcon: _jsx(Add, {}), onClick: () => setAddItemDialog({ open: true, type: 'doctor' }), sx: { mr: 1 }, children: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0646 \u0627\u0644\u0645\u0648\u062C\u0648\u062F" }), _jsx(Button, { variant: "contained", startIcon: _jsx(Add, {}), onClick: () => addNewItem('doctor'), children: "\u0625\u0636\u0627\u0641\u0629 \u062C\u062F\u064A\u062F" })] }))] }), _jsx(Stack, { direction: "row", flexWrap: "wrap", gap: 2, justifyContent: "center", children: localContent.doctors.map((doctor, index) => (_jsx(Paper, { elevation: 1, sx: { p: 2, width: { xs: '100%', sm: '48%', md: '30%' }, textAlign: 'center' }, children: isEditing ? (_jsxs(_Fragment, { children: [_jsx(Box, { display: "flex", justifyContent: "flex-end", mb: 1, children: _jsx(IconButton, { color: "error", onClick: () => removeItem('doctor', index), children: _jsx(Delete, {}) }) }), _jsxs(Box, { mb: 2, children: [doctor.image && (_jsx(Avatar, { src: typeof doctor.image === 'string'
                                                        ? getImageUrl(doctor.image)
                                                        : URL.createObjectURL(doctor.image), sx: { width: 100, height: 100, mx: 'auto', mb: 1 } })), _jsx("input", { type: "file", onChange: (e) => handleImageUpload(e, 'doctor', index), accept: "image/*", style: { display: 'none' }, id: `doctor-image-${index}` }), _jsx("label", { htmlFor: `doctor-image-${index}`, children: _jsx(Button, { variant: "outlined", component: "span", startIcon: _jsx(ImageIcon, {}), size: "small", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0637\u0628\u064A\u0628" }) })] }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0633\u0645 \u0627\u0644\u0637\u0628\u064A\u0628", value: doctor.name, onChange: (e) => updateItemField('doctor', index, 'name', e.target.value), sx: { mb: 2 } }), _jsx(TextField, { fullWidth: true, label: "\u0627\u0644\u062A\u062E\u0635\u0635", value: doctor.specialization, onChange: (e) => updateItemField('doctor', index, 'specialization', e.target.value), sx: { mb: 2 } }), _jsx(BranchSelector, { selectedBranches: doctor.branches, onChange: (newValue) => updateItemField('doctor', index, 'branches', newValue) })] })) : (_jsxs(_Fragment, { children: [doctor.image && (_jsx(Avatar, { src: typeof doctor.image === 'string'
                                                ? getImageUrl(doctor.image)
                                                : URL.createObjectURL(doctor.image), sx: { width: 100, height: 100, mx: 'auto', mb: 2 } })), _jsx(Typography, { variant: "h6", gutterBottom: true, children: doctor.name }), _jsx(Typography, { variant: "body2", color: "text.secondary", gutterBottom: true, children: doctor.specialization }), doctor.branches.length > 0 && (_jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle2", gutterBottom: true, children: "\u0627\u0644\u0641\u0631\u0648\u0639:" }), _jsx(Box, { display: "flex", flexWrap: "wrap", gap: 0.5, justifyContent: "center", children: doctor.branches.map((branch, branchIndex) => (_jsx(Chip, { label: branch, size: "small" }, branchIndex))) })] }))] })) }, index))) })] }) })), _jsxs(Dialog, { open: addItemDialog.open, onClose: () => setAddItemDialog({ open: false, type: null }), maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: ["\u0625\u0636\u0627\u0641\u0629 ", addItemDialog.type === 'service' ? 'خدمة' : addItemDialog.type === 'offer' ? 'عرض' : 'طبيب', " \u0645\u0646 \u0627\u0644\u0645\u0648\u062C\u0648\u062F"] }), _jsx(DialogContent, { children: _jsxs(List, { children: [addItemDialog.type === 'service' &&
                                    existingItems.services.map((service) => (_jsxs(ListItem, { divider: true, children: [_jsx(ListItemText, { primary: service.name, secondary: service.description }), _jsx(ListItemSecondaryAction, { children: _jsx(Button, { variant: "outlined", onClick: () => addExistingItem('service', service), children: "\u0625\u0636\u0627\u0641\u0629" }) })] }, service.id))), addItemDialog.type === 'offer' &&
                                    existingItems.offers.map((offer) => (_jsxs(ListItem, { divider: true, children: [_jsx(ListItemText, { primary: offer.title, secondary: `${offer.price} - ${offer.description}` }), _jsx(ListItemSecondaryAction, { children: _jsx(Button, { variant: "outlined", onClick: () => addExistingItem('offer', offer), children: "\u0625\u0636\u0627\u0641\u0629" }) })] }, offer.id))), addItemDialog.type === 'doctor' &&
                                    existingItems.doctors.map((doctor) => (_jsxs(ListItem, { divider: true, children: [_jsx(ListItemText, { primary: doctor.name, secondary: doctor.specialty }), _jsx(ListItemSecondaryAction, { children: _jsx(Button, { variant: "outlined", onClick: () => addExistingItem('doctor', doctor), children: "\u0625\u0636\u0627\u0641\u0629" }) })] }, doctor.id)))] }) }), _jsx(DialogActions, { children: _jsx(Button, { onClick: () => setAddItemDialog({ open: false, type: null }), children: "\u0625\u0644\u063A\u0627\u0621" }) })] })] }));
};
export default LandingPageEditor;
