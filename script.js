
const WEB3FORMS_KEY = ""; // Configure a valid key only if contact delivery is enabled.      
const OWNER_EMAIL   = "himanshudixit09531@gmail.com";
const UPI_ID        = ""; // Payments disabled until server-side verification exists.
 
/* ──────────────────────────────────────────────────────
   NAVBAR SCROLL EFFECT
────────────────────────────────────────────────────── */

let _scrollTick = false;
window.addEventListener("scroll", () => {
  if (!_scrollTick) {
    requestAnimationFrame(() => {
      document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 30);
      _scrollTick = false;
    });
    _scrollTick = true;
  }
}, { passive: true });
 
/* ──────────────────────────────────────────────────────
   SMOOTH SCROLL
────────────────────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
 

let _wcTimer;
document.getElementById("resumeInput").addEventListener("input", function () {
  clearTimeout(_wcTimer);
  _wcTimer = setTimeout(() => {
    const words = this.value.trim().split(/\s+/).filter(Boolean).length;
    const el = document.getElementById("wordCount");
    if (!this.value.trim()) {
      el.textContent = "Plain text · PDF paste · LinkedIn export";
      el.style.color = "#475569";
    } else {
      el.textContent = `${this.value.length} chars · ~${words} words${words < 100 ? " (add more!)" : ""}`;
      el.style.color = words >= 100 ? "#22c55e" : "#f59e0b";
    }
  }, 300);
});
 

let lastModalTrigger = null;

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  lastModalTrigger = document.activeElement;
  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  const firstControl = modal.querySelector("button, input, textarea, select, a[href], [tabindex]:not([tabindex='-1'])");
  if (firstControl) firstControl.focus();
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove("open");
  document.body.style.overflow = "";
  if (lastModalTrigger && typeof lastModalTrigger.focus === "function") lastModalTrigger.focus();
  // Reset contact form if closing
  if (id === "contactModal") {
    document.getElementById("contactForm").style.display = "block";
    document.getElementById("contactDone").style.display = "none";
    document.getElementById("cName").value = "";
    document.getElementById("cEmail").value = "";
    document.getElementById("cMsg").value = "";
    const btn = document.getElementById("contactSendBtn");
    btn.textContent = "📩 Send Message";
    btn.disabled = false;
  }
}

// Keep keyboard focus inside an open dialog and support Escape to close it.
document.addEventListener("keydown", event => {
  const modal = document.querySelector(".overlay.open");
  if (!modal) return;
  if (event.key === "Escape") {
    const id = modal.id;
    closeModal(id);
    return;
  }
  if (event.key !== "Tab") return;
  const controls = [...modal.querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")]
    .filter(el => el.getClientRects().length > 0);
  if (!controls.length) { event.preventDefault(); return; }
  const first = controls[0], last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
});

function overlayClick(e, id) {
  if (e.target === e.currentTarget) closeModal(id);
}
 
/* ──────────────────────────────────────────────────────
   TOAST
────────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = "ok") {
  const t = document.getElementById("toast");
  const colors  = { ok: "rgba(34,197,94,.15)",  err: "rgba(239,68,68,.15)",  warn: "rgba(245,158,11,.15)",  info: "rgba(6,182,212,.15)"  };
  const borders = { ok: "rgba(34,197,94,.3)",   err: "rgba(239,68,68,.3)",   warn: "rgba(245,158,11,.3)",   info: "rgba(6,182,212,.3)"   };
  const icons   = { ok: "✅", err: "❌", warn: "⚠️", info: "ℹ️" };
  t.style.background  = colors[type];
  t.style.border      = `1px solid ${borders[type]}`;
  document.getElementById("toastIcon").textContent = icons[type];
  document.getElementById("toastMsg").textContent  = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
}
 

function copyEl(id) {
  const text = document.getElementById(id).innerText;
  navigator.clipboard.writeText(text)
    .then(() => showToast("Copied to clipboard! 📋", "info"))
    .catch(() => showToast("Copy failed — please select manually", "warn"));
}
function copyUPI() {
  if (!UPI_ID) { showToast("Payments are disabled in this demo.", "info"); return; }
  navigator.clipboard.writeText(UPI_ID).then(() => showToast("UPI ID copied!", "info"));
}
 

function switchTab(name) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const pane = document.getElementById("tab-" + name);
  if (pane) pane.classList.add("active");
  document.querySelectorAll(".tab").forEach(t => {
    if (t.getAttribute("onclick") === "switchTab(\u0027" + name + "\u0027)") t.classList.add("active");
  });
}

async function sendWeb3(subject, message) {
  if (!WEB3FORMS_KEY.trim()) return false;
  try {
    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject,
        email:      OWNER_EMAIL,
        from_name:  "HimanshuAI Tool",
        message,
        botcheck:   false,
      }),
    });
    const data = await res.json();
    return data.success === true;
  } catch { return false; }
}
 
/* ──────────────────────────────────────────────────────
   CONTACT FORM
────────────────────────────────────────────────────── */
async function sendContact() {
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const msg   = document.getElementById("cMsg").value.trim();
 
  if (!name)              { showToast("Apna naam daalo!", "warn"); return; }
  if (!email || !email.includes("@")) { showToast("Valid email daalo!", "warn"); return; }
  if (!msg)               { showToast("Message bhi likho!", "warn"); return; }
  if (!WEB3FORMS_KEY.trim()) {
    const sub = encodeURIComponent(`HireSense Contact — ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`);
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${sub}&body=${body}`;
    showToast("Contact delivery is not configured; your email app was requested instead.", "info");
    return;
  }

  const btn = document.getElementById("contactSendBtn");
  btn.disabled = true;
  btn.innerHTML = `<span style="width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block"></span> Bhej raha hoon...`;
 
  const ok = await sendWeb3(
    `ResumeAI Contact — ${name}`,
    `Naam: ${name}\nEmail: ${email}\n\nMessage:\n${msg}\n\nTime: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
  );
 
  if (ok) {
    document.getElementById("contactForm").style.display = "none";
    document.getElementById("contactDone").style.display = "block";
    document.getElementById("contactReplyEmail").textContent = `24 ghante mein reply milega ${email} pe`;
  } else {
    // Fallback: open mailto
    const sub  = encodeURIComponent(`ResumeAI Contact — ${name}`);
    const body = encodeURIComponent(`Naam: ${name}\nEmail: ${email}\n\nMessage:\n${msg}`);
    window.open(`mailto:${OWNER_EMAIL}?subject=${sub}&body=${body}`);
    closeModal("contactModal");
    showToast("Email app khul gaya — Send dabao! 📩", "ok");
  }
}
 
