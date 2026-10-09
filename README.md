# NeonStream

Open `index.html` in a browser.

```
NeonStream/
├── index.html          Home page (Movies, Series, Anime, Continue Watching)
├── login.html          Login page
├── subscription.html   Subscription plans page (Step 1 of 3)
├── payment.html        Checkout: account (Step 2) → payment (Step 3) → success
├── css/
│   ├── style.css         Home page styles
│   ├── login.css         Login page styles
│   ├── subscription.css  Subscription page styles
│   └── payment.css       Checkout page styles
├── js/
│   ├── script.js         Home page script
│   ├── login.js          Login page script
│   ├── subscription.js   Subscription page script
│   └── payment.js        Checkout page script
└── images/             Logo, hero background and posters
```

- The **Series** link in the header scrolls to the Series section (Breaking Bad, Game of Thrones).
- `index.html#series` opens the home page directly at the Series section.

## Subscription → payment flow (like Netflix)

1. **Choose plan** (`subscription.html`): Monthly/Annual toggle, then pick a plan.
2. **Create account** (`payment.html`): email, mobile number, password.
3. **Choose how to pay**: Credit/Debit Card, UPI AutoPay, Net Banking or Wallet.
4. **Enter details**: live card preview (flips for CVV), card brand detection, UPI ID verify, bank picker.
5. **Verify**: OTP for cards, approval screen for UPI, bank redirect for net banking.
6. **Success**: receipt with order ID and next billing date. The home page then shows "★ <Plan> Plan".

The **free plan** skips account and payment completely: clicking "Start Watching" takes you straight to the Movies section of the home page.

This is a front-end demo: no real payment is taken and nothing is sent to a server.
Test card: `4242 4242 4242 4242`, any future expiry, any CVV. Any 6 digits work as the OTP.
To use real payments you would connect a gateway such as Razorpay, Stripe or Cashfree on a backend.

## Login / Log Out

- Logging in (`login.html`) or finishing checkout remembers the user on this browser.
- The header then shows an account menu (avatar + name) with the email, current plan,
  **My Downloads** (paid plans), **Change Plan** and **Log Out**.
- **Log Out** asks for confirmation, then removes the login, plan and downloads from this
  device and shows the home page as a logged-out visitor.
