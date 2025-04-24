import { Webhook } from "svix";
import User from "../models/User.js";

// API controller function to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
    console.log("Received webhook:", req.body.type, req.body.data?.id);
    
    try {
        // Check if webhook secret is configured
        if (!process.env.CLERK_WEBHOOK_SECRET) {
            console.error("CLERK_WEBHOOK_SECRET is not configured");
            return res.status(500).json({ success: false, error: "Webhook secret not configured" });
        }
        
        // Verify webhook signature
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        
        try {
            await whook.verify(JSON.stringify(req.body), {
                "svix-id": req.headers["svix-id"],
                "svix-timestamp": req.headers["svix-timestamp"],
                "svix-signature": req.headers["svix-signature"],
            });
        } catch (verifyError) {
            console.error("Webhook verification failed:", verifyError.message);
            return res.status(400).json({ success: false, error: "Webhook verification failed" });
        }
        
        const { data, type } = req.body;
        
        // Log the data structure to debug
        console.log("Webhook data structure:", JSON.stringify(data, null, 2));
        
        switch (type) {
            case 'user.created': {
                try {
                    // Additional validation
                    if (!data.id || !data.email_addresses || !data.email_addresses[0]) {
                        return res.status(400).json({ 
                            success: false, 
                            error: "Missing required user data" 
                        });
                    }
                    
                    const userData = {
                        _id: data.id,
                        name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
                        email: data.email_addresses[0].email_address,
                        imageUrl: data.image_url || '',
                    };
                    
                    await User.create(userData);
                    console.log("User created successfully:", data.id);
                    return res.status(201).json({ success: true });
                } catch (dbError) {
                    console.error("Error creating user:", dbError.message);
                    return res.status(500).json({ success: false, error: dbError.message });
                }
            }
            
            // Other cases...
            
            default:
                console.log("Unhandled webhook type:", type);
                return res.status(200).json({ success: true, message: "Unhandled webhook type" });
        }
    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
}