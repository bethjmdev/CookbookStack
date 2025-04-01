import React, { createContext, useContext, useState, useEffect } from "react";
import {
  doc,
  updateDoc,
  query,
  collection,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export function useFavorites() {
  return useContext(FavoritesContext);
}

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();

  // Set up real-time listener for favorites
  useEffect(() => {
    if (!user) {
      setFavorites([]);
      return;
    }

    // Create query for user's favorite recipes
    const q = query(
      collection(db, "recipes"),
      where("userId", "==", user.uid),
      where("isFavorite", "==", true)
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const favoritesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFavorites(favoritesData);
      },
      (error) => {
        console.error("Error listening to favorites:", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user]);

  const addToFavorites = async (recipe) => {
    if (!user) return;

    try {
      const recipeRef = doc(db, "recipes", recipe.id);
      await updateDoc(recipeRef, {
        isFavorite: true,
        userId: user.uid, // Add userId when favoriting
      });
    } catch (error) {
      console.error("Error adding to favorites:", error);
    }
  };

  const removeFromFavorites = async (recipeId) => {
    if (!user) return;

    try {
      const recipeRef = doc(db, "recipes", recipeId);
      await updateDoc(recipeRef, {
        isFavorite: false,
      });
    } catch (error) {
      console.error("Error removing from favorites:", error);
    }
  };

  const isFavorite = (recipeId) => {
    return favorites.some((recipe) => recipe.id === recipeId);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
