import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Box,
} from "@mui/material";
import {
  Add as AddIcon,
  Restaurant as RestaurantIcon,
  Book as BookIcon,
  Favorite as FavoriteIcon,
} from "@mui/icons-material";

export default function Home() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Recipe Book
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {currentUser.email}
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AddIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Add New Recipe</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Create and save your favorite recipes
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/recipe/new")}>
                  Add Recipe
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <RestaurantIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Browse Recipes</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  View and search through your recipe collection
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/recipes")}>
                  View Recipes
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <FavoriteIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Favorites</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Access your favorite recipes
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/favorites")}>
                  View Favorites
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <BookIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Cookbooks</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Organize recipes into cookbooks
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate("/cookbooks")}>
                  View Cookbooks
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
