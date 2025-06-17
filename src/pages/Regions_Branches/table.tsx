import React, { useState, useMemo } from 'react';
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TextField, MenuItem, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteBranch } from '../../api/regions&branches';

interface FormField {
  name: string;
  label?: string;
}

interface Contract {
  id: string | number;
  _id?: string | number; // Make sure this matches your actual data structure
  region_id?: number;
  [key: string]: any;
}

interface Region {
  id: string | number;
  name: string;
  [key: string]: any;
}

interface DataTableProps {
  formFields?: FormField[];
  data?: Contract[];
  regions?: Region[];
  onDelete?: (id: string | number) => void;
  onView?: (row: Contract) => void;
  onDataChange?: () => void; // Add this to refresh data after deletion
}

const defaultFormFields: FormField[] = [
  { name: 'name', label: 'اسم الفرع' },
  { name: 'region', label: 'المنطقة' },
  { name: 'address', label: 'العنوان' },
  { name: 'working_hours', label: 'ساعات العمل' },
  { name: 'location_link', label: 'رابط الموقع' },
];

const DataTable: React.FC<DataTableProps> = ({
  formFields = defaultFormFields,
  regions = [],
  data = [],
  onDelete,
  onView,
  onDataChange, // Destructure the new prop
}) => {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState<string | number>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredData = useMemo(() => {
    return (data || []).filter(row => {
      const matchesSearch = Object.values(row).some(value =>
        typeof value === 'string' && value.toLowerCase().includes(search.toLowerCase())
      );
      const matchesRegion =
        regionFilter === 'all' || row.region_id?.toString() === regionFilter.toString();
      return matchesSearch && matchesRegion;
    });
  }, [search, regionFilter, data]);

  const handleDeleteClick = (id: string | number) => {
    setItemToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      // First try to use the onDelete prop if provided
      if (onDelete) {
        await onDelete(itemToDelete);
      } else {
        // Fallback to direct API call
        await deleteBranch(itemToDelete);
      }
      
      // Refresh data if callback provided
      if (onDataChange) {
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      // You might want to show an error message here
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  return (
    <Box dir="rtl" className="p-5">
      {/* Search and Region Filter */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          label="بحث"
          variant="outlined"
          size="small"
          fullWidth
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TextField
          label="المنطقة"
          variant="outlined"
          select
          size="small"
          value={regionFilter}
          className='w-50'
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <MenuItem value="all">الكل</MenuItem>
          {regions.map((region) => (
            <MenuItem key={region.id} value={region.id}>
              {region.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {formFields.map(field => (
                <TableCell key={field.name} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  {field.label || field.name}
                </TableCell>
              ))}
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                الإجراءات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <TableRow key={row.id || row._id || rowIndex} hover>
                  {formFields.map(field => {
                    let cellContent = row[field.name];

                    // Handle region display
                    if (field.name === 'region') {
                      const region = regions.find(r => r.id === row.region_id);
                      cellContent = region ? region.name : 'غير محدد';
                    } 
                    // Handle working_hours display
                    else if (field.name === 'working_hours' && Array.isArray(row[field.name])) {
                      cellContent = row[field.name]
                        .map((wh: { days: string; time: string }) => `${wh.days}: ${wh.time}`)
                        .join(' | ');
                    } 
                    // Handle object types generically
                    else if (typeof cellContent === 'object' && cellContent !== null) {
                      cellContent = Object.values(cellContent).join(' | ');
                    } 
                    // Default fallback
                    else {
                      cellContent = cellContent ?? '-';
                    }

                    return (
                      <TableCell key={field.name} sx={{ textAlign: 'right' }}>
                        {cellContent}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => onView ? onView(row) : window.location.href = `/branches/${row.id || row._id}`}
                      sx={{ mx: 0.5 }}
                    >
                      عرض
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDeleteClick(row._id || row.id)}
                      sx={{ mx: 0.5 }}
                      disabled={isDeleting}
                    >
                      حذف
                    </Button>
                  </TableCell>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>هل أنت متأكد أنك تريد حذف هذا العنصر؟</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary" disabled={isDeleting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            autoFocus
            disabled={isDeleting}
          >
            {isDeleting ? 'جاري الحذف...' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DataTable;