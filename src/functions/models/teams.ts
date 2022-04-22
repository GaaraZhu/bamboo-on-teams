export interface IncomingMessage {
  channelId: string;
  from: TeamsUser;
  text: string;
}

export interface TeamsUser {
  id: string;
  name: string;
}
