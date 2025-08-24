const PASSWORD = "flip2025";

function checkPassword() {
  const input = document.getElementById("password").value.trim();
  if (input === PASSWORD) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadTrends();
  } else {
    alert("Incorrect password");
  }
}

function logout() { location.reload(); }

async function loadTrends() {
  try {
    const res = await fetch("trends.json");
    const data = await res.json();

    const trendList = document.getElementById("trend-list");
    const domainList = document.getElementById("domain-list");
    trendList.innerHTML = "";
    domainList.innerHTML = "";

    const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
    const tlds = [".com", ".co.uk"];

    data.trends.forEach((trend) => {
      const li = document.createElement("li");
      li.textContent = trend;
      trendList.appendChild(li);

      const base = clean(trend);
      const ideas = [
        base, `get${base}`, `${base}hub`, `${base}labs`, `try${base}`, `${base}zone`
      ];

      ideas.forEach((idea) => {
        const dli = document.createElement("li");
        dli.textContent = tlds.map(t => idea + t).join("  •  ");
        domainList.appendChild(dli);
      });
    });
  } catch (e) {
    console.error(e);
    alert("Could not load trends.json");
  }
}

function exportCSV() {
  const rows = [];
  document.querySelectorAll("#domain-list li").forEach(li => rows.push(li.textContent));
  const csv = "domains\n" + rows.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "domains.csv"; a.click();
  URL.revokeObjectURL(url);
}
