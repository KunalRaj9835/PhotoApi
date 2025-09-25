// controllers/user.controller.js
const { validationResult } = require('express-validator');
const userModel = require('../models/user.model');
const userService = require('../services/user.services');
const blacklistTokenModel = require('../models/blacklistToken.model');
const { getSupabaseClient } = require('../db/db');


module.exports.registerUser = async (req, res, next) => {
    console.log('🔍 === DEBUGGING REGISTRATION ===');
    console.log('1. Raw req.body:', JSON.stringify(req.body, null, 2));
    console.log('2. req.file:', req.file);
    console.log('3. Content-Type:', req.headers['content-type']);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { 
            firstname, 
            lastname, 
            email, 
            password, 
            categories, 
            priceRange, 
            serviceDescription, 
            phone,
            portfolioUrl,
            status 
        } = req.body;
        
        console.log('4. Extracted fields:');
        console.log('   - firstname:', firstname);
        console.log('   - lastname:', lastname);
        console.log('   - email:', email);
        console.log('   - password:', password ? '***exists***' : 'missing');
        console.log('   - categories:', categories);
        console.log('   - priceRange:', priceRange);
        console.log('   - serviceDescription:', serviceDescription);
        console.log('   - phone:', phone);
        console.log('   - portfolioUrl:', portfolioUrl);
        console.log('   - status:', status);
        
        // Check if user already exists
        const isUserAlreadyExist = await userModel.findByEmail(email);
        if (isUserAlreadyExist) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        const hashedPassword = await userModel.hashPassword(password);
        
        // Partner registration check
        const isPartnerRegistration = categories || priceRange || 
            serviceDescription || phone || portfolioUrl || req.file;
        
        console.log('5. isPartnerRegistration:', isPartnerRegistration);
        
        let userData = {
            firstname,
            lastname,
            email,
            password: hashedPassword
        };
        
        console.log('6. Initial userData:', JSON.stringify(userData, null, 2));
        
        if (isPartnerRegistration) {
            console.log('7. Processing as partner registration...');
            
            if (!priceRange) {
                return res.status(400).json({ message: 'Price range is required for partner registration' });
            }
            
            // Handle file upload to Supabase Storage
            let aadharFileUrl = null;
            if (req.file) {
                const supabase = getSupabaseClient();
                const fileName = `aadhar_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${req.file.originalname.split('.').pop()}`;
                
                const { error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(fileName, req.file.buffer, {
                        contentType: req.file.mimetype,
                        cacheControl: '3600'
                    });
                
                if (uploadError) {
                    console.error('File upload error:', uploadError);
                    return res.status(500).json({ message: 'File upload failed' });
                }
                
                const { data: urlData } = supabase.storage
                    .from('documents')
                    .getPublicUrl(fileName);
                
                aadharFileUrl = urlData.publicUrl;
                console.log('DEBUG - File uploaded successfully:', aadharFileUrl);
            }
            
            userData = {
                ...userData,
                categories: categories || [],
                price_range: priceRange,
                status: typeof status !== 'undefined' ? parseInt(status) : 2,
                service_description: serviceDescription || '',
                phone: phone || '',
                portfolio_url: portfolioUrl || '',
                aadhar_file_url: aadharFileUrl
            };
            
            console.log('8. Partner userData before saving:', JSON.stringify(userData, null, 2));
        } else {
            console.log('7. Processing as regular user...');
            userData.status = status || 1;
            console.log('8. Regular userData before saving:', JSON.stringify(userData, null, 2));
        }
        
        console.log('9. About to call userModel.create...');
        const user = await userModel.create(userData);
        console.log('10. User created:', JSON.stringify(user, null, 2));
        
        const token = userModel.generateAuthToken(user.id);
        
        const responseMessage = isPartnerRegistration ? 
            'Partner registration successful. Awaiting verification.' : 
            'User registration successful.';
        
        console.log('11. Sending response...');
        console.log('🔍 === END DEBUGGING ===');
        
        res.status(201).json({ 
            token, 
            user,
            message: responseMessage
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};
// Replace your loginUser function with this debugging version:

module.exports.loginUser = async(req, res, next) => {
    console.log('🚀 LOGIN FUNCTION CALLED!');
    console.log('Request body:', req.body);
    
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({errors:errors.array()});
    }
    
    const { email, password } = req.body;
    console.log('Login attempt - Email:', email);
    console.log('Login attempt - Password provided:', !!password);
    console.log('Login attempt - Password value:', password); // Remove this in production
    
    try {
        console.log('Calling userModel.findByEmail...');
        const user = await userModel.findByEmail(email);
        console.log('User found:', !!user);
        
        if (user) {
            console.log('User ID:', user.id);
            console.log('User email:', user.email);
            console.log('Stored password hash:', user.password);
        }
        
        if(!user){
            console.log('❌ User not found in database');
            return res.status(401).json({message:'Invalid email or password'});
        }
        
        console.log('About to compare passwords...');
        console.log('Plain text password:', password);
        console.log('Hashed password from DB:', user.password);
        
        // Test direct bcrypt comparison
        const bcrypt = require('bcrypt');
        const directBcryptResult = await bcrypt.compare(password, user.password);
        console.log('Direct bcrypt.compare result:', directBcryptResult);
        
        // Test your model method
        const modelResult = await userModel.comparePassword(password, user.password);
        console.log('userModel.comparePassword result:', modelResult);
        
        // Use the model method result
        if(!modelResult){
            console.log('❌ Password comparison failed');
            console.log('Expected password:', password);
            console.log('Hash in database:', user.password);
            return res.status(401).json({message:'Invalid email or password'});
        }
        
        console.log('✅ Password comparison successful');
        console.log('Generating token...');
        
        const token = userModel.generateAuthToken(user.id);
        console.log('Token generated:', !!token);
        
        res.cookie('token', token);
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        
        console.log('✅ Login successful, sending response');
        res.status(200).json({token, user: userWithoutPassword});
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({message: 'Server error during login', error: error.message});
    }
};
module.exports.getUserProfile = async(req, res, next) => {
    // Remove password from response if it exists
    const { password, ...userWithoutPassword } = req.user;
    res.status(200).json(userWithoutPassword);
}

module.exports.logoutUser = async(req, res, next) => {
    try {
        res.clearCookie('token');
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        
        if (token) {
            await blacklistTokenModel.create({token});
        }
        
        res.status(200).json({message:'Logged out'});
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({message: 'Server error during logout'});
    }
}

// Admin function to verify partners
module.exports.verifyPartner = async(req, res, next) => {
    try {
        if (!userModel.isAdmin(req.user)) {
            return res.status(403).json({message: 'Access denied. Admin only.'});
        }
        
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        
        if (user.status !== 2) { // Not a pending partner
            return res.status(400).json({message: 'User is not a pending partner'});
        }
        
        const updatedUser = await userModel.findByIdAndUpdate(userId, { status: 3 }); // Verified partner
        
        res.status(200).json({
            message: 'Partner verified successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}

// Function to get all pending partners (Admin only)
module.exports.getPendingPartners = async(req, res, next) => {
    try {
        if (!userModel.isAdmin(req.user)) {
            return res.status(403).json({message: 'Access denied. Admin only.'});
        }
        
        const pendingPartners = await userModel.find({status: 2});
        res.status(200).json(pendingPartners);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}

// Function to get all verified partners
module.exports.getVerifiedPartners = async(req, res, next) => {
    try {
        const verifiedPartners = await userModel.find({status: 3});
        res.status(200).json(verifiedPartners);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Server error'});
    }
}

// Update partner status + add comment (by email)
module.exports.updatePartnerStatus = async (req, res) => {
    try {
        if (!userModel.isAdmin(req.user)) {
            return res.status(403).json({message: 'Access denied. Admin only.'});
        }

        const email = req.params.id; // email as :id
        const { status, comment } = req.body;

        // ✅ Only allow status 3 or 4
        if (![3, 4].includes(status)) {
            return res.status(400).json({ error: "Status must be either 3 or 4" });
        }

        // Find user by email first
        const existingUser = await userModel.findByEmail(email);
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update user using ID
        const user = await userModel.findByIdAndUpdate(
            existingUser.id,
            { 
                status, 
                comment: comment || null,
                updated_at: new Date().toISOString()
            }
        );

        res.status(200).json({ message: "Partner status updated", user });
    } catch (err) {
        console.error("Error updating partner status:", err);
        res.status(500).json({ error: "Server error" });
    }
};

// Additional helper function to get user by email (if needed)
module.exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await userModel.findByEmail(email);
        
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        res.status(200).json(userWithoutPassword);
    } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Function to update user profile
module.exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updateData = req.body;
        
        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.password;
        delete updateData.id;
        delete updateData.email; // Email changes might need special handling
        
        const updatedUser = await userModel.findByIdAndUpdate(userId, updateData);
        
        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json({ 
            message: "Profile updated successfully", 
            user: userWithoutPassword 
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ error: "Server error" });
    }
};