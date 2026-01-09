import React, { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { COLORS } from '../../constants/colors';

const InfoButton = ({ dialogTitle, dialogContent }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const renderParagraph = (text) => {
        const colonIndex = text.indexOf(':');
        if (colonIndex !== -1) {
            const subheading = text.substring(0, colonIndex);
            const rest = text.substring(colonIndex + 1);
            return (
                <Typography component="p" sx={{ mb: 1.5 }}>
                    <strong>{subheading}:</strong>{rest}
                </Typography>
            );
        }
        return <Typography component="p" sx={{ mb: 1.5 }}>{text}</Typography>;
    };

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: COLORS.primary,
                    '&:hover': {
                        color: COLORS.primaryHover,
                        backgroundColor: 'rgba(2, 62, 116, 0.08)',
                    },
                    padding: 0.75,
                }}
            >
                <InfoIcon fontSize="medium" />
            </IconButton>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>{dialogTitle}</DialogTitle>
                <DialogContent>
                    {Array.isArray(dialogContent) ? (
                        dialogContent.map((paragraph, index) => (
                            <React.Fragment key={index}>
                                {renderParagraph(paragraph)}
                            </React.Fragment>
                        ))
                    ) : (
                        renderParagraph(dialogContent)
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="contained">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default InfoButton;

