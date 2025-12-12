import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyUser, saveCurrentUser } from "../utils/storage";

export default function Login() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const login = () => {
    const ok = verifyUser(code);

    if (!ok) {
      setError("Incorrect code.");
      return;
    }

    // store active user session
    saveCurrentUser(code);

    // go to home
    nav("/home");
  };

  return (
    <div style={{ maxWidth: "380px", margin: "60px auto", padding: "20px" }}>
      <div style={{ marginBottom: "30px", fontSize: "14px" }}>
        quotegray
      </div>

      <h2 style={{ fontSize: "18px", marginBottom: "10px" }}>
        Enter Your Access Code
      </h2>

      <input
        type="password"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Access code"
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #999",
          marginBottom: "12px",
          background: "transparent",
        }}
      />

      {error && (
        <div style={{ color: "#c00", marginBottom: "12px" }}>
          {error}
        </div>
      )}

      <button
        onClick={login}
        style={{
          width: "100%",
          padding: "12px",
          background: "#222",
          color: "#fff",
          border: "none",
          marginTop: "12px",
        }}
      >
        Continue
      </button>
    </div>
  );
}