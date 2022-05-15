import React from "react";
import Box from "@mui/material/Box";
import Container from './Container';

interface StrategyEditorProps {}

const StrategyEditor: React.FC<StrategyEditorProps> = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      padding="32px"
    >
      <Container />
    </Box>
  );
};
export default StrategyEditor;
