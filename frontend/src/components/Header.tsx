import AppBar from "@mui/material/AppBar";
import { Toolbar } from "@mui/material";
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
      <Toolbar sx={{ display: "flex" }}>
        <Logo />
        <div>
          {auth?.isLoggedIn ? (
            <>
              <NavigationLink
                bg="#00ffffc"
                to="/chat"
                text="Go to Chat"
                textColor="#000"
              />
              <NavigationLink
                bg="#00ffffc"
                to="/login"
                text="Logout"
                textColor="#000"
                onClick={auth.logout}
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
