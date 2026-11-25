import { jennyService } from "../services/jenny.service";
import { createJennyAnswer, toJennyChatRequest } from "../utilities/jenny.utility";
import type { IJennyContext, IJennyThreadMessage } from "../interfaces/jenny.interface";

interface IAskJennyInput {
  signal: AbortSignal;
  context: IJennyContext;
  messages: IJennyThreadMessage[];
}

export const askJennyAction = async ({
  signal,
  context,
  messages,
}: IAskJennyInput): Promise<IJennyThreadMessage> => {
  const response = await jennyService.chat(toJennyChatRequest({ context, messages }), signal);

  return createJennyAnswer(response);
};
