import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AgentStatus } from '../types.js';

@customElement('status-dot')
export class StatusDot extends LitElement {
  static styles = css`
    :host {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      position: relative;
    }

    .dot.working {
      background: var(--color-working);
      box-shadow: 0 0 6px var(--color-working);
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .dot.idle {
      background: var(--color-idle);
    }

    .dot.offline {
      background: var(--color-offline);
    }

    .label {
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      letter-spacing: 0.02em;
    }

    .label.working { color: var(--color-working); }
    .label.idle    { color: var(--color-idle); }
    .label.offline { color: var(--color-offline); }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); box-shadow: 0 0 6px var(--color-working); }
      50%       { opacity: 0.7; transform: scale(0.85); box-shadow: 0 0 3px var(--color-working); }
    }
  `;

  @property() status: AgentStatus = 'idle';
  @property({ type: Boolean }) showLabel = false;

  private get label() {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1);
  }

  render() {
    return html`
      <span class="dot ${this.status}" role="img" aria-label="${this.label}"></span>
      ${this.showLabel ? html`<span class="label ${this.status}">${this.label}</span>` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'status-dot': StatusDot;
  }
}
