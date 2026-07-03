import { useState, useRef, useEffect } from "react";

const MODULES = [
  { id: "daily", label: "Daily Brief", icon: "☀️", color: "#00C2A8" },
  { id: "deals", label: "Deal Tracker", icon: "📊", color: "#4F8EF7" },
  { id: "clients", label: "Clients", icon: "🏥", color: "#A78BFA" },
  { id: "scaling", label: "Scaling Engine", icon: "🚀", color: "#F59E0B" },
  { id: "drafts", label: "Draft Assets", icon: "✍️", color: "#34D399" },
  { id: "reminders", label: "Reminders", icon: "🔔", color: "#F87171" },
];

const INITIAL_DEALS = [
  {
    id: 1,
    client: "Amana Regional Referral Hospital",
    equipment: "Portable Ultrasound System + 2x Patient Monitors",
    value: "TZS 45,000,000",
    valueUSD: "$18,000",
    stage: "Prospecting",
    stageColor: "#F59E0B",
    nextStep: "Send formal quotation and product spec sheet by end of week",
    issue: "Awaiting procurement officer's budget confirmation",
  },
  {
    id: 2,
    client: "Kilimanjaro Christian Medical Centre (KCMC)",
    equipment: "Surgical Table + Anesthesia Machine (bundle)",
    value: "TZS 95,000,000",
    valueUSD: "$38,000",
    stage: "Negotiation",
    stageColor: "#4F8EF7",
    nextStep: "Follow-up call scheduled Monday — counter discount request after supplier approval",
    issue: "Client requesting 10% discount; awaiting supplier margin approval",
  },
  {
    id: 3,
    client: "Dr. Amara Polyclinic (Mabibo)",
    equipment: "Laboratory Analyzer + Reagent Supply Contract",
    value: "TZS 22,000,000",
    valueUSD: "$8,800",
    stage: "Closing",
    stageColor: "#34D399",
    nextStep: "Collect signed LPO; confirm installation and training date",
    issue: "Waiting on signed LPO and payment clearance",
  },
];

