import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, getDocs } from "firebase/firestore";
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
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import TagInput from "../components/TagInput";

// Predefined options for cuisine types and common ingredients
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

export default function RecipeForm() {
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [existingCookbooks, setExistingCookbooks] = useState([]);
  const [existingIngredients, setExistingIngredients] = useState([]);
  const [duplicateAlert, setDuplicateAlert] = useState("");

  // Helper function to normalize strings
  const normalizeString = (str) => {
    return str.trim().toLowerCase();
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

    fetchExistingData();
  }, []);

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
    setError("");
    setDuplicateAlert("");
    setLoading(true);

    try {
      // Check for duplicate cookbook
      const similarCookbook = findSimilarEntry(cookbook, existingCookbooks);
      if (similarCookbook && similarCookbook !== cookbook) {
        setDuplicateAlert(
          `Similar cookbook "${similarCookbook}" already exists.`
        );
        setLoading(false);
        return;
      }

      // Check for duplicate ingredients
      const duplicateIngredients = ingredients.filter((ingredient, index) => {
        const normalizedIngredient = normalizeString(ingredient);
        return (
          ingredients.findIndex(
            (i) => normalizeString(i) === normalizedIngredient
          ) !== index
        );
      });

      if (duplicateIngredients.length > 0) {
        setDuplicateAlert(
          `Duplicate ingredients found: ${duplicateIngredients.join(", ")}`
        );
        setLoading(false);
        return;
      }

      let imageUrl = "";
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
        createdAt: new Date().toISOString(),
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
              <Box sx={{ display: "flex", gap: 1 }}>
                <Autocomplete
                  freeSolo
                  options={[...COMMON_INGREDIENTS, ...existingIngredients]}
                  value={newIngredient}
                  onChange={(event, newValue) => {
                    if (newValue && !ingredients.includes(newValue)) {
                      setIngredients([...ingredients, newValue]);
                      setNewIngredient("");
                    }
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Add Ingredient" />
                  )}
                  sx={{ flex: 1 }}
                />
                <IconButton onClick={handleAddIngredient} color="primary">
                  <AddIcon />
                </IconButton>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {ingredients.map((ingredient) => (
                  <Box
                    key={ingredient}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      bgcolor: "primary.light",
                      color: "white",
                      px: 2,
                      py: 1,
                      borderRadius: 1,
                    }}
                  >
                    {ingredient}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveIngredient(ingredient)}
                      sx={{ ml: 1, color: "white" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TagInput
                value={tags}
                onChange={setTags}
                existingTags={existingTags}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={6}
                label="Instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imagePreview && (
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Recipe preview"
                  sx={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Recipe"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
