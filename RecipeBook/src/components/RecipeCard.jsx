import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useFavorites } from "../contexts/FavoritesContext";
import { useState, useEffect } from "react";
import {
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  CardActions,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useNavigate } from "react-router-dom";

export default function RecipeCard({ recipe, onDelete }) {
  const navigate = useNavigate();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [isFavoriteState, setIsFavoriteState] = useState(false);

  // Update favorite state when recipe or favorites change
  useEffect(() => {
    setIsFavoriteState(isFavorite(recipe.id));
  }, [recipe.id, isFavorite]);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Prevent card click when clicking favorite button
    try {
      if (isFavoriteState) {
        await removeFromFavorites(recipe.id);
      } else {
        await addToFavorites(recipe);
      }
      setIsFavoriteState(!isFavoriteState);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 6,
        },
      }}
    >
      {recipe.imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={recipe.imageUrl}
          alt={recipe.title}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2">
          {recipe.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Cookbook: {recipe.cookbook}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Author: {recipe.author}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Cuisine: {recipe.cuisineType}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Effort: {recipe.effort}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Cooking Method: {recipe.cookingMethod}
        </Typography>
        {recipe.tags && recipe.tags.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {recipe.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
      <CardActions>
        <IconButton
          onClick={handleFavoriteClick}
          aria-label={
            isFavoriteState ? "Remove from favorites" : "Add to favorites"
          }
        >
          {isFavoriteState ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
      </CardActions>
    </Card>
  );
}
