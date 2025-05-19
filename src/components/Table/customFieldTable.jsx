import React from 'react';
import { Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, TextField } from '@mui/material';
import CustomTextField from '@/components/Input/customTextField';

const CustomFieldsTable = ({ rows, onUpdateRow, title }) => {
    const handleCustomFieldChange = (rowIndex, field, value) => {
        const row = rows[rowIndex];
        const newValue = [...(row.value || [])];

        if (field === 'add') {
            newValue.push({ id: '', value: '' });
        } else {
            const [fieldIndex, fieldType] = field.split('.');
            newValue[fieldIndex] = {
                ...newValue[fieldIndex],
                [fieldType]: value
            };
        }

        onUpdateRow(row.originalIndex, { value: newValue });
    };

    const handleDelete = (rowIndex, fieldIndex) => {
        const row = rows[rowIndex];
        const newValue = [...(row.value || [])];
        newValue.splice(fieldIndex, 1);
        onUpdateRow(row.originalIndex, { value: newValue });
    };

    return (
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#3D55CC', color: 'white' }}>
                {title}
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>ID</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                            {(row.value || []).length === 0 ? (
                                <TableRow>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell colSpan={3} align="center">
                                        No custom fields. Click "Add Field" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (row.value || []).map((field, fieldIndex) => (
                                    <TableRow key={`${rowIndex}-${fieldIndex}`}>
                                        {fieldIndex === 0 && (
                                            <TableCell rowSpan={(row.value || []).length + 1}>
                                                {row.name}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            <CustomTextField value={field.id}
                                                placeholder='Input ID'
                                                onBlur={(newVal) =>
                                                    handleCustomFieldChange(
                                                        rowIndex,
                                                        `${fieldIndex}.id`,
                                                        newVal
                                                    )
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {/* <TextField
                                                fullWidth
                                                size="small"
                                                value={field.value}
                                                onChange={(e) =>
                                                    handleCustomFieldChange(
                                                        rowIndex,
                                                        `${fieldIndex}.value`,
                                                        e.target.value
                                                    )
                                                }
                                            /> */}
                                            <CustomTextField value={field.value}
                                                placeholder='Input Value'
                                                onChange={(e) =>
                                                    handleCustomFieldChange(
                                                        rowIndex,
                                                        `${fieldIndex}.value`,
                                                        e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(rowIndex, fieldIndex)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => handleCustomFieldChange(rowIndex, 'add')}
                                    >
                                        Add Field
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default CustomFieldsTable;