
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	EmailAuthProvider,
	reauthenticateWithCredential,
	updateEmail,
	updatePassword,
} from "firebase/auth";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./Settings.module.css";
import { auth } from "../firebase.js";
import NavBar from "./NavBar";

function Settings() {
	const navigate = useNavigate();
	const [currentUser, setCurrentUser] = useState(auth.currentUser);

	const [newEmail, setNewEmail] = useState("");
	const [confirmEmail, setConfirmEmail] = useState("");
	const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const [emailMessage, setEmailMessage] = useState(null);
	const [passwordMessage, setPasswordMessage] = useState(null);
	const [emailLoading, setEmailLoading] = useState(false);
	const [passwordLoading, setPasswordLoading] = useState(false);

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (!user) {
				navigate("/login");
				return;
			}
			setCurrentUser(user);
		});

		return () => unsubscribe();
	}, [navigate]);

	const getPasswordErrorMessage = (error) => {
		if (!error?.code) {
			return "Unable to update password right now. Please try again.";
		}

		switch (error.code) {
			case "auth/wrong-password":
			case "auth/invalid-credential":
				return "Your current password is incorrect.";
			case "auth/weak-password":
				return "Your new password is too weak. Use at least 6 characters.";
			case "auth/requires-recent-login":
				return "Please sign in again and then retry changing your password.";
			default:
				return "Unable to update password right now. Please try again.";
		}
	};

	const handleEmailUpdate = async (event) => {
		event.preventDefault();
		setEmailMessage(null);

		const trimmedEmail = newEmail.trim();
		const trimmedConfirmEmail = confirmEmail.trim();

		if (!trimmedEmail || !trimmedConfirmEmail || !currentPasswordForEmail) {
			setEmailMessage({
				type: "error",
				text: "Please complete all email fields.",
			});
			return;
		}

		if (trimmedEmail !== trimmedConfirmEmail) {
			setEmailMessage({
				type: "error",
				text: "New email and confirmation do not match.",
			});
			return;
		}

		if (!currentUser) {
			setEmailMessage({
				type: "error",
				text: "No active user found. Please sign in again.",
			});
			return;
		}

		try {
			setEmailLoading(true);
			const credential = EmailAuthProvider.credential(currentUser.email, currentPasswordForEmail);
			await reauthenticateWithCredential(currentUser, credential);
			await updateEmail(currentUser, trimmedEmail);
			setEmailMessage({
				type: "success",
				text: "Email updated successfully.",
			});
			setNewEmail("");
			setConfirmEmail("");
			setCurrentPasswordForEmail("");
		} catch (error) {
			const code = error?.code;
			let message = "Failed to update email. Please try again.";

			if (code === "auth/email-already-in-use") {
				message = "That email is already in use by another account.";
			} else if (code === "auth/invalid-email") {
				message = "Please enter a valid email address.";
			} else if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
				message = "Current password is incorrect.";
			} else if (code === "auth/requires-recent-login") {
				message = "Please sign in again and retry changing your email.";
			}

			setEmailMessage({
				type: "error",
				text: message,
			});
		} finally {
			setEmailLoading(false);
		}
	};

	const handlePasswordUpdate = async (event) => {
		event.preventDefault();
		setPasswordMessage(null);

		if (!currentPassword || !newPassword || !confirmPassword) {
			setPasswordMessage({
				type: "error",
				text: "Please complete all password fields.",
			});
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordMessage({
				type: "error",
				text: "New password and confirmation do not match.",
			});
			return;
		}

		if (!currentUser?.email) {
			setPasswordMessage({
				type: "error",
				text: "Current user email is unavailable. Please sign in again.",
			});
			return;
		}

		try {
			setPasswordLoading(true);
			const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
			await reauthenticateWithCredential(currentUser, credential);
			await updatePassword(currentUser, newPassword);
			setPasswordMessage({
				type: "success",
				text: "Password updated successfully.",
			});
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (error) {
			setPasswordMessage({
				type: "error",
				text: getPasswordErrorMessage(error),
			});
		} finally {
			setPasswordLoading(false);
		}
	};

	return (
		<div className={styles.wrapper}>
			<NavBar />

			<div className={styles.content}>
				<h1>Settings</h1>

				<Paper className={styles.card} elevation={3}>
					<Typography variant="h6" component="h2" gutterBottom>
						Update Email
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
						Current email: {currentUser?.email || "Unavailable"}
					</Typography>

					<form onSubmit={handleEmailUpdate} className={styles.form}>
						<TextField
							label="New Email"
							type="email"
							value={newEmail}
							onChange={(e) => setNewEmail(e.target.value)}
							fullWidth
							required
						/>

						<TextField
							label="Confirm New Email"
							type="email"
							value={confirmEmail}
							onChange={(e) => setConfirmEmail(e.target.value)}
							fullWidth
							required
						/>

						<TextField
							label="Current Password"
							type="password"
							value={currentPasswordForEmail}
							onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
							fullWidth
							required
						/>

						<Button type="submit" variant="contained" disabled={emailLoading}>
							{emailLoading ? <CircularProgress size={20} color="inherit" /> : "Save Email"}
						</Button>

						{emailMessage && <Alert severity={emailMessage.type}>{emailMessage.text}</Alert>}
					</form>
				</Paper>

				<Divider className={styles.divider} />

				<Paper className={styles.card} elevation={3}>
					<Typography variant="h6" component="h2" gutterBottom>
						Update Password
					</Typography>

					<form onSubmit={handlePasswordUpdate} className={styles.form}>
						<TextField
							label="Current Password"
							type="password"
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							fullWidth
							required
						/>

						<TextField
							label="New Password"
							type="password"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							fullWidth
							required
						/>

						<TextField
							label="Confirm New Password"
							type="password"
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							fullWidth
							required
						/>

						<Button type="submit" variant="contained" disabled={passwordLoading}>
							{passwordLoading ? <CircularProgress size={20} color="inherit" /> : "Save Password"}
						</Button>

						{passwordMessage && <Alert severity={passwordMessage.type}>{passwordMessage.text}</Alert>}
					</form>
				</Paper>
			</div>
		</div>
	);
}

export default Settings;
