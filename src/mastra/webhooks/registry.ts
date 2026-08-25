import fs from "fs";
import path from "path";
import type { ServiceConfig } from "./types";

interface RegistryConfig {
  services: Record<string, ServiceConfig>;
}

export class WebhookRegistry {
  private services: Map<string, ServiceConfig> = new Map();
  private configPath = path.join(
    process.cwd(),
    "src/mastra/webhooks/service-registry.json"
  );

  loadRegistry(): void {
    try {
      const configData = fs.readFileSync(this.configPath, "utf-8");
      const config: RegistryConfig = JSON.parse(configData);

      for (const [name, serviceConfig] of Object.entries(config.services)) {
        this.services.set(name, serviceConfig);
      }

      console.log(`[Registry] Loaded ${this.services.size} services`);
    } catch (error) {
      console.error("[Registry] Failed to load service registry:", error);
      throw error;
    }
  }

  getServiceUrl(type: string): string {
    const service = this.services.get(type);
    if (!service) {
      throw new Error(`Service not found: ${type}`);
    }
    return service.url;
  }

  getServiceConfig(type: string): ServiceConfig | undefined {
    return this.services.get(type);
  }

  registerService(type: string, config: ServiceConfig): void {
    this.services.set(type, config);
    console.log(`[Registry] Registered service: ${type} @ ${config.url}`);
  }

  getAllServices(): Map<string, ServiceConfig> {
    return new Map(this.services);
  }
}
