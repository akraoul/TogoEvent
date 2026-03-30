const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/media', express.static(path.join(__dirname, 'media')));

// Mock data
const mockEvents = [
  {
    id: '1',
    title: 'Festival International de Musique de Lomé',
    description: 'Le plus grand festival de musique du Togo',
    date: '2024-04-15',
    time: '18:00',
    location: 'Palais des Congrès de Lomé',
    price: 5000,
    image: '/api/events/1/image',
    category: 'musique',
    available_tickets: 500
  },
  {
    id: '2', 
    title: 'Pièce de Théâtre Traditionnelle',
    description: 'Une soirée de théâtre togolais traditionnel',
    date: '2024-04-20',
    time: '19:00',
    location: 'Théâtre National',
    price: 3000,
    image: '/api/events/2/image',
    category: 'théâtre',
    available_tickets: 200
  }
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'TogoEvents API is running' });
});

app.get('/api/events', (req, res) => {
  res.json({ events: mockEvents });
});

app.get('/api/events/:id', (req, res) => {
  const event = mockEvents.find(e => e.id === req.params.id);
  if (event) {
    res.json({ event });
  } else {
    res.status(404).json({ error: 'Event not found' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Mock authentication
  res.json({
    user: { id: '1', email, name: 'Utilisateur Test' },
    token: 'mock-jwt-token'
  });
});

app.post('/api/events', (req, res) => {
  const eventData = {
    id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString(),
    status: 'published'
  };
  
  mockEvents.push(eventData);
  res.status(201).json({ 
    message: 'Event created successfully',
    event: eventData 
  });
});

app.post('/api/payments/process', (req, res) => {
  // Mock payment processing
  res.json({
    status: 'success',
    payment_id: Date.now().toString(),
    message: 'Payment processed successfully',
    tickets: req.body.ticket_types
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  // Mock registration
  res.json({
    user: { id: '2', email, name },
    token: 'mock-jwt-token'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 TogoEvents Backend API running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🎪 Events API: http://localhost:${PORT}/api/events`);
});
