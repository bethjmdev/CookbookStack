import React, { useState, useEffect } from "react";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function Cookbooks() {
  const navigate = useNavigate();
  const [cookbooks, setCookbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCookbooks();
  }, []);

  const fetchCookbooks = async () => {
    try {
      const q = query(collection(db, "recipes"));
      const querySnapshot = await getDocs(q);

      // Aggregate cookbooks from recipes
      const cookbookMap = new Map();

      querySnapshot.docs.forEach((doc) => {
        const recipe = doc.data();
        const cookbookName = recipe.cookbook || "Uncategorized";

        if (!cookbookMap.has(cookbookName)) {
          cookbookMap.set(cookbookName, {
            name: cookbookName,
            recipeCount: 0,
            recipes: [],
          });
        }

        const cookbook = cookbookMap.get(cookbookName);
        cookbook.recipeCount++;
        cookbook.recipes.push({
          id: doc.id,
          ...recipe,
        });
      });

      // Convert map to array and sort by name
      const cookbooksArray = Array.from(cookbookMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setCookbooks(cookbooksArray);
      setError("");
    } catch (error) {
      setError("Failed to fetch cookbooks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
          My Cookbooks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/recipe/new")}
        >
          Add New Recipe
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {cookbooks.map((cookbook) => (
          <Grid item key={cookbook.name} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                cursor: "pointer",
                "&:hover": {
                  boxShadow: 6,
                },
              }}
              onClick={() =>
                navigate(
                  `/recipes?cookbook=${encodeURIComponent(cookbook.name)}`
                )
              }
            >
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {cookbook.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {cookbook.recipeCount}{" "}
                  {cookbook.recipeCount === 1 ? "recipe" : "recipes"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {cookbooks.length === 0 && !loading && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No cookbooks found. Add a recipe to create your first cookbook!
          </Typography>
        </Box>
      )}
    </Container>
  );
}
