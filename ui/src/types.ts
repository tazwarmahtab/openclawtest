/* Agent avatar images */
export const AGENT_IMAGES: Record<string, string> = {
  coder: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4204.PNG-5jTsVDOWWcGpqrapNEC7d7D1KTmOtM.png',
  researcher: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4203.PNG-LbPmej7ybg8GvBM3bzpoksCE5UCPvP.png',
  strategist: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4202.PNG-aXOnHLVLxn5u4wUrnntiot7Umbmw1X.png',
};

export type AgentStatus = 'working' | 'idle' | 'offline';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  task?: string;
  imageKey?: keyof typeof AGENT_IMAGES;
}

export interface SwarmState {
  agents: Agent[];
  connected: boolean;
  activeCount: number;
}

export interface FeedMessage {
  id: string;
  content: string;
  timestamp: number;
  agentId?: string;
  type: 'user' | 'agent' | 'system';
}

export interface GatewayMessage {
  type: string;
  payload?: unknown;
}

export interface GatewayInfo {
  version: string;
  port: number;
}

export type OnboardStep =
  | 'welcome'
  | 'install'
  | 'model'
  | 'channel'
  | 'done';
