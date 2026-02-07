/* ================= ELEMENTS ================= */
const wakeBtn     = document.getElementById("wakeBtn");
const status      = document.getElementById("status");
const modeLabel   = document.getElementById("modeLabel");
const systemFeed  = document.getElementById("systemFeed");
const introVoice  = document.getElementById("introVoice");

const timeText    = document.getElementById("timeText");
const dateText    = document.getElementById("dateText");
const batteryLvl  = document.getElementById("batteryLevel");
const uptimeEl    = document.getElementById("uptime");
const leftHud     = document.getElementById("leftHud");

/* ================= TIME / BATTERY ================= */
setInterval(() => {
  const d = new Date();
  timeText.textContent = d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  dateText.textContent = d.toDateString();
}, 1000);

navigator.getBattery().then(b =>
  batteryLvl.textContent = Math.floor(b.level * 100)
);

/* ================= UPTIME ================= */
const bootTime = Date.now();
setInterval(() => {
  const s = Math.floor((Date.now() - bootTime) / 1000);
  uptimeEl.textContent =
    `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}, 1000);

/* ================= JARVIS PERSONALITY ================= */
const personality = {
  STANDBY : "Standing by.",
  ACTIVE  : "Systems nominal.",
  FOCUSED : "Awaiting command.",
  IDLE    : "Idle state detected.",
  HYPER   : "Combat protocols active."
};

function say(state){
  status.textContent = personality[state] || "";
}

/* ================= STATE MACHINE ================= */
let STATE = "STANDBY";
let idleTimer = null;

function setState(newState){
  STATE = newState;
  say(newState);

  document.body.classList.remove("idle","focus","hyper");
  if(newState === "IDLE")   document.body.classList.add("idle");
  if(newState === "FOCUSED")document.body.classList.add("focus");
  if(newState === "HYPER")  document.body.classList.add("hyper");
}

/* ================= SYSTEM FEED ================= */
const logs = [
  "POWER SYSTEM : OK",
  "AUDIO INPUT : READY",
  "ENVIRONMENT : SAFE",
  "NETWORK : ONLINE",
  "STATUS : NOMINAL",
  "BOOT SEQUENCE COMPLETE"
];

function runFeed(){
  systemFeed.innerHTML = "";
  let i = 0;
  const t = setInterval(() => {
    systemFeed.innerHTML += logs[i] + "<br>";
    i++;
    if(i >= logs.length) clearInterval(t);
  }, 600);
}

/* ================= ASSEMBLY (ANIMATED) ================= */
let online = false;

function assemble(){
  if(online) return;
  online = true;

  // Reset visuals (important if user reloads)
  document.body.classList.remove("system-ready");
  void document.body.offsetWidth; // force reflow

  // Start assembly
  document.body.classList.add("system-ready");
  modeLabel.textContent = "MODE : STANDARD";

  introVoice.play();
  setState("ACTIVE");

  // Feed starts after visual assembly
  setTimeout(runFeed, 2200);
}

/* ================= ACTIVITY TRACKING ================= */
function activity(){
  if(!online) return;
  setState("FOCUSED");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => setState("IDLE"), 20000);
}

document.addEventListener("mousemove", activity);
document.addEventListener("click", activity);

/* ================= WAKE ================= */
wakeBtn.onclick = assemble;

/* ================= CONTROL PANEL ================= */
let panelVisible = false;
let holdTimer = null;

modeLabel.addEventListener("mousedown", () => {
  holdTimer = setTimeout(() => {
    document.getElementById("controlPanel")?.classList.toggle("show");
  }, 600);
});
modeLabel.addEventListener("mouseup", () => clearTimeout(holdTimer));

/* ================= INIT ================= */
window.onload = () => {
  setState("STANDBY");
};

/* ===== UI DETAIL LOGIC ===== */

/* D1 – Inject section headers */
const titles = [
  ["TIME", timeText],
  ["POWER", batteryLvl],
  ["SYSTEM", uptimeEl]
];

titles.forEach(([label, el])=>{
  const t=document.createElement("div");
  t.className="hud-title";
  t.textContent=label;
  el.parentElement.insertBefore(t, el);
});

/* D3 – Limit system feed lines */
const MAX_LINES = 7;
const _runFeed = runFeed;
runFeed = function(){
  _runFeed();
  setInterval(()=>{
    const lines = systemFeed.querySelectorAll("br");
    if(lines.length > MAX_LINES){
      systemFeed.innerHTML =
        systemFeed.innerHTML
          .split("<br>")
          .slice(-MAX_LINES)
          .join("<br>");
    }
  },1000);
};

/* D10 – Boot timestamp */
const bootStamp = new Date().toLocaleTimeString([],{
  hour:'2-digit',minute:'2-digit'
});
systemFeed.innerHTML += `[BOOT @ ${bootStamp}]<br>`;

