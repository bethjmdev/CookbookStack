import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { storage, db } from "../firebase/config";
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
import { useAuth } from "../contexts/AuthContext";

// Predefined options for cuisine types and common ingredients
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

const COMMON_INGREDIENTS = [
  "Chicken",
  "Beef",
  "Fish",
  "Eggplant",
  "Potato",
  "Carrot",
  "Tomato",
  "Cabbage",
  "Mushroom",
  "Pasta",
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

export default function RecipeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [cookbook, setCookbook] = useState("");
  const [author, setAuthor] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [newIngredient, setNewIngredient] = useState("");
  const [instructions, setInstructions] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingCookbooks, setExistingCookbooks] = useState([]);
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [duplicateAlert, setDuplicateAlert] = useState("");
  const [effort, setEffort] = useState("");
  const [searchableIngredients, setSearchableIngredients] = useState([]);
  const [cookingMethod, setCookingMethod] = useState("");
  const [recipeType, setRecipeType] = useState("");
  const [ingredientCategory, setIngredientCategory] = useState("");
  const [category, setCategory] = useState("");
  const [existingCategories, setExistingCategories] = useState([]);
  const [existingAuthors, setExistingAuthors] = useState([]);

  // Helper function to normalize strings
  const normalizeString = (str) => {
    return str.trim().toLowerCase();
  };

  // Helper function to capitalize first letter of each word
  const capitalizeWords = (str) => {
    return str
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to check for similar entries
  const findSimilarEntry = (value, existingValues) => {
    const normalizedValue = normalizeString(value);
    return existingValues.find(
      (existing) => normalizeString(existing) === normalizedValue
    );
  };

  useEffect(() => {
    // Fetch existing data from recipes
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

    // Fetch categories from Category collection
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "Category");
        const q = query(categoriesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExistingCategories(categoriesData.map((cat) => cat.name).sort());
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchExistingData();
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchExistingCookbooks = async () => {
      try {
        const cookbooksRef = collection(db, "Cookbook");
        const q = query(cookbooksRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const cookbooksData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return data.displayName || capitalizeWords(data.name);
        });
        // Remove duplicates by normalizing names
        const uniqueCookbooks = Array.from(
          new Set(cookbooksData.map(normalizeString))
        );
        setExistingCookbooks(uniqueCookbooks);
      } catch (error) {
        console.error("Error fetching existing cookbooks:", error);
      }
    };

    const fetchExistingAuthors = async () => {
      try {
        const authorsRef = collection(db, "Author");
        const querySnapshot = await getDocs(authorsRef);
        const authorsData = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return data.displayName || capitalizeWords(data.name);
        });
        // Remove duplicates by normalizing names
        const uniqueAuthors = Array.from(
          new Set(authorsData.map(normalizeString))
        );
        setExistingAuthors(uniqueAuthors);
      } catch (error) {
        console.error("Error fetching existing authors:", error);
      }
    };

    const fetchExistingCategories = async () => {
      try {
        const categoriesRef = collection(db, "Category");
        const q = query(categoriesRef, where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const categoriesData = querySnapshot.docs.map((doc) => doc.data().name);
        setExistingCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching existing categories:", error);
      }
    };

    fetchExistingCookbooks();
    fetchExistingAuthors();
    fetchExistingCategories();
  }, [user.uid]);

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
        searchableIngredients
      );

      if (similarIngredient) {
        setDuplicateAlert(
          `Similar ingredient "${similarIngredient}" already exists.`
        );
        return;
      }

      setSearchableIngredients([
        ...searchableIngredients,
        normalizedIngredient,
      ]);
      setNewIngredient("");
      setDuplicateAlert("");
    }
  };

  const handleRemoveIngredient = (ingredient) => {
    setSearchableIngredients(
      searchableIngredients.filter((i) => i !== ingredient)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Check for duplicate recipe names
      const recipesRef = collection(db, "recipes");
      const q = query(
        recipesRef,
        where("userId", "==", user.uid),
        where("title", "==", title.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError(
          "A recipe with this name already exists. Please choose a different name."
        );
        setLoading(false);
        return;
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
        setLoading(false);
        return;
      }

      // Save the cookbook to the Cookbook collection if it doesn't exist
      if (cookbook) {
        const cookbooksRef = collection(db, "Cookbook");
        const normalizedCookbook = cookbook.trim().toLowerCase();
        const displayName = capitalizeWords(cookbook);

        // Check for existing cookbook with either the normalized name or display name
        const cookbookQuery = query(
          cookbooksRef,
          where("userId", "==", user.uid),
          where("name", "==", normalizedCookbook)
        );
        const cookbookSnapshot = await getDocs(cookbookQuery);

        if (cookbookSnapshot.empty) {
          await addDoc(cookbooksRef, {
            name: normalizedCookbook,
            displayName: displayName,
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Save the author to the Author collection if it doesn't exist
      if (author) {
        const authorsRef = collection(db, "Author");
        const normalizedAuthor = author.trim().toLowerCase();
        const authorQuery = query(
          authorsRef,
          where("name", "==", normalizedAuthor)
        );
        const authorSnapshot = await getDocs(authorQuery);

        if (authorSnapshot.empty) {
          await addDoc(authorsRef, {
            name: normalizedAuthor,
            displayName: capitalizeWords(author),
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }

      // Save the category to the Category collection if it doesn't exist
      if (category) {
        const categoriesRef = collection(db, "Category");
        const normalizedCategory = category.trim().toLowerCase();
        const categoryQuery = query(
          categoriesRef,
          where("name", "==", normalizedCategory),
          where("userId", "==", user.uid)
        );
        const categorySnapshot = await getDocs(categoryQuery);

        if (categorySnapshot.empty) {
          await addDoc(categoriesRef, {
            name: normalizedCategory,
            displayName: capitalizeWords(category),
            userId: user.uid,
            createdAt: new Date().toISOString(),
          });
        }
      }

      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `recipes/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const recipeData = {
        userId: user.uid,
        title: title.trim().toLowerCase(),
        cookbook: cookbook.trim().toLowerCase(),
        author: author.trim().toLowerCase(),
        category: category.trim().toLowerCase(),
        cuisineType: cuisineType.toLowerCase(),
        effort: effort.toLowerCase(),
        cookingMethod: cookingMethod.toLowerCase(),
        recipeType: recipeType.toLowerCase(),
        ingredientCategory: ingredientCategory.toLowerCase(),
        ingredients: ingredients.toLowerCase(),
        searchableIngredients: searchableIngredients.map((i) =>
          i.trim().toLowerCase()
        ),
        instructions: instructions.toLowerCase(),
        imageUrl,
        tags: tags.map((t) => t.trim().toLowerCase()),
        createdAt: new Date().toISOString(),
        isFavorite: false,
      };

      await addDoc(collection(db, "recipes"), recipeData);
      navigate("/recipes");
    } catch (error) {
      setError("Failed to save recipe. Please try again.");
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Recipe
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

        <Box
          component="form"
          onSubmit={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.type !== "textarea") {
              e.preventDefault();
            }
          }}
        >
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
              <TextField
                required
                fullWidth
                label="Cookbook Name"
                value={cookbook}
                onChange={(e) => setCookbook(e.target.value)}
              />
              <Autocomplete
                options={existingCookbooks}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Cookbook"
                    variant="outlined"
                  />
                )}
                onChange={(event, newValue) => {
                  setCookbook(newValue || cookbook);
                }}
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
              <Autocomplete
                options={existingAuthors}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Author"
                    variant="outlined"
                  />
                )}
                onChange={(event, newValue) => {
                  setAuthor(newValue || author);
                }}
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
              <TextField
                required
                fullWidth
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Autocomplete
                options={existingCategories}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Category"
                    variant="outlined"
                  />
                )}
                onChange={(event, newValue) => {
                  setCategory(newValue || category);
                }}
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
                <TextField
                  fullWidth
                  value={newIngredient}
                  onChange={(e) => setNewIngredient(e.target.value)}
                  label="Add Searchable Ingredient"
                  placeholder="Type an ingredient and press Enter or click +"
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
              <TextField
                fullWidth
                type="file"
                onChange={handleImageChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{
                  accept: "image/*",
                }}
                helperText="Optional: Add a photo of your recipe (JPG, PNG, GIF)"
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
                <Button variant="outlined" onClick={() => navigate("/recipes")}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? "Saving..." : "Save Recipe"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
