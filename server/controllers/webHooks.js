import { Webhook } from "svix";
import User from "../models/User.js";

export const clerkWebhooks = async (req, res) => {
    const { data, type } = req.body;
    console.log("Received webhook:", type);

    // 🧪 SKIP SIGNATURE VERIFICATION TEMPORARILY
    // Comment out the verification block
    // try {
    //     const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    //     await whook.verify(JSON.stringify(req.body), {
    //         "svix-id": req.headers["svix-id"],
    //         "svix-timestamp": req.headers["svix-timestamp"],
    //         "svix-signature": req.headers["svix-signature"],
    //     });
    // } catch (error) {
    //     console.error("Webhook verification failed:", error);
    //     return res.status(400).json({ success: false, message: "Invalid webhook signature." });
    // }

    try {
        switch (type) {
            case "user.created": {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                };
                await User.create(userData);
                console.log("✅ User saved:", userData);
                return res.json({ success: true, message: "User created successfully." });
            }

            case "user.updated": {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: `${data.first_name} ${data.last_name}`,
                    imageUrl: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                return res.json({ success: true, message: "User updated successfully." });
            }

            case "user.deleted": {
                await User.findByIdAndDelete(data.id);
                return res.json({ success: true, message: "User deleted successfully." });
            }

            default:
                return res.json({ success: false, message: "Unhandled webhook event." });
        }
    } catch (error) {
        console.error("❌ Clerk webhook DB error:", error);
        return res.status(500).json({ success: false, message: "Database operation failed." });
    }
};
