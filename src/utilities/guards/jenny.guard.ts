import type { IJennySource, IJennyChatResponse } from "../../interfaces/jenny.interface";
import { isRecord, isArrayOf, hasStringFields, isNullableNumber } from "./primitive.guard";

const SOURCE_STRING_FIELDS = ["url", "fileId", "fileName"] as const;

export const isJennySource = (value: unknown): value is IJennySource =>
  isRecord(value) && hasStringFields(value, SOURCE_STRING_FIELDS) && isNullableNumber(value.page);

const isJennySources = isArrayOf(isJennySource);

export const isJennyChatResponse = (value: unknown): value is IJennyChatResponse =>
  isRecord(value) && typeof value.message === "string" && isJennySources(value.sources);
