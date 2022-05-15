import React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import Providers from "./Providers";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import Button from "@mui/material/Button";
import PlaylistAddCheckCircleIcon from "@mui/icons-material/PlaylistAddCheckCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

interface AppProps {}

const SearchBar = () => {
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

const SelectView = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{ paddingLeft: "16px", paddingRight: "16px" }}
    >
      <Button>
        <CheckCircleIcon sx={{ color: "black", marginRight: "8px" }} />
        <Typography color="black">Results</Typography>
      </Button>
      <Button>
        <PlaylistAddCheckCircleIcon
          sx={{ color: "black", marginRight: "8px" }}
        />
        <Typography color="black">Strategy</Typography>
      </Button>
      <Button>
        <PlayCircleIcon sx={{ color: "black", marginRight: "8px" }} />
        <Typography color="black">Run</Typography>
      </Button>
    </Box>
  );
};

const App: React.FC<AppProps> = () => {
  return (
    <Providers>
      <Box display="flex" flexDirection="column" width="100%">
        <AppBar
          position="static"
          sx={{ backgroundColor: "white", color: "black" }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-around">
            <SelectView />
            <SearchBar />
          </Box>
        </AppBar>
      </Box>
    </Providers>
  );
};

export default App;
