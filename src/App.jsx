import { useState, useRef, useEffect } from "react";

const MODULES = [
  { id: "daily", label: "Daily Brief", icon: "☀️", color: "#00C2A8" },
  { id: "deals", label: "Deal Tracker", icon: "📊", color: "#4F8EF7" },
  { id: "clients", label: "Clients", icon: "🏥", color: "#A78BFA" },
  { id: "contacts", label: "Contacts", icon: "👥", color: "#EC4899" },
  { id: "scaling", label: "Scaling Engine", icon: "🚀", color: "#F59E0B" },
  { id: "drafts", label: "Draft Assets", icon: "✍️", color: "#34D399" },
  { id: "reminders", label: "Reminders", icon: "🔔", color: "#F87171" },
];

const INITIAL_DEALS = [
  { id: 1, client: "Amana Regional Referral Hospital", equipment: "Portable Ultrasound System + 2x Patient Monitors", value: "TZS 45,000,000", valueUSD: "$18,000", stage: "Prospecting", stageColor: "#F59E0B", nextStep: "Send formal quotation and product spec sheet by end of week", issue: "Awaiting procurement officer's budget confirmation" },
  { id: 2, client: "Kilimanjaro Christian Medical Centre (KCMC)", equipment: "Surgical Table + Anesthesia Machine (bundle)", value: "TZS 95,000,000", valueUSD: "$38,000", stage: "Negotiation", stageColor: "#4F8EF7", nextStep: "Follow-up call scheduled Monday — counter discount request after supplier approval", issue: "Client requesting 10% discount; awaiting supplier margin approval" },
  { id: 3, client: "Dr. Amara Polyclinic (Mabibo)", equipment: "Laboratory Analyzer + Reagent Supply Contract", value: "TZS 22,000,000", valueUSD: "$8,800", stage: "Closing", stageColor: "#34D399", nextStep: "Collect signed LPO; confirm installation and training date", issue: "Waiting on signed LPO and payment clearance" },
];

const INITIAL_CONTACTS = [
  { id: 1, name: "Dr. Amara", hospital: "Dr. Amara Polyclinic (Mabibo)", role: "Director / Decision Maker", phone: "", email: "", lastContacted: "2026-07-03", dealId: 3, notes: "Verbal commitment received. Waiting on LPO signature." },
  { id: 2, name: "Procurement Officer", hospital: "Amana Regional Referral Hospital", role: "Procurement Officer", phone: "", email: "", lastContacted: "", dealId: 1, notes: "Initial inquiry via WhatsApp. Budget confirmation pending." },
  { id: 3, name: "Procurement Team", hospital: "KCMC", role: "Procurement Team", phone: "", email: "", lastContacted: "2026-07-01", dealId: 2, notes: "Requesting 10% discount. Follow-up call Monday." },
];

