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

    const handlePicklistChange = async (rowIndex, fieldIndex, isChecked) => {
        const row = rows[rowIndex];
        const newValue = [...(row.value || [])];

        if (isChecked) {
            const customFieldId = newValue[fieldIndex].id

            const apiOptions = await fetchPicklistOptions(customFieldId);
            console.log(apiOptions);

            newValue[fieldIndex] = {
                ...newValue[fieldIndex],
                type: "picklist",
                options: apiOptions.map((opt) => ({
                    optionId: opt,
                    smallvalue: ""
                }))
            };
        } else {
            const { type, options, ...rest } = newValue[fieldIndex];
            newValue[fieldIndex] = { ...rest };
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
        <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden', minHeight: "240px" }}>
            <Typography variant="h6" sx={{ p: 2, bgcolor: '#3D55CC', color: 'white' }}>
                {title}
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ width: '200px' }}>Name</TableCell>
                        <TableCell sx={{ width: '200px' }}>ID</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell align='center' sx={{ width: '150px' }}>Actions</TableCell>
                        <TableCell align='center' sx={{ width: '100px' }}>Pick list</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <React.Fragment key={rowIndex}>
                            {(row.value).length === 0 ? (
                                <TableRow>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell colSpan={3} align="center">
                                        No custom fields. Click "Add Field" to create one.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                (row.value).map((field, fieldIndex) => {
                                    const isPicklist = field.type === 'picklist';
                                    return (
                                        <React.Fragment key={`${rowIndex}-${fieldIndex}`}>
                                            <TableRow>
                                                {fieldIndex === 0 && (
                                                    <TableCell rowSpan={
                                                        row.value.length +
                                                        (row.value.reduce((sum, f) => sum + (f.options?.length || 0), 0))
                                                    }>
                                                        {row.name}
                                                    </TableCell>
                                                )}
                                                <TableCell>
                                                    <CustomTextField
                                                        value={field.id}
                                                        placeholder='Input ID'
                                                        onBlur={(newVal) =>
                                                            handleCustomFieldChange(rowIndex, `${fieldIndex}.id`, newVal)
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <CustomTextField
                                                        value={field.value}
                                                        placeholder='Input Value'
                                                        onBlur={(newVal) =>
                                                            handleCustomFieldChange(rowIndex, `${fieldIndex}.value`, newVal)
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Button
                                                        variant="contained"
                                                        color="error"
                                                        size="small"
                                                        onClick={() => handleDelete(rowIndex, fieldIndex)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isPicklist}
                                                        onChange={(e) =>
                                                            handlePicklistChange(rowIndex, fieldIndex, e.target.checked)
                                                        }
                                                    />
                                                </TableCell>
                                            </TableRow>

                                            {/* Render thêm các dòng phụ nếu là picklist */}
                                            {isPicklist && field.options?.map((opt, optIndex) => (
                                                <TableRow key={`sub-${rowIndex}-${fieldIndex}-${optIndex}`} sx={{ bgcolor: '#f0f0f0' }}>
                                                    <TableCell>
                                                        <CustomTextField
                                                            value={opt.optionId}
                                                            placeholder="Option ID"
                                                            onBlur={() => { }}
                                                            multiline={false}
                                                            disabled={true}
                                                        />
                                                    </TableCell>
                                                    <TableCell colSpan={3}>
                                                        <CustomTextField
                                                            value={opt.smallvalue}
                                                            placeholder="Input Small Value"
                                                            onBlur={(newVal) => {
                                                                const newOptions = [...field.options];
                                                                newOptions[optIndex].smallvalue = newVal;
                                                                const newRowValue = [...row.value];
                                                                newRowValue[fieldIndex].options = newOptions;
                                                                onUpdateRow(row.originalIndex, { value: newRowValue });
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
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

async function fetchPicklistOptions(custom_field_id) {
    try {
        const res = await fetch(`/api/custom_fields?custom_field_id=${custom_field_id}`);
        if (!res.ok) throw new Error('Failed to fetch options');
        const data = await res.json();
        return data;
    } catch (error) {
        console.error(error);
        return [];
    }
}