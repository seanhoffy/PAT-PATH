import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, requestPasswordReset } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { Box, Card, CardHeader, CardContent, TextField, Button, CardActions, Avatar, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Typography } from "@mui/material";
import SimpleNavBar from '../components/SimpleNavBar';
import ThemeProvider from '../components/common/ThemeProvider';
import { COLORS } from '../constants/colors';

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetOpen, setResetOpen] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();

    const logInWithEmailAndPassword = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Invalid login");
        }
    };

    const handleOpenReset = () => {
        setResetEmail(email);
        setResetMessage("");
        setResetOpen(true);
    };

    const handleCloseReset = () => {
        setResetOpen(false);
        setResetLoading(false);
        setResetMessage("");
    };

    const handleSendReset = async () => {
        if (!resetEmail || !resetEmail.includes("@")) {
            setResetMessage("Please enter a valid email address.");
            return;
        }
        try {
            setResetLoading(true);
            await requestPasswordReset(resetEmail);
            setResetMessage("If an account exists for this email, a reset link has been sent.");
            setResetLoading(false);
            setResetOpen(false);
            alert("Password reset email sent (if the account exists).");
        } catch (error) {
            setResetLoading(false);
            setResetMessage(error?.message || "Could not send reset email.");
        }
    };

    useEffect(() => {
        if (loading) return;
        if (user) navigate("/home");
    }, [loading, user, navigate]);

    return (
        <ThemeProvider>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <SimpleNavBar />
                <Grid
                    container
                    direction="column"
                    alignItems="center"
                    justify="center"
                    sx={{ flex: 1, pt: 12 }}
                >
                    <Card
                        raised={true}
                        sx={{ width: 324 }}
                    >
                        <Grid
                            container
                            direction="column"
                            alignItems="center"
                            justify="center"
                        >
                            <CardHeader
                                sx={{ mt: 3, marginBottom: -2 }}
                                avatar={
                                    <Avatar sx={{ mr: -1, bgcolor: COLORS.primary }}>
                                        <Box component="img"
                                            src="/cepLogo2.png"
                                            alt="CEP Logo"
                                            sx={{
                                                height: 60,
                                                width: 'auto',
                                                objectFit: 'contain',
                                            }}
                                        />
                                    </Avatar>
                                }
                                titleTypographyProps={{ fontWeight: 'bold', color: 'primary', fontSize: 25, variant: 'h4', fontFamily: 'monospace' }}
                                title="PATpath"
                                style={{ align: 'center' }}
                            />
                            <CardContent sx={{ mt: 2 }}>
                                <TextField
                                    sx={{ width: 260 }}
                                    onChange={(event) => setEmail(event.target.value)}
                                    label="Email"
                                    type={'text'}
                                    id="filled-basic"
                                /><br />
                                <TextField
                                    sx={{ mt: 1, width: 260 }}
                                    onChange={(event) => setPassword(event.target.value)}
                                    label="Password"
                                    type={'password'}
                                    id="filled-basic"
                                />
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    onClick={() => logInWithEmailAndPassword(email, password)}
                                >
                                    Login
                                </Button>
                                <Button
                                    sx={{ ml: 1 }}
                                    href="/register"
                                    variant="outlined"
                                >
                                    Create Account
                                </Button>
                            </CardActions>
                            <Box sx={{ mb: -1.5, mt: 0, width: '100%', textAlign: 'center' }}>
                                <Button
                                    variant="text"
                                    sx={{ textTransform: 'none', color: COLORS.primary }}
                                    onClick={handleOpenReset}
                                >
                                    Forgot password?
                                </Button>
                            </Box>
                        </Grid>
                        <br />
                    </Card>
                </Grid>
            </Box>

            {/* Password Reset Dialog */}
            <Dialog open={resetOpen} onClose={handleCloseReset} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Reset Password</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2, color: '#555' }}>
                        We’ll email you a reset link if the account exists. Please also check spam/junk folders.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        autoFocus
                        sx={{ mt: 1 }}
                    />
                    {resetMessage && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            {resetMessage}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReset} disabled={resetLoading}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSendReset}
                        disabled={resetLoading}
                        sx={{ backgroundColor: COLORS.primary }}
                    >
                        {resetLoading ? 'Sending…' : 'Send reset link'}
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}