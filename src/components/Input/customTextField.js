import React from 'react'
import { useState, useEffect } from "react";
import TextField from '@mui/material/TextField'

const CustomTextField = ({
    value,
    onChange = () => { },
    onBlur = () => { },
    placeholder = '',
    multiline = false,
    minRows = 3
}) => {
    const [localValue, setLocalValue] = useState(value);

    // Keep local value in sync if prop changes externally
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleBlur = () => {
        if (localValue !== value) {
            onBlur(localValue);
        }
    };

    return (
        <TextField
            fullWidth
            multiline={multiline}
            minRows={multiline ? minRows : undefined}
            hiddenLabel
            variant="outlined"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    p: multiline ? "8.5px 8px 8.5px 16px" : "12px 8px 12px 16px",
                    display: "flex",
                    height: multiline ? "auto" : "40px",
                    alignItems: "center",
                    "& fieldset": {
                        borderColor: "#DADCE5",
                        borderWidth: "1px",
                    },
                    "&:hover fieldset": {
                        borderColor: "#3D55CC",
                        borderWidth: "1.5px",
                    },
                    "&.Mui-focused fieldset": {
                        borderColor: "#3D55CC",
                        borderWidth: "2px",
                    },
                },
                "& .MuiInputBase-input": {
                    p: 0,
                },
            }}
        />
    );
};

export default CustomTextField;
