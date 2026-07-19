const { NhostClient } = require('@nhost/nhost-js');

const nhost = new NhostClient({
  subdomain: process.env.NHOST_SUBDOMAIN,
  region: process.env.NHOST_REGION
});

exports.handler = async () => {
  try {
    // Find all pending alerts that are due now
    const { data, error } = await nhost.graphql.request(`
      query GetDueAlerts {
        collection_alerts(
          where: {
            status: { _eq: "pending" },
            _or: [
              { next_reminder_trigger: { _lte: "now()" } },
              { next_main_trigger: { _lte: "now()" } }
            ]
          }
        ) { id user_id tag_id notify_push notify_email notify_inapp }
      }
    `);

    if (error) throw error;
    const alerts = data.collection_alerts;

    // Mark each alert as triggered — database handles all auto‑updates
    for (const alert of alerts) {
      await nhost.graphql.request(`
        mutation FireAlert($id: uuid!) {
          update_collection_alerts_by_pk(
            pk_columns: { id: $id },
            _set: { status: "triggered" }
          ) { id }
        }
      `, { variables: { id: alert.id } });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, processed: alerts.length })
    };
  } catch (err) {
    console.error("Trigger Error:", err);
    return { statusCode: 500, body: err.message };
  }
};