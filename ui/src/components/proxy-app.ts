import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { activeViewSignal } from '../store.js';
import './proxy-header.js';
import './swarm-panel.js';
import './feed-panel.js';
import './settings-panel.js';
import './deploy-bar.js';

@customElement('proxy-app')
export class ProxyApp extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background: var(--color-bg-base);
    }

    proxy-header {
      flex-shrink: 0;
    }

    .view-container {
      flex: 1;
      overflow-y: auto;
      max-width: var(--max-content-width);
      width: 100%;
      margin: 0 auto;
    }

    deploy-bar {
      flex-shrink: 0;
      max-width: var(--max-content-width);
      width: 100%;
      margin: 0 auto;
    }

    /* Full-width header */
    proxy-header {
      max-width: 100%;
    }

    @media (min-width: 720px) {
      :host {
        background: radial-gradient(
          ellipse 80% 50% at 50% -20%,
          rgba(59, 130, 246, 0.08),
          transparent
        ),
        var(--color-bg-base);
      }

      .view-container {
        padding-top: var(--space-2);
      }
    }
  `;

  render() {
    const view = activeViewSignal.get();

    return html`
      <proxy-header></proxy-header>

      <main class="view-container" role="main">
        ${view === 'swarm'
          ? html`<swarm-panel></swarm-panel>`
          : view === 'feed'
          ? html`<feed-panel></feed-panel>`
          : html`<settings-panel></settings-panel>`
        }
      </main>

      <deploy-bar></deploy-bar>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'proxy-app': ProxyApp;
  }
}
