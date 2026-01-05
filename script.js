let startTime = 0;
let elapsed = 0;
let running = false;
let rafId = null;
let laps = [];

const display = document.getElementById("display");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");
const lapBtn = document.getElementById("lap");
const lapList = document.getElementById("laps");
const ring = document.querySelector(".progress");
const lapCountEl = document.getElementById("lapCount");
const avgLapEl = document.getElementById("avgLap");
const exportBtn = document.getElementById("exportCSV");

const CIRC = 565;

function pad(n) {
    return n < 10 ? "0" + n : "" + n;
}
function padMs(n) {
    return n.toString().padStart(3, "0");
}

function format(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msPart = Math.floor(ms % 1000);

    return `${pad(h)}:${pad(m)}:${pad(s)}.${padMs(msPart)}`;
}

function updateLoop() {
    const now = performance.now();
    const total = elapsed + (running ? (now - startTime) : 0);

    display.textContent = format(total);

    const secs = (total / 1000) % 60;
    ring.style.strokeDashoffset = CIRC * (1 - secs / 60);

    if (running) rafId = requestAnimationFrame(updateLoop);
}

/* Start */
startBtn.onclick = () => {
    if (!running) {
        running = true;
        startTime = performance.now();
        rafId = requestAnimationFrame(updateLoop);
    }
};

/* Pause */
pauseBtn.onclick = () => {
    if (!running) return;
    elapsed += performance.now() - startTime;
    running = false;
    cancelAnimationFrame(rafId);
};

/* Reset */
resetBtn.onclick = () => {
    running = false;
    cancelAnimationFrame(rafId);

    startTime = 0;
    elapsed = 0;
    laps = [];

    display.textContent = "00:00:00.000";
    ring.style.strokeDashoffset = CIRC;
    lapList.innerHTML = "";
    lapCountEl.textContent = "0";
    avgLapEl.textContent = "00:00.000";
};

/* Lap */
lapBtn.onclick = () => {
    if (!running) return;

    const total = elapsed + (performance.now() - startTime);
    laps.push(total);

    const li = document.createElement("li");
    li.innerHTML = `<span>Lap ${laps.length}</span><span>${format(total)}</span>`;
    lapList.appendChild(li);

    updateAnalytics();
};

function updateAnalytics() {
    lapCountEl.textContent = laps.length;

    if (laps.length === 0) {
        avgLapEl.textContent = "00:00.000";
        return;
    }

    const avg = laps.reduce((a, b) => a + b, 0) / laps.length;
    avgLapEl.textContent = format(avg);
}

/* EXPORT CSV */
exportBtn.onclick = () => {
    if (laps.length === 0) return alert("No laps to export!");

    let csv = "Lap,Time\n";
    laps.forEach((lap, i) => {
        csv += `Lap ${i + 1},${format(lap)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "laps.csv";
    a.click();

    URL.revokeObjectURL(url);
};

/* THEME TOGGLE */
document.getElementById("themeBtn").onclick = () => {
    document.body.classList.toggle("light");
    document.getElementById("themeBtn").textContent =
        document.body.classList.contains("light") ? "☀️" : "🌙";
};
