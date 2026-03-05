import { useState } from "react";
import styles from "./JoinRing.module.css";

// Determine API base URL based on environment
const getApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  return window.location.origin;
};

export default function JoinRing({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"email" | "verify">("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate email format
    if (!email || email.length < 3) {
      setError("Please enter a valid Laurier ID (e.g., abcd1234)");
      setLoading(false);
      return;
    }

    const fullEmail = email + "@mylaurier.ca";

    try {
      // Call backend to send email with code
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/send-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fullEmail }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to send verification code");
      }

      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const fullEmail = email + "@mylaurier.ca";
      const apiUrl = getApiUrl();
      // Call backend to verify code and add member to webring
      const response = await fetch(`${apiUrl}/api/join-ring`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fullEmail, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join the webring");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>

        {success ? (
          <div className={styles.success}>
            <div className={styles.icon}>✓</div>
            <h2>Welcome to the Webring!</h2>
            <p>Your email has been verified. You're now part of the WLU CS community webring.</p>
            <button onClick={onClose} className={styles.button}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h1>Join WLU Webring</h1>
            <p className={styles.subtitle}>Connect your website to the Laurier community webring</p>

            {step === "email" ? (
              <form onSubmit={handleEmailSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Verify Your Laurier Email</label>
                  <div className={styles.emailInput}>
                    <input
                      id="email"
                      type="text"
                      placeholder="abcd1234"
                      value={email}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '');
                        setEmail(val);
                      }}
                      disabled={loading}
                      maxLength={8}
                      aria-label="Enter your Laurier ID"
                    />
                    <span className={styles.suffix}>@mylaurier.ca</span>
                  </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? "Sending..." : "Send Verification Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerificationSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="code">Enter Verification Code</label>
                  <p className={styles.hint}>
                    Check your email at <strong>{email}@mylaurier.ca</strong> for the code
                  </p>
                  <input
                    id="code"
                    type="text"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                    maxLength={6}
                    disabled={loading}
                    aria-label="Enter verification code"
                  />
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button type="submit" className={styles.button} disabled={loading}>
                  {loading ? "Verifying..." : "Verify Email"}
                </button>

                <button
                  type="button"
                  className={styles.backButton}
                  onClick={() => {
                    setStep("email");
                    setError(null);
                    setVerificationCode("");
                  }}
                  disabled={loading}
                >
                  Back to Email
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
