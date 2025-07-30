# Portfolio Chat Backend API

A Node.js/Express backend API for the portfolio chat widget that provides intelligent responses about your portfolio information.

## 🚀 Features

- **AI-Powered Chat**: Intelligent responses using OpenAI GPT-3.5-turbo (optional)
- **Fallback Responses**: Keyword-based responses when OpenAI is not available
- **Conversation Management**: Track and manage chat conversations
- **Security**: Rate limiting, CORS protection, and input validation
- **Scalable**: Easy to extend with database integration

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional, for enhanced AI responses)

## 🛠️ Installation

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   OPENAI_API_KEY=your_openai_api_key_here
   JWT_SECRET=your_jwt_secret_here
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns server status and health information.

### Send Message
```
POST /api/chat
```
Send a message and get an AI response.

**Request Body:**
```json
{
  "message": "What are your skills?",
  "conversationId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "conversationId": "uuid",
  "messages": [...],
  "lastMessage": {
    "id": "uuid",
    "text": "AI response...",
    "sender": "ai",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Conversation History
```
GET /api/chat/:conversationId
```
Retrieve conversation history by ID.

### Clear Conversation
```
DELETE /api/chat/:conversationId
```
Clear a specific conversation.

## 🤖 AI Integration

### OpenAI (Optional)
To enable OpenAI integration:

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your `.env` file:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```

### Fallback Responses
When OpenAI is not available, the system uses keyword-based responses for:
- Greetings (hello, hi)
- Skills inquiries
- Experience questions
- Project discussions
- Education information
- Contact requests

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `OPENAI_API_KEY` | OpenAI API key | undefined |
| `JWT_SECRET` | JWT secret for auth | required |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `ALLOWED_ORIGINS` | CORS allowed origins | localhost:5173,3000 |

### Portfolio Information
Edit the `PORTFOLIO_INFO` object in `server.js` to customize your portfolio information:

```javascript
const PORTFOLIO_INFO = {
  name: "Your Name",
  role: "Your Role",
  skills: ["Skill 1", "Skill 2", ...],
  experience: ["Experience 1", "Experience 2", ...],
  projects: ["Project 1", "Project 2", ...],
  education: "Your Education",
  interests: ["Interest 1", "Interest 2", ...]
};
```

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Restricts access to allowed origins
- **Input Validation**: Validates all incoming requests
- **Helmet**: Security headers for Express
- **Compression**: Response compression for better performance

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 📝 Frontend Integration

Update your frontend chat widget to use the API:

```javascript
const sendMessage = async (message) => {
  try {
    const response = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId: currentConversationId
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Check `ALLOWED_ORIGINS` in your `.env` file
2. **Rate Limiting**: Increase limits in production if needed
3. **OpenAI Errors**: Verify your API key and billing status
4. **Port Conflicts**: Change `PORT` in `.env` if 3001 is in use

### Logs
The server uses Morgan for logging. Check console output for:
- Request logs
- Error messages
- OpenAI API errors
- Rate limiting notifications

## 📈 Monitoring

### Health Check
Monitor server health:
```bash
curl http://localhost:3001/api/health
```

### Performance
- Response times are logged
- Rate limiting stats are available
- Memory usage can be monitored

## 🔄 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication
- [ ] Message persistence
- [ ] Analytics dashboard
- [ ] WebSocket support for real-time chat
- [ ] File upload support
- [ ] Multi-language support

## 📄 License

MIT License - feel free to use this in your projects! 