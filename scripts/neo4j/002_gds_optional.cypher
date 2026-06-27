// Optional GDS trust scoring — requires Neo4j GDS plugin (Aura Pro / self-managed).
// Safe to skip on Aura Free; the app falls back to Cypher degree metrics.

CALL gds.graph.drop('mizizi_cooperative_trust', false);

CALL gds.graph.project(
  'mizizi_cooperative_trust',
  ['Farmer', 'Cooperative'],
  { MEMBER_OF: { orientation: 'UNDIRECTED' } }
);

CALL gds.pageRank.write('mizizi_cooperative_trust', { writeProperty: 'trustScore' })
YIELD nodePropertiesWritten;
