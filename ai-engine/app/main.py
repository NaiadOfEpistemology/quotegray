from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.rag import index_journal, answer, clear_conversation

app=FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173"
  ],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)

class IndexRequest(BaseModel):
  journal_id:str
  text:str

class ChatRequest(BaseModel):
  journal_id:str
  message:str

@app.post("/index")
def index(req:IndexRequest):
  index_journal(req.journal_id,req.text)
  return {"status":"indexed"}

@app.post("/chat")
def chat(req:ChatRequest):
  msg=req.message.strip()

  if msg.lower() in ["be quiet","stay silent","silence"]:
    return {"reply":"okay."}

  reply=answer(req.journal_id,msg)
  return {"reply":reply}

@app.post("/chat/clear")
def clear(req:ChatRequest):
  clear_conversation(req.journal_id)
  return {"status":"cleared"}
