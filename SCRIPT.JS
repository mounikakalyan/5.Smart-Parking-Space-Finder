
// SMART PARKING SPACE FINDER
// Min Heap + Graph

// 1. GRAPH REPRESENTATION
// Each edge represents distance between locations.

const graph = {
  E: { A: 2, B: 5 },
  A: { E: 2, C: 3, D: 6 },
  B: { E: 5, D: 2, F: 4 },
  C: { A: 3, D: 2, G: 5 },
  D: { A: 6, B: 2, C: 2, F: 3 },
  F: { B: 4, D: 3, H: 2 },
  G: { C: 5, H: 3 },
  H: { F: 2, G: 3 }
};

// E = Entrance
// A-H = Parking slot locations

const slots = [
  { id: "P1", node: "A" },
  { id: "P2", node: "B" },
  { id: "P3", node: "C" },
  { id: "P4", node: "D" },
  { id: "P5", node: "F" },
  { id: "P6", node: "G" },
  { id: "P7", node: "H" },
  { id: "P8", node: "A" }
];

let distances = {};
let availableHeap = [];
let occupied = {};
let records = {};

// 2. MIN HEAP IMPLEMENTATION

class MinHeap {
  constructor() {
    this.heap = [];
  }

  insert(item) {
    this.heap.push(item);
    this.heapifyUp(this.heap.length - 1);
  }

  heapifyUp(index) {
    while (index > 0) {
      let parent = Math.floor((index - 1) / 2);

      if (this.heap[parent].distance <=
          this.heap[index].distance) {
        break;
      }

      [this.heap[parent], this.heap[index]] =
        [this.heap[index], this.heap[parent]];

      index = parent;
    }
  }

  extractMin() {
    if (this.heap.length === 0) return null;

    if (this.heap.length === 1) {
      return this.heap.pop();
    }

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);

    return min;
  }

  heapifyDown(index) {
    const n = this.heap.length;

    while (true) {
      let smallest = index;
      let left = 2 * index + 1;
      let right = 2 * index + 2;

      if (left < n &&
          this.heap[left].distance <
          this.heap[smallest].distance) {
        smallest = left;
      }

      if (right < n &&
          this.heap[right].distance <
          this.heap[smallest].distance) {
        smallest = right;
      }

      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] =
        [this.heap[smallest], this.heap[index]];

      index = smallest;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }
}

const minHeap = new MinHeap();

// 3. DIJKSTRA'S SHORTEST PATH ALGORITHM

function dijkstra(start) {
  const dist = {};
  const visited = new Set();

  for (const node in graph) {
    dist[node] = Infinity;
  }

  dist[start] = 0;

  while (visited.size < Object.keys(graph).length) {
    let current = null;
    let minDistance = Infinity;

    for (const node in dist) {
      if (!visited.has(node) &&
          dist[node] < minDistance) {
        minDistance = dist[node];
        current = node;
      }
    }

    if (current === null) break;

    visited.add(current);

    for (const neighbor in graph[current]) {
      const newDistance =
        dist[current] + graph[current][neighbor];

      if (newDistance < dist[neighbor]) {
        dist[neighbor] = newDistance;
      }
    }
  }

  return dist;
}

// 4. INITIALIZE PARKING

function initialize() {
  distances = dijkstra("E");

  for (const slot of slots) {
    minHeap.insert({
      id: slot.id,
      node: slot.node,
      distance: distances[slot.node]
    });
  }

  render();
}

// 5. PARK A VEHICLE

function parkVehicle() {
  const input =
    document.getElementById("vehicleNumber");

  const vehicle = input.value.trim().toUpperCase();
  const message = document.getElementById("message");

  if (!vehicle) {
    message.textContent =
      "Please enter a vehicle number.";
    return;
  }

  if (records[vehicle]) {
    message.textContent =
      "This vehicle is already parked.";
    return;
  }

  if (minHeap.isEmpty()) {
    message.textContent =
      "Sorry! No parking slots available.";
    return;
  }

  const slot = minHeap.extractMin();

  occupied[slot.id] = vehicle;

  records[vehicle] = {
    slot: slot.id,
    node: slot.node,
    distance: slot.distance
  };

  message.textContent =
    vehicle + " assigned to " + slot.id +
    " (distance: " + slot.distance + " units).";

  input.value = "";
  render();
}

// 6. RELEASE A PARKING SLOT

function releaseVehicle(vehicle) {
  const record = records[vehicle];

  if (!record) return;

  delete occupied[record.slot];
  delete records[vehicle];

  minHeap.insert({
    id: record.slot,
    node: record.node,
    distance: record.distance
  });

  document.getElementById("message").textContent =
    vehicle + " has left. " + record.slot +
    " is now available.";

  render();
}

// 7. DISPLAY PARKING SLOTS

function renderSlots() {
  const container =
    document.getElementById("parkingSlots");

  container.innerHTML = "";

  for (const slot of slots) {
    const vehicle = occupied[slot.id];
    const isOccupied = Boolean(vehicle);

    const div = document.createElement("div");
    div.className =
      "slot " + (isOccupied ? "occupied" : "available");

    div.innerHTML = `
      <strong>${slot.id}</strong>
      ${isOccupied ? "🔴 Occupied" : "🟢 Available"}
      <small>Location: ${slot.node}</small>
      <small>Distance: ${distances[slot.node]} units</small>
      ${isOccupied
        ? `<small>${vehicle}</small>`
        : ""}
    `;

    container.appendChild(div);
  }
}

// 8. DISPLAY GRAPH

function renderGraph() {
  const container = document.getElementById("graph");

  container.innerHTML = "";

  const nodes = ["E", "A", "B", "C", "D", "F", "G", "H"];

  for (const node of nodes) {
    const div = document.createElement("div");

    div.className =
      "node " + (node === "E" ? "entrance" : "");

    const slotNames = slots
      .filter(slot => slot.node === node)
      .map(slot => slot.id);

    const status = slotNames.length
      ? slotNames.map(id =>
          occupied[id] ? "🔴" : "🟢"
        ).join(" ")
      : "";

    div.innerHTML = `
      <div>${node === "E" ? "🚪 " : "📍 "}${node}</div>
      <small>${node === "E"
        ? "Entrance"
        : "Distance: " + distances[node]}</small>
      <small>${slotNames.join(", ")}</small>
      <small>${status}</small>
    `;

    container.appendChild(div);
  }
}

// 9. DISPLAY VEHICLE RECORDS

function renderRecords() {
  const tbody = document.getElementById("records");
  tbody.innerHTML = "";

  for (const vehicle in records) {
    const record = records[vehicle];
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${vehicle}</td>
      <td>${record.slot}</td>
      <td>${record.distance} units</td>
      <td>
        <button class="release"
          onclick="releaseVehicle('${vehicle}')">
          Release
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  }
}

// 10. UPDATE DASHBOARD

function render() {
  const available = minHeap.heap.length;
  const total = slots.length;
  const occupiedCount = total - available;

  document.getElementById("total").textContent = total;
  document.getElementById("available").textContent =
    available;
  document.getElementById("occupied").textContent =
    occupiedCount;

  renderSlots();
  renderGraph();
  renderRecords();
}

// 11. RESET SYSTEM

function resetParking() {
  availableHeap = [];
  occupied = {};
  records = {};

  minHeap.heap = [];

  for (const slot of slots) {
    minHeap.insert({
      id: slot.id,
      node: slot.node,
      distance: distances[slot.node]
    });
  }

  document.getElementById("message").textContent =
    "Parking system has been reset.";

  render();
}

// START
initialize();