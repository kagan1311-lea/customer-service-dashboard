# Customer Service Dashboard — Electronics Store

## Who

- **Customer service manager** — reviews overall performance across the team: open vs. closed tickets, SLA breaches, CSAT, volume trends. Needs a fast, trustworthy overview to report on and act on.
- **Team leads** — monitor their team's queue day to day: ticket status, priority, workload per agent, and which tickets need attention now.
- Not users: **individual customers** (they never see this dashboard), and **customer service agents working a single ticket** (this is an oversight tool, not a ticket-handling/reply tool).

## What it is / is not

**It is** a read-and-manage oversight dashboard for the store's customer service tickets: KPI summary, trend charts, a filterable/searchable ticket table, ticket detail view, and the ability to import ticket data from a CSV/Excel file.

**It is not:**
- a ticketing system for agents to reply to or resolve tickets
- a live chat or customer-facing support channel
- an inventory, order-fulfillment, or product-return system
- a payments or billing system
- an HR or agent-performance-review tool

## Where

Browser-based web app. Desktop-first (manager/team-lead workstation), and it must also read and work well on mobile (checking the queue from a phone). One app, responsive layout — no separate mobile app.

**No server.** Static client-side only: plain HTML/CSS/JS, no backend, no build step, no server-side code or database. It must run by opening `index.html` directly (or serving the folder as static files) — nothing to deploy or host beyond that. Any data (demo or uploaded) lives and is processed entirely in the browser.

## Design

Follow the look already established in the repository's initial commit (`style.css`, `index.html`) — don't introduce a new visual style:

- **Language/direction:** Hebrew, RTL (`dir="rtl"`). All text is in Hebrew and right-aligned.
- **Font:** `"Segoe UI", Arial, sans-serif`.
- **Palette** (CSS variables in `:root`): background `#f4f6f9`, cards `#ffffff`, text `#1f2937` / muted `#6b7280`, border `#e5e7eb`, primary `#4f46e5`, accent `#0ea5e9`, status colors green `#16a34a` / yellow `#d97706` / red `#dc2626`.
- **Header:** gradient bar (`linear-gradient(90deg, #4f46e5, #6366f1)`), white text.
- **Cards:** white background, `12px` radius, soft shadow (`--shadow`), consistent padding — used for KPI tiles, charts, and the table section.
- **Components:** pill-shaped status/priority badges, rounded inputs/buttons matching `--radius`, subtle hover states (row highlight, button darken).

New features (filters, buttons, modals, etc.) should reuse these existing CSS variables and component patterns rather than inventing new colors, fonts, or card styles.

## Features

**Must**
- View KPI summary (open tickets, SLA breaches, avg. resolution time, CSAT)
- View ticket volume and status trend charts
- See a table of all tickets, searchable and filterable by status, priority, channel, and agent
- Open a ticket to see its full details
- Upload a CSV or Excel file to load/replace ticket data into the dashboard

**Should**
- Filter/search by date range and category
- Sort the ticket table by any column
- Highlight tickets that have breached SLA

**Later**
- Export filtered views back to CSV/Excel
- Per-agent workload and performance breakdown
- Scheduled/automatic data refresh from an external system

## Done means

**Feature: Upload CSV/Excel**
- Clicking the upload button opens a file picker accepting `.csv`, `.xls`, and `.xlsx`.
- A valid file replaces the current ticket dataset and the dashboard (KPIs, charts, table) updates within 2 seconds.
- An invalid or unreadable file shows a clear error message and leaves the existing data unchanged.

**Feature: Filter/search the ticket table**
- Selecting a status, priority, channel, or agent filter narrows the table to only matching tickets immediately.
- Typing in the search box filters by customer name or subject as the user types.
- Clearing all filters restores the full ticket list.

**Feature: Responsive layout**
- On a desktop-width screen, KPIs, charts, and the table are all visible without horizontal scrolling.
- On a mobile-width screen, the same data is readable and usable (stacked layout, no overlapping elements, no horizontal scroll).

**Feature: Ticket detail view**
- Clicking a ticket row opens its details (customer, subject, status, priority, channel, agent, dates, CSAT) without leaving the page.
