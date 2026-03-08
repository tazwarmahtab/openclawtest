import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { repeat } from 'lit/directives/repeat.js';
import { connectedSignal, feedSignal, swarmStateSignal } from '../store.js';
import type { FeedMessage } from '../types.js';
import './agent-card.js';

/* Friendly display names for agent ids */
const AGENT_NAME: Record<string, string> = {
  coder: 'Coder',
  researcher: 'Researcher',
  strategist: 'Strategist',
};

@customElement('swarm-panel')
export class SwarmPanel extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-4);
      animation: slide-up 0.3s ease both;
    }

    /* ---- Demo mode banner ---- */
    .demo-banner {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      background: var(--color-idle-dim);
      border: 1px solid rgba(245, 158, 11, 0.25);
      border-radius: var(--radius-lg);
      margin-bottom: var(--space-4);
    }

    .demo-banner .demo-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-idle);
      flex-shrink: 0;
      animation: pulse-dot 2s ease infinite;
    }

    .demo-banner-text {
      flex: 1;
      min-width: 0;
    }

    .demo-banner-text strong {
      display: block;
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-idle);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 1px;
    }

    .demo-banner-text span {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    /* ---- Scene banner ---- */
    .scene-banner {
      width: 100%;
      border-radius: var(--radius-xl);
      overflow: hidden;
      margin-bottom: var(--space-5);
      position: relative;
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      aspect-ratio: 16/9;
      max-height: 200px;
    }

    .scene-banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
    }

    .scene-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to bottom,
        transparent 40%,
        rgba(10, 13, 20, 0.85) 100%
      );
    }

    .scene-label {
      position: absolute;
      bottom: var(--space-3);
      left: var(--space-4);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text-secondary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* ---- Stats row ---- */
    .stats-row {
      display: flex;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .stat-card {
      flex: 1;
      padding: var(--space-3) var(--space-4);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      text-align: center;
    }

    .stat-value {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      line-height: 1.2;
    }

    .stat-value.primary { color: var(--color-primary); }
    .stat-value.working { color: var(--color-working); }
    .stat-value.idle    { color: var(--color-idle); }

    .stat-label {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ---- Section header ---- */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);
    }

    .section-title {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
    }

    .count-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      background: var(--color-bg-overlay);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
    }

    .count-badge .active-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-working);
      box-shadow: 0 0 5px var(--color-working);
      animation: pulse-dot 2s ease infinite;
    }

    /* ---- Agent list ---- */
    .agents-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    /* ---- Live activity log ---- */
    .activity-header {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-3);
    }

    .activity-title {
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text-secondary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      flex: 1;
    }

    .live-chip {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 2px 8px;
      background: var(--color-working-dim);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      color: var(--color-working);
      font-weight: var(--weight-semibold);
    }

    .live-chip .live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: var(--color-working);
      animation: pulse-dot 1.5s ease infinite;
    }

    .activity-log {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-3);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      animation: fade-in-item 0.35s ease both;
    }

    .activity-item.system {
      border-color: var(--color-border-subtle);
      background: var(--color-bg-overlay);
    }

    .activity-avatar {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-md);
      background: var(--color-primary-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: var(--weight-bold);
      color: var(--color-primary);
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .activity-avatar.system {
      background: var(--color-bg-subtle);
      color: var(--color-text-muted);
    }

    .activity-body {
      flex: 1;
      min-width: 0;
    }

    .activity-who {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-text-secondary);
      margin-bottom: 1px;
    }

    .activity-who.system { color: var(--color-text-muted); }

    .activity-content {
      font-size: var(--text-xs);
      color: var(--color-text-primary);
      line-height: 1.5;
    }

    .activity-content.system { color: var(--color-text-muted); }

    .activity-time {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      flex-shrink: 0;
      font-family: var(--font-mono);
    }

    .no-activity {
      text-align: center;
      padding: var(--space-5);
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    /* ---- Animations ---- */
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.3; }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fade-in-item {
      from { opacity: 0; transform: translateX(-6px); }
      to   { opacity: 1; transform: translateX(0); }
    }
  `;

  private formatTime(ts: number): string {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  private renderActivityItem(msg: FeedMessage) {
    const isSystem = msg.type === 'system';
    const agentName = msg.agentId ? (AGENT_NAME[msg.agentId] ?? msg.agentId) : null;
    const who = agentName ?? 'System';
    const initial = who[0].toUpperCase();

    return html`
      <div class="activity-item ${isSystem ? 'system' : ''}">
        <div class="activity-avatar ${isSystem ? 'system' : ''}" aria-hidden="true">
          ${isSystem
            ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:12px;height:12px;"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`
            : initial
          }
        </div>
        <div class="activity-body">
          <div class="activity-who ${isSystem ? 'system' : ''}">${who}</div>
          <div class="activity-content ${isSystem ? 'system' : ''}">${msg.content}</div>
        </div>
        <time class="activity-time" datetime="${new Date(msg.timestamp).toISOString()}">
          ${this.formatTime(msg.timestamp)}
        </time>
      </div>
    `;
  }

  render() {
    const swarm = swarmStateSignal.get();
    const connected = connectedSignal.get();
    const idleCount = swarm.agents.filter((a) => a.status === 'idle').length;

    // Last 5 feed messages, newest first
    const recentFeed = [...feedSignal.get()].reverse().slice(0, 5);

    return html`
      ${!connected ? html`
        <div class="demo-banner" role="status" aria-live="polite">
          <span class="demo-dot" aria-hidden="true"></span>
          <div class="demo-banner-text">
            <strong>Demo Mode</strong>
            <span>Run <code style="font-family:var(--font-mono);color:var(--color-idle);">openclaw gateway</code> to connect a live instance.</span>
          </div>
        </div>
      ` : ''}

      <div class="scene-banner" role="img" aria-label="Agent workspace scene">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/IMG_4207.PNG-svtN5ECHFvQfDiXVVcVRirZ01FctZ6.png"
          alt="Pixel art office scene with AI agents"
          crossorigin="anonymous"
        />
        <div class="scene-overlay" aria-hidden="true"></div>
        <span class="scene-label">Workspace</span>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value primary">${swarm.agents.length}</div>
          <div class="stat-label">Total</div>
        </div>
        <div class="stat-card">
          <div class="stat-value working">${swarm.activeCount}</div>
          <div class="stat-label">Working</div>
        </div>
        <div class="stat-card">
          <div class="stat-value idle">${idleCount}</div>
          <div class="stat-label">Idle</div>
        </div>
      </div>

      <div class="section-header">
        <h2 class="section-title">Swarm Activity</h2>
        <div class="count-badge">
          <span class="active-dot" aria-hidden="true"></span>
          ${swarm.agents.length} agents
        </div>
      </div>

      <ul class="agents-list" role="list" aria-label="Active agents">
        ${repeat(
          swarm.agents,
          (a) => a.id,
          (a, i) => html`
            <li style="list-style:none;">
              <agent-card .agent=${a} .index=${i}></agent-card>
            </li>
          `,
        )}
      </ul>

      <div class="activity-header">
        <span class="activity-title">Recent Events</span>
        <div class="live-chip" aria-label="Live updates">
          <span class="live-dot" aria-hidden="true"></span>
          Live
        </div>
      </div>

      <div class="activity-log" role="log" aria-live="polite" aria-label="Agent activity log">
        ${recentFeed.length > 0
          ? recentFeed.map((m) => this.renderActivityItem(m))
          : html`<p class="no-activity">No recent events yet. Activity will appear here as agents work.</p>`
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swarm-panel': SwarmPanel;
  }
}
