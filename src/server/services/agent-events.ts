import type { AgentEvent, AgentEventStatus, AgentEventStep } from "@/api/types";
import { getDb, saveDb } from "@/server/db/local-store";

const MAX_EVENTS = 500;

function id(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function recordAgentEvent(
  event: Omit<AgentEvent, "id" | "startedAt"> & { startedAt?: string },
): Promise<AgentEvent> {
  const db = await getDb();
  const full: AgentEvent = {
    id: id(),
    startedAt: event.startedAt ?? new Date().toISOString(),
    ...event,
  } as AgentEvent;
  const next = [full, ...(db.agentEvents ?? [])].slice(0, MAX_EVENTS);
  await saveDb({ ...db, agentEvents: next });
  return full;
}

export async function updateAgentEvent(
  eventId: string,
  patch: Partial<AgentEvent> & { status?: AgentEventStatus },
): Promise<AgentEvent | undefined> {
  const db = await getDb();
  const events = db.agentEvents ?? [];
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx < 0) return undefined;
  const prev = events[idx];
  const completedAt =
    patch.status && ["success", "failed"].includes(patch.status)
      ? new Date().toISOString()
      : prev.completedAt;
  const durationMs = completedAt
    ? new Date(completedAt).getTime() - new Date(prev.startedAt).getTime()
    : prev.durationMs;
  const next: AgentEvent = { ...prev, ...patch, completedAt, durationMs };
  const list = [...events];
  list[idx] = next;
  await saveDb({ ...db, agentEvents: list });
  return next;
}

export async function listAgentEvents(params?: {
  farmerId?: string;
  pipelineId?: string;
  limit?: number;
}): Promise<AgentEvent[]> {
  const db = await getDb();
  let events = db.agentEvents ?? [];
  if (params?.farmerId) events = events.filter((e) => e.farmerId === params.farmerId);
  if (params?.pipelineId) events = events.filter((e) => e.pipelineId === params.pipelineId);
  const limit = params?.limit ?? 100;
  return events.slice(0, limit);
}

export function pipelineId(): string {
  return `pipe_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type { AgentEvent, AgentEventStatus, AgentEventStep };
