const userModel = require('../models/user.model');

// Get all partners with status = 2 (pending verification)
module.exports.getPendingVerifications = async (req, res) => {
    try {
        // Use the partners table to get all pending verifications
        const { data: partners, error } = await require('../db/db').getSupabaseClient()
            .from('partners')
            .select('*')
            .eq('status', 2);
            
        if (error) throw error;
        res.status(200).json(partners);
    } catch (err) {
        console.error("Error fetching verification partners:", err);
        res.status(500).json({ error: "Server error" });
    }
};
