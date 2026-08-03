import { AppBar, Toolbar, Typography, Box, Button, ButtonBase } from '@mui/material';
// import logo from '../logo.svg'; // Remove this line
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { clearUserFormState, fetchUserFormState, addSavedModel, updateSavedModel } from '../utils/firebaseHelpers';
import { deriveFunnelDisplay, cellValuesFromResults } from '../utils/funnelCalculations';
import LogoutSaveDialog from './dialogs/LogoutSaveDialog';
import ContactUsDialog from './dialogs/ContactUsDialog';

const NavBar = () => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
    const [savingBeforeLogout, setSavingBeforeLogout] = useState(false);
    const [contactDialogOpen, setContactDialogOpen] = useState(false);

    const performLogout = async () => {
        try {
            if (user?.uid) {
                await clearUserFormState(user.uid);
            }
            await signOut(auth);
            alert("You have been logged out.");
        } catch (error) {
            console.error("Logout error:", error.message);
        }
    };

    const handleLogout = () => {
        setLogoutDialogOpen(true);
    };

    const handleLogoutWithoutSaving = async () => {
        setLogoutDialogOpen(false);
        await performLogout();
    };

    const handleSaveAndLogout = async () => {
        if (!user?.uid) {
            alert('Please log in to save models.');
            setLogoutDialogOpen(false);
            return;
        }

        setSavingBeforeLogout(true);

        try {
            // Fetch current form state and results from Firestore
            const { currentForm, currentResults, currentFunnelState, currentEditingModelId } = await fetchUserFormState(user.uid);

            // Check if results exist
            if (!currentResults) {
                alert("Results need to be calculated before saving. Please calculate results first.");
                setSavingBeforeLogout(false);
                setLogoutDialogOpen(false);
                navigate('/home');
                return;
            }

            // Construct funnel payload the same way buildSavePayload does in
            // inputs_and_outputs.js, so saves from this flow aren't missing
            // Stages 4-9 data relative to the in-page Save/Update buttons.
            const funnel = currentFunnelState
                ? {
                    ...currentFunnelState,
                    effectiveDemand: deriveFunnelDisplay(currentFunnelState, cellValuesFromResults(currentResults))?.displayedEffectiveDemand ?? null,
                }
                : null;

            // Construct model payload
            const payload = {
                title: currentForm?.modelTitle || 'Untitled model',
                geographicArea: currentForm?.geographicArea || '',
                motivation: currentForm?.motivation || '',
                inputs: currentForm,
                outputs: { ...currentResults },
                funnel,
            };

            // If an edit is in progress (matches the in-page "Update Model" behavior),
            // update that saved model in place instead of always creating a new copy.
            const response = currentEditingModelId
                ? await updateSavedModel(user.uid, currentEditingModelId, payload)
                : await addSavedModel(user.uid, payload);
            setSavingBeforeLogout(false);

            // Check response
            if (response.isDuplicate === true) {
                alert("This model was already saved.");
                setLogoutDialogOpen(false);
                await performLogout();
            } else if (!response.success) {
                alert(response.message || 'Could not save model.');
                setLogoutDialogOpen(false);
                // Don't logout - stay on page
            } else {
                // Save successful, logout normally
                setLogoutDialogOpen(false);
                await performLogout();
            }
        } catch (error) {
            console.error('Error saving model before logout:', error);
            setSavingBeforeLogout(false);
            alert('An error occurred while saving. Please try again.');
            setLogoutDialogOpen(false);
        }
    };

    const handleDialogClose = () => {
        if (!savingBeforeLogout) {
            setLogoutDialogOpen(false);
        }
    };

    useEffect(() => {
        if (loading) return;
        if (!user) navigate("/");
    }, [user, loading, navigate]);

    return (
        <AppBar position="static" sx={{ height: '80px', backgroundColor: '#FFFFFF', color: '#000000' }}>
            <Toolbar sx={{ height: '100%' }}>
                <ButtonBase onClick={() => navigate('/home')} sx={{ display: 'flex', alignItems: 'center' }}>
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
                <ButtonBase onClick={() => navigate('/home')} sx={{ textTransform: 'none' }}>
                    <Typography variant="h5" component="div" sx={{ color: '#000000', ml: 0.5 }}>
                        PATpath
                    </Typography>
                </ButtonBase>
                <Box sx={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
                    <Button color="inherit" onClick={() => navigate("/home")} sx={{ color: '#000000' }}>HOME</Button>
                    <Button color="inherit" onClick={() => navigate("/about")} sx={{ color: '#000000' }}>ABOUT US</Button>
                    <Button color="inherit" onClick={() => navigate("/researchpaper")} sx={{ color: '#000000' }}>MOTIVATION</Button>
                    <Button color="inherit" onClick={() => navigate("/terminology")} sx={{ color: '#000000' }}>TERMINOLOGY</Button>
                    <Button color="inherit" onClick={() => navigate("/history")} sx={{ color: '#000000' }}>HISTORY</Button>
                    <Button
                        color="inherit"
                        sx={{ color: '#000000' }}
                        onClick={() => setContactDialogOpen(true)}
                    >
                        CONTACT US
                    </Button>
                    <Button color="inherit" onClick={handleLogout} sx={{ color: '#000000' }}>Logout</Button>
                </Box>
            </Toolbar>
            <LogoutSaveDialog
                open={logoutDialogOpen}
                onClose={handleDialogClose}
                onSaveAndLogout={handleSaveAndLogout}
                onLogoutWithoutSaving={handleLogoutWithoutSaving}
                saving={savingBeforeLogout}
            />
            <ContactUsDialog
                open={contactDialogOpen}
                onClose={() => setContactDialogOpen(false)}
            />
        </AppBar>
    )
}

export default NavBar;