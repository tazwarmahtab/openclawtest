import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { activeViewSignal, onboardDoneSignal, onboardStepSignal } from '../store.js';
import type { OnboardStep } from '../types.js';

/* ------------------------------------------------------------------ *
 *  OnboardWizard — interactive setup wizard for OpenClaw
 *
 *  Steps:
 *    1. welcome  — what OpenClaw is, one-liner install command
 *    2. install  — verifies gateway reachability, shows copy-paste setup
 *    3. model    — pick AI provider + API key
 *    4. channel  — configure first messaging channel
 *    5. done     — success state, launch dashboard
 * ------------------------------------------------------------------ */

type Provider = 'anthropic' | 'openai' | 'custom';
type Channel  = 'telegram' | 'discord' | 'whatsapp' | 'slack' | 'signal';

@customElement('onboard-wizard')
export class OnboardWizard extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--space-4);
      animation: slide-up 0.3s ease both;
    }

    /* ---- Progress bar ---- */
    .progress-wrap {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: var(--space-6);
    }

    .progress-track {
      flex: 1;
      height: 3px;
      background: var(--color-bg-overlay);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
      border-radius: var(--radius-full);
      transition: width var(--transition-slow);
    }

    .progress-label {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      white-space: nowrap;
    }

    /* ---- Card ---- */
    .card {
      background: var(--color-bg-elevated);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      margin-bottom: var(--space-4);
    }

    .step-tag {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 3px 10px;
      background: var(--color-primary-dim);
      color: var(--color-primary);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: var(--space-3);
    }

    h2 {
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
      margin-bottom: var(--space-2);
    }

    .subtitle {
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin-bottom: var(--space-5);
    }

    /* ---- Code block ---- */
    .code-block {
      position: relative;
      background: var(--color-bg-base);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      margin-bottom: var(--space-4);
    }

    .code-block code {
      font-family: var(--font-mono);
      font-size: var(--text-sm);
      color: var(--color-accent);
      word-break: break-all;
    }

    .code-block .copy-btn {
      position: absolute;
      top: var(--space-2);
      right: var(--space-2);
      padding: 4px 10px;
      background: var(--color-bg-overlay);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .code-block .copy-btn:hover {
      border-color: var(--color-primary);
      color: var(--color-primary);
    }

    .code-block .copy-btn.copied {
      color: var(--color-working);
      border-color: var(--color-working);
    }

    /* ---- Option grid ---- */
    .option-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    @media (min-width: 380px) {
      .option-grid.cols-3 {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    .option-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-4) var(--space-3);
      background: var(--color-bg-overlay);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-fast);
      text-align: center;
    }

    .option-card:hover {
      border-color: var(--color-border-active);
    }

    .option-card.selected {
      border-color: var(--color-primary);
      background: var(--color-primary-dim);
    }

    .option-icon {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      background: var(--color-bg-subtle);
    }

    .option-name {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
    }

    /* ---- Input ---- */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin-bottom: var(--space-4);
    }

    .field label {
      font-size: var(--text-xs);
      font-weight: var(--weight-semibold);
      color: var(--color-text-secondary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .field input {
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: var(--color-bg-base);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      font-size: var(--text-sm);
      color: var(--color-text-primary);
      font-family: var(--font-mono);
      box-sizing: border-box;
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
    }

    .field input::placeholder { color: var(--color-text-muted); }

    .field input:focus {
      outline: none;
      border-color: var(--color-border-active);
      box-shadow: var(--shadow-blue);
    }

    /* ---- Feature list ---- */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-bottom: var(--space-5);
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
    }

    .feature-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: var(--color-primary-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .feature-icon svg {
      width: 16px;
      height: 16px;
      color: var(--color-primary);
    }

    .feature-text strong {
      display: block;
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      color: var(--color-text-primary);
      margin-bottom: 2px;
    }

    .feature-text span {
      font-size: var(--text-xs);
      color: var(--color-text-muted);
      line-height: 1.5;
    }

    /* ---- Success ---- */
    .success-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-working-dim);
      border: 2px solid var(--color-working);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto var(--space-5);
      animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }

    .success-icon svg {
      width: 28px;
      height: 28px;
      color: var(--color-working);
    }

    .success-title {
      text-align: center;
      font-size: var(--text-xl);
      font-weight: var(--weight-bold);
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .success-sub {
      text-align: center;
      font-size: var(--text-sm);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-6);
    }

    .summary-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      justify-content: center;
      margin-bottom: var(--space-5);
    }

    .chip {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      padding: 4px 12px;
      background: var(--color-bg-overlay);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      font-size: var(--text-xs);
      color: var(--color-text-secondary);
    }

    .chip .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--color-working);
    }

    /* ---- Action buttons ---- */
    .actions {
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }

    .btn-primary {
      flex: 1;
      padding: var(--space-3) var(--space-5);
      background: var(--color-primary);
      color: #fff;
      border-radius: var(--radius-xl);
      font-size: var(--text-sm);
      font-weight: var(--weight-semibold);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      transition: background var(--transition-fast), transform var(--transition-fast);
      cursor: pointer;
    }

    .btn-primary:hover:not(:disabled) {
      background: var(--color-primary-hover);
      transform: scale(1.01);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      padding: var(--space-3) var(--space-4);
      background: transparent;
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      font-size: var(--text-sm);
      font-weight: var(--weight-medium);
      cursor: pointer;
      transition: all var(--transition-fast);
    }

    .btn-secondary:hover {
      border-color: var(--color-border-active);
      color: var(--color-text-primary);
    }

    .btn-icon svg {
      width: 16px;
      height: 16px;
    }

    /* ---- Animations ---- */
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes pop-in {
      from { opacity: 0; transform: scale(0.5); }
      to   { opacity: 1; transform: scale(1); }
    }
  `;

  @state() private step: OnboardStep = 'welcome';
  @state() private provider: Provider = 'anthropic';
  @state() private apiKey = '';
  @state() private channel: Channel = 'telegram';
  @state() private channelToken = '';
  @state() private copied = false;

  private readonly INSTALL_CMD = 'npm install -g openclaw@latest && openclaw onboard --install-daemon';
  private readonly STEPS: OnboardStep[] = ['welcome', 'install', 'model', 'channel', 'done'];

  private get progressPct(): number {
    const idx = this.STEPS.indexOf(this.step);
    return Math.round(((idx + 1) / this.STEPS.length) * 100);
  }

  private async copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    } catch {
      // clipboard blocked in insecure context — silently ignore
    }
  }

  private next(skip = false) {
    const idx = this.STEPS.indexOf(this.step);
    if (idx < this.STEPS.length - 1) {
      this.step = this.STEPS[idx + 1];
      onboardStepSignal.set(this.step);
    }
    if (!skip && this.step === 'done') {
      onboardDoneSignal.set(true);
    }
  }

  private back() {
    const idx = this.STEPS.indexOf(this.step);
    if (idx > 0) {
      this.step = this.STEPS[idx - 1];
      onboardStepSignal.set(this.step);
    }
  }

  private launch() {
    onboardDoneSignal.set(true);
    activeViewSignal.set('swarm');
  }

  // ------------------------------------------------------------------ //
  //  Step renderers
  // ------------------------------------------------------------------ //

  private renderWelcome() {
    return html`
      <div class="card">
        <div class="step-tag">Getting Started</div>
        <h2>Welcome to OpenClaw</h2>
        <p class="subtitle">
          Your personal AI assistant that runs on your own devices, connects to
          the channels you already use, and orchestrates a swarm of agents to
          work autonomously — 24/7.
        </p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                <path d="M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Multi-channel inbox</strong>
              <span>WhatsApp, Telegram, Slack, Discord, iMessage, Signal, and 15 more.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Local-first gateway</strong>
              <span>Runs on your hardware. No cloud lock-in. Full control.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Agent swarm</strong>
              <span>Coder, Researcher, Strategist — orchestrated in parallel.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" @click=${() => this.next()}>
          Start Setup
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </button>
        <button class="btn-secondary" @click=${() => this.launch()}>Skip</button>
      </div>
    `;
  }

  private renderInstall() {
    return html`
      <div class="card">
        <div class="step-tag">Step 1 of 3 — Install</div>
        <h2>One-liner install</h2>
        <p class="subtitle">
          Copy and run this command in your terminal. It installs OpenClaw globally
          and launches the interactive onboarding wizard that sets up the Gateway daemon,
          workspace, channels, and skills.
        </p>

        <div class="code-block">
          <code>${this.INSTALL_CMD}</code>
          <button
            class="copy-btn ${this.copied ? 'copied' : ''}"
            @click=${() => void this.copyToClipboard(this.INSTALL_CMD)}
          >
            ${this.copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Requires Node 22+</strong>
              <span>Works with npm, pnpm, or bun. macOS, Linux, Windows (WSL2).</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Daemon install</strong>
              <span>The wizard installs a launchd/systemd service so the Gateway stays alive.</span>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="feature-text">
              <strong>Docker alternative</strong>
              <span>Run <code>docker-setup.sh</code> for a fully containerised deployment.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-secondary" @click=${() => this.back()}>Back</button>
        <button class="btn-primary" @click=${() => this.next()}>
          Next: Choose Model
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </button>
      </div>
    `;
  }

  private renderModel() {
    const providers: { id: Provider; name: string; icon: string; desc: string }[] = [
      { id: 'anthropic', name: 'Anthropic', icon: 'A', desc: 'Claude Opus 4.6 (recommended)' },
      { id: 'openai',    name: 'OpenAI',    icon: 'O', desc: 'GPT-5 / Codex models' },
      { id: 'custom',    name: 'Custom',    icon: 'C', desc: 'Self-hosted or OpenRouter' },
    ];

    return html`
      <div class="card">
        <div class="step-tag">Step 2 of 3 — Model</div>
        <h2>Choose your AI provider</h2>
        <p class="subtitle">
          OpenClaw works with any OpenAI-compatible API. Anthropic Claude is
          recommended for long-context strength and prompt-injection resistance.
        </p>

        <div class="option-grid cols-3">
          ${providers.map((p) => html`
            <div
              class="option-card ${this.provider === p.id ? 'selected' : ''}"
              role="radio"
              aria-checked="${this.provider === p.id}"
              tabindex="0"
              @click=${() => (this.provider = p.id)}
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && (this.provider = p.id)}
            >
              <div class="option-icon">${p.icon}</div>
              <span class="option-name">${p.name}</span>
            </div>
          `)}
        </div>

        <div class="field">
          <label for="api-key">
            ${this.provider === 'anthropic' ? 'Anthropic API Key'
              : this.provider === 'openai'   ? 'OpenAI API Key'
              : 'API Key / Base URL'}
          </label>
          <input
            id="api-key"
            type="password"
            placeholder="${this.provider === 'anthropic' ? 'sk-ant-...'
              : this.provider === 'openai' ? 'sk-...'
              : 'https://api.example.com/v1'}"
            .value=${this.apiKey}
            @input=${(e: InputEvent) => (this.apiKey = (e.target as HTMLInputElement).value)}
            autocomplete="off"
          />
        </div>

        <p style="font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.6;">
          Your API key is stored locally in <code style="font-family: var(--font-mono); color: var(--color-accent);">~/.openclaw/openclaw.json</code> and never leaves your machine. You can also set it via <code style="font-family: var(--font-mono); color: var(--color-accent);">openclaw config set</code>.
        </p>
      </div>

      <div class="actions">
        <button class="btn-secondary" @click=${() => this.back()}>Back</button>
        <button
          class="btn-primary"
          @click=${() => this.next()}
        >
          Next: Connect Channel
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </button>
      </div>
    `;
  }

  private renderChannel() {
    const channels: { id: Channel; name: string; icon: string }[] = [
      { id: 'telegram',  name: 'Telegram',  icon: 'T' },
      { id: 'discord',   name: 'Discord',   icon: 'D' },
      { id: 'whatsapp',  name: 'WhatsApp',  icon: 'W' },
      { id: 'slack',     name: 'Slack',     icon: 'S' },
      { id: 'signal',    name: 'Signal',    icon: 'Si' },
    ];

    const tokenLabel = this.channel === 'whatsapp' ? 'QR scan — run `openclaw channels login` after install'
      : this.channel === 'signal'   ? 'signal-cli path — see docs'
      : 'Bot Token';

    const tokenPlaceholder = this.channel === 'telegram' ? '123456:ABCDef...'
      : this.channel === 'discord' ? 'MTk4...'
      : this.channel === 'slack'   ? 'xoxb-...'
      : '';

    return html`
      <div class="card">
        <div class="step-tag">Step 3 of 3 — Channel</div>
        <h2>Connect a messaging channel</h2>
        <p class="subtitle">
          Pick the channel you want to receive and send messages through. You can
          add more channels any time with <code style="font-family: var(--font-mono); color: var(--color-accent);">openclaw channels add</code>.
        </p>

        <div class="option-grid">
          ${channels.map((c) => html`
            <div
              class="option-card ${this.channel === c.id ? 'selected' : ''}"
              role="radio"
              aria-checked="${this.channel === c.id}"
              tabindex="0"
              @click=${() => (this.channel = c.id)}
              @keydown=${(e: KeyboardEvent) => e.key === 'Enter' && (this.channel = c.id)}
            >
              <div class="option-icon">${c.icon}</div>
              <span class="option-name">${c.name}</span>
            </div>
          `)}
        </div>

        ${this.channel !== 'whatsapp' && this.channel !== 'signal' ? html`
          <div class="field">
            <label for="ch-token">${tokenLabel}</label>
            <input
              id="ch-token"
              type="password"
              placeholder="${tokenPlaceholder}"
              .value=${this.channelToken}
              @input=${(e: InputEvent) => (this.channelToken = (e.target as HTMLInputElement).value)}
              autocomplete="off"
            />
          </div>
        ` : html`
          <div class="field">
            <label>${tokenLabel}</label>
            <div style="padding: var(--space-3) var(--space-4); background: var(--color-bg-base); border: 1px solid var(--color-border); border-radius: var(--radius-lg); font-size: var(--text-xs); color: var(--color-text-muted); font-family: var(--font-mono);">
              ${this.channel === 'whatsapp'
                ? 'openclaw channels login'
                : 'openclaw channels add --channel signal --path /path/to/signal-cli'}
            </div>
          </div>
        `}
      </div>

      <div class="actions">
        <button class="btn-secondary" @click=${() => this.back()}>Back</button>
        <button class="btn-primary" @click=${() => this.next()}>
          Complete Setup
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </button>
      </div>
    `;
  }

  private renderDone() {
    const channelName = this.channel.charAt(0).toUpperCase() + this.channel.slice(1);
    const providerName = this.provider === 'anthropic' ? 'Anthropic' : this.provider === 'openai' ? 'OpenAI' : 'Custom';

    return html`
      <div class="card">
        <div class="success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p class="success-title">Setup Complete</p>
        <p class="success-sub">
          OpenClaw is configured and ready. Run the install command in your
          terminal to start the Gateway daemon and connect your channels.
        </p>

        <div class="summary-chips">
          <div class="chip">
            <span class="dot"></span>
            ${providerName} selected
          </div>
          <div class="chip">
            <span class="dot"></span>
            ${channelName} channel
          </div>
          <div class="chip">
            <span class="dot"></span>
            Gateway :18789
          </div>
        </div>

        <div class="code-block">
          <code>${this.INSTALL_CMD}</code>
          <button
            class="copy-btn ${this.copied ? 'copied' : ''}"
            @click=${() => void this.copyToClipboard(this.INSTALL_CMD)}
          >
            ${this.copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <p style="font-size: var(--text-xs); color: var(--color-text-muted); line-height: 1.6; text-align: center; margin-bottom: var(--space-4);">
          After install, run <code style="font-family: var(--font-mono); color: var(--color-accent);">openclaw doctor</code> to verify health.
        </p>
      </div>

      <div class="actions">
        <button class="btn-primary" @click=${() => this.launch()}>
          Open Dashboard
          <span class="btn-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
        </button>
      </div>
    `;
  }

  // ------------------------------------------------------------------ //
  //  Root render
  // ------------------------------------------------------------------ //

  render() {
    const stepLabels: Record<OnboardStep, string> = {
      welcome: 'Welcome',
      install: 'Install',
      model:   'Model',
      channel: 'Channel',
      done:    'Done',
    };

    return html`
      <div class="progress-wrap">
        <div class="progress-track" role="progressbar" aria-valuenow="${this.progressPct}" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-fill" style="width: ${this.progressPct}%"></div>
        </div>
        <span class="progress-label">${stepLabels[this.step]}</span>
      </div>

      ${this.step === 'welcome' ? this.renderWelcome()
        : this.step === 'install' ? this.renderInstall()
        : this.step === 'model'   ? this.renderModel()
        : this.step === 'channel' ? this.renderChannel()
        : this.renderDone()
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'onboard-wizard': OnboardWizard;
  }
}
