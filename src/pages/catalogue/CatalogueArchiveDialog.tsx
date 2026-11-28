import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import { useCatalogueMutation } from "../../hooks/catalogue.hook";
import { catalogueService } from "../../services/catalogue.service";
import { CATALOGUE_STATUS } from "../../constants/quotation.constant";
import GenericPopup from "../../components/GenericPopup/GenericPopup";
import type { ICatalogueItem } from "../../interfaces/quotation.interface";

interface ICatalogueArchiveDialogProps {
  onClose: () => void;
  item: ICatalogueItem;
  onArchived: (message: string) => void;
}

const CatalogueArchiveDialog = ({ item, onClose, onArchived }: ICatalogueArchiveDialogProps) => {
  const page = usePageStyles();
  const archive = useCatalogueMutation((id: string) =>
    catalogueService.update(id, { status: CATALOGUE_STATUS.ARCHIVED }),
  );

  return (
    <GenericPopup
      open
      dir="rtl"
      align="right"
      closeAfterAction={false}
      title="הסרת פריט מהקטלוג"
      closeDisabled={archive.isPending}
      onClose={() => {
        if (!archive.isPending) onClose();
      }}
      buttons={{
        primary: {
          text: "הסרת הפריט",
          isDisabled: archive.isPending,
          onClick: async () => {
            await archive.mutateAsync(item.id);
            onArchived("הפריט הוסר מהקטלוג");
          },
        },
        secondary: {
          text: "ביטול",
          isDisabled: archive.isPending,
          onClick: () => {
            archive.reset();
            onClose();
          },
        },
      }}
      content={
        <Box sx={page.stack({ gap: "10px" })}>
          <Box component="strong">
            {item.description || item.sku} <Box component="bdi">{item.description && item.sku}</Box>
          </Box>
          <Box component="span">
            הפריט לא יוצע לבחירה חדשה. מסמכים שמורים ימשיכו לכלול אותו. טיוטת כתב כמויות עשויה לדרוש
            פריט חלופי כדי לקבל אישור.
          </Box>
        </Box>
      }
    />
  );
};

export default CatalogueArchiveDialog;
