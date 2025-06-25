const canvas = document.getElementById('circleCanvas');
const ctx = canvas.getContext('2d');
const radiusInput = document.getElementById('radius');
const centerXInput = document.getElementById('centerX');
const centerYInput = document.getElementById('centerY');
const speedSelect = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const resetBtn = document.getElementById('resetBtn');
const exportBtn = document.getElementById('exportBtn');
const currentPoint = document.getElementById('currentPoint');
const decisionParam = document.getElementById('decisionParam');
const explanation = document.getElementById('explanation');
const darkModeToggle = document.getElementById('darkModeToggle');
const showTutorial = document.getElementById('showTutorial');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorial = document.getElementById('closeTutorial');

let points = [];
let currentStep = -1;
let isAnimating = false;
let startTime;

function drawPixel(x, y, color = 'blue') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawSymmetricPoints(xc, yc, x, y) {
    const colors = ['#e53e3e', '#38a169', '#3182ce', '#805ad5', '#dd6b20', '#00a3c4', '#d53f8c', '#d69e2e'];
    const points = [
        [xc + x, yc + y],
        [xc - x, yc + y],
        [xc + x, yc - y],
        [xc - x, yc - y],
        [xc + y, yc + x],
        [xc - y, yc + x],
        [xc + y, yc - x],
        [xc - y, yc - x]
    ];
    points.forEach(([px, py], i) => drawPixel(px, py, colors[i]));
    return points[0];
}

function midPointCircle(radius, xc, yc) {
    points = [];
    let x = 0;
    let y = radius;
    let p = 1 - radius;

    while (x <= y) {
        points.push({ x, y, p, mainPoint: drawSymmetricPoints(xc, yc, x, y) });
        x++;
        if (p < 0) {
            p += 2 * x + 3;
            explanation.textContent = `p < 0, so move to (x+1, y). New p = ${p}.`;
        } else {
            p += 2 * x - 2 * y + 5;
            y--;
            explanation.textContent = `p ≥ 0, so move to (x+1, y-1). New p = ${p}.`;
        }
    }
}

function drawGrid() {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 10) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }
}

function resetCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    currentStep = -1;
    points = [];
    currentPoint.textContent = '-';
    decisionParam.textContent = '-';
    explanation.textContent = 'Enter parameters and click Start Drawing to begin.';
    isAnimating = false;
}

async function animateStep() {
    if (currentStep >= points.length || currentStep < 0) return;
    const { x, y, p, mainPoint } = points[currentStep];
    currentPoint.textContent = `(${mainPoint[0]}, ${mainPoint[1]})`;
    decisionParam.textContent = p;
    await new Promise(resolve => setTimeout(resolve, parseInt(speedSelect.value)));
    if (isAnimating && currentStep < points.length - 1) {
        currentStep++;
        animateStep();
    }
}

startBtn.addEventListener('click', () => {
    resetCanvas();
    const radius = parseInt(radiusInput.value);
    const xc = parseInt(centerXInput.value);
    const yc = parseInt(centerYInput.value);
    if (radius < 10 || radius > 150 || isNaN(xc) || isNaN(yc)) {
        alert('Please enter valid values (Radius: 10-150, Center X/Y: numbers).');
        return;
    }
    midPointCircle(radius, xc, yc);
    isAnimating = true;
    startTime = performance.now();
    currentStep = 0;
    animateStep();
});

nextBtn.addEventListener('click', () => {
    isAnimating = false;
    if (currentStep < points.length - 1) {
        currentStep++;
        animateStep();
    }
});

prevBtn.addEventListener('click', () => {
    isAnimating = false;
    if (currentStep > 0) {
        currentStep--;
        resetCanvas();
        for (let i = 0; i <= currentStep; i++) {
            const { x, y, p, mainPoint } = points[i];
            drawSymmetricPoints(parseInt(centerXInput.value), parseInt(centerYInput.value), x, y);
            currentPoint.textContent = `(${mainPoint[0]}, ${mainPoint[1]})`;
            decisionParam.textContent = p;
            explanation.textContent = `Plotting symmetric points for x=${x}, y=${y}. Decision parameter p=${p}.`;
        }
    }
});

resetBtn.addEventListener('click', resetCanvas);

exportBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'circle.png';
    link.href = canvas.toDataURL();
    link.click();
});

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});

showTutorial.addEventListener('click', () => {
    tutorialModal.style.display = 'flex';
});

closeTutorial.addEventListener('click', () => {
    tutorialModal.style.display = 'none';
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
});

// Initial setup
drawGrid();
explanation.textContent = 'Enter parameters and click Start Drawing to begin.';