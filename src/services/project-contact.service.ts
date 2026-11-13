import {
  isProjectContactLink,
  isProjectContactLinkList,
} from "../utilities/project-contact.utility";

import { httpClient, ensureResponse } from "./http-client.service";
import type { IProjectContactInput } from "../interfaces/project-contact.interface";

const projectContactsEndpoint = (projectId: string) => `/project/${projectId}/contacts`;

class ProjectContactService {
  async list(projectId: string) {
    const endpoint = projectContactsEndpoint(projectId);
    const response = await httpClient.get<unknown>(endpoint);
    return ensureResponse(endpoint, response.data, isProjectContactLinkList);
  }

  async link(projectId: string, input: IProjectContactInput) {
    const endpoint = projectContactsEndpoint(projectId);
    const response = await httpClient.post<unknown>(endpoint, input);
    return ensureResponse(endpoint, response.data, isProjectContactLink);
  }

  async unlink(projectId: string, contactId: string): Promise<void> {
    await httpClient.delete(`${projectContactsEndpoint(projectId)}/${contactId}`);
  }
}

export const projectContactService = new ProjectContactService();
