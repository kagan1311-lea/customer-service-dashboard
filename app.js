// לוגיקת הדשבורד: KPIs, גרפים, טבלה, סינון ומודאל פרטי לקוח

const state = {
  search: "",
  status: "",
  priority: "",
  channel: "",
  agent: "",
};

function slugify(text) {
  return text.replace(/\s+/g, "_");
}

function uniqueValues(key) {
  return Array.from(new Set(TICKETS.map((t) => t[key]).filter(Boolean)));
}

function populateFilterOptions() {
  const map = [
    ["statusFilter", "status", "כל הסטטוסים"],
    ["priorityFilter", "priority", "כל העדיפויות"],
    ["channelFilter", "channel", "כל הערוצים"],
    ["agentFilter", "agent", "כל הסוכנים"],
  ];
  map.forEach(([id, key, allLabel]) => {
    const select = document.getElementById(id);
    select.innerHTML = `<option value="">${allLabel}</option>`;
    uniqueValues(key).forEach((v) => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
    select.value = state[key] || "";
  });
}

function getFilteredTickets() {
  return TICKETS.filter((t) => {
    if (state.status && t.status !== state.status) return false;
    if (state.priority && t.priority !== state.priority) return false;
    if (state.channel && t.channel !== state.channel) return false;
    if (state.agent && t.agent !== state.agent) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const haystack = `${t.id} ${t.customerName} ${t.subject}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function renderKPIs() {
  const open = TICKETS.filter((t) => t.status === "פתוח" || t.status === "נפתח מחדש").length;
  const unassignedLike = TICKETS.filter((t) => t.status !== "סגור").length;
  const breached = TICKETS.filter((t) => t.slaBreached).length;
  const closedWithCsat = TICKETS.filter((t) => t.csat !== null);
  const avgCsat = closedWithCsat.length
    ? (closedWithCsat.reduce((s, t) => s + t.csat, 0) / closedWithCsat.length).toFixed(1)
    : "—";
  const slaCompliance = TICKETS.length
    ? Math.round(((TICKETS.length - breached) / TICKETS.length) * 100)
    : 100;

  const kpis = [
    { label: "פניות פתוחות", value: open, cls: "" },
    { label: "פניות בטיפול (לא סגורות)", value: unassignedLike, cls: "" },
    { label: "חריגות SLA", value: breached, cls: breached > 0 ? "warn" : "good" },
    { label: "עמידה ב-SLA", value: slaCompliance + "%", cls: slaCompliance >= 90 ? "good" : "warn" },
    { label: "CSAT ממוצע (מתוך 5)", value: avgCsat, cls: "" },
  ];

  const grid = document.getElementById("kpiGrid");
  grid.innerHTML = kpis
    .map(
      (k) => `
    <div class="kpi-card ${k.cls}">
      <div class="kpi-value">${k.value}</div>
      <div class="kpi-label">${k.label}</div>
    </div>`
    )
    .join("");
}

function renderTable() {
  const filtered = getFilteredTickets();
  const body = document.getElementById("ticketsBody");
  body.innerHTML = filtered
    .map(
      (t) => `
    <tr data-id="${t.id}">
      <td>${t.id}</td>
      <td>${t.customerName}</td>
      <td>${t.subject}</td>
      <td>${t.channel}</td>
      <td><span class="badge badge-status-${slugify(t.status)}">${t.status}</span></td>
      <td><span class="badge badge-priority-${slugify(t.priority)}">${t.priority}</span></td>
      <td>${t.agent}</td>
      <td>${t.createdLabel}</td>
      <td class="${t.slaBreached ? "sla-breached" : "sla-ok"}">${t.slaBreached ? "חריגה" : "תקין"}</td>
    </tr>`
    )
    .join("");

  document.getElementById("tableFooter").textContent = `מציג ${filtered.length} מתוך ${TICKETS.length} פניות`;

  body.querySelectorAll("tr").forEach((row) => {
    row.addEventListener("click", () => openModal(row.dataset.id));
  });
}

function openModal(ticketId) {
  const ticket = TICKETS.find((t) => t.id === ticketId);
  const history = TICKETS.filter(
    (t) => t.customerName === ticket.customerName && t.id !== ticket.id
  );

  document.getElementById("modalContent").innerHTML = `
    <h2>${ticket.customerName || "—"}</h2>
    <div class="modal-sub">${ticket.company || "—"} · פנייה נוכחית: ${ticket.id}</div>

    <div class="field-row"><span>אימייל</span><span>${ticket.email || "—"}</span></div>
    <div class="field-row"><span>טלפון</span><span>${ticket.phone || "—"}</span></div>
    <div class="field-row"><span>נושא הפנייה</span><span>${ticket.subject}</span></div>
    <div class="field-row"><span>קטגוריה</span><span>${ticket.category}</span></div>
    <div class="field-row"><span>ערוץ</span><span>${ticket.channel}</span></div>
    <div class="field-row"><span>סטטוס</span><span>${ticket.status}</span></div>
    <div class="field-row"><span>עדיפות</span><span>${ticket.priority}</span></div>
    <div class="field-row"><span>סוכן מטופל</span><span>${ticket.agent}</span></div>
    <div class="field-row"><span>נוצרה</span><span>${ticket.createdLabel}</span></div>
    <div class="field-row"><span>יעד SLA</span><span>${ticket.slaDueLabel}</span></div>

    <div class="history">
      <h4>היסטוריית פניות של הלקוח (${history.length})</h4>
      ${history
        .map(
          (h) => `<div class="history-item">${h.id} · ${h.subject} · ${h.status} · ${h.createdLabel}</div>`
        )
        .join("")}
    </div>
  `;
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

let statusChart, volumeChart, channelChart;

function renderCharts() {
  [statusChart, volumeChart, channelChart].forEach((c) => c && c.destroy());

  const statuses = uniqueValues("status");
  const channels = uniqueValues("channel");
  const statusCounts = statuses.map((s) => TICKETS.filter((t) => t.status === s).length);
  const channelCounts = channels.map((c) => TICKETS.filter((t) => t.channel === c).length);

  const days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const volumeCounts = days.map((d) => {
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    return TICKETS.filter((t) => t.created >= d && t.created < next).length;
  });
  const dayLabels = days.map((d) => d.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" }));

  const palette = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#22c55e", "#ef4444"];

  statusChart = new Chart(document.getElementById("statusChart"), {
    type: "doughnut",
    data: {
      labels: statuses,
      datasets: [{ data: statusCounts, backgroundColor: palette }],
    },
    options: { plugins: { legend: { position: "bottom", labels: { font: { size: 10 } } } } },
  });

  volumeChart = new Chart(document.getElementById("volumeChart"), {
    type: "line",
    data: {
      labels: dayLabels,
      datasets: [
        {
          label: "פניות חדשות",
          data: volumeCounts,
          borderColor: "#4f46e5",
          backgroundColor: "rgba(79,70,229,0.1)",
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });

  channelChart = new Chart(document.getElementById("channelChart"), {
    type: "bar",
    data: {
      labels: channels,
      datasets: [{ label: "פניות", data: channelCounts, backgroundColor: "#0ea5e9" }],
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
  });
}

function showLoadError(message) {
  const box = document.getElementById("loadError");
  if (!message) {
    box.hidden = true;
    box.textContent = "";
    return;
  }
  box.hidden = false;
  box.textContent = message;
}

function attachFilterEvents() {
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderTable();
  });
  ["statusFilter", "priorityFilter", "channelFilter", "agentFilter"].forEach((id) => {
    document.getElementById(id).addEventListener("change", (e) => {
      const key = id.replace("Filter", "");
      state[key] = e.target.value;
      renderTable();
    });
  });
  document.getElementById("resetFilters").addEventListener("click", () => {
    state.search = "";
    state.status = "";
    state.priority = "";
    state.channel = "";
    state.agent = "";
    document.getElementById("searchInput").value = "";
    ["statusFilter", "priorityFilter", "channelFilter", "agentFilter"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
    renderTable();
  });
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "modalOverlay") closeModal();
  });
}

const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

async function refreshData() {
  try {
    await loadTickets();
    showLoadError(null);
  } catch (err) {
    showLoadError(err.message || "שגיאה בטעינת הפניות מ-Supabase.");
    return;
  }
  document.getElementById("lastUpdate").textContent = new Date().toLocaleString("he-IL");
  populateFilterOptions();
  renderKPIs();
  renderCharts();
  renderTable();
}

function init() {
  attachFilterEvents();
  refreshData();
  setInterval(refreshData, AUTO_REFRESH_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);
