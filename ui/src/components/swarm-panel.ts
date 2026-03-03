import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { repeat } from 'lit/directives/repeat.js';
import { swarmStateSignal } from '../store.js';
import './agent-card.js';

@customElement('swarm-panel')
export class SwarmPanel extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-4);
      animation: slide-up 0.3s ease both;
    }

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

    .agents-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

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

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  render() {
    const swarm = swarmStateSignal.get();
    const idleCount = swarm.agents.filter((a) => a.status === 'idle').length;

    return html`
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'swarm-panel': SwarmPanel;
  }
}
