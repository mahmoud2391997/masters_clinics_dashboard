import React, { useMemo, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, TextField, Box, Button, CircularProgress, Link
} from '@mui/material';

interface FormField {
    name: string;
    label?: string;
}

interface Contract {
    id: string | number;
    createdAt: string;
    creator?: string;
    pageTitle?: string;
    platforms?: Record<string, boolean>;
    links?: Record<string, string>;
    region_id?: number;
    [key: string]: any;
}

interface DataTableProps {
    formFields?: FormField[];
    data?: Contract[];
    loading?: boolean;
    onDelete?: (id: string | number) => void;
    onView?: (row: any) => void;
    onEdit?: (row: any) => void;
}

// Update the formFields in the DataTable component:
const defaultFormFields: FormField[] = [
    { name: 'createdAt', label: 'تاريخ الإنشاء' },
    { name: 'creator', label: 'المنشئ' },
    { name: 'title', label: 'عنوان الصفحة' },
    { name: 'links', label: 'روابط الصفحات' },
    { name: 'actions', label: 'الاجراءات' }, // Add branches column
];

const DataTable: React.FC<DataTableProps> = ({
    formFields = defaultFormFields,
    data = [],
    loading = false,
    onDelete,
    onView,
    onEdit
}) => {
    // State for filters and region selection
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [regionFilter] = useState<string | number>('all');

   console.log(data);
   

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const filteredData = useMemo(() => {
        return (data || []).filter(row => {
            const matchesFields = Object.entries(filters).every(([key, value]) => {
                if (key === 'createdAt') {
                    // No filter for createdAt
                    return true;
                }
                return row[key]?.toString().toLowerCase().includes(value.toLowerCase());
            });

            const matchesRegion =
                regionFilter === 'all' || row.region_id?.toString() === regionFilter.toString();

            return matchesFields && matchesRegion;
        });
    }, [filters, regionFilter, data]);

    return (
        <div dir="rtl">
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {formFields.map((field) => (
                                <TableCell key={field.name} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                                    <Box display="flex" flexDirection="column">
                                        <span>{field.label || field.name}</span>
                                        {/* Remove search for createdAt and links/platforms */}
                                        {field.name !== 'createdAt' && field.name !== 'links' && field.name !== 'actions' && (
                                            <TextField
                                                variant="standard"
                                                size="small"
                                                placeholder={`بحث`}
                                                value={filters[field.name] || ''}
                                                onChange={(e) => handleFilterChange(field.name, e.target.value)}
                                                inputProps={{ style: { fontSize: '0.8rem' } }}
                                            />
                                        )}
                                        
                                    </Box>
                                </TableCell>
                            ))}
                            {(onDelete || onView || onEdit) && (
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={formFields.length + 1} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : filteredData.length > 0 ? (
                            filteredData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} hover>
                                    {formFields.map((field) => (
                                        <TableCell key={`${rowIndex}-${field.name}`} style={{ textAlign: 'right' }}>
                                            {field.name === 'actions' ? (
           
<View id={row.id} />
        ) :
                                            field.name === 'createdAt' ? (
                                                // Show date and time in Arabic-Egypt locale
                                                new Date(row.createdAt).toLocaleString('ar-EG', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    second: '2-digit',
                                                    hour12: true
                                                })
                                            ) : field.name === 'links' && row.platforms ? (
                                                Object.entries(row.platforms)
                                                    .filter(([_, enabled]) => enabled)
                                                    .map(([platform]) => (
                                                        <div key={platform}>
                                                            <Link
                                                                href={`https://www.mastersclinics.com/landingPage/${row.id}?utm_source=${platform}`}
                                                                target="_blank"
                                                                rel="noopener"
                                                            >
                                                                {platform}
                                                            </Link>
                                                        </div>
                                                    ))
                                            ) : (
                                                row[field.name] || '-'
                                            )}
                                        </TableCell>
                                    ))}
                                    {(onDelete || onView || onEdit) && (
                                        <TableCell align="center">
                                            {onView && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => onView(row)}
                                                    style={{ marginLeft: 4 }}
                                                >
                                                    عرض
                                                </Button>
                                            )}
                                            {onEdit && (
                                                <Button
                                                    variant="outlined"
                                                    color="warning"
                                                    size="small"
                                                    onClick={() => onEdit(row)}
                                                    style={{ marginLeft: 4 }}
                                                >
                                                    تعديل
                                                </Button>
                                            )}
                                            {onDelete && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => onDelete(row.id)}
                                                >
                                                    حذف
                                                </Button>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={formFields.length + 1} align="center">
                                    لا توجد بيانات متاحة
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default DataTable;
import { useNavigate } from "react-router-dom";

interface ViewProps {
  id: string | number;
}

const View: React.FC<ViewProps> = ({ id }) => {
  const navigate = useNavigate();

  const handleViewClick = () => {
    navigate(`/landingPage/${id}`);
  };

  return (
    <Button variant="outlined" onClick={handleViewClick}>
      عرض
    </Button>
  );
};
