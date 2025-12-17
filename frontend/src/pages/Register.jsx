import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, saveCurrentUser } from "../utils/storage";

export default function Register() {
  const nav=useNavigate();
  const [code, setCode]=useState("");
  const [confirm, setConfirm]=useState("");
  const [error, setError]=useState("");

  const create=() => {
    if (!code.trim() || !confirm.trim()) {
      setError("Please enter a code.");
      return;
    }
    if (code !== confirm) {
      setError("Codes do not match.");
      return;
    }

    registerUser(code);      
    saveCurrentUser(code);   
    nav("/home");
  };

  return (
    <div style={{ maxWidth: "380px", margin: "60px auto", padding: "20px" }}>
      <div style={{ marginBottom: "30px", fontSize: "14px" }}>
        quotegray
      </div>

      <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
        Create Your Access Code
      </h2>

      <p style={{ fontSize: "13px", lineHeight: "20px", marginBottom: "25px" }}>
        This code protects your private journal.
        <br />
        Only you will know it.  
        <span
          onClick={() => nav("/login")}
          style={{
            color: "#003459",
            cursor: "pointer",
            textDecoration: "underline",
            marginLeft: "4px",
          }}
        >
          Have an account? Click here
        </span>
      </p>

      <input type="password" value={code} onChange={(e)=>setCode(e.target.value)}
        placeholder="Enter code" style={inputStyle} />

      <input type="password" value={confirm} onChange={(e)=>setConfirm(e.target.value)}
        placeholder="Confirm code" style={inputStyle} />

      {error && (
        <div style={{ color:"#c00", fontSize:"13px", marginBottom:"12px" }}>{error}</div>
      )}

      <button onClick={create} style={buttonStyle}>
        Save Code
      </button>
    </div>
  );
}

const inputStyle={
  width: "100%",
  padding: "12px",
  border: "1px solid #999",
  marginBottom: "12px",
  background: "transparent",
};

const buttonStyle={
  width: "100%",
  padding: "12px",
  background: "#222",
  color: "#fff",
  border: "none",
  marginBottom: "20px",
};