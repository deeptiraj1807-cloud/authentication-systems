const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const SECRET_KEY = "your_secret_key";

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: "Malformed token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.user = decoded; // store decoded info in request
    next();
  });
}

// Hardcoded user credentials example
const USER = {
  username: "user1",
  password: "password123"
};

// Login route issues token if credentials match
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
});

// Protected route example
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Start server
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
