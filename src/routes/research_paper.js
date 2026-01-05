import React from 'react';
import NavBar from '../components/NavBar';
import { Box, Typography, Button, Paper } from '@mui/material';
import '../App.css';
import DownloadIcon from '@mui/icons-material/Download';
import ThemeProvider from '../components/common/ThemeProvider';
import { COLORS } from '../constants/colors';

const PDFPage = () => {
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `${process.env.PUBLIC_URL}/ResearchPaper.pdf`;
        link.download = 'ResearchPaper.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ThemeProvider>
            <div className="App">
                <NavBar />
            </div>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                padding: '20px',
                backgroundColor: COLORS.primary,
                minHeight: 'calc(100vh - 80px)'
            }}>
                <Paper elevation={0} sx={{ 
                    p: 3, 
                    backgroundColor: 'white', 
                    borderRadius: 2,
                    mb: 1.5,
                    width: '100%',
                    maxWidth: '1200px'
                }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: COLORS.primary, mb: 2, textAlign: 'center' }}>
                        Project Motivation and Value to the Field
                    </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.primary, lineHeight: 1.7, mb: 2 }}>
                            Despite growing evidence for the clinical efficacy of psilocybin-assisted therapy in major depressive disorder and treatment-resistant depression, the field lacks rigorous, transparent tools for understanding how these therapies translate into real-world population impact. Decisions about coverage, regulation, workforce development, and infrastructure depend not only on whether treatments work, but on who is eligible, at what scale, under what assumptions, and at what cost.
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.primary, lineHeight: 1.7, mb: 2 }}>
                            This project was initiated to address that gap. Building on peer-reviewed work estimating the number of individuals clinically eligible for psilocybin-assisted therapy in the United States, the project moves beyond static demand estimates to create an open, interactive modeling framework. By explicitly incorporating inclusion and exclusion criteria, uncertainty, and real-world implementation constraints, the model allows users to explore how policy choices, regulatory environments, and payer decisions shape effective demand.
                        </Typography>
                        <Typography variant="body1" sx={{ color: COLORS.primary, lineHeight: 1.7 }}>
                            The value of this work lies in its public-interest orientation. Unlike proprietary or commercially sponsored analyses, the project emphasizes transparency, adaptability, and methodological rigor. It provides policymakers, payers, researchers, and health systems with a shared analytic foundation for planning, evaluation, and debate. In doing so, it helps ensure that decisions about psychedelic therapies are informed by evidence rather than speculation, and that promising treatments are assessed not only for their clinical merit, but for their potential contribution to population mental health.
                        </Typography>
                    </Paper>
                <Box sx={{ 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    width: '100%',
                    maxWidth: '1200px',
                    textAlign: 'center'
                }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: COLORS.primary }}>
                        Research Paper
                    </Typography>
                    
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownload}
                            sx={{ 
                                backgroundColor: COLORS.primary,
                                '&:hover': {
                                    backgroundColor: COLORS.primaryHover
                                }
                            }}
                        >
                            Download PDF
                        </Button>
                    </Box>

                    <Box sx={{ 
                        width: '100%', 
                        height: '70vh',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden'
                    }}>
                        <iframe
                            src={`${process.env.PUBLIC_URL}/ResearchPaper.pdf`}
                            width="100%"
                            height="100%"
                            style={{ border: 'none' }}
                            title="Research Paper PDF"
                        />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>
                        If the PDF doesn't load in your browser, please use the download button above.
                    </Typography>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

export default PDFPage;

