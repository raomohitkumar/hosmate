# 🏆 HosMate — Hacktoberfest & Gemma 4 Submission Kit

Welcome to the official Hacktoberfest & Google Gemma submission guide for **HosMate**. Follow these steps to publish to GitHub, run with Ollama, and submit to hackathons (Devpost, MLH, Google AI Studio, or Hacktoberfest).

---

## 📋 Table of Contents
1. [Project Overview & Elevator Pitch](#1-project-overview--elevator-pitch)
2. [Step 1: Pushing the Code to GitHub](#step-1-pushing-the-code-to-github)
3. [Step 2: Adding Hacktoberfest Topics to GitHub](#step-2-adding-hacktoberfest-topics-to-github)
4. [Step 3: Running Ollama with Gemma 4 Locally](#step-3-running-ollama-with-gemma-4-locally)
5. [Step 4: Devpost / Hackathon Submission Text](#step-4-devpost--hackathon-submission-text)
6. [Step 5: 3-Minute Demo Video Script](#step-5-3-minute-demo-video-script)

---

## 1. Project Overview & Elevator Pitch

- **Project Title:** HosMate — Smart Hostel Outing OTP & Gemma 4 Mess Intelligence
- **Tagline:** Replace paper hostel registers with 2-step parent OTP gate permissions, tamper-proof locked profiles, and open-weight Gemma 4 AI mess analytics.
- **Problem Statement:** Over 10 million students live in hostels across schools, colleges, and private PG residencies. Today, hostels still use paper registers, fake emergency contact numbers, unverified phone calls for leaves, and unaddressed food quality complaints that lead to protests.
- **Solution:** 
  1. **2-Step Parent OTP Outings:** Students request leave → Parent receives a 6-digit OTP → Only after OTP verification does the request enter the Warden gate queue.
  2. **Digital QR Gate Pass:** Approved leaves generate a scannable QR pass for campus security.
  3. **Warden-Locked Security:** Critical parent & emergency contacts are locked upon submission; edits require warden approval to stop students from spoofing phone numbers.
  4. **Gemma 4 Multimodal Mess Intelligence:** Weekly reviews across 4 meals (Breakfast, Lunch, Snacks, Dinner) analyzed on-device using **Ollama Gemma 4** (or Cloud Gemma 4) with grounded verbatim quotes and 1-click polite complaint drafting for parents.

---

## Step 1: Pushing the Code to GitHub

Open **PowerShell** or **Terminal** on your computer:

```bash
# 1. Navigate to your project folder
cd "C:\Users\Mohit Kumar Rao\.gemini\antigravity\scratch\hosmate-frontend"

# 2. Initialize git repository
git init

# 3. Add all files
git add .

# 4. Commit files
git commit -m "Initial commit: HosMate with Gemma 4 AI, Outing OTP, and Digital QR Gate Pass"

# 5. Create a new repository on https://github.com/new named 'hosmate-gemma4'
# Then link your local repo to GitHub (replace with your GitHub username):
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/hosmate-gemma4.git

# 6. Push to GitHub
git push -u origin main
```

---

## Step 2: Adding Hacktoberfest Topics to GitHub

For your repository to qualify for **Hacktoberfest** and **Gemma Sprint**:

1. Go to your repository page on **GitHub**: `https://github.com/YOUR_GITHUB_USERNAME/hosmate-gemma4`
2. Click the ⚙️ **gear icon** next to the **"About"** section (on the top right of the repo).
3. In the **Topics** field, enter these exact tags:
   - `hacktoberfest`
   - `gemma`
   - `gemma-4`
   - `ollama`
   - `google-ai`
   - `react`
   - `typescript`
   - `fullstack`
4. Under description, enter:
   `Smart Hostel Outing OTP & Multimodal Gemma 4 Mess Food Review Intelligence Platform.`
5. Click **Save Changes**.

---

## Step 3: Running Ollama with Gemma 4 Locally

To show that your project runs **100% on-device open-weight AI** using Ollama:

### 1. Install Ollama
Download and install Ollama from [https://ollama.com/download](https://ollama.com/download).

### 2. Pull the Gemma model
Open PowerShell and run:
```bash
# Pull the Gemma model (choose one based on your PC's RAM/VRAM):
ollama pull gemma:2b       # Very lightweight (2GB RAM)
ollama pull gemma:7b       # Standard quality (8GB RAM)
ollama pull gemma4:4b      # Gemma 4 latest release
```

### 3. Build your custom HosMate Agent with the included Modelfile
Run:
```bash
ollama create hosmate-gemma4 -f Modelfile
```

### 4. Test it directly in your terminal:
```bash
ollama run hosmate-gemma4 "Analyze student reviews: Thursday dinner rotis were cold and dal was thin. Breakfast poha was hot."
```

Ollama will output the grounded JSON summary, score, and drafted complaint letter!

---

## Step 4: Devpost / Hackathon Submission Text

Copy and paste these answers into your hackathon submission form (Devpost, MLH, etc.):

### 💡 Inspiration
Hostel living is an integral part of higher education, yet hostel administrative workflows remain stuck in the 1990s: paper registers at the gate, proxy signatures, forged phone calls for night leaves, and consistent dissatisfaction with mess food. We wanted to build a unified system that protects student safety with 2-step parent OTP authorization and gives parents genuine visibility into mess food quality using **Google Gemma 4**.

### ⚙️ What it does
HosMate unifies four core stakeholders:
1. **Hostel Owner**: Manages hostel IDs, capacity, warden assignments, and broadcasts hostel-wide notices.
2. **Student**: Requests local outings or home leaves, views their tamper-proof verified profile, triggers 1-click SOS panic alerts, and submits weekly 4-meal reviews with plate photos.
3. **Parent**: Receives SMS OTPs to authorize leaves, and views weekly **Gemma 4 AI Mess Insights** featuring a 0-100 quality score, verbatim student quotes, and a 1-click polite letter generator for the warden.
4. **Warden**: Reviews parent-verified gate requests, issues scannable **Digital QR Gate Passes**, unlocks student profiles upon legitimate request, and reviews mess escalations.

### 🛠️ How we built it
- **Frontend:** React, TypeScript, Tailwind CSS, Lucide icons, and Recharts for trend visualization.
- **Backend API:** Node.js, Express.js, CORS.
- **On-Device AI Engine:** **Google Gemma 4** running locally via **Ollama** with a custom `Modelfile` containing specialized system prompts for grounded, hallucination-free sentiment extraction.
- **Cloud Fallback:** Google Generative AI (Gemma 4 26B A4B IT via Google AI Studio).

### 🏆 Accomplishments that we're proud of
- **Grounded AI with Zero Hallucination:** Gemma 4 only extracts quotes directly from student notes.
- **100% Privacy-Preserving AI:** Food complaints never leave the hostel server when using the local Ollama mode.
- **Real-Time Network Inspector:** Built-in console in the UI that lets judges inspect live HTTP request/response payloads.

---

## Step 5: 3-Minute Demo Video Script

Record your screen using **OBS Studio** or **Loom** (under 3 minutes):

- **0:00 - 0:30 (Hook & Problem):**
  *"Hello! This is HosMate, built for Hacktoberfest using Google Gemma 4 and Ollama. Today, millions of hostel students still use paper registers, fake phone calls for leaves, and have no voice when mess food quality declines. HosMate solves this."*
- **0:30 - 1:15 (Student & Parent OTP Flow):**
  *"Let's switch to the Student Portal. Aarav requests an evening outing. Notice the status says 'Waiting Parent OTP'. Now, we switch to the Parent Portal. The parent sees the notification, inputs OTP 482910, and authorizes leave."*
- **1:15 - 2:00 (Warden Gate Pass & QR Code):**
  *"In the Warden Portal, the request is verified. The warden clicks 'Approve', generating an official Digital QR Gate Pass. At the security turnstile, the warden scans the QR pass to check Aarav out."*
- **2:00 - 2:40 (Gemma 4 Multimodal Mess AI):**
  *"Now for our hackathon centerpiece: Gemma 4 AI Mess Intelligence. Students rate Breakfast, Lunch, Snacks, and Dinner and attach a photo of their plate. Gemma 4 analyzes sentiment on-device via Ollama, extracts exact student quotes, and drafts a polite letter to the warden in 1 click."*
- **2:40 - 3:00 (Backend Console & Conclusion):**
  *"Clicking the Backend Inspector shows real-time HTTP telemetry and our production Express server code. HosMate makes hostels safer, smarter, and more accountable. Thank you!"*
