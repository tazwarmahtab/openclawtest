import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { Agent } from '../types.js';
import { AGENT_IMAGES } from '../types.js';
import './status-dot.js';

@customElement('agent-card')
export class AgentCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      animation: fade-in 0.3s ease both;
    }

    .card {
      display: flex;
      align-items: center;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      transition: all var(--transition-normal);
      cursor: default;
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, rgba(59,130,246,0.04), transparent);
      opacity: 0;
      transition: opacity var(--transition-normal);
    }

    .card:hover {
      border-color: var(--color-border-active);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .card:hover::before {
      opacity: 1;
    }

    .card.working {
      border-color: rgba(34, 197, 94, 0.18);
    }

    .avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .avatar {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-lg);
      background: var(--color-bg-overlay);
      object-fit: cover;
      object-position: center top;
      display: block;
      border: 1px solid var(--color-border);
    }

    .avatar-fallback {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-lg);
      background: var(--color-bg-overlay);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: var(--weight-semibold);
      font-size: var(--text-lg);
      color: var(--color-primary);
    }

    .status-ring {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid var(--color-bg-elevated);
      background: var(--color-idle);
      transition: background var(--transition-normal);
    }

    .status-ring.working {
      background: var(--color-working);
      box-shadow: 0 0 6px var(--color-working);
      animation: pulse-ring 2s ease infinite;
    }

    .status-ring.offline {
      background: var(--color-offline);
    }

    .info {
      flex: 1;
      min-width: 0;
    }

    .name-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      margin-bottom: var(--space-1);
    }

    .name {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
    }

    .role {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin-bottom: 2px;
    }

    .task {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }

    .task.active {
      color: var(--color-accent);
    }

    .status-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .status-label.working { color: var(--color-working); }
    .status-label.idle    { color: var(--color-text-muted); }
    .status-label.offline { color: var(--color-offline); }

    @keyframes pulse-ring {
      0%, 100% { box-shadow: 0 0 6px var(--color-working); }
      50%       { box-shadow: 0 0 12px var(--color-working); }
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  @property({ type: Object }) agent!: Agent;
  @property({ type: Number }) index = 0;

  private get imgSrc(): string | null {
    if (this.agent.imageKey && AGENT_IMAGES[this.agent.imageKey]) {
      return AGENT_IMAGES[this.agent.imageKey];
    }
    return null;
  }

  render() {
    const { agent } = this;
    const src = this.imgSrc;
    const statusLabel = agent.status.charAt(0).toUpperCase() + agent.status.slice(1);

    return html`
      <article
        class="card ${agent.status}"
        style="animation-delay: ${this.index * 60}ms"
        aria-label="${agent.name} — ${statusLabel}"
      >
        <div class="avatar-wrap">
          ${src
            ? html`<img class="avatar" src="${src}" alt="${agent.name} avatar" loading="lazy" crossorigin="anonymous" />`
            : html`<div class="avatar-fallback" aria-hidden="true">${agent.name[0]}</div>`
          }
          <span class="status-ring ${agent.status}" aria-hidden="true"></span>
        </div>

        <div class="info">
          <div class="name-row">
            <span class="name">${agent.name}</span>
            <span class="status-label ${agent.status}">${statusLabel}</span>
          </div>
          <div class="role">${agent.role}</div>
          ${agent.task
            ? html`<div class="task active">${agent.task}</div>`
            : html`<div class="task">Awaiting instructions</div>`
          }
        </div>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agent-card': AgentCard;
  }
}
