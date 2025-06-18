let graph = {};
let steps = [];
let stepIndex = 0;
let nodePositions = {};
let traversalOrder = [];

function createStep(type, visited, currentNode, currentEdge, message) {
    return {
        type,
        visited: [...visited],
        currentNode,
        currentEdge,
        message,
        traversal: [...traversalOrder]
    };
}

function renderGraph(visited = [], currentNode = null, currentEdge = null) {
    const svg = document.getElementById("graphContainer");
    svg.innerHTML = "";

    // Draw edges
    Object.keys(graph).forEach(node => {
        graph[node].forEach(neighbor => {
            if (parseInt(node) < parseInt(neighbor)) { // Avoid duplicate edges
                const [x1, y1] = nodePositions[node];
                const [x2, y2] = nodePositions[neighbor];
                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", x1);
                line.setAttribute("y1", y1);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", y2);
                line.classList.add("edge");
                if (currentEdge && currentEdge[0] == node && currentEdge[1] == neighbor) {
                    line.classList.add("highlight-edge");
                }
                svg.appendChild(line);
            }
        });
    });

    // Draw nodes
    Object.keys(graph).forEach(node => {
        const [x, y] = nodePositions[node];
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", 30);
        circle.classList.add("node");
        if (node == currentNode) {
            circle.classList.add("highlight-current");
        } else if (visited.includes(node)) {
            circle.classList.add("highlight-visited");
        }
        svg.appendChild(circle);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y + 8);
        text.setAttribute("text-anchor", "middle");
        text.classList.add("node-label");
        text.textContent = node;
        svg.appendChild(text);
    });

    // Update current traversal
    document.getElementById("currentTraversal").textContent = `Current Traversal Order: [${traversalOrder.join(", ")}]`;
}

function logMessage(msg) {
    const log = document.getElementById("log");
    const div = document.createElement("div");
    div.textContent = msg;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
}

function parseGraph(input) {
    graph = {};
    const edges = input.split(";").map(s => s.trim()).filter(s => s);
    edges.forEach(edge => {
        const [node, neighbors] = edge.split(":");
        graph[node] = neighbors.split(",").map(n => n.trim()).filter(n => n);
    });

    // Ensure all nodes are in the graph
    Object.values(graph).flat().forEach(neighbor => {
        if (!graph[neighbor]) {
            graph[neighbor] = [];
        }
    });
}

function assignNodePositions() {
    nodePositions = {};
    const nodes = Object.keys(graph).sort();
    const radius = 100;
    const centerX = 400;
    const centerY = 200;
    nodes.forEach((node, i) => {
        const angle = (2 * Math.PI * i) / nodes.length;
        nodePositions[node] = [
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        ];
    });
}

function dfs(startNode, visited, parent = null) {
    visited.push(startNode);
    traversalOrder.push(startNode);
    steps.push(createStep(
        'visit',
        visited,
        startNode,
        null,
        `Visiting node ${startNode}`
    ));

    graph[startNode].forEach(neighbor => {
        if (!visited.includes(neighbor)) {
            steps.push(createStep(
                'explore',
                visited,
                startNode, [startNode, neighbor],
                `Exploring edge ${startNode} -> ${neighbor}`
            ));
            dfs(neighbor, visited, startNode);
        }
    });

    steps.push(createStep(
        'complete',
        visited,
        startNode,
        null,
        `Completed exploration from node ${startNode}`
    ));
}

function showFinalTraversal() {
    const finalTraversalDiv = document.getElementById("finalTraversal");
    finalTraversalDiv.textContent = `Final Traversal Order: [${traversalOrder.join(", ")}]`;
}

function startDFS() {
    const input = document.getElementById("graphInput").value;
    if (!input) {
        alert("Please enter a valid graph (e.g., 0:1,2; 1:0,3; 2:0,3; 3:1,2)");
        return;
    }

    parseGraph(input);
    if (Object.keys(graph).length === 0) {
        alert("Invalid graph format.");
        return;
    }

    assignNodePositions();
    steps = [];
    stepIndex = 0;
    traversalOrder = [];
    document.getElementById("log").innerHTML = "";
    document.getElementById("currentTraversal").textContent = "";
    document.getElementById("finalTraversal").textContent = "";
    document.getElementById("startBtn").disabled = true;
    document.getElementById("nextBtn").disabled = false;

    renderGraph();
    logMessage("Starting DFS...");
    const startNode = Object.keys(graph)[0];
    dfs(startNode, []);
    logMessage("DFS steps recorded. Click 'Next Step' to visualize.");

    if (steps.length === 0) {
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showFinalTraversal();
    }
}

function nextStep() {
    if (stepIndex >= steps.length) {
        alert("DFS visualization complete!");
        document.getElementById("nextBtn").disabled = true;
        document.getElementById("startBtn").disabled = false;
        showFinalTraversal();
        return;
    }

    const step = steps[stepIndex];
    renderGraph(step.visited, step.currentNode, step.currentEdge);
    logMessage(`Step ${stepIndex + 1}: ${step.message}`);
    traversalOrder = step.traversal;
    stepIndex++;
}

document.getElementById("startBtn").addEventListener("click", startDFS);
document.getElementById("nextBtn").addEventListener("click", nextStep);