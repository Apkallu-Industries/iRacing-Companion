/*
 * Billing client – Stripe integration placeholders
 * This file provides thin wrapper functions for future Stripe billing features.
 * Replace the placeholder implementations with real Stripe SDK calls when ready.
 */

export type SubscriptionPlan = {
  id: string; // Stripe price ID
  name: string;
  price: string; // formatted price, e.g. "$9.99/mo"
  features: string[];
};

/**
 * Fetch available subscription plans from the backend.
 * Returns a static list for now – to be replaced with API call.
 */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  // TODO: replace with real fetch from your backend
  return [
    {
      id: "plan_pro_monthly",
      name: "Pro Monthly",
      price: "$9.99/mo",
      features: ["All AI features", "Priority support", "Beta access"],
    },
    {
      id: "plan_pro_yearly",
      name: "Pro Yearly",
      price: "$99.99/yr",
      features: ["All AI features", "Priority support", "Beta access", "2 months free"],
    },
  ];
}

/**
 * Create a Stripe Checkout session for the given plan ID.
 * Placeholder – returns a mock URL.
 */
export async function createCheckoutSession(planId: string): Promise<string> {
  // In a real implementation you would POST to your backend which creates a CheckoutSession
  // and returns the URL. Here we simply simulate the flow.
  console.warn("createCheckoutSession is a placeholder – integrate with your backend.");
  return `https://checkout.stripe.com/pay/mock-session-for-${planId}`;
}

/**
 * Retrieve the current user's subscription status.
 * Returns null until implemented.
 */
export async function getCurrentSubscription(): Promise<SubscriptionPlan | null> {
  // TODO: call your backend to retrieve subscription data.
  return null;
}
