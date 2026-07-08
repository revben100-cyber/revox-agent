import { useState, useRef, useEffect } from "react";

const MODULES = [
  { id: "daily", label: "Daily Brief", icon: "☀️", color: "#00C2A8" },
  { id: "analytics", label: "Analytics", icon: "📈", color: "#00C2A8" },
  { id: "deals", label: "Deal Tracker", icon: "📊", color: "#4F8EF7" },
  { id: "clients", label: "Clients", icon: "🏥", color: "#A78BFA" },
  { id: "contacts", label: "Contacts", icon: "👥", color: "#EC4899" },
  { id: "reminders", label: "Reminders", icon: "🔔", color: "#F87171" },
  { id: "scaling", label: "Scaling Engine", icon: "🚀", color: "#F59E0B" },
  { id: "drafts", label: "Draft Assets", icon: "✍️", color: "#34D399" },
];

const INITIAL_DEALS = [
  { id: 1, client: "Amana Regional Referral Hospital", equipment: "Portable Ultrasound System + 2x Patient Monitors", value: "TZS 45,000,000", valueNum: 45000000, valueUSD: "$18,000", stage: "Prospecting", stageColor: "#F59E0B", nextStep: "Send formal quotation and product spec sheet by end of week", issue: "Awaiting procurement officer's budget confirmation", closeProbability: 30, createdDate: "2026-06-15" },
  { id: 2, client: "Kilimanjaro Christian Medical Centre (KCMC)", equipment: "Surgical Table + Anesthesia Machine (bundle)", value: "TZS 95,000,000", valueNum: 95000000, valueUSD: "$38,000", stage: "Negotiation", stageColor: "#4F8EF7", nextStep: "Follow-up call scheduled Monday — counter discount request after supplier approval", issue: "Client requesting 10% discount; awaiting supplier margin approval", closeProbability: 65, createdDate: "2026-05-20" },
  { id: 3, client: "Dr. Amara Polyclinic (Mabibo)", equipment: "Laboratory Analyzer + Reagent Supply Contract", value: "TZS 22,000,000", valueNum: 22000000, valueUSD: "$8,800", stage: "Closing", stageColor: "#34D399", nextStep: "Collect signed LPO; confirm installation and training date", issue: "Waiting on signed LPO and payment clearance", closeProbability: 90, createdDate: "2026-06-01" },
];

const INITIAL_CONTACTS = [
  { id: 1, name: "Dr. Amara", hospital: "Dr. Amara Polyclinic (Mabibo)", role: "Director / Decision Maker", phone: "", email: "", lastContacted: "2026-07-03", dealId: 3, notes: "Verbal commitment received. Waiting on LPO signature." },
  { id: 2, name: "Procurement Officer", hospital: "Amana Regional Referral Hospital", role: "Procurement Officer", phone: "", email: "", lastContacted: "", dealId: 1, notes: "Initial inquiry via WhatsApp. Budget confirmation pending." },
  { id: 3, name: "Procurement Team", hospital: "KCMC", role: "Procurement Team", phone: "", email: "", lastContacted: "2026-07-01", dealId: 2, notes: "Requesting 10% discount. Follow-up call Monday." },
];

const INITIAL_REMINDERS = [
  { id: 1, title: "Send quotation to Amana Hospital", client: "Amana Regional Referral Hospital", type: "Quotation", dueDate: new Date().toISOString().split("T")[0], priority: "High", done: false, dealId: 1 },
  { id: 2, title: "Follow-up call with KCMC — discount counter offer", client: "KCMC", type: "Follow-up", dueDate: new Date().toISOString().split("T")[0], priority: "High", done: false, dealId: 2 },
  { id: 3, title: "Chase signed LPO from Dr. Amara", client: "Dr. Amara Polyclinic", type: "LPO Chase", dueDate: new Date().toISOString().split("T")[0], priority: "Critical", done: false, dealId: 3 },
  { id: 4, title: "Follow-up Day 3 — Amana quotation sent?", client: "Amana Regional Referral Hospital", type: "Follow-up", dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0], priority: "Medium", done: false, dealId: 1 },
  { id: 5, title: "KCMC — Final discount decision expected", client: "KCMC", type: "Negotiation", dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], priority: "High", done: false, dealId: 2 },
];

const MODULE_PROMPTS = {
  daily: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative based in Tanzania.

Rev's current active deals:
1. Amana Regional Referral Hospital — Portable Ultrasound + 2x Patient Monitors — TZS 45M (~$18K) — PROSPECTING — 30% close probability
2. KCMC — Surgical Table + Anesthesia Machine bundle — TZS 95M (~$38K) — NEGOTIATION — 65% close probability
3. Dr. Amara Polyclinic (Mabibo) — Laboratory Analyzer + Reagent Supply Contract — TZS 22M — CLOSING — 90% close probability

Total pipeline: TZS 162,000,000 | Weighted forecast: TZS 88.3M

Generate a DAILY BRIEF:
1. 🎯 TOP 3 PRIORITIES TODAY
2. 📋 PIPELINE SNAPSHOT
3. 🔔 URGENT ALERTS
4. 💡 ONE POWER MOVE

Be specific. Use client names and TZS amounts. Sharp tone.`,

  analytics: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Pipeline Analytics:
- Total pipeline: TZS 162,000,000
- Weighted forecast: TZS 88,300,000
- Deal 1: Amana Hospital — TZS 45M — Prospecting — 30% probability
- Deal 2: KCMC — TZS 95M — Negotiation — 65% probability  
- Deal 3: Dr. Amara — TZS 22M — Closing — 90% probability

When asked about analytics:
- Revenue forecasting and pipeline velocity
- Win rate analysis and deal health scores
- Territory performance insights
- Monthly/quarterly projections
- Recommendations to improve pipeline metrics
- Identify which deals to prioritize for maximum revenue impact

Be data-driven and specific with TZS amounts.`,

  deals: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.
Active deals:
1. Amana Hospital — Ultrasound + Monitors — TZS 45M — PROSPECTING
2. KCMC — Surgical Table + Anesthesia Machine — TZS 95M — NEGOTIATION (10% discount request)
3. Dr. Amara Polyclinic — Lab Analyzer + Reagents — TZS 22M — CLOSING (waiting LPO)
Provide deal analysis, risk flags, negotiation tactics, close strategies.`,

  clients: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.
Clients: Amana Hospital (Government), KCMC (Faith-based), Dr. Amara Polyclinic (Private).
Provide pre-call briefings, upsell opportunities, relationship strategies.`,

  contacts: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.
Contacts: Dr. Amara (Director), Procurement Officer (Amana), Procurement Team (KCMC).
Generate WhatsApp messages, follow-up sequences, LPO reminders, closing messages. Professional warm Tanzanian tone.`,

  reminders: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.
Urgent: Chase Dr. Amara LPO, Send Amana quotation, KCMC follow-up Monday.
Generate follow-up sequences, WhatsApp messages, weekly schedules, closing scripts.`,

  scaling: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.
Current territory: Dar es Salaam. Pipeline: TZS 162M.
Provide territory expansion, NGO-funded opportunities, government tender strategies.`,

  drafts: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.
Draft quotation letters, WhatsApp messages, LinkedIn posts, LPO follow-ups. Professional warm Tanzanian tone.`,
};

