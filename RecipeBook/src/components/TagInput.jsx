import React from "react";
import { Autocomplete, Chip, TextField } from "@mui/material";

export default function TagInput({ value, onChange, existingTags = [] }) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={existingTags}
      value={value}
      onChange={(event, newValue) => {
        // Convert all tags to lowercase for consistency
        const formattedTags = newValue.map((tag) =>
          typeof tag === "string" ? tag.toLowerCase() : tag
        );
        onChange(formattedTags);
      }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            label={option}
            {...getTagProps({ index })}
            color="primary"
            variant="outlined"
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          label="Tags"
          placeholder="Add tags"
          helperText="Press enter to add a new tag"
          fullWidth
        />
      )}
    />
  );
}
