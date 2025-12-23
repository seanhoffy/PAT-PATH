import { useState } from 'react';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { COLORS } from '../../constants/colors';

const InfoButton = ({ dialogTitle, dialogContent }) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    {Array.isArray(dialogContent) ? (
                        dialogContent.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))
                    ) : (
                        <p>{dialogContent}</p>
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

