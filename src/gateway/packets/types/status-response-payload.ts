import { JSONTextComponent } from '../../../shared/json-text-component';

export interface StatusResponsePayload {
  version: { name: string; protocol: number };
  players: { max: number; online: number };
  description: JSONTextComponent;
}
