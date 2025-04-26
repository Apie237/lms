import { Webhook } from "svix";
import dotenv from 'dotenv';
dotenv.config();
import User from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import Course from "../models/Course.js";

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

console.log('Loaded Stripe Key:', process.env.STRIPE_SECRET_KEY);


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
export const stripeWebhooks = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            })

            const { purchaseId } = session.data[0].metadata;

            const purchaseData = await Purchase.findById(purchaseId)
            const userData = await User.findById(purchaseData.userId)
            const courseData = await Course.findById(purchaseData.courseId.toString())

            courseData.enrolledStudents.push(userData)
            await courseData.save()

            userData.enrolledCourses.push(courseData._id)
            await userData.save()

            purchaseData.status = 'completed'
            await purchaseData.save()

            break;
        }
        case 'payment_intent.payment_failed': {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            })

            const { purchaseId } = session.data[0].metadata;
            const purchaseData = await Purchase.findById(purchaseId)
            purchaseData.status = 'failed'
            await purchaseData.save()
        }
            break;

        // ..handle other events
        default:
            console.log(`Unhandled event type ${event.type}`)
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true })
}