import React from "react";
import StrategyEditor from "./strategy-editor/StrategyEditor";

interface AppGatewayProps {}

// TODO: Implement logic involving the routes to decide what to show in the
// main body of the page.
const AppGateway: React.FC<AppGatewayProps> = () => {
  return <StrategyEditor />;
};

export default AppGateway;
