import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Alert,
  Autocomplete,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { storage } from "../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../contexts/AuthContext";

// Import the same constants from RecipeForm
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

const COMMON_INGREDIENTS = [
  "Salt",
  "Pepper",
  "Olive Oil",
  "Garlic",
  "Onion",
  "Butter",
  "Flour",
  "Sugar",
  "Eggs",
  "Milk",
  "Rice",
  "Pasta",
  "Tomatoes",
  "Cheese",
  "Chicken",
  "Beef",
  "Fish",
  "Vegetables",
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

const COOKING_METHODS = [
  "Stovetop Cooking",
  "Oven Cooking",
  "Bread Baking",
  "Dessert Baking",
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

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [cookbook, setCookbook] = useState("");
  const [author, setAuthor] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tags, setTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingCookbooks, setExistingCookbooks] = useState([]);
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [duplicateAlert, setDuplicateAlert] = useState("");
  const [dietaryTags, setDietaryTags] = useState([]);
  const [effort, setEffort] = useState("");
  const [searchableIngredients, setSearchableIngredients] = useState([]);
  const [cookingMethod, setCookingMethod] = useState("");
  const [recipeType, setRecipeType] = useState("");
  const [ingredientCategory, setIngredientCategory] = useState("");
  const [category, setCategory] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);

  useEffect(() => {
    fetchRecipe();
    fetchExistingData();
    fetchCategories();
  }, [id]);

  const fetchRecipe = async () => {
    try {
      const docRef = doc(db, "recipes", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const recipeData = docSnap.data();
        setTitle(recipeData.title || "");
        setCookbook(recipeData.cookbook || "");
        setAuthor(recipeData.author || "");
        setCuisineType(recipeData.cuisineType || "");
        setIngredients(recipeData.ingredients || []);
        setInstructions(recipeData.instructions || "");
        setImagePreview(recipeData.imageUrl || "");
        setTags(recipeData.tags || []);
        setDietaryTags(recipeData.dietaryTags || []);
        setEffort(recipeData.effort || "");
        setSearchableIngredients(recipeData.searchableIngredients || []);
        setCookingMethod(recipeData.cookingMethod || "");
        setRecipeType(recipeData.recipeType || "");
        setIngredientCategory(recipeData.ingredientCategory || "");
        setCategory(recipeData.category || "");
      } else {
        setError("Recipe not found");
      }
    } catch (error) {
      setError("Failed to fetch recipe. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const tagsSet = new Set();
      const cookbooksSet = new Set();
      const ingredientsSet = new Set();

      querySnapshot.docs.forEach((doc) => {
        const recipe = doc.data();
        if (recipe.tags && Array.isArray(recipe.tags)) {
          recipe.tags.forEach((tag) => tagsSet.add(tag));
        }
        if (recipe.cookbook) {
          cookbooksSet.add(recipe.cookbook);
        }
        if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach((ingredient) =>
            ingredientsSet.add(ingredient)
          );
        }
      });

      setExistingTags(Array.from(tagsSet).sort());
      setExistingCookbooks(Array.from(cookbooksSet).sort());
      setExistingIngredients(Array.from(ingredientsSet).sort());
    } catch (error) {
      console.error("Error fetching existing data:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesRef = collection(db, "Category");
      const querySnapshot = await getDocs(categoriesRef);
      const categories = querySnapshot.docs.map((doc) => doc.data().name);
      setExistingCategories(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient) {
      const normalizedIngredient = newIngredient.trim();
      const similarIngredient = findSimilarEntry(
        normalizedIngredient,
        ingredients
      );

      if (similarIngredient) {
        setDuplicateAlert(
          `Similar ingredient "${similarIngredient}" already exists.`
        );
        return;
      }

      setIngredients([...ingredients, normalizedIngredient]);
      setNewIngredient("");
      setDuplicateAlert("");
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setIngredients(ingredients.filter((i) => i !== ingredient));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDuplicateAlert("");
    setSaving(true);

    try {
      // Check for duplicate recipe names (excluding the current recipe)
      const recipesRef = collection(db, "recipes");
      const q = query(
        recipesRef,
        where("userId", "==", user.uid),
        where("title", "==", title.trim())
      );
      const querySnapshot = await getDocs(q);

      const duplicateRecipe = querySnapshot.docs.find((doc) => doc.id !== id);
      if (duplicateRecipe) {
        setError(
          "A recipe with this name already exists. Please choose a different name."
        );
        setLoading(false);
        setSaving(false);
        return;
      }

      // Save category to Category collection if it doesn't exist
      if (category) {
        const categoriesRef = collection(db, "Category");
        const categoryQuery = query(
          categoriesRef,
          where("name", "==", category.toLowerCase())
        );
        const categorySnapshot = await getDocs(categoryQuery);

        if (categorySnapshot.empty) {
          await addDoc(categoriesRef, {
            name: category.toLowerCase(),
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Check for duplicate ingredients
      const duplicateIngredients = searchableIngredients.filter(
        (ingredient, index) => {
          const normalizedIngredient = normalizeString(ingredient);
          return (
            searchableIngredients.findIndex(
              (i) => normalizeString(i) === normalizedIngredient
            ) !== index
          );
        }
      );

      if (duplicateIngredients.length > 0) {
        setDuplicateAlert(
          `Duplicate ingredients found: ${duplicateIngredients.join(", ")}`
        );
        setSaving(false);
        return;
      }

      let imageUrl = imagePreview; // Keep existing image if no new one is uploaded
      if (image) {
        const storageRef = ref(storage, `recipes/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const recipeData = {
        title,
        cookbook: cookbook.trim(),
        author,
        cuisineType,
        ingredients: ingredients.map((i) => i.trim()),
        instructions,
        imageUrl,
        tags: tags.map((t) => t.trim()),
        dietaryTags,
        effort,
        cookingMethod,
        searchableIngredients: searchableIngredients.map((i) => i.trim()),
        lastModified: new Date().toISOString(),
        recipeType,
        ingredientCategory,
        category: category ? category.toLowerCase() : "", // Save category in lowercase
        isFavorite: recipeData.isFavorite,
      };

      await updateDoc(doc(db, "recipes", id), recipeData);
      navigate(`/recipe/${id}`);
    } catch (error) {
      setError("Failed to update recipe. Please try again.");
    }
    setSaving(false);
    setLoading(false);
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
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Recipe
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {duplicateAlert && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {duplicateAlert}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Recipe Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={existingCookbooks}
                value={cookbook}
                onChange={(event, newValue) => setCookbook(newValue)}
                renderInput={(params) => (
                  <TextField {...params} required label="Cookbook Name" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={CUISINE_TYPES}
                value={cuisineType}
                onChange={(event, newValue) => setCuisineType(newValue)}
                renderInput={(params) => (
                  <TextField {...params} required label="Cuisine Type" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                options={EFFORT_LEVELS}
                value={effort}
                onChange={(event, newValue) => setEffort(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Effort Level" />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Cooking Method</InputLabel>
                <Select
                  value={cookingMethod}
                  label="Cooking Method"
                  onChange={(e) => setCookingMethod(e.target.value)}
                >
                  {COOKING_METHODS.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Meal Type</InputLabel>
                <Select
                  value={recipeType}
                  label="Meal Type"
                  onChange={(e) => setRecipeType(e.target.value)}
                >
                  {RECIPE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Food Group</InputLabel>
                <Select
                  value={ingredientCategory}
                  label="Food Group"
                  onChange={(e) => setIngredientCategory(e.target.value)}
                >
                  {INGREDIENT_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Autocomplete
                freeSolo
                options={existingCategories}
                value={category}
                onChange={(event, newValue) => setCategory(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Category"
                    placeholder="Enter or select a category"
                    helperText="This will be used for filtering recipes"
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Dietary Requirements</InputLabel>
                <Select
                  multiple
                  value={dietaryTags}
                  label="Dietary Requirements"
                  onChange={(e) => setDietaryTags(e.target.value)}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {DIETARY_TAGS.map((tag) => (
                    <MenuItem key={tag} value={tag}>
                      {tag}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Recipe Details
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Ingredients List (with measurements)"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Enter ingredients with their measurements, one per line. Example:
2 cups all-purpose flour
1 teaspoon salt
3 tablespoons olive oil
2 cloves garlic, minced"
                helperText="Enter each ingredient on a new line with its measurement (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={10}
                label="Instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter the recipe instructions step by step"
                helperText="Enter each step on a new line (optional)"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Searchable Ingredients
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add ingredients that you want to be able to search for this
                recipe by (optional)
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Autocomplete
                  freeSolo
                  options={[...COMMON_INGREDIENTS, ...existingIngredients]}
                  value={newIngredient}
                  onChange={(event, newValue) => {
                    if (newValue && !searchableIngredients.includes(newValue)) {
                      setSearchableIngredients([
                        ...searchableIngredients,
                        newValue,
                      ]);
                      setNewIngredient("");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Add Searchable Ingredient" />
                  )}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={handleAddIngredient} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {searchableIngredients.map((ingredient) => (
                  <Chip
                    key={ingredient}
                    label={ingredient}
                    onDelete={() => handleRemoveIngredient(ingredient)}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="file"
                onChange={handleImageChange}
                InputLabelProps={{ shrink: true }}
                helperText="Optional: Add a photo of your recipe"
              />
            </Grid>

            {imagePreview && (
              <Grid item xs={12}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: 300,
                    objectFit: "contain",
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/recipe/${id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
