import React from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, Divider } from '@mui/material';
import NavBar from '../components/NavBar';
import ThemeProvider from '../components/common/ThemeProvider';
import { COLORS } from '../constants/colors';

const TEAM_MEMBERS = [
    { name: 'Elliot Marseille', role: 'Co-Investigator', initials: 'EM' },
    { name: 'Jim Khan', role: 'Co-Investigator', initials: 'JK' },
    { name: 'Martin Guerrero', role: 'Researcher', initials: 'MG' },
    { name: 'Sean Hoffmeister', role: 'Developer', initials: 'SH' },
];

const AboutUsPage = () => {
    return (
        <ThemeProvider>
            <div className="App">
                <NavBar />
                <Box
                    sx={{
                        backgroundColor: COLORS.primary,
                        minHeight: 'calc(100vh - 80px)',
                        py: { xs: 4, md: 6 },
                    }}
                >
                    <Container maxWidth="lg">
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
                                About Us
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                sx={{
                                    mb: 4,
                                    textAlign: 'center',
                                    color: '#555',
                                }}
                            >
                                Meet the team behind PATpath that helped make all of this possible!
                            </Typography>

                            {/* Team Section */}
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{ mb: 2, color: COLORS.primary }}
                            >
                                Our Team
                            </Typography>
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                {TEAM_MEMBERS.map((member) => (
                                    <Grid item xs={12} sm={6} md={3} key={member.name}>
                                        <Paper
                                            elevation={1}
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                textAlign: 'center',
                                                height: '100%',
                                            }}
                                        >
                                            {/* Placeholder for profile image */}
                                            <Avatar
                                                sx={{
                                                    width: 72,
                                                    height: 72,
                                                    mx: 'auto',
                                                    mb: 1.5,
                                                    bgcolor: COLORS.primary,
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                {member.initials}
                                            </Avatar>
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                sx={{ color: COLORS.primary, mb: 0.5 }}
                                            >
                                                {member.name}
                                            </Typography>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ color: '#666', mb: 1.5 }}
                                            >
                                                {member.role}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: '#444', lineHeight: 1.6 }}
                                            >
                                                Short bio placeholder for {member.name}. This will describe their
                                                background, role on the project, and interest in psilocybin-assisted
                                                therapy and health economics.
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* CEP Section */}
                            <Typography
                                variant="h5"
                                fontWeight="bold"
                                sx={{ mb: 2, color: COLORS.primary }}
                            >
                                CEP – UC Berkeley Collaborative for the Economics of Psychedelics
                            </Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: 'center',
                                    gap: 3,
                                }}
                            >
                                {/* CEP Logo */}
                                <Box
                                    component="img"
                                    src={process.env.PUBLIC_URL + '/cepLogo2.png'}
                                    alt="CEP Logo"
                                    sx={{
                                        width: { xs: 160, md: 200 },
                                        height: 'auto',
                                        objectFit: 'contain',
                                    }}
                                />
                                {/* Placeholder description */}
                                <Typography
                                    variant="body1"
                                    sx={{ color: '#333', lineHeight: 1.7 }}
                                >
                                    Placeholder for a description of the UC Berkeley Collaborative for the
                                    Economics of Psychedelics (CEP). This section will describe CEP’s mission,
                                    research focus, and role in developing and supporting the PATpath model.
                                </Typography>
                            </Box>
                        </Paper>
                    </Container>
                </Box>
            </div>
        </ThemeProvider>
    );
};

export default AboutUsPage;


