// Freight Sales Copilot - Intelligent Parser & Workflow Engine

// In-Memory Database for Pipeline Deals
let pipelineDeals = [
  {
    id: "RFQ-8921",
    client: "Apex Chemical Middle East",
    mode: "Ocean",
    type: "2x40' HC (Class 3 Flammable)",
    origin: "Jebel Ali (AEJEA)",
    destination: "Rotterdam (NLRTM)",
    incoterm: "CIF",
    targetEtd: "Nov 15, 2026",
    status: "Handover",
    value: "\$8,400"
  },
  {
    id: "RFQ-8920",
    client: "EuroTech Electronics",
    mode: "Air",
    type: "1,450 kg / 6.2 CBM",
    origin: "Shanghai (PVG)",
    destination: "Dubai (DXB)",
    incoterm: "FCA",
    targetEtd: "Nov 08, 2026",
    status: "Quoted",
    value: "\$12,300"
  },
  {
    id: "RFQ-8919",
    client: "Nordic Pharma Distribution",
    mode: "Ocean",
    type: "1x20' Reefer (+2°C to +8°C)",
    origin: "Hamburg (DEHAM)",
    destination: "Singapore (SGSIN)",
    incoterm: "DAP",
    targetEtd: "Nov 22, 2026",
    status: "Handover",
    value: "\$9,800"
  }
];

// Pre-defined realistic sales samples
const sampleScenarios = {
  1: `Hi Shaji, client from Apex Chemicals called. They need urgent pricing for 2x40ft High Cube containers from Jebel Ali to Rotterdam port. Commodity is industrial resin, IMO Class 3 hazardous, UN 1866. Total gross weight ~38 tons. Target departure date around Nov 15th. They require CIF Rotterdam terms with 14 days free time at destination. Customer wants formal ocean quote by 2 PM tomorrow.`,
  2: `WhatsApp from EuroTech: "Need urgent air freight rate for 8 pallets of automotive sensors from Shanghai PVG to Dubai DXB. Gross weight 1,450 kg, volume 6.2 CBM. Ready for pickup at supplier warehouse near Pudong on Thursday. Needs direct flight routing, FCA Shanghai terms. Please confirm flight availability & transit time."`,
  3: `Email from Nordic Pharma: "We have an ongoing refrigerated cargo project: 1x20' Reefer container with temperature controlled pharma supplies (+2°C to +8°C). POL: Hamburg port (DEHAM) to POD: Singapore (SGSIN). Delivery terms DAP Singapore warehouse. Expected readiness Nov 22nd. Continuous temperature datalogger required."`
};

let currentParsedData = null;
let currentFollowupMode = 'whatsapp';

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  setupNavigation();
  setupEventListeners();
  renderPipelineList();
  renderRateBenchmarks();
});

// Setup Tab Navigation
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const screens = document.querySelectorAll('.screen-view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.getAttribute('data-target');
      
      navItems.forEach(nav => nav.classList.remove('active'));
      screens.forEach(screen => screen.classList.remove('active'));

      item.classList.add('active');
      const targetScreen = document.getElementById(targetId);
      if (targetScreen) {
        targetScreen.classList.add('active');
      }
    });
  });

  // Artifact internal tabs (Enquiry / Follow-up / Ops Handover)
  const artifactTabs = document.querySelectorAll('.artifact-tabs .tab-btn');
  const artifactContents = document.querySelectorAll('.artifact-content');

  artifactTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');

      artifactTabs.forEach(t => t.classList.remove('active'));
      artifactContents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const content = document.getElementById(targetTab);
      if (content) {
        content.classList.add('active');
      }
    });
  });
}

function setupEventListeners() {
  const parseBtn = document.getElementById('parseConversationBtn');
  const clearBtn = document.getElementById('clearInputBtn');
  const voiceBtn = document.getElementById('voiceSimBtn');

  if (parseBtn) {
    parseBtn.addEventListener('click', processSalesInput);
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      document.getElementById('rawConversationInput').value = '';
      document.getElementById('extractedResultsContainer').classList.add('hidden');
    });
  }

  if (voiceBtn) {
    voiceBtn.addEventListener('click', simulateVoiceCapture);
  }

  // Auto theme / sparkle
  const themeBtn = document.getElementById('themeToggleBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      showToast("✨ AI Copilot Model v4.5 Active");
    });
  }
}

// Load pre-made realistic samples
function loadSample(id) {
  const input = document.getElementById('rawConversationInput');
  input.value = sampleScenarios[id];
  showToast(`Sample #${id} loaded`);
}

