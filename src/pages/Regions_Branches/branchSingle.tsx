import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, IconButton, Paper, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Stack
} from '@mui/material';
import { Edit, Save, Cancel, ArrowBack, Add, Delete } from '@mui/icons-material';
import MapComponent from './mapComponent';
import { getImageUrl } from '../../hooks/imageUrl';

interface WorkingHours {
  days: string;
  time: string;
}

interface Coordinates {
  latitude: string;
  longitude: string;
}

interface Branch {
  id: number;
  name: string;
  address: string;
  location_link: string;
  region_id: number;
  image_url: string;
  latitude: string;
  longitude: string;
  working_hours: WorkingHours[];
  coordinates?: Coordinates;
}

interface Region {
  id: number;
  name: string;
}

async function fetchBranch(id: string): Promise<Branch> {
  const response = await fetch(`http://localhost:3000/branches/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${sessionStorage.getItem("token")}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch branch');

  const data = await response.json();
  if (data.latitude && data.longitude) {
    data.coordinates = {
      latitude: data.latitude,
      longitude: data.longitude
    };
  }
  return data;
}

async function fetchRegions(): Promise<Region[]> {
  const response = await fetch('http://localhost:3000/regions', {
    headers: {
      'Content-Type': 'application/json',
      "Authorization": `Bearer ${sessionStorage.getItem("token")}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch regions');
  return response.json();
}

async function updateBranch(id: number, data: Partial<Branch> & { imageFile?: File }): Promise<Branch> {
  const formData = new FormData();

  if (data.name) formData.append('name', data.name);
  if (data.address) formData.append('address', data.address);
  if (data.location_link) formData.append('location_link', data.location_link);
  if (data.region_id) formData.append('region_id', data.region_id.toString());
  if (data.working_hours) formData.append('working_hours', JSON.stringify(data.working_hours));
  if (data.coordinates?.latitude) formData.append('latitude', data.coordinates.latitude);
  if (data.coordinates?.longitude) formData.append('longitude', data.coordinates.longitude);
  if (data.imageFile) formData.append('image', data.imageFile);

  const response = await fetch(`http://localhost:3000/branches/${id}`, {
    method: 'PUT',
    headers: {
      "Authorization": `Bearer ${sessionStorage.getItem("token")}`
    },
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to update branch');
  return response.json();
}

const BranchSingle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<Branch> & { imageFile?: File }>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [branchData, regionsData] = await Promise.all([
          id ? fetchBranch(id) : Promise.resolve(null),
          fetchRegions()
        ]);

        setRegions(regionsData);
        if (branchData) {
          setBranch(branchData);
          setForm({
            ...branchData,
            working_hours: [...(branchData.working_hours || [])]
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = (e: any) => {
    const region_id = Number(e.target.value);
    setForm(prev => ({ ...prev, region_id }));
  };

  const handleCoordinatesChange = (lat: string, lng: string) => {
    setForm(prev => ({
      ...prev,
      coordinates: {
        latitude: lat,
        longitude: lng
      }
    }));
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

  const handleWorkingHoursChange = (index: number, field: keyof WorkingHours, value: string) => {
    setForm(prev => {
      const working_hours = [...(prev.working_hours || [])];
      working_hours[index] = { ...working_hours[index], [field]: value };
      return { ...prev, working_hours };
    });
  };

  const addWorkingHoursSlot = () => {
    setForm(prev => ({
      ...prev,
      working_hours: [
        ...(prev.working_hours || []),
        { days: '', time: '' }
      ]
    }));
  };

  const removeWorkingHoursSlot = (index: number) => {
    setForm(prev => {
      const working_hours = [...(prev.working_hours || [])];
      working_hours.splice(index, 1);
      return { ...prev, working_hours };
    });
  };

  const handleSave = async () => {
    if (!id || !branch) return;
    try {
      const updated = await updateBranch(branch.id, {
        ...form,
        working_hours: form.working_hours || [],
        imageFile: form.imageFile
      });

      setBranch(updated);
      setForm(updated);
      setImagePreview(null);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update branch:', error);
    }
  };

  const handleCancel = () => {
    if (branch) {
      setForm(branch);
      setImagePreview(null);
      setEditMode(false);
    }
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

            <FormControl fullWidth margin="normal" disabled={!editMode}>
              <InputLabel>Region</InputLabel>
              <Select
                value={editMode ? form.region_id || '' : branch.region_id}
                onChange={handleRegionChange}
                label="Region"
              >
                {regions.map(region => (
                  <MenuItem key={region.id} value={region.id}>
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Location Link (Google Maps)"
              name="location_link"
              value={editMode ? form.location_link || '' : branch.location_link}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Example: https://goo.gl/maps/XYZ123"
              disabled={!editMode}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Working Hours
            </Typography>

            <Stack spacing={2}>
              {(editMode ? form.working_hours || [] : branch.working_hours || []).map((wh, index) => (
                <Box key={index} display="flex" gap={2} mb={2} alignItems="center">
                  <TextField
                    label="Days"
                    value={wh?.days || ''}
                    onChange={(e) => handleWorkingHoursChange(index, 'days', e.target.value)}
                    fullWidth
                    disabled={!editMode}
                  />
                  <TextField
                    label="Time"
                    value={wh?.time || ''}
                    onChange={(e) => handleWorkingHoursChange(index, 'time', e.target.value)}
                    fullWidth
                    disabled={!editMode}
                  />
                  {editMode && (
                    <IconButton
                      onClick={() => removeWorkingHoursSlot(index)}
                      color="error"
                      disabled={(form.working_hours || []).length <= 1}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Stack>

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
                coordinates={editMode ?
                  (form.coordinates ? {
                    lat: parseFloat(form.coordinates.latitude),
                    lng: parseFloat(form.coordinates.longitude)
                  } : null) :
                  (branch.coordinates ? {
                    lat: parseFloat(branch.coordinates.latitude),
                    lng: parseFloat(branch.coordinates.longitude)
                  } : null)}
                onLocationChange={editMode ? handleCoordinatesChange : undefined}
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
                {(imagePreview || getImageUrl(branch.image_url)) && (
                  <img
                    src={imagePreview || getImageUrl(branch.image_url)}
                    alt="Branch preview"
                    style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }}
                  />
                )}
              </>
            ) : branch.image_url ? (
              <img
                src={getImageUrl(branch.image_url)}
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
