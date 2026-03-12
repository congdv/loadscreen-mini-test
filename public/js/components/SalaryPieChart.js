import { esc } from '../utils.js';

const PALETTE = [
    '#0f3460', '#1a6b8a', '#2e8b57', '#e0a020', '#a0522d',
    '#7b2d8b', '#c0392b', '#1abc9c', '#2980b9', '#d35400',
];

function formatCurrency(n) {
    return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function drawPieChart(canvas, data) {
    const dpr = window.devicePixelRatio || 1;
    const SIZE = 260;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = SIZE + 'px';
    canvas.style.height = SIZE + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const radius = 104;
    const innerRadius = 46;

    const total = data.reduce((s, d) => s + d.total_salary, 0);
    let startAngle = -Math.PI / 2;

    data.forEach((item, i) => {
        const slice = (item.total_salary / total) * 2 * Math.PI;
        const endAngle = startAngle + slice;
        const color = PALETTE[i % PALETTE.length];

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = '#f0f2f5';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (slice > 0.25) {
            const midAngle = startAngle + slice / 2;
            const labelR = (radius + innerRadius) / 2;
            const lx = cx + labelR * Math.cos(midAngle);
            const ly = cy + labelR * Math.sin(midAngle);
            const pct = ((item.total_salary / total) * 100).toFixed(1);

            ctx.font = `bold ${slice > 0.5 ? 12 : 10}px -apple-system, sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pct + '%', lx, ly);
        }

        startAngle = endAngle;
    });

    // Donut hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Centre label
    ctx.fillStyle = '#1a1a2e';
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Total', cx, cy - 10);
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.fillStyle = '#0f3460';
    ctx.fillText(formatCurrency(total), cx, cy + 8);
}

/** Render the static chart card shell (call once on init). */
export function renderChartShell() {
    return `
    <div class="chart-card">
      <h2 class="chart-title">Salary by Department</h2>
      <div id="chart-inner"></div>
    </div>`;
}

/** Update the chart contents with fresh data (call after any mutation). */
export function updateChart(container, data) {
    const inner = container.querySelector('#chart-inner');
    if (!inner) return;

    if (!data || data.length === 0) {
        inner.innerHTML = '<p class="chart-loading">Loading chart\u2026</p>';
        return;
    }

    const total = data.reduce((s, d) => s + d.total_salary, 0);

    const legendItems = data.map((item, i) => `
      <li>
        <span class="legend-dot" style="background:${PALETTE[i % PALETTE.length]}"></span>
        <span class="legend-dept">${esc(item.department)}</span>
        <span class="legend-salary">${esc(formatCurrency(item.total_salary))}</span>
        <span class="legend-pct">${((item.total_salary / total) * 100).toFixed(1)}%</span>
      </li>`).join('');

    inner.innerHTML = `
      <div class="chart-body">
        <canvas aria-label="Salary by department pie chart" role="img"></canvas>
        <ul class="chart-legend">${legendItems}</ul>
      </div>`;

    drawPieChart(inner.querySelector('canvas'), data);
}
