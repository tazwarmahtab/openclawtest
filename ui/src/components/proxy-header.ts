import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { activeViewSignal, connectedSignal, swarmStateSignal } from '../store.js';

@customElement('proxy-header')
export class ProxyHeader extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    header {
      height: var(--header-height);
      background: var(--color-bg-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-4);
      gap: var(--space-3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .left {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .menu-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      transition: background var(--transition-fast), color var(--transition-fast);
    }

    .menu-btn:hover {
      background: var(--color-bg-overlay);
      color: var(--color-text-primary);
    }

    .menu-btn svg {
      width: 18px;
      height: 18px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .brand-icon {
      width: 28px;
      height: 28px;
      background: var(--color-primary);
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--shadow-blue);
    }

    .brand-icon svg {
      width: 16px;
      height: 16px;
      color: #fff;
    }

    .brand-name {
      font-size: var(--text-base);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      letter-spacing: -0.01em;
    }

    .center {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      background: var(--color-bg-overlay);
      border-radius: var(--radius-full);
      padding: 3px;
    }

    .nav-item {
      padding: 5px 14px;
      border-radius: var(--radius-full);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-secondary);
      transition: all var(--transition-fast);
      cursor: pointer;
    }

    .nav-item:hover {
      color: var(--color-text-primary);
    }

    .nav-item.active {
      background: var(--color-bg-elevated);
      color: var(--color-text-primary);
      box-shadow: var(--shadow-sm);
    }

    .right {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .connection-badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-medium);
      transition: all var(--transition-fast);
    }

    .connection-badge.connected {
      background: var(--color-working-dim);
      color: var(--color-working);
    }

    .connection-badge.disconnected {
      background: var(--color-offline-dim);
      color: var(--color-text-muted);
    }

    .connection-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .connection-badge.connected .dot {
      animation: pulse-dot 2s infinite;
    }

    .avatar-btn {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--text-xs);
      font-weight: var(--weight-bold);
      color: white;
      transition: opacity var(--transition-fast);
    }

    .avatar-btn:hover { opacity: 0.85; }

    .active-count {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      display: none;
    }

    @media (min-width: 400px) {
      .active-count { display: block; }
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.4; }
    }
  `;

  @state() private menuOpen = false;

  private setView(v: 'swarm' | 'feed' | 'settings') {
    activeViewSignal.set(v);
  }

  render() {
    const connected = connectedSignal.get();
    const swarm = swarmStateSignal.get();
    const view = activeViewSignal.get();

    return html`
      <header>
        <div class="left">
          <button class="menu-btn" aria-label="Menu" @click=${() => (this.menuOpen = !this.menuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div class="brand">
            <div class="brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <span class="brand-name">ProxyOS</span>
          </div>
        </div>

        <div class="center">
          <nav class="nav" role="tablist" aria-label="Main navigation">
            <button
              class="nav-item ${view === 'swarm' ? 'active' : ''}"
              role="tab"
              aria-selected="${view === 'swarm'}"
              @click=${() => this.setView('swarm')}
            >Swarm</button>
            <button
              class="nav-item ${view === 'feed' ? 'active' : ''}"
              role="tab"
              aria-selected="${view === 'feed'}"
              @click=${() => this.setView('feed')}
            >Feed</button>
            <button
              class="nav-item ${view === 'settings' ? 'active' : ''}"
              role="tab"
              aria-selected="${view === 'settings'}"
              @click=${() => this.setView('settings')}
            >Settings</button>
          </nav>
        </div>

        <div class="right">
          <span class="active-count">${swarm.activeCount} active</span>
          <div class="connection-badge ${connected ? 'connected' : 'disconnected'}">
            <span class="dot"></span>
            ${connected ? 'Live' : 'Local'}
          </div>
          <button class="avatar-btn" aria-label="Profile">
            PO
          </button>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'proxy-header': ProxyHeader;
  }
}
