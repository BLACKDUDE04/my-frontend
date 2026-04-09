import React, { useState, useEffect, useMemo, useRef } from "react";
import api from "../api";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { io } from "socket.io-client";

/* ═══════════════════════════════════════════════
   SHOP SETTINGS MODAL
═══════════════════════════════════════════════ */
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
    } catch (err) {
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
            <span className="modal-icon">⚙️</span>
            <h3>Business Configuration</h3>
          </div>
          <button className="icon-close-btn" onClick={onClose}>✕</button>
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
                    : <div className="logo-placeholder"><span>🏪</span><p>No Logo</p></div>}
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
                  📁 Upload Logo
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className={`btn-primary ${saving ? "loading" : ""}`} onClick={handleApply} disabled={saving}>
            {saving ? "Saving…" : "✓ Apply Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════ */
function StatCard({ label, value, icon, color, delay }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const steps = 30; let step = 0;
    const interval = setInterval(() => {
      step++;
      setDisplayed(Math.round((value / steps) * step));
      if (step >= steps) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="stat-card" style={{ "--delay": delay, "--accent": color }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-value">₹{displayed.toLocaleString()}</span>
      </div>
      <div className="stat-card-bar" />
    </div>
  );
}

/* ═══════════════════════════════════════════════
   THEME TOGGLE
═══════════════════════════════════════════════ */
function ThemeToggle({ dark, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} title={dark ? "Switch to Light" : "Switch to Dark"}>
      <span className="theme-track">
        <span className={`theme-thumb ${dark ? "night" : "day"}`}>
          {dark ? "🌙" : "☀️"}
        </span>
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════ */
export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: "Loading...", role: "Loading..." });

  const [ads, setAds] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [showBilling, setShowBilling] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [items, setItems] = useState([{ name: "", quantity: "", unit: "", price: "", value: 0 }]);
  const [type, setType] = useState("Bill");
  const [freight, setFreight] = useState(0);
  const [payment, setPayment] = useState(0);
  const [bill, setBill] = useState({});
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
  try {
    const res = await api.get("/shop");
    setShop(prev => ({
      ...prev,
      ...res.data
    }));
  } catch (err) {
    console.error("Failed to fetch shop", err);
  }
};
  const fetchExpenses = async () => {
    try { const res = await api.get("/expenses"); setExpenses(res.data); }
    catch (err) { console.error("Error fetching expenses:", err); }
  };
  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return alert("Fill all fields");
    try {
      await api.post("/expenses/add", newExpense);
      fetchExpenses(); setShowAddExpense(false);
      setNewExpense({ title: "", amount: "", category: "General" });
    } catch (err) { alert("Failed to save expense"); }
  };
  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Delete this expense?")) return;
    try { await api.delete(`/expenses/delete/${id}`); fetchExpenses(); }
    catch (err) { alert("Failed to delete expense"); }
  };
  const fetchCurrentUser = async () => {
    try { const res = await api.get("/auth/user"); setCurrentUser(res.data); }
    catch (err) { setCurrentUser({ name: "Guest", role: "Unknown" }); }
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
    window.location.href = "/";
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
    catch (err) { alert("Failed to delete stock"); }
  };

  const updateItem = (index, field, val) => {
    const ni = [...items]; ni[index][field] = val;
    if (field === "price" || field === "quantity") {
      ni[index].value = parseFloat(((parseFloat(ni[index].price) || 0) * (parseFloat(ni[index].quantity) || 0)).toFixed(2));
    }
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
      alert("Success: Bill generated and Inventory updated!");
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
    catch (err) { alert("Error deleting record"); }
  };

  const populateBillTemplate = (bd, div) => {
    const st = (sel, val) => { const el = div.querySelector(sel); if (el) el.textContent = val; };
    st(".company-info h2", shop.name); st(".company-info p", shop.address);
    st(".quote-meta h3", bd.type.toUpperCase());
    st(".quote-meta p:nth-child(2)", `Date: ${new Date(bd.createdAt || Date.now()).toLocaleDateString()}`);
    st(".quote-meta p:nth-child(3)", `Bill No. #: ${bd.billNumber || "Draft"}`);
    st(".customer-info p:nth-child(1) span", bd.customerName);
    st(".customer-info p:nth-child(2) span", bd.customerAddress || "N/A");
    st(".customer-info p:nth-child(3) span", bd.customerPhone || "N/A");
    const li = div.querySelector(".bill-logo");
    if (li) { if (shop.logo) { li.src = shop.logo; li.style.display = "block"; } else li.style.display = "none"; }
    const tb = div.querySelector("tbody"); tb.innerHTML = "";
    bd.items.forEach((it, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td style="padding:10px;border:1px solid #ddd;">${i+1}</td><td style="padding:10px;border:1px solid #ddd;">${it.name}</td><td style="padding:10px;border:1px solid #ddd;">${it.unit}</td><td style="padding:10px;border:1px solid #ddd;text-align:right;">${(it.price||0).toFixed(2)}</td><td style="padding:10px;border:1px solid #ddd;text-align:right;">${it.quantity||0}</td><td style="padding:10px;border:1px solid #ddd;text-align:right;">${(it.value||0).toFixed(2)}</td>`;
      tb.appendChild(row);
    });
    const t = bd.total||0, adv = bd.payment||0, fr = bd.freight||0, ro = bd.roundOff||0;
    st(".freight-value", fr.toFixed(2)); st(".total-value", t.toFixed(2));
    st(".roundoff-value", ro.toFixed(2)); st(".advance-value", adv.toFixed(2));
    st(".balance-value", (t+fr-adv+ro).toFixed(2));
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
    { id: "dashboard", icon: "◈", label: "Dashboard" },
    { id: "inventory", icon: "⬡", label: "Inventory" },
    { id: "expenses", icon: "◉", label: "Expenses" },
  ];

  return (
    <div className={`shell ${darkMode ? "dark" : "light"}`}>

      {/* SIDEBAR */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "collapsed"}`}>
        <div className="sidebar-brand">
          {shop.logo ? <img src={shop.logo} alt="logo" className="brand-logo" /> : <div className="brand-monogram">{shop.name.charAt(0)}</div>}
          <div className="brand-text">
            <span className="brand-name">{shop.name}</span>
            <span className="brand-sub">Business Suite</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>✕</button>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`}
              onClick={() => { setActiveTab(item.id); if (window.innerWidth <= 900) setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {activeTab === item.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="settings-nav-btn" onClick={() => { setShowShopSettings(true); if (window.innerWidth <= 900) setSidebarOpen(false); }}>
            <span>⚙</span> Settings
          </button>
        </div>
      </aside>

      {sidebarOpen && window.innerWidth <= 900 && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <span /><span /><span />
            </button>
            <span className="breadcrumb-root">
              {activeTab === "dashboard" ? "Billing & Quotes" : activeTab === "inventory" ? "Inventory" : "Expenses"}
            </span>
          </div>
          <div className="topbar-right">
            <ThemeToggle dark={darkMode} onToggle={() => setDarkMode(d => !d)} />
            <div className="user-chip">
              <div className="user-avatar-chip">{currentUser?.name?.charAt(0)?.toUpperCase() || "U"}</div>
              <div className="user-chip-text">
                <span className="chip-name">{currentUser.name}</span>
                <span className="chip-role">{currentUser.role}</span>
              </div>
            </div>
            <button className="logout-pill" onClick={handleLogout}><span>↩</span> Logout</button>
          </div>
        </header>

        {/* ── DASHBOARD ── */}
        {activeTab === "dashboard" && (
          <div className="content-area fade-up">
            <div className="stats-row">
              <StatCard label="Total Revenue" value={stats.revenue} icon="↑" color="#10b981" delay="0s" />
              <StatCard label="Total Expenses" value={stats.totalExpenses} icon="↓" color="#ef4444" delay="0.07s" />
              <StatCard label="Net Profit" value={stats.netProfit} icon="≈" color="#6366f1" delay="0.14s" />
              <StatCard label="Outstanding" value={stats.pending} icon="⏳" color="#f59e0b" delay="0.21s" />
            </div>

            {ads.length > 0 && (
              <div className="ads-strip">
                {ads.map(a => (
                  <div key={a._id} className="ad-tile">
                    <img src={`https://my-backend-1-c9a1.onrender.com${a.imageUrl}`} alt="Promotion" />
                  </div>
                ))}
              </div>
            )}

            {/* ── BILLS SECTION ──
                bills-section-card is a flex column with a capped height.
                bills-fixed-top = sticky header (never scrolls away).
                bill-grid-scroll = the scrollable region for cards.        */}
            <div className="section-card bills-section-card">

              <div className="bills-fixed-top">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">Transactions</h2>
                    <p className="section-sub">{filteredBills.length} records</p>
                  </div>
                  <div className="section-actions">
                    <button className="btn-primary" onClick={() => setShowBilling(true)}>+ New Bill</button>
                    <button className={`btn-outline ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(p => !p)}>⊟ Filters</button>
                    
                  </div>
                </div>

                <div className="search-bar-wrap">
                  <span className="search-icon">⌕</span>
                  <input className="search-bar" type="text" placeholder="Search customer, type, ID…"
                    value={billSearch} onChange={e => setBillSearch(e.target.value)} />
                </div>

                {showFilters && (
                  <div className="filter-row animate-down">
                    <select className="filter-chip" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="paid">Settled</option>
                      <option value="pending">Pending</option>
                    </select>
                    <input type="date" className="filter-chip" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    <span className="filter-sep">→</span>
                    <input type="date" className="filter-chip" value={toDate} onChange={e => setToDate(e.target.value)} />
                    <select className="filter-chip" value={agingFilter} onChange={e => setAgingFilter(e.target.value)}>
                      <option value="all">All Aging</option>
                      <option value="0-7">0–7 days</option>
                      <option value="7-30">7–30 days</option>
                      <option value="30+">30+ days</option>
                    </select>
                    <button className="btn-ghost small" onClick={() => { setBillSearch(""); setStatusFilter("all"); setFromDate(""); setToDate(""); setAgingFilter("all"); }}>↺ Reset</button>
                  </div>
                )}
              </div>

              {/* Scrollable bill grid */}
              <div className="bill-grid-scroll">
                <div className="bill-grid">
                  {filteredBills.length === 0 && (
                    <div className="empty-state">
                      <div className="empty-icon">◎</div>
                      <p>No transactions found</p>
                    </div>
                  )}
                  {filteredBills.map((b, idx) => {
                    const bal = (b.finalTotal || 0) - (b.payment || 0);
                    const isPaid = bal <= 0;
                    return (
                      <div key={b._id} className={`bill-card ${b.type.toLowerCase()} ${isPaid ? "settled" : "owing"}`}
                        style={{ "--card-delay": `${idx * 0.04}s` }}>
                        <div className="bill-card-head">
                          <span className={`type-badge ${b.type.toLowerCase()}`}>{b.type}</span>
                          <span className="bill-date">{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="bill-number">#{b.billNumber}</div>
                        <div className="bill-customer">{b.customerName}</div>
                        <div className="bill-amount">₹{(b.finalTotal || 0).toLocaleString()}</div>
                        <div className={`bill-status ${isPaid ? "paid" : "pending"}`}>
                          <span className="status-dot" />
                          {isPaid ? "Settled" : `Due ₹${bal.toLocaleString()}`}
                        </div>
                        <div className="bill-actions">
                          <button onClick={() => editBill(b)} title="Edit" className="action-btn">✏</button>
                          <button onClick={() => downloadBillFormat(b)} title="Download" className="action-btn">⬇</button>
                          <button onClick={() => shareWhatsApp(b)} title="WhatsApp" className="action-btn green">💬</button>
                          <button onClick={() => viewBill(b)} title="View" className="action-btn">◉</button>
                          <button onClick={() => deleteBill(b._id)} title="Delete" className="action-btn red">✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── INVENTORY ── */}
        {activeTab === "inventory" && (
          <div className="content-area fade-up">
            <div className="section-card">
              <div className="section-header">
                <div><h2 className="section-title">Stock Inventory</h2><p className="section-sub">{inventory.length} items tracked</p></div>
                <button className="btn-primary" onClick={() => setShowAddStock(true)}>+ Add Stock</button>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Price (₹)</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {inventory.map((item, idx) => (
                      <tr key={item._id} style={{ "--row-delay": `${idx * 0.03}s` }} className="table-row-animate">
                        <td><span className="item-name">{item.name}</span></td>
                        <td>{item.quantity}</td>
                        <td><span className="unit-chip">{item.unit}</span></td>
                        <td>₹{item.price}</td>
                        <td>{item.quantity < 10 ? <span className="stock-badge low">Low Stock</span> : <span className="stock-badge ok">In Stock</span>}</td>
                        <td><div className="table-actions">
                          <button className="tbl-btn edit" onClick={() => handleEditStock(item)}>✏</button>
                          <button className="tbl-btn del" onClick={() => handleDeleteStock(item._id)}>✕</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── EXPENSES ── */}
        {activeTab === "expenses" && (
          <div className="content-area fade-up">
            <div className="section-card">
              <div className="section-header">
                <div><h2 className="section-title">Expense Tracker</h2><p className="section-sub">Total: ₹{stats.totalExpenses.toLocaleString()}</p></div>
                <button className="btn-primary" onClick={() => setShowAddExpense(true)}>+ Record Expense</button>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Action</th></tr></thead>
                  <tbody>
                    {expenses.length === 0
                      ? <tr><td colSpan="5" className="empty-row">No expenses recorded</td></tr>
                      : expenses.map((exp, idx) => (
                        <tr key={exp._id} style={{ "--row-delay": `${idx * 0.03}s` }} className="table-row-animate">
                          <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                          <td><span className="item-name">{exp.title}</span></td>
                          <td><span className="cat-chip">{exp.category}</span></td>
                          <td><span className="expense-amount">₹{exp.amount}</span></td>
                          <td><button className="tbl-btn del" onClick={() => handleDeleteExpense(exp._id)}>✕ Delete</button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ MODALS ══ */}

      {showAddStock && (
        <div className="modal-overlay">
          <div className="modal-panel animate-modal">
            <div className="modal-header">
              <div className="modal-title-group"><span className="modal-icon">⬡</span><h3>{editingStock ? "Edit Stock Item" : "Add Stock Item"}</h3></div>
              <button className="icon-close-btn" onClick={() => { setShowAddStock(false); setEditingStock(null); setNewStock({ name: "", quantity: "", unit: "pcs", price: "" }); }}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-2">
                <div className="field-group"><label className="field-label">Item Name</label><input type="text" className="field-input" value={newStock.name} onChange={e => setNewStock({ ...newStock, name: e.target.value })} placeholder="e.g., Steel Bolts" /></div>
                <div className="field-group"><label className="field-label">Quantity</label><input type="number" className="field-input" value={newStock.quantity} onChange={e => setNewStock({ ...newStock, quantity: e.target.value })} /></div>
                <div className="field-group"><label className="field-label">Unit</label><input type="text" className="field-input" value={newStock.unit} onChange={e => setNewStock({ ...newStock, unit: e.target.value })} placeholder="kg, pcs…" /></div>
                <div className="field-group"><label className="field-label">Unit Price (₹)</label><input type="number" className="field-input" value={newStock.price} onChange={e => setNewStock({ ...newStock, price: e.target.value })} /></div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => { setShowAddStock(false); setEditingStock(null); setNewStock({ name: "", quantity: "", unit: "pcs", price: "" }); }}>Cancel</button>
              <button className="btn-primary" onClick={handleAddStock}>{editingStock ? "Update" : "Add Stock"}</button>
            </div>
          </div>
        </div>
      )}

      {showShopSettings && <ShopSettings shop={shop} setShop={setShop} onClose={() => setShowShopSettings(false)} />}

      {showAddExpense && (
        <div className="modal-overlay">
          <div className="modal-panel animate-modal" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <div className="modal-title-group"><span className="modal-icon">◉</span><h3>Record Expense</h3></div>
              <button className="icon-close-btn" onClick={() => setShowAddExpense(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-grid-1">
                <div className="field-group"><label className="field-label">Expense Title</label><input type="text" className="field-input" value={newExpense.title} onChange={e => setNewExpense({ ...newExpense, title: e.target.value })} placeholder="e.g. Electricity Bill" /></div>
                <div className="field-group"><label className="field-label">Amount (₹)</label><input type="number" className="field-input" value={newExpense.amount} onChange={e => setNewExpense({ ...newExpense, amount: e.target.value })} /></div>
                <div className="field-group">
                  <label className="field-label">Category</label>
                  <select className="field-input" value={newExpense.category} onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}>
                    <option>General</option><option>Raw Material</option><option>Utilities</option><option>Salary</option><option>Maintenance</option>
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

      {showBilling && (
        <div className="modal-overlay">
          <div className="modal-panel billing-modal animate-modal">
            <div className="modal-header">
              <div className="modal-title-group"><span className="modal-icon">◈</span><h3>{editingBill ? "Update Transaction" : "New Transaction"}</h3></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <select className="type-selector" value={type} onChange={e => setType(e.target.value)}>
                  <option value="Bill">Tax Bill</option><option value="Quotation">Quotation</option>
                </select>
                <button className="icon-close-btn" onClick={() => { setShowBilling(false); resetForm(); }}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              <div className="customer-row">
                <input className="field-input" placeholder="Customer Name *" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                <input className="field-input" placeholder="Phone" value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} />
                <input className="field-input" placeholder="Address" value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} />
              </div>
              <div className="items-section">
                <div className="items-header hide-mobile">
                  <span style={{ flex: 3 }}>Item Description</span>
                  <span style={{ flex: 1 }}>Unit</span><span style={{ flex: 1 }}>Rate</span>
                  <span style={{ flex: 1 }}>Qty</span><span style={{ flex: 1 }}>Value</span>
                  <span style={{ width: 32 }} />
                </div>
                <datalist id="stock-items">{inventory.map(i => <option key={i._id} value={i.name} />)}</datalist>
                {items.map((item, i) => (
                  <div key={i} className="item-row-bill">
                    <input style={{ flex: 3 }} className="field-input small" placeholder="Item name" list="stock-items" value={item.name} onChange={e => handleItemSelect(i, e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input small" placeholder="Unit" value={item.unit} onChange={e => updateItem(i, "unit", e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input small" type="number" placeholder="Rate" value={item.price} onChange={e => updateItem(i, "price", e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input small" type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                    <input style={{ flex: 1 }} className="field-input small readonly" type="number" placeholder="Value" value={item.value || ""} disabled />
                    <button className="remove-row-btn" onClick={() => removeItem(i)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="bill-totals-row">
                <div className="totals-inputs">
                  <label className="field-label">Freight <input type="number" className="field-input inline-num" value={freight} onChange={e => setFreight(Number(e.target.value))} /></label>
                  <label className="field-label">Advance <input type="number" className="field-input inline-num" value={payment} onChange={e => setPayment(Number(e.target.value))} /></label>
                </div>
                <div className="totals-summary">
                  <div className="total-line"><span>Subtotal</span><span>₹{totalItems.toFixed(2)}</span></div>
                  <div className="total-line"><span>Round Off</span><span>₹{roundOff.toFixed(2)}</span></div>
                  <div className="total-line grand"><span>Grand Total</span><span>₹{roundedTotal}</span></div>
                  <div className="total-line balance"><span>Balance Due</span><span>₹{balance}</span></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => { setShowBilling(false); resetForm(); }}>Cancel</button>
              <button className="btn-primary" onClick={createOrUpdateBill}>{editingBill ? "Update" : "Generate Bill"}</button>
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
            <p style={{ margin: 0 }}>Bill No: {bill?.billNumber || "N/A"}</p>
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
              {["#","Item Description","Unit","Rate (₹)","Qty","Value (₹)"].map(h => (
                <th key={h} style={{ padding: "10px", border: "1px solid #ddd", textAlign: h.includes("₹")||h==="Qty" ? "right" : "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderBottom: "2px solid #333" }}></tbody>
          <tfoot>
            {[["Freight","freight-value"],["Total","total-value"],["Round Off","roundoff-value"]].map(([l,c]) => (
              <tr key={l}><td colSpan="5" style={{ textAlign: "right", padding: "10px", fontWeight: "bold" }}>{l}</td><td className={c} style={{ textAlign: "right", padding: "10px" }}></td></tr>
            ))}
            <tr><td colSpan="5" style={{ textAlign: "right", padding: "10px", fontWeight: "bold", color: "#27ae60" }}>Advance</td><td className="advance-value" style={{ textAlign: "right", padding: "10px", color: "#27ae60" }}></td></tr>
            <tr style={{ backgroundColor: "#f8f9fa" }}><td colSpan="5" style={{ textAlign: "right", padding: "12px", fontWeight: "bold", fontSize: "16px", color: "#c0392b" }}>Balance Due</td><td className="balance-value" style={{ textAlign: "right", padding: "12px", fontWeight: "bold", fontSize: "16px", color: "#c0392b" }}></td></tr>
          </tfoot>
        </table>
      </div>

      <style jsx>{`
        /* ══════ DARK TOKENS ══════ */
        .shell.dark {
          --bg:           #0f1117;
          --bg2:          #161822;
          --surface:      #1e2130;
          --surface2:     #252840;
          --border:       rgba(255,255,255,0.07);
          --border-hover: rgba(255,255,255,0.16);
          --text:         #e8eaf6;
          --text-muted:   #7b82a8;
          --text-faint:   #4a506e;
          --input-bg:     #0f1117;
          --shadow:       0 4px 24px rgba(0,0,0,0.4);
          --shadow-lg:    0 16px 56px rgba(0,0,0,0.55);
        }
        /* ══════ LIGHT TOKENS ══════ */
        .shell.light {
          --bg:           #eef0f8;
          --bg2:          #ffffff;
          --surface:      #ffffff;
          --surface2:     #f2f4fc;
          --border:       rgba(0,0,0,0.08);
          --border-hover: rgba(0,0,0,0.18);
          --text:         #1a1d2e;
          --text-muted:   #555c80;
          --text-faint:   #9096b8;
          --input-bg:     #f7f8ff;
          --shadow:       0 4px 20px rgba(0,0,0,0.07);
          --shadow-lg:    0 12px 40px rgba(0,0,0,0.1);
        }
        /* ══════ SHARED TOKENS ══════ */
        .shell {
          --primary:       #6366f1;
          --primary-light: #818cf8;
          --primary-glow:  rgba(99,102,241,0.18);
          --green:         #10b981;
          --red:           #ef4444;
          --amber:         #f59e0b;
          --radius-sm:     8px;
          --radius:        14px;
          --radius-lg:     20px;
          --font:          'DM Sans','Segoe UI',sans-serif;
          --font-mono:     'JetBrains Mono','Fira Code',monospace;
          --sidebar-w:     240px;
          --topbar-h:      64px;
          --transition:    0.22s cubic-bezier(0.4,0,0.2,1);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ══════ SHELL ══════ */
        .shell { display: flex; height: 100vh; overflow: hidden; background: var(--bg); color: var(--text); font-family: var(--font); transition: background var(--transition), color var(--transition); }

        /* ══════ THEME TOGGLE ══════ */
        .theme-toggle { background: none; border: none; cursor: pointer; padding: 2px; display: flex; align-items: center; }
        .theme-track { width: 52px; height: 28px; border-radius: 14px; background: var(--surface2); border: 1px solid var(--border); display: flex; align-items: center; padding: 3px; position: relative; transition: background var(--transition); }
        .theme-thumb { width: 22px; height: 22px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; position: absolute; transition: left 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 8px var(--primary-glow); }
        .theme-thumb.day  { left: 3px; }
        .theme-thumb.night { left: 27px; }

        /* ══════ SIDEBAR ══════ */
        .sidebar { width: var(--sidebar-w); background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; transition: margin-left var(--transition), transform var(--transition), background var(--transition); z-index: 200; position: relative; }
        .sidebar.collapsed { margin-left: calc(-1 * var(--sidebar-w)); }
        .sidebar-brand { padding: 20px 18px; display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--border); min-height: var(--topbar-h); }
        .brand-logo { width: 36px; height: 36px; border-radius: 10px; object-fit: cover; flex-shrink: 0; box-shadow: 0 0 0 2px var(--primary); }
        .brand-monogram { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, var(--primary), var(--primary-light)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.1rem; flex-shrink: 0; box-shadow: 0 4px 12px var(--primary-glow); color: white; }
        .brand-text { flex: 1; overflow: hidden; }
        .brand-name { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .brand-sub { display: block; font-size: 0.7rem; color: var(--text-muted); }
        .sidebar-close { background: none; border: none; color: var(--text-faint); font-size: 1rem; cursor: pointer; padding: 4px; transition: color var(--transition); }
        .sidebar-close:hover { color: var(--text); }
        .sidebar-nav { flex: 1; padding: 16px 10px; display: flex; flex-direction: column; gap: 4px; }
        .nav-item { position: relative; display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: var(--radius-sm); background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.875rem; font-family: var(--font); text-align: left; width: 100%; transition: background var(--transition), color var(--transition); }
        .nav-item:hover { background: var(--surface2); color: var(--text); }
        .nav-item.active { background: var(--primary-glow); color: var(--primary-light); font-weight: 600; }
        .nav-icon { font-size: 1.1rem; width: 20px; text-align: center; flex-shrink: 0; }
        .nav-label { flex: 1; }
        .nav-indicator { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 60%; background: var(--primary); border-radius: 2px 0 0 2px; animation: slideInd 0.2s ease; }
        @keyframes slideInd { from { opacity: 0; height: 0 } to { opacity: 1; height: 60% } }
        .sidebar-footer { padding: 10px; border-top: 1px solid var(--border); }
        .settings-nav-btn { width: 100%; padding: 10px 14px; border-radius: var(--radius-sm); background: none; border: none; color: var(--text-muted); cursor: pointer; font-family: var(--font); font-size: 0.875rem; display: flex; align-items: center; gap: 10px; transition: background var(--transition), color var(--transition); }
        .settings-nav-btn:hover { background: var(--surface2); color: var(--text); }

        /* ══════ MAIN AREA ══════ */
        .main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
        .topbar { height: var(--topbar-h); background: var(--bg2); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; flex-shrink: 0; z-index: 100; transition: background var(--transition); }
        .topbar-left { display: flex; align-items: center; gap: 16px; }
        .menu-toggle { display: flex; flex-direction: column; gap: 4px; background: none; border: none; cursor: pointer; padding: 6px; }
        .menu-toggle span { display: block; width: 20px; height: 2px; background: var(--text-muted); border-radius: 2px; transition: background var(--transition); }
        .menu-toggle:hover span { background: var(--text); }
        .breadcrumb-root { font-size: 1.05rem; font-weight: 600; color: var(--text); }
        .topbar-right { display: flex; align-items: center; gap: 12px; }
        .user-chip { display: flex; align-items: center; gap: 10px; padding: 6px 12px; background: var(--surface2); border-radius: 40px; border: 1px solid var(--border); }
        .user-avatar-chip { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, var(--primary), var(--primary-light)); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; color: white; }
        .user-chip-text { display: flex; flex-direction: column; }
        .chip-name { font-size: 0.78rem; font-weight: 600; color: var(--text); line-height: 1.2; }
        .chip-role { font-size: 0.68rem; color: var(--text-muted); }
        .logout-pill { padding: 7px 14px; border-radius: 40px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; cursor: pointer; font-size: 0.8rem; font-family: var(--font); display: flex; align-items: center; gap: 6px; transition: background var(--transition), border-color var(--transition); }
        .logout-pill:hover { background: rgba(239,68,68,0.2); border-color: rgba(239,68,68,0.5); }

        /* ══════ CONTENT AREA ══════ */
        .content-area { flex: 1; min-height: 0; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .content-area::-webkit-scrollbar { width: 15px; }
        .content-area::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 10px; }

        /* ══════ STAT CARDS ══════ */
        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; flex-shrink: 0; }
        .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; display: flex; align-items: center; gap: 16px; position: relative; overflow: hidden; animation: fadeUp 0.4s ease both; animation-delay: var(--delay, 0s); transition: border-color var(--transition), transform var(--transition), background var(--transition); }
        .stat-card:hover { border-color: var(--border-hover); transform: translateY(-2px); }
        .stat-card-icon { width: 44px; height: 44px; border-radius: 12px; background: color-mix(in srgb, var(--accent) 15%, transparent); display: flex; align-items: center; justify-content: center; font-size: 1.3rem; color: var(--accent); flex-shrink: 0; }
        .stat-card-content { flex: 1; min-width: 0; }
        .stat-card-label { display: block; font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
        .stat-card-value { display: block; font-size: 1.35rem; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }
        .stat-card-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: color-mix(in srgb, var(--accent) 40%, transparent); transform: scaleX(0); transform-origin: left; animation: barReveal 0.6s ease both; animation-delay: calc(var(--delay, 0s) + 0.2s); }
        @keyframes barReveal { to { transform: scaleX(1); } }

        /* ══════ ADS ══════ */
        .ads-strip { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 4px; flex-shrink: 0; }
        .ads-strip::-webkit-scrollbar { height: 4px; }
        .ads-strip::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 10px; }
        .ad-tile { min-width: 280px; height: 180px; border-radius: var(--radius); overflow: hidden; border: 1px solid var(--border); flex-shrink: 0; transition: transform var(--transition); }
        .ad-tile:hover { transform: scale(1.02); }
        .ad-tile img { width: 100%; height: 100%; object-fit: cover; }

        /* ══════ SECTION CARD ══════ */
        .section-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; transition: background var(--transition); }

        /* ══════ BILLS SECTION — SCROLLING FIX ══════
           The card is a bounded flex column.
           bills-fixed-top stays put — it never scrolls.
           bill-grid-scroll fills remaining height and scrolls.
        ═══════════════════════════════════════════════ */
        .bills-section-card {
          display: flex;
          flex-direction: column;
          flex: 1;               /* fills remaining space in content-area */
          min-height: 0;         /* lets flex child shrink */
          overflow: hidden;      /* clip children */
        }
        .bills-fixed-top {
          flex-shrink: 0;        /* never compress */
        }
        .bill-grid-scroll {
          flex: 1;
          min-height: 0;         /* CRITICAL — without this flex won't shrink here */
          overflow-y: auto;
          overflow-x: hidden;
        }
        .bill-grid-scroll::-webkit-scrollbar { width: 5px; }
        .bill-grid-scroll::-webkit-scrollbar-track { background: transparent; }
        .bill-grid-scroll::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 10px; }

        .section-header { padding: 20px 24px; display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 1px solid var(--border); gap: 16px; flex-wrap: wrap; }
        .section-title { font-size: 1.1rem; font-weight: 700; color: var(--text); }
        .section-sub { font-size: 0.78rem; color: var(--text-muted); margin-top: 3px; }
        .section-actions { display: flex; gap: 10px; align-items: center; }

        /* ══════ BUTTONS ══════ */
        .btn-primary { padding: 9px 20px; border-radius: var(--radius-sm); background: var(--primary); border: none; color: white; font-size: 0.85rem; font-weight: 600; font-family: var(--font); cursor: pointer; transition: background var(--transition), transform var(--transition), box-shadow var(--transition); display: flex; align-items: center; gap: 6px; }
        .btn-primary:hover { background: var(--primary-light); transform: translateY(-1px); box-shadow: 0 4px 16px var(--primary-glow); }
        .btn-primary:active { transform: translateY(0); }
        .btn-primary.loading { opacity: 0.7; pointer-events: none; }
        .btn-outline { padding: 9px 16px; border-radius: var(--radius-sm); background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem; font-family: var(--font); cursor: pointer; transition: all var(--transition); }
        .btn-outline:hover, .btn-outline.active { background: var(--surface2); border-color: var(--primary); color: var(--primary-light); }
        .btn-ghost { padding: 9px 18px; border-radius: var(--radius-sm); background: transparent; border: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem; font-family: var(--font); cursor: pointer; transition: all var(--transition); }
        .btn-ghost:hover { background: var(--surface2); color: var(--text); }
        .btn-ghost.small { padding: 6px 12px; font-size: 0.78rem; }

        /* ══════ SEARCH + FILTER ══════ */
        .search-bar-wrap { padding: 14px 24px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
        .search-icon { color: var(--text-faint); font-size: 1.1rem; }
        .search-bar { flex: 1; background: none; border: none; outline: none; color: var(--text); font-size: 0.9rem; font-family: var(--font); }
        .search-bar::placeholder { color: var(--text-faint); }
        .filter-row { padding: 12px 24px; display: flex; flex-wrap: wrap; gap: 10px; align-items: center; border-bottom: 1px solid var(--border); background: var(--bg2); animation: filterSlide 0.2s ease; }
        @keyframes filterSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
        .filter-chip { padding: 7px 12px; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--border); color: var(--text); font-size: 0.8rem; font-family: var(--font); outline: none; cursor: pointer; }
        .filter-chip:focus { border-color: var(--primary); }
        .filter-sep { color: var(--text-faint); font-size: 0.85rem; }

        /* ══════ BILL GRID + CARDS ══════ */
        .bill-grid { padding: 20px 24px; display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .bill-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px; transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition), background var(--transition); animation: cardReveal 0.35s ease both; animation-delay: var(--card-delay, 0s); position: relative; overflow: hidden; }
        .bill-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 3px 0 0 3px; background: var(--primary); transition: background var(--transition); }
        .bill-card.quotation::before { background: var(--amber); }
        .bill-card.settled::before { background: var(--green); }
        .bill-card.owing::before { background: var(--red); }
        .bill-card:hover { border-color: var(--border-hover); transform: translateY(-3px); box-shadow: var(--shadow); }
        @keyframes cardReveal { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .bill-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .type-badge { padding: 3px 9px; border-radius: 20px; font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(99,102,241,0.15); color: var(--primary-light); }
        .type-badge.quotation { background: rgba(245,158,11,0.15); color: var(--amber); }
        .bill-date { font-size: 0.72rem; color: var(--text-faint); }
        .bill-number { font-size: 0.72rem; color: var(--text-muted); margin-bottom: 6px; font-family: var(--font-mono); }
        .bill-customer { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .bill-amount { font-size: 1.4rem; font-weight: 800; color: var(--text); margin-bottom: 8px; font-variant-numeric: tabular-nums; }
        .bill-status { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 600; margin-bottom: 14px; }
        .bill-status.paid { color: var(--green); }
        .bill-status.pending { color: var(--red); }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
        .bill-actions { display: flex; gap: 6px; border-top: 1px solid var(--border); padding-top: 12px; }
        .action-btn { flex: 1; padding: 7px 4px; border-radius: 6px; background: var(--surface2); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; font-size: 0.85rem; transition: all var(--transition); }
        .action-btn:hover { background: var(--surface); color: var(--text); border-color: var(--border-hover); }
        .action-btn.green:hover { background: rgba(16,185,129,0.15); color: var(--green); }
        .action-btn.red:hover { background: rgba(239,68,68,0.15); color: var(--red); }

        /* ══════ DATA TABLE ══════ */
        .data-table-wrap { overflow-x: auto; }
        .data-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .data-table th { padding: 12px 20px; text-align: left; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-faint); border-bottom: 1px solid var(--border); background: var(--bg2); }
        .data-table td { padding: 14px 20px; border-bottom: 1px solid var(--border); font-size: 0.875rem; color: var(--text-muted); vertical-align: middle; }
        .data-table tbody tr { transition: background var(--transition); }
        .data-table tbody tr:hover { background: var(--surface2); }
        .table-row-animate { animation: tableRow 0.3s ease both; animation-delay: var(--row-delay, 0s); }
        @keyframes tableRow { from{opacity:0}to{opacity:1} }
        .item-name { color: var(--text); font-weight: 600; }
        .unit-chip { padding: 2px 8px; border-radius: 4px; background: var(--surface2); font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono); }
        .cat-chip { padding: 3px 10px; border-radius: 20px; background: rgba(99,102,241,0.12); color: var(--primary-light); font-size: 0.72rem; font-weight: 600; }
        .stock-badge { padding: 3px 10px; border-radius: 20px; font-size: 0.72rem; font-weight: 700; }
        .stock-badge.ok { background: rgba(16,185,129,0.1); color: var(--green); }
        .stock-badge.low { background: rgba(239,68,68,0.1); color: var(--red); }
        .expense-amount { color: var(--red); font-weight: 700; }
        .empty-row { text-align: center; padding: 40px; color: var(--text-faint); }
        .table-actions { display: flex; gap: 6px; }
        .tbl-btn { padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border); cursor: pointer; font-size: 0.78rem; font-family: var(--font); transition: all var(--transition); }
        .tbl-btn.edit { background: rgba(99,102,241,0.08); color: var(--primary-light); }
        .tbl-btn.edit:hover { background: rgba(99,102,241,0.2); }
        .tbl-btn.del { background: rgba(239,68,68,0.08); color: #ef4444; }
        .tbl-btn.del:hover { background: rgba(239,68,68,0.2); }

        /* ══════ EMPTY STATE ══════ */
        .empty-state { grid-column: 1/-1; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .empty-icon { font-size: 2.5rem; color: var(--text-faint); }
        .empty-state p { color: var(--text-faint); font-size: 0.9rem; }

        /* ══════ MODALS ══════ */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; animation: overlayIn 0.2s ease; }
        @keyframes overlayIn { from{opacity:0}to{opacity:1} }
        .animate-modal { animation: modalIn 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes modalIn { from{opacity:0;transform:scale(0.94) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)} }
        .modal-panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); width: 100%; max-width: 620px; max-height: 92vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
        .modal-panel::-webkit-scrollbar { width: 4px; }
        .modal-panel::-webkit-scrollbar-thumb { background: var(--surface2); }
        .billing-modal { max-width: 860px; }
        .settings-modal { max-width: 520px; }
        .modal-header { padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 10; }
        .modal-title-group { display: flex; align-items: center; gap: 10px; }
        .modal-icon { font-size: 1.2rem; }
        .modal-header h3 { font-size: 1rem; font-weight: 700; color: var(--text); margin: 0; }
        .icon-close-btn { width: 30px; height: 30px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; font-size: 0.75rem; transition: all var(--transition); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-close-btn:hover { background: rgba(239,68,68,0.2); color: var(--red); }
        .modal-body { padding: 24px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; position: sticky; bottom: 0; background: var(--surface); z-index: 10; }

        /* ══════ FORM ELEMENTS ══════ */
        .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .form-grid-1 { display: flex; flex-direction: column; gap: 16px; }
        .settings-form-grid { display: flex; flex-direction: column; gap: 16px; }
        .full-width { grid-column: 1/-1; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .field-input { padding: 10px 14px; border-radius: var(--radius-sm); background: var(--input-bg); border: 1px solid var(--border); color: var(--text); font-size: 0.875rem; font-family: var(--font); outline: none; transition: border-color var(--transition), background var(--transition); width: 100%; }
        .field-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .field-input.readonly { background: var(--surface2); color: var(--text-faint); cursor: not-allowed; }
        .field-input.small { padding: 8px 10px; font-size: 0.82rem; }
        .customer-row { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .customer-row .field-input { flex: 1; min-width: 140px; }
        .type-selector { padding: 8px 12px; border-radius: var(--radius-sm); background: var(--surface2); border: 1px solid var(--border); color: var(--text); font-size: 0.82rem; font-family: var(--font); outline: none; }
        .items-section { margin-bottom: 20px; }
        .items-header { display: flex; gap: 8px; padding: 0 0 8px 0; border-bottom: 1px solid var(--border); margin-bottom: 8px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-faint); }
        .item-row-bill { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
        .remove-row-btn { width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); color: var(--red); cursor: pointer; font-size: 0.7rem; transition: all var(--transition); display: flex; align-items: center; justify-content: center; }
        .remove-row-btn:hover { background: rgba(239,68,68,0.25); }
        .bill-totals-row { display: flex; gap: 20px; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; }
        .totals-inputs { display: flex; flex-direction: column; gap: 12px; }
        .field-label.inline-num { display: flex; align-items: center; gap: 10px; }
        .field-input.inline-num { width: 100px; }
        .totals-summary { min-width: 220px; }
        .total-line { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 0.85rem; color: var(--text-muted); }
        .total-line.grand { font-size: 1rem; font-weight: 700; color: var(--primary-light); padding: 10px 0; border-color: var(--primary-glow); }
        .total-line.balance { font-size: 0.9rem; font-weight: 700; color: var(--red); border-bottom: none; }

        /* ══════ LOGO UPLOAD ══════ */
        .logo-upload-area { display: flex; align-items: center; gap: 16px; }
        .logo-preview-box { width: 72px; height: 72px; border-radius: var(--radius-sm); background: var(--input-bg); border: 1px dashed var(--border); overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .logo-preview-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
        .logo-placeholder { display: flex; flex-direction: column; align-items: center; gap: 4px; color: var(--text-faint); }
        .logo-placeholder span { font-size: 1.5rem; }
        .logo-placeholder p { font-size: 0.65rem; }
        .upload-btn-label { padding: 9px 16px; border-radius: var(--radius-sm); background: var(--surface2); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; font-size: 0.82rem; transition: all var(--transition); display: inline-block; }
        .upload-btn-label:hover { background: var(--primary-glow); border-color: var(--primary); color: var(--primary-light); }

        /* ══════ MISC ══════ */
        .sidebar-scrim { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 199; backdrop-filter: blur(2px); animation: overlayIn 0.2s ease; }
        .fade-up { animation: fadeUp 0.3s ease; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }
        .animate-down { animation: filterSlide 0.2s ease; }

        /* ══════ RESPONSIVE ══════ */
        @media (max-width: 1100px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 900px) {
          .sidebar { position: fixed; left: 0; top: 0; bottom: 0; margin-left: 0; z-index: 300; }
          .sidebar.collapsed { transform: translateX(-100%); margin-left: 0; }
          .sidebar.open { transform: translateX(0); }
          .user-chip-text { display: none; }
        }
        @media (max-width: 600px) {
          .stats-row { grid-template-columns: 1fr; }
          .customer-row { flex-direction: column; }
          .item-row-bill { flex-wrap: wrap; }
          .bill-totals-row { flex-direction: column; }
          .form-grid-2 { grid-template-columns: 1fr; }
          .content-area { padding: 16px; gap: 16px; }
          .modal-body { padding: 16px; }
          .topbar { padding: 0 16px; }
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}