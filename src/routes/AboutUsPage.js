import React from 'react';
import { Box, Container, Grid, Paper, Typography, Avatar, Divider } from '@mui/material';
import NavBar from '../components/NavBar';
import ThemeProvider from '../components/common/ThemeProvider';
import { COLORS } from '../constants/colors';

const TEAM_MEMBERS = [
    {
        name: 'Elliot Marseille',
        role: 'DrPH, MPP',
        initials: 'EM',
        image: '/elliot-marseille.jpg',
        bio: 'Elliot Marseille, DrPH, MPP, is a health economist whose work sits at the intersection of psychedelic science, public health, and policy. He directs the Collaborative for the Economics of Psychedelics at UC Berkeley, where he and collaborators develop rigorous, decision-relevant analyses of psychedelic-assisted therapies—spanning cost-effectiveness, access, pricing, and implementation. The work of CEP is designed to inform payers, regulators, and health systems on coverage and scale-up.\n\nRecent projects and publications examine the cost-effectiveness and epidemic impact of MDMA-assisted therapy for PTSD, psilocybin for depression, pricing of MDMA, feasibility of introducing psychedelic therapies to low and middle income countries, and the system-level efficiencies possible with group-based delivery models. Partners have included federal agencies, leading academic centers, and nonprofits.\n\nDr. Marseille\'s career is grounded in three decades of HIV/AIDS and global health economics, leading studies for CDC, the World Bank, the Gates Foundation, and ministries of health across Africa and Asia. He has published over 80 peer-reviewed articles in 40+ years of public health research.'
    },
    {
        name: 'James G. Kahn',
        role: 'MD, MPH',
        initials: 'JK',
        image: '/james-kahn.jpg',
        bio: 'James G. Kahn, MD, MPH, is emeritus professor at the UCSF Philip R. Lee Institute for Health Policy Studies. He has 30 years\' experience in the empirical and modeled assessment of the cost, effects and cost-effectiveness of global health interventions, programs and policies, with more than 85 publications in this area, including a focus on global mental health. Dr. Kahn was a founding faculty member of UC Berkeley\'s Collaborative for the Economics of Psychedelics and continues to serve as a senior advisor.\n\nHe has taught four courses in health economics at UCSF including global health economics and decision and cost-effectiveness analysis. He started and directs the UCSF Global Health Economics Consortium (GHECon). He has mentored dozens of post- and pre-doctoral students and faculty over the past 25 years.'
    },
    {
        name: 'Martin Guerrero',
        role: 'Researcher',
        initials: 'MG',
        image: '/martin-guerrero.jpg',
        bio: 'Short bio placeholder for Martin Guerrero. This will describe their background, role on the project, and interest in psilocybin-assisted therapy and health economics.'
    },
    {
        name: 'Sean Hoffmeister',
        role: 'Developer',
        initials: 'SH',
        image: '/sean-hoffmeister.png',
        bio: 'Sean Hoffmeister graduated from UCLA with an undergraduate computer science degree and a 3.9 GPA, and is now attending UCLA for his Master\'s of Science in computer science. He worked as an engineering intern at Amazon Web Services and is ready to start a long career in software after graduation.\n\nHe has worked on a lot of projects in this space, developing web applications for many distinct purposes using many different frameworks, whether at school, work, or to learn.'
    },
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
                                                p: 3,
                                                borderRadius: 2,
                                                textAlign: 'center',
                                                height: '100%',
                                            }}
                                        >
                                            <Avatar
                                                src={process.env.PUBLIC_URL + member.image}
                                                alt={member.name}
                                                sx={{
                                                    width: 120,
                                                    height: 120,
                                                    mx: 'auto',
                                                    mb: 2,
                                                    bgcolor: COLORS.primary,
                                                    fontWeight: 'bold',
                                                    overflow: 'hidden',
                                                    '& img': {
                                                        objectFit: 'cover',
                                                        ...(member.name === 'Sean Hoffmeister' && {
                                                            transform: 'scale(1.15)',
                                                        }),
                                                        ...((member.name === 'James G. Kahn' || member.name === 'Elliot Marseille') && {
                                                            objectPosition: 'center 25%',
                                                        }),
                                                    },
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
                                                sx={{ color: '#666', mb: 2 }}
                                            >
                                                {member.role}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: '#444', lineHeight: 1.7, textAlign: 'left', whiteSpace: 'pre-line' }}
                                            >
                                                {member.bio}
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
                                {/* CEP Logo and Tagline */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                    }}
                                >
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
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            fontStyle: 'italic',
                                            color: '#666',
                                            mt: 1,
                                            textAlign: 'center',
                                        }}
                                    >
                                        We crunch the numbers that bring psychedelics to life.
                                    </Typography>
                                </Box>
                                {/* Placeholder description */}
                                <Typography
                                    variant="body1"
                                    sx={{ color: '#333', lineHeight: 1.7 }}
                                >
                                    CEP is a network of health economists dedicated to achieving the potential of psychedelic therapies for high-priority mental health conditions. Through the application of policy-relevant economic analyses, CEP seeks to enhance clinical outcomes, increase efficiency of service delivery, and increase access to these promising therapies for everyone who can benefit. 

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


