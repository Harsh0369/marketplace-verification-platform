# ListingShield

**Production-grade AI Powered Product Listing Verification Platform**

ListingShield is an AI-assisted moderation platform designed to verify product listings on a fashion marketplace. It uses a scalable, modular Verification Engine that ensures uploaded images meet strict quality guidelines, do not contain prohibited contact info, and genuinely depict fashion products.

---

## Overview

ListingShield is a production-ready listing verification platform designed to automate the moderation of product listings before they are published on an online marketplace.

Unlike traditional moderation systems that rely heavily on paid AI APIs or manual review, ListingShield aims to minimize operational costs by leveraging a modular verification pipeline built on open-source computer vision models and lightweight preprocessing techniques.

The platform verifies uploaded product images and metadata to ensure that listings comply with marketplace policies while maintaining extremely low inference cost and latency.

### Goals

- Verify uploaded product images
- Detect contact information inside images
- Reject non-product images
- Remove image backgrounds
- Detect duplicate listings
- Prevent spam listings
- Maintain low latency
- Minimize verification cost

---

## Environment Setup

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
4. Paste them into your `.env` file.

### 3. Verification Engine (AI APIs)
```env
# Hugging Face (For Product Classification)
HF_TOKEN="your_hf_token"

# OCR.space (For Contact Detection)
# The default 'helloworld' key works for basic testing but has strict rate limits
OCR_SPACE_API_KEY="helloworld"
```

**How to get your Hugging Face Token:**
1. Create a free account at [Hugging Face](https://huggingface.co/).
2. Go to **Settings > Access Tokens**.
3. Create a new token (Read access is fine) and paste it as `HF_TOKEN`.

**How to get your OCR.space API Key:**
1. Register for a free API key at [OCR.space](https://ocr.space/ocrapi).
2. You will receive the key via email. Paste it as `OCR_SPACE_API_KEY`.
