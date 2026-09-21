// נתוני דמו לדשבורד שירות לקוחות

const STATUSES = ["פתוח", "בטיפול", "ממתין ללקוח", "סגור", "נפתח מחדש"];
const PRIORITIES = ["נמוכה", "רגילה", "גבוהה", "דחופה"];
const CHANNELS = ["מייל", "צ'אט", "טלפון", "פורום"];
const CATEGORIES = ["חיוב ותשלומים", "בעיה טכנית", "משלוח", "החזר כספי", "שאלה כללית", "ביטול מנוי"];
const AGENTS = ["נועה כהן", "איתי לוי", "מיכל בר", "דניאל אזולאי", "שירה גבאי"];
const COMPANIES = ["טכנולייט בע\"מ", "גרין פודס", "אופיס פלוס", "מדיה סטאר", "נטוורק סול", "פרטי"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString("he-IL") + " " + d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

const FIRST_NAMES = ["יעל", "עומר", "טל", "רותם", "אביב", "הדר", "ליאור", "נועם", "שני", "גיא", "מאיה", "דור", "אורי", "ניצן", "רון"];
const LAST_NAMES = ["כהן", "לוי", "מזרחי", "פרץ", "ביטון", "אזולאי", "דהן", "אוחיון", "גבאי", "שרעבי"];

const CUSTOMERS = Array.from({ length: 25 }).map((_, i) => {
  const first = randomFrom(FIRST_NAMES);
  const last = randomFrom(LAST_NAMES);
  const name = `${first} ${last}`;
  return {
    id: `C-${1000 + i}`,
    name,
    email: `${first}.${last}@example.co.il`.toLowerCase(),
    phone: `05${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 8999999)}`,
    company: randomFrom(COMPANIES),
  };
});

const SUBJECTS = [
  "החיוב החודשי כפול", "האתר לא נטען אצלי", "המשלוח מתעכב", "רוצה לבטל את המנוי",
  "בקשה להחזר כספי", "שגיאה בעת התחברות", "המוצר הגיע פגום", "שינוי פרטי חשבון",
  "שאלה לגבי חבילת שירות", "לא קיבלתי אימות במייל", "בעיה באפליקציה הניידת",
  "עדכון אמצעי תשלום", "בקשה לחשבונית מס", "תמיכה בהתקנה", "תקלה בסנכרון נתונים",
];

function generateTickets(count) {
  const tickets = [];
  for (let i = 0; i < count; i++) {
    const customer = randomFrom(CUSTOMERS);
    const created = randomDate(30);
    const status = randomFrom(STATUSES);
    const priority = randomFrom(PRIORITIES);
    const slaHours = priority === "דחופה" ? 2 : priority === "גבוהה" ? 8 : priority === "רגילה" ? 24 : 48;
    const slaDue = new Date(created.getTime() + slaHours * 3600 * 1000);
    const isClosed = status === "סגור";
    const csat = isClosed && Math.random() > 0.3 ? Math.floor(1 + Math.random() * 5) : null;
    const now = new Date();
    const breached = !isClosed && slaDue < now;

    tickets.push({
      id: `T-${20000 + i}`,
      customerId: customer.id,
      customerName: customer.name,
      subject: randomFrom(SUBJECTS),
      channel: randomFrom(CHANNELS),
      status,
      priority,
      category: randomFrom(CATEGORIES),
      agent: randomFrom(AGENTS),
      created,
      createdLabel: formatDate(created),
      updatedLabel: formatDate(randomDate(5)),
      slaDue,
      slaDueLabel: formatDate(slaDue),
      slaBreached: breached,
      csat,
    });
  }
  return tickets.sort((a, b) => b.created - a.created);
}

const TICKETS = generateTickets(38);

function getCustomerById(id) {
  return CUSTOMERS.find((c) => c.id === id);
}

function getTicketsByCustomer(customerId) {
  return TICKETS.filter((t) => t.customerId === customerId);
}
