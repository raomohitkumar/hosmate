import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2, Users, Utensils, ShieldCheck, Bell, Settings, LogOut,
  Copy, Share2, Plus, Search, Lock, Unlock, Star, Clock, MapPin,
  CheckCircle2, XCircle, AlertCircle, Sparkles, Send, MessageSquare,
  Moon, Sun, Globe, ChevronRight, UserCheck, FileText, Upload,
  RefreshCw, Phone, Mail, Home, ArrowRight, KeyRound, Eye, Check,
  Terminal, Cpu, Cloud, HelpCircle, Filter, Calendar, UserPlus,
  QrCode, AlertTriangle, ShieldAlert, Radio, Activity, Download,
  ExternalLink, ChevronDown, CheckCheck, Trash2, Shield
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, AreaChart, Area
} from 'recharts';

// ============================================================================
// 1. TYPES & DATA CONTRACTS (Matches Backend API Schemas)
// ============================================================================
type Role = 'landing' | 'auth' | 'owner' | 'student' | 'parent' | 'warden';
type Language = 'en' | 'hi';
type OutingStatus = 'OTP_PENDING' | 'WARDEN_PENDING' | 'APPROVED' | 'OUT' | 'RETURNED' | 'REJECTED';
type EditStatus = 'LOCKED' | 'PENDING' | 'UNLOCKED' | 'REJECTED';

interface Hostel {
  id: string;
  name: string;
  type: 'School' | 'College' | 'Private';
  address: string;
  city: string;
  state: string;
  pincode: string;
  totalRooms: number;
  capacity: number;
  messTimings: { breakfast: string; lunch: string; snacks: string; dinner: string };
}

interface Student {
  id: string;
  hostelId: string;
  name: string;
  room: string;
  course: string;
  bloodGroup: string;
  phone: string;
  emergencyContact: string;
  parentName: string;
  parentRelation: string;
  parentPhone: string;
  parentEmail: string;
  address: string;
  profileStatus: 'SUBMITTED' | 'PENDING_JOIN';
  editStatus: EditStatus;
  editReason?: string;
  currentStatus: 'IN_HOSTEL' | 'OUT';
  avatar?: string;
}

interface Warden {
  id: string;
  name: string;
  phone: string;
  shift: 'Morning' | 'Night' | 'Full-Time';
}

interface FoodReview {
  id: string;
  studentId: string;
  studentName: string;
  week: string;
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
  quality: number;
  hygiene: number;
  quantity: number;
  comment: string;
  photoLabel?: string;
  createdAt: string;
}

interface OutingRequest {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  type: 'Outing' | 'Home Leave';
  destination: string;
  leaveTime: string;
  returnTime: string;
  reason: string;
  parentPhone: string;
  otpCode: string;
  status: OutingStatus;
  wardenNote?: string;
  createdAt: string;
  passApprovedAt?: string;
}

interface WardenRemark {
  id: string;
  studentId: string;
  studentName: string;
  wardenName: string;
  date: string;
  message: string;
  category: 'Attendance' | 'Discipline' | 'Appreciation' | 'Health';
  read: boolean;
}

interface HostelNotice {
  id: string;
  title: string;
  message: string;
  category: 'Mess' | 'Gate' | 'General' | 'Emergency';
  author: string;
  date: string;
}

interface NotificationItem {
  id: string;
  role: Role;
  title: string;
  body: string;
  time: string;
  read: boolean;
  priority?: 'normal' | 'urgent';
}

interface ApiLogItem {
  id: string;
  timestamp: string;
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  durationMs: number;
  payloadSummary: string;
}

interface AIAnalysisResult {
  summary: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  engineUsed: string;
  topComplaints: { issue: string; quote: string; count: number }[];
  topPraises: { praise: string; quote: string; count: number }[];
  actionItems: string[];
  visionInsight?: string;
  draftComplaint: string;
}

// ============================================================================
// 2. INITIAL SEEDED DATA (Mirroring PostgreSQL / SQLite Store)
// ============================================================================
const INITIAL_HOSTEL: Hostel = {
  id: 'HM-4F9K2',
  name: 'Sunrise Scholars Residency',
  type: 'College',
  address: 'Plot 42, Knowledge Park III, Near Metro Station',
  city: 'Greater Noida',
  state: 'Uttar Pradesh',
  pincode: '201306',
  totalRooms: 60,
  capacity: 180,
  messTimings: {
    breakfast: '07:30 AM - 09:00 AM',
    lunch: '12:30 PM - 02:15 PM',
    snacks: '05:00 PM - 06:00 PM',
    dinner: '08:00 PM - 09:30 PM'
  }
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-101',
    hostelId: 'HM-4F9K2',
    name: 'Aarav Sharma',
    room: 'B-204',
    course: 'B.Tech CSE - 2nd Year',
    bloodGroup: 'O+',
    phone: '+91 98765 43210',
    emergencyContact: '+91 98111 22334',
    parentName: 'Rajesh Sharma',
    parentRelation: 'Father',
    parentPhone: '+91 98111 22334',
    parentEmail: 'rajesh.sharma@email.com',
    address: '14/2 Civil Lines, Kanpur, UP',
    profileStatus: 'SUBMITTED',
    editStatus: 'LOCKED',
    currentStatus: 'IN_HOSTEL'
  },
  {
    id: 'STU-102',
    hostelId: 'HM-4F9K2',
    name: 'Priya Patel',
    room: 'A-108',
    course: 'BBA - 1st Year',
    bloodGroup: 'B+',
    phone: '+91 98222 33445',
    emergencyContact: '+91 98111 22334',
    parentName: 'Rajesh Sharma',
    parentRelation: 'Guardian',
    parentPhone: '+91 98111 22334',
    parentEmail: 'rajesh.sharma@email.com',
    address: '14/2 Civil Lines, Kanpur, UP',
    profileStatus: 'SUBMITTED',
    editStatus: 'PENDING',
    editReason: 'Need to update new emergency local guardian phone number.',
    currentStatus: 'OUT'
  },
  {
    id: 'STU-103',
    hostelId: 'HM-4F9K2',
    name: 'Rohan Verma',
    room: 'C-301',
    course: 'B.Tech ECE - 3rd Year',
    bloodGroup: 'A+',
    phone: '+91 97654 32109',
    emergencyContact: '+91 97111 00998',
    parentName: 'Sunita Verma',
    parentRelation: 'Mother',
    parentPhone: '+91 97111 00998',
    parentEmail: 'sunita.v@email.com',
    address: 'Sector 18, Chandigarh',
    profileStatus: 'PENDING_JOIN',
    editStatus: 'LOCKED',
    currentStatus: 'IN_HOSTEL'
  }
];

const INITIAL_WARDENS: Warden[] = [
  { id: 'W-01', name: 'Vikram Singh', phone: '+91 99887 76655', shift: 'Full-Time' },
  { id: 'W-02', name: 'Meera Nair', phone: '+91 99443 32211', shift: 'Night' }
];

const INITIAL_FOOD_REVIEWS: FoodReview[] = [
  {
    id: 'FR-1',
    studentId: 'STU-101',
    studentName: 'Aarav Sharma',
    week: 'Week 4 (Oct 2026)',
    breakfast: 4,
    lunch: 4,
    snacks: 5,
    dinner: 2,
    quality: 68,
    hygiene: 82,
    quantity: 75,
    comment: 'Breakfast poha and evening samosa were hot and fresh. However, Thursday & Friday dinner rotis were cold and undercooked, and dal was very watery.',
    photoLabel: 'mess_tray_plate_oct24.jpg (Uploaded)',
    createdAt: '2 hours ago'
  },
  {
    id: 'FR-2',
    studentId: 'STU-102',
    studentName: 'Priya Patel',
    week: 'Week 4 (Oct 2026)',
    breakfast: 5,
    lunch: 3,
    snacks: 4,
    dinner: 2,
    quality: 62,
    hygiene: 78,
    quantity: 70,
    comment: 'Dinner chapatis are hard after 8:30 PM because the hot-case lid is left open. Curd at lunch is fresh and good.',
    photoLabel: 'dinner_chapatis.png (Uploaded)',
    createdAt: 'Yesterday'
  },
  {
    id: 'FR-3',
    studentId: 'STU-103',
    studentName: 'Rohan Verma',
    week: 'Week 4 (Oct 2026)',
    breakfast: 4,
    lunch: 4,
    snacks: 4,
    dinner: 3,
    quality: 74,
    hygiene: 85,
    quantity: 80,
    comment: 'Dining hall tables were cleaned quickly this week. Please reduce excess oil in Wednesday paneer curry.',
    createdAt: '2 days ago'
  }
];

const WEEKLY_TREND_DATA = [
  { week: 'Week 1', Breakfast: 3.8, Lunch: 3.5, Snacks: 4.0, Dinner: 3.2, Overall: 3.6 },
  { week: 'Week 2', Breakfast: 4.1, Lunch: 3.7, Snacks: 4.2, Dinner: 3.0, Overall: 3.7 },
  { week: 'Week 3', Breakfast: 4.2, Lunch: 3.9, Snacks: 4.4, Dinner: 2.8, Overall: 3.8 },
  { week: 'Week 4', Breakfast: 4.3, Lunch: 3.7, Snacks: 4.3, Dinner: 2.3, Overall: 3.6 }
];

const INITIAL_OUTINGS: OutingRequest[] = [
  {
    id: 'OUT-901',
    studentId: 'STU-101',
    studentName: 'Aarav Sharma',
    room: 'B-204',
    type: 'Outing',
    destination: 'City Book Market & Dental Clinic, Sector 18',
    leaveTime: '2026-10-25 16:00',
    returnTime: '2026-10-25 20:00',
    reason: 'Buying engineering drawing kit and dental checkup',
    parentPhone: '+91 98111 22334',
    otpCode: '482910',
    status: 'OTP_PENDING',
    createdAt: '15 mins ago'
  },
  {
    id: 'OUT-900',
    studentId: 'STU-102',
    studentName: 'Priya Patel',
    room: 'A-108',
    type: 'Home Leave',
    destination: 'Kanpur Family Residence',
    leaveTime: '2026-10-24 08:00',
    returnTime: '2026-10-26 19:00',
    reason: 'Sister engagement ceremony at home',
    parentPhone: '+91 98111 22334',
    otpCode: '774120',
    status: 'OUT',
    wardenNote: 'Verified with father on call. Gate exit verified.',
    createdAt: 'Yesterday',
    passApprovedAt: '2026-10-24 07:45 AM'
  }
];

