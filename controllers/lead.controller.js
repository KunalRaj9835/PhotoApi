const { getSupabaseClient } = require("../db/db");

module.exports.getLeads = async (req, res) => {
  const supabase = getSupabaseClient();
  const { category, price_range, city } = req.query;

  if (!category) {
    return res.status(400).json({ error: "Category query param is required" });
  }

  try {
    // Build filters
    let query = supabase
      .from("inquiries")
      .select(`
        *,
        partners(id, firstname, lastname, email)
      `)
      .eq("status", 0) // only status = 1
      .contains("categories", [category]); // category array contains searched tag

    if (price_range) {
      query = query.eq("price_range", price_range);
    }
    if (city) {
      query = query.eq("city", city);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.status(200).json({ leads: data });
  } catch (err) {
    console.error("❌ Error fetching leads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
