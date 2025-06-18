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

        if (highlights.range && highlights.range.includes(idx)) {
            bar.classList.add("highlight-range");
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

function binarySearch(arr, targetValue, left, right) {
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        steps.push(createStep(
            'compare',
            arr, { range: range(left, right), compare: [mid], found: null },
            `Binary search: Comparing ${arr[mid]} at index ${mid} with target ${targetValue}`
        ));

        if (arr[mid] === targetValue) {
            steps.push(createStep(
                'found',
                arr, { range: range(left, right), compare: [], found: mid },
                `Found target ${targetValue} at index ${mid}`
            ));
            return mid;
        } else if (arr[mid] < targetValue) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    steps.push(createStep(
        'notfound',
        arr, { range: range(left, right), compare: [], found: null },
        `Target ${targetValue} not found in range [${left}, ${right}]`
    ));
    return -1;
}

function exponentialSearch(arr, targetValue) {
    if (arr.length === 0) return -1;

    // Check first element
    steps.push(createStep(
        'check',
        arr, { range: [], compare: [0], found: null },
        `Checking first element ${arr[0]} at index 0`
    ));
    if (arr[0] === targetValue) {
        steps.push(createStep(
            'found',
            arr, { range: [], compare: [], found: 0 },
            `Found target ${targetValue} at index 0`
        ));
        return 0;
    }

    // Exponential phase
    let i = 1;
    while (i < arr.length && arr[i] <= targetValue) {
        steps.push(createStep(
            'jump',
            arr, { range: [], compare: [i], found: null },
            `Jumping to index ${i}, value ${arr[i]}`
        ));
        i *= 2;
    }

    // Binary search in the identified range
    let left = Math.floor(i / 2);
    let right = Math.min(i, arr.length - 1);
    steps.push(createStep(
        'range',
        arr, { range: range(left, right), compare: [], found: null },
        `Identified range from index ${left} to ${right}`
    ));

    return binarySearch(arr, targetValue, left, right);
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
    logMessage(`Starting Exponential Search for target ${target}...`);
    exponentialSearch([...array], target);
    logMessage("Search steps recorded. Click 'Next Step' to visualize.");

    if (steps.length === 0) {
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showSearchResult(-1);
    }
}

function nextStep() {
    if (stepIndex >= steps.length) {
        alert("Exponential Search visualization complete!");
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