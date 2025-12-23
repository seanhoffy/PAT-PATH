import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NumericFormat } from 'react-number-format';
import {
    Container,
    Paper,
    Typography,
    Grid,
    TextField,
    Button,
    Box,
    InputAdornment,
} from '@mui/material';
import { auth } from "../firebase";
import { useAuthState } from 'react-firebase-hooks/auth';
// import SourceInputList from './sources';
import Spacer from './common/Spacer';
import InfoButton from './common/InfoButton';
import DisclaimerDialog from './dialogs/DisclaimerDialog';
import DoubleCountingDialog from './dialogs/DoubleCountingDialog';
import ResultsDisplay from './results/ResultsDisplay';
import MyDocument from './pdf/pdf.js';
import { pdf } from '@react-pdf/renderer';
import EditIcon from "@mui/icons-material/Edit";
import { FORM_DEFAULTS } from '../constants/formDefaults';
import { EXCLUSION_CRITERIA_FIELDS } from '../constants/formFields';
import { INFO_DIALOGS } from '../constants/infoDialogs';
import { COLORS } from '../constants/colors';
import { CALCULATION_CONSTANTS } from '../constants/calculations';
import { calculateAllResults, formatResultsForModel, scrollToBottom } from '../utils/calculations';
import { isStringField, validateFormData } from '../utils/formValidation';
import { fetchUserModel, updateUserModel, addSavedModel, fetchUserFormState, saveUserFormState } from '../utils/firebaseHelpers';
import BetaNotice from './BetaNotice';

