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
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
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

const SelectOptions = ["Run", "Find"] as const;

const StepForm: React.FC<StepEditProps & { expanded: boolean }> = (props) => {
  const { expanded, kind, index } = props;
  const strategy = useStrategy();
  const info = strategy.action[kind === "ACTIONS" ? "steps" : "cleanup"][index];
  if (!expanded) return null;
  return (
    <Box display="flex">
      <Box display="flex" alignItems="center" width="100%">
        <TextField
          label="Name"
          defaultValue={info.name}
          sx={{ width: "250px", marginRight: "16px" }}
        />
        <FormControl>
          <InputLabel id={`using-label-${info.name}`}>Using</InputLabel>
          <Select
            labelId={`using-label-${info.name}`}
            label="Using"
            value={info.uses}
            sx={{ width: "150px" }}
          >
            {SelectOptions.map((opt) => {
              return (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

const StepEdit: React.FC<StepEditProps> = (props) => {
  const { name, index } = props;
  const [expanded, setExpanded] = React.useState(false);
  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        onClick={() => setExpanded((prevExpanded) => !prevExpanded)}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>
          Step {index + 1}: {name}
        </Typography>
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
    <Box width="600px" display="flex" flexDirection="column">
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
    <Box width="600px" display="flex" flexDirection="column">
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
        <Box width="600px" display="flex" flexDirection="column">
          <EditActions />
          <EditCleanup />
        </Box>
      </Box>
    </Provider>
  );
};
export default StrategyEditor;
