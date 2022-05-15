import React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import SelectView from "./SelectView";
import SearchBar from "./SearchBar";
import Providers from "./Providers";
import AppGateway from "./AppGateway";

interface AppProps {}

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
        <AppGateway />
      </Box>
    </Providers>
  );
};

export default App;
