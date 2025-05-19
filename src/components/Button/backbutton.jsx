import React from "react";
import { useRouter } from "next/navigation";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const BackButton = () => {
  const router = useRouter();

  return (
    <IconButton
      onClick={() => router.back()}
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        zIndex: 1000,
      }}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

export default BackButton;
