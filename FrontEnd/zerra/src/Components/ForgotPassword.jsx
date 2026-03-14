import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase.js";
import {
    Box,
    Button,
    TextField,
    Typography,
    Alert,
    CircularProgress,
    Paper,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err) {
            setError("Failed to send reset email. Please check your email address.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <Paper elevation={3} sx={{ p: 4, maxWidth: 440, width: "100%" }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Forgot Password
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                    To reset your password, please enter your email address below. We will
                    send you an email with instructions on how to reset your password.
                </Typography>

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        Reset instructions sent! Check your inbox.
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        slotProps={{
                            input: { startAdornment: <EmailIcon sx={{ mr: 1, color: "text.secondary" }} /> }
                        }}
                        sx={{ mb: 3 }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        size="large"
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Instructions"}
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}

export default ForgotPassword;