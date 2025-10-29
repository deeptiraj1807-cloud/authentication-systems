const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "your_secret_key";  // Change to a secure secret in production

// Hardcoded users for demo purposes
const USERS = [
  { username: "admin", password: "adminpass", role: "Admin" },
  { username: "mod", password: "modpass", role: "Moderator" },
  { username: "user", password: "userpass", role: "User" },
];

// Middleware to verify JWT and extract user info
function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Expect "Bearer TOKEN"
  if (!token) return res.status(401).json({ message: "Malformed token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded; // decoded contains username and role
    next();
  });
}

// Middleware to authorize based on roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
}

// Login route: issues a JWT token with role in payload if credentials are valid
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
  res.json({ token });
});

// Protected routes with role-based access control
app.get("/admin-dashboard", verifyJWT, authorizeRoles("Admin"), (req, res) => {
  res.json({ message: `Hello Admin ${req.user.username}, welcome to the admin dashboard.` });
});

app.get("/moderator-panel", verifyJWT, authorizeRoles("Moderator"), (req, res) => {
  res.json({ message: `Hello Moderator ${req.user.username}, welcome to the moderator panel.` });
});

app.get("/user-profile", verifyJWT, authorizeRoles("User", "Admin", "Moderator"), (req, res) => {
  res.json({ message: `Hello ${req.user.username}, welcome to your profile.` });
});

// Fallback route for undefined endpoints
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Start the server
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