// Simulate Voice Transcription
function simulateVoiceCapture() {
  const input = document.getElementById('rawConversationInput');
  showToast("🎙️ Listening for sales dictation...");
  input.placeholder = "Listening... 'Customer wants 2 containers from Jebel Ali to Rotterdam...'";
  
  setTimeout(() => {
    input.value = sampleScenarios[1];
    input.placeholder = "Paste unstructured notes, WhatsApp chat or email here...";
    showToast("Voice transcribed successfully!");
  }, 1200);
}

// INTELLIGENT PARSER ENGINE
function processSalesInput() {
  const text = document.getElementById('rawConversationInput').value.trim();

  if (!text) {
    showToast("Please paste a conversation or pick a sample!");
    return;
  }

  const processingUI = document.getElementById('aiProcessingState');
  const resultsUI = document.getElementById('extractedResultsContainer');
  const stepText = document.getElementById('processingStepText');

  processingUI.classList.remove('hidden');
  resultsUI.classList.add('hidden');

  const steps = [
    "Detecting Trade Corridor & Equipment Type...",
    "Extracting Incoterms, Hazardous Class & Target ETD...",
    "Generating 3 Artifacts: RFQ Desk, Client Follow-up, Ops Handover..."
  ];

  let stepIdx = 0;
  const interval = setInterval(() => {
    if (stepIdx < steps.length) {
      stepText.innerText = steps[stepIdx];
      stepIdx++;
    }
  }, 400);

  setTimeout(() => {
    clearInterval(interval);
    processingUI.classList.add('hidden');
    extractFreightArtifacts(text);
    resultsUI.classList.remove('hidden');
    showToast("Artifacts Generated!");
    lucide.createIcons();
  }, 1300);
}

function extractFreightArtifacts(rawText) {
  const lower = rawText.toLowerCase();

  // Heuristics for realistic extraction
  let isAir = lower.includes('air') || lower.includes('pvg') || lower.includes('dxb') || lower.includes('flight') || lower.includes('pallets');
  let isReefer = lower.includes('reefer') || lower.includes('temperature') || lower.includes('pharma');
  let isHazardous = lower.includes('imo') || lower.includes('hazard') || lower.includes('class 3') || lower.includes('chemical');

  let origin = "Jebel Ali (AEJEA)";
  let destination = "Rotterdam (NLRTM)";
  let laneBadge = "AEJEA ➔ NLRTM";
  let mode = isAir ? "Air Freight (Express)" : (isReefer ? "Ocean Reefer" : "Ocean FCL");
  let equipment = "2 x 40' High Cube";
  let incoterm = "CIF Rotterdam";
  let targetEtd = "Nov 15, 2026";
  let commodity = "Industrial Resins & Chemicals";
  let clientName = "Apex Chemicals Global";
  let specialInstructions = "14 Days Demurrage/Detention Free Time at POD";

  if (isAir) {
    origin = "Shanghai (PVG)";
    destination = "Dubai (DXB)";
    laneBadge = "PVG ✈️ DXB";
    equipment = "8 Pallets (1,450 kg / 6.2 CBM)";
    incoterm = "FCA Shanghai";
    targetEtd = "Nov 08, 2026";
    commodity = "Automotive Electronic Sensors";
    clientName = "EuroTech Electronics";
    specialInstructions = "Direct flight required. Dangerous Goods check: Non-DG";
  } else if (isReefer) {
    origin = "Hamburg (DEHAM)";
    destination = "Singapore (SGSIN)";
    laneBadge = "DEHAM ➔ SGSIN";
    equipment = "1 x 20' Reefer (+2°C to +8°C)";
    incoterm = "DAP Singapore";
    targetEtd = "Nov 22, 2026";
    commodity = "Pharmaceutical Supplies";
    clientName = "Nordic Pharma Distribution";
    specialInstructions = "Continuous Temperature Datalogger required. Priority berth.";
  }

  currentParsedData = {
    client: clientName,
    mode: mode,
    origin: origin,
    destination: destination,
    laneBadge: laneBadge,
    equipment: equipment,
    incoterm: incoterm,
    targetEtd: targetEtd,
    commodity: commodity,
    isHazardous: isHazardous,
    specialInstructions: specialInstructions,
    rawText: rawText
  };

  // Update UI Elements
  document.getElementById('detectedLaneBadge').innerText = laneBadge;

  // 1. Populate Spec Grid
  const specGrid = document.getElementById('specGrid');
  specGrid.innerHTML = `
    <div class="spec-cell">
      <div class="spec-title">Origin Port (POL)</div>
      <div class="spec-val">${origin}</div>
    </div>
    <div class="spec-cell">
      <div class="spec-title">Destination Port (POD)</div>
      <div class="spec-val">${destination}</div>
    </div>
    <div class="spec-cell">
      <div class="spec-title">Equipment / Cargo</div>
      <div class="spec-val highlight-val">${equipment}</div>
    </div>
    <div class="spec-cell">
      <div class="spec-title">Incoterm & Free Time</div>
      <div class="spec-val">${incoterm}</div>
    </div>
    <div class="spec-cell">
      <div class="spec-title">Target ETD</div>
      <div class="spec-val">${targetEtd}</div>
    </div>
    <div class="spec-cell">
      <div class="spec-title">Commodity Profile</div>
      <div class="spec-val">${commodity}</div>
    </div>
  `;

  // 1b. Populate RFQ text for Pricing Desk
  const rfqPreview = document.getElementById('enquiryDataPreview');
  rfqPreview.innerText = 
`==============================================
FREIGHT INQUIRY (RFQ) - CARRIER DESK
REF: RFQ-${Math.floor(1000 + Math.random() * 9000)} | DATE: 04-NOV-2026
==============================================
MODE:            ${mode.toUpperCase()}
ORIGIN:          ${origin}
DESTINATION:     ${destination}
EQUIPMENT:       ${equipment}
COMMODITY:       ${commodity}
INCOTERMS:       ${incoterm}
TARGET DEPARTURE:${targetEtd}
SPECIAL REQ:     ${specialInstructions}
${isHazardous ? 'HAZARDOUS:      CLASS 3 (UN 1866) - FLASH POINT 31°C' : 'HAZARDOUS:      NO (GENERAL CARGO)'}
VALIDITY SOUGHT: 30 DAYS
==============================================`;

  // 2. Populate Client Follow-up
  renderFollowupText();

  // 3. Populate Ops Handover
  const opsPreview = document.getElementById('opsHandoverPreview');
  opsPreview.innerText = 
`[OPERATIONS HANDOVER TICKET]
TO: Freight Operations Team (Ocean/Air Desk)
FROM: Commercial Sales (Shaji Chittodan)
CLIENT ACCOUNT: ${clientName}

LANE: ${origin} ---> ${destination}
CARGO: ${equipment} | ${commodity}
COMMERCIAL TERMS: ${incoterm} | Ready: ${targetEtd}

CRITICAL OPERATIONAL CHECKS:
1. Space Confirmation: Secure priority vessel allocation with MSC/Maersk/Emirates SkyCargo.
2. Documentation: Verify MSDS certificate & Shipper's Declaration.
3. Destination Agent: Notify overseas agent for destination free time agreement (${specialInstructions}).
4. Billing Milestone: Deposit & BL release milestone verified.`;
}

