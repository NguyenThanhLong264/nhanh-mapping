import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import CustomizeSwitch from "@/components/Button/Switch";
import CustomTextField from "@/components/Input/customTextField";
import CustomSelection from "@/components/Input/CustomSelection";

const ProductTable = ({
  rows,
  onUpdateRow,
  title,
  nhanhProductFields = [
    { name: "id", type: "string" },
    { name: "quantity", type: "int" },
    { name: "price", type: "float" },
    { name: "discount", type: "float" },
    { name: "weight", type: "float" },
  ],
}) => {
  // Gộp tất cả subFields và thêm thông tin parentIndex + subFieldIndex
  const productFields = rows.flatMap((row, parentIndex) =>
    row.subFields.map((subField, subFieldIndex) => ({
      ...subField,
      parentIndex,
      subFieldIndex,
      originalIndex: row.originalIndex, // Dùng để cập nhật vào rowsConfig
    }))
  );

  const updateSubField = (parentIndex, subFieldIndex, updatedValues) => {
    const row = rows[parentIndex];
    const updatedSubFields = [...row.subFields];
    updatedSubFields[subFieldIndex] = {
      ...updatedSubFields[subFieldIndex],
      ...updatedValues,
    };

    onUpdateRow(row.originalIndex, {
      subFields: updatedSubFields,
    });
  };

  return (
    <Paper sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
      <Typography
        variant="h6"
        sx={{ p: 2, bgcolor: "#3D55CC", color: "white" }}
      >
        {title}
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product Params</TableCell>
            <TableCell align="center">Input Type</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {productFields.map((field, index) => (
            <TableRow key={index}>
              <TableCell>{field.name}</TableCell>
              <TableCell align="center">
                {/* <Switch
                                    checked={field.typeInput === 'map'}
                                    onChange={(e) => {
                                        const newType = e.target.checked ? 'map' : 'normal';
                                        updateSubField(field.parentIndex, field.subFieldIndex, {
                                            typeInput: newType,
                                            value: ""
                                        });
                                    }}
                                /> */}
                <CustomizeSwitch
                  checked={field.typeInput === "map"}
                  label={"Mapping"}
                  onChange={(e) => {
                    const newType = e.target.checked ? "map" : "normal";
                    updateSubField(field.parentIndex, field.subFieldIndex, {
                      typeInput: newType,
                      value: "",
                    });
                  }}
                />
              </TableCell>
              <TableCell>
                {field.typeInput === "normal" ? (
                  <CustomTextField
                    value={field.value}
                    placeholder="Input value"
                    onBlur={(newVal) =>
                      updateSubField(field.parentIndex, field.subFieldIndex, {
                        value: newVal,
                      })
                    }
                  />
                ) : (
                  <CustomSelection
                    value={field.value}
                    option={nhanhProductFields.map((item) => item.name)}
                    onChange={(_, newValue) =>
                      updateSubField(field.parentIndex, field.subFieldIndex, {
                        value: newValue,
                      })
                    }
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

// Remove the const nhanhProductFields declaration at the bottom
export default ProductTable;
