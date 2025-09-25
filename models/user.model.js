const jwt = require('jsonwebtoken');
const { getSupabaseClient } = require('../db/db');
const bcrypt = require('bcrypt');

class UserModel {
    constructor() {
        this.supabase = getSupabaseClient();
    }

    // Create a new user/partner
    async create(userData) {
        const { data, error } = await this.supabase
            .from('partners')
            .insert([{
                firstname: userData.firstname,
                lastname: userData.lastname,
                email: userData.email,
                password: userData.password, // already hashed!
                categories: userData.categories || null,
                price_range: userData.price_range || null,
                status: userData.status || 1,  // default: pending
                aadhar_file_url: userData.aadhar_file_url || null,
                portfolio_url: userData.portfolio_url || null,
                service_description: userData.service_description || null,
                phone: userData.phone || null,
                comment: userData.comment || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Find user by ID
    async findById(id) {
        const { data, error } = await this.supabase
            .from('partners')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Find user by email
    async findByEmail(email) {
        const { data, error } = await this.supabase
            .from('partners')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    }

    // Update user
    async findByIdAndUpdate(id, updateData) {
        const { data, error } = await this.supabase
            .from('partners')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Delete user
    async findByIdAndDelete(id) {
        const { data, error } = await this.supabase
            .from('partners')
            .delete()
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    // Generate auth token
    generateAuthToken(userId) {
        return jwt.sign({ _id: userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
    }

    // Compare password
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Hash password (still useful in controllers if you want to reuse it)
    async hashPassword(password) {
        return await bcrypt.hash(password, 10);
    }

    // Helper methods for user status
    isPartner(user) {
        return user.status === 2 || user.status === 3;
    }

    isVerifiedPartner(user) {
        return user.status === 3;
    }

    isAdmin(user) {
        return user.status === 0;
    }
}

module.exports = new UserModel();