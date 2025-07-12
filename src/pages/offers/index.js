import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Stack, CircularProgress, Chip, Divider, Autocomplete, Snackbar, Alert, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, } from '@mui/material';
import { ArrowBack, Save, CloudUpload, Link, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
const OfferDialog = ({ open, onClose, offer, mode, onSave, services, branches, doctors: allDoctors, editData, setEditData, imagePreview, setImagePreview }) => {
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const fileInputRef = useRef(null);
    const calculateDiscount = (before, after) => {
        return before > 0 ? Math.round(((before - after) / before) * 100) : 0;
    };
    useEffect(() => {
        if (editData.branches.length === 0) {
            setFilteredDoctors([]);
        }
        else {
            const filtered = allDoctors.filter(doctor => doctor.branches.some(branchId => editData.branches.includes(branchId)));
            setFilteredDoctors(filtered);
        }
    }, [editData.branches, allDoctors]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                return;
            }
            setEditData(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: ''
            }));
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const clearImageSelection = () => {
        setEditData(prev => ({
            ...prev,
            imageFile: null,
            imageUrl: ''
        }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value) || 0;
        setEditData(prev => {
            const newData = {
                ...prev,
                [name]: numValue
            };
            if (name === 'priceBefore') {
                newData.discountPercentage = calculateDiscount(numValue, prev.priceAfter);
            }
            else if (name === 'priceAfter') {
                newData.discountPercentage = calculateDiscount(prev.priceBefore, numValue);
            }
            return newData;
        });
    };
    const handleMultiSelect = (type, values) => {
        setEditData(prev => {
            const newData = { ...prev };
            if (type === 'branches') {
                newData.branches = values;
                newData.doctors_ids = values.length === 0 ? [] :
                    prev.doctors_ids.filter(id => filteredDoctors.some(d => d.id === id));
            }
            else if (type === 'services') {
                newData.services_ids = values.map((item) => item.id);
            }
            else if (type === 'doctors') {
                newData.doctors_ids = values.map((item) => item.id);
            }
            return newData;
        });
    };
    const handleSubmit = async () => {
        if (!offer || !onSave)
            return;
        try {
            const updatedOffer = {
                ...offer,
                title: editData.title,
                description: editData.description,
                priceBefore: editData.priceBefore.toString(),
                priceAfter: editData.priceAfter.toString(),
                discountPercentage: editData.discountPercentage.toString(),
                branches: editData.branches.map(b => b.toString()),
                services_ids: editData.services_ids,
                doctors_ids: editData.doctors_ids,
                image: editData.imageUrl || offer.image
            };
            onSave(updatedOffer);
            onClose();
        }
        catch (error) {
            console.error('Error updating offer:', error);
        }
    };
    if (!offer)
        return null;
    return (_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "md", fullWidth: true, children: [_jsxs(DialogTitle, { children: [mode === 'view' ? 'عرض التفاصيل' : 'تعديل العرض', _jsx(IconButton, { "aria-label": "close", onClick: onClose, sx: {
                            position: 'absolute',
                            left: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }, children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { dividers: true, children: mode === 'view' ? (_jsxs(Stack, { spacing: 3, sx: { pt: 2 }, children: [_jsx(Typography, { variant: "h6", children: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u0631\u0636" }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646:" }), " ", offer.title] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0648\u0635\u0641:" }), " ", offer.description] }), _jsx(Typography, { variant: "h6", children: "\u0627\u0644\u062A\u0633\u0639\u064A\u0631" }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A:" }), " ", offer.priceBefore, " \u0631.\u0633"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645:" }), " ", offer.priceAfter, " \u0631.\u0633"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645:" }), " ", offer.discountPercentage, "%"] }), _jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629" }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0641\u0631\u0648\u0639:" }), " ", offer.branches.map(branchId => branches.find(b => b.id === parseInt(branchId))?.name).filter(Boolean).join(', ')] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A:" }), " ", offer.services_ids.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621:" }), " ", offer.doctors_ids.map(id => allDoctors.find(d => d.id === id)?.name).filter(Boolean).join(', ')] }), offer.image && (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }), _jsx(Box, { display: "flex", justifyContent: "center", children: _jsx("img", { src: offer.image.startsWith('http') ? offer.image : `https://www.ss.mastersclinics.com${offer.image}`, alt: offer.title, style: { maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' } }) })] }))] })) : (_jsxs(Stack, { spacing: 3, sx: { pt: 2 }, children: [_jsx(TextField, { fullWidth: true, label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636", name: "title", value: editData.title, onChange: handleChange, variant: "outlined", required: true }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "\u0648\u0635\u0641 \u0627\u0644\u0639\u0631\u0636", name: "description", value: editData.description, onChange: handleChange, variant: "outlined" }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A", name: "priceBefore", value: editData.priceBefore, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                        endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                        inputProps: { min: 0, step: 0.01 }
                                    } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645", name: "priceAfter", value: editData.priceAfter, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                        endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                        inputProps: { min: 0, step: 0.01 }
                                    } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645", name: "discountPercentage", value: editData.discountPercentage, variant: "outlined", InputProps: {
                                        endAdornment: _jsx(InputAdornment, { position: "end", children: "%" }),
                                        readOnly: true
                                    } })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }), _jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [imagePreview && (_jsxs(_Fragment, { children: [_jsx("img", { src: imagePreview, alt: "Preview", style: { width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' } }), _jsx(IconButton, { onClick: clearImageSelection, color: "error", children: _jsx(CloseIcon, {}) })] })), _jsx(TextField, { fullWidth: true, label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", name: "imageUrl", value: editData.imageUrl, onChange: handleChange, variant: "outlined", placeholder: "https://example.com/image.jpg", InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Link, {}) })),
                                                endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(Button, { variant: "outlined", startIcon: _jsx(CloudUpload, {}), onClick: () => fileInputRef.current?.click(), children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" }) })),
                                            }, disabled: !!editData.imageFile }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/*", style: { display: 'none' } })] })] }), _jsx(Autocomplete, { multiple: true, options: branches, getOptionLabel: (option) => option.name, value: branches.filter(b => editData.branches.includes(b.id)), onChange: (_, value) => handleMultiSelect('branches', value.map(v => v.id)), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0641\u0631\u0648\u0639", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0641\u0631\u0648\u0639" })) }), _jsx(Autocomplete, { multiple: true, options: services, getOptionLabel: (option) => option.name, value: services.filter(s => editData.services_ids.includes(s.id)), onChange: (_, value) => handleMultiSelect('services', value), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" })) }), _jsx(Autocomplete, { multiple: true, options: filteredDoctors, getOptionLabel: (option) => option.name, value: allDoctors.filter(d => editData.doctors_ids.includes(d.id)), onChange: (_, value) => handleMultiSelect('doctors', value), disabled: editData.branches.length === 0, renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621", placeholder: editData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء" })) })] })) }), mode === 'edit' && (_jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, color: "secondary", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", color: "primary", startIcon: _jsx(Save, {}), children: "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A" })] }))] }));
};
const OfferAddForm = () => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priceBefore: 0,
        priceAfter: 0,
        discountPercentage: 0,
        branches: [],
        services_ids: [],
        doctors_ids: [],
        imageUrl: '',
        imageFile: null
    });
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        priceBefore: 0,
        priceAfter: 0,
        discountPercentage: 0,
        branches: [],
        services_ids: [],
        doctors_ids: [],
        imageUrl: '',
        imageFile: null
    });
    const [branches, setBranches] = useState([]);
    const [services, setServices] = useState([]);
    const [allDoctors, setAllDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [offers, setOffers] = useState([]);
    const [showOffersList, setShowOffersList] = useState(false);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [dialogMode, setDialogMode] = useState('view');
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [offerToDelete, setOfferToDelete] = useState(null);
    function getAuthHeaders() {
        const token = sessionStorage.getItem('token');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }
    const toggleOffersList = () => {
        setShowOffersList(!showOffersList);
    };
    const handleViewOffer = (offer) => {
        setCurrentOffer(offer);
        setDialogMode('view');
        setDialogOpen(true);
    };
    const handleEditOffer = (offer) => {
        setCurrentOffer(offer);
        setDialogMode('edit');
        setDialogOpen(true);
        setEditData({
            title: offer.title,
            description: offer.description,
            priceBefore: parseFloat(offer.priceBefore),
            priceAfter: parseFloat(offer.priceAfter),
            discountPercentage: parseFloat(offer.discountPercentage),
            branches: offer.branches.map(b => parseInt(b)),
            services_ids: offer.services_ids,
            doctors_ids: offer.doctors_ids,
            imageUrl: offer.image,
            imageFile: null
        });
        setImagePreview(offer.image ?
            (offer.image.startsWith('http') ? offer.image : `https://www.ss.mastersclinics.com${offer.image}`)
            : null);
    };
    const handleDeleteOffer = (id) => {
        setOfferToDelete(id);
        setDeleteConfirmOpen(true);
    };
    const confirmDelete = async () => {
        if (!offerToDelete)
            return;
        try {
            const response = await fetch(`https://www.ss.mastersclinics.com/offers/${offerToDelete}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (!response.ok)
                throw new Error('Failed to delete offer');
            setNotification({
                open: true,
                message: 'تم حذف العرض بنجاح',
                severity: 'success'
            });
            await fetchOffers();
        }
        catch (error) {
            console.error('Error deleting offer:', error);
            setNotification({
                open: true,
                message: 'فشل حذف العرض',
                severity: 'error'
            });
        }
        finally {
            setDeleteConfirmOpen(false);
            setOfferToDelete(null);
        }
    };
    const clearImageSelection = () => {
        setFormData(prev => ({
            ...prev,
            imageFile: null,
            imageUrl: ''
        }));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [servicesRes, doctorsRes, branchesRes] = await Promise.all([
                    fetch('https://www.ss.mastersclinics.com/services', { headers: getAuthHeaders() }),
                    fetch('https://www.ss.mastersclinics.com/doctors', { headers: getAuthHeaders() }),
                    fetch('https://www.ss.mastersclinics.com/branches', { headers: getAuthHeaders() })
                ]);
                const [servicesData, doctorsData, branchesData] = await Promise.all([
                    servicesRes.json(),
                    doctorsRes.json(),
                    branchesRes.json()
                ]);
                setServices(servicesData.map((service) => ({
                    id: service.id,
                    name: service.title,
                    department_id: service.department_id
                })));
                setAllDoctors(doctorsData.map((doctor) => ({
                    id: doctor.id,
                    name: doctor.name,
                    branches: doctor.branches_ids ? JSON.parse(doctor.branches_ids) : [],
                    department_id: doctor.department_id
                })));
                setBranches(branchesData);
                await fetchOffers();
            }
            catch (error) {
                console.error('Error fetching data:', error);
                setNotification({
                    open: true,
                    message: 'فشل تحميل البيانات الأولية',
                    severity: 'error'
                });
            }
            finally {
                setFetching(false);
            }
        };
        fetchInitialData();
    }, []);
    const fetchOffers = async () => {
        try {
            const response = await fetch('https://www.ss.mastersclinics.com/offers', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            const transformedOffers = data.map((offer) => {
                // Ensure branches is always an array
                let branchesArray = [];
                if (Array.isArray(offer.branches)) {
                    branchesArray = offer.branches;
                }
                else if (typeof offer.branches === 'string') {
                    try {
                        branchesArray = JSON.parse(offer.branches);
                    }
                    catch {
                        branchesArray = offer.branches.split(',').filter(Boolean);
                    }
                }
                else if (offer.branches) {
                    branchesArray = [offer.branches];
                }
                // Ensure services_ids is always an array
                let servicesArray = [];
                if (Array.isArray(offer.services_ids)) {
                    servicesArray = offer.services_ids;
                }
                else if (typeof offer.services_ids === 'string') {
                    try {
                        servicesArray = JSON.parse(offer.services_ids);
                    }
                    catch {
                        servicesArray = offer.services_ids.split(',').filter(Boolean).map(Number);
                    }
                }
                else if (offer.services_ids) {
                    servicesArray = [offer.services_ids];
                }
                // Ensure doctors_ids is always an array
                let doctorsArray = [];
                if (Array.isArray(offer.doctors_ids)) {
                    doctorsArray = offer.doctors_ids;
                }
                else if (typeof offer.doctors_ids === 'string') {
                    try {
                        doctorsArray = JSON.parse(offer.doctors_ids);
                    }
                    catch {
                        doctorsArray = offer.doctors_ids.split(',').filter(Boolean).map(Number);
                    }
                }
                else if (offer.doctors_ids) {
                    doctorsArray = [offer.doctors_ids];
                }
                return {
                    ...offer,
                    branches: branchesArray.map(String), // Ensure all branches are strings
                    services_ids: servicesArray,
                    doctors_ids: doctorsArray,
                    image: offer.image || '',
                    priceBefore: offer.priceBefore?.toString() || '0',
                    priceAfter: offer.priceAfter?.toString() || '0',
                    discountPercentage: offer.discountPercentage?.toString() || '0',
                    createdAt: {
                        _seconds: Math.floor(new Date(offer.created_at || offer.createdAt?._seconds * 1000 || Date.now()).getTime() / 1000),
                        _nanoseconds: 0
                    }
                };
            });
            setOffers(transformedOffers);
        }
        catch (error) {
            console.error('Error fetching offers:', error);
            setNotification({
                open: true,
                message: 'فشل تحميل قائمة العروض',
                severity: 'error'
            });
        }
    };
    useEffect(() => {
        if (formData.branches.length === 0) {
            setFilteredDoctors([]);
            setFormData(prev => ({ ...prev, doctors_ids: [] }));
        }
        else {
            const filtered = allDoctors.filter(doctor => doctor.branches.some(branchId => formData.branches.includes(branchId)));
            setFilteredDoctors(filtered);
        }
    }, [formData.branches, allDoctors]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (!file.type.startsWith('image/')) {
                setNotification({
                    open: true,
                    message: 'الرجاء اختيار ملف صورة',
                    severity: 'error'
                });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setNotification({
                    open: true,
                    message: 'يجب أن يكون حجم الملف أقل من 5 ميجابايت',
                    severity: 'error'
                });
                return;
            }
            setFormData(prev => ({
                ...prev,
                imageFile: file,
                imageUrl: ''
            }));
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const calculateDiscount = (before, after) => {
        return before > 0 ? Math.round(((before - after) / before) * 100) : 0;
    };
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        const numValue = parseFloat(value) || 0;
        setFormData(prev => ({
            ...prev,
            [name]: numValue,
            ...(name === 'priceBefore' && {
                discountPercentage: calculateDiscount(numValue, prev.priceAfter)
            }),
            ...(name === 'priceAfter' && {
                discountPercentage: calculateDiscount(prev.priceBefore, numValue)
            })
        }));
    };
    const handleMultiSelect = (type, values) => {
        if (type === 'branches') {
            setFormData(prev => ({
                ...prev,
                branches: values,
                doctors_ids: []
            }));
        }
        else if (type === 'services') {
            setFormData(prev => ({
                ...prev,
                services_ids: values.map(item => item.id)
            }));
        }
        else if (type === 'doctors') {
            setFormData(prev => ({
                ...prev,
                doctors_ids: values.map(item => item.id)
            }));
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formPayload = new FormData();
            formPayload.append('title', formData.title);
            formPayload.append('description', formData.description);
            formPayload.append('priceBefore', formData.priceBefore.toString());
            formPayload.append('priceAfter', formData.priceAfter.toString());
            formPayload.append('discountPercentage', formData.discountPercentage.toString());
            formPayload.append('branches', JSON.stringify(formData.branches));
            formPayload.append('services_ids', JSON.stringify(formData.services_ids));
            formPayload.append('doctors_ids', JSON.stringify(formData.doctors_ids));
            // Handle image upload - either file or URL
            if (formData.imageFile) {
                formPayload.append('image', formData.imageFile);
            }
            else if (formData.imageUrl) {
                formPayload.append('imageUrl', formData.imageUrl);
            }
            const response = await fetch('https://www.ss.mastersclinics.com/offers', {
                method: 'POST',
                headers: getAuthHeaders(), // Don't set Content-Type for FormData
                body: formPayload,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create offer');
            }
            setNotification({
                open: true,
                message: 'Offer created successfully!',
                severity: 'success'
            });
            // Reset form
            setFormData({
                title: '',
                description: '',
                priceBefore: 0,
                priceAfter: 0,
                discountPercentage: 0,
                branches: [],
                services_ids: [],
                doctors_ids: [],
                imageUrl: '',
                imageFile: null
            });
            setImagePreview(null);
            await fetchOffers();
        }
        catch (error) {
            console.error('Error creating offer:', error);
            setNotification({
                open: true,
                message: error instanceof Error ? error.message : 'Failed to create offer',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleSaveOffer = async (updatedOffer) => {
        try {
            const formPayload = new FormData();
            formPayload.append('title', updatedOffer.title);
            formPayload.append('description', updatedOffer.description);
            formPayload.append('priceBefore', updatedOffer.priceBefore);
            formPayload.append('priceAfter', updatedOffer.priceAfter);
            formPayload.append('discountPercentage', updatedOffer.discountPercentage);
            formPayload.append('branches', JSON.stringify(updatedOffer.branches));
            formPayload.append('services_ids', JSON.stringify(updatedOffer.services_ids));
            formPayload.append('doctors_ids', JSON.stringify(updatedOffer.doctors_ids));
            if (editData.imageFile) {
                formPayload.append('image', editData.imageFile);
            }
            else if (editData.imageUrl) {
                formPayload.append('imageUrl', editData.imageUrl);
            }
            const response = await fetch(`https://www.ss.mastersclinics.com/offers/${updatedOffer.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: formPayload
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update offer');
            }
            setNotification({
                open: true,
                message: 'Offer updated successfully',
                severity: 'success'
            });
            await fetchOffers();
            setDialogOpen(false);
        }
        catch (error) {
            console.error('Error updating offer:', error);
            setNotification({
                open: true,
                message: error instanceof Error ? error.message : 'Failed to update offer',
                severity: 'error'
            });
        }
    };
    if (fetching) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "md", sx: { py: 4, direction: 'rtl' }, children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 4, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), sx: { mr: 2 }, children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0648\u0636" }), _jsx(Typography, { variant: "h4", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0648\u0636" })] }), _jsx(Button, { variant: "outlined", onClick: toggleOffersList, sx: { mb: 2 }, children: showOffersList ? 'إخفاء قائمة العروض' : 'عرض قائمة العروض الحالية' }), showOffersList && (_jsx(Card, { sx: { mb: 4 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u062D\u0627\u0644\u064A\u0629" }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0627\u0644\u0635\u0648\u0631\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx(TableCell, { children: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A" }), _jsx(TableCell, { children: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645" }), _jsx(TableCell, { children: "\u0627\u0644\u062E\u0635\u0645" }), _jsx(TableCell, { children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(TableCell, { children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621" }), _jsx(TableCell, { children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: offers.length > 0 ? (offers.map((offer) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: offer.image && (_jsx("img", { src: offer.image.startsWith('http') ? offer.image : `https://www.ss.mastersclinics.com${offer.image}`, alt: offer.title, style: { width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' } })) }), _jsxs(TableCell, { children: [_jsx(Typography, { fontWeight: "bold", children: offer.title }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [offer.description.substring(0, 50), "..."] })] }), _jsxs(TableCell, { children: [offer.priceBefore, "\u0631.\u0633"] }), _jsxs(TableCell, { children: [offer.priceAfter, "\u0631.\u0633"] }), _jsxs(TableCell, { children: [offer.discountPercentage, "%"] }), _jsxs(TableCell, { children: [offer.branches.slice(0, 2).map(branchId => {
                                                            const branch = branches.find(b => b.id === parseInt(branchId));
                                                            return branch ? (_jsx(Chip, { label: branch.name, size: "small", sx: { m: 0.5 } }, branch.id)) : null;
                                                        }), offer.branches.length > 2 && (_jsx(Chip, { label: `+${offer.branches.length - 2}`, size: "small" }))] }), _jsx(TableCell, { children: new Date(offer.createdAt._seconds * 1000).toLocaleDateString('ar-EG') }), _jsxs(TableCell, { children: [_jsx(Tooltip, { title: "\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644", children: _jsx(IconButton, { onClick: () => handleViewOffer(offer), children: _jsx(ViewIcon, { color: "info" }) }) }), _jsx(Tooltip, { title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(IconButton, { onClick: () => handleEditOffer(offer), children: _jsx(EditIcon, { color: "primary" }) }) }), _jsx(Tooltip, { title: "\u062D\u0630\u0641", children: _jsx(IconButton, { onClick: () => handleDeleteOffer(offer.id), children: _jsx(DeleteIcon, { color: "error" }) }) })] })] }, offer.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0631\u0648\u0636 \u0645\u062A\u0627\u062D\u0629" }) })) })] }) })] }) })), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: currentOffer ? 'تعديل العرض' : 'إضافة عرض جديد' }), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { required: true, fullWidth: true, label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636", name: "title", value: formData.title, onChange: handleChange, variant: "outlined" }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "\u0648\u0635\u0641 \u0627\u0644\u0639\u0631\u0636", name: "description", value: formData.description, onChange: handleChange, variant: "outlined" }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "Offer Image" }), _jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [imagePreview && (_jsxs(_Fragment, { children: [_jsx("img", { src: imagePreview, alt: "Preview", style: { width: 100, height: 100, objectFit: 'cover', borderRadius: '4px' } }), _jsx(IconButton, { onClick: clearImageSelection, color: "error", children: _jsx(CloseIcon, {}) })] })), _jsx(TextField, { fullWidth: true, label: "Image URL", name: "imageUrl", value: formData.imageUrl, onChange: handleChange, variant: "outlined", placeholder: "https://example.com/image.jpg", disabled: !!formData.imageFile, InputProps: {
                                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Link, {}) })),
                                                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsxs(Button, { variant: "outlined", component: "label", startIcon: _jsx(CloudUpload, {}), children: ["Upload Image", _jsx("input", { type: "file", hidden: true, ref: fileInputRef, onChange: handleFileChange, accept: "image/*" })] }) })),
                                                        } })] })] }), _jsx(Divider, { children: _jsx(Chip, { label: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0633\u0639\u064A\u0631" }) }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A", name: "priceBefore", value: formData.priceBefore, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                                    inputProps: { min: 0, step: 0.01 }
                                                } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645", name: "priceAfter", value: formData.priceAfter, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                                    inputProps: { min: 0, step: 0.01 }
                                                } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645", name: "discountPercentage", value: formData.discountPercentage, variant: "outlined", InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "%" }),
                                                    readOnly: true
                                                } })] }), _jsx(Divider, { children: _jsx(Chip, { label: "\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629" }) }), _jsx(Autocomplete, { multiple: true, options: branches, getOptionLabel: (option) => option.name, value: branches.filter(b => formData.branches.includes(b.id)), onChange: (_, value) => handleMultiSelect('branches', value.map(v => v.id)), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0641\u0631\u0648\u0639", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0641\u0631\u0648\u0639" })) }), _jsx(Autocomplete, { multiple: true, options: services, getOptionLabel: (option) => option.name, value: services.filter(s => formData.services_ids.includes(s.id)), onChange: (_, value) => handleMultiSelect('services', value), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" })) }), _jsx(Autocomplete, { multiple: true, options: filteredDoctors, getOptionLabel: (option) => option.name, value: allDoctors.filter(d => formData.doctors_ids.includes(d.id)), onChange: (_, value) => handleMultiSelect('doctors', value), disabled: formData.branches.length === 0, renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621", placeholder: formData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء" })) }), _jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, children: [_jsx(Button, { variant: "outlined", color: "secondary", disabled: loading, onClick: () => {
                                                    setFormData({
                                                        title: '',
                                                        description: '',
                                                        priceBefore: 0,
                                                        priceAfter: 0,
                                                        discountPercentage: 0,
                                                        branches: [],
                                                        services_ids: [],
                                                        doctors_ids: [],
                                                        imageUrl: '',
                                                        imageFile: null
                                                    });
                                                    setImagePreview(null);
                                                }, children: "\u0645\u0633\u062D \u0627\u0644\u0646\u0645\u0648\u0630\u062C" }), _jsx(Button, { type: "submit", variant: "contained", color: "primary", disabled: loading, startIcon: loading ? _jsx(CircularProgress, { size: 20 }) : _jsx(Save, {}), children: loading ? 'جاري الحفظ...' : 'حفظ العرض' })] })] }) })] }) }), _jsx(OfferDialog, { open: dialogOpen, onClose: () => setDialogOpen(false), offer: currentOffer, mode: dialogMode, onSave: handleSaveOffer, services: services, branches: branches, doctors: allDoctors, editData: editData, setEditData: setEditData, imagePreview: imagePreview, setImagePreview: setImagePreview }), _jsxs(Dialog, { open: deleteConfirmOpen, onClose: () => setDeleteConfirmOpen(false), children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u063A\u0628\u062A\u0643 \u0641\u064A \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteConfirmOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: confirmDelete, variant: "contained", color: "error", startIcon: _jsx(DeleteIcon, {}), children: "\u062D\u0630\u0641" })] })] }), _jsx(Snackbar, { open: notification.open, autoHideDuration: 6000, onClose: () => setNotification(prev => ({ ...prev, open: false })), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: _jsx(Alert, { onClose: () => setNotification(prev => ({ ...prev, open: false })), severity: notification.severity, sx: { width: '100%' }, children: notification.message }) })] }));
};
export default OfferAddForm;
