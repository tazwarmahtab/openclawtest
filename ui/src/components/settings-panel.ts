import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import { SignalWatcher } from '@lit-labs/signals';
import { swarmStateSignal } from '../store.js';

@customElement('settings-panel')
export class SettingsPanel extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-4);
      animation: slide-up 0.3s ease both;
    }

    .section-header {
      margin-bottom: var(--space-6);
    }

    .section-title {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
      margin-bottom: var(--space-1);
    }

    .section-sub {
      font-size: var(--text-sm);
      color: var(--color-text-muted);
    }

    .settings-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }

    .group-label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      margin-bottom: var(--space-1);
      padding: 0 var(--space-1);
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4);
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      transition: border-color var(--transition-fast);
    }

    .setting-row:hover {
      border-color: var(--color-border-active);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .setting-name {
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      color: var(--color-text-primary);
    }

    .setting-desc {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
    }

    .setting-value {
      font-size: var(--text-sm);
      font-family: var(--font-mono);
      color: var(--color-accent);
      background: var(--color-accent-dim);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }

    .tag {
      font-size: var(--text-xs);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      font-weight: var(--weight-medium);
    }

    .tag.active {
      background: var(--color-working-dim);
      color: var(--color-working);
    }

    .tag.inactive {
      background: var(--color-offline-dim);
      color: var(--color-text-muted);
    }

    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  render() {
    const swarm = swarmStateSignal.get();
    return html`
      <div class="section-header">
        <h2 class="section-title">Settings</h2>
        <p class="section-sub">Gateway configuration and agent preferences</p>
      </div>

      <div class="settings-group">
        <div class="group-label">Gateway</div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">WebSocket Port</span>
            <span class="setting-desc">Local gateway connection</span>
          </div>
          <span class="setting-value">:18789</span>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">Connection Status</span>
            <span class="setting-desc">Real-time data stream</span>
          </div>
          <span class="tag ${swarm.connected ? 'active' : 'inactive'}">
            ${swarm.connected ? 'Connected' : 'Demo mode'}
          </span>
        </div>
      </div>

      <div class="settings-group">
        <div class="group-label">Swarm</div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">Total Agents</span>
            <span class="setting-desc">Registered in swarm</span>
          </div>
          <span class="setting-value">${swarm.agents.length}</span>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">Active Workers</span>
            <span class="setting-desc">Currently executing tasks</span>
          </div>
          <span class="tag ${swarm.activeCount > 0 ? 'active' : 'inactive'}">
            ${swarm.activeCount} working
          </span>
        </div>
      </div>

      <div class="settings-group">
        <div class="group-label">System</div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">Version</span>
            <span class="setting-desc">OpenClaw release</span>
          </div>
          <span class="setting-value">2026.3.2</span>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <span class="setting-name">UI Build</span>
            <span class="setting-desc">Control interface</span>
          </div>
          <span class="setting-value">Lit 3.3</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-panel': SettingsPanel;
  }
}
