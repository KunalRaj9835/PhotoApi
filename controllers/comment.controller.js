const userModel = require('../models/user.model');

// Get all pending partners (status = 2)
module.exports.getPendingPartners = async (req, res) => {
    try {
        // Use the partners table directly
        const { data: partners, error } = await require('../db/db').getSupabaseClient()
            .from('partners')
            .select('*')
            .eq('status', 2);
            
        if (error) throw error;
        res.status(200).json(partners);
    } catch (err) {
        console.error("Error fetching pending partners:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Update partner status + add comment (by email)
module.exports.updatePartnerStatus = async (req, res) => {
    try {
        const email = req.params.id; // email as :id
        const { status, comment } = req.body;

        // ✅ Only allow status 3 or 4
        if (![3, 4].includes(status)) {
            return res.status(400).json({ error: "Status must be either 3 or 4" });
        }

        // Update partner using Supabase directly
        const { data: partner, error } = await require('../db/db').getSupabaseClient()
            .from('partners')
            .update({ status, comment })
            .eq('email', email)
            .select()
            .single();

        if (error) throw error;

        if (!partner) {
            return res.status(404).json({ error: "Partner not found" });
        }

        res.status(200).json({ message: "Partner status updated", user: partner });
    } catch (err) {
        console.error("Error updating partner status:", err);
        res.status(500).json({ error: "Server error" });
    }
};
