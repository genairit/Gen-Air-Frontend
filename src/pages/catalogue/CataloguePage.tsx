import { Box } from "@mui/material";
import { usePageStyles } from "../page.style";
import Card from "../../components/Card/Card";
import CatalogueItemForm from "./CatalogueItemForm";
import Button from "../../components/Button/Button";
import CatalogueDirectory from "./CatalogueDirectory";
import { useCatalogueStyles } from "./catalogue.style";
import { ICON_NAMES } from "../../constants/icon.constant";
import { useSessionUser } from "../../store/session.store";
import { useCatalogueItem } from "../../hooks/catalogue.hook";
import { useLocation, useSearchParams } from "react-router-dom";
import { catalogueDetailRows } from "./catalogue-display.utility";
import { PERMISSIONS } from "../../constants/permission.constant";
import InlineError from "../../components/InlineError/InlineError";
import { hasPermission } from "../../utilities/permission.utility";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import LoadingState from "../../components/LoadingState/LoadingState";
import { CATALOGUE_STATUS } from "../../constants/quotation.constant";
import { focusConnectedElement } from "../../utilities/focus.utility";
import { getApiErrorMessage } from "../../utilities/api-error.utility";
import { BUTTON_VARIANTS } from "../../components/Button/constants/button.constants";

const LIST_TITLE = "פריטי קטלוג";
const CREATE_TITLE = "פריט קטלוג חדש";
const ITEM_PARAM = "item";
const CREATE_VALUE = "new";

const cataloguePageTitle = (readOnlyItem: boolean) => (readOnlyItem ? "כרטיס פריט" : LIST_TITLE);

const CataloguePage = () => {
  const page = usePageStyles();
  const styles = useCatalogueStyles();
  const user = useSessionUser();
  const canManage = hasPermission(user, PERMISSIONS.CATALOGUE_MANAGE);
  const { key: locationKey } = useLocation();
  const [params, setParams] = useSearchParams();
  const selection = params.get(ITEM_PARAM);
  const creating = selection === CREATE_VALUE && canManage;
  const itemId = selection === CREATE_VALUE ? null : selection;
  const showingList = !creating && itemId === null;
  const detail = useCatalogueItem(itemId);
  const item = detail.data;
  const editing = Boolean(item && canManage && item.status !== CATALOGUE_STATUS.ARCHIVED);
  const heading = useRef<HTMLHeadingElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const returnFocusId = useRef<string | null>(null);
  const [notice, setNotice] = useState("");
  const showReadOnly = item && !editing;
  const popupOpen = creating || Boolean(item && editing);
  const listVisible = showingList || creating || (canManage && itemId !== null && !showReadOnly);
  const title = cataloguePageTitle(Boolean(showReadOnly));
  const showCreateAction = listVisible && canManage;
  const showBackAction = !showingList && !editing && !creating && !listVisible;
  const loading = itemId !== null && detail.isPending;
  const loadError = itemId !== null && detail.isError && !item;
  const detailRows = showReadOnly ? catalogueDetailRows(item) : [];
  const currentLocationKey = useRef<string | null>(null);

  useLayoutEffect(() => {
    currentLocationKey.current = locationKey;
    return () => {
      currentLocationKey.current = null;
    };
  }, [locationKey]);

  useEffect(() => {
    if (popupOpen) return;
    if (!showingList) {
      focusConnectedElement(heading.current);
      return;
    }
    const id = returnFocusId.current;
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      returnFocusId.current = null;
      const row =
        id === CREATE_VALUE
          ? null
          : list.current?.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(id)}"]`);
      focusConnectedElement(row ?? createButton.current ?? heading.current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selection, showingList, popupOpen]);

  const open = (value: string) => {
    returnFocusId.current = value;
    setNotice("");
    setParams({ [ITEM_PARAM]: value });
  };
  const close = () => setParams({}, { replace: true });
  const saved = (message: string) => {
    if (currentLocationKey.current !== locationKey) return;
    setNotice(message);
    close();
  };

  return (
    <Box sx={page.page}>
      <Box sx={page.header}>
        <Box sx={page.headerText}>
          <Box ref={heading} tabIndex={-1} component="h1" sx={styles.title}>
            {title}
          </Box>
          {showingList && (
            <Box sx={page.description}>מחירי מחירון ופרטי ציוד להצעות מחיר וכתבי כמויות</Box>
          )}
        </Box>
        {showCreateAction && (
          <Button
            text={CREATE_TITLE}
            icon={ICON_NAMES.ADD}
            buttonRef={createButton}
            onClick={() => open(CREATE_VALUE)}
          />
        )}
        {showBackAction && (
          <Button onClick={close} text="חזרה לקטלוג" variant={BUTTON_VARIANTS.NEUTRAL} />
        )}
      </Box>
      {listVisible && notice && (
        <Box role="status" sx={page.caption}>
          {notice}
        </Box>
      )}
      <Box ref={list} hidden={!listVisible}>
        <CatalogueDirectory
          canManage={canManage}
          onOpen={row => open(row.id)}
          onRemoved={message => {
            returnFocusId.current = null;
            setNotice(message);
            focusConnectedElement(createButton.current ?? heading.current);
          }}
        />
      </Box>
      {loading && <LoadingState label="טוען פרטי פריט" />}
      {loadError && <InlineError message={getApiErrorMessage(detail.error)} />}
      {creating && <CatalogueItemForm onSaved={saved} onCancel={close} />}
      {item && editing && (
        <CatalogueItemForm item={item} key={item.id} onSaved={saved} onCancel={close} />
      )}
      {showReadOnly && (
        <Card gap="18px" ariaLabel="פרטי פריט">
          <Box component="h2" sx={styles.sectionTitle}>
            {item.description || item.sku}
          </Box>
          <Box component="dl" sx={{ ...styles.fieldGrid, margin: 0 }}>
            {detailRows.map(({ label, value }) => (
              <Box key={label} sx={page.wrappingText}>
                <Box component="dt" sx={page.caption}>
                  {label}
                </Box>
                <Box component="dd" sx={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  <Box component="bdi">{value}</Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}
    </Box>
  );
};

export default CataloguePage;
