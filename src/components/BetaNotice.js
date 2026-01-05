import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const BetaNotice = () => (
    <Box
        sx={{
            backgroundColor: '#d6bf6a',
            color: '#1f1f1f',
            borderRadius: 2,
            p: { xs: 2, md: 2.5 },
            mb: 3,
            border: '1px solid #b79f4f',
        }}
    >
        <Typography
            variant="h5"
            fontWeight="bold"
            sx={{ textAlign: 'center', mb: 1, color: '#1f1f1f' }}
        >
            Beta Testing Notice
        </Typography>
        <Typography variant="body1" sx={{ mb: .5 }}>
            This tool is currently in beta testing. As we continue to refine its functionality, results may not always be fully accurate.
        </Typography>
        <Typography variant="body1">
            We appreciate your input. If you encounter any issues or have suggestions for improvement, please submit your feedback via our{' '}
            <Link href="https://www.surveymonkey.com/r/3GCVNNL" target="_blank" rel="noopener noreferrer" underline="hover" sx={{ fontWeight: 'bold' }}>
                feedback form
            </Link>
            .
        </Typography>
    </Box>
);

export default BetaNotice;

