import { Webhook } from "svix";
import User from "../models/User.js";
import mongoose from "mongoose"; // Ensure Mongoose is properly imported

export const clerkWebhooks = async (req, res) => {
    const { data, type } = req.body;
    console.log("Received webhook:", type);

    try {
        // Verify webhook signature
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"],
        });
    } catch (error) {
        console.error("Webhook verification failed:", error);
        return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    }

    try {
        // Ensure MongoDB is connected before performing operations
        if (mongoose.connection.readyState !== 1) {
            console.error("MongoDB is not connected");
            return res.status(500).json({ success: false, message: "Database connection issue." });
        }

        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                };
                console.log("Saving user:", userData);

                await User.create(userData).catch(error => {
                    console.error("Database save error:", error);
                    return res.status(500).json({ success: false, message: "Database save error." });
                });

                console.log("User saved successfully!");
                return res.json({ success: true, message: "User created successfully." });
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                };
                console.log("Updating user:", userData);

                await User.findByIdAndUpdate(data.id, userData).catch(error => {
                    console.error("Database update error:", error);
                    return res.status(500).json({ success: false, message: "Database update error." });
                });

                console.log("User updated successfully!");
                return res.json({ success: true, message: "User updated successfully." });
            }

            case "user.deleted": {
                console.log("Deleting user:", data.id);

                await User.findByIdAndDelete(data.id).catch(error => {
                    console.error("Database delete error:", error);
                    return res.status(500).json({ success: false, message: "Database delete error." });
                });

                console.log("User deleted successfully!");
                return res.json({ success: true, message: "User deleted successfully." });
            }

            default:
                console.warn("Unhandled webhook event type:", type);
                return res.json({ success: false, message: "Unhandled webhook event." });
        }
    } catch (error) {
        console.error("Clerk webhook error:", error);
        return res.status(500).json({ success: false, message: "Database operation failed." });
    }
};