const QUICK_ACTIONS = {
  daily: ["Generate my morning brief", "What's my highest priority today?", "Show pipeline health", "Flag overdue follow-ups"],
  analytics: ["Analyze my pipeline health", "What's my weighted revenue forecast?", "Which deal should I prioritize?", "Give me a 30-day revenue projection"],
  deals: ["Analyze my 3 current deals", "How do I handle KCMC discount?", "How to close Dr. Amara faster?", "Forecast this month's revenue"],
  clients: ["Prep me for KCMC Monday call", "Find upsell for Amana Hospital", "Draft LPO follow-up for Dr. Amara", "Build Amana client profile"],
  contacts: ["Draft WhatsApp for Dr. Amara LPO", "Write KCMC follow-up message", "Send quotation reminder to Amana", "Create 7-day follow-up sequence for Dr. Amara"],
  reminders: ["Generate my follow-up sequence for Dr. Amara", "Build Day 1-3-7 sequence for KCMC", "What should I do today?", "Create LPO chase messages"],
  scaling: ["Where should I expand in Tanzania?", "Give me a 90-day growth plan", "Find NGO-funded prospects", "How do I get into government tenders?"],
  drafts: ["Write quotation letter for Amana", "Draft WhatsApp follow-up for Dr. Amara", "Write KCMC counter-offer email", "Create LinkedIn post"],
};

const STAGE_COLORS = { Prospecting: "#F59E0B", Negotiation: "#4F8EF7", Closing: "#34D399", Won: "#00C2A8", Lost: "#F87171" };
const PRIORITY_COLORS = { Critical: "#F87171", High: "#F59E0B", Medium: "#4F8EF7", Low: "#64748B" };
const REMINDER_TYPES = ["Follow-up", "LPO Chase", "Quotation", "Negotiation", "Payment", "Installation", "Other"];
const ROLES = ["Procurement Officer", "Biomedical Engineer", "Director / Decision Maker", "Hospital Administrator", "Finance Officer", "Other"];

