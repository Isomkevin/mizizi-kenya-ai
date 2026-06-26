import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { DecisionDetail, FarmerProfile, GraphPayload } from "@/api/types";
import {
  getDb,
  resetDb as resetLocalDb,
  saveDb,
  type MiziziDatabase,
} from "@/server/db/local-store";
import { serverEnv } from "@/server/env";

export interface PersistenceAdapter {
  getDb(): Promise<MiziziDatabase>;
  saveDb(db: MiziziDatabase): Promise<void>;
  resetDb(): Promise<MiziziDatabase>;
  listFarmers(): Promise<FarmerProfile[]>;
  getFarmerById(id: string): Promise<FarmerProfile | undefined>;
  upsertFarmer(farmer: FarmerProfile): Promise<FarmerProfile>;
  listDecisions(): Promise<DecisionDetail[]>;
  getDecisionById(id: string): Promise<DecisionDetail | undefined>;
  upsertDecision(decision: DecisionDetail): Promise<DecisionDetail>;
  getGraphByFarmerId(farmerId: string): Promise<GraphPayload | undefined>;
  saveGraphByFarmerId(farmerId: string, graph: GraphPayload): Promise<GraphPayload>;
}

class LocalPersistence implements PersistenceAdapter {
  async getDb(): Promise<MiziziDatabase> {
    return getDb();
  }

  async saveDb(db: MiziziDatabase): Promise<void> {
    await saveDb(db);
  }

  async resetDb(): Promise<MiziziDatabase> {
    return resetLocalDb();
  }

  async listFarmers(): Promise<FarmerProfile[]> {
    const db = await getDb();
    return db.farmers;
  }

  async getFarmerById(id: string): Promise<FarmerProfile | undefined> {
    const db = await getDb();
    return db.farmers.find((farmer) => farmer.id === id || farmer.farmerId === id);
  }

  async upsertFarmer(farmer: FarmerProfile): Promise<FarmerProfile> {
    const db = await getDb();
    const index = db.farmers.findIndex((record) => record.id === farmer.id);
    if (index === -1) {
      db.farmers.push(farmer);
    } else {
      db.farmers[index] = farmer;
    }
    await saveDb(db);
    return farmer;
  }

  async listDecisions(): Promise<DecisionDetail[]> {
    const db = await getDb();
    return db.decisions;
  }

  async getDecisionById(id: string): Promise<DecisionDetail | undefined> {
    const db = await getDb();
    return db.decisions.find((decision) => decision.id === id);
  }

  async upsertDecision(decision: DecisionDetail): Promise<DecisionDetail> {
    const db = await getDb();
    const index = db.decisions.findIndex((item) => item.id === decision.id);
    if (index === -1) {
      db.decisions.push(decision);
    } else {
      db.decisions[index] = decision;
    }
    await saveDb(db);
    return decision;
  }

  async getGraphByFarmerId(farmerId: string): Promise<GraphPayload | undefined> {
    const db = await getDb();
    return db.graphs[farmerId];
  }

  async saveGraphByFarmerId(farmerId: string, graph: GraphPayload): Promise<GraphPayload> {
    const db = await getDb();
    db.graphs[farmerId] = graph;
    await saveDb(db);
    return graph;
  }
}

class SupabasePersistence implements PersistenceAdapter {
  private readonly client: SupabaseClient | null;
  private readonly fallback = new LocalPersistence();

  constructor() {
    const url = serverEnv.supabaseUrl();
    const key = serverEnv.supabaseServiceKey() ?? serverEnv.supabaseAnonKey();
    this.client = url && key ? createClient(url, key) : null;
  }

  async getDb(): Promise<MiziziDatabase> {
    return this.fallback.getDb();
  }

  async saveDb(db: MiziziDatabase): Promise<void> {
    await this.fallback.saveDb(db);
  }

  async resetDb(): Promise<MiziziDatabase> {
    return this.fallback.resetDb();
  }

  async listFarmers(): Promise<FarmerProfile[]> {
    if (!this.client) return this.fallback.listFarmers();
    try {
      const { data, error } = await this.client.from("farmers").select("*").limit(250);
      if (error || !data) return this.fallback.listFarmers();
      return data as FarmerProfile[];
    } catch {
      return this.fallback.listFarmers();
    }
  }

  async getFarmerById(id: string): Promise<FarmerProfile | undefined> {
    if (!this.client) return this.fallback.getFarmerById(id);
    try {
      const { data, error } = await this.client
        .from("farmers")
        .select("*")
        .or(`id.eq.${id},farmer_id.eq.${id}`)
        .maybeSingle();
      if (error || !data) return this.fallback.getFarmerById(id);
      return data as FarmerProfile;
    } catch {
      return this.fallback.getFarmerById(id);
    }
  }

  async upsertFarmer(farmer: FarmerProfile): Promise<FarmerProfile> {
    if (!this.client) return this.fallback.upsertFarmer(farmer);
    try {
      const { error } = await this.client.from("farmers").upsert({
        id: farmer.id,
        tenant_id: serverEnv.tenantId(),
        farmer_id: farmer.farmerId,
        profile: farmer,
      });
      if (error) return this.fallback.upsertFarmer(farmer);
      return farmer;
    } catch {
      return this.fallback.upsertFarmer(farmer);
    }
  }

  async listDecisions(): Promise<DecisionDetail[]> {
    if (!this.client) return this.fallback.listDecisions();
    try {
      const { data, error } = await this.client.from("decisions").select("*").limit(250);
      if (error || !data) return this.fallback.listDecisions();
      return data.map((row) => row.payload as DecisionDetail);
    } catch {
      return this.fallback.listDecisions();
    }
  }

  async getDecisionById(id: string): Promise<DecisionDetail | undefined> {
    if (!this.client) return this.fallback.getDecisionById(id);
    try {
      const { data, error } = await this.client
        .from("decisions")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error || !data) return this.fallback.getDecisionById(id);
      return data.payload as DecisionDetail;
    } catch {
      return this.fallback.getDecisionById(id);
    }
  }

  async upsertDecision(decision: DecisionDetail): Promise<DecisionDetail> {
    if (!this.client) return this.fallback.upsertDecision(decision);
    try {
      const { error } = await this.client.from("decisions").upsert({
        id: decision.id,
        tenant_id: serverEnv.tenantId(),
        farmer_id: decision.farmerId,
        status: decision.status,
        payload: decision,
      });
      if (error) return this.fallback.upsertDecision(decision);
      return decision;
    } catch {
      return this.fallback.upsertDecision(decision);
    }
  }

  async getGraphByFarmerId(farmerId: string): Promise<GraphPayload | undefined> {
    return this.fallback.getGraphByFarmerId(farmerId);
  }

  async saveGraphByFarmerId(farmerId: string, graph: GraphPayload): Promise<GraphPayload> {
    return this.fallback.saveGraphByFarmerId(farmerId, graph);
  }
}

let persistence: PersistenceAdapter | null = null;

export function getPersistence(): PersistenceAdapter {
  if (persistence) return persistence;
  persistence = serverEnv.useLocalStore() ? new LocalPersistence() : new SupabasePersistence();
  return persistence;
}
