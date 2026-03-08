import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { repeat } from 'lit/directives/repeat.js';
import { addFeedMessage, deployingSignal, feedSignal } from '../store.js';
import { gatewayService } from '../services/gateway.service.js';

@customElement('feed-panel')
export class FeedPanel extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: calc(100dvh - var(--header-height) - 80px);
      padding: 0 var(--space-4);
      animation: slide-up 0.3s ease both;
    }

    .feed-header {
      padding: var(--space-4) 0 var(--space-3);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .feed-title {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
    }

    .feed-messages {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      padding-bottom: var(--space-3);
    }

    .msg {
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      line-height: 1.5;
      animation: fade-in 0.2s ease both;
    }

    .msg.user {
      background: var(--color-primary-dim);
      border: 1px solid var(--color-border-active);
      color: var(--color-text-primary);
      align-self: flex-end;
      max-width: 85%;
      border-bottom-right-radius: var(--radius-sm);
    }

    .msg.agent {
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
      align-self: flex-start;
      max-width: 90%;
      border-bottom-left-radius: var(--radius-sm);
    }

    .msg.system {
      background: transparent;
      border: 1px solid var(--color-border-subtle);
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      font-size: var(--text-xs);
      text-align: center;
      align-self: center;
      padding: var(--space-2) var(--space-4);
    }

    .msg-meta {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      margin-bottom: 2px;
      font-weight: var(--weight-medium);
    }

    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-3);
      color: var(--color-text-muted);
      text-align: center;
    }

    .empty-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-xl);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-icon svg {
      width: 22px;
      height: 22px;
      color: var(--color-text-muted);
    }

    .empty-label {
      font-size: var(--text-sm);
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  private formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  render() {
    const messages = feedSignal.get();

    return html`
      <div class="feed-header">
        <h2 class="feed-title">Feed</h2>
      </div>

      <div class="feed-messages" role="log" aria-live="polite" aria-label="Agent feed">
        ${messages.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <span class="empty-label">Deploy a context to start</span>
              </div>
            `
          : repeat(
              messages,
              (m) => m.id,
              (m) => html`
                <div class="msg ${m.type}">
                  ${m.type === 'agent'
                    ? html`<div class="msg-meta">${m.agentId ?? 'Agent'} · ${this.formatTime(m.timestamp)}</div>`
                    : ''}
                  ${m.content}
                </div>
              `,
            )
        }
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'feed-panel': FeedPanel;
  }
}
