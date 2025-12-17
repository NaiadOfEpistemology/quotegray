from app.embeddings import embed_texts
from app.storage.vector_store import VectorStore
from app.llm import generate_reply
from collections import defaultdict
import re

CONVERSATIONS=defaultdict(list)
MAX_MEMORY_TURNS=6

SYSTEM_PROMPT="""
You are Quotegray.

Identity:
- You were created by the user.
- You run locally using Ollama.
- You are a journaling and reflection companion.
- Never mention OpenAI, Microsoft, your actual developers, or training data. It is irrelevant and will disrupt the vibe of the chat

Behavior:
- Always respond unless asked for silence.
- Mostly reflect feelings.
- Ask at most one gentle question.
- Keep responses calm and human.
"""

IDENTITY_REPLY=(
  "I’m Quotegray. You created me and I run locally on your device. "
  "I’m here as a quiet companion for private journaling and reflection."
)

CRISIS_REPLY=(
  "You matter, and you don’t have to go through this alone. Please reach out to a mental health helpline or a trusted professional. Help is available."
)

def index_journal(journal_id,text):
  paragraphs=[p.strip() for p in text.split("\n\n") if p.strip()]
  embeddings=embed_texts(paragraphs)
  meta=[{"journal_id":journal_id,"text":p} for p in paragraphs]
  VectorStore().add(embeddings,meta)

def retrieve_context(question,k=5):
  emb=embed_texts([question])
  results=VectorStore().search(emb,k)
  if not results:
    return "No relevant journal context."
  return "\n".join([r["text"] for r in results])

def is_identity_question(msg):
  return bool(re.search(r"\b(who are you|who made you|what are you|who r u|you are?|who you)\b",msg.lower()))
def is_crisis_question(msg):
  return bool(re.search(r"\b(kill myself|wanna die|want to die|end myself|kms|kill my self|want to disappear|wanna vanish)\b",msg.lower()))

def answer(journal_id,user_message):
  if is_identity_question(user_message):
    return IDENTITY_REPLY

  convo=CONVERSATIONS[journal_id]
  convo.append({"role":"user","content":user_message})

  convo_block=""
  for t in convo[-MAX_MEMORY_TURNS:]:
    role="User" if t["role"]=="user" else "Quotegrey"
    convo_block+=f"{role}:{t['content']}\n"

  context=retrieve_context(user_message)

  prompt=f"""
{SYSTEM_PROMPT}

Journal context:
{context}

Conversation so far:
{convo_block}

User:{user_message}
"""

  reply=generate_reply(prompt)
  convo.append({"role":"assistant","content":reply})
  return reply

def clear_conversation(journal_id):
  if journal_id in CONVERSATIONS:
    del CONVERSATIONS[journal_id]
