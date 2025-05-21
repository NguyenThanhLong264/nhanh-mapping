"use client";
import { useState, useEffect } from "react";
import NormalTable from "@/components/Table/Table";
import SpecialTable from "@/components/Table/specialTable";
import ProductTable from "@/components/Table/productTable";
import CustomFieldsTable from "@/components/Table/customFieldTable";
import { Box, Button } from "@mui/material";
import defaultConfig from "@/app/data/defaultConfig.json";
import BackButton from "@/components/Button/backbutton";
import CleanButton from "@/components/Button/cleanbutton";
import GuideButton from "@/components/Button/guidebutton";
import { GUIDE_TEXT } from "@/app/constants/guideText";
import { webhookFields } from "@/app/constants/nhanhWebhookFields"
import SaveButton from "@/components/Button/savebutton";

export default function GGsheetMapPage() {
    const [rowsConfig, setRowsConfig] = useState([]);
    const [optionField, setOptionFields] = useState(webhookFields);

    const saveConfig = async (configArray) => {
        try {
            const response = await fetch("/api/config/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(configArray),
            });

            if (!response.ok) {
                throw new Error("Failed to save config to server");
            }

            const result = await response.json();
            console.log("Server response:", result);
            return true;
        } catch (error) {
            console.error("Error saving config to server:", error);
            return false;
        }
    };

    const fetchConfig = async () => {
        try {
            const res = await fetch('/api/config/load?name=config');
            const data = await res.json();
            if (!res.ok) throw new Error(`Error: ${data.error}`);
            console.log("Loaded config UI:", data);
            setRowsConfig(data);
        } catch (err) {
            console.error('Failed to load config:', err);
        }
    };
    // Load config từ localStorage hoặc defaultConfig
    useEffect(() => {
        const loadConfig = () => {
            try {
                fetchConfig()
            } catch (error) {
                console.error("Error loading config:", error);
                setRowsConfig(defaultConfig);
            }
        };
        loadConfig();
    }, []);

    // Phân loại các loại row
    const normalRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "normal" || row.typeInput === "map");

    const specialRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter(
            (row) => row.typeInput === "pipeline_stage" || row.typeInput === "status"
        );

    const productRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "product");

    const customRows = rowsConfig
        .map((row, index) => ({ ...row, originalIndex: index }))
        .filter((row) => row.typeInput === "custom");

    // Cập nhật row
    const handleUpdateRow = (originalIndex, updatedRow) => {
        setRowsConfig((prev) => {
            const newRows = [...prev];
            newRows[originalIndex] = { ...newRows[originalIndex], ...updatedRow };
            return newRows;
        });
    };

    // Lưu config vào localStorage
    const handleSave = async () => {
        try {
            // localStorage.setItem("config", JSON.stringify(rowsConfig));
            const success = await saveConfig(rowsConfig);
            if (success) {
                alert("Configuration saved to localStorage and server successfully!");
            } else {
                alert("Saved to localStorage, but failed to save to server.");
            }
        } catch (error) {
            console.error("Error saving config:", error);
            alert("Failed to save configuration");
        }
    };

    return (
        <Box sx={{ width: "100%", bgcolor: "#F5F6FA" }}>
            <BackButton />
            <CleanButton text="Default config" storageName={"config"} value={defaultConfig} />
            <SaveButton onClick={handleSave} />
            <GuideButton tooltipText={GUIDE_TEXT} />

            <Box sx={{ p: 3, maxWidth: "1200px", mx: "auto", bgcolor: "#F5F6FA" }}>
                <NormalTable
                    title="Normal Fields"
                    rows={normalRows}
                    onUpdateRow={handleUpdateRow}
                    customWebhookFields={optionField}
                />

                <SpecialTable
                    title="Special Fields"
                    rows={specialRows}
                    onUpdateRow={handleUpdateRow}
                />

                <ProductTable
                    title="Order Product Fields"
                    rows={productRows}
                    onUpdateRow={handleUpdateRow}
                    nhanhProductFields={optionField.find(f => f.name === 'products')?.subFields || []}
                />

                <CustomFieldsTable
                    title="Custom Fields"
                    rows={customRows}
                    onUpdateRow={handleUpdateRow}
                />
            </Box>
        </Box>
    );
}


