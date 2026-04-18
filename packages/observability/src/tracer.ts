type TracerConfig = {
  service: string;
  env: string;
  endpoint?: string;
};

let initialized = false;

export async function initTracer(config: TracerConfig): Promise<void> {
  if (initialized) return;
  initialized = true;

  if (!config.endpoint) {
    return;
  }

  try {
    const otel = await import("@opentelemetry/sdk-node").catch(() => null);
    const otlp = await import("@opentelemetry/exporter-trace-otlp-http").catch(() => null);
    const resources = await import("@opentelemetry/resources").catch(() => null);
    const semconv = await import("@opentelemetry/semantic-conventions").catch(() => null);

    if (!otel || !otlp || !resources || !semconv) {
      console.warn("[observability] OTEL deps not installed; skipping tracer init.");
      return;
    }

    const sdk = new otel.NodeSDK({
      resource: new resources.Resource({
        [semconv.SemanticResourceAttributes.SERVICE_NAME]: config.service,
        [semconv.SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.env,
      }),
      traceExporter: new otlp.OTLPTraceExporter({ url: config.endpoint }),
    });

    sdk.start();
  } catch (error) {
    console.warn("[observability] tracer init failed:", error);
  }
}
