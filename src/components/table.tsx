import React, { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, Box
} from '@mui/material';

interface FormField {
    name: string;
    label?: string;
}

interface Contract {
    id: string | number;
    region_id?: number;
    [key: string]: any;
}

interface DataTableProps {
    formFields?: FormField[];
    data?: Contract[];
    onDelete?: (id: string | number) => void;
    onView?: (row: any) => void;
}

const defaultFormFields: FormField[] = [
    { name: 'id', label: 'ID' },
    { name: 'name', label: 'الاسم' },
    { name: 'email', label: 'البريد الإلكتروني' },
];

const defaultData: Contract[] = [
    { id: 1, name: 'أحمد', email: 'ahmed@example.com', region_id: 1 },
    { id: 2, name: 'سارة', email: 'sara@example.com', region_id: 2 },
    { id: 3, name: 'محمد', email: 'mohamed@example.com', region_id: 1 },
];

const DataTable: React.FC<DataTableProps> = ({
    formFields = defaultFormFields,
    data = defaultData,
    onDelete,
    onView
}) => {
    const [search, setSearch] = useState('');
    const [regionFilter, setRegionFilter] = useState<string | number>('all');

    // Extract all unique region_ids from data
    const regionOptions = useMemo(() => {
        const unique = Array.from(new Set((data || []).map(d => d.region_id).filter(Boolean)));
        return unique;
    }, [data]);

    const filteredData = useMemo(() => {
        return (data || []).filter(row => {
            const matchesSearch = Object.values(row).some(val =>
                typeof val === 'string' && val.toLowerCase().includes(search.toLowerCase())
            );

            const matchesRegion =
                regionFilter === 'all' || row.region_id?.toString() === regionFilter.toString();

            return matchesSearch && matchesRegion;
        });
    }, [search, regionFilter, data]);

    return (
        <div dir="rtl p-10">
            {/* Search & Filter */}
            <Box display="flex" gap={2} mb={2}>
                <TextField
                    label="بحث"
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="المنطقة"
                    select
                    size="small"
                    value={regionFilter}
                    onChange={(e) => setRegionFilter(e.target.value)}
                    style={{ minWidth: 150 }}
                >
                    <MenuItem value="all">الكل</MenuItem>
                    {regionOptions.map(regionId => (
                        <MenuItem key={regionId} value={regionId}>
                            المنطقة {regionId}
                        </MenuItem>
                    ))}
                </TextField>
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {formFields.map((field: FormField) => (
                                <TableCell key={field.name} style={{ fontWeight: 'bold', textAlign: 'right' }}>
                                    {field.label || field.name}
                                </TableCell>
                            ))}
                            {(onDelete || onView) && (
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>الإجراءات</TableCell>
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row, rowIndex) => (
                                <TableRow key={rowIndex} hover>
                                    {formFields.map((field: FormField) => (
                                        <TableCell key={`${rowIndex}-${field.name}`} style={{ textAlign: 'right' }}>
                                            {row[field.name] || '-'}
                                        </TableCell>
                                    ))}
                                    {(onDelete || onView) && (
                                        <TableCell align="center">
                                            {onView && (
                                                <button onClick={() => onView(row)}>عرض</button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(row.id)}>حذف</button>
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