const INITIAL_REMARKS: WardenRemark[] = [
  {
    id: 'REM-1',
    studentId: 'STU-101',
    studentName: 'Aarav Sharma',
    wardenName: 'Vikram Singh',
    date: '23 Oct 2026',
    category: 'Appreciation',
    message: 'Aarav volunteered to help organize the hostel study room library this week. Very responsible!',
    read: false
  },
  {
    id: 'REM-2',
    studentId: 'STU-101',
    studentName: 'Aarav Sharma',
    wardenName: 'Meera Nair',
    date: '18 Oct 2026',
    category: 'Attendance',
    message: 'Returned 20 minutes after 9:30 PM gate curfew due to metro delay. Informed warden in advance.',
    read: true
  }
];

const INITIAL_NOTICES: HostelNotice[] = [
  {
    id: 'NOT-1',
    title: 'Sunday Mess Special & Deep Cleaning Schedule',
    message: 'Mess will serve special Pav Bhaji for lunch this Sunday. Breakfast starts early at 7:00 AM due to water tank maintenance.',
    category: 'Mess',
    author: 'Warden Vikram Singh',
    date: '24 Oct 2026'
  },
  {
    id: 'NOT-2',
    title: 'Biometric & QR Gate System Live',
    message: 'All students are requested to show their approved HosMate Digital Gate Pass QR code when checking out at the main gate.',
    category: 'Gate',
    author: 'Hostel Administration',
    date: '22 Oct 2026'
  }
];

// ============================================================================
// 3. EMBEDDED NODE.JS / EXPRESS BACKEND SOURCE CODE (FOR PRESENTATION INSPECTOR)
// ============================================================================
const BACKEND_CODE_SAMPLE = `/**
 * HosMate Production Backend (Node.js + Express + Prisma / PostgreSQL)
 * Endpoints: Outing OTP, Tamper-Proof Profile Locks, and Gemma 4 AI Analysis
 */
import express from 'express';
import cors from 'cors';
import { Ollama } from 'ollama'; // For local on-device gemma4:4b
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

// 1. GEMMA 4 MULTIMODAL REVIEW ANALYSIS
app.post('/api/ai/analyze', async (req, res) => {
  const { reviews, engineMode } = req.body;
  try {
    if (engineMode === 'local_ollama') {
      const ollama = new Ollama({ host: process.env.OLLAMA_HOST || 'http://127.0.0.1:11434' });
      const prompt = \`Analyze \${reviews.length} hostel mess reviews. Return JSON: summary, score, topComplaints, topPraises, actionItems.\`;
      const response = await ollama.chat({
        model: 'gemma4:4b',
        messages: [{ role: 'user', content: prompt + '\\nReviews: ' + JSON.stringify(reviews) }],
        format: 'json'
      });
      return res.json(JSON.parse(response.message.content));
    } else {
      // Cloud Proxy (Google AI Studio Gemma 4 26B A4B)
      const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = ai.getGenerativeModel({ model: 'gemma-4-26b-a4b-it' });
      // Structured output generation...
      return res.json({ /* grounded response */ });
    }
  } catch (err) {
    res.status(500).json({ error: 'AI Pipeline Error', details: err.message });
  }
});

// 2. PARENT OTP ISSUANCE & TWILIO / SMS DISPATCH
app.post('/api/outings/request', async (req, res) => {
  const { studentId, destination, leaveTime, returnTime, reason } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  // Store in DB with expiration (15 mins) & dispatch SMS via Twilio/Fast2SMS
  res.status(201).json({ id: 'OUT-' + Date.now(), otpCode, status: 'OTP_PENDING' });
});

// 3. WARDEN DIGITAL GATE VERIFICATION VIA QR CODE
app.post('/api/gate/verify-pass', async (req, res) => {
  const { passToken } = req.body;
  // Decode JWT / verify cryptographic signature & timestamp
  res.json({ verified: true, student: 'Aarav Sharma', room: 'B-204', permittedUntil: '2026-10-25 20:00' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log('HosMate Backend running on port 4000');
});`;

// ============================================================================
// 4. MOCK AI API LAYER (Simulates Gemma 4 Multimodal Analysis)
// ============================================================================
async function analyzeFoodReviewsApi(
  reviews: FoodReview[],
  engineMode: 'local_ollama' | 'cloud_gemma'
): Promise<AIAnalysisResult> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const latestComment = reviews[0]?.comment || '';
  const hasPhoto = reviews.some((r) => Boolean(r.photoLabel));

  return {
    summary: `Across ${reviews.length} student reviews this week, Morning Poha and Evening Samosas achieved high ratings (4.3★). In contrast, Dinner dropped significantly (2.3★) due to cold chapatis served after 8:30 PM and thin dal consistency.`,
    sentiment: 'Neutral',
    score: 72,
    engineUsed:
      engineMode === 'local_ollama'
        ? 'Local Ollama (gemma4:4b — 100% On-Device & Zero Cloud Data Leakage)'
        : 'Google Cloud API (gemma-4-26b-a4b-it via Secure Backend Proxy)',
    topComplaints: [
      {
        issue: 'Cold & Dry Dinner Rotis (Post 8:30 PM)',
        quote: `"${latestComment.slice(0, 110)}..."`,
        count: 2
      },
      {
        issue: 'Insulated Hot-Case Lid Left Unclosed',
        quote: '"Dinner chapatis are hard after 8:30 PM because the hot-case lid is left open."',
        count: 2
      }
    ],
    topPraises: [
      {
        praise: 'Crisp Breakfast Poha & Hot Evening Samosas',
        quote: '"Breakfast poha and evening samosa were hot and fresh."',
        count: 3
      },
      {
        praise: 'Quick Table Sanitation in Dining Hall',
        quote: '"Dining hall tables were cleaned quickly this week."',
        count: 2
      }
    ],
    actionItems: [
      'Enforce mandatory closed-lid protocol for roti hot-cases after 8:00 PM.',
      'Adjust dal-to-water ratio for dinner batch starting tomorrow.',
      'Maintain fresh coriander garnish on morning breakfast items.'
    ],
    visionInsight: hasPhoto
      ? 'Gemma 4 Multimodal Vision Check: Uploaded dinner tray image shows uneven browning on chapatis and low dal viscosity. Color spectrum confirms clean stainless steel tray.'
      : undefined,
    draftComplaint: `Respected Warden (${INITIAL_WARDENS[0].name}),\n\nGreetings from the Parent Council. Based on this week's verified student mess evaluations at ${INITIAL_HOSTEL.name}, while breakfast and tea-time snacks were well appreciated, dinner rotis after 8:30 PM consistently received complaints for being cold and hardened. Kindly inspect the mess hot-cases and ensure warm dinner service.\n\nWarm regards,\nParent Representative`
  };
}

