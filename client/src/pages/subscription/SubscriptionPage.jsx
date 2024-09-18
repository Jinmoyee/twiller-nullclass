import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe("pk_test_51Pyfg82MeAP7D6CVQyPZBdPIxJ9aEx7mOYVcgcOOLBY2aKouQtbE33FCkFHoz89GBlYnoSDpXOsGoUs5E1mRJjLq005OUCm1x8");

const SubscriptionPage = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isPaymentAllowed, setIsPaymentAllowed] = useState(true); // Default to true initially
    const navigate = useNavigate();

    const plans = [
        { name: 'Free Plan', price: '₹0', tweets: 1, priceId: 'price_1PzQo72MeAP7D6CVFKjcTS2C' },
        { name: 'Bronze Plan', price: '₹100/month', tweets: 3, priceId: 'price_1PzQq92MeAP7D6CVV9OwmuFy' },
        { name: 'Silver Plan', price: '₹300/month', tweets: 5, priceId: 'price_1PzQpi2MeAP7D6CVCW9K1u1F' },
        { name: 'Gold Plan', price: '₹1000/month', tweets: 'Unlimited', priceId: 'price_1PzQpA2MeAP7D6CV56DUmsQW' },
    ];

    useEffect(() => {
        const checkPaymentWindow = () => {
            const now = new Date();
            const hours = now.getUTCHours() + 5.5; // Convert to IST (UTC+5:30)
            const minutes = now.getUTCMinutes();
            if (hours >= 10 && hours < 11) {
                setIsPaymentAllowed(true);
            } else if (hours === 10 && minutes === 0) { // Special case for exactly 10 AM to allow payments
                setIsPaymentAllowed(true);
            } else {
                setIsPaymentAllowed(false);
            }
        };

        checkPaymentWindow();
        const intervalId = setInterval(checkPaymentWindow, 60000); // Check every minute

        return () => clearInterval(intervalId); // Clean up interval on component unmount
    }, []);

    const handlePayment = async () => {
        if (!isPaymentAllowed) {
            toast.error('Payment is currently disabled.');
            return;
        }

        if (!selectedPlan) {
            toast.error('Please select a plan.');
            return;
        }

        try {
            const stripe = await stripePromise;

            // Send selectedPlan to your backend to create a Checkout session
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ planId: selectedPlan.priceId }),
            });

            console.log('Response Status:', res.status);
            const responseJson = await res.json();
            console.log('Response Body:', responseJson);

            if (!res.ok) {
                throw new Error(`Failed to initiate checkout session. Status: ${res.status}. Response: ${responseJson.message}`);
            }

            const { id: sessionId } = responseJson;

            if (!sessionId) {
                throw new Error('Session ID not found in response.');
            }

            // Redirect to Stripe checkout
            const result = await stripe.redirectToCheckout({ sessionId });

            if (result.error) {
                toast.error(result.error.message);
                navigate('/payment-failed');
            } else {
                toast.success('Redirecting to payment...');
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error(`Error processing payment: ${error.message}`);
            navigate('/payment-failed');
        }
    };

    return (
        <div className="min-h-screen items-center justify-center flex-[4_4_0] border-x w-full px-[10rem] py-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Subscribe to a Plan</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 w-full max-w-5xl">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`p-6 bg-white shadow-md rounded-lg border-2 ${selectedPlan?.name === plan.name ? 'border-blue-400' : 'border-transparent'
                            } hover:border-blue-400 cursor-pointer transition duration-300`}
                        onClick={() => setSelectedPlan(plan)}
                    >
                        <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
                        <p className="text-gray-700">{plan.price}</p>
                        <p className="text-gray-500">Tweet Limit: {plan.tweets}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8">
                <button
                    className={`px-6 py-3 font-semibold text-white rounded-lg transition duration-300 ${selectedPlan
                        ? isPaymentAllowed
                            ? 'bg-blue-400 hover:bg-blue-500'
                            : 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gray-300 cursor-not-allowed'}`}
                    onClick={handlePayment}
                    disabled={!selectedPlan || !isPaymentAllowed}
                >
                    {isPaymentAllowed ? 'Proceed with Payment' : 'Payment Disabled'}
                </button>
            </div>

            {!isPaymentAllowed && (
                <p className="mt-4 text-red-600">
                    Payment is currently disabled.
                </p>
            )}
        </div>
    );
};

export default SubscriptionPage;
