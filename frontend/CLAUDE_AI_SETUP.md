# Claude AI Integration Setup Guide

## 🚀 Quick Start

### Step 1: Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy it (you'll use it next)

### Step 2: Add Environment Variables

Create or update `.env.local` in your frontend folder:

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
```

**DO NOT commit this file to git!** It should already be in `.gitignore`.

### Step 3: Install Dependencies

```bash
npm install @anthropic-ai/sdk
```

### Step 4: Start the Dev Server

```bash
npm run dev
```

### Step 5: Test Claude Integration

Visit your app:
- Chat Agent: `http://localhost:3000/chat` 
- Ask a question like "What are the top 3 procurement best practices?"

---

## 📁 Files Created

### API Routes (Claude AI Backend)

```
app/
├── api/
│   └── claude/
│       ├── chat/
│       │   └── route.ts              ← Chat endpoint
│       ├── stream/
│       │   └── route.ts              ← Streaming chat endpoint
│       └── process-document/
│           └── route.ts              ← Document processing
```

### Utilities

```
lib/
└── claudeAI.ts                        ← Claude AI helper functions
```

### Updated Components

```
app/
├── chat/
│   ├── ChatAgent.jsx                  ← Original (unchanged)
│   └── ChatAgent-Claude.jsx           ← New version with Claude AI ✨
├── rfq/
│   └── RFQAgent.jsx                   ← Ready for Claude integration
└── document/
    └── DocumentAgent.jsx              ← Ready for Claude integration
```

---

## 🔧 Environment Variables

### Required

```
ANTHROPIC_API_KEY=sk-ant-...          # Anthropic Claude API key
```

### Optional

```
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022  # Default model (auto-set)
```

---

## 🎯 How to Use

### In React Components

```tsx
import { sendMessage, getProcurementSystemPrompt } from "@/lib/claudeAI"

// Send a message to Claude
const response = await sendMessage(
  messages,
  { systemPrompt: getProcurementSystemPrompt() }
)

// Stream responses
for await (const chunk of streamMessage(messages)) {
  console.log(chunk)
}

// Process documents
const extracted = await processDocument(file)
```

---

## 📊 Available Functions

### `sendMessage(messages, options)`
Send a message and get Claude's response

**Parameters:**
- `messages`: Array of messages with role and text
- `options.systemPrompt`: Custom system prompt
- `options.useStreaming`: Enable streaming

**Returns:** Response text from Claude

### `streamMessage(messages, options)`
Stream Claude's response in real-time

**Parameters:** Same as `sendMessage`

**Returns:** AsyncGenerator yielding text chunks

### `processDocument(file)`
Process a document (PDF, Image, Excel)

**Parameters:**
- `file`: File object to process

**Returns:** Extracted data as JSON

### `getProcurementSystemPrompt(context)`
Get a pre-configured system prompt for procurement

**Parameters:**
- `context`: Additional context to include

**Returns:** System prompt string

---

## 🛠️ API Endpoints

### POST `/api/claude/chat`

Send a message to Claude

**Request:**
```json
{
  "messages": [
    { "role": "user", "text": "Your question here" }
  ],
  "systemPrompt": "Optional custom prompt"
}
```

**Response:**
```json
{
  "text": "Claude's response here",
  "role": "assistant"
}
```

### POST `/api/claude/stream`

Stream a response from Claude

**Request:** Same as above

**Response:** NDJSON stream (newline-delimited JSON)

### POST `/api/claude/process-document`

Process a document

**Request:** FormData with `file` field

**Response:**
```json
{
  "success": true,
  "extracted": { ...extracted data... },
  "confidence": 85
}
```

---

## 🔒 Security Notes

1. **Never commit API keys** - Use `.env.local` and `.gitignore`
2. **Rate limiting** - Claude API has rate limits
3. **Cost** - Usage is billed by token count
4. **Token limits** - Max 200k tokens per request

---

## 🐛 Troubleshooting

### "API key not found"
```
Error: Missing ANTHROPIC_API_KEY environment variable
```
**Solution:** Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local`

### "Failed to process request"
**Solution:** Check API key validity at console.anthropic.com

### "Rate limit exceeded"
**Solution:** Wait a moment and retry. Consider upgrading your plan.

### "Document processing failed"
**Solution:** Ensure file format is supported (PDF, PNG, JPG, XLSX)

---

## 📈 Next Steps

1. ✅ Install dependencies
2. ✅ Set up environment variable
3. ✅ Test chat agent at `/chat`
4. 📝 Integrate Claude AI with RFQAgent
5. 📝 Integrate Claude AI with DocumentAgent
6. 🚀 Deploy to production

---

## 🔗 Useful Links

- [Anthropic Claude Docs](https://docs.anthropic.com)
- [Claude API Pricing](https://www.anthropic.com/pricing)
- [Get API Key](https://console.anthropic.com)

---

## 📞 Support

- Check `.env.local` for API key
- Verify key is valid at console.anthropic.com
- Check browser console for error messages
- Review API response in Network tab

---

**Your Claude AI integration is ready!** 🎉