const MODULE_PROMPTS = {
  daily: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative based in Tanzania targeting hospital administrators, biomedical engineers, and procurement officers.

Rev's current active deals:
1. Amana Regional Referral Hospital — Portable Ultrasound + 2x Patient Monitors — TZS 45M (~$18K) — PROSPECTING — Needs to send quotation and spec sheet this week. Awaiting budget confirmation from procurement officer.
2. KCMC (Kilimanjaro Christian Medical Centre) — Surgical Table + Anesthesia Machine bundle — TZS 95M (~$38K) — NEGOTIATION — Client wants 10% discount. Follow-up call Monday. Needs supplier margin approval first.
3. Dr. Amara Polyclinic (Mabibo) — Laboratory Analyzer + Reagent Supply Contract — TZS 22M (~$8.8K) — CLOSING — Verbal commitment received. Waiting on signed LPO and payment clearance.

Total pipeline value: TZS 162,000,000 (~$64,800)

Generate a structured DAILY BRIEF with these sections:
1. 🎯 TOP 3 PRIORITIES TODAY (ranked by revenue impact, with specific actions)
2. 📋 PIPELINE SNAPSHOT (status of all 3 deals with urgency flags)
3. 🔔 URGENT ALERTS (what cannot wait today)
4. 💡 ONE POWER MOVE (the single highest-leverage action right now)

Be specific. Use client names, amounts in TZS, and deadlines. Sharp executive tone.`,

  deals: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative in Tanzania.

Rev's current active deals:
1. Amana Regional Referral Hospital — Portable Ultrasound + 2x Patient Monitors — TZS 45M (~$18K) — PROSPECTING — Needs to send quotation and spec sheet this week. Awaiting budget confirmation from procurement officer.
2. KCMC (Kilimanjaro Christian Medical Centre) — Surgical Table + Anesthesia Machine bundle — TZS 95M (~$38K) — NEGOTIATION — Client wants 10% discount. Follow-up call Monday. Needs supplier margin approval first.
3. Dr. Amara Polyclinic (Mabibo) — Laboratory Analyzer + Reagent Supply Contract — TZS 22M (~$8.8K) — CLOSING — Verbal commitment received. Waiting on signed LPO and payment clearance.

Total pipeline: TZS 162,000,000 (~$64,800)

When asked about deals, provide:
- Specific next actions per deal
- Risk flags and what could kill each deal
- Negotiation tactics for KCMC discount request
- How to accelerate the Amara Polyclinic close
- Revenue forecasting based on close probability

Be direct, specific, and use the real deal data above.`,

  clients: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative in Tanzania.

Known clients:
1. Amana Regional Referral Hospital — Government referral hospital — Contact: Procurement Officer (name TBC) — Equipment interest: Diagnostic imaging and monitoring
2. KCMC (Kilimanjaro Christian Medical Centre) — Faith-based referral hospital — Active negotiation on surgical equipment bundle — Price-sensitive buyer
3. Dr. Amara Polyclinic (Mabibo) — Private clinic — Near-close deal — Lab analyzer + reagent contract — Decision maker is Dr. Amara directly

When asked about clients:
- Generate pre-call briefings with talking points
- Identify upsell opportunities per account
- Suggest relationship deepening strategies
- Flag risks per client type (government vs private vs faith-based)

Use healthcare procurement language. Connect everything to revenue.`,

  scaling: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative in Tanzania.

Current territory: Dar es Salaam and surrounding regions.
Current pipeline: TZS 162M across 3 deals (1 government hospital, 1 faith-based referral, 1 private clinic).

For scaling requests provide:
- Territory expansion opportunities in Tanzania (Dodoma, Arusha, Mwanza, Mbeya)
- New prospect identification by hospital tier and ownership type
- Government tender and MSD (Medical Stores Department) opportunities
- NGO and development partner funded procurement (WHO, USAID, GIZ)
- Revenue growth playbooks for Tanzanian healthcare market

Think like a VP of Sales for East African medical equipment. Be ambitious but realistic.`,

  drafts: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative in Tanzania.

When drafting assets use this context:
- Rep name: Rev
- Market: Tanzania, East Africa
- Clients: Government hospitals, faith-based hospitals, private clinics
- Current deals: Amana Hospital (ultrasound/monitors), KCMC (surgical bundle), Dr. Amara Polyclinic (lab analyzer)

Draft on demand:
- Formal quotation cover letters in professional English
- WhatsApp follow-up messages (short, professional)
- Cold outreach to new hospital procurement officers
- LinkedIn posts about biomedical equipment in East Africa
- Objection handling for price-sensitive Tanzanian buyers
- LPO follow-up messages

Keep tone professional but warm. Understand Tanzanian business culture.`,

  reminders: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative in Tanzania.

Current urgent tasks:
- Amana Hospital: Send quotation + spec sheet THIS WEEK
- KCMC: Follow-up call MONDAY — get supplier discount approval before then
- Dr. Amara Polyclinic: Chase signed LPO daily until received

Help manage:
- Weekly follow-up schedules tied to real deals above
- Contract and LPO follow-up sequences
- Daily priority checklists based on deal stages
- Time-blocking for field visits vs office work in Dar es Salaam

Be specific about days and times. Reference the real deals above.`,
};

const QUICK_ACTIONS = {
  daily: ["Generate my morning brief", "What's my highest priority today?", "Show pipeline health", "Flag overdue follow-ups"],
  deals: ["Analyze my 3 current deals", "How do I handle KCMC discount?", "How to close Dr. Amara faster?", "Forecast this month's revenue"],
  clients: ["Prep me for KCMC Monday call", "Find upsell for Amana Hospital", "Draft LPO follow-up for Dr. Amara", "Build client profile for Amana"],
  scaling: ["Where should I expand in Tanzania?", "Give me a 90-day growth plan", "Find NGO-funded hospital prospects", "How do I get into government tenders?"],
  drafts: ["Write quotation letter for Amana Hospital", "Draft WhatsApp follow-up for Dr. Amara", "Write KCMC counter-offer email", "Create LinkedIn post about my work"],
  reminders: ["Build my schedule for this week", "Set up LPO follow-up reminders", "Create Monday prep checklist for KCMC", "How should I time-block my week?"],
};