const MODULE_PROMPTS = {
  daily: `You are REVOX, an elite AI Chief of Staff for Rev, a Biomedical Equipment Sales Representative based in Tanzania.

Rev's current active deals:
1. Amana Regional Referral Hospital — Portable Ultrasound + 2x Patient Monitors — TZS 45M (~$18K) — PROSPECTING — Needs to send quotation and spec sheet this week.
2. KCMC — Surgical Table + Anesthesia Machine bundle — TZS 95M (~$38K) — NEGOTIATION — Client wants 10% discount. Follow-up call Monday.
3. Dr. Amara Polyclinic (Mabibo) — Laboratory Analyzer + Reagent Supply Contract — TZS 22M — CLOSING — Waiting on signed LPO.

Total pipeline: TZS 162,000,000

Generate a DAILY BRIEF:
1. 🎯 TOP 3 PRIORITIES TODAY
2. 📋 PIPELINE SNAPSHOT
3. 🔔 URGENT ALERTS
4. 💡 ONE POWER MOVE

Be specific. Use client names and TZS amounts. Sharp tone.`,

  deals: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Active deals:
1. Amana Hospital — Ultrasound + Monitors — TZS 45M — PROSPECTING
2. KCMC — Surgical Table + Anesthesia Machine — TZS 95M — NEGOTIATION (10% discount request)
3. Dr. Amara Polyclinic — Lab Analyzer + Reagents — TZS 22M — CLOSING (waiting LPO)

Provide deal analysis, risk flags, negotiation tactics, close strategies. Be direct and specific.`,

  clients: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Clients:
1. Amana Regional Referral Hospital — Government — Procurement officer contact pending
2. KCMC — Faith-based referral hospital — Price-sensitive, active negotiation
3. Dr. Amara Polyclinic (Mabibo) — Private clinic — Decision maker is Dr. Amara directly

Provide pre-call briefings, upsell opportunities, relationship strategies. Use healthcare procurement language.`,

  contacts: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Help Rev manage client communications:

Known contacts:
1. Dr. Amara — Director, Dr. Amara Polyclinic — Deal: Lab Analyzer TZS 22M — CLOSING — Needs LPO signed
2. Procurement Officer — Amana Hospital — Deal: Ultrasound TZS 45M — PROSPECTING — Needs quotation
3. Procurement Team — KCMC — Deal: Surgical Bundle TZS 95M — NEGOTIATION — Discount discussion

When asked, generate:
- WhatsApp messages (short, professional, warm — Tanzanian business culture)
- Follow-up sequences (Day 1, Day 3, Day 7)
- LPO reminder messages
- Quotation follow-up messages
- Payment reminder messages
- Deal closing messages

Always address client by name. Keep messages under 150 words. Professional but friendly tone.`,

  scaling: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Current territory: Dar es Salaam. Pipeline: TZS 162M across 3 deals.

Provide territory expansion plans for Tanzania, NGO-funded procurement opportunities, government tender strategies, 30/60/90 day growth playbooks.`,

  drafts: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Draft professional assets: quotation letters, WhatsApp follow-ups, cold outreach, LinkedIn posts, LPO follow-ups, counter-offer emails. Understand Tanzanian business culture. Professional but warm tone.`,

  reminders: `You are REVOX, AI Chief of Staff for Rev, Biomedical Equipment Sales Rep in Tanzania.

Urgent tasks:
- Amana Hospital: Send quotation + spec sheet THIS WEEK
- KCMC: Follow-up call MONDAY — get supplier discount approval first
- Dr. Amara: Chase signed LPO daily

Build weekly schedules, follow-up sequences, daily checklists. Reference real deals above.`,
};

const QUICK_ACTIONS = {
  daily: ["Generate my morning brief", "What's my highest priority today?", "Show pipeline health", "Flag overdue follow-ups"],
  deals: ["Analyze my 3 current deals", "How do I handle KCMC discount?", "How to close Dr. Amara faster?", "Forecast this month's revenue"],
  clients: ["Prep me for KCMC Monday call", "Find upsell for Amana Hospital", "Draft LPO follow-up for Dr. Amara", "Build Amana client profile"],
  contacts: ["Draft WhatsApp for Dr. Amara LPO", "Write KCMC follow-up message", "Send quotation reminder to Amana", "Create 7-day follow-up sequence for Dr. Amara"],
  scaling: ["Where should I expand in Tanzania?", "Give me a 90-day growth plan", "Find NGO-funded prospects", "How do I get into government tenders?"],
  drafts: ["Write quotation letter for Amana", "Draft WhatsApp follow-up for Dr. Amara", "Write KCMC counter-offer email", "Create LinkedIn post"],
  reminders: ["Build my schedule for this week", "Set up LPO follow-up reminders", "Create Monday prep checklist for KCMC", "How should I time-block my week?"],
};

const STAGE_COLORS = { Prospecting: "#F59E0B", Negotiation: "#4F8EF7", Closing: "#34D399", Won: "#00C2A8", Lost: "#F87171" };
const ROLES = ["Procurement Officer", "Biomedical Engineer", "Director / Decision Maker", "Hospital Administrator", "Finance Officer", "Other"];

export default function REVOXAgent() {
  const [activeModule, setActiveModule] = useState("daily");
  const [messages, setMessages] = useState(() => { try { const s = localStorage.getItem("revox_messages"); return s ? JSON.parse(s) : {}; } catch { return {}; } });
  const [deals, setDeals] = useState(() => { try { const s = localStorage.getItem("revox_deals"); return s ? JSON.parse(s) : INITIAL_DEALS; } catch { return INITIAL_DEALS; } });
  const [contacts, setContacts] = useState(() => { try { const s = localStorage.getItem("revox_contacts"); return s ? JSON.parse(s) : INITIAL_CONTACTS; } catch { return INITIAL_CONTACTS; } });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("chat");
  const [showAddDeal, setShowAddDeal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [contactSearch, setContactSearch] = useState("");
  const [editingContact, setEditingContact] = useState(null);
  const [newDeal, setNewDeal] = useState({ client: "", equipment: "", value: "", stage: "Prospecting", nextStep: "", issue: "" });
  const [newContact, setNewContact] = useState({ name: "", hospital: "", role: "Procurement Officer", phone: "", email: "", notes: "", dealId: "" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [sidebarTab, setSidebarTab] = useState("deals"); // "deals" | "contacts"
  const messagesEndRef = useRef(null);

  const currentMessages = messages[activeModule] || [];
  const activeModuleData = MODULES.find((m) => m.id === activeModule);

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
    setDeals(prev => [...prev, { ...newDeal, id: Date.now(), stageColor: STAGE_COLORS[newDeal.stage] || "#64748B" }]);
    setNewDeal({ client: "", equipment: "", value: "", stage: "Prospecting", nextStep: "", issue: "" });
    setShowAddDeal(false);
  };

  const addContact = () => {
    if (!newContact.name || !newContact.hospital) return;
    if (editingContact) {
      setContacts(prev => prev.map(c => c.id === editingContact ? { ...newContact, id: editingContact, lastContacted: new Date().toISOString().split("T")[0] } : c));
      setEditingContact(null);
    } else {
      setContacts(prev => [...prev, { ...newContact, id: Date.now(), lastContacted: new Date().toISOString().split("T")[0] }]);
    }
    setNewContact({ name: "", hospital: "", role: "Procurement Officer", phone: "", email: "", notes: "", dealId: "" });
    setShowAddContact(false);
  };

  const editContact = (contact) => {
    setNewContact({ name: contact.name, hospital: contact.hospital, role: contact.role, phone: contact.phone || "", email: contact.email || "", notes: contact.notes || "", dealId: contact.dealId || "" });
    setEditingContact(contact.id);
    setShowAddContact(true);
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Dear ${name}, `);
    const url = phone ? `https://wa.me/${phone.replace(/\D/g, "")}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, "_blank");
  };

  const draftWhatsApp = (contact) => {
    const deal = deals.find(d => d.id === contact.dealId);
    const prompt = `Draft a short professional WhatsApp follow-up message for ${contact.name} at ${contact.hospital}. ${deal ? `They have a ${deal.stage} deal for ${deal.equipment} worth ${deal.value}. Next step: ${deal.nextStep}` : ""}. Keep it under 100 words, warm and professional.`;
    setActiveModule("contacts");
    if (isMobile) setView("chat");
    sendMessage(prompt);
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.hospital.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.role.toLowerCase().includes(contactSearch.toLowerCase())
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

  const SidebarContent = () => (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>

      {/* Logo */}
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

      {/* Pipeline Summary */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          <div style={{ background: "#141C2E", borderRadius: "8px", padding: "8px" }}>
            <div style={{ fontSize: "0.62rem", color: "#64748B" }}>Pipeline</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F1F5F9" }}>TZS 162M</div>
          </div>
          <div style={{ background: "#141C2E", borderRadius: "8px", padding: "8px" }}>
            <div style={{ fontSize: "0.62rem", color: "#64748B" }}>Contacts</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#EC4899" }}>{contacts.length} saved</div>
          </div>
        </div>
      </div>

      {/* Tab Switch: Deals / Contacts */}
      <div style={{ display: "flex", padding: "10px 16px", gap: "8px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
        <button onClick={() => setSidebarTab("deals")} style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", cursor: "pointer", background: sidebarTab === "deals" ? "#4F8EF7" : "#141C2E", color: sidebarTab === "deals" ? "#fff" : "#64748B", fontSize: "0.75rem", fontWeight: 600 }}>📊 Deals</button>
        <button onClick={() => setSidebarTab("contacts")} style={{ flex: 1, padding: "7px", borderRadius: "8px", border: "none", cursor: "pointer", background: sidebarTab === "contacts" ? "#EC4899" : "#141C2E", color: sidebarTab === "contacts" ? "#fff" : "#64748B", fontSize: "0.75rem", fontWeight: 600 }}>👥 Contacts</button>
      </div>

      {/* DEALS TAB */}
      {sidebarTab === "deals" && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
          {deals.map((deal) => (
            <div key={deal.id} style={{ marginBottom: "8px", padding: "10px", background: "#141C2E", borderRadius: "10px", borderLeft: `3px solid ${deal.stageColor}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E2E8F0", flex: 1, lineHeight: 1.3 }}>{deal.client}</div>
                <button onClick={() => setDeals(p => p.filter(d => d.id !== deal.id))} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: "0.7rem", padding: "0 0 0 6px" }}>✕</button>
              </div>
              <div style={{ fontSize: "0.68rem", color: "#64748B", marginTop: "3px" }}>{deal.equipment}</div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                <span style={{ fontSize: "0.68rem", color: deal.stageColor, fontWeight: 600, background: `${deal.stageColor}18`, padding: "2px 6px", borderRadius: "4px" }}>{deal.stage}</span>
                <span style={{ fontSize: "0.68rem", color: "#94A3B8" }}>{deal.value}</span>
              </div>
              {deal.nextStep && <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "6px", lineHeight: 1.4, borderTop: "1px solid #1E2A3A", paddingTop: "6px" }}>→ {deal.nextStep}</div>}
            </div>
          ))}
          {showAddDeal ? (
            <div style={{ background: "#141C2E", borderRadius: "10px", padding: "12px", border: "1px solid #1E2A3A" }}>
              <input placeholder="Client name *" value={newDeal.client} onChange={e => setNewDeal(p => ({ ...p, client: e.target.value }))} style={inputStyle} />
              <input placeholder="Equipment *" value={newDeal.equipment} onChange={e => setNewDeal(p => ({ ...p, equipment: e.target.value }))} style={inputStyle} />
              <input placeholder="Value (e.g. TZS 20,000,000)" value={newDeal.value} onChange={e => setNewDeal(p => ({ ...p, value: e.target.value }))} style={inputStyle} />
              <select value={newDeal.stage} onChange={e => setNewDeal(p => ({ ...p, stage: e.target.value }))} style={{ ...inputStyle }}>
                {Object.keys(STAGE_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <input placeholder="Next step" value={newDeal.nextStep} onChange={e => setNewDeal(p => ({ ...p, nextStep: e.target.value }))} style={inputStyle} />
              <input placeholder="Issues / blockers" value={newDeal.issue} onChange={e => setNewDeal(p => ({ ...p, issue: e.target.value }))} style={{ ...inputStyle, marginBottom: "10px" }} />
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

      {/* CONTACTS TAB */}
      {sidebarTab === "contacts" && (
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
          {/* Search */}
          <input
            placeholder="🔍 Search contacts..."
            value={contactSearch}
            onChange={e => setContactSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: "10px" }}
          />

          {/* Contact Cards */}
          {filteredContacts.map((contact) => (
            <div key={contact.id} style={{ marginBottom: "8px", padding: "10px", background: "#141C2E", borderRadius: "10px", borderLeft: "3px solid #EC4899" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#E2E8F0" }}>{contact.name}</div>
                  <div style={{ fontSize: "0.65rem", color: "#EC4899", marginTop: "2px" }}>{contact.role}</div>
                  <div style={{ fontSize: "0.65rem", color: "#64748B", marginTop: "1px" }}>{contact.hospital}</div>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  <button onClick={() => editContact(contact)} style={{ background: "#1E2A3A", border: "none", color: "#94A3B8", cursor: "pointer", borderRadius: "6px", padding: "4px 6px", fontSize: "0.65rem" }}>✏️</button>
                  <button onClick={() => setContacts(p => p.filter(c => c.id !== contact.id))} style={{ background: "#1E2A3A", border: "none", color: "#94A3B8", cursor: "pointer", borderRadius: "6px", padding: "4px 6px", fontSize: "0.65rem" }}>✕</button>
                </div>
              </div>

              {contact.phone && <div style={{ fontSize: "0.65rem", color: "#64748B", marginTop: "4px" }}>📱 {contact.phone}</div>}
              {contact.lastContacted && <div style={{ fontSize: "0.62rem", color: "#475569", marginTop: "2px" }}>Last contact: {contact.lastContacted}</div>}
              {contact.notes && <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "4px", borderTop: "1px solid #1E2A3A", paddingTop: "4px", lineHeight: 1.4 }}>{contact.notes}</div>}

              {/* Action buttons */}
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <button onClick={() => openWhatsApp(contact.phone, contact.name)} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "none", background: "#25D366", color: "#fff", fontSize: "0.68rem", cursor: "pointer", fontWeight: 600 }}>💬 WhatsApp</button>
                <button onClick={() => draftWhatsApp(contact)} style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #EC4899", background: "transparent", color: "#EC4899", fontSize: "0.68rem", cursor: "pointer" }}>✍️ Draft</button>
              </div>
            </div>
          ))}

          {/* Add Contact Form */}
          {showAddContact ? (
            <div style={{ background: "#141C2E", borderRadius: "10px", padding: "12px", border: "1px solid #EC4899", marginTop: "8px" }}>
              <div style={{ fontSize: "0.72rem", color: "#EC4899", fontWeight: 600, marginBottom: "10px" }}>{editingContact ? "Edit Contact" : "New Contact"}</div>
              <input placeholder="Full name *" value={newContact.name} onChange={e => setNewContact(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              <input placeholder="Hospital / Clinic *" value={newContact.hospital} onChange={e => setNewContact(p => ({ ...p, hospital: e.target.value }))} style={inputStyle} />
              <select value={newContact.role} onChange={e => setNewContact(p => ({ ...p, role: e.target.value }))} style={{ ...inputStyle }}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input placeholder="WhatsApp number (e.g. 255712345678)" value={newContact.phone} onChange={e => setNewContact(p => ({ ...p, phone: e.target.value }))} style={inputStyle} />
              <input placeholder="Email address" value={newContact.email} onChange={e => setNewContact(p => ({ ...p, email: e.target.value }))} style={inputStyle} />
              <select value={newContact.dealId} onChange={e => setNewContact(p => ({ ...p, dealId: parseInt(e.target.value) }))} style={{ ...inputStyle }}>
                <option value="">Link to deal (optional)</option>
                {deals.map(d => <option key={d.id} value={d.id}>{d.client}</option>)}
              </select>
              <textarea placeholder="Notes about this contact..." value={newContact.notes} onChange={e => setNewContact(p => ({ ...p, notes: e.target.value }))} style={{ ...inputStyle, resize: "none", height: "60px", marginBottom: "10px" }} />
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={addContact} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "none", background: "#EC4899", color: "#fff", fontSize: "0.78rem", cursor: "pointer", fontWeight: 600 }}>{editingContact ? "Save Changes" : "Add Contact"}</button>
                <button onClick={() => { setShowAddContact(false); setEditingContact(null); setNewContact({ name: "", hospital: "", role: "Procurement Officer", phone: "", email: "", notes: "", dealId: "" }); }} style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #1E2A3A", background: "transparent", color: "#64748B", fontSize: "0.78rem", cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowAddContact(true)} style={{ width: "100%", padding: "9px", borderRadius: "10px", border: "1px dashed #EC4899", background: "transparent", color: "#EC4899", fontSize: "0.75rem", cursor: "pointer", marginTop: "8px" }}>+ Add New Contact</button>
          )}
        </div>
      )}

      {/* Calendar */}
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2A3A", flexShrink: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "1.5px", textTransform: "uppercase" }}>Today's Schedule</div>
          {!calendarConnected && (
            <a href="https://revox-proxy.onrender.com/auth/google" target="_blank" rel="noreferrer"
              style={{ fontSize: "0.6rem", color: "#00C2A8", textDecoration: "none", border: "1px solid #00C2A830", padding: "3px 8px", borderRadius: "4px" }}>
              Connect
            </a>
          )}
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

      {/* Modules */}
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
            {messages[mod.id]?.length > 0 && <span style={{ marginLeft: "auto", width: "7px", height: "7px", borderRadius: "50%", background: mod.color }} />}
          </button>
        ))}
      </div>

      {/* Footer */}
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
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 5px #34D399" }} />
          <span style={{ fontSize: "0.68rem", color: "#34D399" }}>Live</span>
        </div>
      </div>

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
                <button key={i} onClick={() => sendMessage(action)} style={{
                  padding: "13px 16px", borderRadius: "12px", border: `1px solid ${activeModuleData?.color}30`,
                  background: `${activeModuleData?.color}08`, color: "#CBD5E1", fontSize: "0.82rem",
                  cursor: "pointer", textAlign: "left", lineHeight: 1.4,
                }}>{action}</button>
              ))}
            </div>
          </div>
        )}

        {currentMessages.map((msg, i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start", gap: "8px" }}>
            {msg.role === "assistant" && (
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>⚡</div>
            )}
            <div style={{
              maxWidth: isMobile ? "85%" : "72%", padding: "12px 14px",
              borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
              background: msg.role === "user" ? `linear-gradient(135deg, ${activeModuleData?.color}DD, #4F8EF7DD)` : "#141C2E",
              border: msg.role === "assistant" ? "1px solid #1E2A3A" : "none",
            }}>
              {msg.role === "user"
                ? <p style={{ margin: 0, fontSize: "0.875rem", color: "#fff", lineHeight: 1.6 }}>{msg.content}</p>
                : <div>{formatMessage(msg.content)}</div>}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px" }}>⚡</div>
            <div style={{ padding: "12px 16px", background: "#141C2E", borderRadius: "16px 16px 16px 4px", border: "1px solid #1E2A3A", display: "flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: "7px", height: "7px", borderRadius: "50%", background: activeModuleData?.color, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {isMobile && currentMessages.length > 0 && (
        <div style={{ display: "flex", gap: "6px", padding: "8px 12px 0", overflowX: "auto" }}>
          {(QUICK_ACTIONS[activeModule] || []).slice(0, 3).map((action, i) => (
            <button key={i} onClick={() => sendMessage(action)} style={{
              padding: "6px 12px", borderRadius: "20px", border: "1px solid #1E2A3A",
              background: "#141C2E", color: "#64748B", fontSize: "0.7rem", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            }}>{action}</button>
          ))}
        </div>
      )}

      <div style={{ padding: isMobile ? "10px 12px 16px" : "16px 24px", borderTop: "1px solid #1E2A3A", background: "#0B0F1A", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <textarea
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={`Ask REVOX…`} rows={1}
            style={{ flex: 1, padding: "12px 14px", borderRadius: "14px", border: "1px solid #1E2A3A", background: "#141C2E", color: "#E2E8F0", fontSize: "0.9rem", resize: "none", outline: "none", lineHeight: 1.5, fontFamily: "inherit" }}
            onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }}
            onFocus={e => e.target.style.borderColor = activeModuleData?.color}
            onBlur={e => e.target.style.borderColor = "#1E2A3A"}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{
            width: "46px", height: "46px", borderRadius: "12px", border: "none",
            cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            background: input.trim() && !loading ? `linear-gradient(135deg, ${activeModuleData?.color}, #4F8EF7)` : "#1E2A3A",
            color: "#fff", fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            {loading ? "…" : "↑"}
          </button>
        </div>
        <div style={{ textAlign: "center", fontSize: "0.65rem", color: "#334155", marginTop: "8px" }}>
          REVOX · Powered by Claude · Biomedical Sales Intelligence · Tanzania
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100dvh", background: "#0B0F1A", fontFamily: "'Inter', system-ui, sans-serif", color: "#E2E8F0", overflow: "hidden" }}>
      {!isMobile && (
        <div style={{ width: "280px", minWidth: "280px", background: "#0F1422", borderRight: "1px solid #1E2A3A", display: "flex", flexDirection: "column" }}>
          <SidebarContent />
        </div>
      )}
      {isMobile && view === "sidebar" && (
        <div style={{ width: "100%", background: "#0F1422", display: "flex", flexDirection: "column" }}>
          <SidebarContent />
        </div>
      )}
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