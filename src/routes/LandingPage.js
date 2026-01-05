import {
    Button,
    Typography,
    Box,
    Grid,
    Paper,
    Dialog,
    DialogContent,
    DialogActions,
} from "@mui/material";
// import {
//     FilterAlt,
//     Download,
//     MenuBook,
//     Calculate,
// } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const LandingPage = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const [devNoticeOpen, setDevNoticeOpen] = useState(false);
    const [intendedPath, setIntendedPath] = useState('');

    useEffect(() => {
        if (loading) return;
        if (user) navigate("/home");
    }, [loading, user, navigate]);

    const handleDevNotice = (path) => {
        setIntendedPath(path);
        setDevNoticeOpen(true);
    };

    const handleDevNoticeClose = () => {
        setDevNoticeOpen(false);
        if (intendedPath) {
            navigate(intendedPath);
        }
    };

    return (
        <Box sx={{ backgroundColor: "#FFFFFF", fontFamily: 'Inter, sans-serif' }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: "url(/heroim.png) center/cover no-repeat",
                    backgroundColor: "#FFFFFF",
                    color: "white",
                    textAlign: "left",
                    px: { xs: 3, md: 12 },
                    pt: { xs: 4, md: 6 },
                    pb: { xs: 4, md: 6 },
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* CEP Logo and Text - Hidden on small screens, shown on medium+ */}
                <Box
                    sx={{
                        position: "absolute",
                        right: { xs: 16, md: 48 },
                        top: "50%",
                        transform: "translateY(-50%)",
                        display: { xs: "none", md: "flex" }, // Hide on mobile, show on medium screens and up
                        flexDirection: "column",
                        alignItems: "center",
                        zIndex: 2,
                        pointerEvents: "none",
                        maxWidth: { md: "260px", lg: "280px", xl: "300px" },
                    }}
                >
                    <Box
                        component="img"
                        src="/cepLogo2.png"
                        alt="CEP Logo"
                        sx={{
                            width: { md: 200, lg: 234, xl: 260 },
                            maxHeight: { md: 200, lg: 234, xl: 260 },
                            height: "auto",
                            opacity: 0.95,
                            mb: 1,
                        }}
                    />
                    <Box
                        sx={{
                            background: "transparent",
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            mt: 0,
                            textAlign: "center",
                            maxWidth: { md: "360px", lg: "380px", xl: "400px" },
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#023e74",
                                fontWeight: "bold",
                                lineHeight: 1.3,
                                fontSize: { md: "0.8rem", lg: "0.85rem", xl: "0.9rem" },
                            }}
                        >
                            University of California, Berkeley.<br />
                            Collaborative for the Economics of Psychedelics.<br />
                            <br />
                            <em>We crunch the numbers that bring psychedelics to life.</em>
                        </Typography>
                    </Box>
                </Box>

                {/* Main Content - Added padding-right to prevent overlap on medium screens */}
                <Box 
                    sx={{ 
                        pt: { xs: 2, md: 2 },
                        pr: { xs: 0, md: "280px", lg: "320px" }, // Add padding when logo is visible
                        maxWidth: { xs: "100%", md: "950px", lg: "950px" }, // Allow a bit more width for the hero text
                    }}
                >
                    <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem", lg: "3rem" },
                        }}
                    >
                        Model the Demand for
                    </Typography>
                    <Typography 
                        variant="h3" 
                        fontWeight="bold" 
                        gutterBottom
                        sx={{
                            fontSize: { xs: "1.75rem", sm: "2.25rem", md: "2.75rem", lg: "3rem" },
                        }}
                    >
                        Psilocybin Treatment for Depression
                    </Typography>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ 
                            mt: { xs: 3, md: 5 }, 
                            color: "#023e74",
                            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                            lineHeight: 1.6,
                            maxWidth: "950px",
                        }}
                    >
                        This platform is provided without charge to facilitate shared progress in psychedelic science.
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ 
                            mt: { xs: 3, md: 5 }, 
                            mb: 4, 
                            color: "#023e74",
                            fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                            lineHeight: 1.6,
                            maxWidth: "850px", // Limit paragraph width to prevent it from stretching too thin
                        }}
                    >
                        What is PATpath? Based on a peer-reviewed model by{' '}
                        <a
                            href="https://www.doi.org/10.61373/pp024r.0025"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#023e74", textDecoration: "underline", fontWeight: 600 }}
                        >
                            Marseille, Rab, Raison
                        </a>
                        , the CEP psilocybin-assisted therapy (PAT) demand model
                        provides estimates of the potential demand for PAT. It identifies eligible
                        individuals among those with major depressive disorder (MDD) and those with 
                        treatment-resistant depression (TRD). It applies validated inclusion and exclusion 
                        criteria from peer-reviewed research to accurately project treatment needs.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: { xs: 3, md: 4 } }}>
                        <Button 
                            variant="contained" 
                            onClick={() => handleDevNotice('/register')} 
                            sx={{ 
                                backgroundColor: "#023e74",
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1, sm: 1.5 },
                            }}
                        >
                            Use the Model
                        </Button>
                    </Box>
                </Box>

                {/* CEP Logo for mobile/tablet - shown below content on smaller screens */}
                <Box
                    sx={{
                        display: { xs: "flex", md: "none" }, // Show on mobile only, hide on medium screens and up
                        flexDirection: "column",
                        alignItems: "center",
                        mt: { xs: 3, sm: 4 },
                        mb: 1,
                    }}
                >
                    <Box
                        component="img"
                        src="/cepLogo2.png"
                        alt="CEP Logo"
                        sx={{
                            width: { xs: 120, sm: 156 },
                            maxHeight: { xs: 120, sm: 156 },
                            height: "auto",
                            opacity: 0.95,
                            mb: 1,
                        }}
                    />
                    <Box
                        sx={{
                            background: "transparent",
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            textAlign: "center",
                            maxWidth: { xs: "340px", sm: "360px" },
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                color: "#023e74",
                                fontWeight: "bold",
                                lineHeight: 1.3,
                                fontSize: { xs: "0.80rem", sm: "0.85rem" },
                            }}
                        >
                            University of California, Berkeley.<br />
                            Collaborative for the Economics of Psychedelics.<br />
                            <br />
                            <em>We crunch the numbers that</em><br />
                            <em>brings psychedelics to life.</em>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Development Notice Dialog */}
            <Dialog
                open={devNoticeOpen}
                onClose={() => setDevNoticeOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Typography variant="h6" gutterBottom sx={{ color: "#023e74", fontWeight: "bold", textAlign: "center" }}>
                        Development Notice
                    </Typography>
                    <Typography sx={{ mb: 2, textAlign: "center" }}>
                        THIS WEB APP IS UNDER DEVELOPMENT AND NOT INTENDED FOR USE OUTSIDE OF TESTING FOR DEVELOPMENT PURPOSES.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
                    <Button 
                        variant="contained" 
                        onClick={handleDevNoticeClose}
                        sx={{ 
                            backgroundColor: "#023e74",
                            '&:hover': {
                                backgroundColor: "#034e91"
                            }
                        }}
                    >
                        I Understand
                    </Button>
                </DialogActions>
            </Dialog>

            {/* What Does Our Model Offer Section */}
            <Box sx={{ px: { xs: 3, md: 12 }, py: { xs: 4, md: 5 }, pb: { xs: 6, md: 8 } }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                    textAlign: 'center',
                    mb: 3,
                    color: '#023e74',
                    fontSize: { xs: "2rem", sm: "2.25rem", md: "2.5rem" }
                }}>
                    What Does PATpath Do?
                </Typography>
                <Paper elevation={0} sx={{ 
                    p: { xs: 2, md: 3 },
                    mb: 3,
                    backgroundColor: '#023e74',
                    borderRadius: 2,
                    textAlign: 'center',
                }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'white', fontSize: { xs: '1.5rem', sm: '1.6rem', md: '1.75rem' } }}>
                        Make evidence-based projections of the potential demand for
                        psilocybin-assisted therapy.
                    </Typography>
                </Paper>
                <Grid container spacing={3}>
                    {/* 1. Customizable Inputs */}
                    <Grid item xs={12} sm={6} md={6}>
                        <Paper elevation={0} sx={{ 
                            p: 1,
                            height: '100%',
                            backgroundColor: '#023e74',
                            borderRadius: 2,
                        }}>
                            {/* <FilterAlt sx={{ color: 'white' }} fontSize="large" /> */}
                            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                Customizable Inputs
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'white', mb: -1.5 }}>
                                Choose population data and inclusion and exclusion criteria.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* 2. PDF Report Generation */}
                    <Grid item xs={12} sm={6} md={6}>
                        <Paper elevation={0} sx={{ 
                            p: 1,
                            height: '100%',
                            backgroundColor: '#023e74',
                            borderRadius: 2,
                        }}>
                            {/* <Download sx={{ color: 'white' }} fontSize="large" /> */}
                            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                PDF Report Generation
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'white', mb: -1.5 }}>
                                Download publication-ready reports for your use case.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* 3. Data Transparency */}
                    <Grid item xs={12} sm={6} md={6}>
                        <Paper elevation={0} sx={{ 
                            p: 1,
                            height: '100%',
                            backgroundColor: '#023e74',
                            borderRadius: 2,
                        }}>
                            {/* <MenuBook sx={{ color: 'white' }} fontSize="large" /> */}
                            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                Data Transparency
                            </Typography>
                            <Typography variant="h6"sx={{ color: 'white', mb: -1.5 }}>
                                Use default data inputs based on peer-reviewed source and authoritative population estimates.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* 4. Real-time Calculations */}
                    <Grid item xs={12} sm={6} md={6}>
                        <Paper elevation={0} sx={{ 
                            p: 1,
                            height: '100%',
                            backgroundColor: '#023e74',
                            borderRadius: 2,
                        }}>
                            {/* <Calculate sx={{ color: 'white' }} fontSize="large" /> */}
                            <Typography variant="h5" fontWeight="bold" sx={{ color: 'white' }}>
                                Real-time Calculations
                            </Typography>
                            <Typography variant="h6" sx={{ color: 'white', mb: -1.5 }}>
                                Instantly see how inclusion/exclusion criteria affect treatment demand for your population.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Why Use Our Model Section */}
            <Box sx={{ 
                mb: 4,
                px: { xs: 3, md: 12 }, 
                py: { xs: 4, md: 5 }, 
                backgroundColor: '#023e74'
            }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ 
                    color: 'white',
                    textAlign: 'center',
                    mb: 3,
                    fontSize: { xs: "2rem", sm: "2.25rem", md: "2.5rem" }
                }}>
                    Intended Users
                </Typography>
                
                <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                        <Paper elevation={3} sx={{
                            p: 1,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#023e74' }}>
                                Healthcare Payers
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#023e74', mb: 0 }}>
                                • Project potential patient populations for coverage planning.
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#023e74', mb: 0 }}>
                                • Estimate regional treatment demand for resource allocation.
                            </Typography>
                            <Box sx={{ flexGrow: 1 }} />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
                        <Paper elevation={3} sx={{ 
                            p: 1,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: '#023e74' }}>
                                Policymakers & Healthcare Systems
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#023e74', mb: 0 }}>
                                • Assess potential needs for psilocybin-assisted therapy.                          
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#023e74', mb: 0 }}>
                                • Plan resource allocation using region-specific insights.
                            </Typography>
                            <Typography variant="h6" sx={{ color: '#023e74', mb: 0 }}>
                                • Make data-driven treatment implementation decisions.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 } }}>
                    <Button
                        variant="contained"
                        onClick={() => handleDevNotice('/register')}
                        sx={{
                            backgroundColor: 'white',
                            color: '#023e74',
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            borderRadius: 2,
                            boxShadow: 3,
                            border: '2px solid rgba(2, 62, 116, 0.3)',
                            '&:hover': {
                                backgroundColor: '#f0f4fa',
                                color: '#023e74',
                                boxShadow: 6,
                                border: '2px solid #023e74'
                            }
                        }}
                    >
                        Use the Model
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default LandingPage;
