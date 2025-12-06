require('dotenv').config();

const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração CORS completa
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin']
}));

// Lidar com preflight requests
app.options('*', cors());

app.use(express.json());

// ========== ROTAS ==========

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Dreams Backend is running',
    stripeConfigured: !!process.env.STRIPE_SECRET_KEY,
    frontendUrl: process.env.FRONTEND_URL,
    timestamp: new Date().toISOString(),
    allowedOrigins: ['http://localhost:8080', 'http://localhost:5173']
  });
});

// Rota de teste CORS (que está faltando!)
app.post('/test-create-session', (req, res) => {
  console.log('✅ CORS test endpoint called from:', req.headers.origin);
  res.json({
    success: true,
    test: true,
    message: 'CORS is working correctly!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Criar sessão de checkout REAL
app.post('/create-checkout-session', async (req, res) => {
  console.log('📦 Creating checkout session...');
  console.log('Origin:', req.headers.origin);
  console.log('Body:', req.body);
  
  try {
    const { dreamId, author = 'Anonymous', country = 'Unknown' } = req.body;

    if (!dreamId) {
      return res.status(400).json({ 
        error: 'dreamId is required',
        received: req.body 
      });
    }

    // Criar sessão no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Dream Submission',
              description: `Support dream from ${author} in ${country}`,
            },
            unit_amount: 100, // $1.00 em centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/success?session_id={CHECKOUT_SESSION_ID}&dream_id=${dreamId}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/submit`,
      metadata: {
        dreamId,
        author,
        country,
        type: 'dream_submission'
      },
    });

    console.log(`✅ Session created: ${session.id} for dream ${dreamId}`);

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      dreamId: dreamId
    });

  } catch (error) {
    console.error('❌ Stripe error:', error.message);
    res.status(500).json({
      error: 'Payment failed',
      message: error.message,
      type: error.type
    });
  }
});

// Rota de teste simples
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    yourIp: req.ip,
    origin: req.headers.origin,
    time: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🚀 DREAMS BACKEND STARTED');
  console.log('='.repeat(50));
  console.log(`📡 Port: ${PORT}`);
  console.log(`🏠 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 CORS Test: POST http://localhost:${PORT}/test-create-session`);
  console.log(`🛒 Create Session: POST http://localhost:${PORT}/create-checkout-session`);
  console.log('='.repeat(50) + '\n');
});