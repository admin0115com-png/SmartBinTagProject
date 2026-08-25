export default async function handler(req: any, res: any) {
  const authHeader = req.headers['authorization'];
  const cronSecret = process.env.CRON_SECRET || 'sbt-cron-secret-2026';

  if (authHeader && authHeader !== `Bearer ${cronSecret}` && req.query?.secret !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized scheduler trigger' });
  }

  const nowIso = new Date().toISOString();
  const nhostGraphqlUrl = process.env.NHOST_GRAPHQL_URL || 'https://jhyjbbjydclysmghqggs.graphql.eu-central-1.nhost.run/v1';
  const nhostAdminSecret = process.env.NHOST_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET || '';

  try {
    const fetchQuery = {
      query: `query GetDueAlerts($now: timestamptz!) {
        collection_alerts(
          where: {
            scheduled_at: { _lte: $now },
            status: { _eq: "scheduled" },
            enabled: { _eq: true }
          },
          limit: 50
        ) {
          id
          serial_number
          user_id
          alert_type
          scheduled_at
        }
      }`,
      variables: { now: nowIso }
    };

    const response = await fetch(nhostGraphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(nhostAdminSecret ? { 'x-hasura-admin-secret': nhostAdminSecret } : {})
      },
      body: JSON.stringify(fetchQuery)
    });

    const json: any = await response.json();
    const dueAlerts = json?.data?.collection_alerts || [];

    for (const alert of dueAlerts) {
      const updateQuery = {
        query: `mutation MarkAlertSent($id: String!, $sent_at: timestamptz!) {
          update_collection_alerts_by_pk(
            pk_columns: { id: $id },
            _set: { status: "sent", sent_at: $sent_at }
          ) {
            id
          }
        }`,
        variables: { id: alert.id, sent_at: nowIso }
      };

      await fetch(nhostGraphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(nhostAdminSecret ? { 'x-hasura-admin-secret': nhostAdminSecret } : {})
        },
        body: JSON.stringify(updateQuery)
      });
    }

    return res.status(200).json({
      success: true,
      timestamp: nowIso,
      processedCount: dueAlerts.length
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Scheduler failed'
    });
  }
}
