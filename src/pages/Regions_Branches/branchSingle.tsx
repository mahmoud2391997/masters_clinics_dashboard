import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField, Typography, Box, CircularProgress, Paper, IconButton } from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';
import MapComponent from './mapComponent';

type Branch = {
  id: string;
  name: string;
  address: string;
  location_link: string;
  working_hours?: Array<{
    days: string;
    time: string;
  }>;
  region: string;
  imageUrl?: string;
  coordinates: { latitude: number; longitude: number };
};

async function fetchBranch(id: string): Promise<Branch> {
  const response = await fetch(`https://www.ss.mastersclinics.com/branches/${id}`,
    {
      headers:{
        'Content-Type': 'application/json',
        "Authorization" : `Bearer ${sessionStorage.getItem("token")}`

      }
    }
  );
  if (!response.ok) throw new Error('Failed to fetch branch');
  return response.json();
}

async function updateBranch(id: string, data: Partial<Branch>): Promise<Branch> {
  const response = await fetch(`https://www.ss.mastersclinics.com/branches/${id}`, {
    method: 'PUT',
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem("token")}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error('Failed to update branch');
  return response.json();
}


const BranchSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Branch>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setForm(prev => ({ ...prev, imageFile: file }));
    }
  };

  const handleWorkingHoursChange = (index: number, field: 'days' | 'time', value: string) => {
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

  const removeWorkingHoursSlot = (index: number) => {
    setForm(prev => {
      const working_hours = [...(prev.working_hours || branch?.working_hours || [])];
      working_hours.splice(index, 1);
      return { ...prev, working_hours };
    });
  };

const handleSave = async () => {
  if (!id) return;

  try {
    const payload: Partial<Branch> = {
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
  } catch (error) {
    console.error('Failed to update branch:', error);
  }
};


  const handleCancel = () => {
    setForm(branch || {});
    setImagePreview(null);
    setEditMode(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!branch) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6">Branch not found</Typography>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          {branch.name}
        </Typography>
        <Box flexGrow={1} />
        {editMode ? (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={<Save />}
              onClick={handleSave}
              sx={{ mr: 2 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Cancel />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditMode(true)}
          >
            Edit
          </Button>
        )}
      </Box>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
        <Box flex={1}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Branch Information
            </Typography>
            
            <TextField
              label="Branch Name"
              name="name"
              value={editMode ? form.name || '' : branch.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={!editMode}
            />
            
            <TextField
              label="Address"
              name="address"
              value={editMode ? form.address || '' : branch.address}
              onChange={handleChange}
              fullWidth
              margin="normal"
              multiline
              rows={2}
              disabled={!editMode}
            />
            
            <TextField
              label="Region"
              name="region"
              value={editMode ? form.region || '' : branch.region}
              onChange={handleChange}
              fullWidth
              margin="normal"
              disabled={!editMode}
            />
            
            <TextField
              label="Location Link (Google Maps)"
              name="location_link"
              value={editMode ? form.location_link || '' : branch.location_link}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Example: https://goo.gl/maps/XYZ123 or place coordinates"
              disabled={!editMode}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Working Hours
            </Typography>
            
            {(editMode ? form.working_hours ?? [] : branch.working_hours ?? []).map((wh, index) => (
              <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                <TextField
                  label="Days"
                  value={wh?.days ?? ''}
                  onChange={(e) => handleWorkingHoursChange(index, 'days', e.target.value)}
                  fullWidth
                  disabled={!editMode}
                />
                <TextField
                  label="Time"
                  value={wh?.time ?? ''}
                  onChange={(e) => handleWorkingHoursChange(index, 'time', e.target.value)}
                  fullWidth
                  disabled={!editMode}
                />
                {editMode && (
                  <IconButton 
                    onClick={() => removeWorkingHoursSlot(index)}
                    color="error"
                    disabled={((form.working_hours ?? branch.working_hours ?? []).length <= 1)}
                  >
                    <Delete />
                  </IconButton>
                )}
              </Box>
            ))}
            
            {editMode && (
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addWorkingHoursSlot}
                sx={{ mt: 1 }}
              >
                Add Time Slot
              </Button>
            )}
          </Paper>
        </Box>

        <Box flex={1}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Box sx={{ height: "400px", width: "100%", position: 'relative' }}>
              <MapComponent
                coordinates={
                  branch.coordinates
                    ? { lat: branch.coordinates.latitude, lng: branch.coordinates.longitude }
                    : null
                }
              />
            </Box>
          </Paper>

          <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Branch Image
            </Typography>
            {editMode ? (
              <>
                <input
                  accept="image/*"
                  id="branch-image-upload"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
                <label htmlFor="branch-image-upload">
                  <Button variant="contained" component="span" sx={{ mb: 2 }}>
                    Upload New Image
                  </Button>
                </label>
                {(imagePreview || branch.imageUrl) && (
                  <img
                    src={imagePreview || branch.imageUrl}
                    alt="Branch preview"
                    style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }}
                  />
                )}
              </>
            ) : branch.imageUrl ? (
              <img
                src={branch.imageUrl}
                alt={branch.name}
                style={{ maxWidth: '100%', borderRadius: '8px' }}
              />
            ) : (
              <Typography variant="body2" color="textSecondary">
                No image available
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default BranchSingle;