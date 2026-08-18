// ======================
// Tenacity Locksmiths – Phase 1 Customer Form
// ======================

document.addEventListener("DOMContentLoaded", function () {

  const formData = {
    category: "",
    service: "",
    phone: "",
    location: "",
    name: "",
    manufacturer: "",
    model: "",
    startType: "",
    problem: "",
    extraNotes: "",
    submittedAt: null
  };

  // Simple device fingerprint for basic anti-abuse
  function getDeviceId() {
    let id = localStorage.getItem("tenacity_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("tenacity_device_id", id);
    }
    return id;
  }

  // Rate limiting – max 3 submissions per 2 hours from same device
  function canSubmit() {
    const key = "tenacity_submissions";
    const now = Date.now();
    let history = JSON.parse(localStorage.getItem(key) || "[]");
    history = history.filter(t => now - t < 2 * 60 * 60 * 1000);
    if (history.length >= 3) return false;
    return true;
  }

  function recordSubmission() {
    const key = "tenacity_submissions";
    let history = JSON.parse(localStorage.getItem(key) || "[]");
    history.push(Date.now());
    localStorage.setItem(key, JSON.stringify(history));
  }

  // ========== STEP MANAGEMENT ==========
  function goToStep(stepNumber) {
    document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
    const step = document.getElementById("step" + stepNumber);
    if (step) step.classList.add("active");

    const progress = (stepNumber / 5) * 100;
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = progress + "%";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ========== STEP 1: Service selection ==========
  document.querySelectorAll("#step1 .option-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      formData.service = this.getAttribute("data-value");
      formData.category = this.getAttribute("data-category");
      goToStep(2);
    });
  });

  // ========== STEP 2: Contact ==========
  const backToStep1 = document.getElementById("backToStep1");
  if (backToStep1) {
    backToStep1.addEventListener("click", () => goToStep(1));
  }

  const toStep3 = document.getElementById("toStep3");
  if (toStep3) {
    toStep3.addEventListener("click", function () {
      const phone = document.getElementById("phone").value.trim();
      const location = document.getElementById("location").value.trim();
      const name = document.getElementById("name").value.trim();

      let valid = true;

      if (!phone || phone.replace(/\s/g, "").length < 8) {
        document.getElementById("phoneError").textContent = "Please enter a valid phone number";
        document.getElementById("phoneError").classList.add("show");
        valid = false;
      } else {
        document.getElementById("phoneError").classList.remove("show");
      }

      if (!location || location.length < 5) {
        document.getElementById("locationError").textContent = "Please enter the job location or address";
        document.getElementById("locationError").classList.add("show");
        valid = false;
      } else {
        document.getElementById("locationError").classList.remove("show");
      }

      if (!valid) return;

      formData.phone = phone;
      formData.location = location;
      formData.name = name;
      goToStep(3);
    });
  }

  // ========== STEP 3: Vehicle ==========
  const backToStep2 = document.getElementById("backToStep2");
  if (backToStep2) {
    backToStep2.addEventListener("click", () => goToStep(2));
  }

  const toStep4 = document.getElementById("toStep4");
  if (toStep4) {
    toStep4.addEventListener("click", function () {
      const manufacturer = document.getElementById("manufacturer").value.trim();
      const model = document.getElementById("model").value.trim();
      const startType = document.querySelector('input[name="startType"]:checked');

      let valid = true;

      if (!manufacturer) {
        document.getElementById("manufacturerError").textContent = "Please enter the manufacturer";
        document.getElementById("manufacturerError").classList.add("show");
        valid = false;
      } else {
        document.getElementById("manufacturerError").classList.remove("show");
      }

      if (!model) {
        document.getElementById("modelError").textContent = "Please enter the model and year";
        document.getElementById("modelError").classList.add("show");
        valid = false;
      } else {
        document.getElementById("modelError").classList.remove("show");
      }

      if (!startType) {
        document.getElementById("startTypeError").textContent = "Please select the start type";
        document.getElementById("startTypeError").classList.add("show");
        valid = false;
      } else {
        document.getElementById("startTypeError").classList.remove("show");
      }

      if (!valid) return;

      formData.manufacturer = manufacturer;
      formData.model = model;
      formData.startType = startType.value;

      buildProblemOptions(formData.startType);
      goToStep(4);
    });
  }

  // ========== STEP 4: Problem selection ==========
  function buildProblemOptions(startType) {
    const container = document.getElementById("problemOptions");
    if (!container) return;
    container.innerHTML = "";

    let options = [];

    if (startType === "Push start") {
      options = [
        "Car won't start",
        "My remote works but car won't start",
        "Remote / key fob not working",
        "Other / not sure"
      ];
    } else {
      options = [
        "Key won't go into the lock",
        "Lock won't turn",
        "Key turns but engine doesn't start",
        "Key is stuck in the ignition",
        "Other / not sure"
      ];
    }

    options.forEach(function (opt) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "problem-btn";
      btn.textContent = opt;
      btn.setAttribute("data-value", opt);
      btn.addEventListener("click", function () {
        document.querySelectorAll(".problem-btn").forEach(b => b.classList.remove("selected"));
        this.classList.add("selected");
        formData.problem = opt;
      });
      container.appendChild(btn);
    });
  }

  const backToStep3 = document.getElementById("backToStep3");
  if (backToStep3) {
    backToStep3.addEventListener("click", () => goToStep(3));
  }

  // ========== SUBMIT ==========
  const submitBtn = document.getElementById("submitRequest");
  if (submitBtn) {
    submitBtn.addEventListener("click", async function () {
      // Check if a problem was selected
      if (!formData.problem) {
        // Show a clear on-page message instead of only an alert
        let existingMsg = document.getElementById("problemSelectError");
        if (!existingMsg) {
          existingMsg = document.createElement("div");
          existingMsg.id = "problemSelectError";
          existingMsg.style.cssText = "background:#fef2f2;color:#dc2626;padding:12px 16px;border-radius:10px;margin-bottom:16px;font-weight:600;text-align:center;";
          existingMsg.textContent = "Please tap one of the problem options above first";
          const container = document.getElementById("problemOptions");
          if (container) container.parentNode.insertBefore(existingMsg, container.nextSibling);
        }
        // Also scroll so the user sees it
        existingMsg.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // Remove any previous error message
      const oldMsg = document.getElementById("problemSelectError");
      if (oldMsg) oldMsg.remove();

      if (!canSubmit()) {
        alert("You have already submitted several requests recently. Please call us directly on 0458 893 888 if this is urgent.");
        return;
      }

      formData.extraNotes = (document.getElementById("extraNotes")?.value || "").trim();
      formData.submittedAt = new Date().toISOString();
      formData.deviceId = getDeviceId();

      // Visual feedback
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";

      try {
        await sendRequest(formData);
        recordSubmission();
        showConfirmation();
      } catch (err) {
        console.error(err);
        alert("Something went wrong sending the request. Please call us directly on 0458 893 888.");
        submitBtn.textContent = "Submit Request";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
      }
    });
  }

  // ========== SEND REQUEST ==========
  async function sendRequest(data) {
    // Store locally
    try {
      const existing = JSON.parse(localStorage.getItem("tenacity_requests") || "[]");
      existing.unshift(data);
      localStorage.setItem("tenacity_requests", JSON.stringify(existing.slice(0, 100)));
    } catch (e) {}

    const endpoint = "https://formspree.io/f/myegbeev";

    const payload = {
      _subject: "New Job Request – " + data.service,
      service: data.service,
      category: data.category,
      phone: data.phone,
      location: data.location,
      name: data.name || "Not provided",
      manufacturer: data.manufacturer,
      model: data.model,
      startType: data.startType,
      problem: data.problem,
      extraNotes: data.extraNotes || "None",
      submittedAt: new Date(data.submittedAt).toLocaleString("en-AU"),
      deviceId: data.deviceId
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Formspree error");
      }
      return true;
    } catch (err) {
      console.warn("Could not send email notification:", err);
      // Still continue so customer sees confirmation
      return true;
    }
  }

  // ========== CONFIRMATION ==========
  function showConfirmation() {
    const box = document.getElementById("summaryBox");
    if (box) {
      box.innerHTML = `
        <div><strong>Service:</strong> ${formData.service}</div>
        <div><strong>Phone:</strong> ${formData.phone}</div>
        <div><strong>Location:</strong> ${formData.location}</div>
        <div><strong>Vehicle:</strong> ${formData.manufacturer} ${formData.model}</div>
        <div><strong>Problem:</strong> ${formData.problem}</div>
      `;
    }
    goToStep(5);
  }

  // Start at step 1
  goToStep(1);

});
