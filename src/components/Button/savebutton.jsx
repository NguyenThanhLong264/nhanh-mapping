import React from "react";
import { Button } from "@mui/material";

const SaveButton = ({ onClick }) => {
  return (
    <Button
      variant="contained"
      color="primary"
      onClick={onClick}
      sx={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 1000,
        width: 150,
      }}
    >
      Save Config
    </Button>
  );
};

export default SaveButton;
