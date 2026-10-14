import type { FC } from "react";
import { Box, ButtonBase } from "@mui/material";
import Dot from "../../../../components/Dot/Dot";
import Card from "../../../../components/Card/Card";
import { useStyles } from "./ApartmentStagesCard.style";
import { ICON_NAMES } from "../../../../constants/icon.constant";
import CardHeader from "../../../../components/CardHeader/CardHeader";
import { toStageShare } from "../../../../utilities/apartment.utility";
import type { IStageTile } from "../../../../interfaces/apartment.interface";
import { ALL_STAGES_TILE_ID, BUILDING_PAGE_COPY } from "../../../../constants/apartment.constant";

interface IApartmentStagesCardProps {
  tiles: IStageTile[];
  activeTileId: string;
  onSelect: (tileId: string) => void;
}

const ApartmentStagesCard: FC<IApartmentStagesCardProps> = ({ tiles, activeTileId, onSelect }) => {
  const styles = useStyles();
  const stageTiles = tiles.filter(tile => tile.id !== ALL_STAGES_TILE_ID);
  const total = stageTiles.reduce((sum, tile) => sum + tile.count, 0);

  return (
    <Card gap="20px">
      <CardHeader
        icon={ICON_NAMES.PROGRESS}
        title={BUILDING_PAGE_COPY.STAGES_TITLE}
        subtitle={BUILDING_PAGE_COPY.STAGES_SUBTITLE}
      />
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

export default ApartmentStagesCard;
