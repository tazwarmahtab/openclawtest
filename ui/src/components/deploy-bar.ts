import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { addFeedMessage, activeViewSignal, deployingSignal } from '../store.js';
import { gatewayService } from '../services/gateway.service.js';

@customElement('deploy-bar')
export class DeployBar extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      position: sticky;
      bottom: 0;
      z-index: 50;
    }

    .bar {
      background: var(--color-bg-surface);
      border-top: 1px solid var(--color-border);
      padding: var(--space-3) var(--space-4);
      padding-bottom: max(var(--space-3), env(safe-area-inset-bottom));
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .inner {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-2xl);
      padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .inner:focus-within {
      border-color: var(--color-border-active);
      box-shadow: var(--shadow-blue);
    }

    .mic-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      color: var(--color-text-muted);
      transition: color var(--transition-fast);
      flex-shrink: 0;
    }

    .mic-btn:hover { color: var(--color-text-secondary); }

    .mic-btn svg { width: 16px; height: 16px; }

    .input {
      flex: 1;
      font-size: var(--text-sm);
      color: var(--color-text-primary);
      background: transparent;
      caret-color: var(--color-primary);
      padding: var(--space-1) 0;
      min-width: 0;
    }

    .input::placeholder { color: var(--color-text-muted); }

    .deploy-btn {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: 8px 16px;
      background: var(--color-primary);
      color: #fff;
      border-radius: var(--radius-xl);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      transition: background var(--transition-fast), transform var(--transition-fast), opacity var(--transition-fast);
      flex-shrink: 0;
      white-space: nowrap;
    }

    .deploy-btn:hover:not(:disabled) {
      background: var(--color-primary-hover);
      transform: scale(1.02);
    }

    .deploy-btn:active:not(:disabled) {
      transform: scale(0.98);
    }

    .deploy-btn svg { width: 14px; height: 14px; }

    .deploy-btn.loading {
      opacity: 0.7;
    }

    .deploy-btn.loading svg {
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;

  @state() private context = '';
  @state() private loading = false;

  private async handleDeploy() {
    const text = this.context.trim();
    if (!text || this.loading || deployingSignal.get()) return;

    this.loading = true;
    deployingSignal.set(true);

    addFeedMessage({ content: text, type: 'user' });
    gatewayService.send({ type: 'context:deploy', payload: { content: text } });

    this.context = '';
    activeViewSignal.set('feed');

    // Simulate agent response for demo
    await new Promise((r) => setTimeout(r, 900));
    addFeedMessage({
      content: `Received context. Routing to available agents...`,
      type: 'system',
    });

    this.loading = false;
    deployingSignal.set(false);
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void this.handleDeploy();
    }
  }

  render() {
    const deploying = deployingSignal.get();

    return html`
      <div class="bar">
        <div class="inner">
          <button class="mic-btn" aria-label="Voice input">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>

          <input
            class="input"
            type="text"
            placeholder="Feed context..."
            aria-label="Context input"
            .value=${this.context}
            @input=${(e: InputEvent) => (this.context = (e.target as HTMLInputElement).value)}
            @keydown=${this.handleKeydown}
          />

          <button
            class="deploy-btn ${deploying ? 'loading' : ''}"
            ?disabled=${!this.context.trim() || deploying}
            aria-label="Deploy context"
            @click=${() => void this.handleDeploy()}
          >
            ${deploying
              ? html`
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                `
              : html`
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                `
            }
            Deploy
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'deploy-bar': DeployBar;
  }
}
