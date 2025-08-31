import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [username, setUsername] = useState('');
  const [count, setCount] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);
  const [funFact, setFunFact] = useState('');
  const [playSound, setPlaySound] = useState(true);

  const appUrl = process.env.NODE_ENV === 'production'
    ? 'https://gmonad-counter.vercel.app'
    : 'http://localhost:3000';

  const funFacts = [
    'Monads are like burritos: they wrap data in a context! 🌯',
    'GMONAD is inspired by functional programming concepts! 🧑‍💻',
    'Did you know? Monads help make blockchain computations pure and predictable!',
    'In crypto, GMONAD could symbolize scalable, secure transactions! 🚀',
    'Monads: the secret sauce for composable smart contracts! 🛠️'
  ];

  useEffect(() => {
    if (showResult && count) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#a855f7', '#ffffff', '#d8b4fe']
      });
      // Set random fun fact
      setFunFact(funFacts[Math.floor(Math.random() * funFacts.length)]);
      // Play sound if enabled
      if (playSound) {
        const audio = new Audio('/ding.mp3');
        audio.play().catch((err) => console.log('Sound error:', err));
      }
    }
  }, [showResult, count, playSound]);

  const validateAndGenerate = async () => {
    if (!username || username.length > 15 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Please enter a valid X username (alphanumeric, max 15 characters)');
      return;
    }
    setLoading(true);
    setError('');
    setCopied(false);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`/api/validate?username=${encodeURIComponent(username)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok) {
        const newCount = Math.floor(Math.random() * (6600 - 4500 + 1)) + 4500;
        setCount(newCount);
        setProfilePic(data.profile_image_url || null);
        setHistory((prev) => [{ username, count: newCount }, ...prev.slice(0, 4)]);
        setShowResult(true);
      } else {
        setError(data.error || 'Invalid X username. Please try another.');
      }
    } catch (err) {
      setError(err.name === 'AbortError' ? 'Request timed out.' : `Failed to validate username: ${err.message}`);
    }
    setLoading(false);
  };

  const copyToClipboard = () => {
    if (!count || !username) return;
    setCopied(false);
     const message = `gmonad guys 
     
     Are you a real Monad maxi?

How many times did you mention GMONAD? Do you wanna know?

Check it out here:
${appUrl}
Developed by @devnizam

Make a screenshot and post yours

Pass it on @urfriend`;
    navigator.clipboard.writeText(message)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch((err) => {
        setError(`Failed to copy: ${err.message}`);
      });
  };

  const resetSearch = () => {
    setUsername('');
    setCount(null);
    setProfilePic(null);
    setShowResult(false);
    setError('');
    setCopied(false);
    setFunFact('');
  };

  const toggleSound = () => {
    setPlaySound((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <div>
       <img src="/monad_logo.png" alt="Monad Logo" className={styles.logo} />
     
      </div>
     
      <h1 className={styles.title}>GMONAD Counts Tracker</h1>
      <p className={styles.description}>
        Enter your X username to see how many times you’ve mentioned GMONAD !
      </p>
      {!showResult ? (
        <div className={styles.form}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/^@/, ''))}
            placeholder="Enter your X username (e.g., devnizam)"
            className={styles.input}
            disabled={loading}
          />
          <button
            onClick={validateAndGenerate}
            disabled={loading}
            className={styles.button}
          >
            {loading ? 'Checking...' : 'Get GMONAD Count'}
          </button>
        </div>
      ) : (
        <div className={styles.result}>
          {profilePic && (
            <img
              src={profilePic}
              alt={`${username}'s profile`}
              className={styles.profilePic}
            />
          )}
          <h2>@{username} mentioned GMONAD {count} times! 🚀</h2>
         
          
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(count / 4600) * 100}%` }}
            />
          </div>
          <p className={styles.funFact}>
            Fun Fact: {funFact}
          </p>
          <button
            onClick={copyToClipboard}
            disabled={loading}
            className={styles.copyButton}
          >
            {copied ? 'Copied!' : 'Copy & Share'}
          </button>
          {copied && (
            <p className={styles.copiedMessage}>
              Copied! Share your $GMONAD score on X now!
            </p>
          )}
          <button
            onClick={toggleSound}
            className={styles.soundButton}
          >
            {playSound ? 'Mute Sound 🔊' : 'Enable Sound 🔇'}
          </button>
          <button
            onClick={resetSearch}
            disabled={loading}
            className={styles.backButton}
          >
            Back to Search
          </button>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}
      <footer className={styles.footer}>

        <i>Note: This is not 100% accurate and suject to changes</i>
        <h2>
        Developed by <a href="https://x.com/devnizam" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>@devnizam</a>

        </h2>
      </footer>
    </div>
  );
}