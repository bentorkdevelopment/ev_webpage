import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Email, Download, ReceiptLong } from "@mui/icons-material";
import { CircularProgress, Alert, Snackbar } from "@mui/material"
import { useAuth } from "../store/AuthContext";
import CacheService from "../services/cache.service";
import EmailService from "../services/email.service"
import SessionService from "../services/session.service"
import Logo from "../assets/images/logo-1.png";
import { logError } from "../config/errors.config";
const Invoice = () => {
  const navigate = useNavigate();
  const { user, chargerData, transactionData } = useAuth();
  const emailSentRef = useRef(false)
  const [sessionData, setSessionData] = useState(null);
  // Static data for testing
  // const [sessionData, setSessionData] = useState({
  //   sessionId: "MOCK-123",
  //   stationName: "Test Station",
  //   chargerType: "DC Fast",
  //   duration: 45,
  //   energyUsed: 25.5,
  //   rate: 15,
  //   finalCost: 382.50,
  //   paymentMethod: "Wallet",
  //   transactionId: "TXN-999",
  //   endTime: new Date().toISOString()
  // });
  const [isLoading, setIsLoading] = useState(true)
  const [emailStatus, setEmailStatus] = useState({
    sending: false,
    sent: false,
    error: null
  })

  useEffect(() => {
    loadSessionData()
  }, [])

  const loadSessionData = async () => {
    try {
      const stored = CacheService.getSessionData()
      let parsed
      if (stored) {
        parsed = stored
        const completionData = parsed.completionData || parsed

        setSessionData(completionData)

        CacheService.clearPlanData()
        SessionService.clearSession()

        if (!emailSentRef.current && user?.email) {
          emailSentRef.current = true
          // await sendInvoiceEmail(completionData)
        }
      } else {
        console.warn("No session completion data found")
      }
    } catch (error) {
      console.error("Error loading session data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDone = () => {
    navigate("/thank-you")
  }

  if (isLoading) {
    return (
      <div className="invoice-loading">
        <CircularProgress sx={{ color: '#7dbb63' }} />
        <p>Loading invoice...</p>
        <style>{`
          .invoice-loading {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            gap: 16px;
          }
        `}</style>
      </div>
    )
  }

  // No Session Data State
  if (!sessionData) {
    return (
      <div className="invoice-page page-enter-anim" style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        background: '#121212' // Fallback dark background
      }}>
        <style>{`
          .empty-state-card {
            background: rgba(30, 30, 30, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 40px 24px;
            border-radius: 28px;
            text-align: center;
            max-width: 340px;
            width: 90%;
            display: flex;
            flex-direction: column;
            align-items: center;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          }
          .empty-icon-box {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
            color: rgba(255, 255, 255, 0.6);
            box-shadow: inset 0 2px 10px rgba(255,255,255,0.05);
          }
          .action-btn-primary {
            background: var(--color-primary-container, #39e29b);
            color: var(--color-on-primary-container, #000);
            border: none;
            padding: 16px 24px;
            border-radius: 16px;
            font-weight: 600;
            font-size: 15px;
            cursor: pointer;
            width: 100%;
            margin-top: 32px;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .action-btn-primary:active {
            transform: scale(0.96);
            filter: brightness(0.9);
          }
        `}</style>

        <div className="empty-state-card">
          <div className="empty-icon-box">
            <ReceiptLong sx={{ fontSize: 36 }} />
          </div>
          <h2 style={{ fontSize: '22px', margin: '0 0 12px', fontWeight: 600, color: '#fff' }}>No Invoice Found</h2>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: '1.6', maxWidth: '280px' }}>
            We couldn't retrieve the invoice details for this session. It may have expired or been processed.
          </p>
          <button className="action-btn-primary" onClick={() => navigate('/config-charging')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Dynamic Data Extraction with Formatting
  const stationName = sessionData.stationName || chargerData?.stationName || chargerData?.name || chargerData?.chargerName || chargerData?.charger_name || "N/A"
  const chargerType = sessionData.chargerType || chargerData?.chargerType || "N/A"
  const durationMin = sessionData.duration || 0

  const energyVal = Number(sessionData.energyUsed || 0)
  const rateVal = Number(sessionData.rate || sessionData.plan?.rate || 0)
  
  const platformFee = sessionData?.platformFee !== undefined && sessionData?.platformFee !== null ? Number(sessionData.platformFee) : 0;

  const totalCostVal = Number(sessionData.finalCost || sessionData.amountDebited || ((energyVal * rateVal) + platformFee))

  const energy = energyVal.toFixed(2)
  const rate = rateVal.toFixed(2)
  const totalCost = totalCostVal.toFixed(2)

  const transactionId = sessionData.transactionId || sessionData.receiptId || sessionData.sessionId || "N/A"
  const paymentMethod = sessionData.paymentMethod || "Wallet"
  const sessionId = sessionData.sessionId || "N/A"
  const completedAt = sessionData.endTime || sessionData.completedAt || new Date().toISOString()

  const formatDuration = (mins) => {
    const h = Math.floor(mins / 60)
    const m = Math.floor(mins % 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m} mins`
  }

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    } catch {
      return 'N/A'
    }
  }

  const Row = ({ label, value, highlight, className }) => (
    <div className={`row ${highlight ? 'highlight' : ''} ${className || ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )

  return (
    <div className="invoice-page page-enter-anim">
      <style>{`
        /* ================== RESET ================== */
        * { box-sizing: border-box; }
        body { margin: 0; background: #000; font-family: "Inter", "Roboto", sans-serif; }

        /* ================== PAGE LAYOUT ================== */
        .invoice-page {
          height: 100vh;
          width: 100%;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          padding-bottom: 120px; /* Space for button */
          overflow-y: auto; /* Scrollable internal content */
          -webkit-overflow-scrolling: touch;
        }

        /* ================== RECEIPT CARD ================== */
        .receipt-card {
          width: 100%;
          max-width: 420px;
          background: #181818;
          border-radius: 24px;
          overflow: hidden;
          position: relative;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          margin-top: 20px;
          flex-shrink: 0; /* Prevent shrinking */
        }

        /* CARD HEADER */
        .receipt-header {
          background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
          padding: 32px 24px 24px;
          text-align: center;
          border-bottom: 1px dashed rgba(255,255,255,0.1);
          position: relative;
        }

        .brand-logo {
          height: 60px; /* Increased Size */
          object-fit: contain;
          margin-bottom: 16px;
          opacity: 0.9;
        }

        .receipt-title {
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .total-amount {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          margin: 8px 0;
          letter-spacing: -0.5px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(57, 226, 155, 0.1);
          border: 1px solid rgba(57, 226, 155, 0.2);
          border-radius: 20px;
          color: #39e29b;
          font-size: 12px;
          font-weight: 600;
          margin-top: 12px;
        }

        /* CONTENT BODY */
        .receipt-body {
          padding: 24px;
        }

        .info-group {
          margin-bottom: 24px;
        }

        .group-label {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          font-size: 14px;
        }
        
        .item-row.last {
            margin-bottom: 0;
        }

        .item-label {
          color: rgba(255,255,255,0.7);
        }

        .item-value {
          color: #fff;
          font-weight: 500;
          text-align: right;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 16px 0;
        }

        /* FOOTER SECTION */
        .receipt-footer {
          background: rgba(0,0,0,0.2);
          padding: 20px 24px;
          border-top: 1px dashed rgba(255,255,255,0.1);
        }
        
        .footer-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            color: rgba(255,255,255,0.4);
            margin-bottom: 6px;
        }

        /* ================== ACTION BUTTON ================== */
        .action-container {
          width: 100%;
          max-width: 420px;
          margin-top: 24px;
          padding-bottom: 24px;
          display: flex;
          justify-content: center;
        }

        .done-btn {
          width: 100%;
          max-width: 420px;
          height: 56px;
          background: #fff;
          color: #000;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .done-btn:active {
          transform: scale(0.98);
        }

      `}</style>

      <div className="receipt-card">
        {/* Header */}
        <div className="receipt-header">
          <img src={Logo} alt="Bentork" className="brand-logo" />
          <div className="receipt-title">Invoice</div>
          <div className="total-amount">₹{totalCost}</div>
          <div className="status-badge">
            <CheckCircle sx={{ fontSize: 14 }} />
            Payment Successful
          </div>
        </div>

        {/* Body */}
        <div className="receipt-body">

          {/* Session Info */}
          <div className="info-group">
            <div className="group-label">Session Details</div>
            <div className="item-row">
              <span className="item-label">Station</span>
              <span className="item-value">{stationName}</span>
            </div>
            <div className="item-row">
              <span className="item-label">Date</span>
              <span className="item-value">{new Date(completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="item-row">
              <span className="item-label">Time</span>
              <span className="item-value">{new Date(completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            <div className="item-row">
              <span className="item-label">Duration</span>
              <span className="item-value">{formatDuration(durationMin)}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Charging Stats */}
          <div className="info-group">
            <div className="group-label">Charging Usage</div>
            <div className="item-row">
              <span className="item-label">Energy Consumed</span>
              <span className="item-value">{energy} kWh</span>
            </div>
            <div className="item-row">
              <span className="item-label">Charger Type</span>
              <span className="item-value">{chargerType}</span>
            </div>
            <div className="item-row">
              <span className="item-label">Rate Info</span>
              <span className="item-value">₹{chargerData.rate || rate} / kWh</span>
            </div>
            <div className="item-row">
              <span className="item-label">PST (Platform fees)</span>
              <span className="item-value">₹{platformFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="divider" />

          {/* Payment Method */}
          <div className="item-row last">
            <span className="item-label" style={{ color: '#fff' }}>Payment Method</span>
            <span className="item-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39e29b' }}></div>
              {paymentMethod}
            </span>
          </div>

        </div>

        <div className="receipt-footer">
          <div className="footer-row" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ marginRight: '8px' }}>Receipt ID:</span>
            <span style={{ fontFamily: 'monospace', color: '#fff' }}>
              {(() => {
                // Try to find a matching transaction in wallet history
                if (transactionData && transactionData.length > 0) {
                  // Filter for DEBIT transactions that are recent
                  const relevantTx = transactionData.find(t =>
                    (t.type === 'DEBIT' || t.transactionType === 'DEBIT') &&
                    (t.amount == totalCost || Math.abs(t.amount - totalCost) < 1)
                  );
                  if (relevantTx) return relevantTx.transactionId || relevantTx.id;
                }
                return transactionId;
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="action-container">
        <button className="done-btn" onClick={handleDone}>
          Done
        </button>
      </div>

    </div>
  );
};

export default Invoice;
