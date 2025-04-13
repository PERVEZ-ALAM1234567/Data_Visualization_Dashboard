document.addEventListener("DOMContentLoaded", () => {
  const ctx = document.getElementById("myChart").getContext("2d");
  const chartTypeSelect = document.getElementById("chartTypeSelect");
  
  const labels = ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"];
  const colors = [
    "rgba(255, 99, 132, 0.7)",
    "rgba(54, 162, 235, 0.7)",
    "rgba(255, 206, 86, 0.7)",
    "rgba(75, 192, 192, 0.7)",
    "rgba(153, 102, 255, 0.7)",
    "rgba(255, 159, 64, 0.7)",
  ];

  let chartType = "bar";
  let myChart = null;

  function generateRandomData() {
    if (chartType === "bubble") {
      return labels.map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        r: Math.random() * 10 + 5,
      }));
    } else if (chartType === "scatter") {
      return labels.map(() => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
    }
    return labels.map(() => Math.floor(Math.random() * 100));
  }

  function createChart() {
    const dataset = {
      label: "Sample Data",
      data: generateRandomData(),
      backgroundColor: colors,
      borderColor: colors.map((c) => c.replace("0.7", "1")),
      borderWidth: 1,
      ...(chartType === "line" && { fill: false }),
      ...(chartType === "bubble" || chartType === "scatter"
        ? {}
        : { tension: 0.4 }),
    };

    const config = {
      type: chartType,
      data: {
        labels:
          chartType === "scatter" || chartType === "bubble"
            ? undefined
            : labels,
        datasets: [dataset],
      },
      options: {
        responsive: true,
        maintainAspectRatio: chartType !== "pie" && chartType !== "doughnut" && chartType !== "", // This Restrict to became more bigger than screen
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
        scales:
          chartType === "pie" || chartType === "doughnut"
            ? {}
            : {
                x: { beginAtZero: true },
                y: { beginAtZero: true },
              },
      },
    };

    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, config);
  }

  function updateChart() {
    if (!myChart) return;
    myChart.data.datasets[0].data = generateRandomData();
    myChart.update();
  }

  function switchChartType() {
    const types = ["bar", "line", "pie", "doughnut", "radar", "polarArea", "bubble", "scatter"];
    const index = types.indexOf(chartType);
    chartType = types[(index + 1) % types.length];
    chartTypeSelect.value = chartType;
    createChart();
  }

  function changeChartType() {
    chartType = chartTypeSelect.value;
    createChart();
  }

  function toggleTheme() {
    document.body.classList.toggle('dark-theme');
  
    // Save preference to localStorage
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
  document.getElementById('themeCheckbox').checked = true;
}
document.getElementById("themeCheckbox").addEventListener("change", toggleTheme);


  function downloadChart(format) {
    if (!myChart) return;

    if (format === "png") {
      const url = myChart.toBase64Image();
      const a = document.createElement("a");
      a.href = url;
      a.download = "chart.png";
      a.click();
    } else if (format === "pdf") {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      pdf.addImage(myChart.toBase64Image(), "PNG", 10, 10, 180, 120);
      pdf.save("chart.pdf");
    }
  }

  function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      const rows = text.split("\n").filter((r) => r.trim() !== "");
      const [header, ...dataRows] = rows;
      const newLabels = header.split(",").map((s) => s.trim());
      const newData = dataRows.map((row) => parseFloat(row.split(",")[1]));

      chartType = "bar"; // default on CSV load
      chartTypeSelect.value = "bar";

      myChart.data.labels = newLabels;
      myChart.data.datasets[0].data = newData;
      myChart.update();
    };
    reader.readAsText(file);
  }

  function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => console.error(err));
    } else {
      document.exitFullscreen();
    }
  }

  // Event bindings
  window.updateChart = updateChart;
  window.switchChartType = switchChartType;
  window.changeChartType = changeChartType;
  window.toggleTheme = toggleTheme;
  window.downloadChart = downloadChart;
  window.importCSV = importCSV;
  window.toggleFullscreen = toggleFullscreen;

  // Init
  createChart();
});