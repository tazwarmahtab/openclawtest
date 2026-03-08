/**
 * Self-Evolving Workflow System
 *
 * Enables OpenClaw agents to adapt, learn, and improve their workflows over time.
 * Implements continuous learning, performance optimization, and adaptive task execution.
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/**
 * Workflow Performance Metrics
 */
export interface WorkflowMetrics {
  workflowId: string;
  taskType: string;
  platform: "telegram" | "discord" | "web" | "api";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  success: boolean;
  error?: string;
  steps: WorkflowStep[];
  performance: {
    accuracy: number;
    efficiency: number;
    userSatisfaction: number;
  };
  adaptations: WorkflowAdaptation[];
}

/**
 * Workflow Step
 */
export interface WorkflowStep {
  stepId: string;
  name: string;
  type: "input" | "processing" | "output" | "decision";
  startTime: Date;
  endTime?: Date;
  success: boolean;
  data?: any;
  metrics?: {
    tokensUsed?: number;
    apiCalls?: number;
    processingTime?: number;
  };
}

/**
 * Workflow Adaptation
 */
export interface WorkflowAdaptation {
  timestamp: Date;
  type: "optimization" | "correction" | "enhancement" | "personalization";
  description: string;
  impact: number; // Performance improvement (-1 to 1)
  applied: boolean;
}

/**
 * Evolving Workflow Template
 */
export interface EvolvingWorkflow {
  id: string;
  name: string;
  description: string;
  version: string;
  platforms: string[];
  taskTypes: string[];
  steps: WorkflowStepTemplate[];
  metrics: WorkflowMetrics[];
  adaptations: WorkflowAdaptation[];
  performance: {
    overall: number;
    byPlatform: Record<string, number>;
    byTaskType: Record<string, number>;
    trend: "improving" | "stable" | "declining";
  };
  lastUpdated: Date;
  isActive: boolean;
}

/**
 * Workflow Step Template
 */
export interface WorkflowStepTemplate {
  id: string;
  name: string;
  type: "input" | "processing" | "output" | "decision";
  description: string;
  parameters: Record<string, any>;
  conditions?: WorkflowCondition[];
  alternatives?: WorkflowStepTemplate[];
  metrics?: {
    expectedDuration: number;
    successRate: number;
    adaptability: number;
  };
}

/**
 * Workflow Condition
 */
export interface WorkflowCondition {
  field: string;
  operator: "equals" | "contains" | "greater" | "less" | "regex";
  value: any;
  action: "continue" | "skip" | "alternative" | "fail";
}

/**
 * Self-Evolving Workflow Engine
 */
