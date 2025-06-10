"use client";
import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Button,
    TextField,
    Alert,
    CircularProgress,
} from "@mui/material";
import { differenceInDays, parseISO } from "date-fns";
import NavigateButton from "@/components/Button/navigatebutton";

const BillFormPage = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [mode, setMode] = useState("");
    const [nextRunAt, setNextRunAt] = useState("");
    const [remainingMs, setRemainingMs] = useState(null);

    const handleApply = async () => {
        if (!fromDate || !toDate) {
            setError("Vui lòng chọn cả From Date và To Date.");
            return;
        }

        const daysDiff = differenceInDays(parseISO(toDate), parseISO(fromDate));
        if (daysDiff < 0) {
            setError("To Date phải sau hoặc bằng From Date.");
            return;
        }

        if (daysDiff > 10) {
            setError("Khoảng thời gian không được quá 10 ngày.");
            return;
        }
        setError("");

        try {
            const res = await fetch("/api/bill/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode: "override",
                    fromDate,
                    toDate,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Lỗi khi áp dụng");

            alert("Cập nhật thành công!");
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchMode = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/bill/sync");
            const data = await res.json();
            setMode(data.mode || "N/A");
            setNextRunAt(data.nextRunAt || "");
        } catch (err) {
            console.error("Lỗi khi fetch mode:", err);
            setMode("Lỗi");
            setNextRunAt("Không xác định");
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchMode();
    }, []);


    useEffect(() => {
        fetchMode();
    }, []);

    useEffect(() => {
        if (!nextRunAt) return;
        const interval = setInterval(() => {
            const diff = new Date(nextRunAt).getTime() - Date.now();
            setRemainingMs(diff > 0 ? diff : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [nextRunAt]);

    const formatCountdown = (ms) => {
        if (ms === null) return "Đang tải...";
        if (ms <= 0) return "Đang đồng bộ...";
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        return `Còn ${min} phút ${sec} giây`;
    };
    return (
        <Box
            sx={{
                width: "500px",
                backgroundColor: "#F5F6FA",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    height: "50px",
                    bgcolor: "#3D55CC",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    color: "#D9E1FC",
                    fontWeight: 500,
                }}
            >
                <Typography fontWeight={500}>Cấu hình Bill</Typography>
                <Button
                    size="small"
                    variant="outlined"
                    sx={{
                        color: "#D9E1FC",
                        borderColor: "#D9E1FC",
                        "&:hover": {
                            borderColor: "#ffffff",
                            backgroundColor: "rgba(255,255,255,0.1)",
                        },
                    }}
                    onClick={fetchMode}
                >
                    Refresh
                </Button>
            </Box>

            {/* Info */}
            <Box>
                <Typography variant="body2" fontWeight={500}>
                    Next Sync: {nextRunAt ? new Date(nextRunAt).toLocaleString() : 'Đang tải...'}
                </Typography>
                <Typography variant="body1" mb={1}>
                    {formatCountdown(remainingMs)}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={500}>
                        Mode:
                    </Typography>
                    <Typography variant="body1">
                        {loading ? <CircularProgress size={16} /> : mode}
                    </Typography>
                </Box>
            </Box>

            {/* Date Inputs */}
            <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
            </Box>

            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button variant="contained" onClick={handleApply}>
                    Apply
                </Button>
                <NavigateButton text={"To bill config"} href={"/bill-config"} />
            </Box>

            {/* Error Message */}
            {error && <Alert severity="error">{error}</Alert>}
        </Box>
    );
};

export default BillFormPage;
