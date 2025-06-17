import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Container, TextField, Typography, Stack, CircularProgress, Chip, Divider, Autocomplete, Snackbar, Alert, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, } from '@mui/material';
import { ArrowBack, Save, CloudUpload, Link, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from '@mui/icons-material';
const OfferDialog = ({ open, onClose, offer, mode, onSave, services, branches, doctors: allDoctors }) => {
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
    const [imagePreview, setImagePreview] = useState(null);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const fileInputRef = useRef(null);
    // Calculate discount percentage
    const calculateDiscount = (before, after) => {
        return before > 0 ? Math.round(((before - after) / before) * 100) : 0;
    };
    // Filter doctors based on selected branches
    useEffect(() => {
        if (editData.branches.length === 0) {
            setFilteredDoctors([]);
        }
        else {
            const filtered = allDoctors.filter(doctor => doctor.branches.some(branch => editData.branches.includes(branch)));
            setFilteredDoctors(filtered);
        }
    }, [editData.branches, allDoctors]);
    // Initialize form data when offer changes
    useEffect(() => {
        if (offer) {
            const initialData = {
                title: offer.title || '',
                description: offer.description || '',
                priceBefore: parseFloat(offer.priceBefore) || 0,
                priceAfter: parseFloat(offer.priceAfter) || 0,
                discountPercentage: parseFloat(offer.discountPercentage) || 0,
                branches: offer.branches || [],
                services_ids: offer.services_ids || [],
                doctors_ids: offer.doctors_ids || [],
                imageUrl: offer.image || '',
                imageFile: null
            };
            setEditData(initialData);
            setImagePreview(offer.image || null);
        }
    }, [offer]);
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
                // Reset doctors when branches change
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
            // Create FormData for the update
            const formPayload = new FormData();
            formPayload.append('title', editData.title);
            formPayload.append('description', editData.description);
            formPayload.append('priceBefore', editData.priceBefore.toString());
            formPayload.append('priceAfter', editData.priceAfter.toString());
            formPayload.append('discountPercentage', editData.discountPercentage.toString());
            formPayload.append('branches', JSON.stringify(editData.branches));
            formPayload.append('services_ids', JSON.stringify(editData.services_ids));
            formPayload.append('doctors_ids', JSON.stringify(editData.doctors_ids));
            // Handle image updates
            if (editData.imageFile) {
                formPayload.append('image', editData.imageFile);
            }
            else if (editData.imageUrl) {
                formPayload.append('imageUrl', editData.imageUrl);
            }
            // Call the onSave callback with updated data
            const updatedOffer = {
                ...offer,
                title: editData.title,
                description: editData.description,
                priceBefore: editData.priceBefore.toString(),
                priceAfter: editData.priceAfter.toString(),
                discountPercentage: editData.discountPercentage.toString(),
                branches: editData.branches,
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
                        }, children: _jsx(CloseIcon, {}) })] }), _jsx(DialogContent, { dividers: true, children: mode === 'view' ? (_jsxs(Stack, { spacing: 3, sx: { pt: 2 }, children: [_jsx(Typography, { variant: "h6", children: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0639\u0631\u0636" }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646:" }), " ", offer.title] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0648\u0635\u0641:" }), " ", offer.description] }), _jsx(Typography, { variant: "h6", children: "\u0627\u0644\u062A\u0633\u0639\u064A\u0631" }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A:" }), " ", offer.priceBefore, " \u0631.\u0633"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645:" }), " ", offer.priceAfter, " \u0631.\u0633"] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645:" }), " ", offer.discountPercentage, "%"] }), _jsx(Typography, { variant: "h6", children: "\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629" }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0641\u0631\u0648\u0639:" }), " ", offer.branches.join(', ')] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A:" }), " ", offer.services_ids.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')] }), _jsxs(Typography, { children: [_jsx("strong", { children: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621:" }), " ", offer.doctors_ids.map(id => allDoctors.find(d => d.id === id)?.name).filter(Boolean).join(', ')] }), offer.image && (_jsxs(_Fragment, { children: [_jsx(Typography, { variant: "h6", children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }), _jsx(Avatar, { src: offer.image, variant: "rounded", sx: { width: 200, height: 200 } })] }))] })) : (_jsxs(Stack, { spacing: 3, sx: { pt: 2 }, children: [_jsx(TextField, { fullWidth: true, label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636", name: "title", value: editData.title, onChange: handleChange, variant: "outlined", required: true }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "\u0648\u0635\u0641 \u0627\u0644\u0639\u0631\u0636", name: "description", value: editData.description, onChange: handleChange, variant: "outlined" }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A", name: "priceBefore", value: editData.priceBefore, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                        endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                        inputProps: { min: 0, step: 0.01 }
                                    } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645", name: "priceAfter", value: editData.priceAfter, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                        endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                        inputProps: { min: 0, step: 0.01 }
                                    } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645", name: "discountPercentage", value: editData.discountPercentage, variant: "outlined", InputProps: {
                                        endAdornment: _jsx(InputAdornment, { position: "end", children: "%" }),
                                        readOnly: true
                                    } })] }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }), _jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [imagePreview && (_jsx(Avatar, { src: imagePreview, variant: "rounded", sx: { width: 100, height: 100 } })), _jsx(TextField, { fullWidth: true, label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", name: "imageUrl", value: editData.imageUrl, onChange: handleChange, variant: "outlined", placeholder: "https://example.com/image.jpg", InputProps: {
                                                startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Link, {}) })),
                                                endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(Button, { variant: "outlined", startIcon: _jsx(CloudUpload, {}), onClick: () => fileInputRef.current?.click(), children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" }) })),
                                            }, disabled: !!editData.imageFile }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/*", style: { display: 'none' } })] })] }), _jsx(Autocomplete, { multiple: true, options: branches, getOptionLabel: (option) => option, value: editData.branches, onChange: (_, value) => handleMultiSelect('branches', value), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0641\u0631\u0648\u0639", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0641\u0631\u0648\u0639" })) }), _jsx(Autocomplete, { multiple: true, options: services, getOptionLabel: (option) => option.name, value: services.filter(s => editData.services_ids.includes(s.id)), onChange: (_, value) => handleMultiSelect('services', value), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" })) }), _jsx(Autocomplete, { multiple: true, options: filteredDoctors, getOptionLabel: (option) => option.name, value: allDoctors.filter(d => editData.doctors_ids.includes(d.id)), onChange: (_, value) => handleMultiSelect('doctors', value), disabled: editData.branches.length === 0, renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621", placeholder: editData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء" })) })] })) }), mode === 'edit' && (_jsxs(DialogActions, { children: [_jsx(Button, { onClick: onClose, color: "secondary", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", color: "primary", startIcon: _jsx(Save, {}), children: "\u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A" })] }))] }));
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
            Authorization: token ? `Bearer ${token}` : '',
        };
    }
    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                // Fetch services
                const servicesRes = await fetch('http://localhost:3000/services', {
                    headers: getAuthHeaders()
                });
                const servicesData = await servicesRes.json();
                setServices(servicesData);
                // Fetch all doctors
                const doctorsRes = await fetch('http://localhost:3000/doctors', {
                    headers: getAuthHeaders()
                });
                const doctorsData = await doctorsRes.json();
                setAllDoctors(doctorsData);
                // Extract unique branches from doctors
                const allBranches = doctorsData.flatMap((doctor) => doctor.branches);
                const uniqueBranches = Array.from(new Set(allBranches));
                setBranches(uniqueBranches);
                // Fetch offers
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
            const response = await fetch('http://localhost:3000/offers', {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            setOffers(data);
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
    // Filter doctors when branches are selected
    useEffect(() => {
        if (formData.branches.length === 0) {
            setFilteredDoctors([]);
            setFormData(prev => ({ ...prev, doctors_ids: [] }));
        }
        else {
            const filtered = allDoctors.filter(doctor => doctor.branches.some(branch => formData.branches.includes(branch)));
            setFilteredDoctors(filtered);
            // Clear selected doctors if they're not in the filtered list
            setFormData(prev => ({
                ...prev,
                doctors_ids: prev.doctors_ids.filter(id => filtered.some(doctor => doctor.id === id))
            }));
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setNotification({
                    open: true,
                    message: 'الرجاء اختيار ملف صورة',
                    severity: 'error'
                });
                return;
            }
            // Validate file size (5MB limit)
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
                imageUrl: '' // Clear URL when file is selected
            }));
            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.readyState === 2) {
                    setImagePreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };
    const triggerFileInput = () => {
        fileInputRef.current?.click();
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
                doctors_ids: [] // Reset doctors when branches change
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
            if (formData.imageFile) {
                formPayload.append('image', formData.imageFile);
            }
            else if (formData.imageUrl) {
                formPayload.append('imageUrl', formData.imageUrl);
            }
            const response = await fetch('http://localhost:3000/offers', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: formPayload,
            });
            if (!response.ok)
                throw new Error('فشل إنشاء العرض');
            setNotification({
                open: true,
                message: 'تم إنشاء العرض بنجاح!',
                severity: 'success'
            });
            // Reset form and fetch updated offers list
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
                message: error instanceof Error ? error.message : 'فشل إنشاء العرض',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
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
    };
    const handleDeleteOffer = (id) => {
        setOfferToDelete(id);
        setDeleteConfirmOpen(true);
    };
    const confirmDelete = async () => {
        if (!offerToDelete)
            return;
        try {
            const response = await fetch(`http://localhost:3000/offers/${offerToDelete}`, {
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
    const handleSaveOffer = async (updatedOffer) => {
        try {
            const response = await fetch(`http://localhost:3000/offers/${updatedOffer.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(updatedOffer)
            });
            if (!response.ok)
                throw new Error('Failed to update offer');
            setNotification({
                open: true,
                message: 'تم تحديث العرض بنجاح',
                severity: 'success'
            });
            await fetchOffers();
            setDialogOpen(false);
        }
        catch (error) {
            console.error('Error updating offer:', error);
            setNotification({
                open: true,
                message: 'فشل تحديث العرض',
                severity: 'error'
            });
        }
    };
    if (fetching) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    return (_jsxs(Container, { maxWidth: "md", sx: { py: 4, direction: 'rtl' }, children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 4, children: [_jsx(Button, { startIcon: _jsx(ArrowBack, {}), sx: { mr: 2 }, children: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0625\u0644\u0649 \u0627\u0644\u0639\u0631\u0648\u0636" }), _jsx(Typography, { variant: "h4", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0631\u0648\u0636" })] }), _jsx(Button, { variant: "outlined", onClick: toggleOffersList, sx: { mb: 2 }, children: showOffersList ? 'إخفاء قائمة العروض' : 'عرض قائمة العروض الحالية' }), showOffersList && (_jsx(Card, { sx: { mb: 4 }, children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u0627\u0644\u0639\u0631\u0648\u0636 \u0627\u0644\u062D\u0627\u0644\u064A\u0629" }), _jsx(TableContainer, { component: Paper, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "\u0627\u0644\u0635\u0648\u0631\u0629" }), _jsx(TableCell, { children: "\u0627\u0644\u0639\u0646\u0648\u0627\u0646" }), _jsx(TableCell, { children: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A" }), _jsx(TableCell, { children: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645" }), _jsx(TableCell, { children: "\u0627\u0644\u062E\u0635\u0645" }), _jsx(TableCell, { children: "\u0627\u0644\u0641\u0631\u0648\u0639" }), _jsx(TableCell, { children: "\u0627\u0644\u0627\u0637\u0628\u0627\u0621" }), _jsx(TableCell, { children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621" }), _jsx(TableCell, { children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" })] }) }), _jsx(TableBody, { children: offers.length > 0 ? (offers.map((offer) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: _jsx(Avatar, { src: offer.image, alt: offer.title, variant: "rounded", sx: { width: 60, height: 60 } }) }), _jsxs(TableCell, { children: [_jsx(Typography, { fontWeight: "bold", children: offer.title }), _jsxs(Typography, { variant: "body2", color: "text.secondary", children: [offer.description.substring(0, 50), "..."] })] }), _jsxs(TableCell, { children: [offer.priceBefore, "\u0631.\u0633"] }), _jsxs(TableCell, { children: [offer.priceAfter, "\u0631.\u0633"] }), _jsxs(TableCell, { children: [offer.discountPercentage, "%"] }), _jsxs(TableCell, { children: [offer.branches.slice(0, 2).map(branch => (_jsx(Chip, { label: branch, size: "small", sx: { m: 0.5 } }, branch))), offer.branches.length > 2 && (_jsx(Chip, { label: `+${offer.branches.length - 2}`, size: "small" }))] }), _jsx(TableCell, { children: new Date(offer.createdAt._seconds * 1000).toLocaleDateString('ar-EG') }), _jsxs(TableCell, { children: [_jsx(Tooltip, { title: "\u0639\u0631\u0636 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644", children: _jsx(IconButton, { onClick: () => handleViewOffer(offer), children: _jsx(ViewIcon, { color: "info" }) }) }), _jsx(Tooltip, { title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(IconButton, { onClick: () => handleEditOffer(offer), children: _jsx(EditIcon, { color: "primary" }) }) }), _jsx(Tooltip, { title: "\u062D\u0630\u0641", children: _jsx(IconButton, { onClick: () => handleDeleteOffer(offer.id), children: _jsx(DeleteIcon, { color: "error" }) }) })] })] }, offer.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 8, align: "center", children: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0639\u0631\u0648\u0636 \u0645\u062A\u0627\u062D\u0629" }) })) })] }) })] }) })), _jsx(Card, { children: _jsxs(CardContent, { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: currentOffer ? 'تعديل العرض' : 'إضافة عرض جديد' }), _jsx("form", { onSubmit: handleSubmit, children: _jsxs(Stack, { spacing: 3, children: [_jsx(TextField, { required: true, fullWidth: true, label: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0639\u0631\u0636", name: "title", value: formData.title, onChange: handleChange, variant: "outlined" }), _jsx(TextField, { fullWidth: true, multiline: true, rows: 3, label: "\u0648\u0635\u0641 \u0627\u0644\u0639\u0631\u0636", name: "description", value: formData.description, onChange: handleChange, variant: "outlined" }), _jsxs(Box, { children: [_jsx(Typography, { variant: "subtitle1", gutterBottom: true, children: "\u0635\u0648\u0631\u0629 \u0627\u0644\u0639\u0631\u0636" }), _jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [imagePreview && (_jsx(Avatar, { src: imagePreview, variant: "rounded", sx: { width: 100, height: 100 } })), _jsx(TextField, { fullWidth: true, label: "\u0631\u0627\u0628\u0637 \u0627\u0644\u0635\u0648\u0631\u0629", name: "imageUrl", value: formData.imageUrl, onChange: handleChange, variant: "outlined", placeholder: "https://example.com/image.jpg", InputProps: {
                                                            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Link, {}) })),
                                                            endAdornment: (_jsx(InputAdornment, { position: "end", children: _jsx(Button, { variant: "outlined", startIcon: _jsx(CloudUpload, {}), onClick: triggerFileInput, children: "\u0631\u0641\u0639 \u0635\u0648\u0631\u0629" }) })),
                                                        }, disabled: !!formData.imageFile }), _jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/*", style: { display: 'none' } })] })] }), _jsx(Divider, { children: _jsx(Chip, { label: "\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u062A\u0633\u0639\u064A\u0631" }) }), _jsxs(Box, { sx: { display: 'flex', gap: 2 }, children: [_jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0623\u0635\u0644\u064A", name: "priceBefore", value: formData.priceBefore, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                                    inputProps: { min: 0, step: 0.01 }
                                                } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0627\u0644\u0633\u0639\u0631 \u0628\u0639\u062F \u0627\u0644\u062E\u0635\u0645", name: "priceAfter", value: formData.priceAfter, onChange: handleNumberChange, variant: "outlined", InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "\u0631.\u0633" }),
                                                    inputProps: { min: 0, step: 0.01 }
                                                } }), _jsx(TextField, { fullWidth: true, type: "number", label: "\u0646\u0633\u0628\u0629 \u0627\u0644\u062E\u0635\u0645", name: "discountPercentage", value: formData.discountPercentage, variant: "outlined", InputProps: {
                                                    endAdornment: _jsx(InputAdornment, { position: "end", children: "%" }),
                                                    readOnly: true
                                                } })] }), _jsx(Divider, { children: _jsx(Chip, { label: "\u0627\u0644\u0639\u0646\u0627\u0635\u0631 \u0627\u0644\u0645\u0631\u062A\u0628\u0637\u0629" }) }), _jsx(Autocomplete, { multiple: true, options: branches, getOptionLabel: (option) => option, value: formData.branches, onChange: (_, value) => handleMultiSelect('branches', value), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0641\u0631\u0648\u0639", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0641\u0631\u0648\u0639" })) }), _jsx(Autocomplete, { multiple: true, options: services, getOptionLabel: (option) => option.name, value: services.filter(s => formData.services_ids.includes(s.id)), onChange: (_, value) => handleMultiSelect('services', value), renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u062E\u062F\u0645\u0627\u062A", placeholder: "\u0627\u062E\u062A\u0631 \u0627\u0644\u062E\u062F\u0645\u0627\u062A" })) }), _jsx(Autocomplete, { multiple: true, options: filteredDoctors, getOptionLabel: (option) => option.name, value: filteredDoctors.filter(d => formData.doctors_ids.includes(d.id)), onChange: (_, value) => handleMultiSelect('doctors', value), disabled: formData.branches.length === 0, renderInput: (params) => (_jsx(TextField, { ...params, label: "\u0627\u0644\u0623\u0637\u0628\u0627\u0621", placeholder: formData.branches.length === 0 ? "اختر الفروع أولا" : "اختر الأطباء" })) }), _jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, children: [_jsx(Button, { variant: "outlined", color: "secondary", disabled: loading, onClick: () => {
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
                                                }, children: "\u0645\u0633\u062D \u0627\u0644\u0646\u0645\u0648\u0630\u062C" }), _jsx(Button, { type: "submit", variant: "contained", color: "primary", disabled: loading, startIcon: loading ? _jsx(CircularProgress, { size: 20 }) : _jsx(Save, {}), children: loading ? 'جاري الحفظ...' : 'حفظ العرض' })] })] }) })] }) }), _jsx(OfferDialog, { open: dialogOpen, onClose: () => setDialogOpen(false), offer: currentOffer, mode: dialogMode, onSave: handleSaveOffer, services: services, branches: branches, doctors: allDoctors }), _jsxs(Dialog, { open: deleteConfirmOpen, onClose: () => setDeleteConfirmOpen(false), children: [_jsx(DialogTitle, { children: "\u062A\u0623\u0643\u064A\u062F \u0627\u0644\u062D\u0630\u0641" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u063A\u0628\u062A\u0643 \u0641\u064A \u062D\u0630\u0641 \u0647\u0630\u0627 \u0627\u0644\u0639\u0631\u0636\u061F \u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0644\u062A\u0631\u0627\u062C\u0639 \u0639\u0646 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setDeleteConfirmOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: confirmDelete, variant: "contained", color: "error", startIcon: _jsx(DeleteIcon, {}), children: "\u062D\u0630\u0641" })] })] }), _jsx(Snackbar, { open: notification.open, autoHideDuration: 6000, onClose: () => setNotification(prev => ({ ...prev, open: false })), anchorOrigin: { vertical: 'top', horizontal: 'center' }, children: _jsx(Alert, { onClose: () => setNotification(prev => ({ ...prev, open: false })), severity: notification.severity, sx: { width: '100%' }, children: notification.message }) })] }));
};
export default OfferAddForm;
