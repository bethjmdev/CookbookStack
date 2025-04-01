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
  IconButton,
} from "@mui/material";
import { Add as AddIcon, Favorite, FavoriteBorder } from "@mui/icons-material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
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

const COOKING_METHODS = [
  "Stovetop Cooking",
  "Oven Cooking",
  "Baking",
  "Crock Pot",
  "Instant Pot",
  "Simmer on Stove",
  "Other",
];

const EFFORT_LEVELS = [
  "Quick & Easy (Under 30 mins)",
  "Minimal Effort, Long Time (Set & Forget)",
  "Moderate Effort (30-60 mins)",
  "Active Cooking (1-2 hours)",
  "Project Cooking (2+ hours)",
  "Complex Recipe (Multiple Steps)",
  "Special Occasion (All Day Event)",
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
  const [selectedEffort, setSelectedEffort] = useState("");
  const [selectedDietary, setSelectedDietary] = useState("");
  const [selectedAllergen, setSelectedAllergen] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingCollections, setExistingCollections] = useState([]);
  const [existingCuisines, setExistingCuisines] = useState([]);
  const [existingEfforts, setExistingEfforts] = useState([]);
  const [existingDietaryTags, setExistingDietaryTags] = useState([]);
  const [existingAllergens, setExistingAllergens] = useState([]);
  const [searchByIngredient, setSearchByIngredient] = useState("");
  const cookbookName = searchParams.get("cookbook");
  const [selectedCookingMethod, setSelectedCookingMethod] = useState("");

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
      setExistingTags(Array.from(tagsSet).sort());

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
    const matchesEffort = !selectedEffort || recipe.effort === selectedEffort;
    const matchesCookingMethod =
      !selectedCookingMethod || recipe.cookingMethod === selectedCookingMethod;
    const matchesCookbook =
      !selectedCollection || recipe.cookbook === selectedCollection;
    const matchesAuthor =
      !selectedAllergen || recipe.author === selectedAllergen;
    const matchesTags =
      existingTags.length === 0 ||
      (recipe.tags && existingTags.every((tag) => recipe.tags.includes(tag)));
    const matchesCookbookFilter =
      !cookbookName || recipe.cookbook === cookbookName;

    return (
      matchesSearch &&
      matchesCuisine &&
      matchesEffort &&
      matchesCookingMethod &&
      matchesCookbook &&
      matchesAuthor &&
      matchesTags &&
      matchesCookbookFilter
    );
  });

  const uniqueCookbooks = [
    ...new Set(recipes.map((recipe) => recipe.cookbook)),
  ];
  const uniqueAuthors = [...new Set(recipes.map((recipe) => recipe.author))];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        {cookbookName ? (
          <Typography variant="h4" component="h1" gutterBottom>
            Recipes from {cookbookName}
          </Typography>
        ) : (
          <Typography variant="h4" component="h1" gutterBottom>
            My Recipes
          </Typography>
        )}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Search recipes"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => navigate("/recipe/new")}
            startIcon={<AddIcon />}
          >
            Add Recipe
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
            <InputLabel>Effort Level</InputLabel>
            <Select
              value={selectedEffort}
              label="Effort Level"
              onChange={(e) => setSelectedEffort(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {EFFORT_LEVELS.map((effort) => (
                <MenuItem key={effort} value={effort}>
                  {effort}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Cooking Method</InputLabel>
            <Select
              value={selectedCookingMethod}
              label="Cooking Method"
              onChange={(e) => setSelectedCookingMethod(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {COOKING_METHODS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Cookbook</InputLabel>
            <Select
              value={selectedCollection}
              label="Cookbook"
              onChange={(e) => setSelectedCollection(e.target.value)}
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
            value={selectedAllergen}
            onChange={(event, newValue) => setSelectedAllergen(newValue)}
            renderInput={(params) => <TextField {...params} label="Author" />}
          />
        </Grid>
        <Grid item xs={12}>
          <TagInput
            value={existingTags}
            onChange={setExistingTags}
            existingTags={existingTags}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
              onClick={() => navigate(`/recipe/${recipe.id}`)}
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
                  Cooking Time: {recipe.cookingTime} minutes
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Servings: {recipe.servings}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ingredients: {recipe.ingredients.join(", ")}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!existingTags.includes(tag)) {
                            setExistingTags([...existingTags, tag]);
                          }
                        }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
              <CardActions>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
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
