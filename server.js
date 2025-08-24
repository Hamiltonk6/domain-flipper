const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");

const app = express();
app.use(cors());

// quick health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Google Trends (UK + US/global)
app.get("/api/trends", async (req, res) => {
  try {
    const [uk, us] = await Promise.all([
      axios.get("https://trends.google.com/trends/trendingsearches/daily/rss?geo=GB", { responseType: "text" }),
      axios.get("https://trends.google.com/trends/trendingsearches/daily/rss?geo=US", { responseType: "text" })
    ]);

    const pickTitles = (rssText) =>
      Array.from(rssText.matchAll(/<title>(.*?)<\/title>/g))
        .map(m => m[1])
        .slice(1, 10); // skip channel title

    res.json({ uk: pickTitles(uk.data), global: pickTitles(us.data) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Expiring domains (simple scraper; may be rate-limited by site)
app.get("/api/expired", async (req, res) => {
  try {
    const { data: html } = await axios.get(
      "https://www.expireddomains.net/backorder-expired-domains/",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const $ = cheerio.load(html);
    const rows = [];
    $("table.base1 tr").slice(1, 60).each((i, el) => {
      const d = $(el).find("td.field_domain a").text().trim();
      if (d && !d.includes("xn--")) rows.push(d);
    });
    res.json({ expired: rows.slice(0, 20) });
  } catch (e) {
    // fallback if site blocks scraping
    res.json({
      expired: [
        "greentechfinder.com",
        "petgpstracker.co.uk",
        "sleephacks.co.uk",
        "microaihub.com",
        "budgettravelguide.co.uk"
      ],
      note: "Live source blocked or rate-limited; showing fallback examples."
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
