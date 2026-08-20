import React from "react";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../helpers/api-communicator";

const NewPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const resetToken = new URLSearchParams(window.location.search).get("token");

    if (!resetToken) {
      toast.error("Your password reset session has expired");
      navigate("/forgot-password");
      return;
    }

    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await resetPassword(resetToken, password);
      toast.success("Password updated successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Unable to update password");
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", display: "flex", flex: 1 }}>
      <Box sx={{ display: "flex", flex: { xs: 1, md: 0.5 }, justifyContent: "center", alignItems: "center", p: 2, mt: 16, mx: "auto" }}>
        <form
          onSubmit={handleSubmit}
          style={{
            margin: "auto",
            padding: "30px",
            boxShadow: "10px 10px 20px #000",
            borderRadius: "10px",
            border: "none",
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Typography variant="h4" sx={{ textAlign: "center", p: 2, fontWeight: 600 }}>
              Enter New Password
            </Typography>
            <Typography sx={{ textAlign: "center", color: "#cfd8dc", mb: 2 }}>
              Enter your new password below.
            </Typography>
            <CustomizedInput type="password" name="password" label="New Password" />
            <CustomizedInput type="password" name="confirmPassword" label="Confirm New Password" />
            <Button
              type="submit"
              sx={{
                px: 2,
                py: 1,
                mt: 2,
                width: "100%",
                borderRadius: 2,
                bgcolor: "#00fffc",
                ":hover": {
                  bgcolor: "white",
                  color: "black",
                },
              }}
            >
              Update Password
            </Button>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Link to="/login" style={{ color: "#00fffc", textDecoration: "none" }}>
                Back to Login
              </Link>
            </Box>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default NewPassword;