const InputsForm = () => {
    const navigate = useNavigate();
    const [model, setModel] = useState([]);
    const [user] = useAuthState(auth);
    const [doubleCountingOpen, setDoubleCountingOpen] = useState(false);
    const [disclaimerOpen, setDisclaimerOpen] = useState(false);
    const [disclaimerChecked, setDisclaimerChecked] = useState(false);
    const [formDataTemp, setFormDataTemp] = useState(null);
    const [formData, setFormData] = useState({
        MDD: null,
        TRD_P: null,
        TRD: 0,
        manic_P: null,
        suicide_P: null,
        diabetes_P: null,
        stroke_P: null,
        heart_attack_P: null,
        blood_pressure_P: null,
        epilepsy_P: null,
        personality_P: null,
        hepatic_P: null,
        psycological_P: FORM_DEFAULTS.psycological_P,
        health_P: FORM_DEFAULTS.health_P,
        comorbid_hepatic_P: FORM_DEFAULTS.comorbid_hepatic_P,
        modelTitle: "",
        geographicArea: "",
        motivation: "",
        additionalComments: "",
    });

    const [results, setResults] = useState(null);
    const [actualPercents, setActualPercents] = useState({
        trialMDD: 100,
        realMDD: 100,
        trialTRD: 100,
        realTRD: 100,
    });
    const [savingModel, setSavingModel] = useState(false);

    // Fetch user model on mount
    useEffect(() => {
        if (user?.uid) {
            const loadModel = async () => {
                const userModel = await fetchUserModel(user.uid);
                if (userModel) {
                    setModel(userModel);
                }
            };
            const loadFormState = async () => {
                const { currentForm, currentResults, currentActualPercents } = await fetchUserFormState(user.uid);
                if (currentForm) {
                    setFormData(currentForm);
                }
                if (currentResults) {
                    setResults(currentResults);
                }
                if (currentActualPercents) {
                    setActualPercents(currentActualPercents);
                }
            };
            loadModel();
            loadFormState();
        }
    }, [user]);

    // Persist form and results on edits (debounced)
    const saveTimerRef = useRef(null);
    useEffect(() => {
        if (!user?.uid) return;
        if (!formData) return;

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(() => {
            saveUserFormState(user.uid, formData, results ?? null, actualPercents ?? null);
        }, 800);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [user?.uid, formData, results, actualPercents]);

    // Update model in Firestore when it changes
    const updateModelInFirestore = useCallback(async () => {
        if (user?.uid && model.length > 0) {
            await updateUserModel(user.uid, model);
        }
    }, [user, model]);

    useEffect(() => {
        updateModelInFirestore();
    }, [updateModelInFirestore]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let newValue;

            // Check if the input is a number or string
            if (isStringField(name)) {
                newValue = value;
            } else {
                // For required numerical fields, empty string becomes null
                // Allow 0 as a valid value
                if (value === '' || value === null || value === undefined) {
                    newValue = null;
                } else {
                    newValue = parseFloat(value);
                }
            }

            const newData = { ...prev, [name]: newValue };

            // Auto-calculate TRD when MDD or TRD_P changes
            if (name === 'MDD' || name === 'TRD_P') {
                // Only calculate if both MDD and TRD_P are not null
                if (newData.MDD !== null && newData.TRD_P !== null) {
                    newData.TRD = newData.MDD * (newData.TRD_P / CALCULATION_CONSTANTS.PERCENTAGE_DIVISOR);
                } else {
                    newData.TRD = 0;
                }
            }

            return newData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validation = validateFormData(formData);
        if (!validation.isValid) {
            alert(validation.message);
            return;
        }

        // Store form data temporarily and open disclaimer
        setFormDataTemp(formData);
        setDisclaimerOpen(true);
    };

    const handleDisclaimerClose = () => {
        setDisclaimerOpen(false);
        setDisclaimerChecked(false);
    };

    const handleFinalSubmit = () => {
        if (!disclaimerChecked) {
            return;
        }

        const calculatedResults = calculateAllResults(formDataTemp);
        setResults(calculatedResults);
        setModel(formatResultsForModel(calculatedResults));
        if (user?.uid) {
            saveUserFormState(user.uid, formDataTemp, calculatedResults, actualPercents ?? null);
        }
        handleDisclaimerClose();
        scrollToBottom();
    };

    const handleDownload = async (actualSummary) => {
        const blob = await pdf(<MyDocument formData={formData} results={results} actual={actualSummary} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        // Create filename from model title and area, replace spaces with underscores
        const filename = `${formData.modelTitle.replace(/\s+/g, '_')}.${formData.geographicArea.replace(/\s+/g, '_')}.pdf`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleSaveModel = async (actualSummary) => {
        if (!user?.uid) {
            alert('Please log in to save models.');
            return;
        }
        if (!results) {
            alert('Please run the model before saving.');
            return;
        }

        setSavingModel(true);

        const payload = {
            title: formData.modelTitle || 'Untitled model',
            geographicArea: formData.geographicArea || '',
            motivation: formData.motivation || '',
            inputs: formData,
            outputs: {
                ...results,
                actual: actualSummary || null,
            },
        };

        const response = await addSavedModel(user.uid, payload);
        setSavingModel(false);

        if (!response.success) {
            alert(response.message || 'Could not save model.');
            return;
        }

        alert('Model saved to your history.');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <BetaNotice />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: -2.5, mb: 0.5 }}>
                <Button
                    onClick={() => navigate('/history')}
                    sx={{
                        color: 'white',
                        textDecoration: 'underline',
                        textTransform: 'none',
                        fontSize: '1rem',
                        '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    See Past Model History
                </Button>
            </Box>
            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0}>
                            <Typography variant="h5">General Info</Typography>
                            <InfoButton
                                dialogTitle={INFO_DIALOGS.generalInfo.title}
                                dialogContent={INFO_DIALOGS.generalInfo.content}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Tell us about yourself and your motivation for using this model
                        </Typography>
                        <Grid container spacing={3} alignItems="center" sx={{ mb: -2.2 }}>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Model Title"
                                    variant="outlined"
                                    name="modelTitle"
                                    value={formData.modelTitle}
                                    required
                                    onChange={handleInputChange}></TextField>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Geographic Area"
                                    variant="outlined"
                                    name="geographicArea"
                                    value={formData.geographicArea}
                                    required
                                    onChange={handleInputChange}></TextField>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Motivation"
                                    variant="outlined"
                                    name="motivation"
                                    value={formData.motivation}
                                    required
                                    onChange={handleInputChange}></TextField>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    fullWidth
                                    label="Additional Comments"
                                    variant="outlined"
                                    name="additionalComments"
                                    value={formData.additionalComments}
                                    onChange={handleInputChange}></TextField>
                            </Grid>
                        </Grid>
                        <Spacer height={20} />
                        {/* <SourceInputList /> */}
                        {/* <Typography variant='body2' sx={{ textAlign: 'left', mt: 1 }}>
                            *required
                        </Typography> */}
                    </Paper>

                    {/* Prevalence Section */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0}>
                            <Typography variant="h5">Prevalence in Your Geographic Location</Typography>
                            <InfoButton
                                dialogTitle={INFO_DIALOGS.prevalence.title}
                                dialogContent={INFO_DIALOGS.prevalence.content}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter the number of people with Major Depressive Disorder (MDD) in your location and the percentage with Treatment-Resistant Depression (TRD)
                        </Typography>
                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={4}>
                                <NumericFormat
                                    customInput={TextField}
                                    fullWidth
                                    label="Patients with MDD"
                                    name="MDD"
                                    thousandSeparator=","
                                    value={formData.MDD ?? undefined}
                                    required
                                    placeholder="Enter number"
                                    //onChange={handleInputChange}
                                    onValueChange={(values) => {
                                        // Convert empty string to null, otherwise parse as number
                                        const updatedMDD = values.value === '' ? null : parseFloat(values.value);
                                        setFormData((prev) => {
                                            const newData = { ...prev, MDD: updatedMDD };
                                            // Auto-calculate TRD when MDD changes
                                            // Only calculate if both MDD and TRD_P are not null
                                            if (updatedMDD !== null && newData.TRD_P !== null) {
                                                newData.TRD = updatedMDD * (newData.TRD_P / CALCULATION_CONSTANTS.PERCENTAGE_DIVISOR);
                                            } else {
                                                newData.TRD = 0;
                                            }
                                            return newData;
                                        });
                                    }}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="Percentage With TRD"
                                    name="TRD_P"
                                    type="number"
                                    value={formData.TRD_P ?? ''}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter percentage"
                                    variant="outlined"
                                    InputProps={{
                                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <NumericFormat
                                    customInput={TextField}
                                    fullWidth
                                    label="Patients with TRD: 2+ Treatment Failures (Calculated)"
                                    name="TRD"
                                    thousandSeparator=","
                                    value={formData.TRD}
                                    disabled
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Real World Exclusion Criteria */}
                    <Paper elevation={2} sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0}>
                            <Typography variant="h5">Exclusion Criteria in Your Geographic Location</Typography>
                            <InfoButton
                                dialogTitle={INFO_DIALOGS.exclusionCriteria.title}
                                dialogContent={INFO_DIALOGS.exclusionCriteria.content}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter the percentage of Major Depressive Disorder patients that have these listed conditions in your area
                        </Typography>
                        <Grid container spacing={3}>
                            {EXCLUSION_CRITERIA_FIELDS.map(([key, label]) => (
                                <Grid item xs={12} sm={6} md={4} key={key}>
                                    <TextField
                                        fullWidth
                                        label={label}
                                        name={key}
                                        type="number"
                                        required
                                        placeholder="Enter percentage"
                                        InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
                                        value={formData[key] ?? ''}
                                        onChange={handleInputChange}
                                        variant="outlined"
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>

                    <Button
                        sx={{
                            backgroundColor: COLORS.primary,
                            color: "white",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            boxShadow: 2,
                            "&:hover": {
                                backgroundColor: COLORS.primaryHover,
                                transform: "translateY(-2px)",
                                boxShadow: 3
                            },
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: 1
                        }}
                        variant="contained"
                        onClick={() => setDoubleCountingOpen(true)}
                        startIcon={<EditIcon />}
                        size="medium">
                        Adjust for Double Counting (Optional)
                    </Button>

                    <DoubleCountingDialog
                        open={doubleCountingOpen}
                        onClose={() => setDoubleCountingOpen(false)}
                        formData={formData}
                        onInputChange={handleInputChange}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 3,
                            backgroundColor: COLORS.white,
                            color: COLORS.primary,
                            border: `2px solid ${COLORS.primary}`,
                            '&:hover': {
                                backgroundColor: '#f0f4fa',
                                color: COLORS.primary,
                                border: `2px solid ${COLORS.primary}`
                            }
                        }}
                    >
                        Calculate Results
                    </Button>
                </Box>
            </form>

            <DisclaimerDialog
                open={disclaimerOpen}
                onClose={handleDisclaimerClose}
                onProceed={handleFinalSubmit}
                disclaimerChecked={disclaimerChecked}
                onDisclaimerChange={(e) => setDisclaimerChecked(e.target.checked)}
            />

            <ResultsDisplay
                results={results}
                formData={formData}
                actualPercents={actualPercents}
                setActualPercents={setActualPercents}
                onDownload={handleDownload}
                onSave={handleSaveModel}
                saving={savingModel}
            />
        </Container >
    );
};

export default InputsForm;