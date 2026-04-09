// src/components/Login.js
import React, { useState, useRef, useMemo, Suspense } from "react";
// --- NEW 3D IMPORTS ---
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
// --- Existing API import ---
import api from "../api";

// --- NEW HELPER COMPONENT: The Interactive 3D Sphere ---
// This component encapsulates a simple 3D object and its logic
function InteractiveSphere({ speed = 1, color = "#6366f1" }) {
  const meshRef = useRef();

  // 'useFrame' runs on every animation frame (approx 60fps)
  useFrame((state, delta) => {
    // 1. Slow continuous rotation
    meshRef.current.rotation.y += delta * 0.2 * speed;
    meshRef.current.rotation.x += delta * 0.1 * speed;

    // 2. Dynamic color shifting based on state time
    // We use memo to calculate this efficiently
    const hue = (state.clock.getElapsedTime() * 10) % 360;
    meshRef.current.material.color.setHSL(hue / 360, 0.7, 0.5);
  });

  return (
    // 'Float' is a helper from @react-three/drei for simple animations
    <Float floatIntensity={1.5} rotationIntensity={2} speed={speed * 1.2}>
      <mesh ref={meshRef} castShadow receiveShadow scale={1.8}>
        {/* Detail: Increase geometry quality for a smoothness */}
        <IcosahedronGeometry args={[1, 15]} />
        <meshStandardMaterial 
          metalness={0.9} 
          roughness={0.1} 
          wireframe={false} 
          color={color} 
        />
      </mesh>
    </Float>
  );
}
// We have to extract the geometry outside to use it effectively
function IcosahedronGeometry(props) {
  return <icosahedronGeometry {...props} />
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  const login = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please enter credentials");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // (Your original API logic)
      const res = await api.post("/auth/login", {
        username: username.trim().toLowerCase(),
        password,
      });

      localStorage.clear();
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // (Your original card animation)
      const card = document.querySelector(".login-card");
      card.style.transition = "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      card.style.opacity = "0";
      card.style.transform = "rotateY(90deg) scale(0.8)";

      setTimeout(() => {
        window.location.href = res.data.role === "admin" ? "/admin" : "/user";
      }, 450);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
      
      // NEW ERROR ANIMATION: Shake the card
      const card = document.querySelector(".login-card");
      card.classList.add('error-shake');
      setTimeout(() => card.classList.remove('error-shake'), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* 🌌 Animated Background (CSS) */}
      <div className="gradient-bg"></div>

      {/* --- NEW TRUE 3D STAGE --- */}
      {/* This fills the screen *behind* the login form */}
      <div className="canvas-container">
        <Canvas 
          camera={{ position: [0, 0, 5], fov: 60 }} 
          dpr={[1, 2]} 
          style={{ position: 'absolute' }}
        >
          {/* Lighting - Crucial for 3D realism */}
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#22d3ee" />
          
          {/* Environment provides subtle reflections */}
          <Suspense fallback={null}>
            <Environment preset="city" />
            
            {/* The 3D Component - speed adjusts dynamically! */}
            <InteractiveSphere 
              speed={loading ? 15 : error ? 0.2 : 1.5} 
              color={error ? "#f87171" : "#6366f1"}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* 🤖 Floating AI Assistant (Now integrated into the login form context) */}
      <div className={`ai-assistant ${focusedField} ${loading ? 'ai-active' : ''}`}>
        <div className="ai-face">
          {error ? "😲" : loading ? "⚙️" : focusedField === "password" ? "🙈" : "😊"}
        </div>
        <span className="ai-text">
          {error
            ? "Wait..."
            : loading
            ? "Syncing..."
            : focusedField === "password"
            ? "Secure input active"
            : "Enterprise Billing"}
        </span>
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo">⚡</div>
            <h1>Billing System</h1>
            <p>Smart Enterprise Access</p>
          </div>

          <form onSubmit={login}>
            {/* Input Group with Focus Animation */}
            <div className={`input-group ${focusedField === 'username' ? 'input-active' : ''}`}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onFocus={() => setFocusedField("username")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Group with 3D Effect on Toggle */}
            <div className={`input-group password ${focusedField === 'password' ? 'input-active' : ''}`}>
              <label>Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="show-hide-btn" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "HIDE" : "SHOW"}
              </span>
            </div>

            {error && <div className="error">{error}</div>}

            {/* Button with Scale Animation */}
            <button className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                "Authenticate Access"
              )}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        /* --- General Layout --- */
        .login-page {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: #0f172a; /* Deep base color */
          font-family: 'Inter', system-ui, sans-serif;
          overflow: hidden;
          position: relative;
        }

        /* --- 3D Stage Container --- */
        .canvas-container {
          position: absolute;
          inset: 0;
          z-index: 1; /* Sits directly above background, below form */
        }

        /* --- 🌌 CSS Gradient Background --- */
        .gradient-bg {
          position: absolute;
          width: 300%;
          height: 300%;
          background: 
            radial-gradient(circle at 15% 15%, #4338ca 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, #0e7490 0%, transparent 40%);
          animation: moveBg 15s linear infinite;
          opacity: 0.6;
          z-index: 0;
        }

        @keyframes moveBg {
          0% { transform: translate(0, 0) rotate(0deg); }
          100% { transform: translate(-30%, -30%) rotate(10deg); }
        }

        /* --- The Login Card (The Main Container) --- */
        .login-container {
          z-index: 2; /* Sits above 3D and Background */
          perspective: 1500px; /* NEW: Enable 3D CSS effects */
        }

        .login-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          padding: 40px;
          border-radius: 24px;
          width: 350px;
          color: white;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 60px rgba(0,0,0,0.6);
          
          /* NEW: Enter animation */
          animation: cardEnter 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          transform-style: preserve-3d;
        }

        @keyframes cardEnter {
          from { transform: translateY(40px) scale(0.9) rotateX(-5deg); opacity: 0; }
          to { transform: translateY(0) scale(1) rotateX(0deg); opacity: 1; }
        }

        /* Card Shaking on Error */
        .error-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          border-color: #ef4444;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        /* Logo Pulse */
        .logo {
          font-size: 48px;
          margin-bottom: 5px;
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.7));
          animation: pulseLogo 3s infinite ease-in-out;
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(99, 102, 241, 0.7)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(99, 102, 241, 0.9)); }
        }

        h1 { font-size: 26px; margin: 0; font-weight: 800; }
        p { color: #94a3b8; font-size: 14px; margin-top: 2px; margin-bottom: 30px; }

        /* --- Modern Input Styling & Animations --- */
        .input-group { margin-bottom: 18px; text-align: left; }
        .input-group label {
          display: block; color: #94a3b8; font-size: 12px;
          margin-bottom: 6px; padding-left: 5px;
        }

        .input-group input {
          width: 100%; padding: 12px 16px;
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; color: white;
          font-size: 15px; outline: none;
          box-sizing: border-box; transition: all 0.2s;
        }

        /* Focus Interaction */
        .input-active input {
          border-color: #6366f1;
          background: rgba(15, 23, 42, 1);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
          transform: translateY(-1px);
        }

        /* Password Specific */
        .password { position: relative; }
        .show-hide-btn {
          position: absolute; right: 12px; bottom: 12px;
          color: #6366f1; font-weight: 800; font-size: 10px;
          cursor: pointer; padding: 2px 6px; border-radius: 4px;
          background: rgba(99, 102, 241, 0.1);
          transition: all 0.2s;
        }
        .show-hide-btn:hover { background: rgba(99, 102, 241, 0.2); }

        /* Error Text and Animation */
        .error {
          color: #f87171; font-size: 13px; font-weight: 600;
          margin-bottom: 12px; text-align: center;
          animation: slideUpError 0.3s ease-out;
        }
        @keyframes slideUpError { from { opacity: 0; transform: translateY(5px); } }

        /* --- Button and Submit Animations --- */
        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #6366f1, #22d3ee);
          border: none; border-radius: 12px;
          color: white; font-weight: 700; font-size: 16px;
          cursor: pointer; transition: all 0.3s;
          display: flex; justify-content: center; align-items: center;
        }

        .submit-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.5);
        }

        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        /* NEW Button Loading Spinner */
        .loading-spinner {
          width: 20px; height: 20px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s infinite linear;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* --- 🤖 UI AI Assistant (Updated) --- */
        .ai-assistant {
          position: absolute; top: 12%; left: 10%; z-index: 5;
          display: flex; gap: 15px; align-items: center;
          animation: float 4s infinite ease-in-out;
          transition: all 0.3s ease;
        }

        .ai-face { font-size: 44px; filter: saturate(1.5); }
        .ai-text {
          font-size: 13px; color: #94a3b8; font-weight: 600;
          background: white; color: #0f172a; padding: 6px 12px;
          border-radius: 10px; border-radius: 15px 15px 15px 0px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        /* Dynamic interaction on login */
        .ai-active { animation: floatFaster 0.5s infinite linear; }
        
        @keyframes float Faster { 
          0%, 100% { transform: translateY(0px) scale(1); } 
          50% { transform: translateY(-3px) scale(1.02); } 
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }
      `}</style>
    </div>
  );
}