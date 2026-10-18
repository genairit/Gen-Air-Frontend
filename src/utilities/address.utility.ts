import type {
  IApiProject,
  IApiPlaceAddress,
  IApiPlaceSuggestion,
} from "../interfaces/api.interface";

import {
  ADDRESS_SEARCH,
  PROJECT_ADDRESS_COPY,
  ADDRESS_FIELD_STATUSES,
  SUGGESTION_LIST_STATES,
  type AddressFieldStatusType,
  type SuggestionListStateType,
} from "../constants/project-address.constant";

import type { IVerifiedAddress } from "../interfaces/project.interface";

export const toVerifiedAddress = (place: IApiPlaceAddress): IVerifiedAddress => ({
  city: place.city,
  placeId: place.placeId,
  formattedAddress: place.formattedAddress,
});

export const toProjectAddress = (project: IApiProject): IVerifiedAddress | null => {
  if (!project.addressPlaceId) {
    return null;
  }

  return {
    city: project.addressCity,
    placeId: project.addressPlaceId,
    formattedAddress: project.address ?? "",
  };
};

interface IAddressAcceptance {
  requiresCity: boolean;
  address: IVerifiedAddress | null;
}

export const isAddressMissingCity = ({ address, requiresCity }: IAddressAcceptance) =>
  Boolean(address) && requiresCity && !address?.city;

export const isAddressAccepted = ({ address, requiresCity }: IAddressAcceptance) =>
  Boolean(address) && !isAddressMissingCity({ address, requiresCity });

export const isSearchableAddressInput = (input: string) =>
  input.trim().length >= ADDRESS_SEARCH.MIN_CHARACTERS;

interface IAddressFieldState extends IAddressAcceptance {
  input: string;
  isFocused: boolean;
  isConfirming: boolean;
  showMissingError: boolean;
  lookupError: string | null;
}

const hasUnresolvedInput = (state: IAddressFieldState) => {
  const hasTypedText = Boolean(state.input.trim());
  const hasRejectedAddress = isAddressMissingCity(state);

  return hasTypedText || hasRejectedAddress || Boolean(state.lookupError);
};

const getFocusedStatus = (input: string): AddressFieldStatusType => {
  if (isSearchableAddressInput(input)) {
    return ADDRESS_FIELD_STATUSES.SUGGESTIONS;
  }

  return ADDRESS_FIELD_STATUSES.TYPING;
};

export const getAddressFieldStatus = (state: IAddressFieldState): AddressFieldStatusType => {
  if (isAddressAccepted(state)) {
    return ADDRESS_FIELD_STATUSES.VERIFIED;
  }

  if (state.isConfirming) {
    return ADDRESS_FIELD_STATUSES.TYPING;
  }

  if (state.isFocused) {
    return getFocusedStatus(state.input);
  }

  if (hasUnresolvedInput(state) || state.showMissingError) {
    return ADDRESS_FIELD_STATUSES.UNVERIFIED;
  }

  return ADDRESS_FIELD_STATUSES.IDLE;
};

export const getAddressFailureTitle = (state: IAddressFieldState) => {
  if (isAddressMissingCity(state)) {
    return PROJECT_ADDRESS_COPY.CITY_REQUIRED_TITLE;
  }

  if (state.lookupError) {
    return state.lookupError;
  }

  if (state.input.trim()) {
    return PROJECT_ADDRESS_COPY.UNMATCHED_TITLE;
  }

  return PROJECT_ADDRESS_COPY.REQUIRED_TITLE;
};

export const getAddressTypingHint = (input: string) => {
  if (input.trim()) {
    return PROJECT_ADDRESS_COPY.TYPE_MORE;
  }

  return PROJECT_ADDRESS_COPY.TYPE_HINT;
};

export const getAddressCityLine = (address: IVerifiedAddress | null) => {
  if (!address?.city) {
    return null;
  }

  return `${PROJECT_ADDRESS_COPY.CITY_LABEL}: ${address.city}`;
};

interface ISuggestionListSource {
  isError: boolean;
  isLoading: boolean;
  suggestions: IApiPlaceSuggestion[];
}

export const getSuggestionListState = (source: ISuggestionListSource): SuggestionListStateType => {
  if (source.suggestions.length > 0) {
    return SUGGESTION_LIST_STATES.RESULTS;
  }

  if (source.isLoading) {
    return SUGGESTION_LIST_STATES.LOADING;
  }

  if (source.isError) {
    return SUGGESTION_LIST_STATES.ERROR;
  }

  return SUGGESTION_LIST_STATES.EMPTY;
};

export const formatSuggestionLabel = (suggestion: IApiPlaceSuggestion) => {
  if (!suggestion.secondaryText) {
    return suggestion.mainText;
  }

  return `${suggestion.mainText}, ${suggestion.secondaryText}`;
};
