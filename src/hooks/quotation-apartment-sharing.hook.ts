import {
  hasSameIds,
  filterApartments,
  isBuildingQuotation,
  isApprovedQuotation,
  availableApartmentIds,
  countRemovedApartments,
  unavailableApartmentLinks,
} from "../utilities/quotation-sharing.utility";

import { useState } from "react";
import { useIdSelection } from "./id-selection.hook";
import { useQuotationApartmentOptionsQuery } from "./queries/quotation.query";
import type { IQuotation, IQuotationApartmentLink } from "../interfaces/quotation.interface";
import { useSaveQuotationApartmentLinksMutation } from "./mutations/quotation-sharing.mutation";

interface IQuotationApartmentSharingOptions {
  busy: boolean;
  canEdit: boolean;
  quotation: IQuotation;
}

const NO_LINKS: IQuotationApartmentLink[] = [];

export const useQuotationApartmentSharing = ({
  busy,
  canEdit,
  quotation,
}: IQuotationApartmentSharingOptions) => {
  const [savedLinks, setSavedLinks] = useState(quotation.apartmentLinks ?? NO_LINKS);
  const [isEnabled, setIsEnabled] = useState(savedLinks.length > 0);
  const [search, setSearch] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const isBuilding = isBuildingQuotation(quotation);
  const optionsQuery = useQuotationApartmentOptionsQuery(quotation.id, isBuilding && canEdit);
  const mutation = useSaveQuotationApartmentLinksMutation();

  const apartments = optionsQuery.data?.apartments ?? [];
  const savedIds = availableApartmentIds(savedLinks);
  const unavailableLinks = unavailableApartmentLinks(savedLinks);
  const selection = useIdSelection(
    apartments.map(apartment => apartment.apartmentId),
    savedIds,
  );

  const isSavedShared = savedLinks.length > 0;
  const isApproved = isApprovedQuotation(quotation);
  const hasNoApartments = optionsQuery.isSuccess && apartments.length === 0;
  const isLocked = !isApproved || busy || mutation.isPending;
  const savedLinkIds = savedLinks.map(link => link.apartmentId);
  const keptUnavailableIds = unavailableLinks.map(link => link.apartmentId);
  const draftIds = isEnabled ? [...selection.selectedIds, ...keptUnavailableIds] : [];
  const removedCount = countRemovedApartments({ savedIds: savedLinkIds, draftIds });
  const hasSelectionChanged = isEnabled && !hasSameIds(selection.selectedIds, savedIds);
  const isDirty = isEnabled !== isSavedShared || hasSelectionChanged;
  const needsSelection = isEnabled && draftIds.length === 0;
  const isRemoving = !isEnabled && isSavedShared;
  const canSave = isDirty && !needsSelection && !isLocked;
  const cannotStartSharing = hasNoApartments && !isSavedShared;
  const isSwitchDisabled = isLocked || optionsQuery.isPending || cannotStartSharing;
  const visibleApartments = filterApartments(apartments, search);

  const markChanged = () => {
    setIsSaved(false);
    mutation.reset();
  };

  const toggleSharing = (value: boolean) => {
    markChanged();
    setIsEnabled(value);
  };

  const toggleApartment = (apartmentId: string) => {
    markChanged();
    selection.toggle(apartmentId);
  };

  const toggleAll = () => {
    markChanged();
    selection.toggleAll();
  };

  const clear = () => {
    markChanged();
    selection.clear();
  };

  const cancel = () => {
    markChanged();
    setSearch("");
    setIsEnabled(isSavedShared);
    selection.reset();
  };

  const acceptSavedLinks = (shared: IQuotation) => {
    const links = shared.apartmentLinks ?? NO_LINKS;
    setSavedLinks(links);
    setIsEnabled(links.length > 0);
    setIsSaved(true);

    if (links.length === 0) {
      selection.clear();
    }
  };

  const save = () => {
    mutation.mutate(
      { quotationId: quotation.id, apartmentIds: draftIds, expectedApartmentIds: savedLinkIds },
      { onSuccess: acceptSavedLinks },
    );
  };

  return {
    search,
    isSaved,
    canSave,
    isDirty,
    isLocked,
    savedIds,
    isEnabled,
    selection,
    isBuilding,
    isApproved,
    apartments,
    isRemoving,
    optionsQuery,
    removedCount,
    needsSelection,
    hasNoApartments,
    unavailableLinks,
    isSwitchDisabled,
    visibleApartments,
    hasLinks: isSavedShared,
    saveError: mutation.error,
    isPending: mutation.isPending,
    save,
    clear,
    cancel,
    setSearch,
    toggleAll,
    toggleSharing,
    toggleApartment,
  };
};

export type TQuotationApartmentSharing = ReturnType<typeof useQuotationApartmentSharing>;
