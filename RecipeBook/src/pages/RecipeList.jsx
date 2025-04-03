import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  orderBy,
  where,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useFavorites } from "../contexts/FavoritesContext";
import { useAuth } from "../contexts/AuthContext";
import { cacheUtils } from "../utils/cache";
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
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Favorite,
  FavoriteBorder,
  Share as ShareIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";

// Predefined options for cuisine types
const CUISINE_TYPES = [
  "American",
  "Mexican",
  "Korean",
  "Chinese",
  "Lebanese",
  "Japanese",
  "Vietnamese",
  "Mediterranean",
  "Jewish",
  "Italian",
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
  "Protien",
  "Meat",
  "Soup",
  "Dip",
  "Beverage",
  "Grain",
  "Sauce",
  "Fruit",
  "Broth",
  "Oil",
  "Dessert sweet",
  "Dessert savory",
  "Fun drink",
  "Coffee drink",
  "Cocktail",
  "Other",
];

export default function RecipeList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { currentUser } = useAuth();
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
  const [existingRecipeTypes, setExistingRecipeTypes] = useState([]);
  const [existingCookingMethods, setExistingCookingMethods] = useState([]);
  const [existingIngredientCategories, setExistingIngredientCategories] =
    useState([]);
  const [searchByIngredient, setSearchByIngredient] = useState("");
  const cookbookName = searchParams.get("cookbook");
  const [selectedCookingMethod, setSelectedCookingMethod] = useState("");
  const [selectedRecipeType, setSelectedRecipeType] = useState("");
  const [selectedIngredientCategory, setSelectedIngredientCategory] =
    useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [imageRefreshMap, setImageRefreshMap] = useState({});

  // Define the order for effort levels
  const effortLevelOrder = [
    "Quick & Easy (Under 30 mins)",
    "Minimal Effort, Long Time (Set & Forget)",
    "Moderate Effort (30-60 mins)",
    "Active Cooking (1-2 hours)",
    "Project Cooking (2+ hours)",
    "Complex Recipe (Multiple Steps)",
    "Special Occasion (All Day Event)",
  ];

  // Function to normalize effort level by finding the closest match in the predefined order
  const normalizeEffortLevel = (effort) => {
    if (!effort) return "";

    // Check for exact match (case-insensitive)
    const exactMatch = effortLevelOrder.find(
      (orderedEffort) => orderedEffort.toLowerCase() === effort.toLowerCase()
    );

    if (exactMatch) {
      return exactMatch; // Return the properly cased version from the predefined order
    }

    // If no exact match, return the original effort level
    return effort;
  };

  // Function to sort effort levels according to the predefined order
  const sortEffortLevels = (efforts) => {
    return [...efforts].sort((a, b) => {
      // Find the closest match in the effortLevelOrder array (case-insensitive)
      const findClosestMatch = (effort) => {
        const lowerEffort = effort.toLowerCase();
        return effortLevelOrder.findIndex(
          (orderedEffort) => orderedEffort.toLowerCase() === lowerEffort
        );
      };

      const indexA = findClosestMatch(a);
      const indexB = findClosestMatch(b);

      // If both items are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one item is in the order array, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither item is in the order array, sort alphabetically
      return a.localeCompare(b);
    });
  };

  useEffect(() => {
    fetchRecipes();
    fetchCategories();
  }, []);

  const resetFilters = () => {
    setSearchTerm("");
    setSearchByIngredient("");
    setSelectedCuisine("");
    setSelectedEffort("");
    setSelectedAllergen("");
    setSelectedCollection("");
    setSelectedCookingMethod("");
    setSelectedRecipeType("");
    setSelectedIngredientCategory("");
    setSelectedCategory("");
  };

  const fetchRecipes = async () => {
    try {
      // Try to get recipes from cache first
      const cachedRecipes = cacheUtils.getCache("recipe_cache_all");
      const lastUpdated = cacheUtils.getLastUpdated("recipe_cache_all");

      if (cachedRecipes) {
        // Process cached recipes to ensure image URLs are properly preserved
        const processedCachedRecipes = cachedRecipes.map((recipe) => {
          // If the recipe has an imageUrl, make sure it's properly preserved
          if (recipe.imageUrl) {
            // Check if it's a Firebase Storage URL
            if (recipe.imageUrl.includes("firebasestorage.googleapis.com")) {
              // Always mark Firebase Storage URLs for refresh to ensure we have valid tokens
              return {
                ...recipe,
                imageUrlNeedsRefresh: true,
              };
            }
            // For non-Firebase URLs, keep as is
            return recipe;
          }
          return recipe;
        });

        setRecipes(processedCachedRecipes);

        // Extract tags from cached recipes
        const tagsSet = new Set();
        processedCachedRecipes.forEach((recipe) => {
          if (recipe.tags && Array.isArray(recipe.tags)) {
            recipe.tags.forEach((tag) => tagsSet.add(tag));
          }
        });
        setExistingTags(Array.from(tagsSet).sort());

        // Extract unique effort levels for debugging
        const effortSet = new Set();
        processedCachedRecipes.forEach((recipe) => {
          if (recipe.effort) {
            // Normalize effort level by finding the closest match in the predefined order
            const normalizedEffort = normalizeEffortLevel(recipe.effort);
            effortSet.add(normalizedEffort);
          }
        });
        console.log("Unique effort levels in recipes:", Array.from(effortSet));
        // Sort effort levels according to the predefined order
        setExistingEfforts(sortEffortLevels(Array.from(effortSet)));

        // Extract unique recipe types
        const recipeTypeSet = new Set();
        processedCachedRecipes.forEach((recipe) => {
          if (recipe.recipeType) {
            recipeTypeSet.add(recipe.recipeType);
          }
        });
        console.log(
          "Unique recipe types in recipes:",
          Array.from(recipeTypeSet)
        );
        setExistingRecipeTypes(Array.from(recipeTypeSet).sort());

        // Extract unique cooking methods
        const cookingMethodSet = new Set();
        processedCachedRecipes.forEach((recipe) => {
          if (recipe.cookingMethod) {
            cookingMethodSet.add(recipe.cookingMethod);
          }
        });
        console.log(
          "Unique cooking methods in recipes:",
          Array.from(cookingMethodSet)
        );
        setExistingCookingMethods(Array.from(cookingMethodSet).sort());

        // Extract unique cuisine types
        const cuisineTypeSet = new Set();
        processedCachedRecipes.forEach((recipe) => {
          if (recipe.cuisineType) {
            cuisineTypeSet.add(recipe.cuisineType);
          }
        });
        console.log(
          "Unique cuisine types in recipes:",
          Array.from(cuisineTypeSet)
        );
        setExistingCuisines(Array.from(cuisineTypeSet).sort());

        // Extract unique ingredient categories
        const ingredientCategorySet = new Set();
        processedCachedRecipes.forEach((recipe) => {
          if (recipe.ingredientCategory) {
            ingredientCategorySet.add(recipe.ingredientCategory);
          }
        });
        console.log(
          "Unique ingredient categories in recipes:",
          Array.from(ingredientCategorySet)
        );
        setExistingIngredientCategories(
          Array.from(ingredientCategorySet).sort()
        );

        // Check for new recipes since last update
        if (lastUpdated) {
          const newRecipesQuery = query(
            collection(db, "recipes"),
            where("createdAt", ">", new Date(lastUpdated).toISOString()),
            orderBy("createdAt", "desc")
          );

          const newRecipesSnapshot = await getDocs(newRecipesQuery);

          if (!newRecipesSnapshot.empty) {
            const newRecipes = newRecipesSnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            // Combine new recipes with cached recipes
            const updatedRecipes = [...newRecipes, ...processedCachedRecipes];

            // Update cache with combined data
            cacheUtils.setCache("recipe_cache_all", updatedRecipes);

            // Update state with combined data
            setRecipes(updatedRecipes);

            // Update tags with new recipes
            newRecipes.forEach((recipe) => {
              if (recipe.tags && Array.isArray(recipe.tags)) {
                recipe.tags.forEach((tag) => tagsSet.add(tag));
              }
            });
            setExistingTags(Array.from(tagsSet).sort());
          }
        }

        setLoading(false);
        return;
      }

      // If not in cache, fetch from Firestore
      const q = query(collection(db, "recipes"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const recipesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache the recipes data
      cacheUtils.setCache("recipe_cache_all", recipesData);

      // Extract all unique tags
      const tagsSet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.tags && Array.isArray(recipe.tags)) {
          recipe.tags.forEach((tag) => tagsSet.add(tag));
        }
      });
      setExistingTags(Array.from(tagsSet).sort());

      // Extract unique effort levels for debugging
      const effortSet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.effort) {
          // Normalize effort level by finding the closest match in the predefined order
          const normalizedEffort = normalizeEffortLevel(recipe.effort);
          effortSet.add(normalizedEffort);
        }
      });
      console.log("Unique effort levels in recipes:", Array.from(effortSet));
      // Sort effort levels according to the predefined order
      setExistingEfforts(sortEffortLevels(Array.from(effortSet)));

      // Extract unique recipe types
      const recipeTypeSet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.recipeType) {
          recipeTypeSet.add(recipe.recipeType);
        }
      });
      console.log("Unique recipe types in recipes:", Array.from(recipeTypeSet));
      setExistingRecipeTypes(Array.from(recipeTypeSet).sort());

      // Extract unique cooking methods
      const cookingMethodSet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.cookingMethod) {
          cookingMethodSet.add(recipe.cookingMethod);
        }
      });
      console.log(
        "Unique cooking methods in recipes:",
        Array.from(cookingMethodSet)
      );
      setExistingCookingMethods(Array.from(cookingMethodSet).sort());

      // Extract unique cuisine types
      const cuisineTypeSet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.cuisineType) {
          cuisineTypeSet.add(recipe.cuisineType);
        }
      });
      console.log(
        "Unique cuisine types in recipes:",
        Array.from(cuisineTypeSet)
      );
      setExistingCuisines(Array.from(cuisineTypeSet).sort());

      // Extract unique ingredient categories
      const ingredientCategorySet = new Set();
      recipesData.forEach((recipe) => {
        if (recipe.ingredientCategory) {
          ingredientCategorySet.add(recipe.ingredientCategory);
        }
      });
      console.log(
        "Unique ingredient categories in recipes:",
        Array.from(ingredientCategorySet)
      );
      setExistingIngredientCategories(Array.from(ingredientCategorySet).sort());

      setRecipes(recipesData);
      setError("");
    } catch (error) {
      setError("Failed to fetch recipes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Try to get categories from cache first
      const cachedCategories = cacheUtils.getCache("recipe_cache_categories");
      if (cachedCategories) {
        setCategories(
          cachedCategories.sort((a, b) => a.name.localeCompare(b.name))
        );
        return;
      }

      // If not in cache, fetch from Firestore
      const categoriesRef = collection(db, "Category");
      const querySnapshot = await getDocs(categoriesRef);
      const categoriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache the categories data
      cacheUtils.setCache("recipe_cache_categories", categoriesData);

      setCategories(
        categoriesData.sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
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

  const handleShare = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setShowShareNotification(true);
    });
  };

  // Function to refresh a single recipe's image URL
  const refreshRecipeImage = async (recipeId) => {
    try {
      console.log(`Refreshing image for recipe ${recipeId}`);

      // Get the latest recipe data from Firestore
      const recipeDoc = await getDoc(doc(db, "recipes", recipeId));
      if (recipeDoc.exists()) {
        const recipeData = recipeDoc.data();

        // Check if the recipe has an image URL
        if (!recipeData.imageUrl) {
          console.log(`Recipe ${recipeId} has no image URL in Firestore`);
          return;
        }

        console.log(
          `New image URL for recipe ${recipeId}: ${recipeData.imageUrl}`
        );

        // Update the image URL in the recipes state
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe) =>
            recipe.id === recipeId
              ? {
                  ...recipe,
                  imageUrl: recipeData.imageUrl,
                  imageUrlNeedsRefresh: false,
                }
              : recipe
          )
        );

        // Update the image refresh map
        setImageRefreshMap((prev) => ({
          ...prev,
          [recipeId]: recipeData.imageUrl,
        }));

        // Update the cache with the new image URL
        const cachedRecipes = cacheUtils.getCache("recipe_cache_all");
        if (cachedRecipes) {
          const updatedCachedRecipes = cachedRecipes.map((recipe) =>
            recipe.id === recipeId
              ? {
                  ...recipe,
                  imageUrl: recipeData.imageUrl,
                  imageUrlNeedsRefresh: false,
                }
              : recipe
          );
          cacheUtils.setCache("recipe_cache_all", updatedCachedRecipes);
        }
      } else {
        console.log(`Recipe ${recipeId} not found in Firestore`);
      }
    } catch (error) {
      console.error("Error refreshing recipe image:", error);
    }
  };

  // Function to handle image error
  const handleImageError = (recipeId) => {
    console.log(`Image error for recipe ${recipeId}`);

    // Always try to refresh the image, even if we've tried before
    // This is more aggressive but should help with expired tokens
    console.log(`Attempting to refresh image for recipe ${recipeId}`);
    refreshRecipeImage(recipeId);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
            Recipe Book
          </Typography>
          <IconButton onClick={handleShare} title="Share Recipe List">
            <ShareIcon />
          </IconButton>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => {
              // Clear the recipe cache
              cacheUtils.clearCache("recipe_cache_all");
              // Fetch fresh data
              fetchRecipes();
            }}
            title="Refresh all recipes and clear cache"
          >
            Refresh Data
          </Button>
        </Box>
        {currentUser && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/recipe/new")}
            sx={{ mb: 2 }}
          >
            Add New Recipe
          </Button>
        )}
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
              {existingCuisines.length > 0
                ? existingCuisines.map((cuisine) => (
                    <MenuItem key={cuisine} value={cuisine}>
                      {cuisine}
                    </MenuItem>
                  ))
                : CUISINE_TYPES.map((cuisine) => (
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
              {/* Create a Set of all effort levels to prevent duplicates */}
              {Array.from(
                new Set([
                  ...effortLevelOrder,
                  ...existingEfforts.filter(
                    (effort) => !effortLevelOrder.includes(effort)
                  ),
                ])
              ).map((effort) => (
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
              {existingCookingMethods.length > 0
                ? existingCookingMethods.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))
                : COOKING_METHODS.map((method) => (
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
              {existingRecipeTypes.length > 0
                ? existingRecipeTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))
                : RECIPE_TYPES.map((type) => (
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
              {existingIngredientCategories.length > 0
                ? existingIngredientCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))
                : INGREDIENT_CATEGORIES.map((category) => (
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
        <Grid
          item
          xs={12}
          sx={{ display: "flex", justifyContent: "center", mt: 2 }}
        >
          <Button
            variant="outlined"
            color="secondary"
            onClick={resetFilters}
            startIcon={<RefreshIcon />}
          >
            Reset All Filters
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {filteredRecipes.map((recipe) => (
          <Grid item key={recipe.id} xs={12} sm={6} md={4}>
            <RecipeCard
              recipe={recipe}
              onImageError={() => handleImageError(recipe.id)}
            />
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

      <Snackbar
        open={showShareNotification}
        autoHideDuration={3000}
        onClose={() => setShowShareNotification(false)}
        message="Recipe list link copied to clipboard!"
      />
    </Container>
  );
}
