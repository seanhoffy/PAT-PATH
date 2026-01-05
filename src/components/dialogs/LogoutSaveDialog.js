import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';

const LogoutSaveDialog = ({ open, onClose, onSaveAndLogout, onLogoutWithoutSaving, saving }) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>Save Before Logging Out?</DialogTitle>
            <DialogContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Would you like to save your current model before logging out?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={onLogoutWithoutSaving}
                    color="primary"
                >
                    Logout without Saving
                </Button>
                <Button
                    onClick={onSaveAndLogout}
                    color="primary"
                    variant="contained"
                    disabled={saving}
                >
                    {saving ? 'Saving...' : 'Save and Logout'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LogoutSaveDialog;

