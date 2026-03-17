from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

common_passwords = ["password", "123456", "qwerty", "admin", "letmein", "welcome", "abc123"]

def calculate_entropy(password):
    pool = 0
    if any(c.islower() for c in password): pool += 26
    if any(c.isupper() for c in password): pool += 26
    if any(c.isdigit() for c in password): pool += 10
    if any(not c.isalnum() for c in password): pool += 32
    if pool == 0: return 0
    return math.log2(pool ** len(password))

def estimate_crack_time(entropy):
    if entropy <= 0: return "Instant"
    guesses_per_sec = 1e9
    seconds = 2**entropy / guesses_per_sec
    if seconds < 60: return "Seconds"
    if seconds < 3600: return "Minutes"
    if seconds < 86400: return "Hours"
    if seconds < 31536000: return "Days"
    if seconds < 3153600000: return "Years"
    return "Centuries+"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/check_password", methods=["POST"])
def check_password():
    pwd = request.json.get("password", "")
    score = 0
    suggestions = []

    # Rules
    if len(pwd) >= 12: score += 20
    else: suggestions.append("Make it at least 12 characters")

    if any(c.isupper() for c in pwd): score += 15
    else: suggestions.append("Add an uppercase letter")

    if any(c.islower() for c in pwd): score += 15
    else: suggestions.append("Add a lowercase letter")

    if any(c.isdigit() for c in pwd): score += 15
    else: suggestions.append("Add a number")

    if any(not c.isalnum() for c in pwd): score += 15
    else: suggestions.append("Add a special character")

    if pwd.lower() not in common_passwords: score += 10
    else: suggestions.append("Avoid common passwords")

    if not any(pwd[i] == pwd[i+1] == pwd[i+2] for i in range(len(pwd)-2)): score += 10
    else: suggestions.append("Avoid repeating characters")

    entropy = calculate_entropy(pwd)
    if entropy > 60: score += 10

    if score > 100: score = 100

    # Label
    if score >= 80: label = "Strong"
    elif score >= 50: label = "Medium"
    else: label = "Weak"

    crack_time = estimate_crack_time(entropy)

    return jsonify({
        "score": score,
        "label": label,
        "suggestions": suggestions,
        "crack_time": crack_time
    })

if __name__ == "__main__":
    app.run(debug=True)