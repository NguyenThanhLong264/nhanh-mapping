import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ConfirmationForm from "../Form/comfirmationForm";

const CleanButton = ({ text = "Refresh", storageName, value }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    if (storageName && value !== undefined) {
      localStorage.setItem(storageName, JSON.stringify(value));
      window.location.reload();
    }
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        startIcon={<RefreshIcon />}
        onClick={() => setShowConfirm(true)}
        sx={{
          position: "fixed",
          top: 60,
          right: 20,
          zIndex: 1000,
          maxWidth: 150,
        }}
      >
        {text}
      </Button>
      <ConfirmationForm
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        question={`Are you sure you want to reset to ${text}?`}
      />
    </>
  );
};

export default CleanButton;