// Simple bar chart component
const BarChart = ({ data, maxVal, color, label }) => (
  <div style={{ marginBottom: "16px" }}>
    <div style={{ fontSize: "0.65rem", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
    {data.map((item, i) => (
      <div key={i} style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
          <span style={{ fontSize: "0.72rem", color: "#CBD5E1" }}>{item.label}</span>
          <span style={{ fontSize: "0.72rem", color: item.color || color, fontWeight: 600 }}>{item.display}</span>
        </div>
        <div style={{ height: "6px", background: "#1E2A3A", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(item.value / maxVal) * 100}%`, background: item.color || color, borderRadius: "3px", transition: "width 0.8s ease" }} />
        </div>
      </div>
    ))}
  </div>
);

// Donut chart component
const DonutChart = ({ segments, size = 120 }) => {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  let offset = 0;
  const r = 40;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dash = pct * circumference;
        const gap = circumference - dash;
        const rotation = offset * 360 - 90;
        offset += pct;
        return (
          <circle key={i} cx={cx} cy={cy} r={r}
            fill="none" stroke={seg.color} strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            transform={`rotate(${rotation} ${cx} ${cy})`}
            style={{ transition: "stroke-dasharray 0.8s ease" }}
          />
        );
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#F1F5F9" fontSize="12" fontWeight="700">TZS</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#F1F5F9" fontSize="11" fontWeight="700">162M</text>
    </svg>
  );
};

// Analytics Dashboard Component
const AnalyticsDashboard = ({ deals, reminders }) => {
  const totalPipeline = deals.reduce((s, d) => s + (d.valueNum || 0), 0);
  const weightedForecast = deals.reduce((s, d) => s + ((d.valueNum || 0) * (d.closeProbability || 50) / 100), 0);
  const doneReminders = reminders.filter(r => r.done).length;
  const totalReminders = reminders.length;

  const stageData = [
    { label: "Prospecting", value: deals.filter(d => d.stage === "Prospecting").reduce((s, d) => s + (d.valueNum || 0), 0), color: "#F59E0B", display: `TZS ${(deals.filter(d => d.stage === "Prospecting").reduce((s, d) => s + (d.valueNum || 0), 0) / 1000000).toFixed(0)}M` },
    { label: "Negotiation", value: deals.filter(d => d.stage === "Negotiation").reduce((s, d) => s + (d.valueNum || 0), 0), color: "#4F8EF7", display: `TZS ${(deals.filter(d => d.stage === "Negotiation").reduce((s, d) => s + (d.valueNum || 0), 0) / 1000000).toFixed(0)}M` },
    { label: "Closing", value: deals.filter(d => d.stage === "Closing").reduce((s, d) => s + (d.valueNum || 0), 0), color: "#34D399", display: `TZS ${(deals.filter(d => d.stage === "Closing").reduce((s, d) => s + (d.valueNum || 0), 0) / 1000000).toFixed(0)}M` },
  ];

  const dealData = deals.map(d => ({
    label: d.client.split(" ").slice(0, 2).join(" "),
    value: d.valueNum || 0,
    color: d.stageColor,
    display: `TZS ${((d.valueNum || 0) / 1000000).toFixed(0)}M`,
  }));

  const probabilityData = deals.map(d => ({
    label: d.client.split(" ").slice(0, 2).join(" "),
    value: d.closeProbability || 50,
    color: d.stageColor,
    display: `${d.closeProbability}%`,
  }));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "#F1F5F9", marginBottom: "4px" }}>📈 Pipeline Analytics</div>
          <div style={{ fontSize: "0.75rem", color: "#475569" }}>Live dashboard — Tanzania Biomedical Equipment Sales</div>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total Pipeline", value: `TZS ${(totalPipeline / 1000000).toFixed(0)}M`, sub: `${deals.length} active deals`, color: "#00C2A8", icon: "💰" },
            { label: "Weighted Forecast", value: `TZS ${(weightedForecast / 1000000).toFixed(1)}M`, sub: "by close probability", color: "#4F8EF7", icon: "🎯" },
            { label: "Closing Soon", value: `TZS ${(deals.filter(d => d.stage === "Closing").reduce((s, d) => s + (d.valueNum || 0), 0) / 1000000).toFixed(0)}M`, sub: `${deals.filter(d => d.stage === "Closing").length} deal(s)`, color: "#34D399", icon: "🏆" },
            { label: "Tasks Done", value: `${doneReminders}/${totalReminders}`, sub: "reminders completed", color: "#A78BFA", icon: "✅" },
          ].map((kpi, i) => (
            <div key={i} style={{ background: "#141C2E", borderRadius: "12px", padding: "14px", border: `1px solid ${kpi.color}30` }}>
              <div style={{ fontSize: "1.4rem", marginBottom: "6px" }}>{kpi.icon}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: kpi.color, marginBottom: "2px" }}>{kpi.value}</div>
              <div style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600 }}>{kpi.label}</div>
              <div style={{ fontSize: "0.62rem", color: "#475569", marginTop: "2px" }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>

          {/* Donut + Stage breakdown */}
          <div style={{ background: "#141C2E", borderRadius: "12px", padding: "16px", border: "1px solid #1E2A3A" }}>
            <div style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Pipeline by Stage</div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <DonutChart segments={stageData.filter(s => s.value > 0)} size={100} />
              <div style={{ flex: 1 }}>
                {stageData.filter(s => s.value > 0).map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.68rem", color: "#CBD5E1" }}>{s.label}</span>
                    <span style={{ fontSize: "0.68rem", color: s.color, fontWeight: 700, marginLeft: "auto" }}>{s.display}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Close Probability */}
          <div style={{ background: "#141C2E", borderRadius: "12px", padding: "16px", border: "1px solid #1E2A3A" }}>
            <BarChart data={probabilityData} maxVal={100} color="#00C2A8" label="Close Probability %" />
          </div>
        </div>

        {/* Deal Value Chart */}
        <div style={{ background: "#141C2E", borderRadius: "12px", padding: "16px", border: "1px solid #1E2A3A", marginBottom: "20px" }}>
          <BarChart data={dealData} maxVal={Math.max(...dealData.map(d => d.value))} color="#4F8EF7" label="Deal Value by Client" />
        </div>

        {/* Deal Health Scorecards */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Deal Health Scores</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
            {deals.map((deal, i) => {
              const health = deal.closeProbability >= 70 ? { label: "Strong", color: "#34D399" } : deal.closeProbability >= 40 ? { label: "Moderate", color: "#F59E0B" } : { label: "At Risk", color: "#F87171" };
              return (
                <div key={i} style={{ background: "#0F1422", borderRadius: "12px", padding: "14px", border: `1px solid ${deal.stageColor}30` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E2E8F0", lineHeight: 1.3, flex: 1 }}>{deal.client.split("(")[0].trim()}</div>
                    <span style={{ fontSize: "0.62rem", color: health.color, background: `${health.color}18`, padding: "2px 6px", borderRadius: "4px", fontWeight: 600, flexShrink: 0, marginLeft: "6px" }}>{health.label}</span>
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "#64748B", marginBottom: "8px" }}>{deal.equipment}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "0.72rem", color: deal.stageColor, fontWeight: 600 }}>{deal.stage}</span>
                    <span style={{ fontSize: "0.72rem", color: "#94A3B8" }}>{deal.value}</span>
                  </div>
                  <div style={{ marginBottom: "4px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                      <span style={{ fontSize: "0.62rem", color: "#64748B" }}>Close probability</span>
                      <span style={{ fontSize: "0.62rem", color: health.color, fontWeight: 700 }}>{deal.closeProbability}%</span>
                    </div>
                    <div style={{ height: "4px", background: "#1E2A3A", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${deal.closeProbability}%`, background: health.color, borderRadius: "2px" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: "0.62rem", color: "#475569", marginTop: "8px", lineHeight: 1.4 }}>→ {deal.nextStep}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Projection */}
        <div style={{ background: "#141C2E", borderRadius: "12px", padding: "16px", border: "1px solid #1E2A3A" }}>
          <div style={{ fontSize: "0.72rem", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Revenue Scenarios</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            {[
              { label: "Conservative", value: deals.reduce((s, d) => s + (d.valueNum || 0) * 0.3, 0), color: "#F87171", desc: "30% of pipeline" },
              { label: "Expected", value: weightedForecast, color: "#F59E0B", desc: "Weighted forecast" },
              { label: "Optimistic", value: totalPipeline * 0.85, color: "#34D399", desc: "85% of pipeline" },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center", padding: "12px", background: "#0F1422", borderRadius: "10px", border: `1px solid ${s.color}30` }}>
                <div style={{ fontSize: "0.62rem", color: "#64748B", marginBottom: "6px" }}>{s.label}</div>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: s.color }}>TZS {(s.value / 1000000).toFixed(1)}M</div>
                <div style={{ fontSize: "0.58rem", color: "#475569", marginTop: "4px" }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default function REVOXAgent() {
  const [activeModule, setActiveModule] = useState("analytics");
  const [messages, setMessages] = useState(() => { try { const s = localStorage.getItem("revox_messages"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const [deals, setDeals] = useState(() => { try { const s = localStorage.getItem("revox_deals"); return s ? JSON.parse(s) : INITIAL_DEALS; } catch { return INITIAL_DEALS; } });
  const [contacts, setContacts] = useState(() => { try { const s = localStorage.getItem("revox_contacts"); return s ? JSON.parse(s) : INITIAL_CONTACTS; } catch { return INITIAL_CONTACTS; } });
  const [reminders, setReminders] = useState(() => { try { const s = localStorage.getItem("revox_reminders"); return s ? JSON.parse(s) : INITIAL_REMINDERS; } catch { return INITIAL_REMINDERS; } });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("chat");
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [reminderFilter, setReminderFilter] = useState("all");
  const [editingContact, setEditingContact] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("reminders");
  const [newDeal, setNewDeal] = useState({ client: "", equipment: "", value: "", valueNum: 0, stage: "Prospecting", nextStep: "", issue: "", closeProbability: 50 });
  const [newContact, setNewContact] = useState({ name: "", hospital: "", role: "Procurement Officer", phone: "", email: "", notes: "", dealId: "" });
  const [newReminder, setNewReminder] = useState({ title: "", client: "", type: "Follow-up", dueDate: new Date().toISOString().split("T")[0], priority: "High", dealId: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const messagesEndRef = useRef(null);

  const currentMessages = messages[activeModule] || [];
  const activeModuleData = MODULES.find((m) => m.id === activeModule);
  const today = new Date().toISOString().split("T")[0];
  const overdueReminders = reminders.filter(r => !r.done && r.dueDate < today);
  const todayReminders = reminders.filter(r => !r.done && r.dueDate === today);
  const upcomingReminders = reminders.filter(r => !r.done && r.dueDate > today);
  const doneReminders = reminders.filter(r => r.done);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("https://revox-proxy.onrender.com/calendar/today")
      .then(r => r.json())
      .then(data => { setCalendarConnected(data.connected); setCalendarEvents(data.events || []); })
      .catch(() => {});
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeModule]);
  useEffect(() => { try { localStorage.setItem("revox_messages", JSON.stringify(messages)); } catch {} }, [messages]);
  useEffect(() => { try { localStorage.setItem("revox_deals", JSON.stringify(deals)); } catch {} }, [deals]);
  useEffect(() => { try { localStorage.setItem("revox_contacts", JSON.stringify(contacts)); } catch {} }, [contacts]);
  useEffect(() => { try { localStorage.setItem("revox_reminders", JSON.stringify(reminders)); } catch {} }, [reminders]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    if (isMobile) setView("chat");
    const userMsg = { role: "user", content: userText };
    const updatedMsgs = [...currentMessages, userMsg];
    setMessages((prev) => ({ ...prev, [activeModule]: updatedMsgs }));
    setLoading(true);
    try {
      const response = await fetch("https://revox-proxy.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: MODULE_PROMPTS[activeModule], messages: updatedMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json();
      const txt = data?.content?.[0]?.text || data?.error?.message || "No response received.";
      setMessages((prev) => ({ ...prev, [activeModule]: [...updatedMsgs, { role: "assistant", content: txt }] }));
    } catch {
      setMessages((prev) => ({ ...prev, [activeModule]: [...updatedMsgs, { role: "assistant", content: "Connection error. Please try again." }] }));
    } finally { setLoading(false); }
  };

  const addDeal = () => {
    if (!newDeal.client || !newDeal.equipment) return;
    const valueNum = parseInt(newDeal.value.replace(/[^0-9]/g, "")) || 0;
    setDeals(prev => [...prev, { ...newDeal, id: Date.now(), valueNum, stageColor: STAGE_COLORS[newDeal.stage] || "#64748B", createdDate: today }]);
    setNewDeal({ client: "", equipment: "", value: "", valueNum: 0, stage: "Prospecting", nextStep: "", issue: "", closeProbability: 50 });
    setShowAddDeal(false);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.hospital) return;
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact ? { ...newContact, id: editingContact, lastContacted: today } : c));
      setEditingContact(null);
    } else {
      setContacts(prev => [...prev, { ...newContact, id: Date.now(), lastContacted: today }]);
    }
    setNewContact({ name: "", hospital: "", role: "Procurement Officer", phone: "", email: "", notes: "", dealId: "" });
    setShowAddContact(false);
  };

  const addReminder = () => {
    if (!newReminder.title || !newReminder.client) return;
    setReminders(prev => [...prev, { ...newReminder, id: Date.now(), done: false }]);
    setNewReminder({ title: "", client: "", type: "Follow-up", dueDate: today, priority: "High", dealId: "" });
    setShowAddReminder(false);
  };

  const toggleReminder = (id) => setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const deleteReminder = (id) => setReminders(prev => prev.filter(r => r.id !== id));

  const generateFollowUpSequence = (contact) => {
    const deal = deals.find(d => d.id === contact.dealId);
    const prompt = `Generate a complete WhatsApp follow-up sequence for ${contact.name} at ${contact.hospital}. ${deal ? `Deal: ${deal.equipment} worth ${deal.value} — currently ${deal.stage}. Next step: ${deal.nextStep}` : ""}. Create Day 1, Day 3, Day 7, Day 14 messages. Each under 100 words. Professional warm Tanzanian tone.`;
    setActiveModule("reminders");
    if (isMobile) setView("chat");
    sendMessage(prompt);
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Dear ${name}, `);
    window.open(phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}` : `https://wa.me/?text=${message}`, "_blank");
  };

  const draftWhatsApp = (contact) => {
    const deal = deals.find(d => d.id === contact.dealId);
    sendMessage(`Draft a short professional WhatsApp follow-up message for ${contact.name} at ${contact.hospital}. ${deal ? `Deal: ${deal.equipment} worth ${deal.value} — ${deal.stage}. Next step: ${deal.nextStep}` : ""}. Under 100 words, warm professional tone.`);
    setActiveModule("contacts");
    if (isMobile) setView("chat");
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.hospital.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const formatMessage = (text) => text.split("\n").map((line, i) => {
    if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### "))
      return <p key={i} style={{ fontWeight: 700, color: "#E2E8F0", fontSize: "0.95rem", marginTop: "12px", marginBottom: "4px" }}>{line.replace(/^#+\s/, "")}</p>;
    if (line.startsWith("- ") || line.startsWith("• "))
      return <p key={i} style={{ paddingLeft: "16px", color: "#CBD5E1", fontSize: "0.875rem", margin: "3px 0", lineHeight: 1.6 }}>{line}</p>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} style={{ color: "#CBD5E1", fontSize: "0.875rem", margin: "3px 0", lineHeight: 1.7 }}>{line}</p>;
  });

  const inputStyle = { width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #1E2A3A", background: "#0B0F1A", color: "#E2E8F0", fontSize: "0.8rem", outline: "none", fontFamily: "inherit", marginBottom: "8px" };

  const ReminderCard = ({ reminder }) => {
    const isOverdue = reminder.dueDate < today && !reminder.done;
    const isToday = reminder.dueDate === today && !reminder.done;
    return (
      <div style={{ marginBottom: "8px", padding: "10px", background: reminder.done ? "#0F1422" : "#141C2E", borderRadius: "10px", borderLeft: `3px solid ${reminder.done ? "#1E2A3A" : PRIORITY_COLORS[reminder.priority]}`, opacity: reminder.done ? 0.5 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
              <input type="checkbox" checked={reminder.done} onChange={() => toggleReminder(reminder.id)} style={{ cursor: "pointer", accentColor: "#34D399" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: reminder.done ? "#475569" : "#E2E8F0", textDecoration: reminder.done ? "line-through" : "none" }}>{reminder.title}</span>
            </div>
            <div style={{ fontSize: "0.65rem", color: "#64748B", paddingLeft: "20px" }}>{reminder.client}</div>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px", paddingLeft: "20px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.6rem", color: PRIORITY_COLORS[reminder.priority], background: `${PRIORITY_COLORS[reminder.priority]}18`, padding: "2px 6px", borderRadius: "4px" }}>{reminder.priority}</span>
              <span style={{ fontSize: "0.6rem", color: "#64748B", background: "#1E2A3A", padding: "2px 6px", borderRadius: "4px" }}>{reminder.type}</span>
              <span style={{ fontSize: "0.6rem", color: isOverdue ? "#F87171" : isToday ? "#F59E0B" : "#64748B" }}>{isOverdue ? "⚠️ Overdue" : isToday ? "📅 Today" : reminder.dueDate}</span>
            </div>
          </div>
          <button onClick={() => deleteReminder(reminder.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.65rem", flexShrink: 0 }}>✕</button>
        </div>
        {!reminder.done && (
          <button onClick={() => { const c = contacts.find(c => c.dealId === reminder.dealId); if (c) draftWhatsApp(c); else sendMessage(`Draft WhatsApp for ${reminder.client}: ${reminder.title}`); }}
            style={{ width: "100%", padding: "5px", borderRadius: "6px", border: "1px solid #25D366", background: "transparent", color: "#25D366", fontSize: "0.65rem", cursor: "pointer", marginTop: "6px" }}>
            💬 Draft WhatsApp
          </button>
        )}
      </div>
    );
  };

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #1E2A3A", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #00C2A8, #4F8EF7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>⚡</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#F1F5F9" }}>REVOX</div>
            <div style={{ fontSize: "0.65rem", color: "#64748B", letterSpacing: "1px", textTransform: "uppercase" }}>Business Agent</div>
          </div>
        </div>
        {isMobile && <button onClick={() => setView("chat")} style={{ background: "none", border: "none", color: "#64748B", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>}
      </div>

      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
          <div style={{ background: "#141C2E", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#F87171" }}>{overdueReminders.length + todayReminders.length}</div>
            <div style={{ fontSize: "0.58rem", color: "#64748B" }}>Due Today</div>
          </div>
          <div style={{ background: "#141C2E", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#00C2A8" }}>TZS 162M</div>
            <div style={{ fontSize: "0.58rem", color: "#64748B" }}>Pipeline</div>
          </div>
          <div style={{ background: "#141C2E", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#34D399" }}>{deals.length}</div>
            <div style={{ fontSize: "0.58rem", color: "#64748B" }}>Deals</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", padding: "10px 16px", gap: "6px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
        {["reminders", "deals", "contacts"].map(tab => (
          <button key={tab} onClick={() => setSidebarTab(tab)} style={{
            flex: 1, padding: "6px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
            background: sidebarTab === tab ? (tab === "reminders" ? "#F87171" : tab === "deals" ? "#4F8EF7" : "#EC4899") : "#141C2E",
            color: sidebarTab === tab ? "#fff" : "#64748B", fontSize: "0.65rem", fontWeight: 600,
          }}>
            {tab === "reminders" ? "🔔" : tab === "deals" ? "📊" : "👥"} {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {sidebarTab === "reminders" && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "10px", flexWrap: "wrap" }}>
            {["all", "today", "overdue", "upcoming"].map(f => (
              <button key={f} onClick={() => setReminderFilter(f)} style={{ padding: "4px 8px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "0.62rem", background: reminderFilter === f ? "#F87171" : "#141C2E", color: reminderFilter === f ? "#fff" : "#64748B" }}>
                {f === "overdue" ? `⚠️ Overdue (${overdueReminders.length})` : f === "today" ? `📅 Today (${todayReminders.length})` : f === "upcoming" ? `📆 Upcoming (${upcomingReminders.length})` : `All (${reminders.filter(r => !r.done).length})`}
              </button>
            ))}
          </div>
          {(reminderFilter === "all" || reminderFilter === "overdue") && overdueReminders.length > 0 && (<><div style={{ fontSize: "0.6rem", color: "#F87171", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>⚠️ Overdue</div>{overdueReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}</>)}
          {(reminderFilter === "all" || reminderFilter === "today") && todayReminders.length > 0 && (<><div style={{ fontSize: "0.6rem", color: "#F59E0B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>📅 Today</div>{todayReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}</>)}
          {(reminderFilter === "all" || reminderFilter === "upcoming") && upcomingReminders.length > 0 && (<><div style={{ fontSize: "0.6rem", color: "#4F8EF7", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>📆 Upcoming</div>{upcomingReminders.map(r => <ReminderCard key={r.id} reminder={r} />)}</>)}
          {doneReminders.length > 0 && (<><div style={{ fontSize: "0.6rem", color: "#34D399", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>✅ Done ({doneReminders.length})</div>{doneReminders.slice(0, 2).map(r => <ReminderCard key={r.id} reminder={r} />)}</>)}
          {showAddReminder ? (
            <div style={{ background: "#141C2E", borderRadius: "10px", padding: "12px", border: "1px solid #F87171" }}>
              <input placeholder="Reminder title *" value={newReminder.title} onChange={e => setNewReminder(p => ({ ...p, title: e.target.value }))} style={inputStyle} />
              <input placeholder="Client name *" value={newReminder.client} onChange={e => setNewReminder(p => ({ ...p, client: e.target.value }))} style={inputStyle} />
              <select value={newReminder.type} onChange={e => setNewReminder(p => ({ ...p, type: e.target.value }))} style={{ ...inputStyle }}>{REMINDER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select>
              <select value={newReminder.priority} onChange={e => setNewReminder(p => ({ ...p, priority: e.target.value }))} style={{ ...inputStyle }}>{["Critical", "High", "Medium", "Low"].map(p => <option key={p} value={p}>{p}</option>)}</select>
              <input type="date" value={newReminder.dueDate} onChange={e => setNewReminder(p => ({ ...p, dueDate: e.target.value }))} style={{ ...inputStyle }} />
              <select value={newReminder.dealId} onChange={e => setNewReminder(p => ({ ...p, dealId: parseInt(e.target.value) }))} style={{ ...inputStyle, marginBottom: "10px" }}><option value="">Link to deal (optional)</option>{deals.map(d => <option key={d.id} value={d.id}>{d.client}</option>)}</select>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={addReminder} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#F87171", color: "#fff", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>Add</button>
                <button onClick={() => setShowAddReminder(false)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #1E2A3A", background: "transparent", color: "#64748B", fontSize: "0.78rem", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddReminder(true)} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: "1px dashed #F87171", background: "transparent", color: "#F87171", fontSize: "0.75rem", cursor: "pointer", marginTop: "4px" }}>+ Add Reminder</button>
          )}
        </div>
      )}

      {sidebarTab === "deals" && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
          {deals.map((deal) => (
            <div key={deal.id} style={{ marginBottom: "8px", padding: "10px", background: "#141C2E", borderRadius: "10px", borderLeft: `3px solid ${deal.stageColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E2E8F0", flex: 1, lineHeight: 1.3 }}>{deal.client}</div>
                <button onClick={() => setDeals(p => p.filter(d => d.id !== deal.id))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.7rem" }}>✕</button>
              </div>
              <div style={{ fontSize: "0.68rem", color: "#64748B", marginTop: "3px" }}>{deal.equipment}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "0.68rem", color: deal.stageColor, fontWeight: 600, background: `${deal.stageColor}18`, padding: "2px 6px", borderRadius: "4px" }}>{deal.stage}</span>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>{deal.value}</span>
              </div>
              {deal.nextStep && <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "6px", borderTop: "1px solid #1E2A3A", paddingTop: "6px" }}>→ {deal.nextStep}</div>}
            </div>
          ))}
          {showAddDeal ? (
            <div style={{ background: "#141C2E", borderRadius: "10px", padding: "12px", border: "1px solid #1E2A3A" }}>
              <input placeholder="Client name *" value={newDeal.client} onChange={e => setNewDeal(p => ({ ...p, client: e.target.value }))} style={inputStyle} />
              <input placeholder="Equipment *" value={newDeal.equipment} onChange={e => setNewDeal(p => ({ ...p, equipment: e.target.value }))} style={inputStyle} />
              <input placeholder="Value (e.g. TZS 20,000,000)" value={newDeal.value} onChange={e => setNewDeal(p => ({ ...p, value: e.target.value }))} style={inputStyle} />
              <select value={newDeal.stage} onChange={e => setNewDeal(p => ({ ...p, stage: e.target.value }))} style={{ ...inputStyle }}>{Object.keys(STAGE_COLORS).map(s => <option key={s} value={s}>{s}</option>)}</select>
              <input placeholder="Next step" value={newDeal.nextStep} onChange={e => setNewDeal(p => ({ ...p, nextStep: e.target.value }))} style={inputStyle} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={addDeal} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#00C2A8", color: "#fff", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>Add Deal</button>
                <button onClick={() => setShowAddDeal(false)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #1E2A3A", background: "transparent", color: "#64748B", fontSize: "0.78rem", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddDeal(true)} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: "1px dashed #1E2A3A", background: "transparent", color: "#475569", fontSize: "0.75rem", cursor: "pointer", marginTop: "4px" }}>+ Add New Deal</button>
          )}
        </div>
      )}

      {sidebarTab === "contacts" && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
          <input placeholder="🔍 Search contacts..." value={contactSearch} onChange={e => setContactSearch(e.target.value)} style={{ ...inputStyle, marginBottom: "10px" }} />
          {filteredContacts.map((contact) => (
            <div key={contact.id} style={{ marginBottom: "8px", padding: "10px", background: "#141C2E", borderRadius: "10px", borderLeft: "3px solid #EC4899" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E2E8F0" }}>{contact.name}</div>
                  <div style={{ fontSize: "0.65rem", color: "#EC4899" }}>{contact.role}</div>
                  <div style={{ fontSize: "0.65rem", color: "#64748B" }}>{contact.hospital}</div>
                </div>
                <button onClick={() => setContacts(p => p.filter(c => c.id !== contact.id))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.7rem" }}>✕</button>
              </div>
              {contact.notes && <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "4px", borderTop: "1px solid #1E2A3A", paddingTop: "4px" }}>{contact.notes}</div>}
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <button onClick={() => openWhatsApp(contact.phone, contact.name)} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", background: "#25D366", color: "#fff", fontSize: "0.65rem", cursor: "pointer", fontWeight: 600 }}>💬 WhatsApp</button>
                <button onClick={() => draftWhatsApp(contact)} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #EC4899", background: "transparent", color: "#EC4899", fontSize: "0.65rem", cursor: "pointer" }}>✍️ Draft</button>
                <button onClick={() => generateFollowUpSequence(contact)} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #4F8EF7", background: "transparent", color: "#4F8EF7", fontSize: "0.65rem", cursor: "pointer" }}>📅 Seq</button>
              </div>
            </div>
          ))}
          {showAddContact ? (
            <div style={{ background: "#141C2E", borderRadius: "10px", padding: "12px", border: "1px solid #EC4899", marginTop: "8px" }}>
              <input placeholder="Full name *" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              <input placeholder="Hospital / Clinic *" value={newContact.hospital} onChange={e => setNewContact(p => ({ ...p, hospital: e.target.value }))} style={inputStyle} />
              <select value={newContact.role} onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle }}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select>
              <input placeholder="WhatsApp (e.g. 255712345678)" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
              <select value={newContact.dealId} onChange={e => setNewContact(p => ({ ...p, dealId: parseInt(e.target.value) }))} style={{ ...inputStyle }}><option value="">Link to deal (optional)</option>{deals.map(d => <option key={d.id} value={d.id}>{d.client}</option>)}</select>
              <textarea placeholder="Notes..." value={newContact.notes} onChange={e => setNewContact(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, resize: "none", height: "60px", marginBottom: "10px" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={addContact} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#EC4899", color: "#fff", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>Add Contact</button>
                <button onClick={() => setShowAddContact(false)} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #1E2A3A", background: "transparent", color: "#64748B", fontSize: "0.78rem", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddContact(true)} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: "1px dashed #EC4899", background: "transparent", color: "#EC4899", fontSize: "0.75rem", cursor: "pointer", marginTop: "8px" }}>+ Add New Contact</button>
          )}
        </div>
      )}

      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase" }}>Today's Schedule</div>
          {!calendarConnected && <a href="https://revox-proxy.onrender.com/auth/google" target="_blank" rel="noreferrer" style={{ fontSize: "0.6rem", color: "#00C2A8", textDecoration: "none", border: "1px solid #00C2A830", padding: "3px 8px", borderRadius: "4px" }}>Connect</a>}
        </div>
        {!calendarConnected && <div style={{ fontSize: "0.7rem", color: "#475569" }}>Connect Google Calendar above.</div>}
        {calendarConnected && calendarEvents.length === 0 && <div style={{ fontSize: "0.7rem", color: "#475569" }}>No meetings today 🎉</div>}
        {calendarEvents.map((event, i) => (
          <div key={i} style={{ marginBottom: "6px", padding: "8px", background: "#141C2E", borderRadius: "8px", borderLeft: "2px solid #00C2A8" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#E2E8F0" }}>{event.title}</div>
            <div style={{ fontSize: "0.62rem", color: "#64748B" }}>{new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "12px 10px", flex: 1 }}>
        <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "6px" }}>Modules</div>
        {MODULES.map((mod) => (
          <button key={mod.id} onClick={() => { setActiveModule(mod.id); if (isMobile) setView("chat"); }} style={{
            display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "11px 12px", borderRadius: "10px",
            border: "none", cursor: "pointer", marginBottom: "3px",
            background: activeModule === mod.id ? `${mod.color}18` : "transparent",
            borderLeft: activeModule === mod.id ? `3px solid ${mod.color}` : "3px solid transparent",
            transition: "all 0.15s", textAlign: "left",
          }}>
            <span style={{ fontSize: "1.2rem" }}>{mod.icon}</span>
            <span style={{ fontSize: "0.88rem", fontWeight: activeModule === mod.id ? 600 : 400, color: activeModule === mod.id ? "#F1F5F9" : "#64748B" }}>{mod.label}</span>
            {mod.id === "reminders" && (overdueReminders.length + todayReminders.length) > 0 && (
              <span style={{ marginLeft: "auto", background: "#F87171", color: "#fff", fontSize: "0.6rem", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" }}>{overdueReminders.length + todayReminders.length}</span>
            )}
            {mod.id !== "reminders" && messages[mod.id]?.length > 0 && <span style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: mod.color }} />}
          </button>
        ))}
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #1E2A3A", flexShrink: 0 }}>
        <button onClick={() => { localStorage.removeItem("revox_messages"); setMessages({}); }} style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #1E2A3A", background: "transparent", color: "#475569", fontSize: "0.75rem", cursor: "pointer", marginBottom: "10px" }}>🗑️ Clear History</button>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #4F8EF7, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>R</div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#E2E8F0" }}>Rev</div>
            <div style={{ fontSize: "0.68rem", color: "#475569" }}>Biomedical Sales Rep · Tanzania</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 5px #34D399" }} />
            <span style={{ fontSize: "0.65rem", color: "#34D399" }}>Online</span>
          </div>
        </div>
      </div>
    </div>
  );

  const ChatView = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ padding: isMobile ? "12px 16px" : "14px 24px", borderBottom: "1px solid #1E2A3A", display: "flex", alignItems: "center", gap: "10px", background: "#0B0F1A", flexShrink: 0 }}>
        <button onClick={() => setView("sidebar")} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "1.3rem", padding: "4px" }}>☰</button>
        <span style={{ fontSize: "1.3rem" }}>{activeModuleData?.icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: isMobile ? "0.9rem" : "0.95rem", color: "#F1F5F9" }}>{activeModuleData?.label}</div>
          <div style={{ fontSize: "0.65rem", color: "#475569" }}>REVOX · Biomedical Sales · Tanzania</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
          {(overdueReminders.length + todayReminders.length) > 0 && (
            <span style={{ background: "#F87171", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: "10px", cursor: "pointer" }} onClick={() => { setActiveModule("reminders"); setSidebarTab("reminders"); }}>
              🔔 {overdueReminders.length + todayReminders.length} due
            </span>
          )}
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 5px #34D399" }} />
          <span style={{ fontSize: "0.68rem", color: "#34D399" }}>Live</span>
        </div>
      </div>

      {/* Analytics module renders dashboard instead of chat */}
      {activeModule === "analytics" ? (
        <AnalyticsDashboard deals={deals} reminders={reminders} />
      ) : (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? "16px 12px" : "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            {currentMessages.length === 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "20px", minHeight: "60vh" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "12px" }}>{activeModuleData?.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "#F1F5F9", marginBottom: "8px" }}>{activeModuleData?.label}</div>
                  <div style={{ color: "#475569", fontSize: "0.85rem", maxWidth: "280px", lineHeight: 1.5 }}>Ask REVOX anything or pick a quick action below</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "8px", width: "100%", maxWidth: "340px" }}>
                  {(QUICK_ACTIONS[activeModule] || []).map((action, i) => (
                    <button key={i} onClick={() => sendMessage(action)} style={{ padding: "13px 16px", borderRadius: "12px", border: `1px solid ${activeModuleData?.color}30`, background: `${activeModuleData?.color}08`, color: "#CBD5E1", fontSize: "0.82rem", cursor: "pointer", textAlign: "left", lineHeight: 1.4 }}>{action}</button>
                  ))}
                </div>
              </div>
            )}
            {currentMessages.map((msg, i) => (
              <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: "8px" }}>
                {msg.role === "assistant" && <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>⚡</div>}
                <div style={{ maxWidth: isMobile ? "85%" : "72%", padding: "12px 14px", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "user" ? `linear-gradient(135deg, ${activeModuleData?.color}DD, #4F8EF7DD)` : "#141C2E", border: msg.role === "assistant" ? "1px solid #1E2A3A" : "none" }}>
                  {msg.role === "user" ? <p style={{ margin: 0, fontSize: "0.875rem", color: "#fff", lineHeight: 1.6 }}>{msg.content}</p> : <div>{formatMessage(msg.content)}</div>}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>⚡</div>
                <div style={{ padding: "12px 16px", background: "#141C2E", borderRadius: "16px 16px 16px 4px", border: "1px solid #1E2A3A", display: "flex", gap: "5px", alignItems: "center" }}>
                  {[0, 1, 2].map((i) => <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: activeModuleData?.color, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {isMobile && currentMessages.length > 0 && (
            <div style={{ display: "flex", gap: "6px", padding: "8px 12px 0", overflowX: "auto" }}>
              {(QUICK_ACTIONS[activeModule] || []).slice(0, 3).map((action, i) => (
                <button key={i} onClick={() => sendMessage(action)} style={{ padding: "6px 12px", borderRadius: "20px", border: "1px solid #1E2A3A", background: "#141C2E", color: "#64748B", fontSize: "0.7rem", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>{action}</button>
              ))}
            </div>
          )}
          <div style={{ padding: isMobile ? "10px 12px 16px" : "16px 24px", borderTop: "1px solid #1E2A3A", background: "#0B0F1A", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} placeholder="Ask REVOX…" rows={1}
                style={{ flex: 1, padding: "12px 14px", borderRadius: "14px", border: "1px solid #1E2A3A", background: "#141C2E", color: "#E2E8F0", fontSize: "0.9rem", resize: "none", outline: "none", lineHeight: 1.5, fontFamily: "inherit" }}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
                onFocus={e => e.target.style.borderColor = activeModuleData?.color}
                onBlur={e => e.target.style.borderColor = "#1E2A3A"}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ width: "46px", height: "46px", borderRadius: "12px", border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed", background: input.trim() && !loading ? `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)` : "#1E2A3A", color: "#fff", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {loading ? "…" : "↑"}
              </button>
            </div>
            <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#334155", marginTop: "8px" }}>REVOX · Powered by Claude · Biomedical Sales Intelligence · Tanzania</div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100dvh", background: "#0B0F1A", fontFamily: "'Inter', system-ui, sans-serif", color: "#E2E8F0", overflow: "hidden" }}>
      {!isMobile && <div style={{ width: "280px", minWidth: "280px", background: "#0F1422", borderRight: "1px solid #1E2A3A", display: "flex", flexDirection: "column" }}><SidebarContent /></div>}
      {isMobile && view === "sidebar" && <div style={{ width: "100%", background: "#0F1422", display: "flex", flexDirection: "column" }}><SidebarContent /></div>}
      {(!isMobile || view === "chat") && <ChatView />}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 2px; }
        textarea::placeholder, input::placeholder { color: #334155; }
        select option { background: #0F1422; color: #E2E8F0; }
        button:active { opacity: 0.8; }
      `}</style>
    </div>
  );
}