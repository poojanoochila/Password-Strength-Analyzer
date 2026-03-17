const passwordInput = document.getElementById("password");
const badge = document.getElementById("strength-badge");
const bar = document.getElementById("progress-bar");
const crackTime = document.getElementById("crack-time");
const suggestionsList = document.getElementById("suggestions");

passwordInput.addEventListener("input", async () => {
  const pwd = passwordInput.value;

  if (!pwd) {
    bar.style.width = "0%";
    bar.style.background = "#ff4d5a";
    bar.style.boxShadow = "none";
    badge.innerText = "Very Weak";
    badge.style.background = "#ff4d5a";
    crackTime.innerText = "Instant";
    suggestionsList.innerHTML = "";
    return;
  }

  const response = await fetch("/api/check_password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: pwd })
  });

  const data = await response.json();

  // Update progress bar
  bar.style.width = data.score + "%";
  if (data.label === "Weak") {
    bar.style.background = "#ff4d5a";
    bar.style.boxShadow = "none";
  } else if (data.label === "Medium") {
    bar.style.background = "#f39c12";
    bar.style.boxShadow = "0 0 10px #f39c12";
  } else {
    bar.style.background = "#2ecc71";
    bar.style.boxShadow = "0 0 15px #2ecc71";
  }

  // Update badge with subtle pop
  badge.innerText = data.label;
  badge.style.background = bar.style.background;
  badge.classList.add("update");
  setTimeout(() => badge.classList.remove("update"), 300);

  // Update crack time
  crackTime.innerText = data.crack_time;

  // Update checklist
  suggestionsList.innerHTML = "";
  const allRules = [
    { rule: "Make it at least 12 characters", valid: pwd.length >= 12 },
    { rule: "Add an uppercase letter", valid: /[A-Z]/.test(pwd) },
    { rule: "Add a lowercase letter", valid: /[a-z]/.test(pwd) },
    { rule: "Add a number", valid: /[0-9]/.test(pwd) },
    { rule: "Add a special character", valid: /[^A-Za-z0-9]/.test(pwd) },
    { rule: "Avoid common passwords", valid: !["password","123456","qwerty","admin","letmein","welcome","abc123"].includes(pwd.toLowerCase()) },
    { rule: "Avoid repeating characters", valid: !/(.)\1{2,}/.test(pwd) }
  ];

  allRules.forEach(r => {
    const li = document.createElement("li");
    li.textContent = r.rule;
    if (r.valid) li.classList.add("valid");
    suggestionsList.appendChild(li);
  });
});

// Toggle password visibility
function togglePassword() {
  passwordInput.type = passwordInput.type === "text" ? "password" : "text";
}