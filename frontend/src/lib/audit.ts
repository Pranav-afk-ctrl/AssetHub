import { supabase } from "@/integrations/supabase/client";

export async function logAudit(params: {
  action: string;
  entity_type: string;
  entity_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await supabase.rpc("log_audit", {
    _action: params.action,
    _entity_type: params.entity_type,
    _entity_id: (params.entity_id ?? null) as unknown as string,
    _metadata: (params.metadata ?? {}) as never,
  });
}