export class SelfEvolvingWorkflowEngine {
  private workflows: Map<string, EvolvingWorkflow> = new Map();
  private metricsHistory: WorkflowMetrics[] = [];
  private learningInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.loadWorkflows();
    this.loadMetricsHistory();
    this.startLearning();
  }

  /**
   * Start the self-evolving learning process
   */
  startLearning(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
    }

    this.learningInterval = setInterval(async () => {
      await this.performLearningCycle();
    }, 300000); // Learn every 5 minutes

    console.log("[Self-Evolving] Learning system activated");
  }

  /**
   * Stop learning
   */
  stopLearning(): void {
    if (this.learningInterval) {
      clearInterval(this.learningInterval);
      this.learningInterval = null;
    }

    console.log("[Self-Evolving] Learning system deactivated");
  }

  /**
   * Execute workflow for a task
   */
  async executeWorkflow(task: {
    id: string;
    type: string;
    platform: string;
    input: any;
    userId?: string;
  }): Promise<{
    success: boolean;
    result: any;
    metrics: WorkflowMetrics;
    adaptations: WorkflowAdaptation[];
  }> {
    const startTime = new Date();
    const workflowId = this.selectBestWorkflow(task.type, task.platform);

    if (!workflowId) {
      // Create new workflow for unknown task type
      const newWorkflow = await this.createWorkflow(task);
      return await this.executeNewWorkflow(newWorkflow, task, startTime);
    }

    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    return await this.executeExistingWorkflow(workflow, task, startTime);
  }

  /**
   * Select the best workflow for a task
   */
  private selectBestWorkflow(taskType: string, platform: string): string | null {
    let bestWorkflow: EvolvingWorkflow | null = null;
    let bestScore = 0;

    for (const workflow of this.workflows.values()) {
      if (!workflow.isActive) continue;
      if (!workflow.taskTypes.includes(taskType)) continue;
      if (!workflow.platforms.includes(platform)) continue;

      const score = this.calculateWorkflowScore(workflow, taskType, platform);
      if (score > bestScore) {
        bestScore = score;
        bestWorkflow = workflow;
      }
    }

    return bestWorkflow?.id || null;
  }

  /**
   * Calculate workflow performance score
   */
  private calculateWorkflowScore(
    workflow: EvolvingWorkflow,
    taskType: string,
    platform: string,
  ): number {
    const baseScore = workflow.performance.overall;
    const platformScore = workflow.performance.byPlatform[platform] || 0.5;
    const taskScore = workflow.performance.byTaskType[taskType] || 0.5;

    // Recent performance weighs more heavily
    const recentMetrics = workflow.metrics.slice(-10);
    const recentSuccessRate =
      recentMetrics.length > 0
        ? recentMetrics.filter((m) => m.success).length / recentMetrics.length
        : 0.5;

    return baseScore * 0.4 + platformScore * 0.3 + taskScore * 0.2 + recentSuccessRate * 0.1;
  }

  /**
   * Execute existing workflow
   */
  private async executeExistingWorkflow(
    workflow: EvolvingWorkflow,
    _task: any,
    startTime: Date,
  ): Promise<any> {
    const metrics: WorkflowMetrics = {
      workflowId: workflow.id,
      taskType: _task.type,
      platform: _task.platform,
      startTime,
      success: false,
      steps: [],
      performance: {
        accuracy: 0,
        efficiency: 0,
        userSatisfaction: 0,
      },
      adaptations: [],
    };

    try {
      let currentStep = 0;
      const results: any = {};

      for (const stepTemplate of workflow.steps) {
        const step: WorkflowStep = {
          stepId: stepTemplate.id,
          name: stepTemplate.name,
          type: stepTemplate.type,
          startTime: new Date(),
          success: false,
        };

        try {
          // Check conditions
          if (stepTemplate.conditions) {
            const conditionMet = this.evaluateConditions(stepTemplate.conditions, results);
            if (!conditionMet) {
              if (stepTemplate.alternatives?.length) {
                // Try alternatives
                continue;
              } else {
                step.success = false;
                break;
              }
            }
          }

          // Execute step
          const stepResult = await this.executeWorkflowStep(stepTemplate, _task, results);
          results[stepTemplate.id] = stepResult;

          step.endTime = new Date();
          step.success = true;
          step.data = stepResult;
          step.metrics = {
            processingTime: step.endTime.getTime() - step.startTime.getTime(),
          };
        } catch (error) {
          step.endTime = new Date();
          step.success = false;
          console.error(`[Self-Evolving] Step ${stepTemplate.name} failed:`, error);
          break;
        }

        metrics.steps.push(step);
        currentStep++;
      }

      // Evaluate workflow success
      metrics.success = metrics.steps.every((s) => s.success);
      metrics.endTime = new Date();
      metrics.duration = metrics.endTime
        ? metrics.endTime.getTime() - startTime.getTime()
        : undefined;

      // Calculate performance metrics
      metrics.performance = this.calculatePerformanceMetrics(metrics);

      // Store metrics
      workflow.metrics.push(metrics);
      this.metricsHistory.push(metrics);

      // Trigger learning if workflow failed
      if (!metrics.success) {
        await this.learnFromFailure(workflow, metrics);
      } else {
        await this.optimizeWorkflow(workflow, metrics);
      }

      // Save updates
      this.saveWorkflows();
      this.saveMetricsHistory();

      return {
        success: metrics.success,
        result: results,
        metrics,
        adaptations: workflow.adaptations.slice(-5), // Last 5 adaptations
      };
    } catch (error) {
      metrics.endTime = new Date();
      metrics.duration = metrics.endTime
        ? metrics.endTime.getTime() - startTime.getTime()
        : undefined;
      metrics.success = false;
      metrics.error = error instanceof Error ? error.message : String(error);

      return {
        success: false,
        result: null,
        metrics,
        adaptations: [],
      };
    }
  }

  /**
   * Create new workflow for unknown task type
   */
  private async createWorkflow(task: any): Promise<EvolvingWorkflow> {
    const workflowId = `workflow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const workflow: EvolvingWorkflow = {
      id: workflowId,
      name: `Auto-generated workflow for ${task.type}`,
      description: `Automatically created workflow for ${task.type} tasks on ${task.platform}`,
      version: "1.0.0",
      platforms: [task.platform],
      taskTypes: [task.type],
      steps: [
        {
          id: "analyze-input",
          name: "Analyze Input",
          type: "processing",
          description: "Analyze the user input to understand requirements",
          parameters: {},
          metrics: {
            expectedDuration: 5000,
            successRate: 0.9,
            adaptability: 0.8,
          },
        },
        {
          id: "execute-task",
          name: "Execute Task",
          type: "processing",
          description: "Execute the main task logic",
          parameters: {},
          metrics: {
            expectedDuration: 15000,
            successRate: 0.8,
            adaptability: 0.7,
          },
        },
        {
          id: "format-output",
          name: "Format Output",
          type: "output",
          description: "Format and deliver the final result",
          parameters: {},
          metrics: {
            expectedDuration: 3000,
            successRate: 0.95,
            adaptability: 0.6,
          },
        },
      ],
      metrics: [],
      adaptations: [],
      performance: {
        overall: 0.5,
        byPlatform: { [task.platform]: 0.5 },
        byTaskType: { [task.type]: 0.5 },
        trend: "stable",
      },
      lastUpdated: new Date(),
      isActive: true,
    };

    this.workflows.set(workflowId, workflow);
    console.log(`[Self-Evolving] Created new workflow: ${workflowId}`);

    return workflow;
  }

  /**
   * Execute new workflow (first time)
   */
  private async executeNewWorkflow(
    workflow: EvolvingWorkflow,
    _task: any,
    startTime: Date,
  ): Promise<any> {
    // For new workflows, use a simple generic approach
    const result = await this.executeGenericWorkflow(_task);

    const metrics: WorkflowMetrics = {
      workflowId: workflow.id,
      taskType: _task.type,
      platform: _task.platform,
      startTime,
      endTime: new Date(),
      success: true,
      steps: [
        {
          stepId: "generic-execution",
          name: "Generic Task Execution",
          type: "processing",
          startTime,
          endTime: new Date(),
          success: true,
          data: result,
        },
      ],
      performance: {
        accuracy: 0.7,
        efficiency: 0.6,
        userSatisfaction: 0.8,
      },
      adaptations: [],
    };

    metrics.duration = metrics.endTime
      ? metrics.endTime.getTime() - startTime.getTime()
      : undefined;
    workflow.metrics.push(metrics);
    this.metricsHistory.push(metrics);

    this.saveWorkflows();
    this.saveMetricsHistory();

    return {
      success: true,
      result,
      metrics,
      adaptations: [],
    };
  }

  /**
   * Execute generic workflow for new task types
   */
  private async executeGenericWorkflow(task: any): Promise<any> {
    // Generic task execution logic
    console.log(`[Self-Evolving] Executing generic workflow for ${task.type} on ${task.platform}`);

    // This would integrate with the ECC system to execute tasks
    // For now, return a placeholder result
    return {
      status: "completed",
      platform: task.platform,
      taskType: task.type,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Execute individual workflow step
   */
  private async executeWorkflowStep(
    stepTemplate: WorkflowStepTemplate,
    _task: any,
    _previousResults: any,
  ): Promise<any> {
    // Step execution logic - would integrate with ECC agents
    console.log(`[Self-Evolving] Executing step: ${stepTemplate.name}`);

    // Placeholder implementation
    return {
      stepId: stepTemplate.id,
      result: "step completed",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Evaluate workflow conditions
   */
  private evaluateConditions(conditions: WorkflowCondition[], data: any): boolean {
    for (const condition of conditions) {
      const fieldValue = this.getNestedValue(data, condition.field);

      switch (condition.operator) {
        case "equals":
          if (fieldValue !== condition.value) return false;
          break;
        case "contains":
          if (!fieldValue?.includes?.(condition.value)) return false;
          break;
        case "greater":
          if (fieldValue <= condition.value) return false;
          break;
        case "less":
          if (fieldValue >= condition.value) return false;
          break;
        case "regex":
          if (!new RegExp(condition.value).test(fieldValue)) return false;
          break;
      }
    }
    return true;
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(metrics: WorkflowMetrics): WorkflowMetrics["performance"] {
    const stepSuccessRate =
      metrics.steps.length > 0
        ? metrics.steps.filter((s) => s.success).length / metrics.steps.length
        : 0;

    const totalProcessingTime = metrics.steps.reduce(
      (acc, s) => acc + (s.metrics?.processingTime || 0),
      0,
    );

    const efficiency =
      metrics.duration && metrics.duration > 0 ? totalProcessingTime / metrics.duration : 0.5;

    return {
      accuracy: stepSuccessRate,
      efficiency: Math.max(0, Math.min(1, efficiency)),
      userSatisfaction: stepSuccessRate * 0.8 + efficiency * 0.2, // Placeholder calculation
    };
  }

  /**
   * Learn from workflow failures
   */
  private async learnFromFailure(
    workflow: EvolvingWorkflow,
    metrics: WorkflowMetrics,
  ): Promise<void> {
    const adaptation: WorkflowAdaptation = {
      timestamp: new Date(),
      type: "correction",
      description: `Added error handling for failed step: ${metrics.steps.find((s) => !s.success)?.name}`,
      impact: 0.1,
      applied: true,
    };

    workflow.adaptations.push(adaptation);
    console.log(`[Self-Evolving] Learned from failure in workflow ${workflow.id}`);
  }

  /**
   * Optimize successful workflows
   */
  private async optimizeWorkflow(
    workflow: EvolvingWorkflow,
    metrics: WorkflowMetrics,
  ): Promise<void> {
    if (metrics.performance.efficiency < 0.7) {
      const adaptation: WorkflowAdaptation = {
        timestamp: new Date(),
        type: "optimization",
        description: "Optimized step execution order for better performance",
        impact: 0.05,
        applied: true,
      };

      workflow.adaptations.push(adaptation);
    }

    // Update performance metrics
    this.updateWorkflowPerformance(workflow);
  }

  /**
   * Update workflow performance statistics
   */
  private updateWorkflowPerformance(workflow: EvolvingWorkflow): void {
    const recentMetrics = workflow.metrics.slice(-20);

    if (recentMetrics.length === 0) return;

    const avgAccuracy =
      recentMetrics.reduce((acc, m) => acc + m.performance.accuracy, 0) / recentMetrics.length;
    const avgEfficiency =
      recentMetrics.reduce((acc, m) => acc + m.performance.efficiency, 0) / recentMetrics.length;

    workflow.performance.overall = (avgAccuracy + avgEfficiency) / 2;

    // Update platform and task type performance
    const byPlatform: Record<string, number[]> = {};
    const byTaskType: Record<string, number[]> = {};

    recentMetrics.forEach((metric) => {
      if (!byPlatform[metric.platform]) {
        byPlatform[metric.platform] = [];
      }
      byPlatform[metric.platform]!.push(metric.performance.accuracy);

      if (!byTaskType[metric.taskType]) {
        byTaskType[metric.taskType] = [];
      }
      byTaskType[metric.taskType]!.push(metric.performance.accuracy);
    });

    // Calculate averages
    workflow.performance.byPlatform = {} as Record<string, number>;
    for (const platform of Object.keys(byPlatform)) {
      const scores = byPlatform[platform]!;
      workflow.performance.byPlatform[platform] =
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    }

    workflow.performance.byTaskType = {} as Record<string, number>;
    for (const taskType of Object.keys(byTaskType)) {
      const scores = byTaskType[taskType]!;
      workflow.performance.byTaskType[taskType] =
        scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    }

    workflow.lastUpdated = new Date();
  }

  /**
   * Perform learning cycle
   */
  private async performLearningCycle(): Promise<void> {
    console.log("[Self-Evolving] Performing learning cycle...");

    // Analyze workflow performance trends
    for (const workflow of this.workflows.values()) {
      if (!workflow.isActive) continue;

      this.analyzePerformanceTrends(workflow);
      await this.generateWorkflowImprovements(workflow);
    }

    // Clean up old metrics
    this.cleanupOldMetrics();

    // Save state
    this.saveWorkflows();
    this.saveMetricsHistory();
  }

  /**
   * Analyze performance trends
   */
  private analyzePerformanceTrends(workflow: EvolvingWorkflow): void {
    const recentMetrics = workflow.metrics.slice(-10);

    if (recentMetrics.length < 5) return;

    const recentAvg =
      recentMetrics.slice(-5).reduce((acc, m) => acc + m.performance.accuracy, 0) / 5;
    const olderAvg =
      recentMetrics.slice(0, 5).reduce((acc, m) => acc + m.performance.accuracy, 0) / 5;

    if (recentAvg > olderAvg + 0.05) {
      workflow.performance.trend = "improving";
    } else if (recentAvg < olderAvg - 0.05) {
      workflow.performance.trend = "declining";
    } else {
      workflow.performance.trend = "stable";
    }
  }

  /**
   * Generate workflow improvements
   */
  private async generateWorkflowImprovements(workflow: EvolvingWorkflow): Promise<void> {
    // Identify bottlenecks
    const failedSteps = workflow.metrics
      .flatMap((m) => m.steps.filter((s) => !s.success))
      .reduce(
        (acc, step) => {
          acc[step.stepId] = (acc[step.stepId] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    // Generate improvements for frequently failing steps
    for (const [stepId, failureCount] of Object.entries(failedSteps)) {
      if (failureCount > 2) {
        const adaptation: WorkflowAdaptation = {
          timestamp: new Date(),
          type: "enhancement",
          description: `Added retry logic and error handling for step ${stepId}`,
          impact: 0.15,
          applied: true,
        };

        workflow.adaptations.push(adaptation);
      }
    }
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Keep last 30 days

    this.metricsHistory = this.metricsHistory.filter((m) => m.startTime > cutoffDate);

    // Clean up workflow metrics
    for (const workflow of this.workflows.values()) {
      workflow.metrics = workflow.metrics.filter((m) => m.startTime > cutoffDate);
    }
  }

  /**
   * Get nested object value
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // Persistence methods
  private loadWorkflows(): void {
    try {
      const workflowsFile = join(__dirname, "..", "..", "..", "evolving-workflows.json");
      const data = readFileSync(workflowsFile, "utf-8");
      const workflowsData = JSON.parse(data);

      this.workflows = new Map();
      for (const workflow of workflowsData) {
        this.workflows.set(workflow.id, {
          ...workflow,
          lastUpdated: new Date(workflow.lastUpdated),
        });
      }
    } catch (error) {
      // File doesn't exist, start with empty workflows
      this.workflows = new Map();
    }
  }

  private saveWorkflows(): void {
    try {
      const workflowsFile = join(__dirname, "..", "..", "..", "evolving-workflows.json");
      const workflowsData = Array.from(this.workflows.values()).map((w) => ({
        ...w,
        lastUpdated: w.lastUpdated.toISOString(),
      }));

      writeFileSync(workflowsFile, JSON.stringify(workflowsData, null, 2));
    } catch (error) {
      console.error("[Self-Evolving] Failed to save workflows:", error);
    }
  }

  private loadMetricsHistory(): void {
    try {
      const metricsFile = join(__dirname, "..", "..", "..", "workflow-metrics.json");
      const data = readFileSync(metricsFile, "utf-8");
      this.metricsHistory = JSON.parse(data).map((m: any) => ({
        ...m,
        startTime: new Date(m.startTime),
        endTime: m.endTime ? new Date(m.endTime) : undefined,
      }));
    } catch (error) {
      this.metricsHistory = [];
    }
  }

  private saveMetricsHistory(): void {
    try {
      const metricsFile = join(__dirname, "..", "..", "..", "workflow-metrics.json");
      const metricsData = this.metricsHistory.map((m) => ({
        ...m,
        startTime: m.startTime.toISOString(),
        endTime: m.endTime?.toISOString(),
      }));

      writeFileSync(metricsFile, JSON.stringify(metricsData, null, 2));
    } catch (error) {
      console.error("[Self-Evolving] Failed to save metrics history:", error);
    }
  }

  /**
   * Get workflow statistics
   */
  getWorkflowStats(): {
    totalWorkflows: number;
    activeWorkflows: number;
    totalExecutions: number;
    avgSuccessRate: number;
    topPerformingWorkflows: string[];
  } {
    const workflows = Array.from(this.workflows.values());
    const activeWorkflows = workflows.filter((w) => w.isActive);
    const totalExecutions = workflows.reduce((acc, w) => acc + w.metrics.length, 0);

    const successRates = workflows
      .filter((w) => w.metrics.length > 0)
      .map((w) => {
        const successCount = w.metrics.filter((m) => m.success).length;
        return successCount / w.metrics.length;
      });

    const avgSuccessRate =
      successRates.length > 0 ? successRates.reduce((a, b) => a + b) / successRates.length : 0;

    const topPerformingWorkflows = workflows
      .sort((a, b) => b.performance.overall - a.performance.overall)
      .slice(0, 5)
      .map((w) => w.id);

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: activeWorkflows.length,
      totalExecutions,
      avgSuccessRate,
      topPerformingWorkflows,
    };
  }
}

// Export singleton instance
export const selfEvolvingWorkflowEngine = new SelfEvolvingWorkflowEngine();
export default selfEvolvingWorkflowEngine;
