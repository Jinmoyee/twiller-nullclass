// import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import User from '../models/user.model.js';

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const paymentMethod = async (req, res) => {
    const { planId } = req.body;
    const userId = req.user._id;

    // Define tweet limits based on the plan
    const tweetLimits = {
        'price_1PzQo72MeAP7D6CVFKjcTS2C': 1,  // Free Plan
        'price_1PzQq92MeAP7D6CVV9OwmuFy': 3,  // Bronze Plan
        'price_1PzQpi2MeAP7D6CVCW9K1u1F': 5,  // Silver Plan
        'price_1PzQpA2MeAP7D6CV56DUmsQW': 9999999999999999999999999,  // Gold Plan
    };

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a Stripe Checkout session for subscription
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription',
            line_items: [
                {
                    price: planId, // The Stripe price ID for the plan
                    quantity: 1,
                },
            ],
            customer_email: user.email,  // Associate user email with Stripe
            success_url: `http://localhost:3000/payment-success`, // Replace with your front-end success URL
            cancel_url: `http://localhost:3000/payment-cancel`, // Replace with your front-end cancel URL
        });

        // Update user's tweet limit based on selected plan
        user.tweetLimit = tweetLimits[planId]; // Update the tweet limit in the database
        await user.save();

        // Send success response to the frontend
        return res.status(200).json({
            success: true,
            message: 'Checkout session created successfully, tweet limit updated',
            id: session.id,
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);

        // Send error response to the frontend
        return res.status(500).json({
            success: false,
            message: 'Failed to create checkout session',
            error: error.message,
        });
    }
};
