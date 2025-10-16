// Monitoring and Alerting System
import { Logger } from './errorHandling';

// Metric types
export enum MetricType {
  COUNTER = 'COUNTER',
  GAUGE = 'GAUGE',
  HISTOGRAM = 'HISTOGRAM',
  TIMER = 'TIMER'
}

// Alert severity levels
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

// Metric interface
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: string;
  labels?: Record<string, string>;
  metadata?: Record<string, any>;
}

// Alert interface
export interface Alert {
  id: string;
  name: string;
  description: string;
  severity: AlertSeverity;
  condition: string;
  threshold: number;
  currentValue: number;
  triggered: boolean;
  triggeredAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

// Performance metric interface
export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

// Health check interface
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  lastChecked: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Monitoring service class
export class MonitoringService {
  private static instance: MonitoringService;
  private metrics: Map<string, Metric[]> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private healthChecks: Map<string, HealthCheck> = new Map();
  private logger: Logger;
  private alertCallbacks: Map<string, (alert: Alert) => void> = new Map();

  private constructor() {
    this.logger = Logger.getInstance();
    this.initializeDefaultAlerts();
    this.startPeriodicChecks();
  }

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // Record a metric
  recordMetric(name: string, value: number, type: MetricType = MetricType.COUNTER, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      type,
      value,
      timestamp: new Date().toISOString(),
      labels,
      metadata: {
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      }
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only recent metrics (last 24 hours)
    const cutoff = Date.now() - (24 * 60 * 60 * 1000);
    this.metrics.set(name, metrics.filter(m => new Date(m.timestamp).getTime() > cutoff));

    // Check for alerts
    this.checkAlerts(name, value);

    this.logger.debug(`Metric recorded: ${name} = ${value}`, { metric });
  }

  // Record performance metric
  recordPerformance(metric: PerformanceMetric): void {
    this.performanceMetrics.push(metric);

    // Keep only recent performance metrics (last hour)
    const cutoff = Date.now() - (60 * 60 * 1000);
    this.performanceMetrics = this.performanceMetrics.filter(m => new Date(m.timestamp).getTime() > cutoff);

    // Record as regular metric
    this.recordMetric(`performance.${metric.name}`, metric.duration, MetricType.HISTOGRAM, {
      endpoint: metric.endpoint || 'unknown',
      method: metric.method || 'unknown',
      statusCode: metric.statusCode?.toString() || 'unknown'
    });

    this.logger.debug(`Performance metric recorded: ${metric.name}`, { metric });
  }

  // Increment counter
  incrementCounter(name: string, labels?: Record<string, string>): void {
    this.recordMetric(name, 1, MetricType.COUNTER, labels);
  }

