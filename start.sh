#!/bin/bash

echo "🚀 Starting Portfolio Chat Backend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server."
    echo "   - Add your OpenAI API key (optional)"
    echo "   - Set your JWT secret"
    echo "   - Configure CORS origins if needed"
fi

echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Test the API at http://localhost:3001/api/health"
echo ""
echo "📚 For more information, see README.md" 