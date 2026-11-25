import { jennyService } from "../services/jenny.service";
import { createJennyAnswer, toJennyChatRequest } from "../utilities/jenny.utility";
import type { IAskJennyInput, IJennyThreadMessage } from "../interfaces/jenny.interface";

export const askJennyAction = async ({
  signal,
  context,
  messages,
}: IAskJennyInput): Promise<IJennyThreadMessage> => {
  const response = await jennyService.chat(toJennyChatRequest({ context, messages }), signal);

  return createJennyAnswer(response);
};
