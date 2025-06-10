import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

const NavigateButton = ({ text, href, variant = "contained", color = "primary", sx = {} }) => {
    const router = useRouter();
    return (
        <Button
            variant={variant}
            color={color}
            onClick={() => router.push(href)}
            sx={sx}
        >
            {text}
        </Button>
    );
};

export default NavigateButton;
