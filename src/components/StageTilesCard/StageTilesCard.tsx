import Dot from "../Dot/Dot";
import type { FC } from "react";
import Card from "../Card/Card";
import { Box, ButtonBase } from "@mui/material";
import CardHeader from "../CardHeader/CardHeader";
import { useStyles } from "./StageTilesCard.style";
import { ICON_NAMES } from "../../constants/icon.constant";
import { toStageShare } from "../../utilities/stage-tile.utility";
import type { IStageTile } from "../../interfaces/stage-tile.interface";
import { ALL_STAGES_TILE_ID } from "../../constants/stage-tile.constant";

interface IStageTilesCardProps {
  title: string;
  subtitle: string;
  tiles: IStageTile[];
  activeTileId: string;
  onSelect: (tileId: string) => void;
}

const StageTilesCard: FC<IStageTilesCardProps> = ({
  title,
  tiles,
  subtitle,
  onSelect,
  activeTileId,
}) => {
  const styles = useStyles();
  const stageTiles = tiles.filter(tile => tile.id !== ALL_STAGES_TILE_ID);
  const total = stageTiles.reduce((sum, tile) => sum + tile.count, 0);

  return (
    <Card gap="20px">
      <CardHeader title={title} subtitle={subtitle} icon={ICON_NAMES.PROGRESS} />
      <Box aria-hidden sx={styles.bar}>
        {stageTiles.map(tile => (
          <Box
            key={tile.id}
            sx={styles.segment({ color: tile.dotColor, share: toStageShare(tile.count, total) })}
          />
        ))}
      </Box>
      <Box role="tablist" sx={styles.tiles}>
        {tiles.map(tile => (
          <ButtonBase
            role="tab"
            key={tile.id}
            onClick={() => onSelect(tile.id)}
            aria-selected={tile.id === activeTileId}
            sx={styles.tile(tile.id === activeTileId)}
          >
            <Box component="span" sx={styles.tileLabel}>
              <Dot color={tile.dotColor} />
              {tile.label}
            </Box>
            <Box component="b" sx={styles.tileCount}>
              {tile.count}
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Card>
  );
};

export default StageTilesCard;
