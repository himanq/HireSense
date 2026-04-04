
const WEB3FORMS_KEY = "e5b2daf5-179b-4544-b71a-f3c70a0d6362";      
const OWNER_EMAIL   = "himanshudixit09531@gmail.com";
const UPI_ID        = "8960600969@hdfcbank";
 
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
 

function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.style.overflow = "";
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
  navigator.clipboard.writeText(UPI_ID)
    .then(() => showToast("UPI ID copied! 📋", "info"));
}
 

function switchTab(name) {
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + name).classList.add("active");
  event.target.classList.add("active");
}

async function sendWeb3(subject, message) {
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
 
/* ──────────────────────────────────────────────────────
   PAYMENT MODAL OPEN
────────────────────────────────────────────────────── */
let currentPlan = { name: "Pro Report", price: 100 };
function openPayModal(plan) {
  currentPlan = plan;
  document.getElementById("upiDisplay").textContent = UPI_ID;
  document.getElementById("payAmount").textContent  = `₹${plan.price}`;
  document.getElementById("payName").value  = "";
  document.getElementById("payEmail").value = "";
  document.getElementById("payUTR").value   = "";
  const btn = document.getElementById("paySubmitBtn");
  btn.textContent = "✅ Payment Confirm Karo";
  btn.disabled = false;
  openModal("payModal");
}
 
/* ──────────────────────────────────────────────────────
   PAYMENT SUBMIT
────────────────────────────────────────────────────── */
async function submitPayment() {
  const name  = document.getElementById("payName").value.trim();
  const email = document.getElementById("payEmail").value.trim();
  const utr   = document.getElementById("payUTR").value.trim();
 
  if (!name)                          { showToast("Apna naam daalo!", "warn"); return; }
  if (!email || !email.includes("@")) { showToast("Valid email daalo!", "warn"); return; }
  if (utr.replace(/\D/g,"").length < 6) { showToast("Valid UTR daalo (min 6 digits)!", "warn"); return; }
 
  const btn = document.getElementById("paySubmitBtn");
  btn.disabled = true;
  btn.innerHTML = `<span style="width:15px;height:15px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;display:inline-block"></span> Himanshu ko notify kar raha hoon...`;
 
  // Wait for UX feel + generate report
  await new Promise(r => setTimeout(r, 1500));
  const resumeText = document.getElementById("resumeInput").value;
  const freeData   = window._lastAnalysis || {};
  const proReport  = generateProReport(resumeText, freeData);
 
  // Send payment alert to Himanshu
  const alertMsg = `🆕 NEW PRO PAYMENT — Action Required!\n\n👤 Customer: ${name}\n📧 Email: ${email}\n💰 Plan: ${currentPlan.name} — ₹${currentPlan.price}\n🔢 UTR: ${utr}\n🕐 Time: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}\n\n📄 ATS Score: ${freeData.atsScore || "N/A"}/100\nIssues: ${freeData.mistakes?.length || 0}\n\n✅ ACTION: Verify UTR, then send Pro Report to: ${email}`;
  sendWeb3(`💰 New Payment ₹${currentPlan.price} — UTR: ${utr} — ${name}`, alertMsg);
 
  // Show done modal
  closeModal("payModal");
  document.getElementById("payDoneMeta").innerHTML = `
    <p>✅ UTR: <strong style="font-family:monospace">${utr}</strong></p>
    <p>✅ Email: <strong>${email}</strong></p>
    <p>✅ Himanshu verify karke Pro Report bhejega</p>`;
  openModal("payDoneModal");
 
  // Render pro report on screen
  renderProReport(proReport, { utr, email, name });
}
 

function analyzeResume(text) {
  const t     = text.toLowerCase();
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const wc    = words.length;
 
  const has  = k => t.includes(k.toLowerCase());
  const hasRx = rx => rx.test(text);
 
  const hasEmail    = hasRx(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  const hasPhone    = hasRx(/(\+91|0)?[6-9]\d{9}/);
  const hasLinkedIn = has("linkedin");
  const hasGithub   = has("github");
  const hasMetrics  = hasRx(/\d+%|\d+x|\d+k\b|\d+\+?\s*(users|students|clients|requests|downloads)/i);
  const hasSummary  = has("summary") || has("objective") || has("profile") || has("about");
  const hasExp      = has("experience") || has("intern") || has("worked at");
  const hasEdu      = has("education") || has("b.tech") || has("bachelor") || has("university") || has("college") || has("cgpa");
  const hasProject  = has("project");
  const hasCert     = has("certif") || has("udemy") || has("coursera");
  const hasAwards   = has("award") || has("winner") || has("hackathon");
 
  const nameRaw = lines[0] || "Candidate";
  const name    = nameRaw.length < 40 ? nameRaw : "Candidate";
 
  const techMap = {
    "react":"React","node.js":"Node.js","nodejs":"Node.js","python":"Python","java":"Java",
    "javascript":"JavaScript","typescript":"TypeScript","c++":"C++","php":"PHP","golang":"Go",
    "kotlin":"Kotlin","swift":"Swift","flutter":"Flutter","android":"Android",
    "mongodb":"MongoDB","mysql":"MySQL","postgresql":"PostgreSQL","firebase":"Firebase",
    "redis":"Redis","docker":"Docker","kubernetes":"Kubernetes","aws":"AWS","gcp":"GCP",
    "azure":"Azure","git":"Git","linux":"Linux","django":"Django","flask":"Flask",
    "express":"Express.js","spring":"Spring Boot","html":"HTML/CSS","tailwind":"Tailwind CSS",
    "graphql":"GraphQL","tensorflow":"TensorFlow","pytorch":"PyTorch","machine learning":"Machine Learning"
  };
  const techs = [];
  for (const [k, v] of Object.entries(techMap)) {
    if (has(k) && !techs.includes(v)) techs.push(v);
  }
 
  const isML       = has("machine learning") || has("tensorflow") || has("pytorch") || has("data science");
  const isBackend  = has("backend") || has("node") || has("django") || has("flask") || has("spring");
  const isFrontend = has("frontend") || has("react") || has("angular") || has("vue") || has("html");
  const isAndroid  = has("android") || has("kotlin") || has("flutter");
  const isFullStack = isBackend && isFrontend;
  const role = isML ? "ML/AI Engineer" : isAndroid ? "Android Developer" : isFullStack ? "Full Stack Developer" : isBackend ? "Backend Developer" : isFrontend ? "Frontend Developer" : "Software Developer";
 
  let score = 35;
  if (hasEmail) score += 5; if (hasPhone) score += 4; if (hasLinkedIn) score += 6;
  if (hasGithub) score += 7; if (techs.length >= 5) score += 8; else if (techs.length >= 2) score += 4;
  if (hasExp) score += 8; if (hasEdu) score += 5; if (hasProject) score += 7;
  if (hasMetrics) score += 9; if (hasSummary) score += 4;
  if (hasCert) score += 3; if (hasAwards) score += 4;
  if (wc >= 300) score += 3; else if (wc < 150) score -= 5;
  score = Math.max(20, Math.min(score, 92));
 
  const sub = {
    keywords:    Math.min(28 + techs.length * 4 + (hasMetrics ? 12 : 0) + (hasGithub ? 8 : 0), 94),
    formatting:  Math.min(28 + (hasSummary ? 12 : 0) + (hasEdu ? 12 : 0) + (hasExp ? 12 : 0) + (lines.length > 12 ? 10 : 0), 93),
    readability: Math.min(30 + (wc > 200 ? 15 : 0) + (hasProject ? 12 : 0) + (hasCert ? 8 : 0) + (hasAwards ? 8 : 0), 91),
  };
 
  const mistakes = [];
  let id = 1;
  if (!hasMetrics)  mistakes.push({ id: id++, text: `No numbers found — add '${techs[0] || "React"} app with 500+ users', '40% faster', '3 projects delivered'`, severity: "high" });
  if (!hasGithub)   mistakes.push({ id: id++, text: "GitHub link missing — recruiters check portfolio for every " + role + " role", severity: "high" });
  if (!hasSummary)  mistakes.push({ id: id++, text: "No professional summary — add 2 lines at top: who you are, what you build", severity: "medium" });
  if (!hasLinkedIn) mistakes.push({ id: id++, text: "LinkedIn URL missing — 87% of recruiters check LinkedIn before calling", severity: "medium" });
  if (wc < 200)     mistakes.push({ id: id++, text: `Resume has ~${wc} words — too short! Expand projects with tech stack + impact`, severity: "high" });
  mistakes.push({ id: id++, text: "Weak action verbs — replace 'worked on / helped' with 'built / engineered / led / optimized'", severity: "medium" });
 
  const bulletCandidates = lines.filter(l => {
    const c = l.replace(/^[-•*▪➤✓→]\s*/,"");
    return c.length > 20 && c.length < 200 && c.split(" ").length >= 4
      && !c.match(/^(education|experience|skills|projects|contact|certif|award|summary|objective)/i);
  });
 
  const improvedBullets = [];
  const weakRx = /^(worked|helped|assisted|did|made|was responsible|participated|involved)/i;
  for (const line of bulletCandidates.slice(0, 3)) {
    const clean = line.replace(/^[-•*▪➤✓→]\s*/, "").trim();
    if (clean.length > 10) {
      const stripped = clean.replace(weakRx, "").trim();
      const tech = techs.slice(0, 2).join(" and ") || "the application";
      const improved = weakRx.test(clean)
        ? `Engineered ${stripped.charAt(0).toLowerCase() + stripped.slice(1)}, leveraging ${tech} to improve performance by 35% and serve 200+ users`
        : `${clean} — achieving 40% efficiency gain and measurable improvement in user satisfaction`;
      improvedBullets.push({ original: clean.slice(0, 90), improved });
    }
    if (improvedBullets.length >= 2) break;
  }
  if (!improvedBullets.length) {
    const t1 = techs[0] || "React"; const t2 = techs[1] || "Node.js";
    improvedBullets.push(
      { original: `Developed ${t1} project`, improved: `Engineered a production-ready ${t1} application with real-time features, serving 500+ active users with 99.9% uptime` },
      { original: `Worked on ${t2} backend`, improved: `Architected RESTful ${t2} APIs processing 10k+ daily requests with sub-100ms response time and JWT auth` }
    );
  }
 
  const allSkills = [
    { skill: "Docker", category: "DevOps" }, { skill: "Kubernetes", category: "DevOps" },
    { skill: "AWS", category: "Cloud" }, { skill: "CI/CD", category: "DevOps" },
    { skill: "System Design", category: "Architecture" }, { skill: "GraphQL", category: "API" },
    { skill: "TypeScript", category: "Language" }, { skill: "Redis", category: "Backend" },
    { skill: "PostgreSQL", category: "Database" }, { skill: "DSA / LeetCode", category: "CS Fundamentals" },
    { skill: "Linux / Shell", category: "DevOps" }, { skill: "Jest / Testing", category: "Testing" },
  ];
  const missingSkills = allSkills.filter(s => !has(s.skill.toLowerCase().split(" ")[0])).slice(0, 6);
 
  const tips = [];
  if (!hasMetrics)  tips.push("Add numbers to every bullet — even estimates like '~500 users', '3 projects', '2x faster'");
  if (!hasGithub)   tips.push("Add your GitHub URL in contact section — link each project to its repo");
  if (!hasSummary)  tips.push(`Write a 2-line summary: "Final year ${role} skilled in ${techs.slice(0, 3).join(", ") || "modern tech"}. Seeking SDE roles."`);
  tips.push("Keep resume to exactly 1 page — use 0.5 inch margins if needed");
  tips.push("Use ATS-friendly fonts: Calibri or Arial — avoid tables, columns, and graphics");
 
  return { atsScore: score, subScores: sub, mistakes: mistakes.slice(0, 5), improvedBullets, missingSkills, tips: tips.slice(0, 4), _meta: { name, role, techs } };
}

function generateProReport(text, analysis) {
  const m     = (analysis && analysis._meta) || {};
  const name  = m.name  || text.split("\n")[0]?.trim() || "Candidate";
  const role  = m.role  || "Software Developer";
  const techs = m.techs || [];
  const ts    = techs.slice(0, 5).join(", ") || "JavaScript, React, Node.js";
  const t     = text.toLowerCase();
 
  const email = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) || [])[0] || "";
  const phone = (text.match(/(\+91|0)?[6-9]\d{9}/) || [])[0] || "";
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
 
  const rewriteLines = lines.map(line => {
    const clean = line.replace(/^[-•*▪➤✓→]\s*/,"").trim();
    const weakRx = /^(worked|helped|assisted|was responsible|did|made|participated|involved)/i;
    if (clean.length > 20 && clean.length < 200 && weakRx.test(clean)) {
      const stripped = clean.replace(weakRx,"").trim();
      return "• Engineered " + stripped.charAt(0).toLowerCase() + stripped.slice(1) + ", delivering measurable performance improvements";
    }
    return line;
  });
 
  const rewrittenResume = `${name}
${email}${phone ? " | " + phone : ""}${t.includes("linkedin") ? " | linkedin.com/in/" + name.toLowerCase().replace(/\s+/,"-") : ""} | github.com/${name.toLowerCase().replace(/\s+/,"")}
 
PROFESSIONAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Motivated ${role} with strong foundation in ${ts}. Proven ability to build scalable, production-ready applications. Seeking challenging SDE roles at product-based companies.
 
${rewriteLines.join("\n")}
 
KEY ACHIEVEMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Built and deployed ${techs.slice(0,2).join(" + ") || "full-stack"} applications used by real users
• Delivered projects on time with clean, documented code
• Strong DSA & problem-solving skills`;
 
  const coverLetter = `Dear Hiring Manager,
 
I am ${name}, a passionate ${role} with hands-on experience in ${ts}. I am excited to apply for the Software Developer / SDE-1 position at your organization.
 
During my projects and internships, I built scalable systems — from clean APIs to deployed applications that real users depend on. My experience with ${techs.slice(0,3).join(", ") || "modern frameworks"} gives me confidence to tackle complex engineering problems independently and in a team.
 
I am a quick learner with a strong work ethic, and I am confident I can add value from day one. I would love to discuss how my skills align with your team's goals.
 
Warm regards,
${name}
${email}${phone ? " | " + phone : ""}`;
 
  const jdVersions = [
    {
      role: `${role} — Product Startups`,
      summary: `Your ${ts} background is a great fit for fast-moving startups. Emphasize ability to ship fast and work across the stack.`,
      keyChanges: [`Highlight any feature built end-to-end using ${techs[0] || "React"}`, "Add any user-facing product with real usage stats", "Mention quick learning and initiative in past projects"],
    },
    {
      role: "SDE-1 — Mid-size Product Companies",
      summary: "Companies like Razorpay, Zepto, Groww focus on DSA + project quality. Show your problem-solving depth.",
      keyChanges: ["Add your LeetCode/GFG profile and problem count", "Mention system design decisions made in projects", `Show ${techs.find(x => ["Node.js","Django","Spring Boot"].includes(x)) || "backend"} API experience`],
    },
    {
      role: "Intern / Junior Developer",
      summary: "For internship roles, emphasize eagerness to learn, project quality, and any real-world impact.",
      keyChanges: ["Lead with your best project + live demo link", "Include all tech stack and tools you know", "Add academic projects if work experience is limited"],
    },
  ];
 
  const linkedinHeadline = `${role} | ${techs.slice(0,3).join(" • ")} | Fresher | Open to SDE Roles | Building real products`;
 
  const linkedinSummary = `🚀 ${role} passionate about building things that work.
 
I specialize in ${ts} and love going from idea to deployed product. I've built ${techs.length ? techs.slice(0,2).join(" and ") + " applications" : "full-stack applications"} that solve real problems.
 
Currently open to SDE / intern roles at product companies where I can grow fast and ship meaningful features. Let's connect! 🤝
 
📌 Skills: ${ts}`;
 
  const salaryInsight = `For a ${role} fresher: ₹4–7 LPA at startups, ₹8–16 LPA at product companies (Razorpay/Zepto tier), ₹20–45 LPA at top-tier (FAANG). Strong DSA + ${techs[0] || "core skills"} = higher offers.`;
 
  return { rewrittenResume, coverLetter, jdVersions, linkedinHeadline, linkedinSummary, salaryInsight };
}
 

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
    const data = analyzeResume(text);
    window._lastAnalysis = data;
    document.getElementById("loader").classList.remove("show");
    renderResults(data);
    document.getElementById("results-section").style.display = "block";
    setTimeout(() => document.getElementById("results-section").scrollIntoView({ behavior: "smooth" }), 80);
  }, 1300);
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
    div.innerHTML = `<span class="tag" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}22">${cfg.label}</span><span class="issue-text">${m.text}</span>`;
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
    chip.innerHTML = `<span style="font-size:13px;font-weight:600;color:#e2e8f0">${s.skill}</span><span style="font-size:11px;color:${catColors[s.category]||"#64748b"}">${s.category}</span>`;
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
  document.getElementById("proMeta").innerHTML = `
    <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:99px;padding:5px 14px;font-size:12px;color:#86efac;margin:3px">✅ UTR: <strong style="font-family:monospace">${escHtml(meta.utr)}</strong></span>
    <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(37,99,235,.07);border:1px solid rgba(37,99,235,.2);border-radius:99px;padding:5px 14px;font-size:12px;color:#93c5fd;margin:3px">📧 ${escHtml(meta.email)}</span>`;
 
  if (pro.salaryInsight) {
    document.getElementById("salaryInfo").innerHTML = `<div style="background:rgba(245,158,11,.07);border:1px solid rgba(245,158,11,.2);border-radius:10px;padding:8px 18px;font-size:12px;color:#fcd34d">💰 ${escHtml(pro.salaryInsight)}</div>`;
  }
 
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
        <span class="jd-role-badge">JD Match ✦</span>
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