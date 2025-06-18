let array = [];
let target = null;
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

        if (highlights.block && highlights.block.includes(idx)) {
            bar.classList.add("highlight-block");
        }
        if (highlights.compare && highlights.compare.includes(idx)) {
            bar.classList.add("highlight-compare");
        }
        if (highlights.found && highlights.found === idx) {
            bar.classList.add("highlight-found");
        }

        container.appendChild(bar);
    });

    document.getElementById("currentArray").textContent = `Current Array: [${arr.join(", ")}], Target: ${target}`;
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
    for (let i = start; i <= end && i < array.length; i++) res.push(i);
    return res;
}

function jumpSearch(arr, targetValue) {
    const n = arr.length;
    const step = Math.floor(Math.sqrt(n));

    let prev = 0;
    let curr = 0;

    while (curr < n && arr[curr] < targetValue) {
        steps.push(createStep(
            'jump',
            arr, { block: range(prev, curr), compare: [curr], found: null },
            `Jumping to index ${curr}, value ${arr[curr]}`
        ));
        prev = curr;
        curr += step;
        if (curr >= n) curr = n - 1;
    }

    steps.push(createStep(
        'block',
        arr, { block: range(prev, curr), compare: [], found: null },
        `Identified block from index ${prev} to ${Math.min(curr, n - 1)}`
    ));

    for (let i = prev; i <= Math.min(curr, n - 1); i++) {
        steps.push(createStep(
            'compare',
            arr, { block: range(prev, curr), compare: [i], found: null },
            `Comparing ${arr[i]} at index ${i} with target ${targetValue}`
        ));

        if (arr[i] === targetValue) {
            steps.push(createStep(
                'found',
                arr, { block: range(prev, curr), compare: [], found: i },
                `Found target ${targetValue} at index ${i}`
            ));
            return i;
        }
    }

    steps.push(createStep(
        'notfound',
        arr, { block: range(prev, curr), compare: [], found: null },
        `Target ${targetValue} not found in the array`
    ));
    return -1;
}

function showSearchResult(index) {
    const searchResultDiv = document.getElementById("searchResult");
    if (index >= 0) {
        searchResultDiv.textContent = `Search Result: Found target ${target} at index ${index}`;
    } else {
        searchResultDiv.textContent = `Search Result: Target ${target} not found`;
    }
}

function startSearch() {
    const arrayInput = document.getElementById("arrayInput").value.trim();
    const targetInput = document.getElementById("targetInput").value.trim();

    array = arrayInput.split(",").map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    target = parseInt(targetInput);

    if (array.length === 0 || isNaN(target)) {
        alert("Please enter a valid sorted array and target number.");
        return;
    }

    // Check if array is sorted
    for (let i = 1; i < array.length; i++) {
        if (array[i] < array[i - 1]) {
            alert("Array must be sorted in ascending order.");
            return;
        }
    }

    steps = [];
    stepIndex = 0;
    document.getElementById("log").innerHTML = "";
    document.getElementById("currentArray").textContent = "";
    document.getElementById("searchResult").textContent = "";
    document.getElementById("startBtn").disabled = true;
    document.getElementById("nextBtn").disabled = false;

    renderBars(array);
    logMessage(`Starting Jump Search for target ${target}...`);
    jumpSearch([...array], target);
    logMessage("Search steps recorded. Click 'Next Step' to visualize.");

    if (steps.length === 0) {
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showSearchResult(-1);
    }
}

function nextStep() {
    if (stepIndex >= steps.length) {
        alert("Jump Search visualization complete!");
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        const lastStep = steps[steps.length - 1];
        if (lastStep.type === 'found') {
            showSearchResult(lastStep.highlights.found);
        } else {
            showSearchResult(-1);
        }
        return;
    }

    const step = steps[stepIndex];
    renderBars(step.array, step.highlights);
    logMessage(`Step ${stepIndex + 1}: ${step.message}`);
    stepIndex++;
}

document.getElementById("startBtn").addEventListener("click", startSearch);
document.getElementById("nextBtn").addEventListener("click", nextStep);