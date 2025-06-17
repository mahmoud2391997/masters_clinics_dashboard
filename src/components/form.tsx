"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  FormControl,
  FormLabel,
  TextField,
  Button,
  MenuItem,
  Select,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import axios from "axios";
import * as cheerio from "cheerio";

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

const defaultFormFields: FormField[] = [
  { name: "name", label: "اسم الفرع", required: true },
  { name: "region_id", label: "المنطقة", required: true },
  { name: "district", label: "العنوان", required: true },
  { name: "working_hours", label: "ساعات العمل" },
  { name: "location_link", label: "رابط الموقع", dataType: "url" },
  { name: "latitude" },
  { name: "longitude" },
  { name: "image", label: "صورة الفرع", dataType: "file" },
];


const Form: React.FC<FormProps> = ({
  formFields = defaultFormFields,
  regions = [],
  status,
  onChange,
  onSubmit,
}) => {
  const [fields, setFields] = useState<FormField[]>(formFields);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isFetchingCoords, setIsFetchingCoords] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      const lat = parseFloat(latField as string);
      const lng = parseFloat(lngField as string);
      if (!isNaN(lat) && !isNaN(lng)) {
        setCoordinates({ lat, lng });
        return;
      }
    }

    const linkField = formFields.find((f) => f.name === "location_link")?.value;
    if (linkField) {
      handleLocationLinkChange(linkField as string);
    }
  }, [formFields]);

  const initializeImagePreview = useCallback(() => {
    const imageField = formFields.find((f) => f.name === "image");
    if (imageField?.value && typeof imageField.value === "string") {
      setImagePreview(imageField.value);
    }
  }, [formFields]);

  const updateFieldValue = useCallback(
    (name: string, value: string | File) => {
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.name === name ? { ...field, value } : field
        )
      );
      onChange?.(name, value);
    },
    [onChange]
  );

  const handleFieldChange = useCallback(
    (name: string, value: string | File) => {
      if (isLoading) return;

      updateFieldValue(name, value);

      if (name === "location_link") {
        handleLocationLinkChange(value as string);
      }
    },
    [isLoading, updateFieldValue]
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleLocationLinkChange = useCallback(
    async (url: string) => {
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
      } catch (error) {
        console.error("Failed to extract coordinates:", error);
      } finally {
        setIsFetchingCoords(false);
      }
    },
    [updateFieldValue]
  );

  const extractCoordinatesFromLink = useCallback(async (shortUrl: string) => {
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
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return null;
    }
  }, []);

  return (
    <div className="text-right mb-4 p-5">
      <h2 className="text-xl font-bold text-gray-800">إضافة فرع جديد</h2>
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
        dir="rtl"
      >
        {fields
          .filter((field) => !["latitude", "longitude"].includes(field.name))
          .map((field) => (
            <FormControl key={field.name} fullWidth>
              <FormLabel className="min-w-[150px] text-right">
                {field.label || field.name}
                {field.required && <span className="text-red-500"> *</span>}
              </FormLabel>

              {field.name === "region_id" ? (
                <Select
                  value={field.value || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                  disabled={isLoading}
                  displayEmpty
                  inputProps={{ dir: "rtl" }}
                >
                  <MenuItem value="" disabled>
                    اختر المنطقة
                  </MenuItem>
                  {regions.map((region) => (
                    <MenuItem key={region.id} value={region.id}>
                      {region.name}
                    </MenuItem>
                  ))}
                </Select>
              ) : field.dataType === "file" ? (
                <Box sx={{ mt: 1 }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    required={field.required}
                    style={{ display: 'none' }}
                    id="file-upload"
                    ref={fileInputRef}
                  />
                  <label htmlFor="file-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      disabled={isLoading}
                    >
                      اختر صورة
                    </Button>
                  </label>
                  
                  {imagePreview && (
                    <Box sx={{ mt: 2, textAlign: 'center', position: 'relative' }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ 
                          maxWidth: '100%', 
                          maxHeight: '200px',
                          borderRadius: '4px',
                          marginTop: '8px'
                        }}
                      />
                      <IconButton
                        onClick={handleRemoveImage}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                          }
                        }}
                      >
                        <ClearIcon color="error" />
                      </IconButton>
                    </Box>
                  )}
                  
                  {!imagePreview && (
                    <Box sx={{ 
                      mt: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100px',
                      border: '1px dashed #ccc',
                      borderRadius: '4px',
                      backgroundColor: '#f5f5f5'
                    }}>
                      <ImageIcon sx={{ fontSize: 40, color: '#aaa' }} />
                      <Typography variant="body2" color="textSecondary">
                        لم يتم اختيار صورة
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <TextField
                  type={field.dataType || "text"}
                  value={field.value as string || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  variant="outlined"
                  required={field.required}
                  fullWidth
                  inputProps={{ dir: "rtl" }}
                  disabled={isLoading}
                />
              )}
            </FormControl>
          ))}

        {/* Hidden lat/lng inputs */}
        <input type="hidden" name="latitude" value={coordinates?.lat ?? ""} />
        <input type="hidden" name="longitude" value={coordinates?.lng ?? ""} />

        <div className="flex justify-end md:col-span-3">
          <Button
            variant="contained"
            color="primary"
            type="submit"
            size="large"
            disabled={isLoading || !coordinates || isFetchingCoords}
            sx={{ minWidth: '120px' }}
          >
            {isLoading ? "جاري الحفظ..." : "حفظ البيانات"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Form;