const { getSupabaseClient } = require("../db/db");

module.exports.createInquiry = async (req, res) => {
  const supabase = getSupabaseClient();
  const { email, categories, inquiry_date, city, price_range, image_url, status } = req.body;

  try {
    // 1. Find partner by email
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("email", email)
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    // 2. Insert inquiry
    const { data, error } = await supabase
      .from("inquiries")
      .insert([
        {
          partner_id: partner.id,
          categories,
          inquiry_date,
          city,
          price_range,
          image_url,
          status: status ?? 1, 
        },
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ message: "Inquiry created successfully", inquiry: data[0] });
  } catch (err) {
    console.error("❌ Error creating inquiry:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
