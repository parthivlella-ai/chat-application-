# CONNECTX ⚡ Real-Time Chat & Messaging Application

CONNECTX is a full-stack, real-time messaging application architected on the **MERN** stack (MongoDB, Express.js, React.js, Node.js) with **Socket.IO** for low-latency bidirectional communication and **JWT** for authentication.

Designed with a **Midnight Obsidian + Emerald & Royal Violet** aesthetic, glassmorphism, responsive mobile drawer layouts, and robust micro-interactions.

---

## 🌟 Key Features

1. **One-to-One Real-Time Messaging**: Sub-20ms delivery powered by Socket.IO rooms.
2. **Online / Offline & Last Seen Tracking**: Real-time user presence updates with multi-tab socket management.
3. **Typing Indicators**: Debounced live indicators ("*User is typing...*") across active conversations.
4. **Message Receipts**: Visual double-check delivery and read indicators.
5. **Message Actions**:
   - **Edit Message**: Inline and modal message editing with `(edited)` badges.
   - **Delete Message**: Soft deletion ("*This message was deleted*") or local removal.
   - **Copy to Clipboard**: Quick copying from action dropdown.
6. **Rich Media & Attachments**: Image sharing with lightbox preview and document downloads.
7. **Message & User Search**: Instant search modal for discovering users and querying conversation history.
8. **Responsive Mobile Experience**: Fluid sliding drawer sidebar for seamless mobile/tablet chat.
9. **Profile Management**: Customize avatar presets, custom bio/status, and presence selector.
10. **Admin Console**: System metrics dashboard (users, messages, active today) with user moderation and suspension tools.
11. **Connection Resilience**: Connection status banner with auto-reconnection handling.

---

## 🏗️ Architecture & Technology Stack

```
                     ┌──────────────────────────────────────────────┐
                     │          React 18 + Vite Frontend (SPA)      │
                     │  - React Router DOM, Socket.IO Client, Axios │
                     │  - Custom Design System (CSS Variables/Theme)│
                     │  - Context: Auth, Socket, Chat, Toast        │
                     └───────────────┬──────────────┬───────────────┘
                                     │              │
                           REST APIs │              │ WebSockets (Socket.IO)
                         (JWT Bearer)│              │ (Real-Time Events)
                                     ▼              ▼
                     ┌──────────────────────────────────────────────┐
                     │          Node.js + Express.js Backend        │
                     │  - REST Controllers (Auth, Users, Messages)  │
                     │  - Socket.IO Manager (Presence, Rooms, Typ.) │
                     │  - Security: Helmet, RateLimit, CORS, JWT    │
                     └──────────────────────┬───────────────────────┘
                                            │
                                            ▼ Mongoose ODM
                     ┌──────────────────────────────────────────────┐
                     │                MongoDB Database              │
                     │  - Users (Unique email, username, indexes)   │
                     │  - Conversations (Participants index)        │
                     │  - Messages (conversationId + date indexes)  │
                     └──────────────────────────────────────────────┘
```

---

## 🔌 Socket.IO Real-Time Events

| Event Name | Direction | Description |
| :--- | :--- | :--- |
| `user_connected` | Client ➔ Server | Registers socket connection for user ID |
| `user_online` | Server ➔ All Clients | Broadcasts that user is now active |
| `user_offline` | Server ➔ All Clients | Broadcasts user offline status with `lastSeen` |
| `get_online_users` | Server ➔ Client | Returns array of currently online user IDs |
| `join_conversation` | Client ➔ Server | Joins conversation room for instant delivery |
| `leave_conversation` | Client ➔ Server | Leaves previous conversation room |
| `send_message` | Client ➔ Server | Dispatches new message to room and notifies recipients |
| `receive_message` | Server ➔ Room | Delivers new message payload in real-time |
| `typing_start` | Client ➔ Room | Shows typing wave indicator for active partner |
| `typing_stop` | Client ➔ Room | Hides typing wave indicator |
| `message_read` | Client ➔ Room | Broadcasts read receipt updates |
| `message_updated` | Client ➔ Room | Updates edited message text across clients |
| `message_deleted` | Client ➔ Room | Broadcasts deletion state |

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new user account.
- `POST /api/auth/login` — Sign in with email/username and password.
- `GET /api/auth/me` — Retrieve authenticated user profile.
- `PUT /api/auth/profile` — Update display name, status bio, presence, or avatar.
- `PUT /api/auth/password` — Change account password.

### Users (`/api/users`)
- `GET /api/users?search=` — Search and list users.
- `GET /api/users/:id` — Get public user profile.
- `PUT /api/users/:id` — Update user details.

### Conversations (`/api/conversations`)
- `GET /api/conversations` — Fetch user's conversation threads with unread counters.
- `POST /api/conversations` — Start or retrieve 1-on-1 chat thread.
- `GET /api/conversations/:id` — Get single conversation details.

### Messages (`/api/messages`)
- `GET /api/messages/:conversationId?before=&limit=30` — Paginated message history.
- `POST /api/messages` — Send message with optional image/attachment.
- `PUT /api/messages/:id` — Edit message content.
- `DELETE /api/messages/:id?deleteForEveryone=true` — Delete message.
- `PUT /api/messages/:id/read` — Mark message as read.
- `PUT /api/messages/conversation/:conversationId/read` — Mark all messages read.
- `GET /api/messages/search?q=` — Global search across conversation history.

### Admin (`/api/admin`)
- `GET /api/admin/stats` — Overall system statistics.
- `GET /api/admin/users?search=` — User directory with moderation status.
- `PUT /api/admin/users/:id/toggle-block` — Suspend or reactivate user account.

---

## 🔑 Demo Accounts

The database comes pre-seeded with realistic conversations and users:

| Account | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@connectx.com` | `Password123!` | System Administrator |
| **👤 Alex Chen** | `alex@connectx.com` | `Password123!` | User (UI/UX Architect) |
| **👤 Sarah Miller** | `sarah@connectx.com` | `Password123!` | User (Backend Lead) |
| **👤 Maya Patel** | `maya@connectx.com` | `Password123!` | User (Product Designer) |
| **👤 Liam Wilson** | `liam@connectx.com` | `Password123!` | User (DevOps) |

*(Quick 1-click login buttons are also built directly into the Login page!)*

---

## 🚀 Getting Started & Installation

### 1. Install All Dependencies
```bash
npm run install:all
```

### 2. Seed Demo Data
```bash
npm run seed
```

### 3. Run Backend & Frontend Concurrently
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API & Sockets**: `http://localhost:5000`

---

## 🔒 Security Best Practices Implemented
- **JWT Authentication** with HTTP Authorization Bearer headers.
- **Bcrypt password hashing** with 10 salt rounds.
- **Helmet.js** protection against HTTP headers vulnerabilities.
- **Rate limiting** on authentication endpoints to prevent brute force attacks.
- **Conversation & Message Ownership Verification** on every mutating route.
- **Sanitized error handling** to prevent database details from leaking to clients.
