# Task 4 — Complex Form Validation & Dynamic DOM Manipulation


🔗 **Live Demo:** [https://form-validation-108h.onrender.com](https://form-validation-108h.onrender.com)

A small single-page app demonstrating advanced form validation, live DOM updates,
and client-side routing — built with plain HTML, CSS, and JavaScript (no frameworks).

---

## Objective

Extend form validation and implement dynamic updates to the DOM.

1. Enhance form validation to include more complex rules (e.g. password strength).
2. Dynamically update the DOM based on user interactions using JavaScript.
3. Implement client-side routing for a smoother user experience.

---

## Project Structure

```
Task 4/
├── index.html      → page structure (register, login, dashboard views)
├── css/
│   └── style.css   → all styling, theming, and layout
├── js/
│   └── script.js   → validation logic, DOM updates, and routing
└── README.md        → this file
```

The project is split into three files by responsibility — structure (HTML),
appearance (CSS), and behavior (JS) — instead of one combined file.

---

## How to Run

No build tools, servers, or installs required.

**Option A — try it live:** visit [https://form-validation-108h.onrender.com](https://form-validation-108h.onrender.com)

**Option B — run it locally:**
1. Keep all three files/folders together exactly as they are.
2. Open `index.html` directly in any modern browser (double-click it, or
   right-click → Open with → your browser).

That's it — everything runs client-side.

---

## Features

### 1. Complex form validation
- **Full name** — must be at least 2 characters.
- **Email** — checked against a standard email pattern.
- **Password strength** — validated live against five rules:
  - at least 8 characters
  - one uppercase letter
  - one lowercase letter
  - one number
  - one symbol (e.g. `! @ # $`)
- **Confirm password** — must match the password exactly.
- The strength meter and rule checklist only appear while the password
  typed so far breaks a rule, and hide once every rule is satisfied.
- The **Create account** button stays disabled until all fields pass.

### 2. Dynamic DOM manipulation
- Inline success/error messages update on every keystroke (`input` events),
  not just on submit.
- A 4-bar strength meter recolors (weak → fair → good → strong) as you type.
- Each password rule in the checklist gets a "met" state (checkmark styling)
  the moment it's satisfied.
- Password fields have a show/hide toggle (eye icon) that switches the
  input's `type` and swaps the icon.
- After login, the dashboard (avatar initials, name, email, sign-in time,
  session count, activity list) is built entirely from JavaScript reading
  stored data — none of that content exists in the original HTML.

### 3. Client-side routing
- Hash-based routes: `#/register`, `#/login`, `#/dashboard`.
- Navigating between views swaps which `<section>` is visible — no page
  reloads, no server requests.
- The dashboard route is **guarded**: visiting `#/dashboard` without an
  active session automatically redirects to `#/login`.
- "Sign in" / "Create one" links update the route without a full refresh.

---

## Data & Storage

Account and session data are kept in the browser's `localStorage`, purely
for demo purposes (so a session survives a page refresh). No data is sent
to any server — everything runs locally. Clearing your browser storage
resets the demo.

> ⚠️ This is a front-end demo. Storing plaintext passwords in `localStorage`
> is fine here for demonstration, but is **not** a pattern to use in a real
> application — real apps hash passwords server-side and never keep them
> in the browser.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Structure | HTML5 |
| Styling | CSS3 (custom properties, no framework) |
| Behavior | Vanilla JavaScript (ES6+, no libraries) |
| Fonts | Google Fonts — Space Grotesk & Inter |

---

## Author

Built as part of the Cognifyz Technologies Web Development Internship.
