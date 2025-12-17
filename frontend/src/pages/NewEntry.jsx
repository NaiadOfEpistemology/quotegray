import {useEffect,useState,useRef} from "react"
import {useNavigate,useParams} from "react-router-dom"
import {EditorContent,useEditor} from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {TextStyle} from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import Highlight from "@tiptap/extension-highlight"
import Underline from "@tiptap/extension-underline"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import {loadJournalsForUser,saveJournalsForUser,loadAccessCode} from "../utils/storage"
import "./NewEntry.css"

export default function NewEntry(){
  const nav=useNavigate()
  const {id}=useParams()
  const isEditing=!!id

  const fileInputRef=useRef(null)
  const chatInputRef=useRef(null)
  const chatContainerRef=useRef(null)

  const [selectedImageAttrs,setSelectedImageAttrs]=useState(null)
  const [showChat,setShowChat]=useState(false)
  const [chatMessages,setChatMessages]=useState([])
  const [chatInput,setChatInput]=useState("")
  const [sending,setSending]=useState(false)

  useEffect(()=>{
    const code=loadAccessCode()
    if(!code)nav("/")
  },[nav])

  const editor=useEditor({
    extensions:[
      StarterKit.configure({underline:false}),
      Underline,
      Highlight.configure({multicolor:true}),
      TextStyle,
      Color,
      Image.extend({
        addAttributes(){
          return{
            src:{default:null},
            width:{default:"70%"},
            height:{default:"auto"}
          }
        },
        parseHTML(){
          return[{tag:"img[src]"}]
        },
        renderHTML({HTMLAttributes}){
          return["img",{
            ...HTMLAttributes,
            style:`width:${HTMLAttributes.width};height:${HTMLAttributes.height}`
          }]
        }
      }),
      Placeholder.configure({placeholder:"start writing."})
    ],
    editorProps:{
      attributes:{
        class:"tiptap-editor",
        spellCheck:"true"
      }
    },
    onSelectionUpdate:({editor})=>{
      const {selection}=editor.state
      const node=editor.state.doc.nodeAt(selection.from)
      if(node&&node.type.name==="image"){
        setSelectedImageAttrs({
          pos:selection.from,
          width:node.attrs.width,
          height:node.attrs.height
        })
      }else setSelectedImageAttrs(null)
    }
  })

  useEffect(()=>{
    if(!editor||!id)return
    const stored=loadJournalsForUser()
    const found=stored.find(j=>String(j.id)===String(id))
    if(found){
      editor.commands.setContent(found.full||"")
      setTimeout(()=>editor.commands.focus("end"),50)
    }
  },[editor,id])

  useEffect(()=>{
    if(chatContainerRef.current){
      chatContainerRef.current.scrollTop=chatContainerRef.current.scrollHeight
    }
  },[chatMessages])

  const openChat=()=>{
    setShowChat(true)
    setChatMessages([
      {
        role:"assistant",
        content:"hi. i’m quotegray.\n\ni stay on this device. nothing here is saved.\n\nwhen you go back,this chat disappears."
      }
    ])
    setTimeout(()=>chatInputRef.current?.focus(),0)
  }

  const sendMessage=async()=>{
    if(!chatInput.trim()||sending)return
    const msg=chatInput.trim()
    setChatInput("")
    setSending(true)
    setChatMessages(m=>[...m,{role:"user",content:msg}])
    try{
      const res=await fetch("http://127.0.0.1:8000/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({journal_id:id||"temp",message:msg})
      })
      const data=await res.json()
      setChatMessages(m=>[...m,{role:"assistant",content:data.reply}])
    }catch{
      setChatMessages(m=>[...m,{role:"assistant",content:"i’m here. something felt off but i’m still with you."}])
    }
    setSending(false)
  }

  const handleKey=e=>{
    if(e.key==="Enter"&&!e.shiftKey){
      e.preventDefault()
      sendMessage()
    }
  }

  const openImagePicker=()=>{
    fileInputRef.current.value=null
    fileInputRef.current.click()
  }

  const handleImagePicked=e=>{
    const file=e.target.files?.[0]
    if(!file)return
    const reader=new FileReader()
    reader.onload=()=>{
      editor.chain().focus().setImage({
        src:reader.result,
        width:"70%",
        height:"auto"
      }).run()
    }
    reader.readAsDataURL(file)
  }

  const updateImageWidth=p=>{
    const w=`${p}%`
    editor.chain().focus().updateAttributes("image",{width:w}).run()
    setSelectedImageAttrs(s=>({...s,width:w}))
  }

  const saveEntry=()=>{
    const html=editor.getHTML()
    const text=editor.getText().trim()
    if(!text)return
    const stored=loadJournalsForUser()||[]
    if(isEditing){
      saveJournalsForUser(
        stored.map(j=>String(j.id)===String(id)?{...j,full:html,preview:text.slice(0,160)}:j)
      )
    }else{
      stored.unshift({
        id:Date.now(),
        date:new Date().toISOString(),
        dateLabel:new Date().toDateString().toLowerCase(),
        preview:text.slice(0,160),
        full:html
      })
      saveJournalsForUser(stored)
    }
    nav("/home")
  }

  const deleteEntry=()=>{
    saveJournalsForUser(loadJournalsForUser().filter(j=>String(j.id)!==String(id)))
    nav("/home")
  }

  return(
    <div className="new-entry-root">
      <div className="new-entry-top">
        <span className="back-link" onClick={()=>nav("/home")}>back</span>
        <div className="entry-date">{new Date().toDateString().toLowerCase()}</div>
      </div>

      <div className="toolbar">
        <button className="tool-btn" onClick={()=>editor.chain().focus().toggleBold().run()}>B</button>
        <button className="tool-btn" onClick={()=>editor.chain().focus().toggleItalic().run()}>I</button>
        <button className="tool-btn" onClick={()=>editor.chain().focus().toggleUnderline().run()}>U</button>
        <button className="tool-btn" onClick={()=>editor.chain().focus().toggleHighlight({color:"#f7f2a0"}).run()}>highlight</button>
        <button className="tool-btn" onClick={()=>editor.chain().focus().unsetHighlight().run()}>remove</button>
        <button className="tool-btn" onClick={openImagePicker}>image</button>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImagePicked}/>
      </div>

      {selectedImageAttrs&&(
        <div className="image-resize-bar">
          <div className="small-label">image width</div>
          <input type="range" min="20" max="100" value={parseInt(selectedImageAttrs.width)} onChange={e=>updateImageWidth(e.target.value)}/>
        </div>
      )}

      <div className="entry-editor-wrapper">
        <EditorContent editor={editor}/>
      </div>

      <div className="bottom-actions">
        <div className="bottom-left">
          {!showChat&&<button className="tool-btn" onClick={openChat}>talk to quotegray</button>}
          {showChat&&(
            <div className="quotegray-chat">
              <div className="chat-messages-wrapper" ref={chatContainerRef}>
                {chatMessages.map((m,i)=>(
                  <div key={i} className={`chat-message ${m.role}`}>
                    {m.content.split("\n").map((l,idx)=><div key={idx}>{l}</div>)}
                  </div>
                ))}
              </div>
              <div className="chat-input-row">
                <input ref={chatInputRef} value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={handleKey} placeholder="say something quietly..."/>
                <button onClick={sendMessage} disabled={sending}>send</button>
              </div>
            </div>
          )}
        </div>

        <div className="bottom-right">
          {isEditing&&<button className="tool-btn" onClick={deleteEntry}>delete</button>}
          <button className="save-button" onClick={saveEntry}>{isEditing?"update entry":"save entry"}</button>
        </div>
      </div>
    </div>
  )
}