import { addFeedMessage, connectedSignal, gatewayInfoSignal, updateAgent } from '../store.js';
import type { GatewayMessage } from '../types.js';

const GATEWAY_PORT = 18789;
const RECONNECT_DELAY_BASE_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 8;

// Unique device identity for this browser session (persisted in sessionStorage)
function getDeviceId(): string {
  const KEY = 'openclaw_ui_device_id';
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id = `web-ui-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

// --- Demo activity simulator ---
// When the gateway isn't reachable, drive the UI with realistic mock events
// so the experience is fully functional for evaluation/onboarding.
const DEMO_ACTIVITY = [
  { agentId: 'coder',      status: 'working', task: 'Scaffolding REST endpoints...' },
  { agentId: 'researcher', status: 'working', task: 'Querying knowledge base...' },
  { agentId: 'coder',      status: 'working', task: 'Writing migration scripts...' },
  { agentId: 'strategist', status: 'working', task: 'Drafting sprint plan...' },
  { agentId: 'coder',      status: 'idle',    task: undefined },
  { agentId: 'researcher', status: 'working', task: 'Analysing market data...' },
  { agentId: 'strategist', status: 'idle',    task: undefined },
  { agentId: 'coder',      status: 'working', task: 'Optimising query indexes...' },
] as const;

const DEMO_FEED_MESSAGES = [
  { agentId: 'coder',      content: 'Schema migration complete. All 14 tables applied.' },
  { agentId: 'researcher', content: 'Found 3 relevant papers. Summarising now.' },
  { agentId: 'strategist', content: 'Sprint goals aligned with Q2 OKRs.' },
  { agentId: 'coder',      content: 'Test suite passing — 142/142 green.' },
  { agentId: 'researcher', content: 'Competitive analysis ready for review.' },
  { agentId: 'strategist', content: 'Risk register updated with 2 new items.' },
];

export class GatewayService {
  private ws: WebSocket | null = null;
  private attempts = 0;
  private destroyed = false;
  private demoTimers: ReturnType<typeof setTimeout>[] = [];
  private demoActivityIdx = 0;
  private demoFeedIdx = 0;

  // ------------------------------------------------------------------ //
  //  Public API
  // ------------------------------------------------------------------ //

  connect() {
    if (this.destroyed) return;
    try {
      const url = `ws://localhost:${GATEWAY_PORT}`;
      this.ws = new WebSocket(url);

      this.ws.addEventListener('open', () => {
        this.stopDemo();
        this.attempts = 0;
        // OpenClaw WS protocol: first frame MUST be `connect`
        this.ws!.send(JSON.stringify({
          type: 'req',
          id: `connect-${Date.now()}`,
          method: 'connect',
          params: {
            deviceId: getDeviceId(),
            platform: 'web',
            deviceFamily: 'browser',
            clientVersion: '2026.3.2',
          },
        }));
      });

      this.ws.addEventListener('message', (evt: MessageEvent) => {
        try {
          const frame = JSON.parse(evt.data as string) as Record<string, unknown>;
          this.handleFrame(frame);
        } catch {
          // non-JSON frame — ignore
        }
      });

      this.ws.addEventListener('close', () => {
        connectedSignal.set(false);
        gatewayInfoSignal.set(null);
        addFeedMessage({ content: 'Gateway disconnected. Running in demo mode.', type: 'system' });
        this.startDemo();
        if (!this.destroyed) this.scheduleReconnect();
      });

      this.ws.addEventListener('error', () => {
        this.ws?.close();
      });
    } catch {
      this.startDemo();
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
    this.stopDemo();
    this.ws?.close();
    this.ws = null;
  }

  // ------------------------------------------------------------------ //
  //  Frame handling (OpenClaw protocol)
  // ------------------------------------------------------------------ //

  private handleFrame(frame: Record<string, unknown>) {
    const type = frame.type as string;

    if (type === 'res') {
      // Connection handshake response
      const payload = frame.payload as Record<string, unknown> | undefined;
      if (payload?.type === 'hello-ok') {
        connectedSignal.set(true);
        gatewayInfoSignal.set({
          version: (payload.version as string) ?? 'unknown',
          port: GATEWAY_PORT,
        });
        addFeedMessage({ content: `Gateway connected — OpenClaw ${payload.version as string ?? ''}.`, type: 'system' });
      }
      return;
    }

    if (type === 'event') {
      const event = frame.event as string;
      const p = frame.payload as Record<string, unknown>;

      switch (event) {
        case 'agent': {
          // Agent streaming event from OpenClaw
          const agentId = (p.agentId ?? p.id) as string;
          const status = p.status as string;
          if (agentId && status) {
            updateAgent(agentId, { status: status as 'working' | 'idle' | 'offline', task: p.task as string | undefined });
          }
          if (p.content) {
            addFeedMessage({ content: p.content as string, agentId, type: 'agent' });
          }
          break;
        }
        case 'presence': {
          // Presence updates
          const agents = p.agents as Array<{ id: string; status: string; task?: string }> | undefined;
          if (agents) {
            agents.forEach((a) => updateAgent(a.id, { status: a.status as 'working' | 'idle' | 'offline', task: a.task }));
          }
          break;
        }
        case 'chat': {
          const content = p.content as string;
          const from = p.from as string | undefined;
          if (content) addFeedMessage({ content, agentId: from, type: 'agent' });
          break;
        }
      }
    }
  }

  // ------------------------------------------------------------------ //
  //  Demo mode (no gateway reachable)
  // ------------------------------------------------------------------ //

  private startDemo() {
    if (this.destroyed) return;
    addFeedMessage({ content: 'Running in demo mode — start `openclaw gateway` to connect.', type: 'system' });
    this.scheduleDemoActivity();
    this.scheduleDemoFeed();
  }

  private scheduleDemoActivity() {
    const tick = () => {
      if (this.destroyed || connectedSignal.get()) return;
      const item = DEMO_ACTIVITY[this.demoActivityIdx % DEMO_ACTIVITY.length];
      this.demoActivityIdx++;
      updateAgent(item.agentId, { status: item.status, task: item.task });
      this.demoTimers.push(setTimeout(tick, 4000 + Math.random() * 3000));
    };
    this.demoTimers.push(setTimeout(tick, 1500));
  }

  private scheduleDemoFeed() {
    const tick = () => {
      if (this.destroyed || connectedSignal.get()) return;
      const item = DEMO_FEED_MESSAGES[this.demoFeedIdx % DEMO_FEED_MESSAGES.length];
      this.demoFeedIdx++;
      addFeedMessage({ content: item.content, agentId: item.agentId, type: 'agent' });
      this.demoTimers.push(setTimeout(tick, 8000 + Math.random() * 6000));
    };
    this.demoTimers.push(setTimeout(tick, 3000));
  }

  private stopDemo() {
    this.demoTimers.forEach((t) => clearTimeout(t));
    this.demoTimers = [];
  }

  // ------------------------------------------------------------------ //
  //  Reconnect
  // ------------------------------------------------------------------ //

  private scheduleReconnect() {
    if (this.destroyed || this.attempts >= MAX_RECONNECT_ATTEMPTS) return;
    this.attempts++;
    const delay = RECONNECT_DELAY_BASE_MS * Math.min(this.attempts, 4);
    setTimeout(() => this.connect(), delay);
  }
}

export const gatewayService = new GatewayService();
