import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

// @ts-ignore
const isInTests = globalThis.IS_REACT_ACT_ENVIRONMENT === true;

const Router = isInTests ? MemoryRouter : BrowserRouter;

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = (props) => {
  const { children } = props;
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        <CssBaseline />
        {children}
      </Router>
    </DndProvider>
  );
};

export default Providers;
