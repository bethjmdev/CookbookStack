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
import RecipeCard from "../components/RecipeCard";

// Predefined options for cuisine types
const CUISINE_TYPES = [
  "American",
  "Korean",
  "Chinese",
  "Japanese",
  "Vietnamese",
  "Lebanese",
  "Mediterranean",
  "Jewish",
  "Italian",
  "Mexican",
  "Indian",
  "Polish",
  "Irish",
  "Other",
  "European",
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

const RECIPE_TYPES = [
  "Breakfast",
  "Dinner",
  "Dessert",
  "Snack",
  "Beverage",
  "Appetizer",
  "Side Dish",
  "Brunch",
];

const INGREDIENT_CATEGORIES = [
  "Veggie",
  "Meat",
  "Soup",
  "Beverage",
  "Grain",
  "Sauce",
  "Fruit",
  "Broth",
  "Oil",
  "Dessert sweet",
  "Dessert savory",
];

const DIETARY_TAGS = [
  "None",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Nut-Free",
  "Low-Carb",
  "High-Protein",
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
  const [selectedAllergen, setSelectedAllergen] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingCollections, setExistingCollections] = useState([]);
  const [existingCuisines, setExistingCuisines] = useState([]);
  const [existingEfforts, setExistingEfforts] = useState([]);
  const [existingAllergens, setExistingAllergens] = useState([]);
  const [searchByIngredient, setSearchByIngredient] = useState("");
  const cookbookName = searchParams.get("cookbook");
  const [selectedCookingMethod, setSelectedCookingMethod] = useState("");
  const [selectedRecipeType, setSelectedRecipeType] = useState("");
  const [selectedIngredientCategory, setSelectedIngredientCategory] =
    useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "Category");
      const querySnapshot = await getDocs(categoriesRef);
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(
        categoriesData.sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

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
    const matchesRecipeType =
      !selectedRecipeType || recipe.recipeType === selectedRecipeType;
    const matchesIngredientCategory =
      !selectedIngredientCategory ||
      recipe.ingredientCategory === selectedIngredientCategory;
    const matchesCategory =
      !selectedCategory ||
      (recipe.category &&
        recipe.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesCookbook =
      !selectedCollection || recipe.cookbook === selectedCollection;
    const matchesAuthor =
      !selectedAllergen || recipe.author === selectedAllergen;
    const matchesCookbookFilter =
      !cookbookName || recipe.cookbook === cookbookName;
    const matchesIngredient =
      !searchByIngredient ||
      (recipe.searchableIngredients &&
        recipe.searchableIngredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchByIngredient.toLowerCase())
        ));

    return (
      matchesSearch &&
      matchesCuisine &&
      matchesEffort &&
      matchesCookingMethod &&
      matchesRecipeType &&
      matchesIngredientCategory &&
      matchesCategory &&
      matchesCookbook &&
      matchesAuthor &&
      matchesCookbookFilter &&
      matchesIngredient
    );
  });

  const uniqueCookbooks = [
    ...new Set(recipes.map((recipe) => recipe.cookbook)),
  ];
  const uniqueAuthors = [...new Set(recipes.map((recipe) => recipe.author))];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recipe Book
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate("/recipe/new")}
          sx={{ mb: 2 }}
        >
          Add New Recipe
        </Button>
      </Box>

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
          <TextField
            fullWidth
            label="Search by Ingredient"
            value={searchByIngredient}
            onChange={(e) => setSearchByIngredient(e.target.value)}
            placeholder="Enter an ingredient"
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
            <InputLabel>Meal Type</InputLabel>
            <Select
              value={selectedRecipeType}
              label="Meal Type"
              onChange={(e) => setSelectedRecipeType(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {RECIPE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl fullWidth>
            <InputLabel>Food Group</InputLabel>
            <Select
              value={selectedIngredientCategory}
              label="Food Group"
              onChange={(e) => setSelectedIngredientCategory(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              {INGREDIENT_CATEGORIES.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
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
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <RecipeCard recipe={recipe} />
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
