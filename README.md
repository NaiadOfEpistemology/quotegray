# Quotegray

Quotegray is a **local-first, privacy-respecting AI journaling app**.
It combines:
- A notebook style journaling UI 
- On-device AI conversation 
- Retrieval-Augmented Generation (RAG) over your own journal entries
- Zero cloud storage by default

Nothing leaves your machine unless *you* decide to change that.

## What Quotegray Is

- A personal journaling space.
- A reflective AI companion, **not** a therapist
- A technical showcase of local RAG + embeddings + LLMs
- A project designed to run on **consumer laptops**, not servers

---

## What Quotegray Is NOT

- Functionally similar to most popular AI conversational agents
- Not medical software
- Not crisis support
- Not a cloud SaaS
- Not meant to replace professional help

---

## How It Works (High Level)

### 1. Journaling (Frontend)
- Built with React + TipTap editor
- Journals are stored in your browser’s localStorage
- Closing the browser does NOT delete journals
- Clearing browser storage DOES

### 2. Embeddings & RAG (AI Engine)
- Each journal entry is split into paragraphs
- Paragraphs are embedded using Sentence Transformers
- Embeddings are stored in a local FAISS vector index
- When you talk to Quotegray:
  - Your message is embedded
  - Relevant journal paragraphs are retrieved
  - Retrieved context is injected into the prompt

This is classic RAG to an extent, but fully local.

> Important:  
> Retrieval is similarity-based, not perfect memory.  
> The AI may sometimes retrieve repetitive or loosely related context.
> The AI might not make sense sometimes. Do remember that quotegray is my brainchild.
> It could respond slowly, pleas be patient.

---

## The AI Model

- Uses **Ollama** (local LLM runtime)
- Default model tested: **phi-3**
- The model:
  - Runs entirely on your device
  - Has no internet access
  - Has no persistent memory beyond the current chat

> LLM Behavior Warning  
> Local LLMs may:
> - Sound repetitive
> - Miss emotional nuance
> - Respond oddly in edge cases
> - Fail silently if system resources are low

---

## Conversation Memory

- Chat memory exists **only while the chat is open**
- When you go back from the journal entry:
  - Chat history is destroyed
  - Nothing is saved
- **Journals are NOT automatically fed into chat unless retrieved by RAG**

---

## Access Code (Very Important)

- The access code:
  - Is the **only identifier** for your journals
  - Is stored locally in the browser
  - Is **not recoverable**

**If you forget the access code, your journals are permanently inaccessible.**

There is no reset, no backend recovery, no admin override.

This is intentional.

---

## Features 
- Private journaling stored locally
- On-device AI reflection (no cloud, no data sharing)
- Retrieval-Augmented Generation (RAG) using journal history
- Dockerized fullstack setup
- Works offline once set up

## Must know 

## Tech Stack
- React + TipTap (frontend)
- FastAPI (backend)
- Sentence Transformers + FAISS
- Ollama (local LLM)
- Docker + Docker Compose

## Prereqs before setup
- Install Docker Desktop
- Install ollama
- Install and run phi3
```bash
ollama pull phi3
ollama run phi3
```
**- Leave Docker and ollama running in the background before you start setup.**

## Setup
Clone the repository 
```bash
git clone https://github.com/NaiadOfEpistemology/quotegray.git
cd quotegray
docker compose up --build
```

Frontend: http://localhost:4173 (OPEN THIS)
Backend API: http://localhost:8000

## Philosophy
No accounts.
No tracking.
No cloud AI.
Your thoughts stay with you.

## Note
This project was built end-to-end, frontend, storage, embeddings, RAG, local LLMs, and Docker with intent, not templates.

I built Quotegray as a private space. Not a product, not a platform. It’s meant to live quietly on your device, imperfect but honest.

If something feels a little rough or strange, that’s okay. This project values privacy, autonomy, and calm over loudness.

<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/7e4e3933-ca67-4084-bd5f-83a058e1cc35" />
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/9d5a378e-7def-4ed3-950f-d0fdfe20aedc" />
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/d3e00837-15ee-49d4-ac43-c13272576eb7" />
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/ef4e2d2d-2f64-4219-8369-44c6d112eea4" />
<img width="1440" height="900" alt="image" src="https://github.com/user-attachments/assets/140cdecf-7a59-416a-9c62-523c8f448d0f" />

Copyright © 2025 Tanvi V R Medapati.
