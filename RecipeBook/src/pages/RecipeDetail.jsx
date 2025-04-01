          <Typography variant="h6" gutterBottom>
            Categories
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {recipe.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                variant="outlined"
                color="primary"
              />
            ))}
          </Box> 