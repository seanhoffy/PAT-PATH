import React from 'react';
import { Box, Container, Paper, Typography, Divider } from '@mui/material';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import NavBar from '../components/NavBar';
import PublicNavBar from '../components/PublicNavBar';
import ThemeProvider from '../components/common/ThemeProvider';
import { COLORS } from '../constants/colors';

const TerminologyPage = () => {
    const [user] = useAuthState(auth);

    return (
        <ThemeProvider>
            <div className="App">
                {user ? <NavBar /> : <PublicNavBar />}
                <Box
                    sx={{
                        backgroundColor: COLORS.primary,
                        minHeight: 'calc(100vh - 80px)',
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Container maxWidth="md">
                        <Paper
                            elevation={3}
                            sx={{
                                p: { xs: 3, md: 4 },
                                borderRadius: 3,
                                backgroundColor: '#ffffff',
                            }}
                        >
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    mb: 2,
                                    textAlign: 'center',
                                    color: COLORS.primary,
                                }}
                            >
                                Terminology Guide
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    mb: 3,
                                    textAlign: 'center',
                                    color: '#555',
                                }}
                            >
                                Key clinical terms used in the PATpath psilocybin-assisted therapy demand model.
                            </Typography>

                            <Divider sx={{ mb: 3 }} />

                            {/* MDD Definition */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{ color: COLORS.primary, mb: 1 }}
                                >
                                    Major Depressive Disorder (MDD)
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.7 }}>
                                    Major Depressive Disorder is a mood disorder characterized by persistent
                                    low mood, loss of interest or pleasure, and associated symptoms such as
                                    changes in sleep, appetite, energy, concentration, or feelings of worthlessness.
                                    In this model, MDD represents the base population of individuals with a
                                    diagnosable depressive episode in your specified geographic area.
                                </Typography>
                            </Box>

                            {/* TRD Definition */}
                            <Box sx={{ mb: 3 }}>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{ color: COLORS.primary, mb: 1 }}
                                >
                                    Treatment-Resistant Depression (TRD)
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.7 }}>
                                    Treatment-Resistant Depression refers to depression that has not responded
                                    adequately to at least two appropriate antidepressant treatments at adequate
                                    dose and duration. In this model, TRD is calculated as a percentage of the
                                    MDD population and represents the subgroup most likely to be considered for
                                    psilocybin-assisted therapy under current evidence and clinical guidelines.
                                </Typography>
                            </Box>

                            {/* Potential Psilocybin Demand */}
                            <Box sx={{ mb: 1 }}>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{ color: COLORS.primary, mb: 1 }}
                                >
                                    Potential Psilocybin Demand
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333', lineHeight: 1.7 }}>
                                    In the context of this model, potential psilocybin demand refers to the
                                    estimated prevalence of individuals who meet theoretical eligibility criteria
                                    for psilocybin-assisted therapy based on clinical and exclusion parameters.
                                    It represents a modeled upper bound on the population who could be considered
                                    for treatment, rather than an observed or predicted number of people who will
                                    actually seek, access, or receive psilocybin-assisted therapy in practice.
                                </Typography>
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default TerminologyPage;


