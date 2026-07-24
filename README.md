# 🛡️ ListingShield

> **Live Demo:** [https://marketplace-verification-platform.vercel.app/dashboard](https://marketplace-verification-platform.vercel.app/dashboard)

**Production-grade AI Powered Product Listing Verification Platform**

ListingShield is an advanced AI-assisted moderation platform designed to automatically verify product listings on fashion marketplaces. It utilizes a scalable, modular Verification Engine that ensures uploaded images meet strict quality guidelines, do not contain prohibited contact information, and genuinely depict fashion products—all in real-time.

---

## 🌟 Key Features

- **Automated Image Moderation:** Instantly rejects irrelevant or inappropriate uploads.
- **Contact Information Detection (OCR):** Scans images for embedded phone numbers or email addresses to prevent off-platform transactions.
- **Fashion Product Classification:** Uses Hugging Face Vision Transformers to verify that the item is a relevant fashion product.
- **Background Removal Integration:** Automatically prepares images for clean marketplace presentation.
- **Scalable Architecture:** Designed for low-latency, high-throughput moderation pipelines.
- **Containerized Deployment:** Ready for cloud-native deployment via Docker & Azure.

---

## 🏗️ Architecture Stack

- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons, deployed on **Vercel**
- **Backend:** Node.js, Express, TypeScript, deployed on **Azure Virtual Machines** via Docker
- **Database:** PostgreSQL (Neon Serverless), Sequelize ORM
- **Storage:** Cloudinary (for fast, optimized image delivery)
- **AI Integrations:** Hugging Face Inference API, OCR.space API

---

## 🚀 Environment Setup (Local Development)

To run this project locally, you will need to set up the following environment variables.

### 1. Database & Authentication
Create a `.env` file in your `server/` directory:
```env
# Neon PostgreSQL URL
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require"

# JWT Secret for Auth Tokens
JWT_SECRET="your_super_secret_string"
```

### 2. Cloudinary (For Image Uploads)
```env
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

**How to get your Cloudinary Keys:**
1. Create a free account at [Cloudinary](https://cloudinary.com).
2. Go to your **Dashboard**.
3. Under **Product Environment Credentials**, you will find your Cloud Name, API Key, and API Secret.

### 3. Verification Engine (AI APIs)
```env
# Hugging Face (For Product Classification)
HF_TOKEN="your_hf_token"

# OCR.space (For Contact Detection)
OCR_API_KEY="your_ocr_key"
```

**How to get your Hugging Face Token:**
1. Create a free account at [Hugging Face](https://huggingface.co/).
2. Go to **Settings > Access Tokens**.
3. Create a new token (Read access is fine) and paste it as `HF_TOKEN`.

**How to get your OCR.space API Key:**
1. Register for a free API key at [OCR.space](https://ocr.space/ocrapi).
2. You will receive the key via email. Paste it as `OCR_API_KEY`.

---

## 🛠️ Running Locally

1. Install dependencies for both client and server:
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```

2. Start the development servers:
   ```bash
   # Run in server/
   npm run dev

   # Run in client/
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.
