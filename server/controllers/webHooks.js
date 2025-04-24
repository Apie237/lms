import { Webhook } from "svix";
import User from "../models/User.js";

// API controller function to manage clerk user with database
export const clerkWebhooks = async (req, res) => {
    try {
        // Verify webhook signature
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });
        
        const { data, type } = req.body;
        
        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    name: data.first_name + " " + data.last_name,
                    email: data.email_addresses[0].email_address, // Fixed typo here
                    imageUrl: data.image_url,
                }
                await User.create(userData);
                return res.status(201).json({ success: true });
            }
            
            case 'user.updated': {
                const userData = {
                    _id: data.id,
                    name: data.first_name + " " + data.last_name,
                    email: data.email_addresses[0].email_address,
                    imageUrl: data.image_url,
                }
                await User.findByIdAndUpdate(data.id, userData);
                return res.status(200).json({ success: true });
            }
            
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                return res.status(200).json({ success: true });
            }
            
            default:
                // Handle unrecognized webhook types
                return res.status(400).json({ success: false, message: "Unhandled webhook type" });
        }
    } catch (error) {
        console.error("Webhook error:", error.message);
        return res.status(400).json({ success: false, error: error.message });
    }
}