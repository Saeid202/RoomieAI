# Homie Connect

AI-powered connector for HomieAI — connecting seekers, landlords, and professionals.

## Overview

Homie Connect is a conversational AI platform that helps users find the right person to connect with based on what they need. It handles 4 types of connections:

1. **ROOMMATE** — Find someone to share a rental with
2. **COBUY** — Find a co-buyer to buy property together
3. **EXPERT** — Connect with a lawyer, mortgage broker, or other professional
4. **RENOVATION** — Find a contractor for repairs (normal or emergency)

## Features

- **Multi-channel support**: Telegram, WhatsApp, SMS, and in-app chat
- **AI-powered matching**: Uses Claude Sonnet 4 to understand user intent and ask smart questions
- **Double opt-in**: Never shares contact details until both parties confirm
- **Emergency dispatch**: For urgent renovation needs, blasts 4 verified contractors simultaneously

## Tech Stack

- **Runtime**: Node.js (ESM modules)
- **Framework**: Express.js
- **AI**: Anthropic Claude API (claude-sonnet-4-20250514)
- **Session Store**: Redis (in-memory fallback for dev)
- **Database**: PostgreSQL (HomieAI DB)
- **Channels**: Telegram Bot API, Meta WhatsApp Cloud API, Twilio

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## Environment Variables

See `.env.example` for all required variables.

## Webhook Endpoints

- `POST /webhook/telegram` — Telegram messages
- `GET /webhook/whatsapp` — Meta verification
- `POST /webhook/whatsapp` — WhatsApp messages
- `POST /webhook/sms` — Twilio SMS

## File Structure

```
homie-connect/
├── src/
│   ├── index.js              # Express entry point
│   ├── handlers/
│   │   ├── telegram.js       # Telegram webhook
│   │   ├── whatsapp.js       # WhatsApp webhook
│   │   └── sms.js            # Twilio SMS handler
│   └── services/
│       ├── brain.js          # Claude API + intent detection
│       ├── sessionStore.js   # Redis conversation history
│       ├── matchingEngine.js # Profile scoring + DB queries
│       ├── formatter.js      # Match card renderer per channel
│       ├── notificationService.js # Push + Telegram + SMS notifications
│       └── homieDB.js        # Postgres client
├── .env.example
├── package.json
└── README.md
```

## Launch Order

1. **Telegram** — No approval process, live in minutes
2. **SMS via Twilio** — Instant setup, great fallback
3. **In-app chat** — Web first, then mobile
4. **WhatsApp** — After Meta business verification (1-3 weeks)

## Key Rules

- Never share names, phone numbers, or profile details in chat — only after double opt-in
- All users on the platform are KYC-verified — trust the profile data
- Emergency renovations skip scoring and blast 4 contractors simultaneously
- Session history is trimmed to 20 messages and expires after 24 hours
- The AI asks max 1 question per message — never 2 at once