// ============================================================================
// 5. REUSABLE UI BADGES & SUB-COMPONENTS
// ============================================================================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    OTP_PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700/60',
    WARDEN_PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300 dark:border-blue-700/60',
    APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/60',
    OUT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700/60',
    RETURNED: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    REJECTED: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-700/60',
    LOCKED: 'bg-slate-100 text-slate-700 dark:bg-slate-800/80 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    UNLOCKED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
    SUBMITTED: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300 dark:border-teal-700',
    PENDING_JOIN: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-700',
    IN_HOSTEL: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
  };

  const labels: Record<string, string> = {
    OTP_PENDING: 'Waiting Parent OTP',
    WARDEN_PENDING: 'Parent Verified • In Warden Queue',
    APPROVED: 'Approved • Gate Pass Ready',
    OUT: 'Currently Out of Campus',
    RETURNED: 'Returned Inside Hostel',
    REJECTED: 'Outing Declined',
    LOCKED: 'Profile Locked 🔒',
    PENDING: 'Unlock Requested ⏳',
    UNLOCKED: 'Unlocked for Edit 🔓',
    SUBMITTED: 'Verified Profile',
    PENDING_JOIN: 'Join Pending Approval',
    IN_HOSTEL: 'Inside Hostel 🏡'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.LOCKED}`}>
      {labels[status] || status}
    </span>
  );
};

const StarRating: React.FC<{ value: number; onChange?: (val: number) => void; readonly?: boolean }> = ({
  value,
  onChange,
  readonly = false
}) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(star)}
        className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'} transition-transform p-0.5 focus:outline-none`}
      >
        <Star
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            star <= value
              ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
              : 'text-slate-300 dark:text-slate-700'
          }`}
        />
      </button>
    ))}
  </div>
);

const RequestTimeline: React.FC<{ status: OutingStatus }> = ({ status }) => {
  const steps = [
    { key: 'SUBMITTED', label: 'Requested' },
    { key: 'OTP', label: 'Parent OTP' },
    { key: 'WARDEN', label: 'Warden OK' },
    { key: 'OUT', label: 'Gate Exit' },
    { key: 'RETURNED', label: 'Back' }
  ];

  const getActiveIndex = () => {
    if (status === 'OTP_PENDING') return 0;
    if (status === 'WARDEN_PENDING') return 1;
    if (status === 'APPROVED') return 2;
    if (status === 'OUT') return 3;
    if (status === 'RETURNED') return 4;
    return -1;
  };

  const activeIdx = getActiveIndex();

  if (status === 'REJECTED') {
    return (
      <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
        <XCircle className="w-4 h-4 shrink-0" />
        This outing request was declined by the hostel warden.
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-3 right-3 top-3.5 h-1 bg-slate-200 dark:bg-slate-800 -z-0 rounded" />
        {steps.map((s, idx) => {
          const done = idx <= activeIdx;
          return (
            <div key={s.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                  done
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-950/70'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : idx + 1}
              </div>
              <span className={`text-[11px] mt-1.5 font-medium ${done ? 'text-teal-700 dark:text-teal-300 font-semibold' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// 6. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Navigation & Theme
  const [role, setRole] = useState<Role>('landing');
  const [authTargetRole, setAuthTargetRole] = useState<'owner' | 'student' | 'parent' | 'warden'>('student');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [darkMode, setDarkMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [toast, setToast] = useState<{ msg: string; type?: 'info' | 'success' | 'alert' } | null>(null);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // Presentation Modals
  const [showBackendConsole, setShowBackendConsole] = useState(false);
  const [showGatePassModal, setShowGatePassModal] = useState<OutingRequest | null>(null);
  const [showSosModal, setShowSosModal] = useState(false);
  const [backendMode, setBackendMode] = useState<'mock' | 'live'>('mock');

  // Interactive Database Store
  const [hostel, setHostel] = useState<Hostel>(INITIAL_HOSTEL);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [wardens, setWardens] = useState<Warden[]>(INITIAL_WARDENS);
  const [foodReviews, setFoodReviews] = useState<FoodReview[]>(INITIAL_FOOD_REVIEWS);
  const [outings, setOutings] = useState<OutingRequest[]>(INITIAL_OUTINGS);
  const [remarks, setRemarks] = useState<WardenRemark[]>(INITIAL_REMARKS);
  const [notices, setNotices] = useState<HostelNotice[]>(INITIAL_NOTICES);
  
  // Real-time API Inspector Log Stream
  const [apiLogs, setApiLogs] = useState<ApiLogItem[]>([
    {
      id: 'L-1',
      timestamp: '14:28:10',
      method: 'POST',
      endpoint: '/api/outings/request',
      status: 201,
      durationMs: 45,
      payloadSummary: 'studentId: STU-101 (OTP Generated: 482910)'
    },
    {
      id: 'L-2',
      timestamp: '14:29:05',
      method: 'POST',
      endpoint: '/api/ai/analyze',
      status: 200,
      durationMs: 780,
      payloadSummary: 'engine: gemma4:4b, reviews: 3'
    }
  ]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'N1',
      role: 'parent',
      title: 'Outing OTP Requested',
      body: 'Aarav Sharma requested leave for City Book Market. Enter OTP 482910 to authorize.',
      time: '15m ago',
      read: false,
      priority: 'urgent'
    },
    {
      id: 'N2',
      role: 'warden',
      title: 'Profile Unlock Request',
      body: 'Priya Patel (Room A-108) requested profile unlock to update guardian contact.',
      time: '1h ago',
      read: false
    },
    {
      id: 'N3',
      role: 'owner',
      title: 'New Student Registration',
      body: 'Rohan Verma joined Hostel HM-4F9K2. Approval required.',
      time: '3h ago',
      read: false
    }
  ]);

  // Sub-navigation tabs per role
  const [ownerTab, setOwnerTab] = useState<'dashboard' | 'students' | 'wardens' | 'hostel' | 'notices'>('dashboard');
  const [studentTab, setStudentTab] = useState<'outing' | 'gatepass' | 'food' | 'profile' | 'notices'>('outing');
  const [parentTab, setParentTab] = useState<'ai_food' | 'overview' | 'remarks'>('ai_food');
  const [wardenTab, setWardenTab] = useState<'outings' | 'scanner' | 'edits' | 'food' | 'students'>('outings');

  // Active student selection
  const [activeStudentId, setActiveStudentId] = useState<string>('STU-101');
  const activeStudent = useMemo(
    () => students.find((s) => s.id === activeStudentId) || students[0],
    [students, activeStudentId]
  );

  // Gemma 4 AI Analysis State
  const [aiEngine, setAiEngine] = useState<'local_ollama' | 'cloud_gemma'>('local_ollama');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [complaintSentToWarden, setComplaintSentToWarden] = useState<string | null>(null);

  // Forms
  const [editReasonInput, setEditReasonInput] = useState('');
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [newNoticeForm, setNewNoticeForm] = useState({ title: '', message: '', category: 'General' as HostelNotice['category'] });
  
  const [newOuting, setNewOuting] = useState({
    type: 'Outing' as 'Outing' | 'Home Leave',
    destination: '',
    leaveTime: '2026-10-26T17:00',
    returnTime: '2026-10-26T20:30',
    reason: ''
  });

  const [newReview, setNewReview] = useState({
    breakfast: 4,
    lunch: 4,
    snacks: 5,
    dinner: 2,
    quality: 70,
    hygiene: 85,
    quantity: 80,
    comment: '',
    photoName: ''
  });

  const [studentSearch, setStudentSearch] = useState('');
  const [studentFilter, setStudentFilter] = useState<'ALL' | 'SUBMITTED' | 'PENDING_JOIN'>('ALL');
  const [newStudentForm, setNewStudentForm] = useState({ name: '', room: '', course: '' });
  const [newWardenForm, setNewWardenForm] = useState({ name: '', phone: '', shift: 'Full-Time' as Warden['shift'] });
  const [newRemarkForm, setNewRemarkForm] = useState({
    studentId: 'STU-101',
    category: 'Appreciation' as WardenRemark['category'],
    message: ''
  });

  // Helper: Trigger Toast Notification
  const triggerToast = (msg: string, type: 'info' | 'success' | 'alert' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  // Helper: Log API Event to Inspector
  const logApiEvent = (method: ApiLogItem['method'], endpoint: string, status: number, summary: string) => {
    const newLog: ApiLogItem = {
      id: `L-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      method,
      endpoint,
      status,
      durationMs: Math.floor(25 + Math.random() * 60),
      payloadSummary: summary
    };
    setApiLogs((prev) => [newLog, ...prev.slice(0, 15)]);
  };

  // Run AI analysis
  const runGemmaAnalysis = async (mode = aiEngine) => {
    setAiLoading(true);
    try {
      const res = await analyzeFoodReviewsApi(foodReviews, mode);
      setAiResult(res);
      logApiEvent('POST', '/api/ai/analyze', 200, `Model: ${mode === 'local_ollama' ? 'gemma4:4b' : 'gemma-4-26b-a4b-it'}`);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    runGemmaAnalysis(aiEngine);
  }, [foodReviews, aiEngine]);

  // Resend OTP countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => setResendTimer((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // Stats
  const avgFoodRating = useMemo(() => {
    if (!foodReviews.length) return '0.0';
    const sum = foodReviews.reduce(
      (acc, r) => acc + (r.breakfast + r.lunch + r.snacks + r.dinner) / 4,
      0
    );
    return (sum / foodReviews.length).toFixed(1);
  }, [foodReviews]);

  const pendingEditsCount = students.filter((s) => s.editStatus === 'PENDING').length;
  const pendingOutingsCount = outings.filter(
    (o) => o.status === 'OTP_PENDING' || o.status === 'WARDEN_PENDING'
  ).length;

  // Active student's approved outing ready for digital gate pass
  const activeStudentApprovedPass = useMemo(() => {
    return outings.find((o) => o.studentId === activeStudent.id && (o.status === 'APPROVED' || o.status === 'OUT'));
  }, [outings, activeStudent.id]);

  // ============================================================================
  // WORKFLOW ACTION HANDLERS
  // ============================================================================

  // 1. Student Outing Creation
  const handleCreateOuting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOuting.destination || !newOuting.reason) {
      triggerToast('Please provide destination and reason', 'alert');
      return;
    }
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const item: OutingRequest = {
      id: `OUT-${900 + outings.length + 1}`,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      room: activeStudent.room,
      type: newOuting.type,
      destination: newOuting.destination,
      leaveTime: newOuting.leaveTime.replace('T', ' '),
      returnTime: newOuting.returnTime.replace('T', ' '),
      reason: newOuting.reason,
      parentPhone: activeStudent.parentPhone,
      otpCode: generatedOtp,
      status: 'OTP_PENDING',
      createdAt: 'Just now'
    };
    setOutings([item, ...outings]);
    setNotifications([
      {
        id: `N-${Date.now()}`,
        role: 'parent',
        title: `Outing OTP for ${activeStudent.name}`,
        body: `Destination: ${item.destination}. Verification OTP is ${generatedOtp}`,
        time: 'Just now',
        read: false,
        priority: 'urgent'
      },
      ...notifications
    ]);
    logApiEvent('POST', '/api/outings/request', 201, `Student: ${activeStudent.name}, OTP Generated`);
    setNewOuting({ ...newOuting, destination: '', reason: '' });
    setResendTimer(30);
    triggerToast(`Outing requested! Parent verification OTP: ${generatedOtp}`);
  };

  // 2. Parent OTP Verification
  const handleVerifyOtp = (outingId: string, enteredOtp: string) => {
    const target = outings.find((o) => o.id === outingId);
    if (!target) return;
    if (enteredOtp.trim() !== target.otpCode) {
      triggerToast('Invalid OTP! Please check the 6-digit code.', 'alert');
      return;
    }
    setOutings(
      outings.map((o) => (o.id === outingId ? { ...o, status: 'WARDEN_PENDING' } : o))
    );
    setOtpDigits('');
    logApiEvent('POST', '/api/outings/verify-otp', 200, `Outing: ${outingId} -> WARDEN_PENDING`);
    triggerToast('Parent OTP confirmed! Request sent to Warden queue for final gate approval.');
  };

  // 3. Warden Outing Decision
  const handleWardenOutingAction = (id: string, nextStatus: OutingStatus, note?: string) => {
    const target = outings.find((o) => o.id === id);
    setOutings(
      outings.map((o) =>
        o.id === id
          ? {
              ...o,
              status: nextStatus,
              wardenNote: note || o.wardenNote,
              passApprovedAt: nextStatus === 'APPROVED' ? new Date().toLocaleTimeString() : o.passApprovedAt
            }
          : o
      )
    );

    if (target && (nextStatus === 'OUT' || nextStatus === 'RETURNED')) {
      setStudents(
        students.map((s) =>
          s.id === target.studentId
            ? { ...s, currentStatus: nextStatus === 'OUT' ? 'OUT' : 'IN_HOSTEL' }
            : s
        )
      );
    }
    logApiEvent('PATCH', `/api/outings/${id}/status`, 200, `Status updated to ${nextStatus}`);
    triggerToast(`Outing status updated to ${nextStatus}`);
  };

  // 4. Student SOS Panic Trigger
  const handleTriggerSos = () => {
    const emergencyNotif: NotificationItem = {
      id: `SOS-${Date.now()}`,
      role: 'warden',
      title: `🚨 SOS EMERGENCY: ${activeStudent.name}`,
      body: `Urgent assistance triggered from Room ${activeStudent.room}. Contact: ${activeStudent.phone}`,
      time: 'Just now',
      read: false,
      priority: 'urgent'
    };
    setNotifications([emergencyNotif, ...notifications]);
    logApiEvent('POST', '/api/emergency/sos', 201, `CRITICAL SOS: ${activeStudent.name} (Room ${activeStudent.room})`);
    setShowSosModal(false);
    triggerToast(`🚨 Emergency SOS broadcast sent to Warden & Parent!`, 'alert');
  };

  // 5. Submit Weekly Food Review
  const handleSubmitFoodReview = (e: React.FormEvent) => {
    e.preventDefault();
    const item: FoodReview = {
      id: `FR-${foodReviews.length + 1}`,
      studentId: activeStudent.id,
      studentName: activeStudent.name,
      week: 'Week 4 (Oct 2026)',
      breakfast: newReview.breakfast,
      lunch: newReview.lunch,
      snacks: newReview.snacks,
      dinner: newReview.dinner,
      quality: newReview.quality,
      hygiene: newReview.hygiene,
      quantity: newReview.quantity,
      comment: newReview.comment || 'Breakfast was nice, but dinner chapatis were cold.',
      photoLabel: newReview.photoName || undefined,
      createdAt: 'Just now'
    };
    setFoodReviews([item, ...foodReviews]);
    logApiEvent('POST', '/api/reviews', 201, `Student: ${activeStudent.name}, Avg: ${((newReview.breakfast + newReview.lunch + newReview.snacks + newReview.dinner) / 4).toFixed(1)}`);
    setNewReview({ ...newReview, comment: '', photoName: '' });
    triggerToast('Review submitted! Gemma 4 AI Analysis updated.');
  };

  // 6. Post New Notice
  const handlePostNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeForm.title || !newNoticeForm.message) return;
    const notice: HostelNotice = {
      id: `NOT-${Date.now().toString().slice(-4)}`,
      title: newNoticeForm.title,
      message: newNoticeForm.message,
      category: newNoticeForm.category,
      author: role === 'owner' ? 'Hostel Management' : `Warden ${wardens[0].name}`,
      date: '24 Oct 2026'
    };
    setNotices([notice, ...notices]);
    setNewNoticeForm({ title: '', message: '', category: 'General' });
    logApiEvent('POST', '/api/notices', 201, `Title: ${notice.title}`);
    triggerToast('Notice published to all students and parents!');
  };

  // ============================================================================
  // RENDER MAIN APPLICATION
  // ============================================================================
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200 pb-20 md:pb-12">
        
        {/* ===================================================================
            TOP SAAS PRESENTATION BAR (Role Switcher + Live Backend Console)
        =================================================================== */}
        <div className="bg-slate-900/95 text-white px-3 py-2 text-xs border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-teal-500/20 to-indigo-500/20 text-teal-300 border border-teal-500/40 font-semibold flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                HosMate Full-Stack Demo
              </span>
              <span className="hidden lg:inline text-slate-400">
                Switch view to simulate full ecosystem:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'landing', label: '🏠 Landing' },
                  { id: 'owner', label: '🏢 Owner' },
                  { id: 'student', label: '🎓 Student' },
                  { id: 'parent', label: '👨‍👩‍👧 Parent (Gemma AI)' },
                  { id: 'warden', label: '🛡️ Warden' }
                ] as { id: Role; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setRole(tab.id);
                    triggerToast(`Switched view to ${tab.label}`);
                  }}
                  className={`px-3 py-1 rounded-lg font-medium transition-all duration-150 ${
                    role === tab.id
                      ? 'bg-teal-500 text-slate-950 font-bold shadow-sm shadow-teal-500/30'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              {/* Backend Console & Network Inspector Button */}
              <button
                onClick={() => setShowBackendConsole(true)}
                className="ml-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Backend Inspector ({apiLogs.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            TOAST NOTIFICATION BANNER
        =================================================================== */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className={`px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'alert'
                ? 'bg-rose-950/90 text-rose-200 border-rose-800'
                : 'bg-slate-900/90 dark:bg-slate-800/90 text-white border-slate-700'
            }`}>
              {toast.type === 'alert' ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
              )}
              <span className="text-xs sm:text-sm font-semibold">{toast.msg}</span>
            </div>
          </div>
        )}

        {/* ===================================================================
            MAIN NAVIGATION HEADER
        =================================================================== */}
        <header className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-9 z-40 transition-colors">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div
              onClick={() => setRole('landing')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-600 via-teal-500 to-indigo-600 bg-clip-text text-transparent">
                    HosMate
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-semibold">
                    ID: {hostel.id}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {lang === 'en'
                    ? 'Hostel Outings, Parent OTP & Gemma 4 Mess Insights'
                    : 'हॉस्टल आउटिंग, पैरेंट OTP और जेम्मा 4 मेस एनालिसिस'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Emergency SOS Button for Students */}
              {role === 'student' && (
                <button
                  onClick={() => setShowSosModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/30 animate-pulse"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>SOS Alert</span>
                </button>
              )}

              {/* Language Switch */}
              <button
                onClick={() => {
                  setLang(lang === 'en' ? 'hi' : 'en');
                  triggerToast(`Language switched to ${lang === 'en' ? 'Hindi/Hinglish' : 'English'}`);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>{lang === 'en' ? 'EN' : 'HI'}</span>
              </button>

              {/* Dark / Light Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                >
                  <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  {notifications.some((n) => !n.read) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50">
                    <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="font-extrabold text-xs tracking-wider uppercase text-slate-500">
                        System Notifications
                      </span>
                      <button
                        onClick={() =>
                          setNotifications(notifications.map((n) => ({ ...n, read: true })))
                        }
                        className="text-[11px] text-teal-600 hover:underline font-semibold"
                      >
                        Mark all read
                      </button>
                    </div>
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-2xl text-xs border transition-all ${
                            n.priority === 'urgent'
                              ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                              : n.read
                              ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-teal-50/70 dark:bg-teal-950/30 border-teal-200 dark:border-teal-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="font-bold flex items-center justify-between">
                            <span>{n.title}</span>
                            <span className="text-[10px] opacity-70 font-normal">{n.time}</span>
                          </div>
                          <p className="mt-1 leading-relaxed opacity-90">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </header>

        {/* ===================================================================
            INTERACTIVE WORKFLOW GUIDE (HELPS JUDGES / USERS NAVIGATE FLOW)
        =================================================================== */}
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-amber-500/10 border border-teal-500/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              <span className="font-bold text-teal-800 dark:text-teal-300">Live Simulation Flow:</span>
              <span className="text-slate-600 dark:text-slate-300 hidden md:inline">
                1. Student requests Outing → 2. Parent inputs OTP → 3. Warden Approves → 4. QR Gate Pass Issued → 5. Gemma 4 Mess Insight
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setRole('student');
                  setStudentTab('outing');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-xs font-semibold hover:border-teal-500 transition-colors"
              >
                Step 1: Outing Request
              </button>
              <button
                onClick={() => {
                  setRole('parent');
                  setParentTab('ai_food');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-xs font-semibold hover:border-indigo-500 transition-colors"
              >
                Step 2: Parent OTP & AI
              </button>
              <button
                onClick={() => {
                  setRole('warden');
                  setWardenTab('outings');
                }}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border text-xs font-semibold hover:border-emerald-500 transition-colors"
              >
                Step 3: Warden Gate Queue
              </button>
            </div>
          </div>
        </div>

        {/* ===================================================================
            VIEW 0: MODERN LANDING HERO & PILLARS
        =================================================================== */}
        {role === 'landing' && (
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-14 space-y-12">
            {/* Hero Card */}
            <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-indigo-950 rounded-3xl p-6 sm:p-10 md:p-14 text-white shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-3xl space-y-6 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold border border-white/15">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Next-Gen Hostel Security & Multimodal Gemma 4 AI</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Replace Paper Registers with an{' '}
                  <span className="bg-gradient-to-r from-teal-400 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                    Intelligent Hostel Ecosystem.
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  HosMate unifies students, parents, wardens, and owners. Protect students with 2-step parent OTP gate permissions, tamper-proof locked emergency contacts, and automated weekly mess food intelligence analyzed by open-weight Gemma 4.
                </p>

                {/* 3 Primary Role Cards */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <button
                    onClick={() => {
                      setAuthTargetRole('owner');
                      setRole('owner');
                      triggerToast('Welcome to Hostel Owner Dashboard');
                    }}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all hover:scale-[1.02] group backdrop-blur-sm"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-teal-400">Hostel Owner</div>
                    <div className="font-extrabold text-base text-white mt-0.5">Manage Residence</div>
                    <p className="text-xs text-slate-300 mt-1">Hostel ID, room capacity, warden assignments & statistics.</p>
                    <div className="mt-3 flex items-center text-xs font-bold text-teal-300 group-hover:translate-x-1 transition-transform">
                      Open Owner Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAuthTargetRole('student');
                      setRole('student');
                      triggerToast('Welcome Aarav Sharma (Student Portal)');
                    }}
                    className="p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-left transition-all hover:scale-[1.02] group backdrop-blur-sm"
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Student Portal</div>
                    <div className="font-extrabold text-base text-white mt-0.5">Outing & QR Pass</div>
                    <p className="text-xs text-slate-300 mt-1">Request leave, generate digital gate pass, submit mess review.</p>
                    <div className="mt-3 flex items-center text-xs font-bold text-indigo-300 group-hover:translate-x-1 transition-transform">
                      Open Student Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setAuthTargetRole('parent');
                      setRole('parent');
                      triggerToast('Welcome Parent (Gemma 4 AI Insights)');
                    }}
                    className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-left transition-all hover:scale-[1.02] group shadow-lg shadow-amber-500/20"
                  >
                    <div className="text-[11px] font-black uppercase tracking-wider text-slate-900">Parent Access</div>
                    <div className="font-extrabold text-base text-slate-950 mt-0.5">Gemma 4 Mess AI</div>
                    <p className="text-xs text-slate-900 mt-1">Verify child OTPs, review meal sentiment & 1-click complaints.</p>
                    <div className="mt-3 flex items-center text-xs font-black text-slate-950 group-hover:translate-x-1 transition-transform">
                      Open Parent Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </button>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <button
                    onClick={() => setRole('warden')}
                    className="underline hover:text-white font-semibold flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Warden Command & Gate Pass Scanner</span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setRole('auth');
                    }}
                    className="underline hover:text-white font-semibold"
                  >
                    Sign In / Register Screen
                  </button>
                </div>
              </div>
            </div>

            {/* Core Architecture Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">Gemma 4 Mess Intelligence</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Students provide weekly feedback across 4 meals with optional plate photos. Gemma 4 analyzes sentiment, extracts exact quotes, and drafts polite warden complaints.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">2-Step OTP + Digital QR Pass</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  No unauthorized leaves. Outing requests require parental 6-digit OTP verification, warden confirmation, and generate a dynamic QR gate pass.
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg">Warden-Locked Security</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Parent contact details and emergency numbers lock immediately after initial registration to prevent unauthorized tampering. Unlocks require warden verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 0.5: CLEAN SIGN IN & REGISTRATION
        =================================================================== */}
        {role === 'auth' && (
          <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold">
                    {authMode === 'login' ? 'Welcome Back' : 'Create HosMate Account'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {authMode === 'login' ? 'Sign in to access your portal' : `Join as ${authTargetRole.toUpperCase()}`}
                  </p>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${authMode === 'login' ? 'bg-white dark:bg-slate-900 shadow-sm font-bold' : ''}`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('signup')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${authMode === 'signup' ? 'bg-white dark:bg-slate-900 shadow-sm font-bold' : ''}`}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2">Select Your Role</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['owner', 'student', 'parent', 'warden'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAuthTargetRole(r)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all text-center ${
                        authTargetRole === r
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setRole(authTargetRole);
                  logApiEvent('POST', `/api/auth/${authMode}`, 200, `Role: ${authTargetRole}`);
                  triggerToast(`Logged in successfully as ${authTargetRole.toUpperCase()}`);
                }}
                className="space-y-4"
              >
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    <input
                      required
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                  </div>
                )}

                {authMode === 'signup' && (authTargetRole === 'student' || authTargetRole === 'parent') && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Hostel ID</label>
                      <input
                        required
                        defaultValue={hostel.id}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-teal-500 bg-teal-50/30 dark:bg-teal-950/30 text-sm font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Room No</label>
                      <input
                        required
                        defaultValue="B-204"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold mb-1">Mobile or Email</label>
                  <input
                    required
                    defaultValue="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    defaultValue="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {authMode === 'login' ? `Enter ${authTargetRole.toUpperCase()} Dashboard` : 'Create Account & Join Hostel'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ===================================================================
            VIEW 1: HOSTEL OWNER DASHBOARD
        =================================================================== */}
        {role === 'owner' && (
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="md:col-span-3 space-y-3">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">Hostel Owner</div>
                  <div className="font-extrabold text-base mt-0.5">{hostel.name}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-2">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Unique Hostel Join Code</div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-lg text-teal-700 dark:text-teal-300 tracking-wide">
                      {hostel.id}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(hostel.id);
                          triggerToast(`Copied Hostel ID: ${hostel.id}`);
                        }}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        title="Copy"
                      >
                        <Copy className="w-3.5 h-3.5 text-teal-600" />
                      </button>
                      <button
                        onClick={() => triggerToast(`Shared join invite for ${hostel.name}`)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5 text-teal-600" />
                      </button>
                    </div>
                  </div>
                </div>

                <nav className="space-y-1">
                  {(
                    [
                      { id: 'dashboard', label: 'Overview & Metrics', icon: Building2 },
                      { id: 'students', label: `Students (${students.length})`, icon: Users },
                      { id: 'wardens', label: `Wardens (${wardens.length})`, icon: ShieldCheck },
                      { id: 'notices', label: 'Hostel Notices', icon: FileText },
                      { id: 'hostel', label: 'Hostel Settings', icon: Settings }
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setOwnerTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          ownerTab === item.id
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <main className="md:col-span-9 space-y-6">
              {ownerTab === 'dashboard' && (
                <>
                  {/* 4 Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium">Occupancy</div>
                      <div className="text-2xl font-black mt-1">
                        {students.length} <span className="text-sm font-normal text-slate-400">/ {hostel.capacity}</span>
                      </div>
                      <div className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                        {Math.round((students.length / hostel.capacity) * 100)}% Capacity filled
                      </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium">Pending Edit Requests</div>
                      <div className="text-2xl font-black mt-1 text-amber-500">{pendingEditsCount}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Tamper-proof locks</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium">Pending Outings</div>
                      <div className="text-2xl font-black mt-1 text-indigo-500">{pendingOutingsCount}</div>
                      <div className="text-[11px] text-slate-400 mt-1">Parent OTP + Warden queue</div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                      <div className="text-xs text-slate-500 font-medium">Mess Rating (Gemma 4)</div>
                      <div className="text-2xl font-black mt-1 text-emerald-500 flex items-center gap-1.5">
                        {avgFoodRating} <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">From {foodReviews.length} student reviews</div>
                    </div>
                  </div>

                  {/* Mess Timings & Facility Overview */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {hostel.type} Accommodation
                        </span>
                        <h3 className="text-lg font-bold mt-1.5">{hostel.name}</h3>
                        <p className="text-xs text-slate-500">
                          {hostel.address}, {hostel.city}, {hostel.state} - {hostel.pincode}
                        </p>
                      </div>
                      <button
                        onClick={() => setOwnerTab('hostel')}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        Edit Hostel Details
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {Object.entries(hostel.messTimings).map(([meal, time]) => (
                        <div key={meal} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <div className="text-xs font-bold capitalize text-teal-600 dark:text-teal-400">{meal}</div>
                          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Owner Tab: Students List & Add */}
              {ownerTab === 'students' && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newStudentForm.name || !newStudentForm.room) return;
                      const created: Student = {
                        id: `STU-${100 + students.length + 1}`,
                        hostelId: hostel.id,
                        name: newStudentForm.name,
                        room: newStudentForm.room,
                        course: newStudentForm.course || 'B.Tech - 1st Year',
                        bloodGroup: 'O+',
                        phone: '+91 98000 11223',
                        emergencyContact: '+91 98111 22334',
                        parentName: 'Rajesh Sharma',
                        parentRelation: 'Guardian',
                        parentPhone: '+91 98111 22334',
                        parentEmail: 'parent@email.com',
                        address: 'Hostel Verified Address',
                        profileStatus: 'SUBMITTED',
                        editStatus: 'LOCKED',
                        currentStatus: 'IN_HOSTEL'
                      };
                      setStudents([created, ...students]);
                      logApiEvent('POST', '/api/students', 201, `Added student ${created.name}`);
                      setNewStudentForm({ name: '', room: '', course: '' });
                      triggerToast(`Student ${created.name} enrolled to Room ${created.room}`);
                    }}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4"
                  >
                    <h3 className="font-bold text-base flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-teal-600" /> Enroll New Student to {hostel.id}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        placeholder="Student Full Name"
                        value={newStudentForm.name}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        required
                      />
                      <input
                        placeholder="Room (e.g. B-205)"
                        value={newStudentForm.room}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, room: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                        required
                      />
                      <input
                        placeholder="Course / Branch"
                        value={newStudentForm.course}
                        onChange={(e) => setNewStudentForm({ ...newStudentForm, course: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md"
                      >
                        + Enroll Student
                      </button>
                    </div>
                  </form>

                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="relative flex-1 min-w-[220px]">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          placeholder="Search student or room number..."
                          value={studentSearch}
                          onChange={(e) => setStudentSearch(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        {(['ALL', 'SUBMITTED', 'PENDING_JOIN'] as const).map((f) => (
                          <button
                            key={f}
                            onClick={() => setStudentFilter(f)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                              studentFilter === f
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {f === 'ALL' ? 'All' : f === 'SUBMITTED' ? 'Active' : 'Pending Approval'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {students
                        .filter((s) =>
                          studentFilter === 'ALL' ? true : s.profileStatus === studentFilter
                        )
                        .filter(
                          (s) =>
                            s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                            s.room.toLowerCase().includes(studentSearch.toLowerCase())
                        )
                        .map((s) => (
                          <div key={s.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <div className="font-bold text-sm flex items-center gap-2">
                                <span>{s.name}</span>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-mono">
                                  Room {s.room}
                                </span>
                                <StatusBadge status={s.currentStatus} />
                                <StatusBadge status={s.editStatus} />
                              </div>
                              <div className="text-xs text-slate-500 mt-1">
                                {s.course} • Parent: {s.parentName} ({s.parentPhone})
                              </div>
                            </div>
                            {s.profileStatus === 'PENDING_JOIN' && (
                              <button
                                onClick={() => {
                                  setStudents(
                                    students.map((st) =>
                                      st.id === s.id ? { ...st, profileStatus: 'SUBMITTED' } : st
                                    )
                                  );
                                  triggerToast(`Approved ${s.name} for Hostel ${hostel.name}`);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                              >
                                Approve Enrollment
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Owner Tab: Notices */}
              {ownerTab === 'notices' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handlePostNotice}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4"
                  >
                    <h3 className="font-bold text-base">Broadcast Hostel Announcement</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <input
                          placeholder="Notice Headline..."
                          value={newNoticeForm.title}
                          onChange={(e) => setNewNoticeForm({ ...newNoticeForm, title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                          required
                        />
                      </div>
                      <select
                        value={newNoticeForm.category}
                        onChange={(e) =>
                          setNewNoticeForm({ ...newNoticeForm, category: e.target.value as HostelNotice['category'] })
                        }
                        className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="General">General Notice</option>
                        <option value="Mess">Mess / Dining</option>
                        <option value="Gate">Gate & Curfew</option>
                        <option value="Emergency">Emergency Alert</option>
                      </select>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Notice description for students and parents..."
                      value={newNoticeForm.message}
                      onChange={(e) => setNewNoticeForm({ ...newNoticeForm, message: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm shadow"
                    >
                      Publish Announcement
                    </button>
                  </form>

                  <div className="space-y-3">
                    {notices.map((n) => (
                      <div
                        key={n.id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-teal-600">{n.category}</span>
                          <span className="text-slate-400">{n.date}</span>
                        </div>
                        <h4 className="font-bold text-sm">{n.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Tab: Wardens */}
              {ownerTab === 'wardens' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                    <h3 className="font-bold text-base">Assign Hostel Warden</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <input
                        placeholder="Warden Name"
                        value={newWardenForm.name}
                        onChange={(e) => setNewWardenForm({ ...newWardenForm, name: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      />
                      <input
                        placeholder="Phone Number"
                        value={newWardenForm.phone}
                        onChange={(e) => setNewWardenForm({ ...newWardenForm, phone: e.target.value })}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      />
                      <select
                        value={newWardenForm.shift}
                        onChange={(e) =>
                          setNewWardenForm({ ...newWardenForm, shift: e.target.value as Warden['shift'] })
                        }
                        className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="Full-Time">Full-Time</option>
                        <option value="Morning">Morning Shift</option>
                        <option value="Night">Night Shift</option>
                      </select>
                      <button
                        onClick={() => {
                          if (!newWardenForm.name || !newWardenForm.phone) return;
                          setWardens([
                            ...wardens,
                            { id: `W-0${wardens.length + 1}`, ...newWardenForm }
                          ]);
                          setNewWardenForm({ name: '', phone: '', shift: 'Full-Time' });
                          triggerToast(`Warden ${newWardenForm.name} assigned.`);
                        }}
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-sm"
                      >
                        + Add Warden
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {wardens.map((w) => (
                      <div
                        key={w.id}
                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-sm">{w.name}</div>
                          <div className="text-xs text-slate-500">{w.phone} • Shift: {w.shift}</div>
                        </div>
                        <button
                          onClick={() => setRole('warden')}
                          className="text-xs font-bold text-teal-600 hover:underline"
                        >
                          Switch to Warden View →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Owner Tab: Hostel Settings */}
              {ownerTab === 'hostel' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg">Hostel Facility Configuration</h3>
                      <p className="text-xs text-slate-500">Update capacity and mess timing rules.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Hostel Name</label>
                      <input
                        value={hostel.name}
                        onChange={(e) => setHostel({ ...hostel, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Hostel Type</label>
                      <select
                        value={hostel.type}
                        onChange={(e) =>
                          setHostel({ ...hostel, type: e.target.value as Hostel['type'] })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="School">School Hostel</option>
                        <option value="College">College Hostel</option>
                        <option value="Private">Private PG / Residency</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold mb-1">Address</label>
                      <input
                        value={hostel.address}
                        onChange={(e) => setHostel({ ...hostel, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => triggerToast('Hostel configurations saved!')}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 text-white font-bold text-sm shadow"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </main>
          </div>
        )}

        {/* ===================================================================
            VIEW 2: STUDENT PORTAL (OUTINGS, DIGITAL PASS, FOOD REVIEWS)
        =================================================================== */}
        {role === 'student' && (
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="md:col-span-3 space-y-3">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Student Access
                    </span>
                    <h3 className="font-extrabold text-base mt-0.5">{activeStudent.name}</h3>
                    <p className="text-xs text-slate-500">Room {activeStudent.room}</p>
                  </div>
                  <StatusBadge status={activeStudent.currentStatus} />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Active Demo Profile:</label>
                  <select
                    value={activeStudentId}
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Room {s.room})
                      </option>
                    ))}
                  </select>
                </div>

                <nav className="space-y-1">
                  {(
                    [
                      { id: 'outing', label: 'Outing / Leave + OTP', icon: MapPin },
                      { id: 'gatepass', label: 'Digital Gate Pass', icon: QrCode },
                      { id: 'food', label: 'Weekly Food Review', icon: Utensils },
                      { id: 'profile', label: 'Tamper-Proof Profile', icon: Lock },
                      { id: 'notices', label: 'Hostel Notices', icon: FileText }
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setStudentTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          studentTab === item.id
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <main className="md:col-span-9 space-y-6">
              {/* TAB 1: OUTING REQUEST + OTP INTERACTION */}
              {studentTab === 'outing' && (
                <div className="space-y-6">
                  {/* Active Pending Request Card */}
                  {outings
                    .filter((o) => o.studentId === activeStudent.id)
                    .map((req) => (
                      <div
                        key={req.id}
                        className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-indigo-500/30 shadow-md space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400">
                              {req.type} Application
                            </span>
                            <h3 className="font-extrabold text-base sm:text-lg">{req.destination}</h3>
                            <p className="text-xs text-slate-500">
                              Leaving: {req.leaveTime} → Return by: {req.returnTime}
                            </p>
                          </div>
                          <StatusBadge status={req.status} />
                        </div>

                        <RequestTimeline status={req.status} />

                        {/* Interactive Parent OTP Box */}
                        {req.status === 'OTP_PENDING' && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                                <KeyRound className="w-4 h-4" />
                                <span>Step 2: Enter Parent SMS Verification OTP</span>
                              </div>
                              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-200/80 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
                                Demo OTP sent to {req.parentPhone}: <strong>{req.otpCode}</strong>
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <input
                                maxLength={6}
                                value={otpDigits}
                                onChange={(e) => setOtpDigits(e.target.value)}
                                placeholder="Enter 6-digit OTP"
                                className="px-3.5 py-2 rounded-xl border border-amber-400 bg-white dark:bg-slate-900 font-mono text-sm tracking-widest w-44 outline-none focus:ring-2 focus:ring-amber-500"
                              />
                              <button
                                onClick={() => handleVerifyOtp(req.id, otpDigits)}
                                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm"
                              >
                                Verify OTP
                              </button>
                              <button
                                onClick={() => handleVerifyOtp(req.id, req.otpCode)}
                                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
                              >
                                Auto-Fill ({req.otpCode})
                              </button>
                              <button
                                disabled={resendTimer > 0}
                                onClick={() => {
                                  setResendTimer(30);
                                  triggerToast(`Resent OTP ${req.otpCode} to parent`);
                                }}
                                className="text-xs text-slate-500 underline disabled:no-underline ml-auto"
                              >
                                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* View Gate Pass button if approved */}
                        {(req.status === 'APPROVED' || req.status === 'OUT') && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => setShowGatePassModal(req)}
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-md hover:scale-[1.02] transition-transform"
                            >
                              <QrCode className="w-4 h-4" />
                              <span>View Scannable Digital Gate Pass</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                  {/* New Outing Form */}
                  <form
                    onSubmit={handleCreateOuting}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm"
                  >
                    <h3 className="font-extrabold text-lg">Apply for Outing / Home Leave</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Leave Category</label>
                        <select
                          value={newOuting.type}
                          onChange={(e) =>
                            setNewOuting({ ...newOuting, type: e.target.value as 'Outing' | 'Home Leave' })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                        >
                          <option value="Outing">Local Day Outing (Few Hours)</option>
                          <option value="Home Leave">Multi-Day Home Leave</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Parent Contact (Locked & Auto-Filled)
                        </label>
                        <input
                          disabled
                          value={activeStudent.parentPhone}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm cursor-not-allowed"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1">Destination & Purpose</label>
                        <input
                          required
                          placeholder="e.g. City Book Center, Sector 18 Market"
                          value={newOuting.destination}
                          onChange={(e) => setNewOuting({ ...newOuting, destination: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Leaving Date & Time</label>
                        <input
                          type="datetime-local"
                          value={newOuting.leaveTime}
                          onChange={(e) => setNewOuting({ ...newOuting, leaveTime: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Expected Return Time</label>
                        <input
                          type="datetime-local"
                          value={newOuting.returnTime}
                          onChange={(e) => setNewOuting({ ...newOuting, returnTime: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold mb-1">Detailed Reason</label>
                        <input
                          required
                          placeholder="Explain clearly why leave is needed..."
                          value={newOuting.reason}
                          onChange={(e) => setNewOuting({ ...newOuting, reason: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      Submit & Dispatch Parent OTP
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: DIGITAL GATE PASS */}
              {studentTab === 'gatepass' && (
                <div className="space-y-6">
                  {activeStudentApprovedPass ? (
                    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-xl mx-auto space-y-6 text-center">
                      <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-extrabold text-teal-600 tracking-wider">HOSMATE DIGITAL GATE PASS</span>
                        <span className="font-mono text-slate-400">ID: {activeStudentApprovedPass.id}</span>
                      </div>

                      {/* Mock QR Canvas Graphic */}
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 inline-block shadow-inner">
                        <div className="w-48 h-48 bg-white dark:bg-slate-900 rounded-2xl p-3 border-4 border-slate-900 dark:border-white flex flex-col items-center justify-center relative">
                          <QrCode className="w-36 h-36 text-slate-900 dark:text-slate-100" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                              HM
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-2">
                          Scannable by Gate Security Terminal
                        </div>
                      </div>

                      <div className="space-y-2 text-left bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Student:</span>
                          <span className="font-bold">{activeStudent.name} (Room {activeStudent.room})</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Destination:</span>
                          <span className="font-bold">{activeStudentApprovedPass.destination}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Permitted Curfew:</span>
                          <span className="font-bold text-teal-600">{activeStudentApprovedPass.returnTime}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Parent Verified:</span>
                          <span className="font-bold text-emerald-600">✓ OTP Verified</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Cryptographically Signed by Warden {wardens[0].name}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
                      <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
                      <h4 className="font-bold text-base">No Approved Gate Pass Right Now</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Once your outing request is verified by your parent's OTP and approved by the hostel warden, your official digital QR pass will appear here.
                      </p>
                      <button
                        onClick={() => setStudentTab('outing')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        Create Outing Request →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: WEEKLY FOOD REVIEW */}
              {studentTab === 'food' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleSubmitFoodReview}
                    className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <h3 className="font-extrabold text-lg">Weekly Mess Food Evaluation</h3>
                        <p className="text-xs text-slate-500">
                          Reviewed by Gemma 4 Multimodal AI to ensure mess contractor accountability.
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-300 dark:border-teal-800">
                        Multimodal Ready
                      </span>
                    </div>

                    {/* Meal Star Ratings */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((meal) => (
                        <div
                          key={meal}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-center"
                        >
                          <div className="text-xs font-bold capitalize text-slate-700 dark:text-slate-300">{meal}</div>
                          <div className="flex justify-center">
                            <StarRating
                              value={newReview[meal]}
                              onChange={(val) => setNewReview({ ...newReview, [meal]: val })}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      {(['quality', 'hygiene', 'quantity'] as const).map((metric) => (
                        <div key={metric} className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between text-xs font-semibold capitalize">
                            <span>{metric}</span>
                            <span className="text-teal-600 font-bold">{newReview[metric]}%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={newReview[metric]}
                            onChange={(e) =>
                              setNewReview({ ...newReview, [metric]: Number(e.target.value) })
                            }
                            className="w-full accent-teal-600 cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Review text & Multimodal photo */}
                    <div className="space-y-3 pt-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Detailed Comments (Gemma 4 extracts key complaints & praises from here)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g. Samosas at tea were hot and fresh, but dinner rotis after 8:30 PM were hard and dal was thin..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full p-3.5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                      />

                      <div className="flex flex-wrap items-center gap-3">
                        <label className="cursor-pointer px-4 py-2 rounded-xl border border-dashed border-teal-500 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center gap-2 hover:bg-teal-50/40 transition-colors">
                          <Upload className="w-4 h-4" />
                          <span>Attach Mess Plate Photo (Gemma 4 Vision)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) {
                                setNewReview({ ...newReview, photoName: `${f.name} (Uploaded)` });
                                triggerToast(`Attached photo: ${f.name}`);
                              }
                            }}
                          />
                        </label>
                        {newReview.photoName && (
                          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> {newReview.photoName}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm shadow-md transition-colors"
                    >
                      Submit Weekly Evaluation
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: TAMPER-PROOF PROFILE */}
              {studentTab === 'profile' && (
                <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg">Verified Student Profile</h3>
                        <StatusBadge status={activeStudent.editStatus} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Emergency contacts are tamper-proof locked. Edits require warden approval with reason.
                      </p>
                    </div>

                    {activeStudent.editStatus === 'LOCKED' && (
                      <button
                        onClick={() => setShowEditRequestModal(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Request Unlock from Warden</span>
                      </button>
                    )}
                  </div>

                  {showEditRequestModal && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 space-y-3">
                      <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                        Reason for requesting profile edit permission:
                      </div>
                      <input
                        placeholder="e.g. Changed guardian contact number..."
                        value={editReasonInput}
                        onChange={(e) => setEditReasonInput(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-amber-400 bg-white dark:bg-slate-900 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setStudents(
                              students.map((s) =>
                                s.id === activeStudent.id
                                  ? { ...s, editStatus: 'PENDING', editReason: editReasonInput || 'Update guardian phone' }
                                  : s
                              )
                            );
                            setShowEditRequestModal(false);
                            logApiEvent('POST', `/api/students/${activeStudent.id}/request-unlock`, 200, 'Unlock requested');
                            triggerToast('Unlock request dispatched to Warden queue!');
                          }}
                          className="px-4 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
                        >
                          Submit Request
                        </button>
                        <button
                          onClick={() => setShowEditRequestModal(false)}
                          className="px-3 py-1.5 rounded-xl border text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(
                      [
                        { label: 'Student Name', key: 'name' },
                        { label: 'Room Number', key: 'room' },
                        { label: 'Course / Class', key: 'course' },
                        { label: 'Blood Group', key: 'bloodGroup' },
                        { label: 'Student Mobile', key: 'phone' },
                        { label: 'Emergency Contact', key: 'emergencyContact' },
                        { label: 'Parent Name', key: 'parentName' },
                        { label: 'Parent Phone (OTP Destination)', key: 'parentPhone' },
                        { label: 'Permanent Address', key: 'address' }
                      ] as const
                    ).map((f) => {
                      const isLocked = activeStudent.editStatus !== 'UNLOCKED';
                      return (
                        <div key={f.key}>
                          <label className="block text-xs font-semibold mb-1 text-slate-500">
                            {f.label} {isLocked && '🔒'}
                          </label>
                          <input
                            disabled={isLocked}
                            value={activeStudent[f.key]}
                            onChange={(e) =>
                              setStudents(
                                students.map((s) =>
                                  s.id === activeStudent.id ? { ...s, [f.key]: e.target.value } : s
                                )
                              )
                            }
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors ${
                              isLocked
                                ? 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-white dark:bg-slate-900 border-teal-500'
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {activeStudent.editStatus === 'UNLOCKED' && (
                    <button
                      onClick={() => {
                        setStudents(
                          students.map((s) =>
                            s.id === activeStudent.id ? { ...s, editStatus: 'LOCKED' } : s
                          )
                        );
                        logApiEvent('PATCH', `/api/students/${activeStudent.id}`, 200, 'Profile locked');
                        triggerToast('Profile updated & re-locked safely!');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow"
                    >
                      Save Profile & Re-Lock
                    </button>
                  )}
                </div>
              )}

              {/* TAB 5: NOTICES */}
              {studentTab === 'notices' && (
                <div className="space-y-4">
                  <h3 className="font-extrabold text-lg">Official Hostel Notice Board</h3>
                  {notices.map((n) => (
                    <div
                      key={n.id}
                      className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-2 shadow-sm"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800">
                          {n.category}
                        </span>
                        <span className="text-slate-400">{n.date}</span>
                      </div>
                      <h4 className="font-bold text-base">{n.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
                      <div className="text-[11px] text-slate-400 pt-1">Posted by: {n.author}</div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {/* ===================================================================
            VIEW 3: PARENT PORTAL (GEMMA 4 AI FOOD INSIGHTS + OTP VERIFY)
        =================================================================== */}
        {role === 'parent' && (
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="md:col-span-3 space-y-3">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                    Parent Portal
                  </span>
                  <div className="font-extrabold text-base mt-0.5">Mr. Rajesh Sharma</div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Linked Child:</label>
                  <select
                    value={activeStudentId}
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {students.slice(0, 2).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Room {s.room})
                      </option>
                    ))}
                  </select>
                </div>

                <nav className="space-y-1">
                  {(
                    [
                      { id: 'ai_food', label: 'Gemma 4 Food AI', icon: Sparkles },
                      { id: 'overview', label: 'Child Outing Status', icon: UserCheck },
                      { id: 'remarks', label: 'Warden Remarks', icon: MessageSquare }
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setParentTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          parentTab === item.id
                            ? 'bg-teal-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <main className="md:col-span-9 space-y-6">
              {/* Urgent Action Banner: Pending Outing OTP */}
              {outings
                .filter((o) => o.studentId === activeStudent.id && o.status === 'OTP_PENDING')
                .map((pending) => (
                  <div
                    key={pending.id}
                    className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-teal-500/10 to-indigo-500/15 border-2 border-amber-400 dark:border-amber-600 flex flex-wrap items-center justify-between gap-4 shadow-md"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Bell className="w-4 h-4 animate-bounce" />
                        <span>Action Required: Approve Outing for {pending.studentName}</span>
                      </div>
                      <div className="font-bold text-sm sm:text-base">
                        Destination: <span className="underline">{pending.destination}</span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">
                        Curfew: {pending.leaveTime} → {pending.returnTime} • Reason: "{pending.reason}"
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sm font-black">
                        OTP: {pending.otpCode}
                      </div>
                      <button
                        onClick={() => handleVerifyOtp(pending.id, pending.otpCode)}
                        className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-colors"
                      >
                        Verify & Authorize Leave
                      </button>
                    </div>
                  </div>
                ))}

              {/* TAB 1: GEMMA 4 AI MESS FOOD ANALYSIS */}
              {parentTab === 'ai_food' && (
                <div className="space-y-6">
                  {/* Gemma 4 Engine Selector & Controls */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
                          <Sparkles className="w-4 h-4" />
                          <span>Grounded Student Review Intelligence</span>
                        </div>
                        <h3 className="text-xl font-black mt-0.5">Mess Food AI Insights (Gemma 4)</h3>
                      </div>

                      {/* Engine Switcher */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
                          <button
                            onClick={() => setAiEngine('local_ollama')}
                            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                              aiEngine === 'local_ollama'
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            <span>Local Ollama (gemma4:4b)</span>
                          </button>
                          <button
                            onClick={() => setAiEngine('cloud_gemma')}
                            className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                              aiEngine === 'cloud_gemma'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Cloud className="w-3.5 h-3.5" />
                            <span>Cloud (Gemma 4 26B)</span>
                          </button>
                        </div>

                        <button
                          onClick={() => runGemmaAnalysis(aiEngine)}
                          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Re-run Gemma Analysis"
                        >
                          <RefreshCw className={`w-4 h-4 ${aiLoading ? 'animate-spin text-teal-600' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {aiLoading || !aiResult ? (
                      <div className="space-y-3 py-8 animate-pulse">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-28 bg-slate-100 dark:bg-slate-800/60 rounded-2xl" />
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {/* Summary & Score Banner */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-mono text-slate-500">
                              Active Engine: <strong>{aiResult.engineUsed}</strong>
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60">
                              Quality Score: {aiResult.score} / 100 ({aiResult.sentiment})
                            </span>
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                            {aiResult.summary}
                          </p>
                          {aiResult.visionInsight && (
                            <div className="text-xs text-indigo-600 dark:text-indigo-300 font-semibold pt-1 flex items-center gap-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                              <Eye className="w-4 h-4 shrink-0" />
                              <span>{aiResult.visionInsight}</span>
                            </div>
                          )}
                        </div>

                        {/* Top Complaints & Praises (Grounding Quotes) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2">
                            <div className="text-xs font-black uppercase text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" />
                              <span>Top Mess Complaints (Direct Student Quotes)</span>
                            </div>
                            {aiResult.topComplaints.map((c, idx) => (
                              <div key={idx} className="text-xs space-y-1">
                                <div className="font-bold text-slate-800 dark:text-slate-200">{c.issue}</div>
                                <div className="italic text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40">
                                  {c.quote}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                            <div className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Top Mess Praises (Direct Student Quotes)</span>
                            </div>
                            {aiResult.topPraises.map((p, idx) => (
                              <div key={idx} className="text-xs space-y-1">
                                <div className="font-bold text-slate-800 dark:text-slate-200">{p.praise}</div>
                                <div className="italic text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/70 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                                  {p.quote}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 1-Click Polite Complaint Drafter */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4" />
                              <span>1-Click AI-Drafted Parent Complaint for Warden</span>
                            </span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  navigator.clipboard?.writeText(aiResult.draftComplaint);
                                  triggerToast('Complaint text copied to clipboard!');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border text-xs font-bold flex items-center gap-1 hover:bg-slate-50"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </button>
                              <button
                                onClick={() => {
                                  setComplaintSentToWarden(aiResult.draftComplaint);
                                  logApiEvent('POST', '/api/warden/escalate', 200, 'Complaint sent to Warden');
                                  triggerToast('Complaint sent directly to Warden Food Escalation Queue!');
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>Send to Warden</span>
                              </button>
                            </div>
                          </div>
                          <pre className="whitespace-pre-wrap text-xs font-sans text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 leading-relaxed">
                            {aiResult.draftComplaint}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Multi-Week Trend Chart */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                    <h4 className="font-extrabold text-base">Weekly Meal Satisfaction Trends (1 - 5★)</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={WEEKLY_TREND_DATA}>
                          <defs>
                            <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                          <XAxis dataKey="week" fontSize={12} stroke="#64748b" />
                          <YAxis domain={[1, 5]} fontSize={12} stroke="#64748b" />
                          <Tooltip />
                          <Legend />
                          <Area type="monotone" dataKey="Overall" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorOverall)" />
                          <Line type="monotone" dataKey="Breakfast" stroke="#10b981" strokeWidth={2} />
                          <Line type="monotone" dataKey="Lunch" stroke="#6366f1" strokeWidth={2} />
                          <Line type="monotone" dataKey="Dinner" stroke="#f43f5e" strokeWidth={2.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CHILD OVERVIEW */}
              {parentTab === 'overview' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="font-extrabold text-lg">{activeStudent.name}</h3>
                      <p className="text-xs text-slate-500">
                        Room {activeStudent.room} • {activeStudent.course} • Blood Group: {activeStudent.bloodGroup}
                      </p>
                    </div>
                    <StatusBadge status={activeStudent.currentStatus} />
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-bold text-sm">Outing History</h4>
                    {outings
                      .filter((o) => o.studentId === activeStudent.id)
                      .map((o) => (
                        <div
                          key={o.id}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2"
                        >
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span>{o.destination}</span>
                            <StatusBadge status={o.status} />
                          </div>
                          <div className="text-xs text-slate-500">
                            {o.leaveTime} → {o.returnTime} • Reason: "{o.reason}"
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: WARDEN REMARKS */}
              {parentTab === 'remarks' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-lg">Official Remarks from Hostel Warden</h3>
                  {remarks.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-teal-600">{r.category} • Warden {r.wardenName}</span>
                        <span className="text-slate-400">{r.date}</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        )}

        {/* ===================================================================
            VIEW 4: WARDEN DASHBOARD & GATE SCANNER
        =================================================================== */}
        {role === 'warden' && (
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <aside className="md:col-span-3 space-y-3">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Warden Command Center
                  </span>
                  <div className="font-extrabold text-base mt-0.5">Warden Vikram Singh</div>
                  <p className="text-xs text-slate-500">Shift: Full-Time / Gate Security</p>
                </div>

                <nav className="space-y-1">
                  {(
                    [
                      { id: 'outings', label: `Outing Queue (${outings.length})`, icon: MapPin },
                      { id: 'scanner', label: 'Gate Pass QR Scanner', icon: QrCode },
                      { id: 'edits', label: `Unlock Requests (${pendingEditsCount})`, icon: Unlock },
                      { id: 'food', label: 'Food Escalations', icon: Utensils },
                      { id: 'students', label: 'Send Parent Remark', icon: MessageSquare }
                    ] as const
                  ).map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setWardenTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          wardenTab === item.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <main className="md:col-span-9 space-y-6">
              {/* TAB 1: OUTING QUEUE */}
              {wardenTab === 'outings' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-lg">Student Gate Register & Approval Queue</h3>
                  {outings.map((o) => (
                    <div
                      key={o.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-sm">
                            {o.studentName} (Room {o.room}) — {o.type}
                          </span>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Destination: {o.destination} • Curfew: {o.leaveTime} → {o.returnTime}
                          </div>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {o.status === 'OTP_PENDING' && (
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                            ⏳ Waiting for Parent OTP verification ({o.otpCode}) before warden action...
                          </span>
                        )}
                        {o.status === 'WARDEN_PENDING' && (
                          <>
                            <button
                              onClick={() => handleWardenOutingAction(o.id, 'APPROVED')}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                            >
                              ✓ Approve & Issue Digital Gate Pass
                            </button>
                            <button
                              onClick={() => handleWardenOutingAction(o.id, 'REJECTED')}
                              className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                            >
                              ✕ Decline
                            </button>
                          </>
                        )}
                        {o.status === 'APPROVED' && (
                          <button
                            onClick={() => handleWardenOutingAction(o.id, 'OUT')}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                          >
                            Mark Checked-Out at Gate
                          </button>
                        )}
                        {o.status === 'OUT' && (
                          <button
                            onClick={() => handleWardenOutingAction(o.id, 'RETURNED')}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold"
                          >
                            Mark Safely Returned Inside Hostel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 2: GATE PASS QR SCANNER SIMULATOR */}
              {wardenTab === 'scanner' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-5 shadow-sm text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 flex items-center justify-center mx-auto">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <h3 className="font-extrabold text-lg">Main Gate Security Terminal Scanner</h3>
                    <p className="text-xs text-slate-500">
                      Simulate scanning a student's digital QR gate pass at the security turnstile.
                    </p>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="text-xs font-bold text-left">Select Student Gate Pass to Scan:</div>
                      {outings
                        .filter((o) => o.status === 'APPROVED' || o.status === 'OUT')
                        .map((o) => (
                          <div
                            key={o.id}
                            className="p-3 rounded-xl bg-white dark:bg-slate-900 border flex items-center justify-between text-xs"
                          >
                            <div className="text-left">
                              <div className="font-bold">{o.studentName} ({o.destination})</div>
                              <div className="text-slate-500 text-[11px]">Pass ID: {o.id} • Status: {o.status}</div>
                            </div>
                            <button
                              onClick={() => {
                                const next = o.status === 'APPROVED' ? 'OUT' : 'RETURNED';
                                handleWardenOutingAction(o.id, next);
                                logApiEvent('POST', '/api/gate/verify-pass', 200, `Gate Verified Pass ${o.id} -> ${next}`);
                                triggerToast(`QR Verified! Marked ${o.studentName} as ${next}`);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 text-white font-bold"
                            >
                              Scan & {o.status === 'APPROVED' ? 'Mark Out' : 'Mark In'}
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PROFILE UNLOCK REQUESTS */}
              {wardenTab === 'edits' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-lg">Tamper-Proof Profile Unlock Requests</h3>
                  {students.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{s.name} (Room {s.room})</span>
                          <StatusBadge status={s.editStatus} />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Reason: "{s.editReason || 'Standard lock active'}"
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setStudents(
                              students.map((st) => (st.id === s.id ? { ...st, editStatus: 'UNLOCKED' } : st))
                            );
                            logApiEvent('PATCH', `/api/students/${s.id}/unlock`, 200, 'Unlocked by Warden');
                            triggerToast(`Unlocked profile for ${s.name}`);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                        >
                          Approve Unlock
                        </button>
                        <button
                          onClick={() => {
                            setStudents(
                              students.map((st) => (st.id === s.id ? { ...st, editStatus: 'REJECTED' } : st))
                            );
                            triggerToast(`Rejected unlock for ${s.name}`);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: FOOD REVIEW SUMMARY & ESCALATIONS */}
              {wardenTab === 'food' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
                  <h3 className="font-extrabold text-lg">Mess Food Intelligence & Parent Escalations</h3>
                  {complaintSentToWarden && (
                    <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-1.5">
                      <div className="text-xs font-bold text-rose-700 dark:text-rose-300">
                        Formal Parent Escalation Received via Gemma 4:
                      </div>
                      <pre className="whitespace-pre-wrap text-xs font-sans text-slate-700 dark:text-slate-300">
                        {complaintSentToWarden}
                      </pre>
                    </div>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {aiResult?.summary}
                  </p>
                </div>
              )}

              {/* TAB 5: SEND REMARK TO PARENT */}
              {wardenTab === 'students' && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newRemarkForm.message) return;
                    const stu = students.find((s) => s.id === newRemarkForm.studentId) || students[0];
                    const item: WardenRemark = {
                      id: `REM-${remarks.length + 1}`,
                      studentId: stu.id,
                      studentName: stu.name,
                      wardenName: wardens[0].name,
                      date: '24 Oct 2026',
                      category: newRemarkForm.category,
                      message: newRemarkForm.message,
                      read: false
                    };
                    setRemarks([item, ...remarks]);
                    logApiEvent('POST', '/api/warden/remarks', 201, `Remark to ${stu.parentName}`);
                    setNewRemarkForm({ ...newRemarkForm, message: '' });
                    triggerToast(`Remark sent to ${stu.parentName}`);
                  }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm"
                >
                  <h3 className="font-extrabold text-lg">Send Official Remark to Parent</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Student</label>
                      <select
                        value={newRemarkForm.studentId}
                        onChange={(e) => setNewRemarkForm({ ...newRemarkForm, studentId: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (Room {s.room}) — Parent: {s.parentName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Category</label>
                      <select
                        value={newRemarkForm.category}
                        onChange={(e) =>
                          setNewRemarkForm({
                            ...newRemarkForm,
                            category: e.target.value as WardenRemark['category']
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                      >
                        <option value="Appreciation">Appreciation & Leadership</option>
                        <option value="Attendance">Attendance / Late Curfew</option>
                        <option value="Discipline">Discipline & Conduct</option>
                        <option value="Health">Medical / Health Status</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    required
                    placeholder="Write official note to parent..."
                    value={newRemarkForm.message}
                    onChange={(e) => setNewRemarkForm({ ...newRemarkForm, message: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm"
                  />

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm shadow"
                  >
                    Send to Parent Inbox
                  </button>
                </form>
              )}
            </main>
          </div>
        )}

        {/* ===================================================================
            MODAL 1: LIVE BACKEND API CONSOLE & ARCHITECTURE INSPECTOR
        =================================================================== */}
        {showBackendConsole && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 text-white max-w-4xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-5 h-5 text-teal-400" />
                  <h3 className="font-extrabold text-base sm:text-lg">
                    Live Backend Network Console & Architecture
                  </h3>
                </div>
                <button
                  onClick={() => setShowBackendConsole(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Backend Mode Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Target Server:</span>
                  <span className="font-mono text-xs text-teal-300">http://localhost:4000/api</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => {
                      setBackendMode('mock');
                      triggerToast('Using Simulated In-Memory DB Mode');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      backendMode === 'mock' ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Mock In-Memory DB
                  </button>
                  <button
                    onClick={() => {
                      setBackendMode('live');
                      triggerToast('Connected to Live Express / Node.js Server Mode');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold ${
                      backendMode === 'live' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Live Node/Express Server
                  </button>
                </div>
              </div>

              {/* Real-time HTTP Log Feed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>REAL-TIME HTTP TRAFFIC STREAM</span>
                  <span>{apiLogs.length} events logged</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto font-mono text-xs pr-1">
                  {apiLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                        <span className="px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold text-[10px]">
                          {log.method}
                        </span>
                        <span className="text-slate-200">{log.endpoint}</span>
                        <span className="text-slate-400 text-[11px] hidden sm:inline">({log.payloadSummary})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">{log.status}</span>
                        <span className="text-slate-500 text-[10px]">{log.durationMs}ms</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Complete Production Express.js Code Inspector */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>PRODUCTION SERVER CODE (server.js / Express + Gemma 4 Ollama)</span>
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(BACKEND_CODE_SAMPLE);
                      triggerToast('Copied Express.js backend code to clipboard!');
                    }}
                    className="text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Backend Code
                  </button>
                </div>
                <pre className="p-4 rounded-2xl bg-slate-950 text-slate-300 font-mono text-xs max-h-56 overflow-y-auto border border-slate-800">
                  {BACKEND_CODE_SAMPLE}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowBackendConsole(false)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 2: STUDENT SOS EMERGENCY CONFIRMATION
        =================================================================== */}
        {showSosModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border-2 border-rose-500 shadow-2xl space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto animate-bounce">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="font-black text-xl text-rose-600">EMERGENCY SOS ALERT</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Triggering SOS will immediately dispatch your GPS & Room coordinates to Warden {wardens[0].name}, Security Gate, and your registered parent ({activeStudent.parentPhone}).
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleTriggerSos}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30"
                >
                  YES, BROADCAST SOS NOW
                </button>
                <button
                  onClick={() => setShowSosModal(false)}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 3: DIGITAL GATE PASS POPUP
        =================================================================== */}
        {showGatePassModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-extrabold text-teal-600">OFFICIAL DIGITAL GATE PASS</span>
                <button onClick={() => setShowGatePassModal(null)}>
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border flex flex-col items-center">
                <QrCode className="w-36 h-36 text-slate-900 dark:text-white" />
                <span className="text-xs font-mono font-bold mt-2">PASS CODE: {showGatePassModal.id}</span>
              </div>
              <div className="text-left text-xs space-y-1">
                <div><strong>Student:</strong> {showGatePassModal.studentName} (Room {showGatePassModal.room})</div>
                <div><strong>Destination:</strong> {showGatePassModal.destination}</div>
                <div><strong>Curfew Return:</strong> {showGatePassModal.returnTime}</div>
              </div>
              <button
                onClick={() => setShowGatePassModal(null)}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            MODAL 4: SETTINGS MODAL
        =================================================================== */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base">HosMate Settings</h3>
                <button onClick={() => setShowSettingsModal(false)}>
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium">Language</span>
                  <button
                    onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
                    className="px-3 py-1 rounded-xl bg-teal-600 text-white text-xs font-bold"
                  >
                    {lang === 'en' ? 'Switch to Hindi/Hinglish' : 'Switch to English'}
                  </button>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-medium">Appearance</span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="px-3 py-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold"
                  >
                    {darkMode ? 'Light Theme' : 'Dark Theme'}
                  </button>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  triggerToast('Settings applied!');
                }}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Close Settings
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
