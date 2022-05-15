import React from "react";
import Box from "@mui/material/Box";
import Provider from "./StrategyContext";
import Card from "./Card";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useStrategy, useDispatch, STEP_LOCATION } from "./StrategyContext";

export interface Item {
  id: number;
  text: string;
}

export interface ContainerState {
  cards: Item[];
}

interface StepEditProps {
  name: string;
  index: number;
  kind: STEP_LOCATION;
}

const StepForm: React.FC<StepEditProps & { expanded: boolean }> = (props) => {
  const { expanded } = props;
  if (!expanded) return null;
  return <TextField />;
};

const StepEdit: React.FC<StepEditProps> = (props) => {
  const { name } = props;
  const [expanded, setExpanded] = React.useState(false);
  return (
    <Accordion sx={{ maxWidth: "600px" }} expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>{name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <StepForm {...props} expanded={expanded} />
      </AccordionDetails>
    </Accordion>
  );
};

const EditActions = () => {
  const dispatch = useDispatch();
  const moveCard = React.useCallback(
    (dragIdx: number, hoverIdx: number) => {
      dispatch({
        type: "MOVE_STEP",
        payload: { dragIdx, hoverIdx, stepLocation: "ACTIONS" },
      });
    },
    [dispatch]
  );
  const {
    action: { steps },
  } = useStrategy();
  return (
    <Box width="800" display="flex" flexDirection="column">
      <Typography fontWeight="bold" fontSize="24pt" paddingBottom="16px">
        Edit Actions
      </Typography>
      {steps.map((step, i) => {
        return (
          <Card key={step.name} index={i} id={step.name} moveCard={moveCard}>
            <StepEdit kind="ACTIONS" index={i} name={step.name} />
          </Card>
        );
      })}
    </Box>
  );
};

const EditCleanup = () => {
  const dispatch = useDispatch();
  const moveCard = React.useCallback(
    (dragIdx: number, hoverIdx: number) => {
      dispatch({
        type: "MOVE_STEP",
        payload: { dragIdx, hoverIdx, stepLocation: "ACTIONS" },
      });
    },
    [dispatch]
  );
  const {
    action: { cleanup },
  } = useStrategy();
  return (
    <Box width="1000" display="flex" flexDirection="column">
      <Typography
        fontWeight="bold"
        fontSize="24pt"
        paddingBottom="16px"
        paddingTop="16px"
      >
        Edit Cleanup
      </Typography>
      {cleanup.map((step, i) => {
        return (
          <Card key={step.name} index={i} id={step.name} moveCard={moveCard}>
            <StepEdit name={step.name} kind="CLEANUP" index={i} />
          </Card>
        );
      })}
    </Box>
  );
};

interface StrategyEditorProps {}

const StrategyEditor: React.FC<StrategyEditorProps> = () => {
  return (
    <Provider>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        width="100%"
        padding="32px"
      >
        <Box width="800" display="flex" flexDirection="column">
          <EditActions />
          <EditCleanup />
        </Box>
      </Box>
    </Provider>
  );
};
export default StrategyEditor;
