import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const GuideButton = ({ tooltipText = "Help\ninformation" }) => {
  const formattedTooltip = tooltipText.split("\n").map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));

  return (
    <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}>
      <Tooltip
        title={<span>{formattedTooltip}</span>}
        arrow
        slotProps={{
          tooltip: {
            sx: {
              backgroundColor: "#3D55CC",
              color: "white",
              fontSize: "0.85rem",
              boxShadow: 2,
              "& .MuiTooltip-arrow": {
                color: "#3D55CC",
              },
            },
          },
        }}
      >
        <IconButton color="primary">
          <HelpOutlineIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default GuideButton;
