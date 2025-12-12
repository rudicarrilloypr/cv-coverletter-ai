<a name="readme-top"></a>

<div align="center">

<h2><b>CoverLetter Generator ⚡</b></h2>
<p><i>AI-powered cover letter generator with smart credit-based usage.</i></p>

</div>

---

📘 **Table of Contents**

- [📖 About the Project](#about)
- [🛠 Built With](#built-with)
  - [Tech Stack](#tech-stack)
  - [Key Features](#key-features)
- [🚀 Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Environment Variables](#environment-variables)
  - [Install](#install)
  - [Run](#run)
- [💳 Credits System Overview](#credits-system)
- [📊 Architecture](#architecture)
- [👥 Author](#author)
- [🙏 Acknowledgements](#acknowledgements)
- [🔮 Future Features](#future-features)
- [🤝 Contributing](#contributing)
- [⭐ Show Your Support](#show-your-support)
- [📝 License](#license)

---

## 📖 About the Project <a name="about"></a>

**CoverLetter Generator** is a modern AI-powered application that allows users to generate professional cover letters using advanced language models.

The platform operates using a **credit-based system**, where users can log in, purchase credits through Stripe Checkout, and spend those credits to generate high-quality cover letters tailored to specific job applications.

Built for speed, reliability, and scalability, this app provides a smooth UX with real-time authentication updates, secure transactions, and expandable server actions.

---

## 🛠 Built With <a name="built-with"></a>

- **Next.js 14** (App Router + Server Components)
- **NextAuth.js**
- **Stripe Checkout**
- **Prisma ORM**
- **SQLite / PostgreSQL**
- **TailwindCSS**
- **TypeScript**
- **OpenAI API**

---

# 🧩 Tech Stack <a name="tech-stack"></a>

<details>
<summary>Client</summary>
<ul>
  <li>Next.js App Router</li>
  <li>TailwindCSS</li>
  <li>React Server Components</li>
</ul>
</details>

<details>
<summary>Server</summary>
<ul>
  <li>NextAuth (Auth Providers + Sessions)</li>
  <li>Prisma ORM</li>
  <li>Stripe API + Webhooks</li>
  <li>OpenAI API</li>
</ul>
</details>

<details>
<summary>Utilities</summary>
<ul>
  <li>Zod (validation)</li>
  <li>Retry-safe credit consumption logic</li>
</ul>
</details>

---

## ⭐ Key Features <a name="key-features"></a>

📝 **AI Cover Letter Generator**
- Create personalized cover letters for any job.
- Uses OpenAI with optimized prompts and structure.
- Allows contextual info such as job post, resume, experience, etc.

🎟 **Credits System**
- Users start with free base credits.
- Generate cover letters using credits.
- Credits update automatically across the UI.

💳 **Stripe Integration**
- Purchase credits through Stripe Checkout.
- Secure payments.
- Webhook verifies and updates credits safely.

👤 **Authentication**
- Email/password or OAuth providers.
- Session-aware interface.
- Auto-refresh user state after login and purchases.

📄 **Purchase History**
- View past transactions.
- Trace credit usage.
- Receipts synced with Stripe.

---

# 🚀 Getting Started <a name="getting-started"></a>

## ✔️ Prerequisites <a name="prerequisites"></a>

Install:

```
Node.js 18+
npm 9+
```

Create Stripe keys:

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

Create an OpenAI API key:

```
OPENAI_API_KEY
```

---

## 🏗 Setup <a name="setup"></a>

Clone the repo:

```bash
git clone your-repo-url-here
cd coverletter-generator
```

---

## 🔐 Environment Variables <a name="environment-variables"></a>

Create:

```
.env.local
```

Add:

```env
DATABASE_URL="file:./dev.db"

NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

OPENAI_API_KEY=your_openai_key

STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID=price_xxx
```

---

# 📦 Install <a name="install"></a>

```
npm install
```

---

## ▶️ Run <a name="run"></a>

Development:

```
npm run dev
```

Go to:

```
http://localhost:3000
```

---

# 💳 Credits System Overview <a name="credits-system"></a>

| Step | Description |
|------|-------------|
| **1. User logs in** | NextAuth initializes session |
| **2. User buys credits** | Redirect to Stripe Checkout |
| **3. Stripe confirms payment** | Webhook updates DB |
| **4. User generates cover letter** | Server action consumes credits |
| **5. UI updates in real time** | Session data is refreshed |

The system ensures **no double charges**, **no duplicate credit usage**, and **atomic updates**.

---

# 📊 Architecture <a name="architecture"></a>

```
/app
  /api
  /actions
  /auth
  /generate
/components
/lib
  prisma
  stripe
  openai
```

💠 **Server Actions**  
Core logic for:
- Credit consumption  
- Cover letter generation  
- Stripe transaction verification  

💠 **Prisma Models**
- User  
- Account  
- Session  
- Credit Purchases  

---

# 👥 Author <a name="author"></a>

**👤 Rodolfo Carrillo**

GitHub: **@rudicarrilloypr**  
Twitter: **@__rudicarrillo**  
LinkedIn: **Rudi Carrillo**

---

# 🙏 Acknowledgements <a name="acknowledgements"></a>

Thanks to all collaborators and testers who helped refine the platform.

---

# 🔮 Future Features <a name="future-features"></a>

- Export cover letters in PDF  
- Resume analyzer & scoring system  
- Multi-language cover letters  
- AI Interview Question Generator  
- Subscription plans  
- Usage analytics dashboard  

---

# 🤝 Contributing <a name="contributing"></a>

Contributions welcome.  
Fork → branch → pull request.

---

# ⭐ Show Your Support <a name="show-your-support"></a>

If this project helps you, consider giving it a ⭐ on GitHub.

---

# 📝 License <a name="license"></a>

MIT License — free to use and modify.
