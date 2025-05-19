import {
  Table as MuiTable,
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

export default function NormalTable({
  rows,
  onUpdateRow,
  title,
  customWebhookFields,
}) {
  const fieldsToUse = customWebhookFields || webhookFields;

  return (
    <Paper sx={{ mb: 4, borderRadius: 2, overflow: "hidden" }}>
      <Typography
        variant="h6"
        sx={{ p: 2, bgcolor: "#3D55CC", color: "white" }}
      >
        {title}
      </Typography>
      <MuiTable>
        <TableHead>
          <TableRow>
            <TableCell>Property</TableCell>
            <TableCell align="center">Input Type</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell>{row.name}</TableCell>
              <TableCell align="center">
                <CustomizeSwitch
                  checked={row.typeInput === "map"}
                  onChange={(e) =>
                    onUpdateRow(row.originalIndex, {
                      typeInput: e.target.checked ? "map" : "normal",
                      value: "",
                    })
                  }
                  label={"Mapping"}
                />
              </TableCell>
              <TableCell>
                {row.typeInput === "normal" ? (
                  <CustomTextField
                    placeholder="--Please type--"
                    value={row.value}
                    onBlur={(newVal) =>
                      onUpdateRow(row.originalIndex, { value: newVal })
                    }
                    multiline={
                      row.name === "comment" || row.name === "comment.body"
                    }
                    minRows={1}
                  />
                ) : (
                  <CustomSelection
                    value={row.value}
                    onChange={(_, newValue) =>
                      onUpdateRow(row.originalIndex, { value: newValue })
                    }
                    option={fieldsToUse.map((item) => item.name)}
                  />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </MuiTable>
    </Paper>
  );
}

const webhookFields = [
  { name: 'orderId' },
  { name: 'shopOrderId' },
  { name: 'saleChannel' },
  { name: 'type' },
  { name: 'typeId' },
  { name: 'moneyDiscount' },
  { name: 'moneyDeposit' },
  { name: 'moneyTransfer' },
  { name: 'creditAmount' },
  { name: 'usedPoints' },
  { name: 'moneyUsedPoints' },
  { name: 'shipFee' },
  { name: 'codFee' },
  { name: 'customerShipFee' },
  { name: 'calcTotalMoney' },
  { name: 'description' },
  { name: 'customerId' },
  { name: 'customerName' },
  { name: 'customerEmail' },
  { name: 'customerMobile' },
  { name: 'customerAddress' },
  { name: 'shipToCityLocationId' },
  { name: 'shipToDistrictLocationId' },
  { name: 'shipToWardLocationId' },
  { name: 'customerCity' },
  { name: 'customerDistrict' },
  { name: 'customerWard' },
  { name: 'createdById' },
  { name: 'couponCode' },
  { name: 'status' },
  { name: 'statusDescription' },
  { name: 'depotId' },
  { name: 'trackingUrl' },
  { name: 'createdDateTime' },
  { name: 'reason' },
  { name: 'deliveryDate' },
  {
    name: 'products',
    type: 'array',
    subFields: [
      { name: 'id', type: 'string' },
      { name: 'quantity', type: 'int' },
      { name: 'price', type: 'float' },
      { name: 'discount', type: 'float' },
      { name: 'weight', type: 'float' },
    ],
  },
];
