import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { validateFunnelRequiredStages } from '../utils/funnelCalculations';
import { fetchUserModel, updateUserModel, addSavedModel, updateSavedModel, fetchUserFormState, saveUserFormState, clearUserFormState } from '../utils/firebaseHelpers';
import { getPSTDateTime } from '../utils/dateTimeHelpers';
import BetaNotice from './BetaNotice';

const buildInitialFormData = () => ({
    MDD: null,
    TRD_P: null,
    TRD: 0,
    manic_P: FORM_DEFAULTS.manic_P,
    suicide_P: FORM_DEFAULTS.suicide_P,
    diabetes_P: FORM_DEFAULTS.diabetes_P,
    stroke_P: FORM_DEFAULTS.stroke_P,
    heart_attack_P: FORM_DEFAULTS.heart_attack_P,
    blood_pressure_P: FORM_DEFAULTS.blood_pressure_P,
    epilepsy_P: FORM_DEFAULTS.epilepsy_P,
    personality_P: FORM_DEFAULTS.personality_P,
    hepatic_P: FORM_DEFAULTS.hepatic_P,
    psycological_P: FORM_DEFAULTS.psycological_P,
    health_P: FORM_DEFAULTS.health_P,
    comorbid_hepatic_P: FORM_DEFAULTS.comorbid_hepatic_P,
    modelTitle: "",
    geographicArea: "",
    motivation: "",
    additionalComments: "",
});

const InputsForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [model, setModel] = useState([]);
    const [user] = useAuthState(auth);
    const [doubleCountingOpen, setDoubleCountingOpen] = useState(false);
    const [disclaimerOpen, setDisclaimerOpen] = useState(false);
    const [disclaimerChecked, setDisclaimerChecked] = useState(false);
    const [formDataTemp, setFormDataTemp] = useState(null);
    const [formData, setFormData] = useState(buildInitialFormData);

    const [results, setResults] = useState(null);
    const [modelCreatedOn, setModelCreatedOn] = useState(null);
    const [savingModel, setSavingModel] = useState(false);
    const [funnelState, setFunnelState] = useState(null);
    const [funnelDerived, setFunnelDerived] = useState(null);
    const [restoredFunnelState, setRestoredFunnelState] = useState(null);
    const [editingModelId, setEditingModelId] = useState(null);

    const handleFunnelStateChange = useCallback((nextFunnelState, derived) => {
        setFunnelState(nextFunnelState);
        setFunnelDerived(derived);
    }, []);

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
                // Skip: an "Edit" navigation from History is hydrating the form
                // from a specific saved model instead (see the effect below).
                if (location.state?.editModel) return;

                const { currentForm, currentResults, currentModelCreatedOn, currentFunnelState, currentEditingModelId } = await fetchUserFormState(user.uid);
                // Only set formData if currentForm exists (saved state), otherwise use initial state with defaults
                if (currentForm) {
                    setFormData(currentForm);
                }
                if (currentResults) {
                    setResults(currentResults);
                }
                if (currentModelCreatedOn) {
                    setModelCreatedOn(currentModelCreatedOn);
                }
                if (currentFunnelState) {
                    setRestoredFunnelState(currentFunnelState);
                }
                if (currentEditingModelId) {
                    setEditingModelId(currentEditingModelId);
                }
            };
            loadModel();
            loadFormState();
        }
        // location.state is intentionally excluded: this effect must only run
        // once per mount/user-change, not each time navigate('.', {state:{}})
        // below clears the edit-navigation state (which would otherwise
        // re-trigger loadFormState and clobber the just-hydrated edit values).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Hydrate the form from a saved model when arriving via History's "Edit" button
    useEffect(() => {
        const editModel = location.state?.editModel;
        if (!editModel) return;

        setFormData(editModel.inputs || buildInitialFormData());
        setResults(editModel.outputs || null);
        setModelCreatedOn(editModel.modelCreatedOn || editModel.calculatedAt || null);
        setRestoredFunnelState(editModel.funnel || null);
        setEditingModelId(editModel.id);

        // Clear the navigation state so refreshing this page doesn't re-trigger it
        navigate('.', { replace: true, state: {} });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state]);

    // Persist form and results on edits (debounced)
    const saveTimerRef = useRef(null);
    useEffect(() => {
        if (!user?.uid) return;
        if (!formData) return;

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(() => {
            saveUserFormState(user.uid, formData, results ?? null, modelCreatedOn ?? null, funnelState ?? null, editingModelId ?? null);
        }, 800);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [user?.uid, formData, results, modelCreatedOn, funnelState, editingModelId]);

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
        const calculationDateTime = getPSTDateTime();
        setResults(calculatedResults);
        setModelCreatedOn(calculationDateTime);
        setModel(formatResultsForModel(calculatedResults));
        if (user?.uid) {
            saveUserFormState(user.uid, formDataTemp, calculatedResults, calculationDateTime, funnelState ?? null, editingModelId ?? null);
        }
        handleDisclaimerClose();
        scrollToBottom();
    };

    const handleDownload = async () => {
        const funnelValidation = validateFunnelRequiredStages(funnelState);
        if (!funnelValidation.isValid) {
            alert(funnelValidation.message);
            return;
        }

        const blob = await pdf(
            <MyDocument
                formData={formData}
                results={results}
                modelCreatedOn={modelCreatedOn}
                funnelState={funnelState}
            />
        ).toBlob();
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

    const buildSavePayload = () => ({
        title: formData.modelTitle || 'Untitled model',
        geographicArea: formData.geographicArea || '',
        motivation: formData.motivation || '',
        inputs: formData,
        outputs: { ...results },
        modelCreatedOn: modelCreatedOn || null,
        funnel: funnelState ? { ...funnelState, effectiveDemand: funnelDerived?.displayedEffectiveDemand ?? null } : null,
    });

    const handleSaveModel = async () => {
        if (!user?.uid) {
            alert('Please log in to save models.');
            return;
        }
        if (!results) {
            alert('Please run the model before saving.');
            return;
        }
        const funnelValidation = validateFunnelRequiredStages(funnelState);
        if (!funnelValidation.isValid) {
            alert(funnelValidation.message);
            return;
        }

        setSavingModel(true);
        const response = await addSavedModel(user.uid, buildSavePayload());
        setSavingModel(false);

        if (!response.success) {
            alert(response.message || 'Could not save model.');
            return;
        }

        // This is now a distinct new saved entry, not the one (if any) we were editing.
        setEditingModelId(null);
        alert('Model saved to your history.');
    };

    const handleUpdateModel = async () => {
        if (!user?.uid || !editingModelId) return;
        if (!results) {
            alert('Please run the model before saving.');
            return;
        }
        const funnelValidation = validateFunnelRequiredStages(funnelState);
        if (!funnelValidation.isValid) {
            alert(funnelValidation.message);
            return;
        }
        if (!window.confirm(`This will overwrite the saved model "${formData.modelTitle || 'Untitled model'}" with the current values. Continue?`)) {
            return;
        }

        setSavingModel(true);
        const response = await updateSavedModel(user.uid, editingModelId, buildSavePayload());
        setSavingModel(false);

        if (!response.success) {
            alert(response.message || 'Could not update model.');
            return;
        }

        alert('Model updated.');
    };

    const handleReset = () => {
        if (!window.confirm('Reset the form? This clears your current working draft and cannot be undone.')) {
            return;
        }

        setFormData(buildInitialFormData());
        setResults(null);
        setModelCreatedOn(null);
        setEditingModelId(null);
        setRestoredFunnelState(null);
        setFunnelState(null);
        setFunnelDerived(null);
        setModel([]);

        if (user?.uid) {
            clearUserFormState(user.uid);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <BetaNotice />
            <Paper elevation={0} sx={{ mb: 3, mt: 2, p: 2.5, backgroundColor: 'white', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ color: '#023e74', lineHeight: 1.7, fontSize: '1.15rem' }}>
                    To generate a demand estimate for psilocybin-assisted therapy in your geographic area, you will need to provide 11 numerical input values and context about your model.
                    Running the model will take as little as five minutes if you are comfortable with default values for population characteristics,
                    or if you have prepared input values previously.
                </Typography>
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: -2.5, mb: 0.5, gap: 2 }}>
                <Button
                    onClick={() => navigate('/history')}
                    sx={{
                        color: 'white',
                        textDecoration: 'underline',
                        textTransform: 'none',
                        fontSize: '1.35rem',
                        '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    See Your Model History
                </Button>
                <Button
                    onClick={handleReset}
                    sx={{
                        color: 'white',
                        textDecoration: 'underline',
                        textTransform: 'none',
                        fontSize: '1.35rem',
                        '&:hover': {
                            textDecoration: 'underline',
                            backgroundColor: 'transparent',
                        },
                    }}
                >
                    Reset
                </Button>
            </Box>
            {editingModelId && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'white', fontStyle: 'italic' }}>
                        Editing a saved model — updates will overwrite it, or use "Save as New" to create a copy.
                    </Typography>
                </Box>
            )}
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
                            Tell us about your scenario for using this model
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
                                    label="Scenario"
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
                            <Typography variant="h5">Prevalence of Depression in Your Population</Typography>
                            <InfoButton
                                dialogTitle={INFO_DIALOGS.prevalence.title}
                                dialogContent={INFO_DIALOGS.prevalence.content}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Enter the number of people with Major Depressive Disorder (MDD) in the population of interest and the % with Treatment-Resistant Depression (TRD)
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
                            <Typography variant="h5">Exclusion Criteria in Your Population</Typography>
                            <InfoButton
                                dialogTitle={INFO_DIALOGS.exclusionCriteria.title}
                                dialogContent={INFO_DIALOGS.exclusionCriteria.content}
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: .5 }}>
                            Enter the % of people with Major Depressive Disorder (MDD) in the population you are analyzing who have the listed conditions.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            The default values provided below are for the US as a whole, if you have better estimates for your population you can override them.
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
                        Refine the adjustment for double counting (Optional)
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
                onDownload={handleDownload}
                onSave={handleSaveModel}
                saving={savingModel}
                modelCreatedOn={modelCreatedOn}
                onFunnelStateChange={handleFunnelStateChange}
                initialFunnelState={restoredFunnelState}
                editingModelId={editingModelId}
                onUpdate={handleUpdateModel}
                funnelReady={validateFunnelRequiredStages(funnelState).isValid}
            />
        </Container >
    );
};

export default InputsForm;