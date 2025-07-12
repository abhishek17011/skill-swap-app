const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend to access
app.use(express.json()); // For parsing application/json

// --- In-memory Data Store (for demonstration) ---
let USERS = [
  {
    id: "user1",
    name: "Marc Demo",
    email: "marc.demo@example.com",
    password: "password123", // In a real app, hash this!
    skillsOffered: ["Skill Demo1", "Demo Skill2", "Demo Skill3"],
    skillsWanted: ["Skill Demo4", "Demo Skill5"],
    availability: "Availability",
    profileVisibility: "Public",
    rating: 4.2,
    feedbackCount: 17,
    imgPlaceholderInitials: "MD",
    location: "New York"
  },
  {
    id: "user2",
    name: "Mitchell",
    email: "mitchell@example.com",
    password: "password123",
    skillsOffered: ["Game Dev", "Unity", "UI Design"],
    skillsWanted: ["Full Stack Dev", "Flutter", "React"],
    availability: "Availability",
    profileVisibility: "Public",
    rating: 2.5,
    feedbackCount: 8,
    imgPlaceholderInitials: "M",
    location: "Los Angeles"
  },
  {
    id: "user3",
    name: "Joe Wills",
    email: "joe.wills@example.com",
    password: "password123",
    skillsOffered: ["Game Dev", "Unity", "3D Modeling"],
    skillsWanted: ["React Native"],
    availability: "Availability",
    profileVisibility: "Public",
    rating: 4.0,
    feedbackCount: 15,
    imgPlaceholderInitials: "JW",
    location: "Chicago"
  }
];

let requests = []; // { id, requestorId, requestedId, status, message, skillOffered, skillWanted }

// --- API Endpoints ---

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find(u => u.email === email && u.password === password); // Simple check
  if (user) {
    // In a real app, you'd generate a JWT token here
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted,
      imgPlaceholderInitials: user.imgPlaceholderInitials,
      // Don't send password back!
    });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Get all public users
app.get('/api/users', (req, res) => {
  // Filter out sensitive info like password before sending
  const publicUsers = USERS.map(({ password, ...rest }) => rest);
  res.json(publicUsers);
});

// Get requests made by a specific user
app.get('/api/requests/:userId', (req, res) => {
  const { userId } = req.params;
  // In a real app, you'd verify the user's token matches userId
  const userRequests = requests.filter(r => r.requestorId === userId);
  res.json(userRequests);
});

// Create a new swap request
app.post('/api/requests', (req, res) => {
  const { requestorId, requestedId, skillOffered, skillWanted, message } = req.body;

  // Basic validation
  if (!requestorId || !requestedId || !skillOffered || !skillWanted) {
    return res.status(400).json({ message: 'Missing required request fields' });
  }

  // Check if requestor and requested users exist
  const requestor = USERS.find(u => u.id === requestorId);
  const requested = USERS.find(u => u.id === requestedId);

  if (!requestor || !requested) {
    return res.status(404).json({ message: 'Requestor or requested user not found' });
  }

  // Simple authorization: check if the requestorId in the body matches the authenticated user (for demo, we'll assume it does)
  // In a real app, you'd use middleware to extract user ID from a JWT token.
  // const authHeader = req.headers['authorization'];
  // const token = authHeader && authHeader.split(' ')[1];
  // if (!token || token !== requestorId) { // Very basic token check for demo
  //   return res.status(403).json({ message: 'Unauthorized request' });
  // }

  const newRequest = {
    id: `req${requests.length + 1}`, // Simple unique ID
    requestorId,
    requestedId,
    skillOffered,
    skillWanted,
    message: message || '',
    status: 'Pending', // Initial status
    createdAt: new Date().toISOString()
  };

  requests.push(newRequest);
  res.status(201).json(newRequest);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
