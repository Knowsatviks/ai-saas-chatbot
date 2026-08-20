import React from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { verifyPasswordResetOtp } from "../helpers/api-communicator";

const OneTimePassword = () => {
  const navigate = useNavigate();
  const email = new URLSearchParams(window.location.search).get("email") || "";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const otp = formData.get("otp") as string;

    if (!email || !/^\d{4}$/.test(otp)) {
      toast.error("Enter the 4-digit OTP");
      return;
    }

    try {
      const data = await verifyPasswordResetOtp(email, otp);
      toast.success("OTP verified");
      navigate(`/new-password?token=${encodeURIComponent(data.resetToken)}`);
    } catch (error) {
      toast.error("The OTP is invalid");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "70vh", display: "flex", justifyContent: "center", alignItems: "center", p: 2 }}>
      <form onSubmit={handleSubmit} style={{ padding: "30px", boxShadow: "10px 10px 20px #000", borderRadius: "10px", width: "100%", maxWidth: "420px" }}>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="h4" sx={{ textAlign: "center", p: 2, fontWeight: 600 }}>Verify OTP</Typography>
          <Typography sx={{ textAlign: "center", color: "#cfd8dc", mb: 2 }}>Enter the 4-digit code sent to your email.</Typography>
          <TextField
            name="otp"
            label="4-digit OTP"
            type="text"
            required
            slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]{4}", maxLength: 4 } }}
            sx={{ "& .MuiInputBase-input": { color: "white", fontSize: 24, letterSpacing: 8, textAlign: "center" } }}
          />
          <Button type="submit" sx={{ mt: 2, width: "100%", borderRadius: 2, bgcolor: "#00fffc", ":hover": { bgcolor: "white", color: "black" } }}>Verify OTP</Button>
          <Box sx={{ mt: 2, textAlign: "center" }}><Link to="/forgot-password" style={{ color: "#00fffc", textDecoration: "none" }}>Request a new OTP</Link></Box>
        </Box>
      </form>
    </Box>
  );
};

export default OneTimePassword;
