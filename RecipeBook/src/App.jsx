import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Import pages (we'll create these next)
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import RecipeForm from "./pages/RecipeForm";
import RecipeList from "./pages/RecipeList";
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <FavoritesProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recipes"
                element={
                  <PrivateRoute>
                    <RecipeList />
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
          </FavoritesProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
