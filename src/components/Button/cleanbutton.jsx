import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ConfirmationForm from "../Form/comfirmationForm";

const CleanButton = ({ text = "Refresh", storageName, value }) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = async () => {
    if (storageName && value !== undefined) {
      try {
        const response = await fetch("/api/config/save", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          throw new Error("Failed to save config");
        }

        const result = await response.json();
        console.log("Save result:", result);
        window.location.reload();
      } catch (error) {
        console.error("Save error:", error);
        alert("Failed to save configuration");
      }
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
