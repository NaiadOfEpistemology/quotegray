/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { loadJournalsForUser } from "../utils/storage";

export default function Home() {
  const nav=useNavigate();
  const [journals, setJournals]=useState([]);

  useEffect(() => {
    const saved=loadJournalsForUser();
    setJournals(saved || []);
  }, []);

  useEffect(() => {
    const onVisibility=() => {
      const saved=loadJournalsForUser();
      setJournals(saved || []);
    };
    window.addEventListener("focus", onVisibility);
    return () => window.removeEventListener("focus", onVisibility);
  }, []);

  return (
    <div className="home-root">
      <main className="home-left-layout">
        <div className="left-full-column">
          <div className="home-title-left">quotegray</div>
          <div className="home-sub-left">a quiet place for your words</div>


          <div className="home-section-label">your journals</div>
          {journals.length === 0 && (
            <div className="home-empty">nothing here yet. we can start with today.</div>
          )}
          <div 
  className="signout-btn"
  onClick={()=>{
    localStorage.removeItem("quotegray_current_user");
    window.location.href="/login"; 
  }}
>
  sign out
</div>
          <div className="journal-grid">
            <div className="journal-card new-entry-card" onClick={() => nav("/new")}>
              <div className="journal-new-line1">write something new</div>
              <div className="journal-new-line2">today is a good day to begin</div>
            </div>

            {journals.map((j) => (
              <div
                key={j.id}
                className="journal-card"
                onClick={() => nav(`/entry/${j.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && nav(`/entry/${j.id}`)}
              >
                <div className="journal-date">{j.dateLabel}</div>
                <div className="journal-preview">{j.preview}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}