// Switch Followup Template (WhatsApp vs Email)
function switchFollowupChannel(channel) {
  currentFollowupMode = channel;
  document.getElementById('btnChannelWhatsApp').classList.toggle('active', channel === 'whatsapp');
  document.getElementById('btnChannelEmail').classList.toggle('active', channel === 'email');
  renderFollowupText();
}

function renderFollowupText() {
  if (!currentParsedData) return;
  const box = document.getElementById('followupContentBox');
  const d = currentParsedData;

  if (currentFollowupMode === 'whatsapp') {
    box.innerText = 
`Hi team ${d.client},

Thank you for your freight inquiry today! 🚢✈️

We have logged your request for:
📍 Lane: ${d.origin} ➔ ${d.destination}
📦 Cargo: ${d.equipment} (${d.commodity})
📋 Terms: ${d.incoterm} | Target ETD: ${d.targetEtd}

Our pricing desk is already securing vessel allocation and the sharpest spot rates with the carriers. We will share your complete commercial quote with transit schedule by 2:00 PM tomorrow.

Let me know if you have any additional documentation to attach!

Best regards,
Shaji Chittodan | Freight Sales`;
  } else {
    box.innerText = 
`Subject: Rate Inquiry Acknowledgement: ${d.origin} to ${d.destination} [${d.equipment}]

Dear ${d.client} Logistics Team,

Thank you for reaching out to us for your freight movement requirement.

This is to confirm that our commercial desk has ingested your inquiry:
- Port of Loading (POL): ${d.origin}
- Port of Discharge (POD): ${d.destination}
- Equipment / Volume: ${d.equipment}
- Commodity Description: ${d.commodity}
- Agreed Incoterms: ${d.incoterm}
- Target Schedule: ETD ${d.targetEtd}

We are currently evaluating carrier schedules and contract allocations to deliver the most competitive freight solution with optimal transit times. A comprehensive quotation with free-time breakdown will be provided shortly.

Sincerely,
Shaji Chittodan
Senior Freight & Logistics Solutions`;
  }
}

// Copy helper
function copyContent(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    showToast("📋 Copied to clipboard!");
  }).catch(() => {
    showToast("Copied text!");
  });
}

function copyFollowupText() {
  copyContent('followupContentBox');
}

function openWhatsAppShare() {
  if (!currentParsedData) return;
  const text = encodeURIComponent(document.getElementById('followupContentBox').innerText);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
}