function openPayModal() { showToast("Payments are disabled until server-side verification is implemented.", "info"); }
async function submitPayment() { showToast("This demo does not collect or verify payments.", "warn"); }

function doAnalyze() {
  const text = document.getElementById("resumeInput").value.trim();
  if (!text) { showToast("Resume paste karo pehle!", "warn"); return; }
 
  // Show loader
  document.getElementById("results-section").style.display = "none";
  document.getElementById("pro-section").style.display     = "none";
  document.getElementById("loader").classList.add("show");
  window.scrollTo({ top: 0, behavior: "smooth" });
 

  const steps = ["Scanning resume...","Checking ATS score...","Finding skill gaps...","Done! ✓"];
  const pcts  = [25, 50, 75, 100];
  let i = 0;
  const stepTimer = setInterval(() => {
    document.getElementById("loaderStep").textContent = "› " + steps[i];
    document.getElementById("loaderBar").style.width  = pcts[i] + "%";
    i++;
    if (i >= steps.length) clearInterval(stepTimer);
  }, 320);
 

  setTimeout(() => {
    clearInterval(stepTimer);
    try {
      const data = window.HireSenseAnalyzer.analyzeResume(text);
      window._lastAnalysis = data;
      window._lastAnalysisText = text;
      renderResults(data);
      ["downloadMarkdownBtn", "downloadTextBtn"].forEach(id => {
        const button = document.getElementById(id);
        if (button) button.disabled = false;
      });
      const downloadHint = document.getElementById("downloadHint");
      if (downloadHint) downloadHint.textContent = "Your report is ready. Choose a format to save it to your device.";
      document.getElementById("results-section").style.display = "block";
      setTimeout(() => document.getElementById("results-section").scrollIntoView({ behavior: "smooth" }), 80);
    } catch (error) {
      console.error("HireSense analysis failed:", error);
      showToast("Analysis failed. Please refresh the page and try again.", "warn");
    } finally {
      document.getElementById("loader").classList.remove("show");
    }
  }, 1300);
}
 


