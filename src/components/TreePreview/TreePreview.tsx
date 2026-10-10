import type { FC } from "react";
import Card from "../Card/Card";
import Chip from "../Chip/Chip";
import Icon from "../Icon/Icon";
import { Box } from "@mui/material";
import { useStyles } from "./TreePreview.style";
import { ICON_NAMES } from "../../constants/icon.constant";
import { CHIP_VARIANTS } from "../../constants/chip.constant";
import type { IFolderTreeNode } from "../../interfaces/project.interface";
import { SURFACE_DEPTHS, SURFACE_RADII } from "../../constants/surface.constant";

interface ITreePreviewProps {
  rootLabel: string;
  rootBadge: string;
  nodes: IFolderTreeNode[];
}

const TreePreview: FC<ITreePreviewProps> = ({ rootLabel, rootBadge, nodes }) => {
  const styles = useStyles();

  return (
    <Card
      gap="12px"
      padding="20px"
      sx={styles.tree}
      radius={SURFACE_RADII.PANEL}
      depth={SURFACE_DEPTHS.INSET}
    >
      <Box sx={styles.root}>
        <Box dir="ltr" component="span" sx={styles.rootLabel}>
          <Icon size={22} name={ICON_NAMES.FOLDER} />
          {rootLabel}
        </Box>
        <Chip label={rootBadge} variant={CHIP_VARIANTS.RAISED} />
      </Box>
      {nodes.map(node => (
        <Box key={node.id} sx={styles.node({ depth: node.depth, isLeaf: Boolean(node.isLeaf) })}>
          {node.icon && <Icon size={20} name={node.icon} />}
          {node.name}
        </Box>
      ))}
    </Card>
  );
};

export default TreePreview;
