import { AppBar, Toolbar, Typography, Box, Button, ButtonBase } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactUsDialog from './dialogs/ContactUsDialog';

// Nav bar for unauthenticated visitors — only links to the static,
// pre-login-accessible pages (About Us, Motivation, Terminology, Contact Us)
// plus a way back to the landing page. No Home/History/Logout, since those
// require an account.
const PublicNavBar = () => {
    const navigate = useNavigate();
    const [contactDialogOpen, setContactDialogOpen] = useState(false);

    return (
        <AppBar position="static" sx={{ height: '80px', backgroundColor: '#FFFFFF', color: '#000000' }}>
            <Toolbar sx={{ height: '100%' }}>
                <ButtonBase onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box component="img"
                        src={process.env.PUBLIC_URL + '/cepLogo2.png'}
                        alt="CEP Logo"
                        sx={{
                            height: 48,
                            width: 'auto',
                            objectFit: 'contain',
                            marginRight: 1
                        }}
                    />
                </ButtonBase>
                <ButtonBase onClick={() => navigate('/')} sx={{ textTransform: 'none' }}>
                    <Typography variant="h5" component="div" sx={{ color: '#000000', ml: 0.5 }}>
                        PATpath
                    </Typography>
                </ButtonBase>
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                    <Button color="inherit" onClick={() => navigate("/")} sx={{ color: '#000000' }}>HOME</Button>
                    <Button color="inherit" onClick={() => navigate("/about")} sx={{ color: '#000000' }}>ABOUT US</Button>
                    <Button color="inherit" onClick={() => navigate("/researchpaper")} sx={{ color: '#000000' }}>MOTIVATION</Button>
                    <Button color="inherit" onClick={() => navigate("/terminology")} sx={{ color: '#000000' }}>TERMINOLOGY</Button>
                    <Button
                        color="inherit"
                        sx={{ color: '#000000' }}
                        onClick={() => setContactDialogOpen(true)}
                    >
                        CONTACT US
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/login')} sx={{ color: '#000000' }}>LOG IN</Button>
                </Box>
            </Toolbar>
            <ContactUsDialog
                open={contactDialogOpen}
                onClose={() => setContactDialogOpen(false)}
            />
        </AppBar>
    );
};

export default PublicNavBar;
