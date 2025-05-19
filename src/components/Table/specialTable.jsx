import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import CustomTextField from "@/components/Input/customTextField";
import CustomSelection from "@/components/Input/CustomSelection";

const SpecialTable = ({ rows, onUpdateRow, title }) => {
  const nhanhStatus = [
    { value: "New" },
    { value: "Confirming" },
    { value: "CustomerConfirming" },
    { value: "Confirmed" },
    { value: "Packing" },
    { value: "Packed" },
    { value: "ChangeDepot" },
    { value: "Pickup" },
    { value: "Shipping" },
    { value: "Success" },
    { value: "Failed" },
    { value: "Canceled" },
    { value: "Aborted" },
    { value: "CarrierCanceled" },
    { value: "SoldOut" },
    { value: "Returning" },
    { value: "Returned" },
  ];

  const handleStageChange = (rowIndex, stageIndex, field, value) => {
    const row = rows[rowIndex];
    const newStages = [...(row.value || [])];

    if (stageIndex >= newStages.length) {
      newStages.push({ id: "", value: "" });
    }

    newStages[stageIndex] = {
      ...newStages[stageIndex],
      [field]: value,
    };

    onUpdateRow(row.originalIndex, { value: newStages });
  };

  const handleDelete = (rowIndex, stageIndex) => {
    const row = rows[rowIndex];
    const newStages = [...(row.value || [])];
    newStages.splice(stageIndex, 1);
    onUpdateRow(row.originalIndex, { value: newStages });
  };

  const addNewItem = (rowIndex) => {
    const row = rows[rowIndex];
    const newStages = [...(row.value || []), { id: "", value: "" }];
    onUpdateRow(row.originalIndex, { value: newStages });
  };

  const handleStatusChange = (rowIndex, field, value) => {
    const row = rows[rowIndex];
    onUpdateRow(row.originalIndex, {
      value: {
        ...row.value,
        [field]: value,
      },
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
            <TableCell>Property</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) =>
            row.typeInput === "pipeline_stage" ? (
              <React.Fragment key={rowIndex}>
                {(row.value || []).length === 0 ? (
                  <TableRow>
                    <TableCell>{row.name}</TableCell>
                    <TableCell colSpan={3} align="center">
                      No stages. Click "Add Stage" to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  (Array.isArray(row.value) ? row.value : []).map(
                    (stage, stageIndex) => (
                      <TableRow key={`${rowIndex}-${stageIndex}`}>
                        {stageIndex === 0 && (
                          <TableCell
                            rowSpan={
                              (Array.isArray(row.value)
                                ? row.value.length
                                : 0) + 1 || 1
                            }
                          >
                            {row.name}
                          </TableCell>
                        )}
                        <TableCell>
                          <CustomTextField
                            value={stage.id}
                            onBlur={(newVal) =>
                              handleStageChange(rowIndex, stageIndex, "id", newVal)
                            }
                            placeholder="Input ID"
                          />
                        </TableCell>
                        <TableCell>
                          <CustomSelection
                            value={stage.value}
                            option={nhanhStatus.map((option) => option.value)}
                            onChange={(_, value) =>
                              handleStageChange(
                                rowIndex,
                                stageIndex,
                                "value",
                                value
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(rowIndex, stageIndex)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => addNewItem(rowIndex)}
                    >
                      Add Stage
                    </Button>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ) : row.typeInput === "status" ? (
              <React.Fragment key={rowIndex}>
                {(row.value || []).map((status, statusIndex) => (
                  <TableRow key={`${rowIndex}-${statusIndex}`}>
                    {statusIndex === 0 && (
                      <TableCell rowSpan={(row.value || []).length || 1}>
                        {row.name}
                      </TableCell>
                    )}
                    <TableCell>{status.status}</TableCell>
                    <TableCell colSpan={2}>
                      <CustomSelection
                        value={status.value}
                        option={nhanhStatus.map((option) => option.value)}
                        onChange={(_, newValue) =>
                          handleStageChange(
                            rowIndex,
                            statusIndex,
                            "value",
                            newValue
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ) : (
              <TableRow key={rowIndex}>
                <TableCell>{row.name}</TableCell>
                <TableCell colSpan={3}>
                  <CustomSelection
                    value={row.value}
                    option={nhanhStatus.map((option) => option.value)}
                    onChange={(_, newValue) =>
                      onUpdateRow(row.originalIndex, { value: newValue })
                    }
                  />
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SpecialTable;
