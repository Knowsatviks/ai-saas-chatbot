import React from "react";
import { Box, Typography, Button } from "@mui/material";
import CustomizedInput from "../components/shared/CustomizedInput";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      toast.success("Password reset instructions sent if email is registered");
      navigate("/login");
    } catch (error) {
      toast.error("Unable to send reset instructions");
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
              Forgot Password
            </Typography>
            <Typography sx={{ textAlign: "center", color: "#cfd8dc", mb: 2 }}>
              Enter your email and we will send instructions to reset your password.
            </Typography>
            <CustomizedInput type="email" name="email" label="Email" />
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
              Send Reset Link
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

export default ForgotPassword;
