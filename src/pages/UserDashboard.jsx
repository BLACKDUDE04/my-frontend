import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { io } from "socket.io-client";

/* ─── SHOP SETTINGS MODAL ─────────────────────────────────── */
function ShopSettings({ shop, setShop, onClose }) {
  const [localShop, setLocalShop] = useState(shop);
  const [saving, setSaving] = useState(false);
  const handleApply = async () => {
    setSaving(true);
    try {
      const res = await api.put("/shop", localShop);
      setShop(res.data.shop);
      alert(res.data.message);
      onClose();
    } catch {
      alert("Failed to update shop");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="modal-overlay">
      <div className="modal-panel settings-modal animate-modal">
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-wrap"><SettingsIcon /></div>
            <h3>Business Configuration</h3>
          </div>
          <button className="icon-close-btn" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <div className="settings-form-grid">
            <div className="field-group">
              <label className="field-label">Business Name</label>
              <input type="text" className="field-input" placeholder="e.g., Manufacturing Hardware Hub"
                value={localShop.name} onChange={e => setLocalShop({ ...localShop, name: e.target.value })} />
            </div>
            <div className="field-group">
              <label className="field-label">Business Address</label>
              <input type="text" className="field-input" placeholder="Shop Address"
                value={localShop.address} onChange={e => setLocalShop({ ...localShop, address: e.target.value })} />
            </div>
            <div className="field-group full-width">
              <label className="field-label">Business Logo</label>
              <div className="logo-upload-area">
                <div className="logo-preview-box">
                  {localShop.logo
                    ? <img src={localShop.logo} alt="Preview" />
                    : <div className="logo-placeholder"><span className="logo-ph-icon">🏪</span><p>No Logo</p></div>}
                </div>
                <label className="upload-btn-label">
                  <input type="file" accept="image/*" style={{ display: "none" }}
                    onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setLocalShop({ ...localShop, logo: reader.result });
                      reader.readAsDataURL(file);
                    }} />
                  Upload Logo
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn-primary ${saving ? "loading" : ""}`} onClick={handleApply} disabled={saving}>
            {saving ? "Saving…" : "Apply Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── SVG ICONS ────────────────────────────────────────────── */
const DashIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const WalletIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16v4"/><path d="M20 12a2 2 0 0 0-2-2H6"/>
    <circle cx="18" cy="12" r="2"/>
  </svg>
);
const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const FilterIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);
const SunIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const TrendUpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const TrendDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
);
const ProfitIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);
const ClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);
const EyeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const ResetIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.75"/>
  </svg>
);

/* ─── STAT CARD ────────────────────────────────────────────── */
function StatCard({ label, value, icon, color, bgColor, delay }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const steps = 40; let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplayed(Math.round((value / steps) * step));
      if (step >= steps) clearInterval(interval);
    }, 18);
    return () => clearInterval(interval);
  }, [value]);
  return (
    <div className="stat-card" style={{ "--delay": delay, "--accent": color, "--accent-bg": bgColor }}>
      <div className="stat-card-header">
        <div className="stat-icon-wrap">{icon}</div>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value">₹{displayed.toLocaleString("en-IN")}</div>
      <div className="stat-bar" />
    </div>
  );
}

/* ─── THEME TOGGLE ─────────────────────────────────────────── */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title={dark ? "Light mode" : "Dark mode"}>
      <span className={`theme-pill ${dark ? "night" : "day"}`}>
        {dark ? <MoonIcon /> : <SunIcon />}
      </span>
    </button>
  );
}

/* ─── MAIN DASHBOARD ───────────────────────────────────────── */
export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: "Loading…", role: "Loading…" });
  const [ads, setAds] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [showBilling, setShowBilling] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState([{ name: "", quantity: "", unit: "", price: "", value: 0 }]);
  const [type, setType] = useState("Bill");
  const [freight, setFreight] = useState(0);
  const [payment, setPayment] = useState(0);
  const billRef = useRef();
  const [inventory, setInventory] = useState([]);
  const [showAddStock, setShowAddStock] = useState(false);
  const [newStock, setNewStock] = useState({ name: "", quantity: "", unit: "pcs", price: "" });
  const [editingStock, setEditingStock] = useState(null);
  const [shop, setShop] = useState({ name: "Hardware Firm", address: "Main Industrial Estate", logo: null });
  const [showShopSettings, setShowShopSettings] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", category: "General" });
  const [billSearch, setBillSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [agingFilter, setAgingFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const socketRef = useRef(null);

  const fetchShop = async () => {
    try { const res = await api.get("/shop"); setShop(prev => ({ ...prev, ...res.data })); }
    catch (err) { console.error("Failed to fetch shop", err); }
  };
  const fetchExpenses = async () => {
    try { const res = await api.get("/expenses"); setExpenses(res.data); }
    catch (err) { console.error("Error fetching expenses:", err); }
  };
  const fetchCurrentUser = async () => {
    try { const res = await api.get("/auth/user"); setCurrentUser(res.data); }
    catch { setCurrentUser({ name: "Guest", role: "Unknown" }); }
  };
  const fetchAds = () => api.get("/ads").then(r => setAds(r.data)).catch(console.error);
  const fetchRecentBills = () => api.get("/billing/my-bills").then(r => setRecentBills(r.data)).catch(console.error);
  const fetchInventory = () => api.get("/inventory").then(r => setInventory(r.data)).catch(console.error);

  useEffect(() => {
    fetchShop(); fetchAds(); fetchRecentBills(); fetchInventory(); fetchCurrentUser(); fetchExpenses();
    if (window.innerWidth <= 900) setSidebarOpen(false);
    socketRef.current = io("https://multibill.netlify.app");
    const s = socketRef.current;
    s.on("adsUpdated", fetchAds); s.on("usersUpdated", fetchCurrentUser);
    s.on("inventoryUpdated", fetchInventory); s.on("billsUpdated", fetchRecentBills);
    s.on("expensesUpdated", fetchExpenses);
    return () => {
      s.off("adsUpdated", fetchAds); s.off("usersUpdated", fetchCurrentUser);
      s.off("inventoryUpdated", fetchInventory); s.off("billsUpdated", fetchRecentBills);
      s.off("expensesUpdated", fetchExpenses); s.disconnect();
    };
  }, []);

  useEffect(() => {
    const fn = () => {
      const token = localStorage.getItem("token");
      if (token) navigator.sendBeacon("https://multibill.netlify.app/api/auth/logout",
        new Blob([JSON.stringify({ token })], { type: "application/json" }));
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, []);

  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;
    try { await api.post("/auth/logout"); } catch (e) { console.log(e); }
    localStorage.removeItem("token");
    window.location.replace("/");
  };

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return alert("Fill all fields");
    try {
      await api.post("/expenses/add", newExpense);
      fetchExpenses(); setShowAddExpense(false);
      setNewExpense({ title: "", amount: "", category: "General" });
    } catch { alert("Failed to save expense"); }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try { await api.delete(`/expenses/delete/${id}`); fetchExpenses(); }
    catch { alert("Failed to delete expense"); }
  };

  const stats = useMemo(() => {
    const revenue = recentBills.reduce((a, b) => a + (b.finalTotal || 0), 0);
    const pending = recentBills.reduce((a, b) => a + ((b.finalTotal || 0) - (b.payment || 0)), 0);
    const totalExpenses = expenses.reduce((a, e) => a + (Number(e.amount) || 0), 0);
    return { revenue, pending, count: recentBills.length, netProfit: revenue - totalExpenses, totalExpenses };
  }, [recentBills, expenses]);

  const filteredBills = useMemo(() => recentBills.filter(b => {
    const s = billSearch.toLowerCase();
    const match = (b.customerName || "").toLowerCase().includes(s) ||
      (b.type || "").toLowerCase().includes(s) || (b._id || "").toLowerCase().includes(s);
    const bal = (b.finalTotal || 0) - (b.payment || 0);
    const paid = bal <= 0;
    const st = statusFilter === "all" || (statusFilter === "paid" && paid) || (statusFilter === "pending" && !paid);
    const bd = new Date(b.createdAt);
    const mf = fromDate ? bd >= new Date(fromDate) : true;
    const mt = toDate ? bd <= new Date(toDate) : true;
    const diff = Math.floor((new Date() - bd) / 86400000);
    let ma = true;
    if (agingFilter === "0-7") ma = diff <= 7;
    else if (agingFilter === "7-30") ma = diff > 7 && diff <= 30;
    else if (agingFilter === "30+") ma = diff > 30;
    return match && st && mf && mt && ma;
  }), [recentBills, billSearch, statusFilter, fromDate, toDate, agingFilter]);

  const handleAddStock = async () => {
    if (!newStock.name || newStock.quantity === "" || newStock.price === "") return alert("Fill all required fields");
    try {
      if (editingStock)
        await api.put(`/inventory/update/${editingStock._id}`, { name: newStock.name.trim(), quantity: Number(newStock.quantity), unit: newStock.unit || "pcs", price: Number(newStock.price) });
      else
        await api.post("/inventory/add", { name: newStock.name.trim(), quantity: Number(newStock.quantity), unit: newStock.unit || "pcs", price: Number(newStock.price) });
      fetchInventory(); setShowAddStock(false); setEditingStock(null);
      setNewStock({ name: "", quantity: "", unit: "pcs", price: "" });
    } catch (err) { alert(err?.response?.data?.error || "Error saving stock"); }
  };

  const handleEditStock = item => { setEditingStock(item); setNewStock({ name: item.name, quantity: item.quantity, unit: item.unit, price: item.price }); setShowAddStock(true); };
  const handleDeleteStock = async id => {
    if (!window.confirm("Delete this item?")) return;
    try { await api.delete(`/inventory/delete/${id}`); fetchInventory(); }
    catch { alert("Failed to delete stock"); }
  };

  const updateItem = (index, field, val) => {
    const ni = [...items]; ni[index][field] = val;
    if (field === "price" || field === "quantity")
      ni[index].value = parseFloat(((parseFloat(ni[index].price) || 0) * (parseFloat(ni[index].quantity) || 0)).toFixed(2));
    setItems(ni);
    const last = ni[ni.length - 1];
    if (last.name || last.price || last.quantity || last.unit)
      setItems([...ni, { name: "", quantity: "", unit: "", price: "", value: 0 }]);
  };

  const handleItemSelect = (index, val) => {
    const ni = [...items]; ni[index].name = val;
    const si = inventory.find(i => i.name === val);
    if (si) { ni[index].unit = si.unit; ni[index].price = si.price; ni[index].value = parseFloat((si.price * (parseFloat(ni[index].quantity) || 0)).toFixed(2)); }
    setItems(ni);
    const last = ni[ni.length - 1];
    if (last.name || last.price || last.quantity || last.unit)
      setItems([...ni, { name: "", quantity: "", unit: "", price: "", value: 0 }]);
  };

  const removeItem = i => { const ni = items.filter((_, idx) => idx !== i); setItems(ni.length ? ni : [{ name: "", quantity: "", unit: "", price: "", value: 0 }]); };
  const resetForm = () => { setCustomer({ name: "", phone: "", address: "" }); setItems([{ name: "", quantity: "", unit: "", price: "", value: 0 }]); setType("Bill"); setEditingBill(null); setFreight(0); setPayment(0); };

  const totalItems = items.reduce((s, i) => s + (parseFloat(i.value) || 0), 0);
  const totalSum = totalItems + (parseFloat(freight) || 0);
  const roundedTotal = Math.round(totalSum);
  const roundOff = parseFloat((roundedTotal - totalSum).toFixed(2));
  const balance = parseFloat((roundedTotal - (parseFloat(payment) || 0)).toFixed(2));

  const createOrUpdateBill = async () => {
    if (!customer.name.trim()) return alert("Please enter customer name");
    try {
      const ci = items.filter(i => i.name?.trim()).map(i => ({ name: i.name, unit: i.unit || "pcs", quantity: Number(i.quantity) || 1, price: Number(i.price) || 0, value: Number(i.value) || 0 }));
      if (!ci.length) return alert("Add at least one item.");
      const pl = { customerName: customer.name, customerPhone: customer.phone, customerAddress: customer.address, items: ci, type, freight: parseFloat(freight) || 0, payment: parseFloat(payment) || 0, total: parseFloat(totalItems.toFixed(2)), roundOff, finalTotal: roundedTotal, balance };
      if (editingBill) await api.put(`/billing/update/${editingBill._id}`, pl);
      else await api.post("/billing/create", pl);
      await fetchInventory(); await fetchRecentBills();
      alert("Bill generated and Inventory updated!");
      resetForm(); setShowBilling(false);
    } catch (err) { alert(`Transaction Failed: ${err.response?.data?.error || err.message}`); }
  };

  const editBill = b => {
    setEditingBill(b); setCustomer({ name: b.customerName, phone: b.customerPhone, address: b.customerAddress || "" });
    setItems([...b.items.map(i => ({ ...i, unit: i.unit || "pcs", value: (parseFloat(i.price) || 0) * (parseFloat(i.quantity) || 0) })), { name: "", quantity: "", unit: "", price: "", value: 0 }]);
    setType(b.type); setFreight(b.freight || 0); setPayment(b.payment || 0); setShowBilling(true);
  };

  const deleteBill = async id => {
    if (!window.confirm("Delete this record?")) return;
    try { await api.delete(`/billing/delete/${id}`); fetchRecentBills(); }
    catch { alert("Error deleting record"); }
  };

  const populateBillTemplate = (bd, div) => {
    const st = (sel, val) => { const el = div.querySelector(sel); if (el) el.textContent = val; };
    st(".company-info h2", shop.name); st(".company-info p", shop.address);
    st(".quote-meta h3", bd.type.toUpperCase());
    st(".quote-meta p:nth-child(2)", `Date: ${new Date(bd.createdAt || Date.now()).toLocaleDateString()}`);
    st(".quote-meta p:nth-child(3)", `Bill No.: ${bd.billNumber || "Draft"}`);
    st(".customer-info p:nth-child(1) span", bd.customerName);
    st(".customer-info p:nth-child(2) span", bd.customerAddress || "N/A");
    st(".customer-info p:nth-child(3) span", bd.customerPhone || "N/A");
    const li = div.querySelector(".bill-logo");
    if (li) { if (shop.logo) { li.src = shop.logo; li.style.display = "block"; } else li.style.display = "none"; }
    const tb = div.querySelector("tbody"); tb.innerHTML = "";
    bd.items.forEach((it, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td style="padding:10px;border:1px solid #ddd;">${i + 1}</td><td style="padding:10px;border:1px solid #ddd;">${it.name}</td><td style="padding:10px;border:1px solid #ddd;">${it.unit}</td><td style="padding:10px;border:1px solid #ddd;text-align:right;">${(it.price || 0).toFixed(2)}</td><td style="padding:10px;border:1px solid #ddd;text-align:right;">${it.quantity || 0}</td><td style="padding:10px;border:1px solid #ddd;text-align:right;">${(it.value || 0).toFixed(2)}</td>`;
      tb.appendChild(row);
    });
    const t = bd.total || 0, adv = bd.payment || 0, fr = bd.freight || 0, ro = bd.roundOff || 0;
    st(".freight-value", fr.toFixed(2)); st(".total-value", t.toFixed(2));
    st(".roundoff-value", ro.toFixed(2)); st(".advance-value", adv.toFixed(2));
    st(".balance-value", (t + fr - adv + ro).toFixed(2));
  };

  const viewBill = bd => {
    if (!billRef.current) return;
    billRef.current.style.display = "block";
    populateBillTemplate(bd, billRef.current);
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Bill - ${bd.customerName}</title><style>body{font-family:sans-serif;padding:20px;}</style></head><body>${billRef.current.outerHTML}</body></html>`);
    w.document.close();
    billRef.current.style.display = "none";
  };

  const downloadBillFormat = async bd => {
    if (!billRef.current) return;
    billRef.current.style.display = "block";
    populateBillTemplate(bd, billRef.current);
    const canvas = await html2canvas(billRef.current);
    const pdf = new jsPDF("p", "mm", "a4"); const iw = 190;
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 10, 10, iw, (canvas.height * iw) / canvas.width);
    pdf.save(`${bd.customerName || "invoice"}.pdf`);
    billRef.current.style.display = "none";
  };

  const shareWhatsApp = b => {
    const msg = `*${shop.name}*\n*Invoice: ${b.type.toUpperCase()}*\nCustomer: ${b.customerName}\nTotal: ₹${b.finalTotal}\nBalance: ₹${b.finalTotal - (b.payment || 0)}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const navItems = [
    { id: "dashboard", icon: <DashIcon />, label: "Dashboard" },
    { id: "inventory", icon: <BoxIcon />, label: "Inventory" },
    { id: "expenses", icon: <WalletIcon />, label: "Expenses" },
  ];

  const tabTitle = { dashboard: "Billing & Transactions", inventory: "Stock Inventory", expenses: "Expense Tracker" };

  return (
    <div className={`shell ${darkMode ? "dark" : "light"}`}>
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand">
          <div className="brand-avatar">
            {shop.logo ? <img src={shop.logo} alt="logo" className="brand-logo-img" /> : <span>{shop.name.charAt(0)}</span>}
          </div>
          <div className="brand-text">
            <span className="brand-name">{shop.name}</span>
            <span className="brand-tagline">Business Suite</span>
          </div>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-nav">
          <p className="nav-section-label">MENU</p>
          {navItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => { setActiveTab(item.id); if (window.innerWidth <= 900) setSidebarOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="settings-btn" onClick={() => { setShowShopSettings(true); if (window.innerWidth <= 900) setSidebarOpen(false); }}>
            <SettingsIcon /><span>Settings</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && window.innerWidth <= 900 && (
        <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Area */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="topbar-title">
              <span className="topbar-page">{tabTitle[activeTab]}</span>
            </div>
          </div>
          <div className="topbar-right">
            <ThemeToggle dark={darkMode} onToggle={() => setDarkMode(d => !d)} />
            <div className="user-pill">
              <div className="user-avatar">{currentUser?.name?.charAt(0)?.toUpperCase() || "U"}</div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role">{currentUser.role}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}><LogoutIcon /><span className="logout-label">Logout</span></button>
          </div>
        </header>

        {/* Content Area with Improved Scrolling */}
        <div className="content-area fade-in">
          {activeTab === "dashboard" && (
            <div>
              <div className="stats-grid">
                <StatCard label="Total Revenue" value={stats.revenue} icon={<TrendUpIcon />} color="#10b981" bgColor="rgba(16,185,129,0.1)" delay="0s" />
                <StatCard label="Total Expenses" value={stats.totalExpenses} icon={<TrendDownIcon />} color="#f43f5e" bgColor="rgba(244,63,94,0.1)" delay="0.07s" />
                <StatCard label="Net Profit" value={stats.netProfit} icon={<ProfitIcon />} color="#6366f1" bgColor="rgba(99,102,241,0.1)" delay="0.14s" />
                <StatCard label="Outstanding" value={stats.pending} icon={<ClockIcon />} color="#f59e0b" bgColor="rgba(245,158,11,0.1)" delay="0.21s" />
              </div>

              {ads.length > 0 && (
                <div className="ads-scroll">
                  {ads.map(a => (
                    <div key={a._id} className="ad-card">
                      <img src={`https://my-backend-1-c9a1.onrender.com${a.imageUrl}`} alt="Promotion" />
                    </div>
                  ))}
                </div>
              )}

              <div className="card bills-card">
                <div className="bills-header">
                  <div className="section-meta">
                    <h2 className="section-title">Transactions</h2>
                    <span className="section-count">{filteredBills.length} records</span>
                  </div>
                  <div className="header-actions">
                    <button className="btn-primary" onClick={() => setShowBilling(true)}>
                      <PlusIcon /> New Bill
                    </button>
                    <button className={`btn-outline ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(p => !p)}>
                      <FilterIcon /> Filters
                    </button>
                  </div>
                </div>
                <div className="search-row">
                  <SearchIcon />
                  <input
                    className="search-input"
                    type="text"
                    placeholder="Search by customer, type, or bill ID…"
                    value={billSearch}
                    onChange={e => setBillSearch(e.target.value)}
                  />
                </div>
                {showFilters && (
                  <div className="filter-bar">
                    <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="paid">Settled</option>
                      <option value="pending">Pending</option>
                    </select>
                    <input type="date" className="filter-select" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    <span className="filter-arrow">→</span>
                    <input type="date" className="filter-select" value={toDate} onChange={e => setToDate(e.target.value)} />
                    <select className="filter-select" value={agingFilter} onChange={e => setAgingFilter(e.target.value)}>
                      <option value="all">All Aging</option>
                      <option value="0-7">0–7 days</option>
                      <option value="7-30">7–30 days</option>
                      <option value="30+">30+ days</option>
                    </select>
                    <button className="btn-ghost-sm" onClick={() => { setBillSearch(""); setStatusFilter("all"); setFromDate(""); setToDate(""); setAgingFilter("all"); }}>
                      <ResetIcon /> Reset
                    </button>
                  </div>
                )}
                <div className="bills-scroll">
                  {filteredBills.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📋</div>
                      <p className="empty-title">No transactions found</p>
                      <p className="empty-sub">Try adjusting your filters or create a new bill</p>
                    </div>
                  ) : (
                    <div className="bill-grid">
                      {filteredBills.map((b, idx) => {
                        const bal = (b.finalTotal || 0) - (b.payment || 0);
                        const isPaid = bal <= 0;
                        return (
                          <div
                            key={b._id}
                            className={`bill-card ${isPaid ? "settled" : "owing"}`}
                            style={{ "--i": idx }}
                          >
                            <div className="bc-top">
                              <span className={`type-badge ${b.type.toLowerCase()}`}>{b.type}</span>
                              <span className="bc-date">{new Date(b.createdAt).toLocaleDateString("en-IN")}</span>
                            </div>
                            <div className="bc-num">#{b.billNumber}</div>
                            <div className="bc-customer">{b.customerName}</div>
                            <div className="bc-amount">₹{(b.finalTotal || 0).toLocaleString("en-IN")}</div>
                            <div className={`bc-status ${isPaid ? "paid" : "pending"}`}>
                              <span className="status-dot" />
                              {isPaid ? "Settled" : `Due ₹${bal.toLocaleString("en-IN")}`}
                            </div>
                            <div className="bc-actions">
                              <button onClick={() => editBill(b)} className="ac-btn" title="Edit"><EditIcon /></button>
                              <button onClick={() => downloadBillFormat(b)} className="ac-btn" title="Download PDF"><DownloadIcon /></button>
                              <button onClick={() => shareWhatsApp(b)} className="ac-btn wa" title="Share WhatsApp"><WhatsAppIcon /></button>
                              <button onClick={() => viewBill(b)} className="ac-btn" title="View"><EyeIcon /></button>
                              <button onClick={() => deleteBill(b._id)} className="ac-btn danger" title="Delete"><TrashIcon /></button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "inventory" && (
            <div className="content-area fade-in">
              <div className="card">
                <div className="card-header">
                  <div className="section-meta">
                    <h2 className="section-title">Stock Inventory</h2>
                    <span className="section-count">{inventory.length} items tracked</span>
                  </div>
                  <button className="btn-primary" onClick={() => setShowAddStock(true)}><PlusIcon /> Add Stock</button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Item Name</th><th>Quantity</th><th>Unit</th><th>Price (₹)</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventory.length === 0 ? (
                        <tr><td colSpan="6" className="empty-row">No inventory items yet</td></tr>
                      ) : inventory.map((item, idx) => (
                        <tr key={item._id} style={{ "--i": idx }} className="tr-anim">
                          <td><span className="item-name">{item.name}</span></td>
                          <td><span className="mono">{item.quantity}</span></td>
                          <td><span className="chip unit-chip">{item.unit}</span></td>
                          <td><span className="mono">₹{item.price}</span></td>
                          <td>
                            {item.quantity < 10
                              ? <span className="badge badge-red">Low Stock</span>
                              : <span className="badge badge-green">In Stock</span>}
                          </td>
                          <td>
                            <div className="row-actions">
                              <button className="tbl-btn edit" onClick={() => handleEditStock(item)}><EditIcon /> Edit</button>
                              <button className="tbl-btn del" onClick={() => handleDeleteStock(item._id)}><TrashIcon /> Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "expenses" && (
            <div className="content-area fade-in">
              <div className="card">
                <div className="card-header">
                  <div className="section-meta">
                    <h2 className="section-title">Expense Tracker</h2>
                    <span className="section-count">Total: ₹{stats.totalExpenses.toLocaleString("en-IN")}</span>
                  </div>
                  <button className="btn-primary" onClick={() => setShowAddExpense(true)}><PlusIcon /> Record Expense</button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Action</th></tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0
                        ? <tr><td colSpan="5" className="empty-row">No expenses recorded yet</td></tr>
                        : expenses.map((exp, idx) => (
                          <tr key={exp._id} style={{ "--i": idx }} className="tr-anim">
                            <td><span className="mono">{new Date(exp.createdAt).toLocaleDateString("en-IN")}</span></td>
                            <td><span className="item-name">{exp.title}</span></td>
                            <td><span className="chip cat-chip">{exp.category}</span></td>
                            <td><span className="expense-amt">₹{Number(exp.amount).toLocaleString("en-IN")}</span></td>
                            <td>
                              <button className="tbl-btn del" onClick={() => handleDeleteExpense(exp._id)}><TrashIcon /> Delete</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ══ MODALS ══ */}

      {/* ADD / EDIT STOCK */}
      {showAddStock && (
        <div className="modal-overlay">
          <div className="modal-panel animate-modal">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-wrap"><BoxIcon /></div>
                <h3>{editingStock ? "Edit Stock Item" : "Add Stock Item"}</h3>
              </div>
              <button className="icon-close-btn" onClick={() => { setShowAddStock(false); setEditingStock(null); setNewStock({ name: "", quantity: "", unit: "pcs", price: "" }); }}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="field-group full-width">
                  <label className="field-label">Item Name</label>
                  <input type="text" className="field-input" value={newStock.name} onChange={e => setNewStock({ ...newStock, name: e.target.value })} placeholder="e.g., Steel Bolts M10" />
                </div>
                <div className="field-group">
                  <label className="field-label">Quantity</label>
                  <input type="number" className="field-input" value={newStock.quantity} onChange={e => setNewStock({ ...newStock, quantity: e.target.value })} placeholder="0" />
                </div>
                <div className="field-group">
                  <label className="field-label">Unit</label>
                  <input type="text" className="field-input" value={newStock.unit} onChange={e => setNewStock({ ...newStock, unit: e.target.value })} placeholder="kg, pcs, box…" />
                </div>
                <div className="field-group full-width">
                  <label className="field-label">Unit Price (₹)</label>
                  <input type="number" className="field-input" value={newStock.price} onChange={e => setNewStock({ ...newStock, price: e.target.value })} placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => { setShowAddStock(false); setEditingStock(null); setNewStock({ name: "", quantity: "", unit: "pcs", price: "" }); }}>Cancel</button>
              <button className="btn-primary" onClick={handleAddStock}>{editingStock ? "Update Item" : "Add Stock"}</button>
            </div>
          </div>
        </div>
      )}

      {/* SHOP SETTINGS */}
      {showShopSettings && <ShopSettings shop={shop} setShop={setShop} onClose={() => setShowShopSettings(false)} />}

      {/* ADD EXPENSE */}
      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal-panel animate-modal" style={{ maxWidth: 460 }}>
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-wrap"><WalletIcon /></div>
                <h3>Record Expense</h3>
              </div>
              <button className="icon-close-btn" onClick={() => setShowAddExpense(false)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <div className="form-grid-1">
                <div className="field-group">
                  <label className="field-label">Expense Title</label>
                  <input type="text" className="field-input" value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="e.g. Electricity Bill" />
                </div>
                <div className="field-group">
                  <label className="field-label">Amount (₹)</label>
                  <input type="number" className="field-input" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} placeholder="0.00" />
                </div>
                <div className="field-group">
                  <label className="field-label">Category</label>
                  <select className="field-input" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
                    <option>General</option><option>Raw Material</option><option>Utilities</option>
                    <option>Salary</option><option>Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowAddExpense(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddExpense}>Save Expense</button>
            </div>
          </div>
        </div>
      )}

      {/* BILLING MODAL */}
      {showBilling && (
        <div className="modal-overlay">
          <div className="modal-panel billing-modal animate-modal">
            <div className="modal-header">
              <div className="modal-title-group">
                <div className="modal-icon-wrap"><DashIcon /></div>
                <h3>{editingBill ? "Update Transaction" : "New Transaction"}</h3>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <select className="type-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="Bill">Tax Bill</option>
                  <option value="Quotation">Quotation</option>
                </select>
                <button className="icon-close-btn" onClick={() => { setShowBilling(false); resetForm(); }}><CloseIcon /></button>
              </div>
            </div>

            <div className="modal-body">
              <div className="customer-row">
                <input className="field-input" placeholder="Customer Name *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                <input className="field-input" placeholder="Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                <input className="field-input" placeholder="Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
              </div>

              <div className="items-table-wrap">
                <div className="items-header-row hide-mobile">
                  <span style={{ flex: 3 }}>Item Description</span>
                  <span style={{ flex: 1 }}>Unit</span>
                  <span style={{ flex: 1 }}>Rate</span>
                  <span style={{ flex: 1 }}>Qty</span>
                  <span style={{ flex: 1 }}>Value</span>
                  <span style={{ width: 32 }} />
                </div>
                <datalist id="stock-items">{inventory.map(i => <option key={i._id} value={i.name} />)}</datalist>
                {items.map((item, i) => (
                  <div key={i} className="item-row">
                    <input style={{ flex: 3 }} className="field-input sm" placeholder="Item name" list="stock-items" value={item.name} onChange={e => handleItemSelect(i, e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input sm" placeholder="Unit" value={item.unit} onChange={e => updateItem(i, "unit", e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input sm" type="number" placeholder="Rate" value={item.price} onChange={e => updateItem(i, "price", e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input sm" type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input sm readonly" type="number" placeholder="Value" value={item.value || ""} disabled />
                    <button className="remove-btn" onClick={() => removeItem(i)}><CloseIcon /></button>
                  </div>
                ))}
              </div>

              <div className="totals-section">
                <div className="totals-inputs">
                  <div className="field-group">
                    <label className="field-label">Freight (₹)</label>
                    <input type="number" className="field-input" value={freight} onChange={e => setFreight(Number(e.target.value))} />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Advance Payment (₹)</label>
                    <input type="number" className="field-input" value={payment} onChange={e => setPayment(Number(e.target.value))} />
                  </div>
                </div>
                <div className="totals-summary">
                  <div className="total-row"><span>Subtotal</span><span>₹{totalItems.toFixed(2)}</span></div>
                  <div className="total-row"><span>Freight</span><span>₹{(parseFloat(freight) || 0).toFixed(2)}</span></div>
                  <div className="total-row"><span>Round Off</span><span>₹{roundOff.toFixed(2)}</span></div>
                  <div className="total-row grand"><span>Grand Total</span><span>₹{roundedTotal.toLocaleString("en-IN")}</span></div>
                  <div className="total-row balance"><span>Balance Due</span><span>₹{balance.toLocaleString("en-IN")}</span></div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => { setShowBilling(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={createOrUpdateBill}>
                {editingBill ? "Update Bill" : "Generate Bill"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden print template */}
      <div ref={billRef} style={{ display: "none", padding: "40px", background: "white", width: "800px", color: "black", fontFamily: "sans-serif" }}>
        <div className="quote-header" style={{ textAlign: "center", borderBottom: "2px solid #333", paddingBottom: "20px", marginBottom: "20px" }}>
          <div className="company-info" style={{ textAlign: "center" }}>
            <img className="bill-logo" style={{ maxHeight: "80px", marginBottom: "10px" }} alt="" />
            <h2 style={{ margin: 0, fontSize: "28px", color: "#2c3e50" }}>Company Name</h2>
            <p style={{ margin: "5px 0" }}>Address Line</p>
          </div>
          <div className="quote-meta" style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", color: "#555" }}>
            <h3 style={{ margin: 0, fontSize: "20px" }}>BILL</h3>
            <p style={{ margin: 0 }}>Date: {new Date().toLocaleDateString()}</p>
            <p style={{ margin: 0 }}>Bill No: N/A</p>
          </div>
        </div>
        <div className="customer-info" style={{ marginBottom: "20px" }}>
          <p style={{ margin: "5px 0" }}><strong>Customer Name:</strong> <span></span></p>
          <p style={{ margin: "5px 0" }}><strong>Customer Address:</strong> <span></span></p>
          <p style={{ margin: "5px 0" }}><strong>Phone:</strong> <span></span></p>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#2c3e50", color: "white" }}>
              {["#", "Item Description", "Unit", "Rate (₹)", "Qty", "Value (₹)"].map(h => (
                <th key={h} style={{ padding: "10px", border: "1px solid #ddd", textAlign: h.includes("₹") || h === "Qty" ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderBottom: "2px solid #333" }}></tbody>
          <tfoot>
            {[["Freight", "freight-value"], ["Total", "total-value"], ["Round Off", "roundoff-value"]].map(([l, c]) => (
              <tr key={l}><td colSpan="5" style={{ textAlign: "right", padding: "10px", fontWeight: "bold" }}>{l}</td><td className={c} style={{ textAlign: "right", padding: "10px" }}></td></tr>
            ))}
            <tr><td colSpan="5" style={{ textAlign: "right", padding: "10px", fontWeight: "bold", color: "#27ae60" }}>Advance</td><td className="advance-value" style={{ textAlign: "right", padding: "10px", color: "#27ae60" }}></td></tr>
            <tr style={{ backgroundColor: "#f8f9fa" }}><td colSpan="5" style={{ textAlign: "right", padding: "12px", fontWeight: "bold", fontSize: "16px", color: "#c0392b" }}>Balance Due</td><td className="balance-value" style={{ textAlign: "right", padding: "12px", fontWeight: "bold", fontSize: "16px", color: "#c0392b" }}></td></tr>
          </tfoot>
        </table>
      </div>

      <style>{`
        /* ═══════════════════════════════════════════
           DESIGN TOKENS
        ═══════════════════════════════════════════ */
        .shell.dark {
          --bg:         #0c0e14;
          --bg-alt:     #111318;
          --surface:    #16181f;
          --surface2:   #1c1f28;
          --surface3:   #23263300;
          --border:     rgba(255,255,255,0.06);
          --border-md:  rgba(255,255,255,0.12);
          --text:       #e2e4ef;
          --text-2:     #8b91b0;
          --text-3:     #4d5275;
          --shadow:     0 4px 24px rgba(0,0,0,0.5);
          --shadow-lg:  0 20px 60px rgba(0,0,0,0.7);
          --input-bg:   #0c0e14;
        }
        .shell.light {
          --bg:         #f0f2f9;
          --bg-alt:     #ffffff;
          --surface:    #ffffff;
          --surface2:   #f5f6fc;
          --surface3:   #eef0f9;
          --border:     rgba(0,0,0,0.07);
          --border-md:  rgba(0,0,0,0.14);
          --text:       #141624;
          --text-2:     #525880;
          --text-3:     #9ba3c9;
          --shadow:     0 4px 20px rgba(0,0,0,0.07);
          --shadow-lg:  0 20px 50px rgba(0,0,0,0.12);
          --input-bg:   #f8f9ff;
        }
        .shell {
          --primary:     #6366f1;
          --primary-d:   #4f52cc;
          --primary-l:   #818cf8;
          --primary-glow:rgba(99,102,241,0.2);
          --green:       #10b981;
          --red:         #f43f5e;
          --amber:       #f59e0b;
          --radius-sm:   8px;
          --radius:      12px;
          --radius-lg:   18px;
          --radius-xl:   24px;
          --sidebar-w:   248px;
          --topbar-h:    60px;
          --ease:        cubic-bezier(0.4,0,0.2,1);
          --spring:      cubic-bezier(0.34,1.56,0.64,1);
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
        }
        * { box-sizing:border-box; margin:0; padding:0; }

        /* ═══════════════════════════════════════════
           SHELL
        ═══════════════════════════════════════════ */
        .shell {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: var(--bg);
          color: var(--text);
          transition: background 0.3s var(--ease), color 0.3s var(--ease);
        }

        /* ═══════════════════════════════════════════
           SIDEBAR
        ═══════════════════════════════════════════ */
        .sidebar {
          width: var(--sidebar-w);
          background: var(--bg-alt);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          z-index: 200;
          transition: transform 0.3s var(--ease), margin-left 0.3s var(--ease), background 0.3s var(--ease);
          position: relative;
        }
        .sidebar.collapsed { margin-left: calc(-1 * var(--sidebar-w)); }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 16px;
          border-bottom: 1px solid var(--border);
          min-height: var(--topbar-h);
        }
        .brand-avatar {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--primary), var(--primary-l));
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1rem; color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px var(--primary-glow);
          overflow: hidden;
        }
        .brand-logo-img { width: 100%; height: 100%; object-fit: cover; }
        .brand-text { flex: 1; overflow: hidden; }
        .brand-name { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .brand-tagline { display: block; font-size: 0.68rem; color: var(--text-3); text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
        .sidebar-close-btn {
          width: 26px; height: 26px;
          border-radius: 6px;
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text-3);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .sidebar-close-btn:hover { color: var(--red); border-color: var(--red); background: rgba(244,63,94,0.08); }

        .nav-section-label { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-3); padding: 16px 16px 8px; }

        .sidebar-nav { flex: 1; padding: 0 8px; display: flex; flex-direction: column; gap: 2px; }
        .nav-item {
          width: 100%;
          display: flex; align-items: center; gap: 11px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: none;
          border: none;
          color: var(--text-2);
          cursor: pointer;
          font-size: 0.875rem;
          font-family: inherit;
          font-weight: 500;
          text-align: left;
          position: relative;
          transition: all 0.2s var(--ease);
        }
        .nav-item:hover { background: var(--surface2); color: var(--text); }
        .nav-item.active { background: var(--primary-glow); color: var(--primary-l); font-weight: 600; }
        .nav-icon { display: flex; align-items: center; flex-shrink: 0; }
        .nav-label { flex: 1; }
        .nav-active-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--primary-l);
          animation: popIn 0.3s var(--spring);
        }
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

        .sidebar-footer { padding: 12px 8px; border-top: 1px solid var(--border); }
        .settings-btn {
          width: 100%;
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: none;
          border: none;
          color: var(--text-2);
          cursor: pointer;
          font-size: 0.875rem;
          font-family: inherit;
          transition: all 0.2s;
        }
        .settings-btn:hover { background: var(--surface2); color: var(--text); }

        /* ═══════════════════════════════════════════
           TOPBAR
        ═══════════════════════════════════════════ */
        .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .topbar {
          height: var(--topbar-h);
          background: var(--bg-alt);
          border-bottom: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 20px;
          flex-shrink: 0;
          z-index: 100;
          transition: background 0.3s;
        }
        .topbar-left { display: flex; align-items: center; gap: 14px; }
        .menu-btn {
          width: 36px; height: 36px;
          border-radius: var(--radius-sm);
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text-2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .menu-btn:hover { color: var(--text); border-color: var(--border-md); }
        .topbar-page { font-size: 0.95rem; font-weight: 700; color: var(--text); }

        .topbar-right { display: flex; align-items: center; gap: 10px; }

        .theme-toggle { background: none; border: none; cursor: pointer; padding: 4px; display: flex; }
        .theme-pill {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: var(--surface2);
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-2);
          transition: all 0.2s;
        }
        .theme-pill:hover { color: var(--text); border-color: var(--border-md); }
        .theme-pill.night { color: var(--primary-l); }
        .theme-pill.day { color: var(--amber); }

        .user-pill {
          display: flex; align-items: center; gap: 10px;
          padding: 5px 12px 5px 5px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 40px;
        }
        .user-avatar {
          width: 30px; height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--primary-l));
          display: flex; align-items: center; justify-content: center;
          font-size: 0.78rem; font-weight: 700; color: white;
          flex-shrink: 0;
        }
        .user-info { display: flex; flex-direction: column; }
        .user-name { font-size: 0.78rem; font-weight: 600; color: var(--text); line-height: 1.2; }
        .user-role { font-size: 0.65rem; color: var(--text-3); }

        .logout-btn {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 14px;
          border-radius: 40px;
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.2);
          color: var(--red);
          cursor: pointer;
          font-size: 0.8rem;
          font-family: inherit;
          font-weight: 500;
          transition: all 0.2s;
        }
        .logout-btn:hover { background: rgba(244,63,94,0.16); border-color: rgba(244,63,94,0.4); }

        /* ═══════════════════════════════════════════
           CONTENT AREA
        ═══════════════════════════════════════════ */
        .content-area {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .content-area::-webkit-scrollbar {
          width: 6px;
        }
        .content-area::-webkit-scrollbar-thumb {
          background: var(--surface2);
          border-radius: 10px;
        }
        .content-area::-webkit-scrollbar-thumb:hover {
          background: var(--border-md);
        }

        /* ═══════════════════════════════════════════
           STAT CARDS
        ═══════════════════════════════════════════ */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          flex-shrink: 0;
        }
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
          animation: statIn 0.5s var(--spring) both;
          animation-delay: var(--delay);
        }
        @keyframes statIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .stat-card:hover { transform: translateY(-3px); border-color: var(--border-md); box-shadow: var(--shadow); }
        .stat-card-header { display: flex; align-items: center; gap: 10px; }
        .stat-icon-wrap {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: var(--accent-bg);
          color: var(--accent);
          display: flex; align-items: center; justify-content: center;
        }
        .stat-label { font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-2); }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
        .stat-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--accent);
          opacity: 0.35;
          transform: scaleX(0); transform-origin: left;
          animation: barGrow 0.7s var(--ease) both;
          animation-delay: calc(var(--delay, 0s) + 0.3s);
        }
        @keyframes barGrow { to { transform: scaleX(1); } }

        /* ═══════════════════════════════════════════
           ADS
        ═══════════════════════════════════════════ */
        .ads-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 4px; flex-shrink: 0; }
        .ads-scroll::-webkit-scrollbar { height: 3px; }
        .ads-scroll::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 3px; }
        .ad-card { min-width: 260px; height: 160px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); flex-shrink: 0; transition: transform 0.2s; }
        .ad-card:hover { transform: scale(1.02); }
        .ad-card img { width: 100%; height: 100%; object-fit: cover; }

        /* ═══════════════════════════════════════════
           CARD
        ═══════════════════════════════════════════ */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: background 0.3s;
        }
        .card-header, .bills-header {
          padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
          gap: 12px;
          flex-wrap: wrap;
        }
        .section-meta { display: flex; flex-direction: column; gap: 2px; }
        .section-title { font-size: 1rem; font-weight: 700; color: var(--text); }
        .section-count { font-size: 0.75rem; color: var(--text-3); }
        .header-actions { display: flex; gap: 8px; align-items: center; }

        /* ═══════════════════════════════════════════
           BILLS SECTION
        ═══════════════════════════════════════════ */
        .bills-card { display: flex; flex-direction: column; }

        .search-row {
          display: flex; align-items: center; gap: 10px;
          padding: 12px 22px;
          border-bottom: 1px solid var(--border);
          color: var(--text-3);
        }
        .search-input {
          flex: 1; background: none; border: none; outline: none;
          color: var(--text); font-size: 0.875rem; font-family: inherit;
        }
        .search-input::placeholder { color: var(--text-3); }

        .filter-bar {
          display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
          padding: 12px 22px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          animation: slideDown 0.2s var(--ease);
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        .filter-select {
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          background: var(--surface);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.8rem;
          font-family: inherit;
          outline: none;
          cursor: pointer;
        }
        .filter-select:focus { border-color: var(--primary); }
        .filter-arrow { color: var(--text-3); font-size: 0.8rem; }

        .bills-scroll { overflow: visible; }


        .bill-grid { padding: 18px 22px; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }

        /* ═══════════════════════════════════════════
           BILL CARDS
        ═══════════════════════════════════════════ */
        .bill-card {
          background: var(--bg-alt);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          animation: cardIn 0.35s var(--ease) both;
          animation-delay: calc(var(--i, 0) * 0.04s);
        }
        @keyframes cardIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .bill-card::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          border-radius: 0;
          background: var(--primary);
          transition: background 0.2s;
        }
        .bill-card.settled::before { background: var(--green); }
        .bill-card.owing::before { background: var(--red); }
        .bill-card:hover { border-color: var(--border-md); transform: translateY(-2px); box-shadow: var(--shadow); }

        .bc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .type-badge {
          padding: 2px 8px; border-radius: 20px;
          font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          background: rgba(99,102,241,0.12); color: var(--primary-l);
        }
        .type-badge.quotation { background: rgba(245,158,11,0.12); color: var(--amber); }
        .bc-date { font-size: 0.68rem; color: var(--text-3); }
        .bc-num { font-size: 0.7rem; color: var(--text-3); font-variant-numeric: tabular-nums; }
        .bc-customer { font-size: 0.95rem; font-weight: 700; color: var(--text); }
        .bc-amount { font-size: 1.3rem; font-weight: 800; color: var(--text); font-variant-numeric: tabular-nums; }
        .bc-status { display: flex; align-items: center; gap: 6px; font-size: 0.74rem; font-weight: 600; }
        .bc-status.paid { color: var(--green); }
        .bc-status.pending { color: var(--red); }
        .status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; animation: pulse 2.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

        .bc-actions {
          display: flex; gap: 5px;
          border-top: 1px solid var(--border);
          padding-top: 10px;
          margin-top: 4px;
        }
        .ac-btn {
          flex: 1; padding: 7px 4px;
          border-radius: 6px;
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text-2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.18s;
        }
        .ac-btn:hover { background: var(--surface); color: var(--text); border-color: var(--border-md); }
        .ac-btn.wa:hover { background: rgba(37,211,102,0.12); color: #25d366; border-color: rgba(37,211,102,0.3); }
        .ac-btn.danger:hover { background: rgba(244,63,94,0.12); color: var(--red); border-color: rgba(244,63,94,0.3); }

        /* ═══════════════════════════════════════════
           BUTTONS
        ═══════════════════════════════════════════ */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          border-radius: var(--radius-sm);
          background: var(--primary);
          border: none;
          color: white;
          font-size: 0.82rem; font-weight: 600; font-family: inherit;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .btn-primary:hover { background: var(--primary-d); transform: translateY(-1px); box-shadow: 0 4px 16px var(--primary-glow); }
        .btn-primary:active { transform: scale(0.97); }
        .btn-primary.loading { opacity: 0.65; pointer-events: none; }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 14px;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-2);
          font-size: 0.82rem; font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover, .btn-outline.active { background: var(--surface2); border-color: var(--primary); color: var(--primary-l); }
        .btn-outline:active { transform: scale(0.97); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-2);
          font-size: 0.82rem; font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { background: var(--surface2); color: var(--text); }
        .btn-ghost:active { transform: scale(0.97); }

        .btn-ghost-sm {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-2);
          font-size: 0.76rem; font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost-sm:hover { background: var(--surface2); color: var(--text); }

        /* ═══════════════════════════════════════════
           TABLE
        ═══════════════════════════════════════════ */
        .table-wrap { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; min-width: 520px; }
        .data-table th {
          padding: 11px 18px;
          text-align: left;
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          color: var(--text-3);
          background: var(--bg);
          border-bottom: 1px solid var(--border);
        }
        .data-table td {
          padding: 13px 18px;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
          color: var(--text-2);
          vertical-align: middle;
        }
        .data-table tbody tr { transition: background 0.15s; }
        .data-table tbody tr:hover { background: var(--surface2); }
        .tr-anim { animation: trIn 0.3s var(--ease) both; animation-delay: calc(var(--i, 0) * 0.03s); }
        @keyframes trIn { from { opacity: 0; } to { opacity: 1; } }

        .item-name { color: var(--text); font-weight: 600; }
        .mono { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 0.82rem; }
        .chip { padding: 3px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
        .unit-chip { background: var(--surface2); color: var(--text-2); }
        .cat-chip { background: rgba(99,102,241,0.1); color: var(--primary-l); }
        .badge { padding: 3px 10px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; }
        .badge-green { background: rgba(16,185,129,0.1); color: var(--green); }
        .badge-red { background: rgba(244,63,94,0.1); color: var(--red); }
        .expense-amt { color: var(--red); font-weight: 700; font-variant-numeric: tabular-nums; }
        .empty-row { text-align: center; padding: 48px; color: var(--text-3); font-size: 0.875rem; }
        .row-actions { display: flex; gap: 6px; }
        .tbl-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 10px;
          border-radius: 6px; border: 1px solid var(--border);
          cursor: pointer; font-size: 0.74rem; font-family: inherit;
          transition: all 0.15s;
        }
        .tbl-btn.edit { background: rgba(99,102,241,0.06); color: var(--primary-l); }
        .tbl-btn.edit:hover { background: rgba(99,102,241,0.16); }
        .tbl-btn.del { background: rgba(244,63,94,0.06); color: var(--red); }
        .tbl-btn.del:hover { background: rgba(244,63,94,0.16); }

        /* ═══════════════════════════════════════════
           EMPTY STATE
        ═══════════════════════════════════════════ */
        .empty-state { padding: 60px 20px; text-align: center; }
        .empty-icon { font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; }
        .empty-title { font-size: 0.95rem; font-weight: 600; color: var(--text-2); margin-bottom: 4px; }
        .empty-sub { font-size: 0.8rem; color: var(--text-3); }

        /* ═══════════════════════════════════════════
           MODALS
        ═══════════════════════════════════════════ */
        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 16px;
          animation: overlayIn 0.2s var(--ease);
        }
        @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

        .animate-modal { animation: modalIn 0.28s var(--spring); }
        @keyframes modalIn { from { opacity: 0; transform: scale(0.93) translateY(14px); } to { opacity: 1; transform: none; } }

        .modal-panel {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          width: 100%; max-width: 600px;
          max-height: 92vh; overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }
        .modal-panel::-webkit-scrollbar { width: 3px; }
        .modal-panel::-webkit-scrollbar-thumb { background: var(--surface2); }
        .billing-modal { max-width: 880px; }
        .settings-modal { max-width: 500px; }

        .modal-header {
          padding: 18px 22px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
          position: sticky; top: 0;
          background: var(--surface); z-index: 10;
        }
        .modal-title-group { display: flex; align-items: center; gap: 10px; }
        .modal-icon-wrap {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: var(--primary-glow);
          color: var(--primary-l);
          display: flex; align-items: center; justify-content: center;
        }
        .modal-header h3 { font-size: 0.95rem; font-weight: 700; color: var(--text); }

        .icon-close-btn {
          width: 30px; height: 30px;
          border-radius: 8px;
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text-2);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .icon-close-btn:hover { background: rgba(244,63,94,0.1); color: var(--red); border-color: rgba(244,63,94,0.3); }

        .modal-body { padding: 22px; }
        .modal-footer {
          padding: 14px 22px;
          border-top: 1px solid var(--border);
          display: flex; justify-content: flex-end; gap: 8px;
          position: sticky; bottom: 0;
          background: var(--surface); z-index: 10;
        }

        /* ═══════════════════════════════════════════
           FORM ELEMENTS
        ═══════════════════════════════════════════ */
        .settings-form-grid { display: flex; flex-direction: column; gap: 16px; }
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-grid-1 { display: flex; flex-direction: column; gap: 14px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .full-width { grid-column: 1 / -1; }

        .field-label {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-2);
        }
        .field-input {
          padding: 10px 13px;
          border-radius: var(--radius-sm);
          background: var(--input-bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.875rem; font-family: inherit;
          outline: none; width: 100%;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .field-input.readonly { background: var(--surface2); color: var(--text-3); cursor: not-allowed; }
        .field-input.sm { padding: 8px 10px; font-size: 0.82rem; }

        .customer-row { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
        .customer-row .field-input { flex: 1; min-width: 150px; }

        .type-select {
          padding: 7px 12px;
          border-radius: var(--radius-sm);
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text);
          font-size: 0.82rem; font-family: inherit;
          outline: none;
        }
        .type-select:focus { border-color: var(--primary); }

        .items-table-wrap { margin-bottom: 18px; }
        .items-header-row {
          display: flex; gap: 8px;
          padding: 0 0 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 8px;
          font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-3);
        }
        .item-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        .remove-btn {
          width: 28px; height: 28px; flex-shrink: 0;
          border-radius: 6px;
          background: rgba(244,63,94,0.08);
          border: 1px solid rgba(244,63,94,0.2);
          color: var(--red);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .remove-btn:hover { background: rgba(244,63,94,0.2); }

        .totals-section {
          display: flex; gap: 20px; justify-content: space-between;
          padding-top: 16px; border-top: 1px solid var(--border);
          flex-wrap: wrap;
        }
        .totals-inputs { display: flex; flex-direction: column; gap: 12px; min-width: 200px; }
        .totals-summary { flex: 1; min-width: 220px; }
        .total-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 7px 0;
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem; color: var(--text-2);
        }
        .total-row:last-child { border-bottom: none; }
        .total-row.grand { font-size: 0.95rem; font-weight: 700; color: var(--primary-l); border-color: var(--primary-glow); }
        .total-row.balance { font-weight: 700; color: var(--red); }

        /* Logo upload */
        .logo-upload-area { display: flex; align-items: center; gap: 14px; }
        .logo-preview-box {
          width: 68px; height: 68px;
          border-radius: var(--radius-sm);
          background: var(--input-bg);
          border: 1px dashed var(--border-md);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .logo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text-3); }
        .logo-ph-icon { font-size: 1.4rem; }
        .logo-placeholder p { font-size: 0.62rem; }
        .upload-btn-label {
          display: inline-block;
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          background: var(--surface2);
          border: 1px solid var(--border);
          color: var(--text-2);
          cursor: pointer;
          font-size: 0.8rem;
          transition: all 0.2s;
        }
        .upload-btn-label:hover { background: var(--primary-glow); border-color: var(--primary); color: var(--primary-l); }

        /* ═══════════════════════════════════════════
           MISC
        ═══════════════════════════════════════════ */
        .sidebar-scrim {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 199;
          backdrop-filter: blur(3px);
          animation: overlayIn 0.2s;
        }
        .fade-in { animation: fadeIn 0.35s var(--ease); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }

        /* ═══════════════════════════════════════════
           RESPONSIVE
        ═══════════════════════════════════════════ */
        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .sidebar {
            position: fixed; left: 0; top: 0; bottom: 0;
            margin-left: 0; z-index: 300;
          }
          .sidebar.collapsed { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .user-info { display: none; }
          .logout-label { display: none; }
          .logout-btn { padding: 8px 10px; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .content-area { padding: 14px; gap: 14px; }
          .bills-header, .card-header { padding: 14px 16px; }
          .search-row { padding: 10px 16px; }
          .bill-grid { padding: 14px 16px; gap: 12px; }
          .filter-bar { padding: 10px 16px; }
          .customer-row { flex-direction: column; }
          .item-row { flex-wrap: wrap; }
          .totals-section { flex-direction: column; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .modal-body { padding: 16px; }
          .modal-header, .modal-footer { padding: 14px 16px; }
          .hide-mobile { display: none; }
          .billing-modal { max-width: 100%; }
        }
        @media (max-width: 400px) {
          .stats-grid { grid-template-columns: 1fr; }
          .topbar { padding: 0 12px; }
          .stat-value { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
}
