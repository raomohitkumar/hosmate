# HosMate — Smart Hostel Management & Gemma 4 AI Platform

HosMate replaces paper hostel registers with a unified, trusted platform for **Hostel Owners**, **Students**, **Parents**, and **Wardens**.

## Key Upgrades & New Features
1. **Attractive, Simple Modern UI/UX**:
   - Modern glassmorphism header and cards (`backdrop-blur-md`), elegant typography, clean rounded containers, and unified badge styling.
   - Interactive **Live Simulation Flow Guide** at the top of the app to demonstrate the complete workflow in seconds.
   - Polished Dark and Light mode themes with custom color accents (Emerald/Teal, Indigo, Amber).

2. **Digital Outing Gate Pass (QR Code & Pass Card)**:
   - When Warden approves an outing, the student gets an official scannable Digital Gate Pass with dynamic QR code graphic, curfew countdown, and security signature.
   - Warden Dashboard has a built-in **Gate Pass QR Scanner Simulator** to check students out and back in with 1 click.

3. **Backend Network Console & Architecture Inspector**:
   - Built-in floating inspector drawer with live HTTP request/response logging (`POST /api/outings/request [201 Created]`, `POST /api/ai/analyze [200 OK]`).
   - Switch between **Simulated Mock In-Memory DB** and **Live Node.js/Express Server**.
   - Full production `server.js` code viewable and copyable inside the app.

4. **Student SOS / Emergency Panic Trigger**:
   - Instant 1-click emergency alert with broadcast notification sent directly to Warden and Parent inbox.

5. **Official Hostel Notice Board**:
   - Wardens and Owners can publish hostel announcements (Mess changes, Curfew alerts, Events).

6. **Gemma 4 Multimodal Mess Intelligence**:
   - Sentiment analysis, score ring, quoted complaints/praises directly from student feedback, vision analysis preview for meal plates, and a 1-click polite complaint generator for Wardens.

---

## How to Run

### Frontend (Vite / React)
1. Install dependencies:
   ```bash
   npm install react lucide-react recharts
   ```
2. Copy `App.tsx` into your `src/` directory.
3. Start development server:
   ```bash
   npm run dev
   ```

### Backend (Node.js / Express)
1. Install backend dependencies:
   ```bash
   npm install express cors dotenv
   ```
2. Start server:
   ```bash
   node server.js
   ```
   API runs at `http://localhost:4000`.
