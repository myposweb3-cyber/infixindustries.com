Stripe setup
----------------

1. Install dependency (already done):

   npm install stripe --save

2. Set your secret key in `backend/.env`:

   STRIPE_SECRET=sk_test_your_secret_key_here

3. Set your public key in the frontend environment (e.g. `frontend/.env.local` or use `frontend/.env.example`):

   NEXT_PUBLIC_STRIPE_PUB=pk_test_your_public_key_here

4. Restart backend and frontend servers. Then test checkout at `http://localhost:3000/checkout`.

5. For production: use Stripe webhooks to confirm payments and update order status.
