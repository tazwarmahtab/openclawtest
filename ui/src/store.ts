import { Signal } from 'signal-polyfill';
import type { Agent, FeedMessage, GatewayInfo, OnboardStep, SwarmState } from './types.js';

// --- Demo seed agents ---
const SEED_AGENTS: Agent[] = [
  {
    id: 'coder',
    name: 'Coder',
    role: 'Full-stack Engineer',
    status: 'working',
    task: 'Deploying ClothOS inventory schema...',
    imageKey: 'coder',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'Data & Intelligence',
    status: 'idle',
    imageKey: 'researcher',
  },
  {
    id: 'strategist',
    name: 'Strategist',
    role: 'Product & Planning',
    status: 'idle',
    imageKey: 'strategist',
  },
];

// --- Signals ---
export const agentsSignal          = new Signal.State<Agent[]>(SEED_AGENTS);
export const connectedSignal       = new Signal.State<boolean>(false);
export const feedSignal            = new Signal.State<FeedMessage[]>([]);
export const activeViewSignal      = new Signal.State<'swarm' | 'feed' | 'settings' | 'onboard'>('swarm');
export const deployingSignal       = new Signal.State<boolean>(false);
export const gatewayInfoSignal     = new Signal.State<GatewayInfo | null>(null);
export const onboardStepSignal     = new Signal.State<OnboardStep>('welcome');
export const onboardDoneSignal     = new Signal.State<boolean>(false);

// --- Derived ---
export const swarmStateSignal = new Signal.Computed<SwarmState>(() => {
  const agents = agentsSignal.get();
  return {
    agents,
    connected: connectedSignal.get(),
    activeCount: agents.filter((a) => a.status === 'working').length,
  };
});

// --- Mutations ---
export function updateAgent(id: string, patch: Partial<Agent>) {
  agentsSignal.set(
    agentsSignal.get().map((a) => (a.id === id ? { ...a, ...patch } : a)),
  );
}

export function addFeedMessage(msg: Omit<FeedMessage, 'id' | 'timestamp'>) {
  const next: FeedMessage = {
    ...msg,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: Date.now(),
  };
  feedSignal.set([...feedSignal.get().slice(-200), next]);
  return next;
}
