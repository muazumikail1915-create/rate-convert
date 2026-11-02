import {
  DBCurrency,
  DBRateSource,
  DBExchangeRate,
  DBHistoricalRate,
  DBRateAlert,
  DBMarketSession,
  DBUser,
  DBRefreshToken,
  DBVerificationToken,
  DBAuditLog,
  UserRole,
} from "./types";
import {
  SUPPORTED_CURRENCIES,
  PROVIDER_SOURCES,
  BASE_RATES_TO_NGN,
  CURRENT_MARKET_METRICS,
  generateHistoricalData,
} from "../mock-rates";
import bcrypt from "bcryptjs";

class DatabaseRepository {
  private currencies: Map<string, DBCurrency> = new Map();
  private rateSources: Map<string, DBRateSource> = new Map();
  private exchangeRates: DBExchangeRate[] = [];
  private rateAlerts: Map<string, DBRateAlert> = new Map();
  private marketSession: DBMarketSession;

  // Live FX Feed State
  private liveBaseRatesToNgn: Record<string, { official: number; bank: number; provider: number }> = {
    ...BASE_RATES_TO_NGN,
  };
  private lastLiveSync: string = new Date().toISOString();
  private liveSyncSource: string = "SEED";

  // Auth State
  private users: Map<string, DBUser> = new Map();
  private refreshTokens: Map<string, DBRefreshToken> = new Map(); // key = tokenHash
  private verificationTokens: Map<string, DBVerificationToken> = new Map(); // key = identifier_type
  private auditLogs: DBAuditLog[] = [];

