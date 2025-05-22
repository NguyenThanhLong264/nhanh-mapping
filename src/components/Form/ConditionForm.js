import React from 'react'
import { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material'
import conditions from '@/app/data/condition.json'
import { useRouter } from 'next/navigation'

const ConditionForm = () => {
    const router = useRouter()
    const [editMode, setEditMode] = useState(false);
    const [values, setValues] = useState({});
    const [tempValues, setTempValues] = useState({});

    // // Load initial data from the JSON file
    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch('/api/conditions/get?name=apiKey');
                const data = await res.json();
                if (!res.ok) {
                    console.warn('Config not found:', data.error);
                    return;
                }
                setValues(data);
            } catch (err) {
                console.error('Error fetching config:', err);
            }
        }
        fetchConfig();
    }, []);


    const handleEdit = () => {
        setTempValues({ ...values });
        setEditMode(true);
    };

    const handleCancel = () => {
        setEditMode(false);
        setTempValues({ left: '', right: '' });
    };

    const handleSave = async () => {
        setValues(tempValues);
        setEditMode(false);
        try {
            const res = await fetch('/api/conditions/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tempValues)
            });
            if (!res.ok) {
                const err = await res.json();
                alert(`Saving failed: ${err.error || 'Unknown error'}`);
                return;
            }
            alert("Saving Successful");
        } catch (error) { alert(`Saving failed: ${error.message}`); }
    };


    const leftFields = Object.entries(values).filter(([key]) => key.startsWith('NhanhVN'));
    const rightFields = Object.entries(values).filter(([key]) => key.startsWith('CareSoft'));
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: '500px', backgroundColor: '#F5F6FA', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <Box sx={{
                height: '50px', bgcolor: '#3D55CC', borderRadius: '8px 8px 0 0', p: '8px', alignItems: 'center', display: 'flex',        // ✨ added
                alignItems: 'center', color: '#D9E1FC', px: '12px'
            }}>Các Token cần thiết
            </Box>
            <Box sx={{ display: 'flex', p: '12px', gap: '12px', minHeight: '395px' }}>
                {/* Left Column */}
                <Box sx={{ flex: 1 }}>
                    {leftFields.map(([key]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{key}</Typography>
                            <input
                                type="text"
                                value={editMode ? tempValues[key] || '' : values[key] || ''}
                                onChange={e => setTempValues({ ...tempValues, [key]: e.target.value })}
                                disabled={!editMode}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </Box>
                    ))}
                </Box>

                {/* Right Column */}
                <Box sx={{ flex: 1 }}>
                    {rightFields.map(([key]) => (
                        <Box key={key} sx={{ mb: 2 }}>
                            <Typography variant="body2" sx={{ mb: 0.5 }}>{key}</Typography>
                            <input
                                type="text"
                                value={editMode ? tempValues[key] || '' : values[key] || ''}
                                onChange={e => setTempValues({ ...tempValues, [key]: e.target.value })}
                                disabled={!editMode}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: '8px', gap: '8px' }}>
                {!editMode ? (
                    <>
                        <Button variant="contained" onClick={() => router.push('/config')}>Go Mapping</Button>
                        <Button variant="contained" onClick={handleEdit}>Edit</Button>
                    </>
                ) : (
                    <>
                        <Button
                            variant="contained"
                            color='success'
                            onClick={handleSave}>Save</Button>
                        <Button
                            variant="contained"
                            color='error'
                            onClick={handleCancel}>Cancel</Button>
                    </>
                )}
            </Box>
        </Box>
    )
}

export default ConditionForm