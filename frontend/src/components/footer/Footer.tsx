import { Box, Typography, Link } from "@mui/material";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const Footer = () => {
  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "rgb(17,29,39)",
        py: 3,
        px: 2,
        mt: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { md: "row", xs: "column" },
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          mx: "auto",
          gap: 2,
        }}
      >
        <Typography
          sx={{
            color: "white",
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          © 2024 AI ChatBot. All rights reserved.
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Link
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "white", fontSize: "1.5rem" }}
          >
            <FaGithub />
          </Link>
          <Link
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "white", fontSize: "1.5rem" }}
          >
            <FaLinkedin />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: "white", fontSize: "1.5rem" }}
          >
            <FaTwitter />
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;