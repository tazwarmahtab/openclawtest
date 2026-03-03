import { addFeedMessage, connectedSignal, updateAgent } from '../store.js';
import type { GatewayMessage } from '../types.js';

const GATEWAY_PORT = 18789;
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export class GatewayService {
  private ws: WebSocket | null = null;
  private attempts = 0;
  private destroyed = false;

  connect() {
    if (this.destroyed) return;
    try {
      const url = `ws://localhost:${GATEWAY_PORT}`;
      this.ws = new WebSocket(url);

      this.ws.addEventListener('open', () => {
        this.attempts = 0;
        connectedSignal.set(true);
        addFeedMessage({ content: 'Gateway connected.', type: 'system' });
      });

      this.ws.addEventListener('message', (evt: MessageEvent) => {
        try {
          const msg = JSON.parse(evt.data as string) as GatewayMessage;
          this.handleMessage(msg);
        } catch {
          // non-JSON frame — ignore
        }
      });

      this.ws.addEventListener('close', () => {
        connectedSignal.set(false);
        if (!this.destroyed) this.scheduleReconnect();
      });

      this.ws.addEventListener('error', () => {
        this.ws?.close();
      });
    } catch {
      this.scheduleReconnect();
    }
  }

  send(msg: GatewayMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  destroy() {
    this.destroyed = true;
    this.ws?.close();
    this.ws = null;
  }

  private handleMessage(msg: GatewayMessage) {
    switch (msg.type) {
      case 'agent:status': {
        const p = msg.payload as { id: string; status: string; task?: string };
        updateAgent(p.id, { status: p.status as 'working' | 'idle' | 'offline', task: p.task });
        break;
      }
      case 'agent:message': {
        const p = msg.payload as { agentId: string; content: string };
        addFeedMessage({ content: p.content, agentId: p.agentId, type: 'agent' });
        break;
      }
    }
  }

  private scheduleReconnect() {
    if (this.destroyed || this.attempts >= MAX_RECONNECT_ATTEMPTS) return;
    this.attempts++;
    setTimeout(() => this.connect(), RECONNECT_DELAY_MS);
  }
}

export const gatewayService = new GatewayService();