  constructor() {
    // Seed Currencies
    SUPPORTED_CURRENCIES.forEach((c) => {
      this.currencies.set(c.code, {
        id: `curr_${c.code.toLowerCase()}`,
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        country: c.country,
        countryCode: c.countryCode,
        flagEmoji: c.flagEmoji,
        decimals: c.decimals,
        category: c.category,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Seed Rate Sources
    PROVIDER_SOURCES.forEach((s) => {
      this.rateSources.set(s.id, {
        id: s.id,
        name: s.name,
        type: s.type,
        logoText: s.logoText || s.name.slice(0, 3).toUpperCase(),
        color: s.color || "#334155",
        isActive: true,
        deliverySpeed: s.deliveryTime,
        fixedFee: s.fixedFee,
        percentFee: s.percentFee,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Seed Initial Exchange Rates
    Object.keys(BASE_RATES_TO_NGN).forEach((baseCode) => {
      const rateObj = BASE_RATES_TO_NGN[baseCode];
      PROVIDER_SOURCES.forEach((source) => {
        const rateVal = rateObj[source.type] || rateObj.official;
        this.exchangeRates.push({
          id: `rate_${source.id}_${baseCode}_NGN`,
          sourceId: source.id,
          baseCurrencyCode: baseCode,
          targetCurrencyCode: "NGN",
          buyRate: rateVal,
          sellRate: Number((rateVal * 1.004).toFixed(4)),
          midRate: Number((rateVal * 1.002).toFixed(4)),
          fixedFee: source.fixedFee,
          percentFee: source.percentFee,
          isStale: false,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        });
      });
    });

    // Seed Market Session
    this.marketSession = {
      id: "nfem-window",
      name: CURRENT_MARKET_METRICS.marketSession,
      openTimeWAT: "09:00",
      closeTimeWAT: "16:30",
      status: CURRENT_MARKET_METRICS.marketStatus,
      cbnRate: CURRENT_MARKET_METRICS.cbnRate,
      cbnChange24h: CURRENT_MARKET_METRICS.cbnChange24h,
      parallelMidRate: CURRENT_MARKET_METRICS.parallelMidRate,
      parallelChange24h: CURRENT_MARKET_METRICS.parallelChange24h,
      spreadPercent: CURRENT_MARKET_METRICS.spreadPercent,
      turnover24hUsd: CURRENT_MARKET_METRICS.turnover24hUsd,
      lastUpdatedWAT: new Date().toISOString(),
    };

    // Seed Initial RBAC Users (Default test credentials)
    const userHash = bcrypt.hashSync("User123!", 10);
    const adminHash = bcrypt.hashSync("Admin123!", 10);
    const superAdminHash = bcrypt.hashSync("SuperAdmin123!", 10);

    const initialUsers: DBUser[] = [
      {
        id: "usr_regular_001",
        email: "user@rateconvert.com",
        name: "Standard Trader",
        passwordHash: userHash,
        role: "USER",
        status: "ACTIVE",
        mfaEnabled: false,
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_admin_002",
        email: "admin@rateconvert.com",
        name: "Desk Administrator",
        passwordHash: adminHash,
        role: "ADMIN",
        status: "ACTIVE",
        mfaEnabled: true,
        mfaSecret: "JBSWY3DPEHPK3PXP",
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "usr_superadmin_003",
        email: "superadmin@rateconvert.com",
        name: "Chief Systems Officer",
        passwordHash: superAdminHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
        mfaEnabled: true,
        mfaSecret: "KREESTC7MRUWEV2V",
        failedLoginAttempts: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    initialUsers.forEach((u) => this.users.set(u.id, u));
  }

  // --- Currency Operations ---
  public getCurrencies(category?: string): DBCurrency[] {
    const list = Array.from(this.currencies.values()).filter((c) => c.isActive);
    if (category && category !== "all") {
      return list.filter((c) => c.category === category);
    }
    return list;
  }

  public getCurrencyByCode(code: string): DBCurrency | undefined {
    return this.currencies.get(code.toUpperCase());
  }

  // --- Rate Source Operations ---
  public getRateSources(type?: string): DBRateSource[] {
    const list = Array.from(this.rateSources.values()).filter((s) => s.isActive);
    if (type && type !== "all") {
      return list.filter((s) => s.type === type);
    }
    return list;
  }

  // --- Exchange Rate Operations ---
  public getExchangeRates(baseCode: string, targetCode: string): DBExchangeRate[] {
    const base = baseCode.toUpperCase();
    const target = targetCode.toUpperCase();

    const baseObj = this.liveBaseRatesToNgn[base] || BASE_RATES_TO_NGN[base] || { official: 1, bank: 1, provider: 1 };
    const targetObj = this.liveBaseRatesToNgn[target] || BASE_RATES_TO_NGN[target] || { official: 1, bank: 1, provider: 1 };

    return Array.from(this.rateSources.values()).map((source) => {
      const rateKey = (source.type === "bank" ? "bank" : source.type === "official" ? "official" : "provider") as "official" | "bank" | "provider";
      const baseInNgn = baseObj[rateKey] || baseObj.official;
      const targetInNgn = targetObj[rateKey] || targetObj.official;
      const pairRate = baseInNgn / targetInNgn;

      return {
        id: `rate_${source.id}_${base}_${target}`,
        sourceId: source.id,
        baseCurrencyCode: base,
        targetCurrencyCode: target,
        buyRate: Number(pairRate.toFixed(4)),
        sellRate: Number((pairRate * 1.004).toFixed(4)),
        midRate: Number((pairRate * 1.002).toFixed(4)),
        fixedFee: source.fixedFee,
        percentFee: source.percentFee,
        isStale: false,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    });
  }

  // --- Historical Rate Operations ---
  public getHistoricalRates(
    baseCode: string,
    targetCode: string,
    timeframe: "24H" | "7D" | "30D" | "90D" | "1Y"
  ): DBHistoricalRate[] {
    const points = generateHistoricalData(baseCode, targetCode, timeframe, "official");
    return points.map((p, idx) => ({
      id: `hist_${baseCode}_${targetCode}_${timeframe}_${idx}`,
      pair: `${baseCode}_${targetCode}`,
      timeframe,
      rate: p.rate,
      high: p.high,
      low: p.low,
      volume: p.volume || 150000,
      timestamp: p.timestamp,
    }));
  }

  // --- Rate Alert Operations ---
  public createAlert(alert: Omit<DBRateAlert, "id" | "createdAt" | "status">): DBRateAlert {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAlert: DBRateAlert = {
      ...alert,
      id,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    };
    this.rateAlerts.set(id, newAlert);
    return newAlert;
  }

  public getAlertsByUser(userContact: string): DBRateAlert[] {
    return Array.from(this.rateAlerts.values()).filter(
      (a) => a.userContact.toLowerCase() === userContact.toLowerCase()
    );
  }

  // --- Market Session Operations ---
  public getMarketSession(): DBMarketSession {
    return {
      ...this.marketSession,
      lastUpdatedWAT: new Date().toISOString(),
    };
  }

  // --- Live FX Feed Operations ---

  public updateLiveRates(
    rates: Record<string, { official: number; bank: number; provider: number }>,
    marketSessionUpdate?: Partial<DBMarketSession>,
    sourceLabel?: string
  ): { updatedCount: number; alertsEvaluated: number; alertsTriggered: number } {
    // 1. Update live rates map
    Object.keys(rates).forEach((code) => {
      this.liveBaseRatesToNgn[code.toUpperCase()] = rates[code];
    });

    this.lastLiveSync = new Date().toISOString();
    if (sourceLabel) this.liveSyncSource = sourceLabel;

    // 2. Update market session metrics if provided
    if (marketSessionUpdate) {
      this.marketSession = {
        ...this.marketSession,
        ...marketSessionUpdate,
        lastUpdatedWAT: new Date().toISOString(),
      };
    }

    // 3. Evaluate active user alerts
    let alertsEvaluated = 0;
    let alertsTriggered = 0;
    const allAlerts = Array.from(this.rateAlerts.values());

    allAlerts.forEach((alert) => {
      if (alert.status === "ACTIVE") {
        alertsEvaluated++;
        const currentRates = this.getExchangeRates(alert.baseCurrency, alert.targetCurrency);
        const currentRate = currentRates[0]?.buyRate;

        if (currentRate !== undefined) {
          let isTriggered = false;
          if (alert.direction === "ABOVE" && currentRate >= alert.targetRate) {
            isTriggered = true;
          } else if (alert.direction === "BELOW" && currentRate <= alert.targetRate) {
            isTriggered = true;
          }

          if (isTriggered) {
            alert.status = "TRIGGERED";
            alert.triggeredAt = new Date().toISOString();
            this.rateAlerts.set(alert.id, alert);
            alertsTriggered++;

            // Create system audit entry
            this.createAuditLog({
              action: "RATE_ALERT_TRIGGERED",
              resource: alert.id,
              details: {
                userContact: alert.userContact,
                pair: `${alert.baseCurrency}/${alert.targetCurrency}`,
                targetRate: alert.targetRate,
                triggeredRate: currentRate,
                direction: alert.direction,
              },
            });
          }
        }
      }
    });

    return {
      updatedCount: Object.keys(rates).length,
      alertsEvaluated,
      alertsTriggered,
    };
  }

  public getLiveSyncInfo(): {
    lastSync: string;
    source: string;
    trackedCurrencies: number;
    activeAlerts: number;
  } {
    const activeAlerts = Array.from(this.rateAlerts.values()).filter(
      (a) => a.status === "ACTIVE"
    ).length;
    return {
      lastSync: this.lastLiveSync,
      source: this.liveSyncSource,
      trackedCurrencies: Object.keys(this.liveBaseRatesToNgn).length,
      activeAlerts,
    };
  }

  // --- User & RBAC Operations ---

  public createUser(userData: {
    email: string;
    name: string;
    passwordHash: string;
    role?: UserRole;
    status?: DBUser["status"];
    mfaEnabled?: boolean;
    mfaSecret?: string;
  }): DBUser {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const newUser: DBUser = {
      id,
      email: userData.email.toLowerCase().trim(),
      name: userData.name.trim(),
      passwordHash: userData.passwordHash,
      role: userData.role || "USER",
      status: userData.status || "PENDING_VERIFICATION",
      mfaEnabled: userData.mfaEnabled || false,
      mfaSecret: userData.mfaSecret,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);
    return newUser;
  }

  public getUserByEmail(email: string): DBUser | undefined {
    const normalized = email.toLowerCase().trim();
    const allUsers = Array.from(this.users.values());
    for (const user of allUsers) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  public getUserById(id: string): DBUser | undefined {
    return this.users.get(id);
  }

  public updateUser(id: string, updates: Partial<DBUser>): DBUser | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser: DBUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  public getAllUsers(): Omit<DBUser, "passwordHash" | "mfaSecret">[] {
    return Array.from(this.users.values()).map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      mfaEnabled: u.mfaEnabled,
      failedLoginAttempts: u.failedLoginAttempts,
      lockoutUntil: u.lockoutUntil,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  }

  // --- Verification Tokens (Email OTP, 2FA, Reset) ---

  public createVerificationToken(
    identifier: string,
    type: DBVerificationToken["type"],
    token: string,
    ttlMinutes = 15
  ): DBVerificationToken {
    const id = `vt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
    const key = `${identifier.toLowerCase()}_${type}`;
    const item: DBVerificationToken = {
      id,
      identifier: identifier.toLowerCase(),
      token,
      type,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    this.verificationTokens.set(key, item);
    return item;
  }

  public getVerificationToken(
    identifier: string,
    type: DBVerificationToken["type"]
  ): DBVerificationToken | undefined {
    const key = `${identifier.toLowerCase()}_${type}`;
    return this.verificationTokens.get(key);
  }

  public deleteVerificationToken(
    identifier: string,
    type: DBVerificationToken["type"]
  ): void {
    const key = `${identifier.toLowerCase()}_${type}`;
    this.verificationTokens.delete(key);
  }

  // --- Refresh Tokens (Session Persistence & Rotation) ---

  public storeRefreshToken(
    tokenHash: string,
    userId: string,
    expiresAt: string,
    userAgent?: string,
    ipAddress?: string
  ): DBRefreshToken {
    const id = `rt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const session: DBRefreshToken = {
      id,
      tokenHash,
      userId,
      userAgent,
      ipAddress,
      revoked: false,
      expiresAt,
      createdAt: new Date().toISOString(),
    };
    this.refreshTokens.set(tokenHash, session);
    return session;
  }

  public getRefreshToken(tokenHash: string): DBRefreshToken | undefined {
    return this.refreshTokens.get(tokenHash);
  }

  public revokeRefreshToken(tokenHash: string): void {
    const token = this.refreshTokens.get(tokenHash);
    if (token) {
      token.revoked = true;
      this.refreshTokens.set(tokenHash, token);
    }
  }

  public revokeAllUserTokens(userId: string): void {
    const entries = Array.from(this.refreshTokens.entries());
    for (const [hash, token] of entries) {
      if (token.userId === userId) {
        token.revoked = true;
        this.refreshTokens.set(hash, token);
      }
    }
  }

  // --- Audit Logging ---

  public createAuditLog(entry: {
    userId?: string;
    userEmail?: string;
    action: string;
    resource?: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): DBAuditLog {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const logItem: DBAuditLog = {
      id,
      userId: entry.userId,
      userEmail: entry.userEmail,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: entry.ipAddress || "127.0.0.1",
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(logItem);
    // Keep max 200 logs in memory
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
    return logItem;
  }

  public getAuditLogs(limit = 50): DBAuditLog[] {
    return this.auditLogs.slice(0, limit);
  }
}

// Global Singleton Instance for Next.js API Routes
const globalForDb = global as unknown as { dbRepo: DatabaseRepository };
export const db = globalForDb.dbRepo || new DatabaseRepository();
if (process.env.NODE_ENV !== "production") globalForDb.dbRepo = db;
