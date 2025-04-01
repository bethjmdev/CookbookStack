import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { useFavorites } from "../contexts/FavoritesContext";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  TextField,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CardActions,
  Chip,
} from "@mui/material";
import { Add as AddIcon, Favorite, FavoriteBorder } from "@mui/icons-material";
import { useNavigate, useSearchParams } from "react-router-dom";
import TagInput from "../components/TagInput";

// Predefined options for cuisine types
const CUISINE_TYPES = [
  "African",
  "American",
  "Asian",
  "Australian",
  "Austrian",
  "Belgian",
  "Brazilian",
  "British",
  "Cajun",
  "Caribbean",
  "Chinese",
  "Cuban",
  "Danish",
  "Dutch",
  "Egyptian",
  "Filipino",
  "French",
  "German",
  "Greek",
  "Hungarian",
  "Indian",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Jewish",
  "Korean",
  "Lebanese",
  "Malaysian",
  "Mediterranean",
  "Mexican",
  "Middle Eastern",
  "Moroccan",
  "Nepalese",
  "New Zealand",
  "Nordic",
  "Pakistani",
  "Peruvian",
  "Polish",
  "Portuguese",
  "Russian",
  "Scandinavian",
  "Scottish",
  "Spanish",
  "Swedish",
  "Swiss",
  "Taiwanese",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Vietnamese",
  "Other",
];

export default function RecipeList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedCookbook, setSelectedCookbook] = useState(
    searchParams.get("cookbook") || ""
  );
  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const recipesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Extract all unique tags
      const tagsSet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.tags && Array.isArray(recipe.tags)) {
          recipe.tags.forEach((tag) => tagsSet.add(tag));
        }
      });
      setAllTags(Array.from(tagsSet).sort());

      setRecipes(recipesData);
      setError("");
    } catch (error) {
      setError("Failed to fetch recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCuisine =
      !selectedCuisine || recipe.cuisineType === selectedCuisine;
    const matchesCookbook =
      !selectedCookbook || recipe.cookbook === selectedCookbook;
    const matchesAuthor = !selectedAuthor || recipe.author === selectedAuthor;
    const matchesTags =
      selectedTags.length === 0 ||
      (recipe.tags && selectedTags.every((tag) => recipe.tags.includes(tag)));

    return (
      matchesSearch &&
      matchesCuisine &&
      matchesCookbook &&
      matchesAuthor &&
      matchesTags
    );
  });

  const uniqueCookbooks = [
    ...new Set(recipes.map((recipe) => recipe.cookbook)),
  ];
  const uniqueAuthors = [...new Set(recipes.map((recipe) => recipe.author))];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1">
          My Recipes
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={() => navigate("/favorites")}
            sx={{ mr: 2 }}
          >
            View Favorites
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/recipe/new")}
          >
            Add New Recipe
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            label="Search Recipes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Cuisine Type</InputLabel>
            <Select
              value={selectedCuisine}
              label="Cuisine Type"
              onChange={(e) => setSelectedCuisine(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {CUISINE_TYPES.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Cookbook</InputLabel>
            <Select
              value={selectedCookbook}
              label="Cookbook"
              onChange={(e) => setSelectedCookbook(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {uniqueCookbooks.map((cookbook) => (
                <MenuItem key={cookbook} value={cookbook}>
                  {cookbook}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <Autocomplete
            freeSolo
            options={uniqueAuthors}
            value={selectedAuthor}
            onChange={(event, newValue) => setSelectedAuthor(newValue)}
            renderInput={(params) => <TextField {...params} label="Author" />}
          />
        </Grid>
        <Grid item xs={12}>
          <TagInput
            value={selectedTags}
            onChange={setSelectedTags}
            existingTags={allTags}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
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
                  Ingredients: {recipe.ingredients.join(", ")}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!selectedTags.includes(tag)) {
                            setSelectedTags([...selectedTags, tag]);
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <Button
                  startIcon={
                    isFavorite(recipe.id) ? <Favorite /> : <FavoriteBorder />
                  }
                  onClick={() => {
                    if (isFavorite(recipe.id)) {
                      removeFromFavorites(recipe.id);
                    } else {
                      addToFavorites(recipe);
                    }
                  }}
                  color={isFavorite(recipe.id) ? "error" : "inherit"}
                >
                  {isFavorite(recipe.id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredRecipes.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No recipes found. Try adjusting your filters or add a new recipe.
          </Typography>
        </Box>
      )}
    </Container>
  );
}
