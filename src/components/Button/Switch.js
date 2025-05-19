import React from 'react'
import { Switch, FormControlLabel, styled, Box } from '@mui/material'

const CustomizeSwitch = ({ checked, onChange, label }) => {
    const defaultLabel = checked ? 'Tùy chỉnh' : 'Nhanh.vn';
    return (
        <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, width: 'auto', gap: 12, borderRadius: '12px', padding: '8px', transition: 'background-color 0.3s, box-shadow 0.3s', // Smooth transition for hover effect
            '&:hover': {
                backgroundColor: '#979AA80D', // Change background on hover
            },
        }}>
            <FormControlLabel
                control={
                    <CustomSwitchLayout
                        checked={checked}
                        onChange={onChange}
                    />
                }
                label={label ?? defaultLabel}
                sx={{ m: 0, '& .MuiTypography-root': { ml: '8px' } }}
            />
        </Box>
    )
}

export default CustomizeSwitch

const CustomSwitchLayout = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: '36px',
    height: '20px',
    padding: 0,
    margin: 0,
    '& .MuiSwitch-switchBase': {
        padding: 0,
        margin: '2px',
        transitionDuration: '250ms',
        '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                backgroundColor: '#3D55CC',
                opacity: 1,
                border: 0,
                ...(theme.palette.mode === 'dark' && {
                    backgroundColor: '#2ECA45',
                }),
            },
            '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
            },
        },
        '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
        },
        '&.Mui-disabled .MuiSwitch-thumb': {
            color: '#DADCE5',
            ...(theme.palette.mode === 'dark' && {
                color: theme.palette.grey[600],
            }),
        },
        '&.Mui-disabled + .MuiSwitch-track': {
            opacity: 0.7,
            ...(theme.palette.mode === 'dark' && {
                opacity: 0.3,
            }),
        },
    },
    '& .MuiSwitch-thumb': {
        boxSizing: 'border-box',
        width: 16,
        height: 16,
    },
    '& .MuiSwitch-track': {
        borderRadius: 26 / 2,
        backgroundColor: '#DADCE5',
        opacity: 1,
        transition: theme.transitions.create(['background-color'], {
            duration: 500,
        }),
        ...(theme.palette.mode === 'dark' && {
            backgroundColor: '#39393D',
        }),
    },
}));