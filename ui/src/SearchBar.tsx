import React from "react";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";

const SearchBar: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "8px",
      }}
    >
      <TextField
        InputProps={{
          placeholder: "Search...",
          sx: { height: "50px" },
          startAdornment: <SearchIcon sx={{ marginRight: "8px" }} />,
        }}
        sx={{ backgroundColor: "white", width: "300px" }}
      />
    </Box>
  );
};

export default SearchBar;
