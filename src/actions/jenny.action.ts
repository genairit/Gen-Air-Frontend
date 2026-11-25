import { jennyService } from "../services/jenny.service";
import { createJennyAnswer, toJennyChatRequest } from "../utilities/jenny.utility";
import type { IJennyContext, IJennyThreadMessage } from "../interfaces/jenny.interface";

interface IAskJennyInput {
  context: IJennyContext;
  messages: IJennyThreadMessage[];
}

export const askJennyAction = async (input: IAskJennyInput): Promise<IJennyThreadMessage> => {
  const response = await jennyService.chat(toJennyChatRequest(input));

  return createJennyAnswer(response);
};
