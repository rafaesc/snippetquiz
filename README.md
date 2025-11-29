# SnippetQuiz

## Overview
SnippetQuiz turns web content into interactive quizzes. The system includes a web dashboard, a browser extension for capturing content, an API gateway, a core service that manages domain logic and persistence, and an AI worker that generates questions. Messaging coordinates generation events, a cache provides locks and pub/sub, and a real‑time channel streams progress to the UI. Data persists in a relational database, with read‑optimized projections.

## Architecture
- Frontend: Web dashboard that renders authenticated pages and subscribes to real‑time quiz generation progress.
- API Gateway: Authenticates requests, enforces rate limits, proxies traffic to the core service, and hosts the real‑time server.
- Auth Service: Issues and verifies tokens, manages refresh tokens, and exposes authentication endpoints.
- Core Service: Owns the domain and persistence, updates state in response to events, and publishes fanout updates for the UI.
- AI Worker: Listens to generation requests, chunks content, calls an AI, and publishes generated results as events.
- Browser Extension: Captures page text and transcripts and submits content to the system.
- Infra: Container orchestration and database setup.

## Architecture Diagrams

### 1. System Context (High Level)
High-level overview of system components and their interactions.

```mermaid
flowchart LR
  subgraph Client
    D[Dashboard]
    X[Browser Extension]
  end

  subgraph Gateway["API Gateway"]
    G[REST Proxy]
    REDIS[(Redis Cache JWT)]
    WS[Real-time Websocket Server]
    SSE[Real-time Stream Server Events]
  end

  subgraph AuthService["Auth Service"]
    AUTH[Auth Endpoints]
    AUTHP[Auth Producer]
    PG1[(Relational DB)]
  end

  subgraph Core["Core Service"]
    API[Command Handler]
    QUERY[Query Handler]
    CONSUMERS[Message Consumers]
    FANOUT[Ephimeral Publisher]
    PG2[(Relational DB)]
  end

  subgraph AI["AI Content Service"]
    AIE[AI Endpoints]
    PYCONSUMER[Consumer]
    LLM[AI Clients]
    PG3[(Relational DB)]
  end

  subgraph Messaging Bus
    K[Kafka Event Bus]
    R[Pub/Sub Redis Cache]
  end

  D --> G
  X --> G
  G --> |JWT| API
  G --> |JWT| AUTH
  G --> |JWT| AIE
  AUTHP --> K
  PYCONSUMER --> K
  CONSUMERS --> K
  FANOUT --> R
  API --> K
  WS --> R
  WS --> D
  SSE --> R
  X --> SSE
  D --> WS
```

### 2. Core Service: Event Sourcing & CQRS
Internal architecture of the Core Service, showing how events are persisted and consumed to build projections.

```mermaid
flowchart TD
  subgraph API["Quiz API Layer"]
    CMD[Command Handler]
    QUERY[Query Handler]
    CONSUMER[Event Consumer]
  end

  subgraph ReadSide["Read Side CQRS"]
    PROJ[Projection Handler]
    READDB[(Read DB Tables)]
  end

  subgraph Domain["Domain Layer"]
    AGG[Quiz Aggregate Root]
    ES[Event Sourcing Handler]
  end

  subgraph EventStore["Event Bus"]
    REPO[Domain Event Repository]
    EVTBL[(Event Store Table)]
    BUS[Event Bus]
    KAFKA[Kafka Topics]
  end

  %% Write Side Flow
  CMD --> AGG
  QUERY --> READDB
  AGG --> ES
  ES --> REPO
  REPO --> EVTBL
  REPO -->|publish| BUS
  BUS --> KAFKA

  %% Read Side Flow
  KAFKA -.->|consume| CONSUMER
  CONSUMER --> PROJ
  PROJ --> READDB

  %% Rebuild from Events
```

### 3. AI Generation Workflow
Asynchronous flow for generating questions and topics using the AI Processor.

```mermaid
flowchart TD
  subgraph CoreService["Core Service (Java)"]
    QUIZ[Quiz Aggregate]
    CEA[Content Entry Aggregate]
    QEVT[QuizCreated Event]
    CEAEV[ContentEntryCreated Event]
  end

  subgraph AIContentService["AI Content Service (NestJS)"]
    QCONS[Quiz Consumer]
    CCONS[Content Entry Consumer]
    LLM1[LLM API]
    LLM2[LLM API]
    CESTORE[(Content Entry DB)]
  end


  subgraph CoreConsumer["Core Service Consumer "]
    AICONS[AI Event Consumer]
    QHANDLER[Question Handler]
    QSTORE[(Questions DB)]
  end

  subgraph RealTime["Real-Time"]
    REDIS[Redis Pub/Sub]
    WS[WebSocket Server]
    UI[Dashboard UI]
    EXT[Extension UI]
  end

  %% Quiz Creation Flow
  QUIZ -->|publish| QEVT
  CEA -->|publish| CEAEV
  QEVT -.->|quiz.aggregate Topic| QCONS
  CEAEV -.->|content-entry.event Topic| CCONS

  %% AI Processing
  QCONS -->LLM1
  CCONS -->LLM2
  LLM2 -->CESTORE
  LLM1 -->|ai-content-service.questions.generated Topic|AICONS
  LLM2 -->|ai-content-service.topics.generated Topic|AICONS
  

  %% Publish Results
  AICONS --> QHANDLER
  QHANDLER --> QSTORE

  %% Progress Updates
  QHANDLER -->REDIS
  REDIS -.-> WS
  WS -.-> UI
  WS -.-> EXT
```

## Core Flows
- Authentication
  - Dashboard uses secure cookies or headers for authenticated requests and may refresh tokens transparently.
  - Extension authenticates separately and can generate a one‑time code for seamless dashboard login.
- Content Capture
  - Extension submits content (full pages, selected text, transcripts) to organize within content banks.
  - **Character Animation**: Upon upload, the system analyzes the content to generate topics and a character reaction. This reaction is streamed back to the extension/dashboard in real-time, displaying an animated character with a comment.
- Generation
  - The UI requests a quiz for a bank. The gateway forwards this to the core service.
  - The AI worker consumes generation requests, chunks content, calls AI models, and emits generation progress and results as events.
  - The core service consumes generation events, persists questions, advances quiz status, and fanouts progress to the UI.
- Real‑time
  - The gateway's real‑time server subscribes to fanout messages and streams progress/completion to the browser.

## Data Model (high level)
- Content Banks: User‑scoped containers grouping entries.
- Content Entries: Captured content (page, selection, or transcript) with metadata; may be enriched over time.
- Topics: Optional user‑specific tags that can be attached to entries.
- Questions/Options: Generated questions tied to content entries.
- Event Store: Append‑only Quiz Event Store for consistency.
- Projections: Read‑optimized views built from events and state changes.

## Gateway Proxying
- Authenticated requests are forwarded to the core service with user context.
- Errors propagate with HTTP status preservation.

## Real‑Time Updates
- Pub/sub carries progress and completion events.
- The real‑time server validates users and ensures a single active generation per user.
- **Character Events**: Ephemeral events carrying character animation data are broadcasted via Redis and streamed to connected clients (Extension/Dashboard) for immediate visual feedback.

## Logic Summary
- Users create banks and add entries (from extension or dashboard).
- When a quiz is requested for a bank, content is chunked and sent to an LLM to generate questions.
- Generated questions are persisted and quiz status is advanced. Users see progress live via WebSockets and complete the quiz in the UI.