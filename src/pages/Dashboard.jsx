import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import PaymentService from "../services/payment.service";
import AuthService from "../services/auth.service";
import APP_CONFIG from "../config/app.config";

import "../assets/styles/global.css";
import WalletIcon from "../assets/images/wallet.svg";
import ArrowUp from "../assets/images/ArrowUp.svg";
import ArrowDown from "../assets/images/ArrowDown.svg";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ProfileIcon from "../assets/images/profile.svg";
import BatteryIcon from "../assets/images/battery_model.png";
import DownloadAppImg from "../assets/images/downloadPage.png";
import CloseIcon from "@mui/icons-material/Close";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, transactionData, userByEmail, transactionHistory } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [downloadAppOpen, setDownloadAppOpen] = useState(false);

  const [isClosing, setIsClosing] = useState(false);

  const handleCloseDialog = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowDialog(false);
      setIsClosing(false);
    }, 300); // match animation duration
  };

  useEffect(() => {
    const fetchLatestData = async () => {
      if (user?.id && user?.email) {
        try {
          // 1. Refresh User (Wallet Balance)
          await userByEmail(user.email);

          // 2. Refresh Transactions
          const latestTransactions = await AuthService.loadTransaction(user.id, 10);
          if (Array.isArray(latestTransactions)) {
            transactionHistory(latestTransactions);
          }
        } catch (err) {
          console.error("Dashboard refresh error:", err);
        }
      }
    };

    fetchLatestData();
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (!user) navigate("/login");
    if (Array.isArray(transactionData)) setTransactions(transactionData);
  }, [user, transactionData, navigate]);

  useEffect(() => {
    const baseAmount = parseFloat(amount) || 0;
    setTotalAmount(baseAmount.toFixed(2));
  }, [amount]);

  // Carousel Logic
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const ads = [
    {
      title: "Bentork Batteries",
      desc: "Power your drive with long-lasting life.",
      buttonText: "Learn more",
      color: "var(--color-primary-container)",
      image: BatteryIcon
    },
    {
      title: "Refer & Earn",
      desc: "Invite friends and earn Free Charging Credits.",
      buttonText: "Share",
      color: "#FF9800"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 5000); // 4 seconds
    return () => clearInterval(interval);
  }, [ads.length]);



  const handleRecharge = async () => {
    if (!totalAmount || totalAmount <= 0) return setError("Enter valid amount");
    setLoading(true); setError("");

    try {
      const orderResult = await PaymentService.createOrder(totalAmount);
      PaymentService.processPayment(orderResult, user, handleSuccess, handleFailure);
    } catch {
      setError("Recharge failed"); setLoading(false);
    }
  };

  const handleSuccess = () => {
    setSuccess("Payment Successful"); setLoading(false); setIsVerifying(true); reloadData();
  };

  //const handleSuccess = () => {
  // setSuccess("Payment Successful");
  // setLoading(false);
  // setIsVerifying(true);

  // Update wallet with actual recharge amount (without GST)
  //   AuthService.addToWallet(user.id, parseFloat(amount))  // ⚡ Add baseAmount
  //     .then(() => reloadData())
  //     .catch(() => setError("Failed to update wallet"));
  // };

  const handleFailure = (err) => {
    setError(err || "Payment Failed"); setLoading(false); setIsVerifying(false);
  };

  const reloadData = async () => {
    try {
      const userReload = await userByEmail(user.email);
      if (!userReload?.success && !userReload?.updatedUser) return setError("Failed to fetch user");
      const transactionReload = await AuthService.loadTransaction(user.id, 10);
      setTransactions(transactionReload); transactionHistory(transactionReload);
      setTimeout(() => {
        setSuccess("Verification Completed");
        setTimeout(() => { handleCloseDialog(); setSuccess(""); setAmount(""); setError(""); setIsVerifying(false); }, 500);
      }, 1000);
    } catch {
      setError("Failed while reloading data"); setIsVerifying(false); setLoading(false);
    }
  };

  return (
    <>
      <div className="dashboard-page page-enter-anim" style={{ overflowY: showDialog ? 'hidden' : 'auto', overflowX: 'hidden' }}>
        <style>{`
        /* ===== PAGE LAYOUT ===== */
        .dashboard-page {
          height: 100vh;
          width: 100%;
          position: relative;
          background: var(--color-matte-black);
          color: var(--color-white);
          overflow-y: auto;
          overflow-x: hidden;
          font-family: var(--font-primary);
        }

        /* ===== BACKGROUND BLOBS ===== */
        .blob-container {
          position: fixed;
          top: -20%;
          left: -20%;
          width: 140%;
          height: 80vh;
          z-index: 0;
          pointer-events: none;
          opacity: 0.6;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .blob-layer {
          transform-origin: center;
        }
        .blob-dark { fill: #082f20; animation: rotate 30s linear infinite; }
        .blob-green { fill: #008f45; animation: rotate 25s linear infinite reverse; opacity: 0.6; }
        .blob-light { fill: #80e8b1; animation: rotate 20s ease-in-out infinite; opacity: 0.3; }

        /* ===== CONTENT CONTAINER ===== */
        .content-container {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          max-width: 600px; /* Responsive Limit */
          margin: 0 auto;
          padding: 20px;
          padding-bottom: 40px;
          min-height: 100%;
        }

        /* ===== HEADER ===== */
        .top-nav {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-top: 10px;
        }

        .back-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: background 0.2s;
        }
        .back-btn:active { background: rgba(255, 255, 255, 0.15); }

        .page-title {
          font-size: 20px;
          font-weight: var(--font-weight-semibold);
          letter-spacing: 0.5px;
        }

        /* ===== BALANCE CARD ===== */
        .balance-card {
          position: relative;
          padding: 24px;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(57, 226, 155, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          overflow: hidden;
          margin-bottom: 32px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .balance-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .balance-amount {
          font-size: 28px; /* Reduced from 36px */
          font-weight: var(--font-weight-bold);
          color: #fff;
          margin-bottom: 24px;
        }

        @media (min-width: 400px) {
            .balance-amount {
                font-size: 32px;
            }
        }

        .add-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          
          /* Glassmorphism */
          background: rgba(57, 226, 155, 0.15);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(57, 226, 155, 0.3);
          color: #39e29b;

          font-size: 15px;
          font-weight: var(--font-weight-semibold);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s, background 0.2s;
        }
        .add-btn:active { transform: scale(0.98); background: rgba(57, 226, 155, 0.25); }

        /* ===== TRANSACTIONS LIST ===== */
        .section-title {
          font-size: 18px;
          font-weight: var(--font-weight-semibold);
          margin-bottom: 16px;
          padding: 0 4px;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 100px; /* Scroll space */
        }

        .tx-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: rgba(48, 48, 48, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 18px;
          backdrop-filter: blur(5px);
          transition: background 0.2s;
        }
        .tx-item:active { background: rgba(48, 48, 48, 0.6); }

        .tx-left { display: flex; align-items: center; gap: 14px; }

        .tx-icon-box {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        
        /* THEME MATCHING ICONS */
        .icon-credit { 
            background: var(--color-primary-container); 
            color: var(--color-on-primary-container); 
        }
        .icon-debit { 
            background: rgba(255, 82, 82, 0.2); 
            color: #ff5252; 
        }

        .tx-info h4 { margin: 0 0 4px 0; font-size: 15px; font-weight: 500; }
        .tx-info p { 
            margin: 0; 
            font-size: 12px; 
            color: rgba(255,255,255,0.5);
            max-width: 200px; 
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            line-height: 1.3;
        }

        .tx-right { text-align: right; }
        .amount-text { font-size: 15px; font-weight: 600; display: block; margin-bottom: 4px; }
        .status-badge {
          font-size: 10px;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.8);
        }

        /* ===== DIALOG / MODAL ===== */
        .dialog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          z-index: 999;
          display: flex;
          align-items: flex-end; /* Bottom sheet on mobile default, center on desktop */
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        @media (min-width: 600px) {
          .dialog-backdrop { align-items: center; }
        }

        .dialog-content {
          width: 100%;
          max-width: 420px;
          background: #1e1e1e;
          border-radius: 28px 28px 0 0; /* Sheet style */
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
          animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }

        @media (min-width: 600px) {
          .dialog-content { border-radius: 28px; margin: 16px; animation: scaleIn 0.3s ease; }
        }

        .dialog-header { margin-bottom: 24px; }
        .dialog-header h3 { margin: 0; font-size: 20px; font-weight: 600; }

        .input-group {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        .currency-symbol { font-size: 20px; color: #aaa; margin-right: 8px; }
        .amount-input {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 24px;
          font-weight: 600;
          width: 100%;
          outline: none;
        }
        .clear-icon { color: #555; cursor: pointer; padding: 4px; }

        .chip-group { display: flex; gap: 8px; margin-bottom: 24px; }
        .amt-chip {
          padding: 8px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .amt-chip:hover { background: rgba(57, 226, 155, 0.1); border-color: #39e29b; }

        .bill-row { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 8px; color: #ccc; }
        .bill-total { border-top: 1px dashed #444; padding-top: 12px; margin-top: 12px; color: #fff; font-weight: 600; font-size: 16px; }

        .action-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: none;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 12px;
        }
        .btn-pay { background: var(--color-primary-container); color: var(--color-on-primary-container); }
        .btn-cancel { background: transparent; color: #aaa; padding: 12px; margin-top: 0; font-weight: 500; }

        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes slideDown { from { transform: translateY(0); } to { transform: translateY(100%); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }

        .dialog-content.closing {
          animation: slideDown 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .dialog-backdrop.closing {
          animation: fadeOut 0.3s ease forwards;
        }

        /* ===== AD CAROUSEL ===== */
        .ad-carousel {
          position: relative;
          width: 100%;
          height: 120px;
          margin-bottom: 32px;
          border-radius: 20px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .ad-slide {
          position: absolute;
          inset: 0;
          padding: 16px 20px;
          display: flex;
          flex-direction: row; /* Changed to row */
          justify-content: flex-start;
          align-items: center;
          gap: 16px; /* Space between img and text */
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.6s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .ad-slide.active {
          opacity: 1;
          transform: translateY(0);
          z-index: 2;
        }

        .ad-img-box {
            width: 80px;
            height: 80px;
            flex-shrink: 0;
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255,255,255,0.05);
        }
        
        .ad-img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            padding: 0px;
        }

        .ad-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .ad-content h4 {
          margin: 0 0 4px 0;
          font-size: 16px; 
          font-weight: 700;
          color: #fff;
        }

        .ad-content p {
          margin: 0 0 12px 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          max-width: 80%;
        }

        .ad-btn {
          width: fit-content;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          border: none;
          color: #000;
          cursor: pointer;
          background: #fff;
        }

        .carousel-dots {
          position: absolute;
          bottom: 12px;
          right: 16px;
          display: flex;
          gap: 6px;
          z-index: 5;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transition: all 0.3s;
        }
        .dot.active {
          background: #fff;
          width: 18px; /* Elongated active dot */
          border-radius: 4px;
        }
      `}</style>

        {/* ===== BACKGROUND BLOBS ===== */}
        <div className="blob-container">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path className="blob-layer blob-dark" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.9,32.3C59.6,43.1,48.3,51.8,36.5,58.8C24.7,65.8,12.4,71.1,-0.6,72.1C-13.6,73.1,-27.2,69.8,-39.6,62.8C-52,55.8,-63.2,45.1,-71.3,32.2C-79.4,19.3,-84.4,4.2,-81.8,-9.4C-79.2,-23,-69,-35.1,-57.4,-43.8C-45.8,-52.5,-32.8,-57.8,-19.9,-65.4C-7,-73,8.9,-82.9,25.4,-84.2C41.9,-85.5,59,-78.2,44.7,-76.4Z" transform="translate(100 100)" />
            <path className="blob-layer blob-green" d="M41.3,-72.6C53.4,-65.3,63.2,-54.6,70.4,-42.1C77.6,-29.6,82.2,-15.3,81.3,-1.4C80.4,12.5,74,26,64.8,37.3C55.6,48.6,43.6,57.7,30.8,63.2C18,68.7,4.4,70.6,-8.3,69.7C-21,68.8,-32.8,65.1,-43.2,58.3C-53.6,51.5,-62.6,41.6,-68.9,30.1C-75.2,18.6,-78.8,5.5,-75.9,-6.2C-73,-17.9,-63.6,-28.2,-53.4,-36.5C-43.2,-44.8,-32.2,-51.1,-20.9,-58.5C-9.6,-65.9,2,-74.4,14.5,-76.6C27,-78.8,40.4,-74.7,41.3,-72.6Z" transform="translate(100 100)" />
          </svg>
        </div>

        <div className="content-container">
          {/* Header */}
          <div className="top-nav">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
            </button>
            <span className="page-title">My Wallet</span>
          </div>

          {/* Balance Card */}
          <div className="balance-card">
            <div className="balance-label">
              <img src={WalletIcon} width="20" style={{ opacity: 0.8 }} alt="Wallet" />
              <span>Total Balance</span>
            </div>
            <div className="balance-amount">
              ₹{Number(user?.walletBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <button className="add-btn" onClick={() => setShowDialog(true)}>
              <span>+ Add Money</span>
            </button>
          </div>

          {/* Ad Carousel */}
          <div className="ad-carousel">
            {ads.map((ad, index) => (
              <div
                key={index}
                className={`ad-slide ${index === currentAdIndex ? 'active' : ''}`}
                style={{
                  background: `linear-gradient(90deg, ${ad.color}20 0%, transparent 100%)`
                }}
              >
                {ad.image && (
                  <div className="ad-img-box">
                    <img src={ad.image} alt={ad.title} className="ad-img" />
                  </div>
                )}
                <div className="ad-content">
                  <h4 style={{ color: ad.color }}>{ad.title}</h4>
                  <p>{ad.desc}</p>
                  <button 
                    className="ad-btn" 
                    style={{ background: ad.color, color: '#000' }}
                    onClick={() => {
                      if (ad.title === "Refer & Earn") {
                        setDownloadAppOpen(true);
                      } else if (ad.title === "Bentork Batteries") {
                        window.open("https://bentork.com", "_blank");
                      }
                    }}
                  >
                    {ad.buttonText}
                  </button>
                </div>
              </div>
            ))}

            <div className="carousel-dots">
              {ads.map((_, idx) => (
                <div key={idx} className={`dot ${idx === currentAdIndex ? 'active' : ''}`} />
              ))}
            </div>
          </div>

          {/* Transactions */}
          <h3 className="section-title">Payment History</h3>

          <div className="transactions-list">
            {!transactions || transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                <p>No recent transactions</p>
              </div>
            ) : (
              transactions.map((t, i) => {
                const isCredit = t?.type === "credit";
                return (
                  <div className="tx-item" key={i}>
                    <div className="tx-left">
                      <div className={`tx-icon-box ${isCredit ? 'icon-credit' : 'icon-debit'}`}>
                        <img src={isCredit ? ArrowDown : ArrowUp} width="20" alt="transaction type" />
                      </div>
                      <div className="tx-info">
                        <h4>{isCredit ? "Wallet Recharge" : "Deducted"}</h4>
                        <p>
                          {isCredit
                            ? (t?.method ? `${t.method}` : null)
                            : "Charging Session"
                          }
                        </p>
                      </div>
                    </div>
                    <div className="tx-right">
                      <span className="amount-text" style={{ color: isCredit ? '#39e29b' : '#fff' }}>
                        {isCredit ? "+" : "-"}₹{t?.amount}
                      </span>
                      <span className="status-badge">Done</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* ===== RECHARGE MODAL ===== */}
      {showDialog && (
        <div className={`dialog-backdrop ${isClosing ? 'closing' : ''}`} onClick={() => !loading && handleCloseDialog()}>
          <div className={`dialog-content ${isClosing ? 'closing' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>Add Balance</h3>
            </div>

            <div className="input-group">
              <span className="currency-symbol">₹</span>
              <input
                type="text"
                className="amount-input"
                placeholder="0"
                value={(() => {
                  if (!amount) return '';
                  const parts = String(amount).split('.');
                  parts[0] = Number(parts[0]).toLocaleString('en-IN');
                  return parts.join('.');
                })()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  if (!/^\d*\.?\d*$/.test(raw)) return; // Allow digits and single dot
                  if (Number(raw) > 100000) return;
                  setAmount(raw);
                }}
                disabled={loading}
              />
              {amount && (
                <span className="clear-icon" onClick={() => !loading && setAmount('')}>✕</span>
              )}
            </div>

            <div className="chip-group">
              {[100, 200, 500, 1000].map(val => (
                <div
                  key={val}
                  className="amt-chip"
                  onClick={() => {
                    if (loading) return
                    setAmount((prev) => {
                      const current = parseFloat(prev) || 0
                      const next = current + val
                      return next > 100000 ? 100000 : next
                    })
                  }}
                >
                  +{val}
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
              <div className="bill-row">
                <span>Base Amount</span>
                <span>₹{((parseFloat(amount) || 0) * (1 - (APP_CONFIG.TAX.GST_RATE || 0.18))).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bill-row">
                <span>GST ({(APP_CONFIG.TAX.GST_RATE || 0.18) * 100}%)</span>
                <span>₹{((parseFloat(amount) || 0) * (APP_CONFIG.TAX.GST_RATE || 0.18)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="bill-row bill-total">
                <span>Total Payable</span>
                <span>₹{(parseFloat(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {error && <p style={{ color: '#ff5252', textAlign: 'center', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
            {success && <p style={{ color: '#39e29b', textAlign: 'center', fontSize: '14px', marginBottom: '12px' }}>{success}</p>}

            <button
              className="action-btn btn-pay"
              onClick={handleRecharge}
              disabled={loading || !amount || parseFloat(amount) <= 0}
            >
              {loading ? 'Processing...' : `Pay ₹${amount || 0}`}
            </button>

            <button
              className="action-btn btn-cancel"
              onClick={() => !loading && handleCloseDialog()}
            >
              Cancel
            </button>

          </div>
        </div>
      )}
      {/* ===== DOWNLOAD APP DIALOG ===== */}
      {downloadAppOpen && (
        <div 
          className="dialog-backdrop" 
          style={{ zIndex: 2000 }}
          onClick={() => setDownloadAppOpen(false)}
        >
          <div 
            className="dialog-content" 
            style={{ 
              borderRadius: '24px', 
              padding: '24px', 
              position: 'relative',
              textAlign: 'center',
              animation: 'scaleIn 0.3s ease'
            }}
            onClick={e => e.stopPropagation()}
          >
            <CloseIcon 
              style={{ position: 'absolute', top: 16, right: 16, cursor: 'pointer', opacity: 0.6 }} 
              onClick={() => setDownloadAppOpen(false)}
            />
            
            <img 
              src={DownloadAppImg} 
              alt="App Feature" 
              style={{ width: '100%', borderRadius: '14px', marginBottom: '20px' }} 
            />
            
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>App Exclusive Feature</h3>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '28px' }}>
              Download the Bentork App to unlock the Referral Program, Slot Booking, and live session monitoring.
            </p>
            
            <button 
              className="action-btn btn-pay"
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.bentork.application', '_blank')}
            >
              Download App
            </button>
          </div>
        </div>
      )}
    </>
  );
}
