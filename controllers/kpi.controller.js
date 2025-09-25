const { getSupabaseClient } = require("../db/db");

module.exports.getKPI = async (req, res) => {
  const supabase = getSupabaseClient();

  try {
    // Count clients (status = 1)
    const { count: clientsCount, error: clientsError } = await supabase
      .from("partners")
      .select("*", { count: "exact" })
      .eq("status", 1);

    if (clientsError) throw clientsError;

    // Count partners (status = 3)
    const { count: partnersCount, error: partnersError } = await supabase
      .from("partners")
      .select("*", { count: "exact" })
      .eq("status", 3);

    if (partnersError) throw partnersError;

    // Count pending verifications (status = 2)
    const { count: pendingCount, error: pendingError } = await supabase
      .from("partners")
      .select("*", { count: "exact" })
      .eq("status", 2);

    if (pendingError) throw pendingError;

    // Count total inquiries
    const { count: inquiriesCount, error: inquiriesError } = await supabase
      .from("inquiries")
      .select("*", { count: "exact" });

    if (inquiriesError) throw inquiriesError;

    return res.status(200).json({
      total_clients: clientsCount,
      total_partners: partnersCount,
      pending_verifications: pendingCount,
      total_inquiries: inquiriesCount
    });
  } catch (err) {
    console.error("❌ Error fetching KPI:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
