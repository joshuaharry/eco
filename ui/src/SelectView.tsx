import React from 'react';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import PlaylistAddCheckCircleIcon from "@mui/icons-material/PlaylistAddCheckCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

const SelectView: React.FC = () => {
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


export default SelectView;
