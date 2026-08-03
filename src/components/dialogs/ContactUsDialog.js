import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Link } from '@mui/material';

// Shared Contact Us dialog content, used by both the authenticated NavBar
// and the public-facing PublicNavBar so the contact info lives in one place.
const ContactUsDialog = ({ open, onClose }) => (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Contact Us</DialogTitle>
        <DialogContent>
            <Typography component="p" sx={{ mb: 2 }}>
                <strong>Elliot Marseille, DrPH, MPP</strong>
            </Typography>
            <Typography component="p" sx={{ mb: 2 }}>
                <Link href="mailto:emarseille1@berkeley.edu" color="primary">
                    emarseille1@berkeley.edu
                </Link>
            </Typography>
            <Typography component="p" sx={{ mb: 1 }}>
                <Link
                    href="https://cghdde.berkeley.edu/projects/collaborative-economics-psychedelics-cep"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                >
                    CEP Website
                </Link>
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} variant="contained">
                Close
            </Button>
        </DialogActions>
    </Dialog>
);

export default ContactUsDialog;
