const { getSupabaseClient } = require("../db/db");

module.exports.addPhoto = async (req, res) => {
  const supabase = getSupabaseClient();
  const { email, image_url, description, index } = req.body;

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

    // Insert new album photo
    const { data, error } = await supabase
      .from("album")
      .insert([
        {
          partner_id: partner.id,
          image_url,
          description,
          index,
        },
      ])
      .select();

    if (error) throw error;

    return res.status(201).json({ message: "Photo added successfully", photo: data[0] });
  } catch (err) {
    console.error("❌ Error adding photo:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports.editPhoto = async (req, res) => {
  const supabase = getSupabaseClient();
  const { id } = req.params;
  const { index, description } = req.body;

  console.log("=== EDIT PHOTO DEBUG START ===");
  console.log("Raw req.params:", req.params);
  console.log("Raw req.body:", req.body);
  console.log("Extracted id:", id, typeof id);
  console.log("Extracted index:", index, typeof index);
  console.log("Extracted description:", description, typeof description);

  if (index === undefined && description === undefined) {
    console.log("❌ Validation failed: No fields provided");
    return res.status(400).json({ error: "At least one field (index or description) must be provided" });
  }

  try {
    // First, let's check if the record exists
    console.log("🔍 Checking if record exists...");
    const { data: existingPhoto, error: selectError } = await supabase
      .from("album")
      .select("*")
      .eq("id", id)
      .single();

    console.log("Existing photo query result:", { existingPhoto, selectError });

    if (selectError) {
      console.log("❌ Error finding photo:", selectError);
      return res.status(404).json({ error: "Photo not found", details: selectError });
    }

    if (!existingPhoto) {
      console.log("❌ Photo not found in database");
      return res.status(404).json({ error: "Photo not found" });
    }

    console.log("✅ Photo found:", existingPhoto);

    // Build update data
    const updateData = {};
    if (index !== undefined) updateData.index = index;
    if (description !== undefined) updateData.description = description;
    updateData.updated_at = new Date().toISOString();

    console.log("📝 Update data prepared:", updateData);

    // Perform the update
    console.log("🔄 Attempting update...");
    const { data, error } = await supabase
      .from("album")
      .update(updateData)
      .eq("id", id)
      .select();

    console.log("Update result:", { data, error });

    if (error) {
      console.error("❌ Supabase update error:", error);
      throw error;
    }

    if (!data || !data.length) {
      console.log("❌ Update returned no data");
      return res.status(404).json({ error: "Update failed - no data returned" });
    }

    console.log("✅ Update successful:", data[0]);
    console.log("=== EDIT PHOTO DEBUG END ===");

    return res.status(200).json({ 
      message: "Photo updated successfully", 
      photo: data[0],
      debug: {
        originalId: id,
        updateData: updateData
      }
    });

  } catch (err) {
    console.error("❌ Catch block error:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      details: err.details,
      hint: err.hint
    });
    console.log("=== EDIT PHOTO DEBUG END (ERROR) ===");
    res.status(500).json({ 
      error: "Internal server error",
      debug: err.message
    });
  }
};

module.exports.deletePhoto = async (req, res) => {
  const supabase = getSupabaseClient();
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("album")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: "Photo not found" });

    return res.status(200).json({ message: "Photo deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting photo:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
