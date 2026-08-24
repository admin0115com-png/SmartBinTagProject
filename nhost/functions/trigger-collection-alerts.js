module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const adminSecret = process.env.NHOST_ADMIN_SECRET || process.env.HASURA_GRAPHQL_ADMIN_SECRET;
    const subdomain = process.env.NHOST_SUBDOMAIN || 'sjpksyugwmepoxjjvzyq';
    const region = process.env.NHOST_REGION || 'eu-central-1';
    const graphqlUrl = process.env.NHOST_GRAPHQL_URL || `https://${subdomain}.hasura.${region}.nhost.run/v1/graphql`;

    const headers = { 'Content-Type': 'application/json' };
    if (adminSecret) {
      headers['x-hasura-admin-secret'] = adminSecret;
    }

    // 1. Find all pending alerts that are due now
    const getQuery = `
      query GetDueAlerts {
        collection_alerts(
          where: {
            status: { _eq: "pending" },
            _or: [
              { next_reminder_trigger: { _lte: "now()" } },
              { next_main_trigger: { _lte: "now()" } }
            ]
          }
        ) {
          id
          user_id
          tag_id
          notify_push
          notify_email
          notify_inapp
        }
      }
    `;

    const fetchResponse = await fetch(graphqlUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: getQuery }),
    });

    const responseData = await fetchResponse.json();
    const alerts = responseData?.data?.collection_alerts || [];

    // 2. Mark each alert as triggered
    const updateMutation = `
      mutation FireAlert($id: uuid!) {
        update_collection_alerts_by_pk(
          pk_columns: { id: $id },
          _set: { status: "triggered" }
        ) {
          id
        }
      }
    `;

    for (const alert of alerts) {
      await fetch(graphqlUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: updateMutation,
          variables: { id: alert.id },
        }),
      });
    }

    return res.status(200).json({ success: true, processed: alerts.length });
  } catch (err) {
    console.error("Trigger Error:", err);
    return res.status(500).json({ success: false, error: err.message || 'Internal error' });
  }
};