// Pipeline operations
function saveToPipeline() {
  if (!currentParsedData) return;
  const newDeal = {
    id: `RFQ-${Math.floor(1000 + Math.random() * 9000)}`,
    client: currentParsedData.client,
    mode: currentParsedData.mode.includes('Air') ? 'Air' : 'Ocean',
    type: currentParsedData.equipment,
    origin: currentParsedData.origin,
    destination: currentParsedData.destination,
    incoterm: currentParsedData.incoterm,
    targetEtd: currentParsedData.targetEtd,
    status: "Quoted",
    value: "\$10,500"
  };

  pipelineDeals.unshift(newDeal);
  renderPipelineList();
  showToast("Saved to Active Pipeline!");

  // Switch badge count
  document.getElementById('navBadge').innerText = pipelineDeals.length;
}

function dispatchToOps() {
  showToast("🚀 Handover ticket dispatched to Operations Desk!");
}

function renderPipelineList(filter = 'all') {
  const listEl = document.getElementById('pipelineCardsList');
  if (!listEl) return;

  let filtered = pipelineDeals;
  if (filter === 'Ocean') filtered = pipelineDeals.filter(d => d.mode === 'Ocean');
  if (filter === 'Air') filtered = pipelineDeals.filter(d => d.mode === 'Air');
  if (filter === 'Handover') filtered = pipelineDeals.filter(d => d.status === 'Handover');

  listEl.innerHTML = filtered.map(deal => `
    <div class="deal-card">
      <div class="deal-top">
        <span class="deal-client">${deal.client}</span>
        <span class="deal-badge ${deal.mode.toLowerCase()}">${deal.mode}</span>
      </div>
      <div class="deal-lane">
        <i data-lucide="navigation-2" style="width:13px; height:13px;"></i>
        <span>${deal.origin} ➔ ${deal.destination}</span>
      </div>
      <div class="deal-meta-row">
        <span>${deal.type}</span>
        <strong style="color:var(--accent-emerald);">${deal.value}</strong>
      </div>
      <div class="deal-meta-row">
        <span>Incoterm: ${deal.incoterm}</span>
        <span>ETD: ${deal.targetEtd}</span>
      </div>
      <div class="deal-actions">
        <button class="deal-action-btn" onclick="showToast('Opened deal ${deal.id}')">
          <i data-lucide="external-link" style="width:12px; height:12px;"></i> View
        </button>
        <button class="deal-action-btn" onclick="showToast('Transferred to Ops')">
          <i data-lucide="check-check" style="width:12px; height:12px;"></i> Handover
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
  document.getElementById('pipelineCounterBadge').innerText = `${filtered.length} Deals`;
}

function filterPipeline(category) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderPipelineList(category);
}

// Rates Radar calculation
function renderRateBenchmarks() {
  const ratesBox = document.getElementById('rateBenchmarks');
  if (!ratesBox) return;

  ratesBox.innerHTML = `
    <div class="corridor-card">
      <div class="corridor-header">
        <span class="corridor-mode"><i data-lucide="ship" style="width:15px; color:var(--accent-cyan)"></i> Ocean 40' HC</span>
        <span class="corridor-rate">\$2,850 - \$3,200</span>
      </div>
      <div class="corridor-details">
        <span>Transit: 22-26 Days (Direct)</span>
        <span>Index: Drewry Spot +4.2%</span>
      </div>
    </div>

    <div class="corridor-card">
      <div class="corridor-header">
        <span class="corridor-mode"><i data-lucide="plane" style="width:15px; color:var(--accent-purple)"></i> Air Cargo (+500kg)</span>
        <span class="corridor-rate">\$3.45 / kg</span>
      </div>
      <div class="corridor-details">
        <span>Transit: 1-2 Days (Direct)</span>
        <span>TAC Benchmark Stable</span>
      </div>
    </div>

    <div class="corridor-card">
      <div class="corridor-header">
        <span class="corridor-mode"><i data-lucide="thermometer-snowflake" style="width:15px; color:var(--accent-amber)"></i> Ocean Reefer 40'</span>
        <span class="corridor-rate">\$4,600 - \$5,100</span>
      </div>
      <div class="corridor-details">
        <span>GenSet Included</span>
        <span>Space: High Demand</span>
      </div>
    </div>
  `;
  lucide.createIcons();
}

function calculateRateBenchmark() {
  showToast("Scanning live spot benchmark indices...");
  setTimeout(() => {
    renderRateBenchmarks();
    showToast("Updated with latest Drewry/SCFI rates!");
  }, 600);
}

// Toast System
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const msgEl = document.getElementById('toastMsg');
  if (!toast || !msgEl) return;

  msgEl.innerText = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

