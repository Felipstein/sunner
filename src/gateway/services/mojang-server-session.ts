import axios, { AxiosInstance } from 'axios';

interface HasJoinedResponse {
  id: string;
  name: string;
  properties: Array<{
    name: string;
    value: string;
    signature: string;
  }>;
}

export class MojangServerSessionService {
  private readonly api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: 'https://sessionserver.mojang.com/session/minecraft/',
    });
  }

  async hasJoined(username: string, serverId: string, ip?: string) {
    const response = await this.api.get<HasJoinedResponse>('/hasJoined', {
      params: { username, serverId, ip },
    });

    return response.data || null;
  }
}

export const mojangServerSessionService = new MojangServerSessionService();
