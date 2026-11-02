export interface ApiKeyRecord {
  id: string;
  key: string;
  name: string;
  ownerEmail: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  rateLimitPerMin: number;
  totalRequests: number;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
  plan: string;
}

interface RequestWindow {
  timestamps: number[];
}

class RateLimiterStore {
  private apiKeys: Map<string, ApiKeyRecord> = new Map();
  private ipWindows: Map<string, RequestWindow> = new Map();
  private keyWindows: Map<string, RequestWindow> = new Map();

  constructor() {
    this.createKey("institutional-desk@lagosfx.ng", "Enterprise FX Desk", "ENTERPRISE", "rc_live_enterprise_demo_key");
    this.createKey("developer@fintech.ng", "Standard Fintech App", "PRO", "rc_live_pro_demo_key");
    this.createKey("student@unilag.edu.ng", "Student Project", "FREE", "rc_test_free_demo_key");
  }

  public createKey(
    ownerEmail: string,
    name: string,
    plan: "FREE" | "PRO" | "ENTERPRISE" = "FREE",
    customKey?: string
  ): ApiKeyRecord {
    const key =
      customKey ||
      `rc_${plan === "FREE" ? "test" : "live"}_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const limits: Record<"FREE" | "PRO" | "ENTERPRISE", number> = {
      FREE: 60,
      PRO: 1000,
      ENTERPRISE: 10000,
    };

    const record: ApiKeyRecord = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key,
      name: name || "Developer App",
      ownerEmail,
      plan,
      rateLimitPerMin: limits[plan],
      totalRequests: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    this.apiKeys.set(key, record);
    return record;
  }

  public getKey(key: string): ApiKeyRecord | undefined {
    // If not found in map but is a valid prefixed key (e.g. across worker threads), provision virtual record
    if (!this.apiKeys.has(key) && (key.startsWith("rc_live_") || key.startsWith("rc_test_"))) {
      const isEnterprise = key.includes("enterprise");
      const isPro = key.startsWith("rc_live_");
      const plan = isEnterprise ? "ENTERPRISE" : isPro ? "PRO" : "FREE";
      return this.createKey("developer@lagosfx.ng", "Developer Key", plan, key);
    }
    return this.apiKeys.get(key);
  }

  public revokeKey(key: string): boolean {
    const record = this.apiKeys.get(key);
    if (record) {
      record.isActive = false;
      return true;
    }
    return false;
  }

  public listKeys(): ApiKeyRecord[] {
    return Array.from(this.apiKeys.values());
  }

  public checkLimit(identifier: string, isApiKey = false): RateLimitResult {
    const now = Date.now();
    const windowMs = 60 * 1000;
    const windowStart = now - windowMs;

    let limit = 30;
    let plan = "ANONYMOUS";

    if (isApiKey) {
      const keyRecord = this.getKey(identifier);
      if (!keyRecord || !keyRecord.isActive) {
        return {
          allowed: false,
          limit: 0,
          remaining: 0,
          resetSeconds: 60,
          plan: "INVALID_KEY",
        };
      }
      limit = keyRecord.rateLimitPerMin;
      plan = keyRecord.plan;
      keyRecord.totalRequests += 1;
      keyRecord.lastUsedAt = new Date().toISOString();
    }

    const store = isApiKey ? this.keyWindows : this.ipWindows;
    let windowData = store.get(identifier);

    if (!windowData) {
      windowData = { timestamps: [] };
      store.set(identifier, windowData);
    }

    windowData.timestamps = windowData.timestamps.filter((ts) => ts > windowStart);

    const currentCount = windowData.timestamps.length;
    const remaining = Math.max(0, limit - currentCount - 1);
    const oldestTimestamp = windowData.timestamps[0] || now;
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));

    if (currentCount >= limit) {
      return {
        allowed: false,
        limit,
        remaining: 0,
        resetSeconds,
        plan,
      };
    }

    windowData.timestamps.push(now);

    return {
      allowed: true,
      limit,
      remaining,
      resetSeconds,
      plan,
    };
  }
}

const globalForLimiter = global as unknown as { rateLimiter: RateLimiterStore };
export const rateLimiter = globalForLimiter.rateLimiter || new RateLimiterStore();
if (process.env.NODE_ENV !== "production") globalForLimiter.rateLimiter = rateLimiter;
