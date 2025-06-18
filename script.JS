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
        bar.style.height = `${num * 5}px`; // Increased scale for larger bars

        const label = document.createElement("span");
        label.textContent = num;
        bar.appendChild(label);

        if (highlights.left && highlights.left.includes(idx)) {
            bar.classList.add("highlight-left");
        }
        if (highlights.right && highlights.right.includes(idx)) {
            bar.classList.add("highlight-right");
        }
        if (highlights.merged && highlights.merged.includes(idx)) {
            bar.classList.add("highlight-merge");
        }

        container.appendChild(bar);
    });

    // Display current array state
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

function mergeSort(arr, left, right) {
    if (left >= right) return;

    let mid = Math.floor((left + right) / 2);

    steps.push(createStep(
        'split',
        arr, { left: range(left, mid), right: range(mid + 1, right), merged: [] },
        `Split array indices [${left}..${right}] into [${left}..${mid}] and [${mid+1}..${right}]`
    ));

    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

function merge(arr, left, mid, right) {
    let leftArr = arr.slice(left, mid + 1);
    let rightArr = arr.slice(mid + 1, right + 1);

    let i = 0,
        j = 0,
        k = left;

    while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i];
            steps.push(createStep(
                'merge',
                arr, { merged: range(left, k), left: [k], right: [] },
                `Placing ${leftArr[i]} from left at index ${k}`
            ));
            i++;
        } else {
            arr[k] = rightArr[j];
            steps.push(createStep(
                'merge',
                arr, { merged: range(left, k), left: [], right: [k] },
                `Placing ${rightArr[j]} from right at index ${k}`
            ));
            j++;
        }
        k++;
    }

    while (i < leftArr.length) {
        arr[k] = leftArr[i];
        steps.push(createStep(
            'merge',
            arr, { merged: range(left, k), left: [k], right: [] },
            `Placing remaining ${leftArr[i]} from left at index ${k}`
        ));
        i++;
        k++;
    }

    while (j < rightArr.length) {
        arr[k] = rightArr[j];
        steps.push(createStep(
            'merge',
            arr, { merged: range(left, k), left: [], right: [k] },
            `Placing remaining ${rightArr[j]} from right at index ${k}`
        ));
        j++;
        k++;
    }

    steps.push(createStep(
        'merge',
        arr, { merged: range(left, right), left: [], right: [] },
        `Merged subarray indices [${left}..${right}]`
    ));
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
    logMessage("Starting merge sort...");
    let arrCopy = [...originalArray];
    mergeSort(arrCopy, 0, originalArray.length - 1);
    logMessage("Sorting steps recorded. Click 'Next Step' to visualize.");

    if (steps.length === 0) {
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showFinalArray(originalArray);
    }
}

function nextStep() {
    if (stepIndex >= steps.length) {
        alert("Merge sort visualization complete!");
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