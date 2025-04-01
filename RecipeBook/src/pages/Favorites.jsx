import React from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

function Favorites() {
  const { favorites, removeFromFavorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <Container>
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            No favorite recipes yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add some recipes to your favorites to see them here!
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        Favorite Recipes
      </Typography>
      <Grid container spacing={3}>
        {favorites.map((recipe) => (
          <Grid item xs={12} sm={6} md={4} key={recipe.id}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={recipe.image || "https://via.placeholder.com/300x200"}
                alt={recipe.title}
              />
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {recipe.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  startIcon={<FavoriteIcon />}
                  onClick={() => removeFromFavorites(recipe.id)}
                  color="error"
                >
                  Remove from Favorites
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Favorites;
