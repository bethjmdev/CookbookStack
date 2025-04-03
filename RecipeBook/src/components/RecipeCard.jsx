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
  CircularProgress,
  Button,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";

export default function RecipeCard({ recipe, onDelete, onImageError }) {
  const navigate = useNavigate();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const [isFavoriteState, setIsFavoriteState] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Update favorite state when recipe or favorites change
  useEffect(() => {
    setIsFavoriteState(isFavorite(recipe.id));
  }, [recipe.id, isFavorite]);

  // Reset image error state when recipe changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setRetryCount(0);
  }, [recipe.id, recipe.imageUrl]);

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

  const handleImageError = (e) => {
    console.log(`Image error in RecipeCard for recipe ${recipe.id}`);
    setImageError(true);
    setImageLoading(false);

    // Try to refresh the image if we haven't tried too many times
    if (retryCount < 3 && onImageError) {
      onImageError();
      setRetryCount((prev) => prev + 1);
    }
  };

  const handleImageLoad = () => {
    console.log(`Image loaded successfully for recipe ${recipe.id}`);
    setImageLoading(false);
    setImageError(false);
  };

  const handleRetryClick = (e) => {
    e.stopPropagation(); // Prevent card click
    setImageError(false);
    setImageLoading(true);
    setRetryCount((prev) => prev + 1);
    if (onImageError) {
      onImageError();
    }
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
      {recipe.imageUrl && !imageError && (
        <Box sx={{ position: "relative", height: 200 }}>
          <CardMedia
            component="img"
            height="200"
            image={recipe.imageUrl}
            alt={recipe.title}
            onError={handleImageError}
            onLoad={handleImageLoad}
            sx={{
              display: imageLoading ? "none" : "block",
              objectFit: "cover",
              width: "100%",
              height: "100%",
            }}
          />
          {imageLoading && (
            <Box
              sx={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "grey.200",
              }}
            >
              <CircularProgress size={40} />
            </Box>
          )}
        </Box>
      )}
      {(!recipe.imageUrl || imageError) && (
        <Box
          sx={{
            height: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "grey.200",
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {imageError ? "Image not available" : "No image available"}
          </Typography>
          {imageError && retryCount < 3 && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRetryClick}
              variant="outlined"
            >
              Retry
            </Button>
          )}
        </Box>
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
