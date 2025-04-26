import Stripe from 'stripe'
import User from '../models/User.js'
import { Purchase } from '../models/Purchase.js'
import Course from '../models/Course.js'

// Get user data
export const getUserData = async (req, res) => {
    try {
        const userId = req.auth.userId
        const user =  await User.findById(userId)

        if(!user){
            return res.json({success: false, message: 'User not found'})
        }
        res.json({success: true, user})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

// Users enrolled courses with lecture links
export const userEnrolledCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const userData = await User.findById(userId).populate("enrolledCourses");

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, enrolledCourses: userData.enrolledCourses });
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// Purchase course
export const purchaseCourse = async (req, res) => {
    try {
        const { courseId } = req.body;
        const { origin } = req.headers;
        const userId = req.auth.userId;

        // Check if course exists
        const courseData = await Course.findById(courseId);
        if (!courseData) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }

        // Calculate final price after discount
        const amount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2);

        // Store purchase data
        const purchaseData = { courseId: courseData._id, userId, amount };
        const newPurchase = await Purchase.create(purchaseData);

        // Stripe gateway initialization
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
        const currency = process.env.CURRENCY.toLowerCase();

        // Creating line items for Stripe checkout
        const lineItems = [{
            price_data: {
                currency,
                product_data: { name: courseData.courseTitle },
                unit_amount: Math.round(newPurchase.amount * 100) // Convert amount to cents
            },
            quantity: 1
        }];

        // Creating Stripe checkout session
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${origin}/loading/my-enrollments`, // Fixed template literals
            cancel_url: `${origin}/`, // Fixed template literals
            line_items: lineItems,
            mode: "payment",
            metadata: { purchaseId: newPurchase._id.toString() }
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        console.error("Error processing purchase:", error.message);
        res.status(500).json({ success: false, message: "Payment processing failed" });
    }
};