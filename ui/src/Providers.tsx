import React from "react";
import CssBaseline from "@mui/material/CssBaseline";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = (props) => {
  const { children } = props;
  return (
    <>
      <CssBaseline />
      {children}
    </>
  );
};

export default Providers;
