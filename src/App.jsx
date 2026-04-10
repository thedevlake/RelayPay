import { useEffect, useMemo, useState } from "react";
import relayPayLogo from "./assets/relaypay-logo.png";
import { useTheme } from "./hooks/useTheme";
import { useVapi } from "./hooks/useVapi";

const ISSUE_OPTIONS = [
  { value: "", label: "Select a topic" },
  { value: "transfer_fees", label: "Transfer fees and pricing" },
  { value: "account_access", label: "Account access" },
  { value: "payment_delay", label: "Payment delay or failure" },
  { value: "invoicing", label: "Invoicing" },
  { value: "onboarding", label: "Onboarding and verification" },
  { value: "compliance", label: "Compliance / KYC" },
  { value: "other", label: "Something else" },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    isCallActive,
    isSpeaking,
    isMuted,
    status,
    error,
    startCall,
    endCall,
    toggleMute,
  } = useVapi();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    issueType: "",
  });
  const [formError, setFormError] = useState("");
  const [sessionOpen, setSessionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const callerTag = useMemo(
    () => `${formData.fullName.trim()} · ${formData.email.trim()}`,
    [formData.fullName, formData.email],
  );

  useEffect(() => {
    if (!sessionOpen || isCallActive || status !== "Call ended")
      return undefined;
    const timerId = window.setTimeout(() => {
      setSessionOpen(false);
    }, 3000);
    return () => window.clearTimeout(timerId);
  }, [isCallActive, sessionOpen, status]);

  const statusTitle = useMemo(() => {
    if (status === "Connecting...") return "Connecting";
    if (status === "Connected") return "Connected";
    if (status === "Agent speaking") return "Speaking...";
    if (status === "Listening") return "Listening";
    if (status === "Call ended") return "Call ended";
    if (status === "Error") return "Error";
    return status || "Ready";
  }, [status]);

  const statusSubText = useMemo(() => {
    if (status === "Connecting...") return "Please wait a moment";
    if (status === "Connected" || status === "Listening")
      return "Go ahead and speak";
    if (status === "Agent speaking") return "";
    if (status === "Call ended")
      return "Your support session has been completed.";
    if (status === "Error") return error || "Please try again";
    return "Voice support is available";
  }, [error, status]);

  const isCallCompleted = status === "Call ended";

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      setFormError("Please complete your name and email.");
      return false;
    }
    if (!emailPattern.test(formData.email)) {
      setFormError("Please enter a valid email address.");
      return false;
    }
    setFormError("");
    return true;
  };

  const handleStartCall = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSessionOpen(true);
    await startCall({
      customer_name: formData.fullName.trim(),
      customer_email: formData.email.trim(),
      issue_type: formData.issueType,
    });
    setIsSubmitting(false);
  };

  const handleEnd = () => {
    if (isCallActive) {
      endCall();
      return;
    }
    setSessionOpen(false);
  };

  return (
    <div className="app-page">
      <div className="dots" />
      <div className="glow" />

      <nav>
        <div className="logo">
          <img
            src={relayPayLogo}
            alt="RelayPay logo"
            className="h-8 w-auto object-contain"
          />
        </div>
        <div className="nav-right">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={
              theme === "dark"
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <span className="nav-link">Help centre</span>
          <div className="status-pill">
            <div className="status-dot" />
            Support online
          </div>
        </div>
      </nav>

      <div className="hero">
        <div className="hero-tag">Voice Support · Real-time</div>
        <h1>
          Cross-border payments,
          <br />
          <strong>
            <span className="accent">answered</span> instantly.
          </strong>
        </h1>
        <p className="hero-sub">
          Speak with our support agent for instant help with transfers,
          invoicing, fees, and account queries.
        </p>
      </div>

      <div className="vis-hero">
        <div className="vis-wrap">
          <div className="ring" />
          <div className="ring r2" />
          <div className="ring r3" />
          <div className="ring r4" />
          <div className="vis-core">
            <svg viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
            </svg>
          </div>
        </div>
        <div className="vis-bars">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={`vb-${index + 1}`}
              className={`vb ${isCallActive || isSpeaking ? "on" : ""}`}
            />
          ))}
        </div>

        <div className={`call-status-hero ${sessionOpen ? "show" : ""}`}>
          <div
            className={`call-status-text ${isCallCompleted ? "completed" : ""}`}
          >
            {isCallCompleted ? "Support Session Completed" : statusTitle}
          </div>
          <div className="call-status-sub">
            {isCallCompleted
              ? "A RelayPay specialist can follow up if additional review is required."
              : statusSubText}
          </div>
          <div className={`caller-chip ${isCallCompleted ? "completed" : ""}`}>
            <div className="chip-dot" />
            <span>{callerTag}</span>
          </div>
        </div>
      </div>

      <div className="three-col">
        <div className="side-card">
          <div className="card-label">What we handle</div>
          <div className="cap-item">
            <span className="cap-num">01</span>
            <div>
              <div className="cap-title">Fees & pricing</div>
              <div className="cap-desc">
                Transfer costs, corridors, and exchange rates
              </div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">02</span>
            <div>
              <div className="cap-title">Payments</div>
              <div className="cap-desc">Delays, failures, and timelines</div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">03</span>
            <div>
              <div className="cap-title">Invoicing</div>
              <div className="cap-desc">
                Multi-currency and contractor payouts
              </div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">04</span>
            <div>
              <div className="cap-title">Compliance</div>
              <div className="cap-desc">
                KYC, verification, regulatory queries
              </div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">05</span>
            <div>
              <div className="cap-title">Onboarding</div>
              <div className="cap-desc">Account setup and getting started</div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">06</span>
            <div>
              <div className="cap-title">Account issues</div>
              <div className="cap-desc">Escalated to a human specialist</div>
            </div>
          </div>
        </div>

        <div className="center-card">
          <div className="form-label">
            {sessionOpen ? "Live call" : "Begin a support call"}
          </div>

          {!sessionOpen ? (
            <div>
              <div className="fields-2col">
                <div className="field">
                  <label htmlFor="uName">Full name</label>
                  <div className="input-box">
                    <input
                      id="uName"
                      name="fullName"
                      type="text"
                      placeholder="Amara Osei"
                      autoComplete="name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="uEmail">Email</label>
                  <div className="input-box">
                    <input
                      id="uEmail"
                      name="email"
                      type="email"
                      placeholder="amara@company.com"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              <div className="field">
                <label htmlFor="uIssue">What do you need help with?</label>
                <div className="input-box">
                  <select
                    id="uIssue"
                    name="issueType"
                    value={formData.issueType}
                    onChange={handleInputChange}
                  >
                    {ISSUE_OPTIONS.map((option) => (
                      <option
                        key={option.value || "placeholder"}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="arr">
                    <svg viewBox="0 0 24 24">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className={`err ${formError ? "show" : ""}`}>
                {formError}
              </div>
              <button
                className="btn-connect"
                type="button"
                onClick={handleStartCall}
                disabled={isSubmitting}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" />
                </svg>
                {isSubmitting ? "Connecting..." : "Connect to support"}
              </button>
              {error ? <div className="err show">{error}</div> : null}
            </div>
          ) : (
            <div className="call-controls show">
              <button className="cbtn" type="button" onClick={toggleMute}>
                {isMuted ? "Unmute" : "Mute"}
              </button>
              <button className="cbtn danger" type="button" onClick={handleEnd}>
                End call
              </button>
            </div>
          )}

          <div className="avail-row">
            <span className="avail-label">Available</span>
            <span className="avail-val">Mon - Fri · 09:00 - 17:00 WAT</span>
          </div>
        </div>

        <div className="side-card">
          <div className="card-label">How it works</div>
          <div className="cap-item">
            <span className="cap-num">01</span>
            <div>
              <div className="cap-title">Fill the form</div>
              <div className="cap-desc">
                Enter your name, email, and select your topic
              </div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">02</span>
            <div>
              <div className="cap-title">Connect instantly</div>
              <div className="cap-desc">Our voice agent answers in seconds</div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">03</span>
            <div>
              <div className="cap-title">Get your answer</div>
              <div className="cap-desc">
                Clear, accurate responses from our knowledge base
              </div>
            </div>
          </div>
          <div className="cap-item">
            <span className="cap-num">04</span>
            <div>
              <div className="cap-title">Escalate if needed</div>
              <div className="cap-desc">
                Complex issues routed to a human specialist
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
