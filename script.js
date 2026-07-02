// DOM references
const dashView = document.getElementById("dashboardView");
const dataView = document.getElementById("dataView");
const downloadBox = document.getElementById("downloadBox");
const fileInput = document.getElementById("fileInput");
const resultDown = document.getElementById("ResultDown");
const chartsContainer = document.getElementById("chartsContainer");
const tablesContainer = document.getElementById("tablesContainer");
const demoBtn = document.getElementById("DemoButn");
const resetBtn = document.getElementById("ResetButn");

// Tab toggle
const show = (view) => {
  document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
  if (view === "dashboard") dashView.classList.add("active");
  else if (view === "data") dataView.classList.add("active");
};

show("dashboard");

// File upload — click to browse
downloadBox.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file && file.type === "application/pdf") {
    resultDown.classList.add("active");
    sendToGemini(`This is a placeholder. The PDF name is ${file.name}`);
  }
});

// File upload — drag and drop
downloadBox.addEventListener("dragover", (e) => {
  e.preventDefault();
  downloadBox.classList.add("dragover");
});

downloadBox.addEventListener("dragleave", () => {
  downloadBox.classList.remove("dragover");
});

downloadBox.addEventListener("drop", (e) => {
  e.preventDefault();
  downloadBox.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file && file.type === "application/pdf") {
    resultDown.classList.add("active");
    sendToGemini(`This is a placeholder. The PDF name is ${file.name}`);
  }
});

async function sendToGemini(text) {
  const pdfResult = document.getElementById("pdfResult");
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    pdfResult.innerText = data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini error:", error);
    pdfResult.innerText = "Analysis failed. Please try again.";
  }
}

// Chart.js defaults
Chart.defaults.font.family = "Arial, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.plugins.legend.labels.boxWidth = 15;
Chart.defaults.plugins.legend.labels.padding = 10;

// Chart 1: Revenue (Bar)
new Chart(document.getElementById("chart1"), {
  type: "bar",
  data: {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [{ label: "Revenue (KWD M)", data: [120, 150, 180, 210], backgroundColor: "rgba(75, 192, 192, 0.6)", borderRadius: 8 }],
  },
  options: { plugins: { title: { display: true, text: "Quarterly Revenue" } }, responsive: true, maintainAspectRatio: false },
});

// Chart 2: Expenses (Line)
new Chart(document.getElementById("chart2"), {
  type: "line",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [{ label: "Expenses (KWD)", data: [50, 60, 55, 70, 65], borderColor: "rgba(255, 99, 132, 1)", backgroundColor: "rgba(255, 99, 132, 0.2)", fill: true, tension: 0.3 }],
  },
  options: { plugins: { title: { display: true, text: "Monthly Expenses" } }, responsive: true, maintainAspectRatio: false },
});

// Chart 3: Market Share (Pie)
new Chart(document.getElementById("chart3"), {
  type: "pie",
  data: {
    labels: ["Company A", "Company B", "Company C", "Company D"],
    datasets: [{ label: "Market Share", data: [40, 25, 20, 15], backgroundColor: ["#4CAF50", "#2196F3", "#FFC107", "#F44336"] }],
  },
  options: { plugins: { title: { display: true, text: "Market Share %" } }, responsive: true, maintainAspectRatio: false },
});

// Chart 4: Cost Breakdown (Doughnut)
new Chart(document.getElementById("chart4"), {
  type: "doughnut",
  data: {
    labels: ["Salaries", "Operations", "Marketing", "R&D"],
    datasets: [{ label: "Costs", data: [35, 25, 20, 20], backgroundColor: ["#3F51B5", "#009688", "#FF9800", "#E91E63"] }],
  },
  options: { plugins: { title: { display: true, text: "Cost Breakdown" } }, responsive: true, maintainAspectRatio: false },
});

// Chart 5: Performance (Radar)
new Chart(document.getElementById("chart5"), {
  type: "radar",
  data: {
    labels: ["Growth", "Efficiency", "Innovation", "Customer Sat.", "Market Reach"],
    datasets: [{ label: "Performance", data: [80, 70, 85, 90, 75], borderColor: "rgba(54, 162, 235, 1)", backgroundColor: "rgba(54, 162, 235, 0.2)", pointBackgroundColor: "rgba(54, 162, 235, 1)" }],
  },
  options: { plugins: { title: { display: true, text: "Company Performance" } }, responsive: true, maintainAspectRatio: false, scales: { r: { suggestedMin: 0, suggestedMax: 100 } } },
});

// Demo / Reset
chartsContainer.classList.add("hidden");
tablesContainer.classList.add("hidden");

demoBtn.addEventListener("click", () => {
  chartsContainer.classList.remove("hidden");
  tablesContainer.classList.remove("hidden");
});

resetBtn.addEventListener("click", () => {
  chartsContainer.classList.add("hidden");
  tablesContainer.classList.add("hidden");
});
