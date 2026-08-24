// ======================
// Tenacity Locksmiths – Phase 1 Customer Form (Improved)
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

  function getDeviceId() {
    let id = localStorage.getItem("tenacity_device_id");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem("tenacity_device_id", id);
    }
    return id;
  }

  function canSubmit() {
    const key = "tenacity_submissions";
    const now = Date.now();
    let history = JSON.parse(localStorage.getItem(key) || "[]");
    history = history.filter(t => now - t < 2 * 60 * 60 * 1000);
    return history.length < 3;
  }

  function recordSubmission() {
    const key = "tenacity_submissions";
    let history = JSON.parse(localStorage.getItem(key) || "[]");
    history.push(Date.now());
    localStorage.setItem(key, JSON.stringify(history));
  }

  function goToStep(stepNumber) {
    // Hide all steps
    document.querySelectorAll(".step").forEach(function(s) {
      s.classList.remove("active");
      s.style.display = "none";
    });

    // Show the target step
    const step = document.getElementById("step" + stepNumber);
    if (step) {
      step.classList.add("active");
      step.style.display = "block";
    }

    // Update progress bar
    const bar = document.getElementById("progressBar");
    if (bar) bar.style.width = (stepNumber / 5 * 100) + "%";

    window.scrollTo(0, 0);
  }

  // ========== STEP 1: Service selection ==========
  function handleOptionClick(btn) {
    formData.service = btn.getAttribute("data-value");
    formData.category = btn.getAttribute("data-category");
    goToStep(2);
  }

  document.querySelectorAll("#step1 .option-btn").forEach(function(btn) {
    btn.addEventListener("click", function(e) {
      e.preventDefault();
      handleOptionClick(this);
    });
    // Also support touch for mobile
    btn.addEventListener("touchend", function(e) {
      e.preventDefault();
      handleOptionClick(this);
    });
  });

  // ========== STEP 2 ==========
  var back1 = document.getElementById("backToStep1");
  if (back1) back1.onclick = function() { goToStep(1); };

  var to3 = document.getElementById("toStep3");
  if (to3) {
    to3.onclick = function() {
      var phone = document.getElementById("phone").value.trim();
      var location = document.getElementById("location").value.trim();
      var name = document.getElementById("name").value.trim();
      var valid = true;

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
    };
  }

  // ========== STEP 3 ==========
  var back2 = document.getElementById("backToStep2");
  if (back2) back2.onclick = function() { goToStep(2); };

  var to4 = document.getElementById("toStep4");
  if (to4) {
    to4.onclick = function() {
      var manufacturer = document.getElementById("manufacturer").value.trim();
      var model = document.getElementById("model").value.trim();
      var startType = document.querySelector('input[name="startType"]:checked');
      var valid = true;

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
    };
  }

  // ========== STEP 4 ==========
  function buildProblemOptions(startType) {
    var container = document.getElementById("problemOptions");
    if (!container) return;
    container.innerHTML = "";

    var options = startType === "Push start"
      ? ["Car won't start", "My remote works but car won't start", "Remote / key fob not working", "Other / not sure"]
      : ["Key won't go into the lock", "Lock won't turn", "Key turns but engine doesn't start", "Key is stuck in the ignition", "Other / not sure"];

    options.forEach(function(opt) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "problem-btn";
      btn.textContent = opt;
      btn.onclick = function() {
        document.querySelectorAll(".problem-btn").forEach(function(b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        formData.problem = opt;
      };
      container.appendChild(btn);
    });
  }

  var back3 = document.getElementById("backToStep3");
  if (back3) back3.onclick = function() { goToStep(3); };

  // ========== SUBMIT ==========
  var submitBtn = document.getElementById("submitRequest");
  if (submitBtn) {
    submitBtn.onclick = async function() {
      if (!formData.problem) {
        alert("Please select the problem that best describes your situation.");
        return;
      }

      if (!canSubmit()) {
        alert("You have already submitted several requests recently. Please call 0458 893 888 if urgent.");
        return;
      }

      formData.extraNotes = (document.getElementById("extraNotes") || {}).value || "";
      formData.submittedAt = new Date().toISOString();
      formData.deviceId = getDeviceId();

      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      try {
        await sendRequest(formData);
        recordSubmission();
        showConfirmation();
      } catch (err) {
        alert("Something went wrong. Please call 0458 893 888.");
        submitBtn.textContent = "Submit Request";
        submitBtn.disabled = false;
      }
    };
  }

  async function sendRequest(data) {
    var endpoint = "https://formspree.io/f/myegbeev";
    var payload = {
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
      submittedAt: new Date(data.submittedAt).toLocaleString("en-AU")
    };

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (e) {}
    return true;
  }

  function showConfirmation() {
    var box = document.getElementById("summaryBox");
    if (box) {
      box.innerHTML =
        "<div><strong>Service:</strong> " + formData.service + "</div>" +
        "<div><strong>Phone:</strong> " + formData.phone + "</div>" +
        "<div><strong>Location:</strong> " + formData.location + "</div>" +
        "<div><strong>Vehicle:</strong> " + formData.manufacturer + " " + formData.model + "</div>" +
        "<div><strong>Problem:</strong> " + formData.problem + "</div>";
    }
    goToStep(5);
  }

  // Start on step 1
  goToStep(1);
});
