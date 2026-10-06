// שכבת נתונים: שליפת פניות שירות מ-Supabase

const SUPABASE_URL = "https://cltwytmvgxbbvdkyuegj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsdHd5dG12Z3hiYnZka3l1ZWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyOTA4MzMsImV4cCI6MjEwNjg2NjgzM30.6blRgdHvpJMwzuaeKXuV-NAGXhk-_GBols66MhfLS-A";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function formatDate(d) {
  return d.toLocaleDateString("he-IL") + " " + d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

let TICKETS = [];

async function loadTickets() {
  const { data, error } = await supabaseClient
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message || "שגיאה בטעינת הפניות מ-Supabase.");
  }

  TICKETS = (data || []).map((row) => {
    const created = new Date(row.created_at);
    const slaDue = new Date(row.sla_due);
    return {
      id: row.id,
      customerName: row.customer_name,
      email: row.email || "",
      phone: row.phone || "",
      company: row.company || "",
      subject: row.subject,
      channel: row.channel,
      status: row.status,
      priority: row.priority,
      category: row.category,
      agent: row.agent,
      created,
      createdLabel: formatDate(created),
      slaDue,
      slaDueLabel: formatDate(slaDue),
      slaBreached: row.sla_breached,
      csat: row.csat,
    };
  });

  return TICKETS;
}
