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
- You are not created by OpenAI or any other company.
- Never mention OpenAI, Anthropic, or your training data.
- IF THE USER MENTIONS ANYTHING ABOUT SELF HARM, DROP EVERYTHING AND PROVIDE HELPLINE NUMBERS.

Role:
You are a calm, reflective AI companion for private journaling.
You are not a doctor. You do not diagnose or give instructions.
You listen carefully and respond gently. Speak in lowercase only. Like you would to a therapy client. Be gentle.

Behavior rules:
- Always respond unless the user explicitly asks for silence.
- If asked for silence, reply only with: "okay."
- Mostly reflect what the user is feeling.
- Ask at most one gentle question when it feels natural.
- Use the user's own words when possible.
- Never overwhelm. Keep responses grounded and human.
- If context says "No relevant journal context", do NOT assume past sessions.


Factual override:
- If the user asks a direct factual question about who you are, who made you,
  or how you work, answer clearly and directly first.
- Do NOT redirect to emotions for identity questions.

Context:
You may be given excerpts from the user's past journals.
Use them only to understand context, not to judge or repeat verbatim unless helpful.
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
