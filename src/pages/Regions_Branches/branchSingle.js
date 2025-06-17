import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Box, CircularProgress, Paper, IconButton } from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';
import MapComponent from './mapComponent';
async function fetchBranch(id) {
    const response = await fetch(`http://localhost:3000/branches/${id}`, {
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`
        }
    });
    if (!response.ok)
        throw new Error('Failed to fetch branch');
    return response.json();
}
async function updateBranch(id, data) {
    const response = await fetch(`http://localhost:3000/branches/${id}`, {
        method: 'PUT',
        headers: {
            "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
    });
    if (!response.ok)
        throw new Error('Failed to update branch');
    return response.json();
}
const BranchSingle = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    useEffect(() => {
        if (id) {
            fetchBranch(id)
                .then(data => {
                setBranch(data);
                setForm(data);
            })
                .catch(() => setBranch(null))
                .finally(() => setLoading(false));
        }
    }, [id]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
            setForm(prev => ({ ...prev, imageFile: file }));
        }
    };
    const handleWorkingHoursChange = (index, field, value) => {
        setForm(prev => {
            const working_hours = [...(prev.working_hours || branch?.working_hours || [])];
            working_hours[index] = { ...working_hours[index], [field]: value };
            return { ...prev, working_hours };
        });
    };
    const addWorkingHoursSlot = () => {
        setForm(prev => ({
            ...prev,
            working_hours: [...(prev.working_hours || branch?.working_hours || []), { days: '', time: '' }]
        }));
    };
    const removeWorkingHoursSlot = (index) => {
        setForm(prev => {
            const working_hours = [...(prev.working_hours || branch?.working_hours || [])];
            working_hours.splice(index, 1);
            return { ...prev, working_hours };
        });
    };
    const handleSave = async () => {
        if (!id)
            return;
        try {
            const payload = {
                name: form.name ?? branch?.name,
                address: form.address ?? branch?.address,
                region: form.region ?? branch?.region,
                location_link: form.location_link ?? branch?.location_link,
                working_hours: form.working_hours ?? branch?.working_hours,
                coordinates: form.coordinates ?? branch?.coordinates,
                imageUrl: imagePreview || branch?.imageUrl
            };
            const updatedBranch = await updateBranch(id, payload);
            setBranch(updatedBranch);
            setForm(updatedBranch);
            setImagePreview(null);
            setEditMode(false);
        }
        catch (error) {
            console.error('Failed to update branch:', error);
        }
    };
    const handleCancel = () => {
        setForm(branch || {});
        setImagePreview(null);
        setEditMode(false);
    };
    if (loading) {
        return (_jsx(Box, { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", children: _jsx(CircularProgress, {}) }));
    }
    if (!branch) {
        return (_jsxs(Box, { textAlign: "center", p: 4, children: [_jsx(Typography, { variant: "h6", children: "Branch not found" }), _jsx(Button, { variant: "contained", onClick: () => navigate(-1), sx: { mt: 2 }, children: "Go Back" })] }));
    }
    return (_jsxs(Box, { sx: { maxWidth: 1200, mx: 'auto', p: 3 }, children: [_jsxs(Box, { display: "flex", alignItems: "center", mb: 3, children: [_jsx(IconButton, { onClick: () => navigate(-1), sx: { mr: 2 }, children: _jsx(ArrowBack, {}) }), _jsx(Typography, { variant: "h4", component: "h1", children: branch.name }), _jsx(Box, { flexGrow: 1 }), editMode ? (_jsxs(_Fragment, { children: [_jsx(Button, { variant: "contained", color: "success", startIcon: _jsx(Save, {}), onClick: handleSave, sx: { mr: 2 }, children: "Save" }), _jsx(Button, { variant: "outlined", color: "error", startIcon: _jsx(Cancel, {}), onClick: handleCancel, children: "Cancel" })] })) : (_jsx(Button, { variant: "contained", startIcon: _jsx(Edit, {}), onClick: () => setEditMode(true), children: "Edit" }))] }), _jsxs(Box, { display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: 4, children: [_jsx(Box, { flex: 1, children: _jsxs(Paper, { elevation: 3, sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Branch Information" }), _jsx(TextField, { label: "Branch Name", name: "name", value: editMode ? form.name || '' : branch.name, onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "Address", name: "address", value: editMode ? form.address || '' : branch.address, onChange: handleChange, fullWidth: true, margin: "normal", multiline: true, rows: 2, disabled: !editMode }), _jsx(TextField, { label: "Region", name: "region", value: editMode ? form.region || '' : branch.region, onChange: handleChange, fullWidth: true, margin: "normal", disabled: !editMode }), _jsx(TextField, { label: "Location Link (Google Maps)", name: "location_link", value: editMode ? form.location_link || '' : branch.location_link, onChange: handleChange, fullWidth: true, margin: "normal", helperText: "Example: https://goo.gl/maps/XYZ123 or place coordinates", disabled: !editMode }), _jsx(Typography, { variant: "subtitle1", sx: { mt: 3, mb: 1 }, children: "Working Hours" }), (editMode ? form.working_hours ?? [] : branch.working_hours ?? []).map((wh, index) => (_jsxs(Box, { display: "flex", gap: 2, mb: 2, alignItems: "center", children: [_jsx(TextField, { label: "Days", value: wh?.days ?? '', onChange: (e) => handleWorkingHoursChange(index, 'days', e.target.value), fullWidth: true, disabled: !editMode }), _jsx(TextField, { label: "Time", value: wh?.time ?? '', onChange: (e) => handleWorkingHoursChange(index, 'time', e.target.value), fullWidth: true, disabled: !editMode }), editMode && (_jsx(IconButton, { onClick: () => removeWorkingHoursSlot(index), color: "error", disabled: ((form.working_hours ?? branch.working_hours ?? []).length <= 1), children: _jsx(Delete, {}) }))] }, index))), editMode && (_jsx(Button, { variant: "outlined", startIcon: _jsx(Add, {}), onClick: addWorkingHoursSlot, sx: { mt: 1 }, children: "Add Time Slot" }))] }) }), _jsxs(Box, { flex: 1, children: [_jsxs(Paper, { elevation: 3, sx: { p: 3 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Location" }), _jsx(Box, { sx: { height: "400px", width: "100%", position: 'relative' }, children: _jsx(MapComponent, { coordinates: branch.coordinates
                                                ? { lat: branch.coordinates.latitude, lng: branch.coordinates.longitude }
                                                : null }) })] }), _jsxs(Paper, { elevation: 3, sx: { p: 3, mt: 3 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "Branch Image" }), editMode ? (_jsxs(_Fragment, { children: [_jsx("input", { accept: "image/*", id: "branch-image-upload", type: "file", style: { display: 'none' }, onChange: handleImageChange }), _jsx("label", { htmlFor: "branch-image-upload", children: _jsx(Button, { variant: "contained", component: "span", sx: { mb: 2 }, children: "Upload New Image" }) }), (imagePreview || branch.imageUrl) && (_jsx("img", { src: imagePreview || branch.imageUrl, alt: "Branch preview", style: { maxWidth: '100%', borderRadius: '8px', display: 'block' } }))] })) : branch.imageUrl ? (_jsx("img", { src: branch.imageUrl, alt: branch.name, style: { maxWidth: '100%', borderRadius: '8px' } })) : (_jsx(Typography, { variant: "body2", color: "textSecondary", children: "No image available" }))] })] })] })] }));
};
export default BranchSingle;