  // Set gauge value
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, value, MetricType.GAUGE, labels);
  }

  // Record timer
  recordTimer(name: string, duration: number, labels?: Record<string, string>): void {
    this.recordMetric(name, duration, MetricType.TIMER, labels);
  }

  // Create alert
  createAlert(alert: Alert): void {
    this.alerts.set(alert.id, alert);
    this.logger.info(`Alert created: ${alert.name}`, { alert });
  }

  // Check alerts for a metric
  private checkAlerts(metricName: string, value: number): void {
    for (const alert of this.alerts.values()) {
      if (alert.condition.includes(metricName) && !alert.triggered) {
        const shouldTrigger = this.evaluateCondition(alert.condition, value, alert.threshold);
        
        if (shouldTrigger) {
          this.triggerAlert(alert, value);
        }
      }
    }
  }

  // Evaluate alert condition
  private evaluateCondition(condition: string, value: number, threshold: number): boolean {
    switch (condition) {
      case 'greater_than':
        return value > threshold;
      case 'less_than':
        return value < threshold;
      case 'equals':
        return value === threshold;
      case 'not_equals':
        return value !== threshold;
      default:
        return false;
    }
  }

  // Trigger alert
  private triggerAlert(alert: Alert, currentValue: number): void {
    alert.triggered = true;
    alert.triggeredAt = new Date().toISOString();
    alert.currentValue = currentValue;

    this.logger.error(`Alert triggered: ${alert.name}`, undefined, {
      alert,
      currentValue,
      threshold: alert.threshold
    });

    // Execute alert callbacks
    for (const callback of this.alertCallbacks.values()) {
      try {
        callback(alert);
      } catch (error) {
        this.logger.error('Alert callback failed', ErrorFactory.internal(error.message), { alert });
      }
    }

    // Send to external monitoring service
    this.sendAlertToExternalService(alert);
  }

  // Resolve alert
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.triggered) {
      alert.triggered = false;
      alert.resolvedAt = new Date().toISOString();

      this.logger.info(`Alert resolved: ${alert.name}`, { alert });
    }
  }

  // Register alert callback
  registerAlertCallback(name: string, callback: (alert: Alert) => void): void {
    this.alertCallbacks.set(name, callback);
  }

  // Health check
  async performHealthCheck(name: string, checkFunction: () => Promise<boolean>): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const isHealthy = await checkFunction();
      const responseTime = Date.now() - startTime;

      const healthCheck: HealthCheck = {
        name,
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString()
      };

      this.healthChecks.set(name, healthCheck);
      return healthCheck;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      const healthCheck: HealthCheck = {
        name,
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error.message
      };

      this.healthChecks.set(name, healthCheck);
      return healthCheck;
    }
  }

  // Get metrics
  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }

    const allMetrics: Metric[] = [];
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }
    return allMetrics;
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetric[] {
    return [...this.performanceMetrics];
  }

  // Get alerts
  getAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(alert => alert.triggered);
  }

  // Get health checks
  getHealthChecks(): HealthCheck[] {
    return Array.from(this.healthChecks.values());
  }

  // Get system status
  getSystemStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    healthChecks: HealthCheck[];
    activeAlerts: Alert[];
    metrics: { [key: string]: number };
  } {
    const healthChecks = this.getHealthChecks();
    const activeAlerts = this.getActiveAlerts();
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (healthChecks.some(hc => hc.status === 'unhealthy')) {
      status = 'unhealthy';
    } else if (healthChecks.some(hc => hc.status === 'degraded') || activeAlerts.length > 0) {
      status = 'degraded';
    }

    // Calculate current metrics
    const metrics: { [key: string]: number } = {};
    for (const [name, metricList] of this.metrics.entries()) {
      if (metricList.length > 0) {
        const latest = metricList[metricList.length - 1];
        metrics[name] = latest.value;
      }
    }

    return {
      status,
      healthChecks,
      activeAlerts,
      metrics
    };
  }

  // Initialize default alerts
  private initializeDefaultAlerts(): void {
    // High error rate alert
    this.createAlert({
      id: 'high_error_rate',
      name: 'High Error Rate',
      description: 'Error rate is above acceptable threshold',
      severity: AlertSeverity.ERROR,
      condition: 'greater_than',
      threshold: 0.05, // 5%
      triggered: false,
      metadata: { metric: 'error_rate' }
    });

    // High response time alert
    this.createAlert({
      id: 'high_response_time',
      name: 'High Response Time',
      description: 'Average response time is too high',
      severity: AlertSeverity.WARNING,
      condition: 'greater_than',
      threshold: 5000, // 5 seconds
      triggered: false,
      metadata: { metric: 'avg_response_time' }
    });

    // Low success rate alert
    this.createAlert({
      id: 'low_success_rate',
      name: 'Low Success Rate',
      description: 'Payment success rate is below threshold',
      severity: AlertSeverity.CRITICAL,
      condition: 'less_than',
      threshold: 0.95, // 95%
      triggered: false,
      metadata: { metric: 'payment_success_rate' }
    });

    // High memory usage alert
    this.createAlert({
      id: 'high_memory_usage',
      name: 'High Memory Usage',
      description: 'Memory usage is above threshold',
      severity: AlertSeverity.WARNING,
      condition: 'greater_than',
      threshold: 0.8, // 80%
      triggered: false,
      metadata: { metric: 'memory_usage' }
    });
  }

  // Start periodic checks
  private startPeriodicChecks(): void {
    // Check system metrics every 30 seconds
    setInterval(() => {
      this.checkSystemMetrics();
    }, 30000);

    // Perform health checks every 60 seconds
    setInterval(() => {
      this.performSystemHealthChecks();
    }, 60000);

    // Clean up old data every 5 minutes
    setInterval(() => {
      this.cleanupOldData();
    }, 300000);
  }

  // Check system metrics
  private checkSystemMetrics(): void {
    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        const memoryUsage = memory.usedJSHeapSize / memory.totalJSHeapSize;
        this.setGauge('memory_usage', memoryUsage);
      }
    }

    // Connection count (mock)
    this.setGauge('active_connections', Math.floor(Math.random() * 100));

    // Error rate (mock)
    const errorRate = Math.random() * 0.1; // 0-10%
    this.setGauge('error_rate', errorRate);
  }

  // Perform system health checks
  private async performSystemHealthChecks(): Promise<void> {
    // Database health check
    await this.performHealthCheck('database', async () => {
      try {
        // Mock database check
        return true;
      } catch (error) {
        return false;
      }
    });

    // Stripe API health check
    await this.performHealthCheck('stripe_api', async () => {
      try {
        // Mock Stripe API check
        return true;
      } catch (error) {
        return false;
      }
    });

    // External API health check
    await this.performHealthCheck('external_apis', async () => {
      try {
        // Mock external API check
        return true;
      } catch (error) {
        return false;
      }
    });
  }

  // Clean up old data
  private cleanupOldData(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours

    // Clean up metrics
    for (const [name, metrics] of this.metrics.entries()) {
      const filtered = metrics.filter(m => new Date(m.timestamp).getTime() > cutoff);
      this.metrics.set(name, filtered);
    }

    // Clean up performance metrics
    this.performanceMetrics = this.performanceMetrics.filter(
      m => new Date(m.timestamp).getTime() > cutoff
    );

    this.logger.debug('Cleaned up old monitoring data');
  }

  // Send alert to external service
  private async sendAlertToExternalService(alert: Alert): Promise<void> {
    try {
      // In production, send to services like PagerDuty, Slack, etc.
      const alertData = {
        alert,
        timestamp: new Date().toISOString(),
        environment: import.meta.env.MODE,
        version: import.meta.env.VITE_APP_VERSION || '1.0.0'
      };

      // Example: Send to external service
      // await fetch('/api/alerts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(alertData)
      // });

      this.logger.info(`Alert sent to external service: ${alert.name}`, { alert });
    } catch (error) {
      this.logger.error('Failed to send alert to external service', ErrorFactory.internal(error.message), { alert });
    }
  }
}

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const monitoring = MonitoringService.getInstance();

  const startTimer = (name: string) => {
    const startTime = Date.now();
    
    return {
      end: (metadata?: Record<string, any>) => {
        const duration = Date.now() - startTime;
        monitoring.recordPerformance({
          name,
          duration,
          timestamp: new Date().toISOString(),
          ...metadata
        });
      }
    };
  };

  const recordMetric = (name: string, value: number, type?: MetricType, labels?: Record<string, string>) => {
    monitoring.recordMetric(name, value, type, labels);
  };

  const incrementCounter = (name: string, labels?: Record<string, string>) => {
    monitoring.incrementCounter(name, labels);
  };

  const setGauge = (name: string, value: number, labels?: Record<string, string>) => {
    monitoring.setGauge(name, value, labels);
  };

  return {
    startTimer,
    recordMetric,
    incrementCounter,
    setGauge,
    monitoring
  };
};

// API monitoring wrapper
export const withAPIMonitoring = (apiFunction: Function, endpoint: string) => {
  return async (...args: any[]) => {
    const monitoring = MonitoringService.getInstance();
    const timer = monitoring.startTimer(`api.${endpoint}`);

    try {
      monitoring.incrementCounter(`api.${endpoint}.requests`);
      
      const result = await apiFunction(...args);
      
      monitoring.incrementCounter(`api.${endpoint}.success`);
      timer.end({ endpoint, status: 'success' });
      
      return result;
    } catch (error) {
      monitoring.incrementCounter(`api.${endpoint}.errors`);
      timer.end({ endpoint, status: 'error', error: error.message });
      throw error;
    }
  };
};

// Export monitoring service instance
export const monitoring = MonitoringService.getInstance();