function downloadHireSenseReport(format) {
  const resumeText = document.getElementById("resumeInput").value.trim();
  if (!resumeText || !window._lastAnalysis) {
    showToast("Analyse your resume before downloading a report.", "warn");
    scrollToSection("analyzer");
    return;
  }
  try {
    let jobComparison = null;
    const jobText = document.getElementById("jobDescriptionInput").value.trim();
    if (jobText) jobComparison = window.HireSenseAnalyzer.compareResumeToJob(resumeText, jobText);
    const markdown = window.HireSenseAnalyzer.buildDownloadReport(
      resumeText, window._lastAnalysis, jobComparison, window._lastProReport || null
    );
    const content = format === "txt"
      ? markdown.replace(/^#{1,3} /gm, "").replace(/^> /gm, "")
      : markdown;
    const blob = new Blob([content], { type: format === "txt" ? "text/plain;charset=utf-8" : "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hiresense-resume-review." + format;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Your report download has started.", "info");
  } catch (error) {
    console.error("HireSense report export failed:", error);
    showToast("Could not prepare the report. Please try again.", "warn");
  }
}

function compareJobDescription() {
  const resume = document.getElementById("resumeInput").value.trim();
  const jobDescription = document.getElementById("jobDescriptionInput").value.trim();
  const results = document.getElementById("jobMatchResults");
  if (!resume || !jobDescription) {
    showToast("Paste both your resume and the job description first.", "warn");
    if (!resume) scrollToSection("analyzer");
    else document.getElementById("jobDescriptionInput").focus();
    return;
  }

  try {
    const result = window.HireSenseAnalyzer.compareResumeToJob(resume, jobDescription);
    results.replaceChildren();
    results.hidden = false;

    const heading = document.createElement("div");
    heading.className = "job-match-heading";
    const title = document.createElement("h3");
    title.textContent = "Keyword overlap";
    const coverage = document.createElement("div");
    coverage.className = "job-match-coverage";
    coverage.textContent = result.coverage + "%";
    heading.append(title, coverage);
    results.appendChild(heading);

    const note = document.createElement("p");
    note.className = "job-match-note";
    note.textContent = result.message;
    results.appendChild(note);

    const columns = document.createElement("div");
    columns.className = "job-match-columns";
    const groups = [
      { title: "Found in resume", items: result.matched, className: "matched" },
      { title: "Not detected", items: result.missing, className: "missing" }
    ];
    groups.forEach(group => {
      const panel = document.createElement("div");
      panel.className = "job-match-panel " + group.className;
      const label = document.createElement("h4");
      label.textContent = group.title + " (" + group.items.length + ")";
      panel.appendChild(label);
      if (!group.items.length) {
        const empty = document.createElement("p");
        empty.textContent = "No terms in this group.";
        panel.appendChild(empty);
      } else {
        const list = document.createElement("ul");
        group.items.forEach(item => {
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
        panel.appendChild(list);
      }
      columns.appendChild(panel);
    });
    results.appendChild(columns);
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    console.error("HireSense job comparison failed:", error);
    showToast("Could not compare these texts. Please refresh and try again.", "warn");
  }
}

function generateProReportForDemo() {
  const text = document.getElementById("resumeInput").value.trim();
  if (!text) { showToast("Paste and analyze your resume first.", "warn"); scrollToSection("analyzer"); return; }

  try {
    // Reuse cached analysis only when it belongs to the exact current resume text.
    const analysis = window._lastAnalysis && window._lastAnalysisText === text
      ? window._lastAnalysis
      : window.HireSenseAnalyzer.analyzeResume(text);
    const report = window.HireSenseAnalyzer.generateProReport(text, analysis);
    window._lastProReport = report;
    renderProReport(report, { demo: true });
  } catch (error) {
    console.error("HireSense report generation failed:", error);
    showToast("Could not generate the report. Please try again.", "warn");
  }
}

function renderResults(data) {
  const circumference = 2 * Math.PI * 34; // r=34
 
  // ATS Score
  const color = data.atsScore >= 80 ? "#22c55e" : data.atsScore >= 60 ? "#f59e0b" : "#ef4444";
  const circle = document.getElementById("scoreCircle");
  const offset = circumference - (data.atsScore / 100) * circumference;
  circle.style.stroke = color;
  setTimeout(() => { circle.style.strokeDashoffset = offset; }, 100);
  document.getElementById("scoreNum").textContent  = data.atsScore;
  document.getElementById("scoreNum").style.color  = color;
  const label = data.atsScore >= 80 ? "Excellent" : data.atsScore >= 60 ? "Good" : "Needs Work";
  const sl = document.getElementById("scoreLabel");
  sl.textContent       = label;
  sl.style.color       = color;
  sl.style.background  = color + "18";
  sl.style.border      = `1px solid ${color}30`;
 
  // Sub scores
  ["kw","fmt","rd"].forEach((k, i) => {
    const vals = [data.subScores.keywords, data.subScores.formatting, data.subScores.readability];
    const v = vals[i];
    document.getElementById(k+"Val").textContent = v + "%";
    setTimeout(() => { document.getElementById(k+"Bar").style.width = v + "%"; }, 200);
  });
 
  // Mistakes
  const sevConfig = {
    high:   { color:"#ef4444", bg:"rgba(239,68,68,.1)",   label:"High"   },
    medium: { color:"#f59e0b", bg:"rgba(245,158,11,.1)",  label:"Med"    },
    low:    { color:"#22d3ee", bg:"rgba(6,182,212,.1)",   label:"Low"    },
  };
  document.getElementById("mistakeCount").textContent = data.mistakes.length + " issues";
  const ml = document.getElementById("mistakesList");
  ml.innerHTML = "";
  data.mistakes.forEach((m, i) => {
    const cfg = sevConfig[m.severity] || sevConfig.low;
    const div = document.createElement("div");
    div.className = "issue-item";
    div.style.animationDelay = (i * 0.06) + "s";
    div.innerHTML = `<span class="tag" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}22">${cfg.label}</span><span class="issue-text">${escHtml(m.text)}</span>`;
    ml.appendChild(div);
  });
 
  // Bullets
  const bl = document.getElementById("bulletsList");
  bl.innerHTML = "";
  data.improvedBullets.forEach(b => {
    const div = document.createElement("div");
    div.className = "bullet-wrap";
    div.innerHTML = `
      <div class="bullet-before"><div class="bullet-label" style="color:#ef4444">Before</div><div class="bullet-text" style="color:#94a3b8">${escHtml(b.original)}</div></div>
      <div class="bullet-after"><div class="bullet-label" style="color:#22c55e">After ✓</div><div class="bullet-text" style="color:#bbf7d0">${escHtml(b.improved)}</div></div>`;
    bl.appendChild(div);
  });
 
  // Skills
  const catColors = { DevOps:"#f59e0b", Architecture:"#8b5cf6", API:"#06b6d4", Cloud:"#3b82f6", "CS Fundamentals":"#10b981", Language:"#22d3ee", Backend:"#a78bfa", Database:"#ec4899", Testing:"#f472b6" };
  const sl2 = document.getElementById("skillsList");
  sl2.innerHTML = "";
  data.missingSkills.forEach((s, i) => {
    const chip = document.createElement("div");
    chip.className = "skill-chip";
    chip.style.animationDelay = (i * 0.05) + "s";
    chip.innerHTML = `<span style="font-size:13px;font-weight:600;color:#e2e8f0">${escHtml(s.skill)}</span><span style="font-size:11px;color:${catColors[s.category]||"#64748b"}">${escHtml(s.category)}</span>`;
    sl2.appendChild(chip);
  });
 
  // Tips
  const tl = document.getElementById("tipsList");
  tl.innerHTML = "";
  data.tips.forEach(tip => {
    const div = document.createElement("div");
    div.className = "tip-item";
    div.innerHTML = `<span style="color:#f59e0b;font-weight:700;flex-shrink:0">→</span><p>${escHtml(tip)}</p>`;
    tl.appendChild(div);
  });
}
 

function renderProReport(pro, meta) {
  const proSec = document.getElementById("pro-section");
  proSec.style.display = "block";
 
  // Meta badges
  document.getElementById("proMeta").textContent = "Generated locally. Review every placeholder before use.";
 
  document.getElementById("salaryInfo").textContent = "Replace bracketed placeholders with accurate, role-specific details.";
 
  document.getElementById("resumeContent").textContent = pro.rewrittenResume;
  document.getElementById("coverContent").textContent  = pro.coverLetter;
  document.getElementById("liHeadline").textContent    = pro.linkedinHeadline;
  document.getElementById("liSummary").textContent     = pro.linkedinSummary;
 
  // JD versions
  const jdDiv = document.getElementById("jdContent");
  jdDiv.innerHTML = "";
  pro.jdVersions.forEach((jd, i) => {
    const card = document.createElement("div");
    card.className = "jd-card";
    const changes = jd.keyChanges.map(c => `<div style="display:flex;gap:9px;margin-bottom:6px"><span style="color:#22d3ee;flex-shrink:0">✦</span><span style="font-size:13px;color:#cbd5e1;line-height:1.5">${escHtml(c)}</span></div>`).join("");
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:12px">
        <div><div style="font-size:10px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em">Role ${i+1}</div><h3 style="font-size:1rem;font-weight:700;margin-top:2px">${escHtml(jd.role)}</h3></div>
        <span class="jd-role-badge">Tailoring checklist</span>
      </div>
      <p style="font-size:13px;color:#94a3b8;line-height:1.6;margin-bottom:12px">${escHtml(jd.summary)}</p>
      ${changes}`;
    jdDiv.appendChild(card);
  });
 
  // Reset tabs to first
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-resume").classList.add("active");
  document.querySelectorAll(".tab")[0].classList.add("active");
 
  setTimeout(() => proSec.scrollIntoView({ behavior: "smooth" }), 150);
}
 
/* ──────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────── */
function escHtml(str) {
  if (!str) return "";
  return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
 
 
window.HireSenseAnalyzer = window.HireSenseAnalyzer || {};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = "running";
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
 
// Pause all card animations initially, play when visible
document.querySelectorAll(".r-card, .card").forEach(el => {
  el.style.animationPlayState = "paused";
  observer.observe(el);
});