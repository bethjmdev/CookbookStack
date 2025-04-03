import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Fab, Box } from "@mui/material";
import { Home as HomeIcon } from "@mui/icons-material";

// Import pages (we'll create these next)
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RecipeForm from "./pages/RecipeForm";
import RecipeList from "./pages/RecipeList";
import RecipeView from "./pages/RecipeView";
import EditRecipe from "./pages/EditRecipe";
import Favorites from "./pages/Favorites";
import Cookbooks from "./pages/Cookbooks";
import PrivateRoute from "./components/PrivateRoute";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
    },
    secondary: {
      main: "#dc004e",
      light: "#ff4081",
      dark: "#9a0036",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
  },
});

function HomeButton() {
  const navigate = useNavigate();
  return (
    <Fab
      color="primary"
      aria-label="home"
      onClick={() => navigate("/")}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <HomeIcon />
    </Fab>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <FavoritesProvider>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
              }}
            >
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/recipes" element={<RecipeList />} />
                <Route path="/recipe/:id" element={<RecipeView />} />
                <Route
                  path="/"
                  element={
                    <PrivateRoute>
                      <Home />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recipe/new"
                  element={
                    <PrivateRoute>
                      <RecipeForm />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/recipe/edit/:id"
                  element={
                    <PrivateRoute>
                      <EditRecipe />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/favorites"
                  element={
                    <PrivateRoute>
                      <Favorites />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/cookbooks"
                  element={
                    <PrivateRoute>
                      <Cookbooks />
                    </PrivateRoute>
                  }
                />
              </Routes>
              <HomeButton />
            </Box>
          </FavoritesProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
