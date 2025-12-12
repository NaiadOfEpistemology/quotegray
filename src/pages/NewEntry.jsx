import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  loadJournalsForUser,
  saveJournalsForUser,
  loadAccessCode,
} from "../utils/storage";
import "./NewEntry.css";

function NewEntry() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const fileInputRef = useRef(null);
  const [selectedImageAttrs, setSelectedImageAttrs] = useState(null);

  // if no access code present, send back to register
  useEffect(() => {
    const code = loadAccessCode();
    if (!code) nav("/");
  }, [nav]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ underline: false }), // avoid duplicate underline
      Underline,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Image.extend({
        addAttributes() {
          return {
            src: {},
            alt: { default: null },
            title: { default: null },
            width: { default: "70%" },
          };
        },
      }),
      Placeholder.configure({ placeholder: "start writing." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "tiptap-editor",
        spellCheck: "true",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { state } = editor;
      const { selection } = state;
      const node = state.doc.nodeAt(selection.from);
      if (node && node.type && node.type.name === "image") {
        const width = node.attrs.width || "70%";
        setSelectedImageAttrs({
          src: node.attrs.src,
          width,
          pos: selection.from,
        });
      } else {
        setSelectedImageAttrs(null);
      }
    },
  });

  /* --- load existing entry when editing --- */
  useEffect(() => {
    if (!editor) return;
    if (!id) return;

    const stored = loadJournalsForUser();
    const found = stored.find((j) => String(j.id) === String(id));
    if (found) {
      // set content once editor is ready
      editor.commands.setContent(found.full || "");
      // focus at end after a short delay so view is available
      setTimeout(() => {
        if (editor && editor.view) editor.commands.focus("end");
      }, 60);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, id]);

  /* --- formatting helpers --- */
  const toggleBold = () => editor && editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor && editor.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor && editor.chain().focus().toggleUnderline().run();

  const setPenColor = (color) => {
    if (!editor) return;
    editor.chain().focus().setColor(color).run();
  };

  const setHighlight = () => {
    if (!editor) return;
    editor.chain().focus().toggleHighlight({ color: "#f7f2a0" }).run();
  };

  const removeHighlight = () => {
    if (!editor) return;
    editor.chain().focus().unsetHighlight().run();
  };

  /* --- image insert & resizing --- */
  const openImagePicker = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleImagePicked = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result, width: "70%" }).run();
    };
    reader.readAsDataURL(file);
  };

  const updateSelectedImageWidth = (percent) => {
    if (!selectedImageAttrs || !editor) return;
    const widthStr = `${percent}%`;
    try {
      editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const pos = selectedImageAttrs.pos;
          const node = tr.doc.nodeAt(pos);
          if (node && node.type && node.type.name === "image") {
            tr.setNodeMarkup(pos, undefined, { ...node.attrs, width: widthStr });
            editor.view.dispatch(tr);
            return true;
          }
          return false;
        })
        .run();
      setSelectedImageAttrs((s) => (s ? { ...s, width: widthStr } : s));
    } catch (e) {
      // fallback
      editor.chain().focus().updateAttributes("image", { width: widthStr }).run();
      setSelectedImageAttrs((s) => (s ? { ...s, width: widthStr } : s));
    }
  };

  /* --- save entry --- */
  const saveEntry = () => {
    if (!editor) return;
    const html = editor.getHTML();
    const text = editor.getText().trim();
    if (!text) return;

    const stored = loadJournalsForUser() || [];
    if (isEditing) {
      const updated = stored.map((j) =>
        String(j.id) === String(id) ? { ...j, full: html, preview: editor.getText().slice(0, 160) } : j
      );
      saveJournalsForUser(updated);
    } else {
      const entry = {
        id: Date.now(),
        date: new Date().toISOString(),
        dateLabel: new Date().toDateString().toLowerCase(),
        preview: editor.getText().slice(0, 160),
        full: html,
      };
      stored.unshift(entry);
      saveJournalsForUser(stored);
    }

    // navigate back to home; Home will reload journals on focus/mount
    nav("/home");
  };

  /* --- delete entry when editing --- */
  const deleteEntry = () => {
    if (!isEditing) return;
    const stored = loadJournalsForUser() || [];
    const filtered = stored.filter((j) => String(j.id) !== String(id));
    saveJournalsForUser(filtered);
    nav("/home");
  };

  return (
    <div className="new-entry-root">
      <div className="new-entry-top">
        <span className="back-link" onClick={() => nav("/home")}>
          ← back
        </span>
        <div className="entry-date">{new Date().toDateString().toLowerCase()}</div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <button className="tool-btn" onMouseDown={(e) => e.preventDefault()} onClick={toggleBold}>
          B
        </button>
        <button className="tool-btn" onMouseDown={(e) => e.preventDefault()} onClick={toggleItalic}>
          I
        </button>
        <button className="tool-btn" onMouseDown={(e) => e.preventDefault()} onClick={toggleUnderline}>
          U
        </button>

        <button className="tool-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => setHighlight()}>
          highlight
        </button>
        <button className="tool-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => removeHighlight()}>
          remove highlight
        </button>

        <div className="pen-colors" aria-hidden>
          <div className="pen-option" style={{ background: "#111" }} onClick={() => setPenColor("#111")} />
          <div className="pen-option" style={{ background: "#555" }} onClick={() => setPenColor("#555")} />
          <div className="pen-option" style={{ background: "#003459" }} onClick={() => setPenColor("#003459")} />
          <div className="pen-option" style={{ background: "#8b0000" }} onClick={() => setPenColor("#8b0000")} />
        </div>

        <button className="tool-btn" onMouseDown={(e) => e.preventDefault()} onClick={openImagePicker}>
          image
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePicked} />
      </div>

      {/* IMAGE RESIZER */}
      {selectedImageAttrs && (
        <div className="image-resize-bar">
          <div className="small-label">image width</div>
          <input
            type="range"
            min="20"
            max="100"
            value={parseInt(String(selectedImageAttrs.width).replace("%", ""))}
            onChange={(e) => updateSelectedImageWidth(Number(e.target.value))}
          />
          <button
            className="tool-btn"
            onClick={() => editor && editor.chain().focus().updateAttributes("image", { width: "100%" }).run()}
          >
            full
          </button>
        </div>
      )}

      {/* EDITOR */}
      <div className="entry-editor-wrapper">{editor ? <EditorContent editor={editor} /> : <div>loading editor...</div>}</div>

      <div className="bottom-actions">
        {isEditing && (
          <button className="tool-btn" onClick={deleteEntry} style={{ marginRight: 8 }}>
            delete
          </button>
        )}
        <button className="save-button" onClick={saveEntry}>
          {isEditing ? "update entry" : "save entry"}
        </button>
      </div>
    </div>
  );
}

export default NewEntry;