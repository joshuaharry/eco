import React from "react";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/system";
import Providers from "./Providers";

interface AppProps {}

const App: React.FC<AppProps> = () => {
  const theme = useTheme();
  console.log(theme);
  return (
    <Providers>
      <Box display="flex" flexDirection="column" width="100%">
        <AppBar position="static">
          <Box display="flex">
            <Typography fontWeight="bold" fontSize="24pt" pl="16px">
              Eco
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "8px",
                borderRadius: theme.shape.borderRadius,
              }}
            >
            </Box>
          </Box>
        </AppBar>
      </Box>
    </Providers>
  );
};

export default App;
