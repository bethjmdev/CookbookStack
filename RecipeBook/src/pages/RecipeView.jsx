import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useFavorites } from "../contexts/FavoritesContext";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Favorite,
  FavoriteBorder,
  Edit as EditIcon,
} from "@mui/icons-material";

export default function RecipeView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const docRef = doc(db, "recipes", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setRecipe({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Recipe not found");
      }
    } catch (error) {
      setError("Failed to fetch recipe. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/recipes")}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {recipe.title}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={() => {
            if (isFavorite(recipe.id)) {
              removeFromFavorites(recipe.id);
            } else {
              addToFavorites(recipe);
            }
          }}
        >
          {isFavorite(recipe.id) ? (
            <Favorite color="error" />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/recipe/edit/${recipe.id}`)}
        >
          Edit Recipe
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Recipe Image */}
        {recipe.imageUrl && (
          <Box>
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              style={{
                width: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </Box>
        )}

        {/* Recipe Details */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recipe Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Cookbook: {recipe.cookbook}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Author: {recipe.author}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Cuisine: {recipe.cuisineType}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Effort: {recipe.effort}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Cooking Time: {recipe.cookingTime} minutes
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Servings: {recipe.servings}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Only show ingredients and instructions if they exist */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ingredients
            </Typography>
            <Typography
              component="pre"
              sx={{
                whiteSpace: "pre-wrap",
                fontFamily: "inherit",
                margin: 0,
              }}
            >
              {recipe.ingredients}
            </Typography>
          </Paper>
        )}

        {recipe.instructions && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Instructions
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: "pre-line" }}
              component="div"
            >
              {recipe.instructions}
            </Typography>
          </Paper>
        )}

        {/* Tags and Categories */}
        {(recipe.tags?.length > 0 ||
          recipe.dietaryTags?.length > 0 ||
          recipe.allergens?.length > 0) && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tags & Categories
            </Typography>
            {recipe.tags?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tags:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {recipe.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Box>
              </Box>
            )}
            {recipe.dietaryTags?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Dietary Tags:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {recipe.dietaryTags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            {recipe.allergens?.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Allergens:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {recipe.allergens.map((allergen) => (
                    <Chip
                      key={allergen}
                      label={allergen}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>
        )}
      </Box>
    </Container>
  );
}