const STAGE_COLORS = {
  Prospecting: "#F59E0B",
  Negotiation: "#4F8EF7",
  Closing: "#34D399",
  Won: "#00C2A8",
  Lost: "#F87171",
};

export default function REVOXAgent() {
  const [activeModule, setActiveModule] = useState("daily");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("revox_messages");
    return saved ? JSON.parse(saved) : {};
  });
  const [deals, setDeals] = useState(() => {
    const saved = localStorage.getItem("revox_deals");
    return saved ? JSON.parse(saved) : INITIAL_DEALS;
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [kpiOpen, setKpiOpen] = useState(false);
  const [dealsOpen, setDealsOpen] = useState(true);
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [newDeal, setNewDeal] = useState({ client: "", equipment: "", value: "", valueUSD: "", stage: "Prospecting", nextStep: "", issue: "" });
  const messagesEndRef = useRef(null);

  const currentMessages = messages[activeModule] || [];

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, activeModule]);

  useEffect(() => {
    fetch("https://revox-proxy.onrender.com/calendar/today")
      .then(r => r.json())
      .then(data => { setCalendarConnected(data.connected); setCalendarEvents(data.events || []); })
      .catch(() => {});
  }, []);

  useEffect(() => { localStorage.setItem("revox_messages", JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem("revox_deals", JSON.stringify(deals)); }, [deals]);

  const totalPipeline = deals.reduce((sum, d) => {
    const num = parseInt(d.value.replace(/[^0-9]/g, "")) || 0;
    return sum + num;
  }, 0);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const userMsg = { role: "user", content: userText };
    const updatedMsgs = [...currentMessages, userMsg];
    setMessages((prev) => ({ ...prev, [activeModule]: updatedMsgs }));
    setLoading(true);
    try {
      const apiMessages = updatedMsgs.map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch("https://revox-proxy.onrender.com/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: MODULE_PROMPTS[activeModule], messages: apiMessages }),
      });
      const data = await response.json();
      const assistantText = data?.content?.[0]?.text || data?.error?.message || "No response received.";
      setMessages((prev) => ({ ...prev, [activeModule]: [...updatedMsgs, { role: "assistant", content: assistantText }] }));
    } catch {
      setMessages((prev) => ({ ...prev, [activeModule]: [...updatedMsgs, { role: "assistant", content: "Connection error. Please try again." }] }));
    } finally { setLoading(false); }
  };

  const handleKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const addDeal = () => {
    if (!newDeal.client || !newDeal.equipment) return;
    const deal = { ...newDeal, id: Date.now(), stageColor: STAGE_COLORS[newDeal.stage] || "#64748B" };
    setDeals(prev => [...prev, deal]);
    setNewDeal({ client: "", equipment: "", value: "", valueUSD: "", stage: "Prospecting", nextStep: "", issue: "" });
    setShowAddDeal(false);
  };

  const removeDeal = (id) => setDeals(prev => prev.filter(d => d.id !== id));

  const activeModuleData = MODULES.find((m) => m.id === activeModule);

  const formatMessage = (text) => text.split("\n").map((line, i) => {
    if (line.startsWith("# ") || line.startsWith("## ") || line.startsWith("### "))
      return <p key={i} style={{ fontWeight: 700, color: "#E2E8F0", fontSize: "0.95rem", marginTop: "12px", marginBottom: "4px" }}>{line.replace(/^#+\s/, "")}</p>;
    if (line.startsWith("- ") || line.startsWith("• "))
      return <p key={i} style={{ paddingLeft: "16px", color: "#CBD5E1", fontSize: "0.875rem", margin: "3px 0", lineHeight: 1.6 }}>{line}</p>;
    if (line.trim() === "") return <br key={i} />;
    return <p key={i} style={{ color: "#CBD5E1", fontSize: "0.875rem", margin: "3px 0", lineHeight: 1.7 }}>{line}</p>;
  });

  const inputStyle = {
    width: "100%", padding: "6px 8px", borderRadius: "6px",
    border: "1px solid #1E2A3A", background: "#0B0F1A",
    color: "#E2E8F0", fontSize: "0.75rem", outline: "none",
    fontFamily: "inherit", marginBottom: "6px",
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0B0F1A", fontFamily: "'Inter', system-ui, sans-serif", color: "#E2E8F0", overflow: "hidden" }}>

      {sidebarOpen && (
        <div style={{ width: "260px", minWidth: "260px", background: "#0F1422", borderRight: "1px solid #1E2A3A", display: "flex", flexDirection: "column", overflowY: "auto" }}>

          {/* Logo */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "linear-gradient(135deg, #00C2A8, #4F8EF7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>⚡</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "1rem", color: "#F1F5F9" }}>REVOX</div>
                <div style={{ fontSize: "0.65rem", color: "#64748B", letterSpacing: "1px", textTransform: "uppercase" }}>Business Agent</div>
              </div>
            </div>
          </div>

          {/* KPIs Collapsible */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
            <div onClick={() => setKpiOpen(!kpiOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
              <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase" }}>Live KPIs</div>
              <span style={{ fontSize: "0.7rem", color: "#475569" }}>{kpiOpen ? "▲" : "▼"}</span>
            </div>
            {kpiOpen && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748B" }}>Pipeline Value</span>
                    <span style={{ fontSize: "0.65rem", color: "#34D399" }}>3 active</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F1F5F9" }}>TZS {(totalPipeline / 1000000).toFixed(0)}M</div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.7rem", color: "#64748B" }}>Closing Soon</span>
                    <span style={{ fontSize: "0.65rem", color: "#34D399" }}>1 deal</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#F1F5F9" }}>Dr. Amara Polyclinic</div>
                </div>
              </div>
            )}
          </div>

          {/* Deals Panel */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
            <div onClick={() => setDealsOpen(!dealsOpen)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", marginBottom: dealsOpen ? "10px" : "0" }}>
              <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase" }}>Active Deals ({deals.length})</div>
              <span style={{ fontSize: "0.7rem", color: "#475569" }}>{dealsOpen ? "▲" : "▼"}</span>
            </div>
            {dealsOpen && (
              <>
                {deals.map((deal) => (
                  <div key={deal.id} style={{ marginBottom: "8px", padding: "8px", background: "#141C2E", borderRadius: "8px", borderLeft: `3px solid ${deal.stageColor}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#E2E8F0", lineHeight: 1.3, flex: 1 }}>{deal.client}</div>
                      <button onClick={() => removeDeal(deal.id)} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.65rem", padding: "0 0 0 4px" }}>✕</button>
                    </div>
                    <div style={{ fontSize: "0.65rem", color: "#64748B", marginTop: "2px" }}>{deal.equipment}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ fontSize: "0.65rem", color: deal.stageColor, fontWeight: 600 }}>{deal.stage}</span>
                      <span style={{ fontSize: "0.65rem", color: "#94A3B8" }}>{deal.value}</span>
                    </div>
                    {deal.nextStep && <div style={{ fontSize: "0.62rem", color: "#475569", marginTop: "4px", lineHeight: 1.4 }}>→ {deal.nextStep}</div>}
                  </div>
                ))}

                {/* Add Deal Form */}
                {showAddDeal ? (
                  <div style={{ background: "#141C2E", borderRadius: "8px", padding: "10px", border: "1px solid #1E2A3A" }}>
                    <input placeholder="Client name *" value={newDeal.client} onChange={e => setNewDeal(p => ({ ...p, client: e.target.value }))} style={inputStyle} />
                    <input placeholder="Equipment *" value={newDeal.equipment} onChange={e => setNewDeal(p => ({ ...p, equipment: e.target.value }))} style={inputStyle} />
                    <input placeholder="Value (e.g. TZS 20,000,000)" value={newDeal.value} onChange={e => setNewDeal(p => ({ ...p, value: e.target.value }))} style={inputStyle} />
                    <select value={newDeal.stage} onChange={e => setNewDeal(p => ({ ...p, stage: e.target.value }))} style={{ ...inputStyle, marginBottom: "6px" }}>
                      {Object.keys(STAGE_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input placeholder="Next step" value={newDeal.nextStep} onChange={e => setNewDeal(p => ({ ...p, nextStep: e.target.value }))} style={inputStyle} />
                    <input placeholder="Issues / blockers" value={newDeal.issue} onChange={e => setNewDeal(p => ({ ...p, issue: e.target.value }))} style={inputStyle} />
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={addDeal} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", background: "#00C2A8", color: "#fff", fontSize: "0.72rem", cursor: "pointer" }}>Add Deal</button>
                      <button onClick={() => setShowAddDeal(false)} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #1E2A3A", background: "transparent", color: "#64748B", fontSize: "0.72rem", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowAddDeal(true)} style={{ width: "100%", padding: "7px", borderRadius: "8px", border: "1px dashed #1E2A3A", background: "transparent", color: "#475569", fontSize: "0.72rem", cursor: "pointer", marginTop: "4px" }}>
                    + Add New Deal
                  </button>
                )}
              </>
            )}
          </div>

          {/* Calendar */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase" }}>Today's Schedule</div>
              {!calendarConnected && (
                <a href="https://revox-proxy.onrender.com/auth/google" target="_blank" rel="noreferrer"
                  style={{ fontSize: "0.6rem", color: "#00C2A8", textDecoration: "none", border: "1px solid #00C2A830", padding: "2px 6px", borderRadius: "4px" }}>
                  Connect
                </a>
              )}
            </div>
            {!calendarConnected && <div style={{ fontSize: "0.7rem", color: "#475569" }}>Connect Google Calendar above.</div>}
            {calendarConnected && calendarEvents.length === 0 && <div style={{ fontSize: "0.7rem", color: "#475569" }}>No meetings today 🎉</div>}
            {calendarEvents.map((event, i) => (
              <div key={i} style={{ marginBottom: "6px", padding: "6px 8px", background: "#141C2E", borderRadius: "6px", borderLeft: "2px solid #00C2A8" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#E2E8F0" }}>{event.title}</div>
                <div style={{ fontSize: "0.62rem", color: "#64748B" }}>{new Date(event.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            ))}
          </div>

          {/* Modules */}
          <div style={{ flex: 1, padding: "12px 10px" }}>
            <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px", paddingLeft: "6px" }}>Modules</div>
            {MODULES.map((mod) => (
              <button key={mod.id} onClick={() => setActiveModule(mod.id)} style={{
                display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "9px 12px", borderRadius: "8px",
                border: "none", cursor: "pointer", marginBottom: "2px",
                background: activeModule === mod.id ? `${mod.color}18` : "transparent",
                borderLeft: activeModule === mod.id ? `3px solid ${mod.color}` : "3px solid transparent",
                transition: "all 0.15s", textAlign: "left",
              }}>
                <span style={{ fontSize: "1rem" }}>{mod.icon}</span>
                <span style={{ fontSize: "0.82rem", fontWeight: activeModule === mod.id ? 600 : 400, color: activeModule === mod.id ? "#F1F5F9" : "#64748B" }}>{mod.label}</span>
                {messages[mod.id]?.length > 0 && <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: mod.color }} />}
              </button>
            ))}
          </div>

          {/* Clear + User */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ padding: "10px 16px", borderTop: "1px solid #1E2A3A" }}>
              <button onClick={() => { localStorage.removeItem("revox_messages"); setMessages({}); }} style={{
                width: "100%", padding: "7px", borderRadius: "8px", border: "1px solid #1E2A3A",
                background: "transparent", color: "#475569", fontSize: "0.72rem", cursor: "pointer",
              }}>🗑️ Clear History</button>
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid #1E2A3A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "linear-gradient(135deg, #4F8EF7, #A78BFA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>R</div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E2E8F0" }}>Rev</div>
                  <div style={{ fontSize: "0.65rem", color: "#475569" }}>Biomedical Sales Rep · Tanzania</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #1E2A3A", display: "flex", alignItems: "center", gap: "12px", background: "#0B0F1A", flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "1.2rem", padding: "4px" }}>☰</button>
          <span style={{ fontSize: "1.2rem" }}>{activeModuleData?.icon}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#F1F5F9" }}>{activeModuleData?.label}</div>
            <div style={{ fontSize: "0.7rem", color: "#475569" }}>REVOX · Biomedical Sales Intelligence · Tanzania</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 6px #34D399" }} />
            <span style={{ fontSize: "0.72rem", color: "#34D399" }}>Agent Online</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {currentMessages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "28px" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>{activeModuleData?.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "1.2rem", color: "#F1F5F9", marginBottom: "6px" }}>{activeModuleData?.label}</div>
                <div style={{ color: "#475569", fontSize: "0.85rem", maxWidth: "340px" }}>
                  Ask REVOX anything about your {activeModuleData?.label.toLowerCase()} — or pick a quick action below.
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", maxWidth: "520px" }}>
                {(QUICK_ACTIONS[activeModule] || []).map((action, i) => (
                  <button key={i} onClick={() => sendMessage(action)} style={{
                    padding: "12px 14px", borderRadius: "10px", border: `1px solid ${activeModuleData?.color}30`,
                    background: `${activeModuleData?.color}08`, color: "#CBD5E1", fontSize: "0.78rem",
                    cursor: "pointer", textAlign: "left", lineHeight: 1.4, transition: "all 0.15s",
                  }}>
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentMessages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "assistant" && (
                <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", marginRight: "10px", flexShrink: 0, marginTop: "2px" }}>⚡</div>
              )}
              <div style={{
                maxWidth: "72%", padding: "12px 16px",
                borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: msg.role === "user" ? `linear-gradient(135deg, ${activeModuleData?.color}CC, #4F8EF7CC)` : "#141C2E",
                border: msg.role === "assistant" ? "1px solid #1E2A3A" : "none",
              }}>
                {msg.role === "user"
                  ? <p style={{ margin: 0, fontSize: "0.875rem", color: "#fff", lineHeight: 1.6 }}>{msg.content}</p>
                  : <div>{formatMessage(msg.content)}</div>}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>⚡</div>
              <div style={{ padding: "12px 16px", background: "#141C2E", borderRadius: "16px 16px 16px 4px", border: "1px solid #1E2A3A", display: "flex", gap: "5px", alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ width: "6px", height: "6px", borderRadius: "50%", background: activeModuleData?.color, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #1E2A3A", background: "#0B0F1A", flexShrink: 0 }}>
          {currentMessages.length > 0 && (
            <div style={{ display: "flex", gap: "8px", marginBottom: "10px", flexWrap: "wrap" }}>
              {(QUICK_ACTIONS[activeModule] || []).slice(0, 3).map((action, i) => (
                <button key={i} onClick={() => sendMessage(action)} style={{
                  padding: "5px 11px", borderRadius: "20px", border: "1px solid #1E2A3A",
                  background: "#141C2E", color: "#64748B", fontSize: "0.72rem", cursor: "pointer",
                }}>
                  {action}
                </button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
            <textarea
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder={`Ask REVOX about ${activeModuleData?.label.toLowerCase()}…`} rows={1}
              style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #1E2A3A", background: "#141C2E", color: "#E2E8F0", fontSize: "0.875rem", resize: "none", outline: "none", lineHeight: 1.6, fontFamily: "inherit" }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onFocus={e => e.target.style.borderColor = activeModuleData?.color}
              onBlur={e => e.target.style.borderColor = "#1E2A3A"}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
              width: "42px", height: "42px", borderRadius: "10px", border: "none",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              background: input.trim() && !loading ? `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)` : "#1E2A3A",
              color: "#fff", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              {loading ? "…" : "↑"}
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#334155", marginTop: "8px" }}>
            REVOX · Powered by Claude · Biomedical Sales Intelligence · Tanzania
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1E2A3A; border-radius: 2px; }
        textarea::placeholder { color: #334155; }
        input::placeholder { color: #334155; }
        select option { background: #0F1422; }
      `}</style>
    </div>
  );
}