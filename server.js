import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import promptSheet from './prompt-sheet.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize OpenAI (optional)
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// In-memory storage for conversations (replace with database in production)
const conversations = new Map();

// Portfolio information for AI responses (keeping for fallback)
const PORTFOLIO_INFO = {
  name: "Truong Duc Hoa",
  role: "Product Owner & Associate PM",
  skills: [
    "Product Management", "Agile", "Web3", "AI/ML", "Blockchain",
    "User Research", "Data Analysis", "Stakeholder Management"
  ],
  experience: [
    "5+ years in tech industry",
    "Built 4 Web3 products in 6 months",
    "Developed 8 AI agents in 3 months",
    "End-to-end product operations"
  ],
  projects: [
    "Web3 products and NFT platforms",
    "AI agents for various use cases",
    "Product management and agile processes"
  ],
  education: "Tech industry experience",
  interests: ["Product thinking", "Tech execution", "AI/ML", "Web3"]
};

// Generate AI response based on prompt sheet
async function generateAIResponse(userMessage) {
  const message = userMessage.toLowerCase();
  
  // First, try to match with prompt sheet questions
  for (const qa of promptSheet) {
    const questionLower = qa.question.toLowerCase();
    const answerLower = qa.answer.toLowerCase();
    
    // Check if user's message contains keywords from the question
    const questionWords = questionLower.split(' ').filter(word => word.length > 3);
    const matchingWords = questionWords.filter(word => message.includes(word));
    
    // If we have a good match (at least 2 words or exact phrase match)
    if (matchingWords.length >= 2 || message.includes(questionLower.replace(/[^\w\s]/g, ''))) {
      return qa.answer;
    }
    
    // Also check for common variations
    if (message.includes('who are you') && questionLower.includes('who are you')) {
      return qa.answer;
    }
    if (message.includes('projects') && questionLower.includes('projects')) {
      return qa.answer;
    }
    if (message.includes('achievement') && questionLower.includes('achievement')) {
      return qa.answer;
    }
    if (message.includes('career goals') && questionLower.includes('career goals')) {
      return qa.answer;
    }
  }
  
  // Simple keyword-based responses for greetings
  const responses = {
    'hello': `Hi! I'm Truong Duc Hoa, a Product Owner & Associate PM. How can I help you learn more about my work?`,
    'hi': `Hello! I'm Truong Duc Hoa, a Product Owner & Associate PM. What would you like to know about my experience?`,
    'default': `I'm Truong Duc Hoa, a Product Owner & Associate PM with over 5 years of experience in the tech industry. I'm known for my ability to learn fast and adapt to emerging technologies. What specific aspect of my work would you like to know more about?`
  };

  // Check for greeting keywords
  for (const [keyword, response] of Object.entries(responses)) {
    if (message.includes(keyword)) {
      return response;
    }
  }

  // If OpenAI is available, use it with the prompt sheet
  if (openai) {
    try {
      // Build the prompt with Q&A examples
      let promptExamples = '';
      promptSheet.forEach((qa, index) => {
        promptExamples += `Q: ${qa.question}\nA: ${qa.answer}\n\n`;
      });

      const systemPrompt = `You are Truong Duc Hoa, a Product Owner & Associate PM. Answer questions based on the following Q&A pairs. If the question is not related to my background, experience, or work, respond with: "I don't have specific information about that, but I'd be happy to tell you about my background, projects, or career goals. What would you like to know?"

${promptExamples}

Respond in a friendly, professional manner. Keep responses concise but informative. Use the examples above as a guide for how to answer similar questions.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return responses.default;
    }
  }

  return responses.default;
}

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Chat API is running'
  });
});

// Send message endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Create or get conversation
    const convId = conversationId || uuidv4();
    if (!conversations.has(convId)) {
      conversations.set(convId, []);
    }

    const conversation = conversations.get(convId);

    // Add user message
    const userMessage = {
      id: uuidv4(),
      text: message,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    conversation.push(userMessage);

    // Generate AI response
    const aiResponse = await generateAIResponse(message);
    
    const aiMessage = {
      id: uuidv4(),
      text: aiResponse,
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    conversation.push(aiMessage);

    // Keep only last 50 messages to prevent memory issues
    if (conversation.length > 50) {
      conversation.splice(0, conversation.length - 50);
    }

    res.json({
      conversationId: convId,
      messages: conversation,
      lastMessage: aiMessage
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation history
app.get('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (!conversations.has(conversationId)) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const conversation = conversations.get(conversationId);
    res.json({
      conversationId,
      messages: conversation
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear conversation
app.delete('/api/chat/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    
    if (conversations.has(conversationId)) {
      conversations.delete(conversationId);
    }

    res.json({ message: 'Conversation cleared successfully' });

  } catch (error) {
    console.error('Clear conversation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if (openai) {
    console.log(`🤖 OpenAI integration: Enabled`);
  } else {
    console.log(`🤖 OpenAI integration: Disabled (set OPENAI_API_KEY to enable)`);
  }
}); 