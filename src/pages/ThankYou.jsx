import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import ChargerImg from "../assets/images/thankyou.png";
import Logo from "../assets/images/logo-1.png";
import "../assets/styles/global.css";

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/config-charging");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="ty-page">
      <style>{`
        .ty-page {
          min-height: 100vh;
          width: 100%;
          background: #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: #fff;
          font-family: "Inter", sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* DYNAMIC BLOB BACKGROUND */
        .blob-container {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(1.5);
            width: 80vh;
            height: 80vh;
            z-index: 0;
            opacity: 0.6;
            pointer-events: none;
            filter: blur(60px);
        }

        .blob-svg {
            width: 100%;
            height: 100%;
        }

        .blob-path { transform-origin: center; }
        .blob-1 { fill: #004d2c; animation: spin-slow 25s linear infinite; }
        .blob-2 { fill: #1d3326; animation: spin-rev 30s linear infinite; opacity: 0.8; }
        .blob-3 { fill: #39e29b; animation: pulse-blob 8s ease-in-out infinite; opacity: 0.15; }

        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes spin-rev {
            from { transform: rotate(360deg) scale(0.9); }
            to { transform: rotate(0deg) scale(0.9); }
        }
        @keyframes pulse-blob {
            0%, 100% { transform: scale(0.8); opacity: 0.1; }
            50% { transform: scale(1.1); opacity: 0.2; }
        }

        .ty-card {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 420px;
            background: rgba(24, 24, 24, 0.6);
            backdrop-filter: blur(20px); /* Enhanced Glassmorphism */
            border-radius: 32px;
            padding: 48px 32px;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
            display: flex;
            flex-direction: column;
            align-items: center;
            animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ty-brand-logo {
            height: 28px;
            opacity: 0.9;
            margin-bottom: 40px;
        }

        .ty-hero-img {
            width: 220px;
            height: auto;
            margin-bottom: 32px;
            /* User commented out filter/anim, keeping it clean or minimal float? User disabled it. Keeping disabled. */
        }

        .ty-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 12px;
            background: linear-gradient(135deg, #fff 0%, #ccc 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .ty-desc {
            font-size: 15px;
            color: rgba(255,255,255,0.6);
            line-height: 1.6;
            margin: 0 0 40px;
            max-width: 280px;
        }

        .ty-redirect-pill {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 24px;
            background: rgba(255,255,255,0.05);
            border-radius: 50px;
            font-size: 14px;
            color: rgba(255,255,255,0.8);
            border: 1px solid rgba(255,255,255,0.05);
        }

        @keyframes slideUpFade {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Dynamic Blob Background */}
      <div className="blob-container">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="blob-svg">
          <path className="blob-path blob-1" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.9,32.3C59.6,43.1,48.3,51.8,36.5,58.8C24.7,65.8,12.4,71.1,-0.6,72.1C-13.6,73.1,-27.2,69.8,-39.6,62.8C-52,55.8,-63.2,45.1,-71.3,32.2C-79.4,19.3,-84.4,4.2,-81.8,-9.4C-79.2,-23,-69,-35.1,-57.4,-43.8C-45.8,-52.5,-32.8,-57.8,-19.9,-65.4C-7,-73,8.9,-82.9,25.4,-84.2C41.9,-85.5,59,-78.2,44.7,-76.4Z" transform="translate(100 100)" />
          <path className="blob-path blob-2" d="M41.3,-72.6C53.4,-65.3,63.2,-54.6,70.4,-42.1C77.6,-29.6,82.2,-15.3,81.3,-1.4C80.4,12.5,74,26,64.8,37.3C55.6,48.6,43.6,57.7,30.8,63.2C18,68.7,4.4,70.6,-8.3,69.7C-21,68.8,-32.8,65.1,-43.2,58.3C-53.6,51.5,-62.6,41.6,-68.9,30.1C-75.2,18.6,-78.8,5.5,-75.9,-6.2C-73,-17.9,-63.6,-28.2,-53.4,-36.5C-43.2,-44.8,-32.2,-51.1,-20.9,-58.5C-9.6,-65.9,2,-74.4,14.5,-76.6C27,-78.8,40.4,-74.7,41.3,-72.6Z" transform="translate(100 100)" />
          <path className="blob-path blob-3" d="M35.6,-62.3C46.5,-55.8,55.9,-47.5,63.1,-37.2C70.3,-26.9,75.3,-14.6,74.7,-2.6C74.1,9.4,67.9,21.1,60.1,31.8C52.3,42.5,42.9,52.2,31.7,58.5C20.5,64.8,7.5,67.7,-4.8,67.3C-17.1,66.9,-32.7,63.2,-45.3,55.8C-57.9,48.4,-67.5,37.3,-72.8,24.6C-78.1,11.9,-79.1,-2.4,-75.3,-15.8C-71.5,-29.2,-62.9,-41.7,-51.5,-49.6C-40.1,-57.5,-25.9,-60.8,-11.8,-62.8C2.3,-64.8,16.4,-65.5,29.3,-62.9C42.2,-60.3,54,-54.4,35.6,-62.3Z" transform="translate(100 100)" />
        </svg>
      </div>

      <div className="ty-card">
        <img src={Logo} alt="Bentork" className="ty-brand-logo" />

        <img src={ChargerImg} alt="Success" className="ty-hero-img" />

        <h1 className="ty-title">Thank You!</h1>
        <p className="ty-desc">
          Your charging session was successful. Visit us again! Have a great day!
        </p>

        <div className="ty-redirect-pill">
          <CircularProgress size={16} sx={{ color: 'var(--color-primary-container)' }} />
          <span>Redirecting to Home...</span> 
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
