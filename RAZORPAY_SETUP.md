# Razorpay Setup & Configuration

To enable Tracklify to securely process real transactions, you need to configure actual Razorpay keys inside the backend server environment. Tracklify will then securely bridge these keys to the client UI.

## Step 1: Create a Razorpay Account
1. Go to [Razorpay](https://razorpay.com/) and click **Sign Up**.
2. Complete the onboarding process (you can select that your business is unregistered if you are just testing).

## Step 2: Generate API Keys
1. Log in to your Razorpay Dashboard.
2. Under the left menu, go to **Account & Settings** -> **API Keys**.
3. *Crucial*: Ensure you are in **Test Mode** (look for the toggle at the top of the dashboard or menu).
4. Click **Generate Test Key**.
5. You will see a modal displaying your `Key Id` and `Key Secret`. Keep this window open, or copy them securely.

## Step 3: Configure Tracklify Environment
Open the `backend/.env` file in the root of your Node.js backend. You need to supply these exact keys:

```properties
RAZORPAY_KEY_ID="rzp_test_YOUR_GENERATED_KEY_HERE"
RAZORPAY_KEY_SECRET="YOUR_GENERATED_SECRET_HERE"
```

> [!WARNING]
> Never commit your `.env` file to GitHub or any public repository. Your `KEY_SECRET` allows full access to your gateway!

## Step 4: Restart Backend
Whenever you modify your `.env` file, your backend needs to restart to consume the new environment variables. 
Restart your backend script (`npm run dev`).

## Step 5: Test the Integration
1. Log into your Client view on Tracklify.
2. Select an Unpaid Invoice.
3. Click **Pay Now** and initiate the checkout.
4. When Razorpay opens, use [Razorpay's Test Credentials](https://razorpay.com/docs/payments/payments/test-credentials/) (like card number `4111 1111 1111 1111`).
5. Complete the payment to see the new Success UI!

## Moving to Production
When you are ready to accept real money from clients:
1. Complete Razorpay's KYC process to unlock **Live Mode**.
2. Generate Live Keys in the dashboard.
3. Replace the test keys in your `.env` file with the live keys.
4. Restart your application.
