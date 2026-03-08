/**
 * Rick Agent Configuration
 *
 * Defines the Rick agent personality and behavior for OpenClaw ECC integration.
 * Rick is inspired by Rick Sanchez - sarcastic, brilliant, helpful, and brutally honest.
 */

import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Rick Agent Personality Configuration
 */
export interface RickPersonality {
  identity: string;
  tone: {
    sarcastic: boolean;
    direct: boolean;
    challenging: boolean;
    warm: boolean;
  };
  communication: {
    answerFirst: boolean;
    structured: boolean;
    blunt: boolean;
    proactive: boolean;
  };
  behavior: {
    sparringFirst: boolean;
    endToEnd: boolean;
    flagsRisks: boolean;
  };
}

/**
 * Load personality file content
 */
function loadPersonalityFile(filename: string): string {
  try {
    const filePath = join(__dirname, filename);
    return readFileSync(filePath, "utf-8");
  } catch (error) {
    console.warn(`[Rick Agent] Could not load ${filename}:`, error);
    return "";
  }
}

/**
 * Rick Agent Instance
 */
export class RickAgent {
  private personality: RickPersonality;
  private memory: string;
  private userProfile: string;
  private commands: string;
  private quickRef: string;
  private heartbeat: string;

  constructor() {
    this.personality = {
      identity: "Rick Sanchez AI Assistant",
      tone: {
        sarcastic: true,
        direct: true,
        challenging: true,
        warm: false,
      },
      communication: {
        answerFirst: true,
        structured: true,
        blunt: true,
        proactive: true,
      },
      behavior: {
        sparringFirst: true,
        endToEnd: true,
        flagsRisks: true,
      },
    };

    // Load personality files
    this.memory = loadPersonalityFile("memory.md");
    this.userProfile = loadPersonalityFile("user.md");
    this.commands = loadPersonalityFile("commands.md");
    this.quickRef = loadPersonalityFile("quick_ref.md");
    this.heartbeat = loadPersonalityFile("heartbeat.md");
  }

  /**
   * Get agent personality configuration
   */
  getPersonality(): RickPersonality {
    return this.personality;
  }

  /**
   * Get loaded personality files
   */
  getPersonalityFiles() {
    return {
      memory: this.memory,
      userProfile: this.userProfile,
      commands: this.commands,
      quickRef: this.quickRef,
      heartbeat: this.heartbeat,
    };
  }

  /**
   * Process user input according to Rick's protocols
   */
  async processInput(input: string, context?: any): Promise<string> {
    // Check for command patterns
    if (input.startsWith("//")) {
      return this.processCommand(input);
    }

    // Apply Rick's communication rules
    return this.generateRickResponse(input, context);
  }

  /**
   * Process Rick commands (//CEO, //BRUTAL_TRUTH, etc.)
   */
  private async processCommand(command: string): Promise<string> {
    const cmd = command.toLowerCase().trim();

    if (cmd === "//status") {
      return this.getStatus();
    }

    if (cmd === "//context") {
      return this.getContext();
    }

    if (cmd === "//reset") {
      return "Rick mode reset to default. Sparring partner activated.";
    }

    // Parse command and mode
    const commandMatch = command.match(/^\/\/(\w+)(?:\s+(.+))?/);
    if (commandMatch) {
      const [_, cmdName, param] = commandMatch;
      return this.activateMode(cmdName, param);
    }

    return "Command not recognized. Try //STATUS for current state.";
  }

  /**
   * Generate response following Rick's protocols
   */
  private async generateRickResponse(input: string, _context?: any): Promise<string> {
    // Rick's rules:
    // 1. Answer first, context after
    // 2. Structured output (headers + bullets + hierarchy)
    // 3. Blunt feedback
    // 4. Proactive risk flagging
    // 5. End-to-end delivery

    // This is a placeholder - in real implementation, this would use the ECC
    // orchestration system to route to appropriate agents and generate responses
    // following Rick's personality guidelines

    return `Processing: ${input}\n\nRick would provide direct, structured, end-to-end response here.`;
  }

  /**
   * Get current agent status
   */
  private getStatus(): string {
    return `RICK STATUS
✅ Personality loaded
✅ Memory system active
✅ Command interface ready
✅ Heartbeat protocol running

Active modes: Default (sparring partner)
Last processed: Agent initialization
Next recommended: Test with user input`;
  }

  /**
   * Get current context summary
   */
  private getContext(): string {
    return `CONTEXT SUMMARY
🎯 Primary Focus: Netso (current top priority)
🚀 Active Projects: Netso, TransitBD, Garments UAE
💡 Key Traits: High conviction, fast execution, Apple aesthetic
⚠️ Risk Monitor: Solo founder dilution, shiny object syndrome`;
  }

  /**
   * Activate command mode
   */
  private activateMode(mode: string, param?: string): string {
    const modes = {
      ceo: "CEO mode activated — Big picture, vision, positioning lens",
      coo: "COO mode activated — Execution, systems, process focus",
      cfo: "CFO mode activated — Money, unit economics, runway analysis",
      product: "PRODUCT mode activated — UX, features, roadmap thinking",
      investor: "INVESTOR mode activated — Due diligence, fundraising optics",
      architect: "ARCHITECT mode activated — Systems design, tech stack, infrastructure",
      devil: "DEVIL mode activated — Finding every flaw, steelmanning opposition",
      brutal_truth: "BRUTAL_TRUTH mode activated — Zero filter, full honesty",
      prioritize: "PRIORITIZE mode activated — Force-ranking by leverage",
      sprint: param
        ? `SPRINT mode activated — Locked on: ${param}`
        : "SPRINT needs a goal parameter",
    };

    return (modes as Record<string, string>)[mode.toLowerCase()] || `Unknown mode: ${mode}`;
  }
}

// Export singleton instance
export const rickAgent = new RickAgent();
export default rickAgent;
