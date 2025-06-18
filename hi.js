let originalArray = [];
let steps = [];
let stepIndex = 0;

function createStep(type, arr, highlights, message) {
    return {
        type,
        array: [...arr],
        highlights,
        message
    };
}

function renderBars(arr, highlights = {}) {
    const container = document.getElementById("barContainer");
    container.innerHTML = "";

    arr.forEach((num, idx) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${num * 5}px`;

        const label = document.createElement("span");
        label.textContent = num;
        bar.appendChild(label);

        if (highlights.pivot && highlights.pivot === idx) {
            bar.classList.add("highlight-pivot");
        }
        if (highlights.compare && highlights.compare.includes(idx)) {
            bar.classList.add("highlight-compare");
        }
        if (highlights.sorted && highlights.sorted.includes(idx)) {
            bar.classList.add("highlight-sorted");
        }

        container.appendChild(bar);
    });

    document.getElementById("currentArray").textContent = `Current Array: [${arr.join(", ")}]`;
}

function logMessage(msg) {
    const log = document.getElementById("log");
    const div = document.createElement("div");
    div.textContent = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function range(start, end) {
    let res = [];
    for (let i = start; i <= end; i++) res.push(i);
    return res;
}

function quickSort(arr, low, high) {
    if (low < high) {
        let pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    if (low === high) {
        steps.push(createStep(
            'sorted',
            arr, { sorted: [low], pivot: null, compare: [] },
            `Element at index ${low} is sorted`
        ));
    }
}

function partition(arr, low, high) {
    let pivot = arr[high];
    steps.push(createStep(
        'pivot',
        arr, { pivot: high, compare: [], sorted: [] },
        `Selected pivot ${pivot} at index ${high}`
    ));

    let i = low - 1;

    for (let j = low; j < high; j++) {
        steps.push(createStep(
            'compare',
            arr, { pivot: high, compare: [j], sorted: [] },
            `Comparing ${arr[j]} at index ${j} with pivot ${pivot}`
        ));

        if (arr[j] <= pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            if (i !== j) {
                steps.push(createStep(
                    'swap',
                    arr, { pivot: high, compare: [i, j], sorted: [] },
                    `Swapping ${arr[i]} at index ${i} with ${arr[j]} at index ${j}`
                ));
            }
        }
    }

    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    if (i + 1 !== high) {
        steps.push(createStep(
            'swap',
            arr, { pivot: i + 1, compare: [i + 1, high], sorted: [] },
            `Placing pivot ${pivot} at index ${i + 1}`
        ));
    }

    steps.push(createStep(
        'sorted',
        arr, { sorted: [i + 1], pivot: null, compare: [] },
        `Pivot ${pivot} is now sorted at index ${i + 1}`
    ));

    return i + 1;
}

function showFinalArray(arr) {
    const finalArrayDiv = document.getElementById("finalArray");
    finalArrayDiv.textContent = `Final Sorted Array: [${arr.join(", ")}]`;
}

function startSort() {
    const input = document.getElementById("arrayInput").value;
    originalArray = input.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    if (originalArray.length === 0) {
        alert("Please enter valid numbers separated by commas.");
        return;
    }
    steps = [];
    stepIndex = 0;
    document.getElementById("log").innerHTML = "";
    document.getElementById("currentArray").textContent = "";
    document.getElementById("finalArray").textContent = "";
    document.getElementById("startBtn").disabled = true;
    document.getElementById("nextBtn").disabled = false;

    renderBars(originalArray);
    logMessage("Starting quick sort...");
    let arrCopy = [...originalArray];
    quickSort(arrCopy, 0, originalArray.length - 1);
    logMessage("Sorting steps recorded. Click 'Next Step' to visualize.");

    if (steps.length === 0) {
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showFinalArray(originalArray);
    }
}

function nextStep() {
    if (stepIndex >= steps.length) {
        alert("Quick sort visualization complete!");
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showFinalArray(steps[steps.length - 1].array);
        return;
    }

    const step = steps[stepIndex];
    renderBars(step.array, step.highlights);
    logMessage(`Step ${stepIndex + 1}: ${step.message}`);

    stepIndex++;
}

document.getElementById("startBtn").addEventListener("click", startSort);
document.getElementById("nextBtn").addEventListener("click", nextStep);