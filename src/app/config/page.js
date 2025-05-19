'use client';
import { useState, useEffect } from 'react';
import ConfigTable from '../../components/ConfigTable';
import { dealFields, webhookFields } from '../constants/fields';
import Topbar from '../../components/TopBar';
import { Container } from '@mui/material';

export default function ConfigPage() {
    const [mapping, setMapping] = useState({});
    const [inputTypes, setInputTypes] = useState({});
    const [customFieldCount, setCustomFieldCount] = useState(1);
    const [pipelineStageCount, setPipelineStageCount] = useState(1);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/api/save-config', { method: 'GET' });
                if (response.ok) {
                    const { mapping: savedMapping, inputTypes: savedInputTypes } = await response.json();
                    const cleanedMapping = {};
                    const cleanedInputTypes = {};
                    let maxCustomIndex = -1;
                    let maxPipelineStageIndex = -1;

                    for (const [key, value] of Object.entries(savedMapping || {})) {
                        if (key.startsWith('custom_fields.id_')) {
                            const valueKey = key.replace('id_', 'value_');
                            const idValue = value;
                            const valueValue = savedMapping[valueKey] || '';
                            if (idValue || valueValue) {
                                cleanedMapping[key] = idValue;
                                cleanedInputTypes[key] = savedInputTypes[key] || 'custom';
                                cleanedMapping[valueKey] = valueValue;
                                cleanedInputTypes[valueKey] = savedInputTypes[valueKey] || 'custom';
                                const index = parseInt(key.split('_')[2]);
                                if (!isNaN(index)) maxCustomIndex = Math.max(maxCustomIndex, index);
                            }
                        } else if (key.startsWith('pipeline_stage_id.') && key !== 'pipeline_stage_id') {
                            cleanedMapping[key] = value;
                            cleanedInputTypes[key] = savedInputTypes[key] || 'map';
                            const index = parseInt(key.split('.')[1] || '0');
                            if (!isNaN(index)) maxPipelineStageIndex = Math.max(maxPipelineStageIndex, index);
                        } else {
                            cleanedMapping[key] = value;
                            cleanedInputTypes[key] = savedInputTypes[key] || 'map';
                        }
                    }

                    setMapping(cleanedMapping);
                    setInputTypes(cleanedInputTypes);
                    setCustomFieldCount(maxCustomIndex + 1);
                    setPipelineStageCount(maxPipelineStageIndex + 1);
                }
            } catch (error) {
                console.error('Load config error:', error);
            }
        };
        fetchConfig();
    }, []);

    const handleInputTypeChange = (field) => {

        // Toggle the input type (custom <-> map)
        const newInputType = inputTypes[field] === 'custom' ? 'map' : 'custom';

        setInputTypes((prev) => {
            const updatedInputTypes = { ...prev, [field]: newInputType };
            return updatedInputTypes;
        });

        setMapping((prev) => {
            const newMapping = { ...prev };
            // If it's currently custom and we are switching to map, delete the field from mapping
            if (newMapping[field]) {
                delete newMapping[field];
            }
            return newMapping;
        });
    };


    const handleMappingChange = (field, value) => {
        console.log('handleMappingChange', field, value);

        // If it's a pipeline_stage_id field and the value is undefined, delete it
        if (field.startsWith('pipeline_stage_id.') && value === undefined) {
            setMapping((prev) => {
                const updated = { ...prev };
                delete updated[field]; // Remove the specific field
                return updated;
            });
        } else {
            // Default behavior for other fields
            setMapping(prev => {
                if (prev[field] === value) return prev; // no update needed
                return { ...prev, [field]: value };
            });
            // setMapping((prev) => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            const cleanedMapping = {};
            const cleanedInputTypes = {};

            // Combine all possible field names
            const allFields = [...dealFields];

            allFields.forEach((field) => {
                const key = field.name;
                let value = mapping[key] ?? '';
                const inputType = inputTypes[key] ?? 'map'; // default to 'map'

                // Custom handling for deal_label
                if (key === 'deal_label' && typeof value === 'string') {
                    value = value
                        .split(',')
                        .map((v) => parseInt(v.trim()))
                        .filter((v) => !isNaN(v)); // ensure valid numbers
                }

                cleanedMapping[key] = value;
                cleanedInputTypes[key] = inputType;
            });
            // Include custom_fields and pipeline_stage_id variants already in mapping
            Object.keys(mapping).forEach((key) => {
                if (!cleanedMapping.hasOwnProperty(key)) {
                    let value = mapping[key];
                    const inputType = inputTypes[key] ?? 'map';

                    // Custom handling for deal_label here too, just in case
                    if (key === 'deal_label' && typeof value === 'string') {
                        value = value
                            .split(',')
                            .map((v) => parseInt(v.trim()))
                            .filter((v) => !isNaN(v));
                    }

                    cleanedMapping[key] = value;
                    cleanedInputTypes[key] = inputType;
                }
            });

            const config = { mapping: cleanedMapping, inputTypes: cleanedInputTypes };
            console.log('Saved config:', config);

            const response = await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                alert('Cấu hình đã được lưu!');
            } else {
                const error = await response.json();
                alert('Lưu thất bại: ' + error.error);
            }
        } catch (error) {
            console.error('Save config error:', error);
            alert('Đã có lỗi xảy ra!');
        }
    };


    const handleAddCustomField = () => {
        const existingIndices = Object.keys(mapping)
            .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
            .map(key => parseInt(key.match(/^custom_fields\.id_(\d+)$/)[1]));

        const maxIndex = existingIndices.length > 0 ? Math.max(...existingIndices) : 0;
        const nextIndex = maxIndex + 1;

        const newIdKey = `custom_fields.id_${nextIndex}`;
        const newValueKey = `custom_fields.value_${nextIndex}`;
        setMapping((prev) => ({
            ...prev,
            [newIdKey]: '',
            [newValueKey]: '',
        }));
        setInputTypes((prev) => ({
            ...prev,
            [newIdKey]: 'custom',
            [newValueKey]: 'custom',
        }));
        setCustomFieldCount(nextIndex + 1);
    };

    const handleDeleteCustomField = (index) => {
        const idKey = `custom_fields.id_${index}`;
        const valueKey = `custom_fields.value_${index}`;

        setMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[idKey];
            delete newMapping[valueKey];

            const remainingFields = Object.keys(newMapping)
                .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
                .map(key => parseInt(key.match(/^custom_fields\.id_(\d+)$/)[1]))
                .sort((a, b) => a - b);

            const reorderedMapping = {};
            remainingFields.forEach((oldIndex, newIndex) => {
                const oldIdKey = `custom_fields.id_${oldIndex}`;
                const oldValueKey = `custom_fields.value_${oldIndex}`;
                const newIdKey = `custom_fields.id_${newIndex + 1}`;
                const newValueKey = `custom_fields.value_${newIndex + 1}`;
                if (newMapping[oldIdKey] !== undefined) {
                    reorderedMapping[newIdKey] = newMapping[oldIdKey];
                }
                if (newMapping[oldValueKey] !== undefined) {
                    reorderedMapping[newValueKey] = newMapping[oldValueKey];
                }
            });

            Object.keys(newMapping).forEach(key => {
                if (!key.startsWith('custom_fields.')) {
                    reorderedMapping[key] = newMapping[key];
                }
            });

            return reorderedMapping;
        });

        setInputTypes((prev) => {
            const remainingFields = Object.keys(prev)
                .filter(key => key.match(/^custom_fields\.id_(\d+)$/))
                .map(key => parseInt(key.match(/^custom_fields\.id_(\d+)$/)[1]))
                .sort((a, b) => a - b);
            const reorderedInputTypes = {};

            // Reorder the custom fields' input types
            remainingFields.forEach((oldIndex, newIndex) => {
                const oldIdKey = `custom_fields.id_${oldIndex}`;
                const oldValueKey = `custom_fields.value_${oldIndex}`;
                const newIdKey = `custom_fields.id_${newIndex + 1}`;
                const newValueKey = `custom_fields.value_${newIndex + 1}`;
                if (prev[oldIdKey] !== undefined) {
                    reorderedInputTypes[newIdKey] = prev[oldIdKey];
                }
                if (prev[oldValueKey] !== undefined) {
                    reorderedInputTypes[newValueKey] = prev[oldValueKey];
                }
            });

            // Merge the rest of the input types (non-custom fields) back into the reordered custom fields
            Object.keys(prev).forEach(key => {
                if (!key.startsWith('custom_fields.')) {
                    reorderedInputTypes[key] = prev[key];  // Keep non-custom field types intact
                }
            });

            return reorderedInputTypes;
        });

        const remainingCount = Object.keys(mapping)
            .filter(key => key.match(/^custom_fields\.id_(\d+)$/)).length;
        setCustomFieldCount(remainingCount);
    };

    const handleAddPipelineStageMapping = () => {
        const existingKeys = Object.keys(mapping)
            .filter(key => key.startsWith('pipeline_stage_id.'));

        const newKeyBase = 'pipeline_stage_id.New';

        // Find the highest number after "New", e.g. New1, New2, etc.
        const newIndices = existingKeys
            .map(key => {
                const match = key.match(/^pipeline_stage_id\.New(\d*)$/);
                return match ? parseInt(match[1] || '0', 10) : null;
            })
            .filter(index => index !== null);
        const nextIndex = newIndices.length > 0 ? Math.max(...newIndices) + 1 : 1;
        const newKey = `${newKeyBase}${nextIndex}`;
        setMapping(prev => ({
            ...prev,
            [newKey]: ''
        }));
        setInputTypes(prev => ({
            ...prev,
            [newKey]: 'map'
        }));
        setPipelineStageCount(prev => prev + 1);
    };

    const handleDeletePipelineStageMapping = (status) => {
        setMapping((prev) => {
            const newMapping = { ...prev };
            delete newMapping[`pipeline_stage_id.${status}`];
            return newMapping;
        });

        setInputTypes((prev) => {
            const newInputTypes = { ...prev };
            delete newInputTypes[`pipeline_stage_id.${status}`];

            return newInputTypes;
        });

        const remainingCount = Object.keys(mapping)
            .filter(key => key.match(/^pipeline_stage_id\.(.+)$/)).length;
        setPipelineStageCount(remainingCount);

    };

    return (
        <>
            <Topbar onSaveConfig={handleSubmit} />
            <Container sx={{ mt: 4 }}>
                <div style={{ padding: '20px' }}>
                    <h1>Cấu Trúc Kết Nối Giữa NhanhVN và CareSoft</h1>
                    <ConfigTable
                        dealFields={dealFields}
                        webhookFields={webhookFields}
                        mapping={mapping}
                        inputTypes={inputTypes}
                        onInputTypeChange={handleInputTypeChange}
                        onMappingChange={handleMappingChange}
                        onDeleteCustomField={handleDeleteCustomField}
                        onAddPipelineStageMapping={handleAddPipelineStageMapping}
                        onDeletePipelineStageMapping={handleDeletePipelineStageMapping}
                        onAddCustomField={handleAddCustomField}
                    />
                </div>
            </Container>
        </>
    );
}