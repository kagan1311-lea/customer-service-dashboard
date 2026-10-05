# Customer Service Dashboard

Repo: https://github.com/kagan1311-lea/customer-service-dashboard

Live demo (GitHub Pages): https://kagan1311-lea.github.io/customer-service-dashboard/

A static, single-page dashboard for visualizing customer service tickets. Hebrew (RTL) UI, built with vanilla HTML/CSS/JS and [Chart.js](https://www.chartjs.org/).

## Features

- KPI summary cards
- Charts: tickets by status, 14-day ticket volume, tickets by channel
- Ticket table with search and filters (status, priority, channel, agent)
- Ticket detail modal

## Getting started

No build step or dependencies to install — just open `index.html` in a browser, or serve the folder with any static file server:

```bash
npx serve .
```

## Project structure

- `index.html` — page markup
- `style.css` — styling
- `data.js` — demo ticket data
- `app.js` — dashboard logic (rendering, filtering, charts)
