import { useState } from "react";
import Box from "@mui/joy/Box";
import IconButton from "@mui/joy/IconButton";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import DeviceHubRoundedIcon from '@mui/icons-material/DeviceHubRounded';

interface Props {
  message: string | null;
}

const AssistantButtons = ({ message }: Props) => {
  const [copyButtonClicked, setCopyButtonClicked] = useState<boolean>(false);

  const onCopyClick = () => {
    setCopyButtonClicked(true);
    if (message) navigator.clipboard.writeText(message);
    // show checkmark for 2 seconds
    setTimeout(() => {
      setCopyButtonClicked(false);
    }, 2000);
  };

  return (
    <Box>
      <IconButton variant="plain" size="sm" onClick={onCopyClick}>
        {copyButtonClicked ? (
          <CheckRoundedIcon fontSize="small" />
        ) : (
          <ContentCopyRoundedIcon fontSize="small" />
        )}
      </IconButton>
      <IconButton variant="plain" size="sm">
        <RefreshRoundedIcon fontSize="small" />
      </IconButton>
      <IconButton variant="plain" size="sm">
        <DeviceHubRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default AssistantButtons;
