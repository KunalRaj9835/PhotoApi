const { getSupabaseClient } = require("../db/db");

module.exports.addReview = async (req, res) => {
  const supabase = getSupabaseClient();
  const { email, review, comment } = req.body;

  try {
    // Find partner by email
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .select("id")
      .eq("email", email)
      .single();

    if (partnerError || !partner) {
      return res.status(404).json({ error: "Partner not found" });
    }

    // Insert new review
    const { data, error } = await supabase
      .from("review")
      .insert([
        {
          partner_id: partner.id,
          review,
          comment,
        },
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ message: "Review added successfully", review: data[0] });
  } catch (err) {
    console.error("❌ Error adding review:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.editReview = async (req, res) => {
  const supabase = getSupabaseClient();
  const { id } = req.params;
  const { review, comment } = req.body;

  if (review === undefined && comment === undefined) {
    return res.status(400).json({ error: "At least one field (review or comment) must be provided" });
  }

  try {
    const updateData = {};
    if (review !== undefined) updateData.review = review;
    if (comment !== undefined) updateData.comment = comment;
    updateData.updated_at = new Date();

    const { data, error } = await supabase
      .from("review")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: "Review not found" });

    return res.status(200).json({ message: "Review updated successfully", review: data[0] });
  } catch (err) {
    console.error("❌ Error editing review:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.deleteReview = async (req, res) => {
  const supabase = getSupabaseClient();
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("review")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: "Review not found" });

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting review:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
