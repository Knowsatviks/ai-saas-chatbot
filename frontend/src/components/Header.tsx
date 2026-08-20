import AppBar from "@mui/material/AppBar";
import { Box, Toolbar, Typography } from "@mui/material";
import Logo from "./shared/Logo";
import { useAuth } from "../context/AuthContext";
import NavigationLink from "./shared/NavigationLink";

const Header = () => {
  const auth = useAuth();
  return (
    <AppBar
      sx={{
        position: "static",
        top: 0,
        left: 0,
        right: 0,
        bgcolor: "transparent",
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 }, minWidth: 0 }}>
          <Logo />
          {auth?.isLoggedIn ? (
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 0.5, md: 1 } }}>
              <NavigationLink
                bg="#00ffffc"
                to="/chat"
                text="Go to Chat"
                textColor="#000"
              />
              <NavigationLink
                bg="#00ffffc"
                to="/chat?new=true"
                text="New Chat"
                textColor="#000"
              />
              <NavigationLink
                bg="#e57373"
                to="/login"
                text="Logout"
                textColor="white"
                onClick={auth.logout}
              />
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: { xs: 0.5, md: 1 } }}>
              <NavigationLink
                bg="#00fffc"
                to="/login"
                text="Login"
                textColor="black"
              />
              <NavigationLink
                bg="#51538f"
                textColor="white"
                to="/signup"
                text="Signup"
              />
            </Box>
          )}
        </Box>
        <Typography
          sx={{
            ml: "auto",
            fontWeight: 800,
            fontSize: { xs: "16px", md: "20px" },
            textShadow: "2px 2px 20px #000",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "inherit" }}>MERN</span>-GPT
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
