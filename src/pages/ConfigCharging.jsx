import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";

import { useCharging } from '../store/ChargingContext'

import WalletIcon from "../assets/images/wallet.svg";
import Logo from "../assets/images/logo-1.png";
import StationImg from "../assets/images/station-img.png";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DownloadAppImg from "../assets/images/downloadPage.png";
import { useAuth } from "../store/AuthContext";

import "../assets/styles/global.css";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import SettingsIcon from "@mui/icons-material/Settings";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import BoltIcon from '@mui/icons-material/Bolt';
import AuthService from "../services/auth.service"; // Import service

import { remoteConfig } from "../config/firebase.config";
import { fetchAndActivate, getValue } from "firebase/remote-config";
import { parseMaintenanceDate, isTodayOrFuture } from "../utils/dateUtils";

const sidebarConfig = {
  user: {
    name: "Ricard Joseph",
    email: "richard@bentork.com",
    avatar: <AccountCircleIcon fontSize="large" />
  },
  menu: [
    {
      section: "primary",
      items: [
        { label: "My Wallet", icon: <AccountBalanceWalletIcon /> },

      ]
    },
    {
      section: "support",
      items: [
        { label: "Help", icon: <HelpOutlineIcon /> },
        { label: "FAQ", icon: <QuizIcon />, path: "/faq" },
        { label: "Tutorial", icon: <SchoolIcon /> },
        { label: "Download App", icon: <DownloadIcon /> }
      ]
    },

    {
      section: "legal",
      items: [
        { label: "Terms & Conditions", icon: <DescriptionIcon />, path: "/terms" },
        { label: "Privacy Policy", icon: <PrivacyTipIcon />, path: "/privacy" },
        { label: "About Us", icon: <InfoOutlinedIcon />, path: "/about" }
      ]
    }
  ]
};


const ConfigCharging = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    plans,
    selectedPlan,
    powerValue,
    plansLoading,
    chargerData,
    openReceipt,
    selectPlan,
    updatePowerValue,

    error,
    isChargerUnavailable,
    chargerLoading // Add this
  } = useCharging()



  // Terms Check
  React.useEffect(() => {
    const accepted = localStorage.getItem('terms_accepted')
    if (!accepted) {
      navigate('/terms', { replace: true })
    }
  }, [navigate])

  // Reset imgError when user picture changes
  React.useEffect(() => {
    setImgError(false);
  }, [user?.picture]);



  // 🔐 SAFE last used plan
  const lastUsed = selectedPlan || plans[0];
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [customPowerInfoOpen, setCustomPowerInfoOpen] = useState(false);
  const [plansInfoOpen, setPlansInfoOpen] = useState(false);

  // Maintenance Config
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceDate, setMaintenanceDate] = useState('');

  useEffect(() => {
    const fetchMaintenance = async () => {
      if (!remoteConfig) {
        // Fallback for missing/invalid keys when remoteConfig is null
        setIsMaintenance(false);
        setMaintenanceDate('');
        return;
      }
      try {
        remoteConfig.defaultConfig = {
          maintenance_key: false,
          maintenance_date: ''
        };
        await fetchAndActivate(remoteConfig);
        setIsMaintenance(getValue(remoteConfig, 'maintenance_key').asBoolean());
        setMaintenanceDate(getValue(remoteConfig, 'maintenance_date').asString());
      } catch (e) {
        // Fallback for missing/invalid keys or errors (read from cache if possible)
        try {
          const fbMaint = getValue(remoteConfig, 'maintenance_key').asBoolean();
          const fbDate = getValue(remoteConfig, 'maintenance_date').asString();
          setIsMaintenance(fbMaint);
          setMaintenanceDate(fbDate || '');
        } catch (_) {
          console.warn('Firebase Remote Config fetch failed:', e);
          setIsMaintenance(false);
          setMaintenanceDate('');
        }
      }
    };
    fetchMaintenance();
  }, []);

  // Flicker Prevention: Identify if the URL has a charger ID that doesn't match loaded data yet
  const [searchParams] = useSearchParams();
  const paramOcppId = searchParams.get('ocppId') || searchParams.get('ocppid');

  // If we have an ID in URL but it doesn't match loaded data, force loading state locally
  // This covers the gap before context updates
  const isDataMismatch = paramOcppId && chargerData?.ocppId !== paramOcppId;
  const isPageLoading = chargerLoading || plansLoading || isDataMismatch;

  // Drawer Drag Logic
  const [drawerStartX, setDrawerStartX] = useState(0);
  const [drawerDragOffset, setDrawerDragOffset] = useState(0);
  const [isDrawerDragging, setIsDrawerDragging] = useState(false);

  const onDrawerTouchStart = (e) => {
    setDrawerStartX(e.touches[0].clientX);
    setIsDrawerDragging(true);
  };

  const onDrawerTouchMove = (e) => {
    if (!isDrawerDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - drawerStartX;
    // Drawer coming from left (0). Dragging left (negative) closes it.
    if (diff < 0) {
      setDrawerDragOffset(diff);
    }
  };

  const onDrawerTouchEnd = () => {
    setIsDrawerDragging(false);
    if (drawerDragOffset < -75) { // Threshold to close
      setDrawerOpen(false);
    }
    setDrawerDragOffset(0);
  };
  // 🔹 Quick plans only
  const quickPlans = plans.filter(p => p.type === "QUICK");

  // Valid Custom Power Logic
  const isValidCustomPower = Number.isInteger(powerValue) && powerValue > 0;

  // Local input state for smooth typing
  const [localInput, setLocalInput] = useState(() => isValidCustomPower ? String(powerValue) : '');

  const handleInputChange = (e) => {
    const val = e.target.value;
    // Allow digits only (positive integers)
    if (!/^\d*$/.test(val)) return;

    // Enforce Max Limit
    const isDC = chargerData?.chargerType?.toLowerCase().includes('dc') || chargerData?.chargerType?.toLowerCase().includes('fast');
    const maxPower = isDC ? 500 : 50;

    if (val !== '' && Number(val) > maxPower) {
      return; // Stop input if exceeds limit
    }

    setLocalInput(val);

    const num = Number(val);
    if (val !== '' && num > 0) {
      updatePowerValue(num);
    } else {
      updatePowerValue(0);
    }
  };

  // Dynamic Rate from Charger Data (defaulting to 18 if missing)
  const chargerRate = Number(chargerData?.rate || 18);

  useEffect(() => {
    if (isValidCustomPower) {
      // Find a suitable backing plan ID to satisfy API requirements
      const backingPlan = plans.find(p => p.type === 'CUSTOM' || p.type === 'DEFAULT') || plans[0];
      const backingId = backingPlan?.id;

      if (!backingId) {
        console.warn("No backing plan found for custom power");
      }

      selectPlan({
        id: backingId || 'custom-power-plan', // Fallback to string if strictly no plans, though unlikely
        planName: 'Custom Power',
        type: 'CUSTOM',
        walletDeduction: powerValue * chargerRate, // Deduced cost per hour? Or just a base? User said multiply.
        durationMin: 0, // Set to 0 to let backend stop when desired kW is achieved
        // If the backend expects deduction, this might be it.
        // Safest is to follow the visual instruction first.
        kw: powerValue,
        rate: chargerRate,
        isCustom: true // Flag to distinguish if needed
      });
      // PERSIST FOR RECOVERY: Save local target to survive reload since DB lacks it
      localStorage.setItem('active_custom_kwh', String(powerValue));

    } else if (selectedPlan?.isCustom || selectedPlan?.planName === 'Custom Power') {
      selectPlan(null); // Reset to default flow
      localStorage.removeItem('active_custom_kwh');
    }
  }, [powerValue, isValidCustomPower, selectPlan, chargerRate, plans]);

  return (
    <>
      <style>{`
        html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow-y: auto;
        font-family: Arial, sans-serif;
      }

       /* ===== PAGE ===== */
.config-page {
  min-height: 100vh;
  background: #121212;
  color: #fff;
  padding-top: 56px;
  padding-bottom: 100px;
  font-family: var(--font-primary);
  font-size: 14px;
}

/* ===== TOP BAR ===== */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
  background: transparent;
}

.topbar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%);
  pointer-events: none;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.menu {
  font-size: 22px;
  font-weight: var(--font-weight-regular);
}

.top-logo {
  height: 20px;
  width: auto;
}

.wallet-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 28px;
  border: 2px solid rgba(255, 255, 255, 0.16);
  color: #fff;
  font-size: 12px;
  font-family: var(--font-primary);
  font-weight: var(--font-weight-medium);
}

/* ===== MENU ICON ===== */
.menu-icon {
  font-size: 22px;
  cursor: pointer;
}

/* ===== OVERLAY ===== */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  pointer-events: none;
  transition: 0.3s;
  z-index: 9;
}

.drawer-overlay.show {
  opacity: 1;
  pointer-events: all;
}

/* ===== DRAWER ===== */

/* ===== DRAWER ===== */

.drawer-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  margin: 16px;
  background: #21212107;
  border-radius: 22px;
  overflow: hidden; /* Prevent internal spill */
}

.side-drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  height: 100dvh;
  width: 85vw;
  max-width: 340px;
  background: #212121bc;
  backdrop-filter: blur(28px);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 101;
  border-radius: 0 28px 28px 0;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 24px rgba(0,0,0,0.0); /* Add shadow for depth */
}

.side-drawer hr {
  border: none;
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 10px 0;
  width: 100%;
}

/* OPEN STATE */
.side-drawer.open {
  transform: translateX(0%);
}


/* ===== HEADER ===== */
.drawer-header {
  padding: 20px 16px 10px; /* Adjusted padding */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  gap: 12px;
  align-items: center;
  overflow: hidden; /* Protect text overflow */
}

.avatar {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-text-container {
  min-width: 0; /* Important for text-overflow to work in flex */
  display: flex;
  flex-direction: column;
}

.user-info p {
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  opacity: 0.6;
  margin: 0;
}

.close-icon {
  cursor: pointer;
  padding: 4px;
}


/* ===== MENU ===== */
.drawer-menu {
  flex: 1; /* Take up remaining space */
  overflow-y: auto; /* Scroll if menu is too long */
  padding: 0 16px; 
}

.drawer-menu .item {
  padding: 12px 0; /* More vertically spacing for touch */
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--color-white);
  cursor: pointer;
}

.drawer-menu .item:active {
  opacity: 0.7;
}

.drawer-menu .item svg {
  font-size: 20px;
  opacity: 0.85;
}

.avatar svg {
  border-radius: 25%;
  font-size: 42px;
  opacity: 0.9;
}

/* ===== LOGOUT ===== */
.logout-btn {
  margin: 16px; /* Margin around button */
  margin-top: auto; /* Push to bottom if space permits */
  padding: 14px;
  background: #ff3131ff;
  color: #fff;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  flex-shrink: 0; /* Don't shrink */
}


/* ===== CHARGER CARD ===== */
.charger-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== MAINTENANCE BANNER ===== */
.maintenance-banner {
  display: flex;
  align-items: center;
  background: rgba(255, 171, 0, 0.12);
  border: 0px solid rgba(255, 171, 0, 0.35);
  border-radius: 0px;
  padding: 12px 16px;
  margin: 16px 0px 0 0px;
}
.maintenance-banner-icon {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: rgba(255, 171, 0, 0.22);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
}
.maintenance-banner-content {
  flex: 1;
}
.maintenance-banner-title {
  color: #FFAB00;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 2px 0;
}
.maintenance-banner-subtitle {
  color: rgba(255, 200, 80, 0.85);
  font-size: 11px;
  line-height: 1.3;
  margin: 0;
}

.charger-card {
    margin: 16px;
    background: var(--color-matte-black);
    border-radius: 20px;
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    min-height: fit-content;
    border: 0px solid #333;
    }

.charger-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* responsive flip for very small screens if needed, mostly flex handles it */
@media (max-width: 340px) {
  .charger-card {
    flex-direction: column-reverse;
    align-items: center;
    text-align: center;
  }
  .charger-info {
    width: 100%;
    align-items: center;
  }
}

.charger-meta {
  width: 100%;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: #aaa;
}

.charger-img-container {
  flex-shrink: 0;
}

.charger-img {
  height: auto;
  width: 100px; /* Reduced slightly for better fit on small mobiles */
  max-width: 130px;
  object-fit: contain;
  display:none;
}

/* ===== SLIDER ===== */
.label {
  font-weight: 700;
  margin: 24px 16px 8px;
  font-size: 14px;
  padding: 0px 0px;
  color: #fff;
}

md-slider {
  width: 100%;
  --md-sys-color-primary: var(--color-primary-container);
  --md-sys-color-secondary: var(--color-on-primary-container);
  --md-slider-active-track-height: 20px;
  --md-slider-inactive-track-height: 20px;
  --md-slider-active-track-color: var(--color-primary-container);
  --md-slider-inactive-track-color: var(--color-on-primary-container);
  --md-slider-handle-width: 4px;
  --md-slider-handle-height: 40px;
  --md-slider-handle-shape: 4px;
  --md-slider-tick-color: var(--color-on-primary-container);
  --md-slider-tick-active-color: var(--color-primary-container);
  --md-slider-tick-size: 7px;
  transition: all 0.3s ease;
}


/* ===== PLANS ===== */
.plans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 18px 16px 10px;
  border-top: 1px solid #333;
  padding-top: 10px;
}

.plans-header h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0;
}

.last-used-pill {
margin: 8px 0px;
  padding: 6px 18px;
  border: 1px solid var(--color-primary-container);
  border-radius: 99px;
  color: var(--color-primary-container);
  font-size: 12px;
  font-weight: var(--font-weight-regular);
}

.plans {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.plan {
  background: rgba(255,255,255,0.05);
  padding: 14px 16px;
  border-radius: 16px;
  border: 2px solid rgba(255,255,255,0.1);
  outline: 2px solid transparent;
  display: flex;
  height: fit-content;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}
.plan strong{
  font-size: 14px;
    font-weight: 400;
}
.plan span {
  font-size: 11px;
  opacity: 0.7;
    font-weight: 400;
}

.plan .price {
  color: var(--color-primary-container);
  font-size: 16px;
  font-weight: 700;
}

.plan.active {
  background: #39e29c24;
  outline: 2px solid var(--color-primary-container);
  border-color: transparent;
  box-shadow: 0 0 18px rgba(9, 35, 26, 0.8), 0 0 24px #39e29b66;
}

.plan.active .plan-icon-box {
    background: var(--color-white);
    color: var(--color-on-primary-container);
    box-shadow: 0 0 12px rgba(57, 226, 155, 0.4);
}

.plan-icon-box {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    flex-shrink: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ===== PAY BUTTON ===== */
.pay-btn {
  position: fixed;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  padding: 16px 24px;
  background: #fff;
  color: #000;
  border-radius: 14px;
  font-size: 14px;
  font-family: var(--font-primary);
  font-weight: 700;
  border: none;
  z-index: 99;
  cursor: pointer;
  animation: slideUpBtn 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

.error-banner {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px 16px;
  margin: 10px 16px;
  border-radius: 8px;
  border: 1px solid #ffcdd2;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  margin-top: 6px;
  text-transform: capitalize;
  width: fit-content;
  letter-spacing: 0.3px;
}

.status-available {
color: var(--color-on-primary-container);
  background-color: var(--color-primary-container);
}

.status-busy {
  color: white;
  background-color: #ef6c00;
}

.status-offline {
  color: white;
  background-color: #c62828;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUpBtn {
  from {
    transform: translate(-50%, 100%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

@keyframes glowEnter {
  0% {
    box-shadow: inset 0 0 0 0 transparent, 0 4px 20px rgba(0, 0, 0, 0);
  }
  100% {
    box-shadow: inset 50px 0px 60px -40px rgba(57, 226, 156, 0.2), 0 4px 20px rgba(0,0,0,0.1);
  }
}

.animate-fade {
  animation: fadeIn 0.25s ease-out forwards;
}

.page-enter-anim {
  animation: fadeIn 0.4s ease-out forwards;
}

/* ===== WARNING DIALOG ===== */
.warning-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.warning-dialog {
  background: #2b2b2b;
  border: 0px solid rgba(255, 68, 68, 0.3);
  border-radius: 24px;
  padding: 32px 24px;
  width: 100%;
  max-width: 340px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.5);
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.warning-icon-container {
  width: 64px;
  height: 64px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.warning-icon-lg {
  color: #ff4444;
  font-size: 32px !important;
}

.warning-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.warning-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  margin: 0;
}

.warning-btn {
  margin-top: 12px;
  background: #333;
  color: #fff;
  border: 1px solid rgba(255,255,255,0.1);
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.warning-btn:active {
  transform: scale(0.96);
  background: #444;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

/* ===== BLOB CONFIG ===== */
.blob-container-config {
  position: absolute;
  top: -80vmin;  /* Pull up significantly */
  right: -50vmin; /* Center/Right shift */
  width: 150vmin;
  height: 150vmin; /* Ensure it stays in top region */
  pointer-events: none;
  opacity: 0.4;
  overflow: visible;
  z-index: 0;
  transition: opacity 1s ease-in-out;
}

.blob-container-config.hidden {
  opacity: 0;
}

.blob-container-config svg {
  width: 100%;
  height: 100%;
  filter: blur(25px);
}

/* Reuse keyframes from splash/login logic (re-declared here for scope safety) */
@keyframes spin-slow { 0% { transform: translate(100px, 100px) rotate(0deg) scale(1.5); } 50% { transform: translate(100px, 100px) rotate(180deg) scale(1.4); } 100% { transform: translate(100px, 100px) rotate(360deg) scale(1.5); } }
@keyframes spin-medium { 0% { transform: translate(100px, 100px) rotate(0deg) scale(1.2); } 50% { transform: translate(100px, 100px) rotate(-180deg) scale(1.3); } 100% { transform: translate(100px, 100px) rotate(-360deg) scale(1.2); } }
@keyframes pulse-spin { 0% { transform: translate(100px, 100px) rotate(0deg) scale(0.8); } 50% { transform: translate(100px, 100px) rotate(45deg) scale(1); } 100% { transform: translate(100px, 100px) rotate(0deg) scale(0.8); } }
@keyframes blob-rise { 0% { transform: translate(20%, 20%) scale(0.8); opacity: 0; } 100% { transform: translate(0, 0) scale(1.1); opacity: 1; } }

.blob-layer { transform-origin: center; opacity: 0.7; }
.blob-dark { fill: #082f20; animation: spin-slow 20s linear infinite; opacity: 0.9; }
.blob-green { fill: #008f45; animation: spin-medium 15s linear infinite reverse; opacity: 0.7; }
.blob-light { fill: #80e8b1; animation: pulse-spin 12s ease-in-out infinite; opacity: 0.4; }

/* Ensure content sits above blobs */
.charger-card, .label, .plans-header, .plans, .charger-img-container {
  position: relative;
  z-index: 5;
}

`}</style>

      <div className="config-page" style={{ position: 'relative', overflowX: 'hidden' }}>



        {/* ===== BLOBS (Conditional) ===== */}
        <div className={`blob-container-config ${isChargerUnavailable ? 'hidden' : ''}`}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path className="blob-layer blob-dark" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.9,32.3C59.6,43.1,48.3,51.8,36.5,58.8C24.7,65.8,12.4,71.1,-0.6,72.1C-13.6,73.1,-27.2,69.8,-39.6,62.8C-52,55.8,-63.2,45.1,-71.3,32.2C-79.4,19.3,-84.4,4.2,-81.8,-9.4C-79.2,-23,-69,-35.1,-57.4,-43.8C-45.8,-52.5,-32.8,-57.8,-19.9,-65.4C-7,-73,8.9,-82.9,25.4,-84.2C41.9,-85.5,59,-78.2,44.7,-76.4Z" transform="translate(100 100)" />
            <path className="blob-layer blob-green" d="M41.3,-72.6C53.4,-65.3,63.2,-54.6,70.4,-42.1C77.6,-29.6,82.2,-15.3,81.3,-1.4C80.4,12.5,74,26,64.8,37.3C55.6,48.6,43.6,57.7,30.8,63.2C18,68.7,4.4,70.6,-8.3,69.7C-21,68.8,-32.8,65.1,-43.2,58.3C-53.6,51.5,-62.6,41.6,-68.9,30.1C-75.2,18.6,-78.8,5.5,-75.9,-6.2C-73,-17.9,-63.6,-28.2,-53.4,-36.5C-43.2,-44.8,-32.2,-51.1,-20.9,-58.5C-9.6,-65.9,2,-74.4,14.5,-76.6C27,-78.8,40.4,-74.7,41.3,-72.6Z" transform="translate(100 100)" />
            <path className="blob-layer blob-light" d="M35.6,-62.3C46.5,-55.8,55.9,-47.5,63.1,-37.2C70.3,-26.9,75.3,-14.6,74.7,-2.6C74.1,9.4,67.9,21.1,60.1,31.8C52.3,42.5,42.9,52.2,31.7,58.5C20.5,64.8,7.5,67.7,-4.8,67.3C-17.1,66.9,-32.7,63.2,-45.3,55.8C-57.9,48.4,-67.5,37.3,-72.8,24.6C-78.1,11.9,-79.1,-2.4,-75.3,-15.8C-71.5,-29.2,-62.9,-41.7,-51.5,-49.6C-40.1,-57.5,-25.9,-60.8,-11.8,-62.8C2.3,-64.8,16.4,-65.5,29.3,-62.9C42.2,-60.3,54,-54.4,35.6,-62.3Z" transform="translate(100 100)" />
          </svg>
        </div>

        {/* ===== TOP BAR ===== */}
        <div className="topbar">
          <div className="topbar-left">
            <MenuIcon
              className="menu-icon"
              onClick={() => setDrawerOpen(true)}
            />

            <img
              src={Logo}
              className="top-logo"
              onClick={() => navigate('/')}
              style={{ cursor: 'pointer' }}
              alt="Bentork Logo"
            />
          </div>

          <button
            className="wallet-pill"
            onClick={() => navigate("/dashboard")}
          >
            <img src={WalletIcon} alt="Wallet" />
            ₹{Number(user?.walletBalance ?? 0).toLocaleString("en-IN")}
          </button>

        </div>


        {/* ===== OVERLAY ===== */}
        {/* ===== OVERLAY ===== */}
        <div
          className={`drawer-overlay ${drawerOpen ? "show" : ""}`}
          onClick={() => setDrawerOpen(false)}
        />


        {/* ===== SIDE DRAWER ===== */}
        <div
          className={`side-drawer ${drawerOpen ? "open" : ""}`}
          style={{
            transform: isDrawerDragging
              ? `translateX(${drawerDragOffset}px)`
              : (drawerOpen ? 'translateX(0)' : 'translateX(-100%)'),
            transition: isDrawerDragging ? 'none' : 'transform 0.35s ease'
          }}
          onTouchStart={onDrawerTouchStart}
          onTouchMove={onDrawerTouchMove}
          onTouchEnd={onDrawerTouchEnd}
        >
          <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
            {/* USER HEADER */}
            <div className="drawer-header">
              <div className="user-info">
                <div className="avatar">
                  {user?.picture && !imgError ? (
                    <img
                      src={user.picture}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    sidebarConfig.user.avatar
                  )}
                </div>
                <div>
                  <strong className="text-semibold">{user?.name || sidebarConfig.user.name}</strong>
                  <p className="text-regular">{user?.email || sidebarConfig.user.email}</p>
                </div>
              </div>
              {/* <CloseIcon
                className="close-icon"
                onClick={() => setDrawerOpen(false)}
              /> */}
            </div>

            <hr />

            {/* MENU */}
            <div className="drawer-menu">
              {sidebarConfig.menu.map((group, index) => (
                <div key={index}>
                  {group.items.map((item, i) => (
                    <div
                      className="item"
                      key={i}
                      onClick={() => {
                        setDrawerOpen(false);

                        if (item.label === "My Wallet") {
                          navigate("/dashboard");
                        } else if (item.label === "Terms & Conditions") {
                          navigate("/terms");
                        } else if (item.label === "Privacy Policy") {
                          navigate("/privacy");
                        } else if (item.label === "About Us") {
                          navigate("/about");
                        } else if (item.label === "Tutorial") {
                          navigate("/onboarding-1");
                        } else if (item.label === "FAQ") {
                          navigate("/faq");
                        } else if (item.label === "Download App") {
                          window.open("https://play.google.com/store/apps/details?id=com.bentork.application&hl=en_IN", "_blank");
                        } else if (item.label === "Help") {
                          window.open("https://bentork.com/contacts/");
                        }
                      }}

                    >
                      <span className="icon">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}

                  {index !== sidebarConfig.menu.length - 1 && <hr />}
                </div>
              ))}
            </div>


            {/* LOGOUT */}
            <button className="logout-btn" onClick={logout}>
              Log Out
            </button>
          </div>
        </div>

        {/* DIALOGS */}











        {isPageLoading ? (
          <div className="skeleton-container" style={{ padding: '0 16px', paddingTop: '20px', position: 'relative', zIndex: 10 }}>
            {/* Charger Card Skeleton */}
            <div style={{
              height: '140px',
              borderRadius: '14px',
              background: 'rgba(255,255,255,0.05)',
              marginBottom: '30px',
              animation: 'pulse 1.5s infinite ease-in-out'
            }}></div>

            {/* Input Skeleton */}
            <div style={{ height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', marginBottom: '20px', animation: 'pulse 1.5s infinite ease-in-out' }}></div>

            {/* Chips */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '30px' }}>
              {[1, 2, 3, 4].map(i => <div key={i} style={{ width: '60px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>)}
            </div>

            {/* Plans */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3].map(i => <div key={i} style={{ height: '80px', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite ease-in-out' }}></div>)}
            </div>
          </div>
        ) : (
          <div className="page-enter-anim" style={{ minHeight: '100%' }}>

            {/* ===== MAINTENANCE BANNER ===== */}
            {(() => {
              const mDate = parseMaintenanceDate(maintenanceDate);
              const isUpcoming = mDate && isTodayOrFuture(mDate) && !isMaintenance;
              const showBanner = isMaintenance || isUpcoming;

              if (!showBanner) return null;

              const isOngoing = isMaintenance;
              const title = isOngoing ? "Ongoing Maintenance" : "Upcoming Maintenance Break";
              const subtitle = isOngoing
                ? "Some services are temporarily unavailable. We appreciate your patience."
                : `On ${maintenanceDate}, some services will be unavailable. Please plan accordingly.`;

              return (
                <div className="maintenance-banner animate-fade">
                  <div className="maintenance-banner-icon">
                    <WarningIcon style={{ fontSize: 20, color: "#FFAB00" }} />
                  </div>
                  <div className="maintenance-banner-content">
                    <h4 className="maintenance-banner-title">{title}</h4>
                    <p className="maintenance-banner-subtitle">{subtitle}</p>
                  </div>
                </div>
              );
            })()}

            {/* ===== APP FEATURE TEASER MINI CARD ===== */}
            <div
              className="animate-fade"
              style={{
                margin: '16px 16px 0',
                padding: '12px 16px',
                background: 'linear-gradient(135deg, rgba(57, 226, 155, 0.1), rgba(0,0,0,0))',
                borderRadius: '16px',
                border: '1px solid rgba(57, 226, 155, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setDownloadDialogOpen(true)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(57, 226, 155, 0.2)', color: 'var(--color-primary-container)',
                  display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                  <BoltIcon style={{ fontSize: '18px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>Book a Slot</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>Reserve your charging time</div>
                </div>
              </div>
              <div style={{
                background: 'var(--color-primary-container)', color: '#000',
                padding: '6px 24px', borderRadius: '20px', fontSize: '11px', fontWeight: 700
              }}>
                Book
              </div>
            </div>

            {/* ===== CHARGER CARD ===== */}
            {/* ===== CHARGER CARD ===== */}
            <div className="charger-card">
              <div className="charger-info">
                <p className="charger-name">
                  {chargerData?.name || chargerData?.chargerName || chargerData?.charger_name || chargerData?.stationName || "Bentork Charger"}
                </p>

                <div
                  className={`status-pill ${!chargerData?.status
                    ? 'status-offline'
                    : chargerData.status.toLowerCase() === 'available'
                      ? 'status-available'
                      : ['busy', 'charging', 'active', 'preparing', 'finishing', 'suspendedev', 'suspendedevse', 'reserved'].includes(chargerData.status.toLowerCase())
                        ? 'status-busy'
                        : 'status-offline'
                    }`}
                >
                  {!chargerData?.status ? (
                    <ErrorIcon style={{ fontSize: 14, marginRight: 4 }} />
                  ) : chargerData.status.toLowerCase() === 'available' ? (
                    <CheckCircleIcon style={{ fontSize: 14, marginRight: 4 }} />
                  ) : ['busy', 'charging', 'active', 'preparing', 'finishing', 'suspendedev', 'suspendedevse', 'reserved'].includes(chargerData.status.toLowerCase()) ? (
                    <WarningIcon style={{ fontSize: 14, marginRight: 4 }} />
                  ) : (
                    <ErrorIcon style={{ fontSize: 14, marginRight: 4 }} />
                  )}
                  {chargerData?.status || 'Offline'}
                </div>

                <div className="charger-meta">
                  • Type: {chargerData?.connectorType || "CSS2"}<br />
                  • Power: {chargerData?.chargerType || "AC"}
                </div>
              </div>

              <div className="charger-img-container">
                <img src={StationImg} className="charger-img" alt="Station" />
              </div>
            </div>






            {/* ===== CUSTOM POWER INPUT ===== */}
            <div className="label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Custom Power
              <InfoOutlinedIcon
                style={{ fontSize: '16px', color: '#aaa', cursor: 'pointer' }}
                onClick={() => setCustomPowerInfoOpen(true)}
              />
            </div>
            <div style={{ padding: '0 16px 20px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Enter power in kW"
                  value={localInput}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '18px 16px',
                    paddingRight: '48px',
                    borderRadius: '16px',
                    border: '3px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.00)',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    outline: 'none'
                  }}
                />
                {localInput && (
                  <span
                    onClick={() => {
                      setLocalInput('');
                      updatePowerValue(0);
                    }}
                    style={{
                      position: 'absolute',
                      right: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      cursor: 'pointer',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '16px',
                      padding: '8px'
                    }}
                  >
                    ✕
                  </span>
                )}
              </div>
            </div>

            {/* Quick Add Chips */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '-12px' }}>
              {(chargerData?.chargerType?.toLowerCase().includes('dc') || chargerData?.chargerType?.toLowerCase().includes('fast')
                ? [10, 30, 50, 100]
                : [1, 5, 10]
              ).map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    const current = Number(localInput) || 0;
                    const next = current + val;
                    const isDC = chargerData?.chargerType?.toLowerCase().includes('dc') || chargerData?.chargerType?.toLowerCase().includes('fast');
                    const maxPower = isDC ? 500 : 100;
                    const finalVal = Math.min(next, maxPower);

                    setLocalInput(String(finalVal));
                    updatePowerValue(finalVal);
                  }}
                  style={{
                    background: 'var(--color-matte-black)',
                    border: '0px solid rgba(255,255,255,0.1)',
                    borderRadius: '18px',
                    padding: '9px 16px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  +{val} kW
                </button>
              ))}
            </div>


            {/* ===== PLANS ===== */}
            <div className="plans-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isValidCustomPower ? 'Custom Plan' : 'Plans'}
                <InfoOutlinedIcon
                  style={{ fontSize: '16px', color: '#aaa', cursor: 'pointer', fontWeight: 'normal' }}
                  onClick={() => setPlansInfoOpen(true)}
                />
              </h3>
              {isValidCustomPower && (
                <span
                  className="last-used-pill"
                  onClick={() => {
                    setLocalInput('');
                    updatePowerValue(0);
                    // selectPlan(null); // Handled by useEffect, but explicit clear is fine too
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  Reset
                </span>
              )}
            </div>

            <div className="plans">
              {isValidCustomPower ? (
                <div
                  key="custom-plan"
                  className="plan active animate-fade"
                  style={{ background: '#2b2b2b', outline: '2px solid var(--color-primary-container)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="plan-icon-box">
                      <BoltIcon style={{ fontSize: '20px' }} />
                    </div>
                    <div>
                      <strong style={{ textTransform: 'capitalize' }}>Custom Power</strong>
                      <br />
                      <span>{powerValue} kW</span>
                      <br />
                      <span style={{ fontSize: '10px', opacity: 0.5 }}>Rate: ₹{chargerRate.toFixed(2)} / kWh</span>
                    </div>
                  </div>
                  <span className="price">₹{(powerValue * chargerRate).toFixed(2)}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plansLoading ? (
                    // Skeleton Loading
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="plan"
                        style={{
                          height: '76px',
                          background: '#2b2b2b',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                          animation: 'pulse 1.5s infinite'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                          <div style={{ height: '18px', width: '60%', background: '#3a3a3a', borderRadius: '4px' }}></div>
                          <div style={{ height: '12px', width: '40%', background: '#3a3a3a', borderRadius: '4px' }}></div>
                        </div>
                        <div style={{ height: '20px', width: '50px', background: '#3a3a3a', borderRadius: '4px' }}></div>
                      </div>
                    ))
                  ) : plans && plans.length > 0 ? (
                    plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`plan ${selectedPlan?.id === plan.id ? "active" : ""} animate-fade`}
                        onClick={() => {
                          setLocalInput('');
                          updatePowerValue(0);
                          selectPlan(plan);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="plan-icon-box">
                            <BoltIcon style={{ fontSize: '20px' }} />
                          </div>
                          <div>
                            <strong style={{ textTransform: 'capitalize' }}>{plan.planName?.toLowerCase()}</strong>
                            <br />
                            <span style={{ fontSize: '11px', opacity: 0.6 }}>
                              Rate: ₹{chargerRate} /kW {Number(chargerData?.platformFeePerKwh || 0) > 0 ? `+ ₹${Number(chargerData?.platformFeePerKwh)}/kW fee ` : ''}• {plan.durationMin} mins
                            </span>
                          </div>
                        </div>
                        <span className="price">₹{plan.walletDeduction}</span>

                      </div>
                    ))
                  ) : (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '40px 20px',
                      textAlign: 'center',
                      opacity: 0.7
                    }}>
                      <ErrorIcon style={{ fontSize: '48px', marginBottom: '12px', color: '#ff5252' }} />
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>No Plans Found</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: '#aaa' }}>Try using custom power above</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ===== PAY BUTTON ===== */}
        {selectedPlan && !isChargerUnavailable && (
          <button
            className="pay-btn"
            onClick={openReceipt}
          >
            Next
          </button>
        )}

        {/* Download Dialog */}
        {
          downloadDialogOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 999,
              }}
              onClick={() => setDownloadDialogOpen(false)}
            >
              <div
                style={{
                  background: "#212121",
                  padding: "20px",
                  borderRadius: "16px",
                  width: "90%",
                  maxWidth: "400px",
                  position: "relative",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <CloseIcon
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    cursor: "pointer",
                    color: "#fff",
                  }}
                  onClick={() => setDownloadDialogOpen(false)}
                />

                {/* Image */}
                <div style={{ textAlign: "center", margin: "20px 0" }}>
                  <img
                    src={DownloadAppImg}
                    alt="App Only Feature"
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </div>

                {/* Text */}
                <h2
                  style={{
                    textAlign: "center",
                    marginBottom: "12px",
                    color: "#fff",
                    fontSize: "18px"
                  }}
                >
                  App Exclusive Feature
                </h2>
                <p style={{ textAlign: "center", color: "#aaa", fontSize: "14px", lineHeight: "1.5", marginBottom: "24px", padding: "0 10px" }}>
                  Download the Bentork App to unlock Slot Booking, Live Session Tracking, and many more advanced capabilities.
                </p>

                <button
                  onClick={() => window.open('https://play.google.com/store/apps/details?id=com.bentork.application', '_blank')}
                  style={{ width: "100%", padding: "12px", background: "var(--color-primary-container)", border: "none", borderRadius: "12px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
                >
                  Download App
                </button>
              </div>
            </div>
          )
        }

        {/* Custom Power Info Dialog */}
        {
          customPowerInfoOpen && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}
              onClick={() => setCustomPowerInfoOpen(false)}
            >
              <div
                style={{ background: "#212121", padding: "25px 20px", borderRadius: "28px", width: "90%", maxWidth: "400px", position: "relative", border: "0px solid #333" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: "16px", gap: '8px' }}>
                  <BoltIcon style={{ color: "var(--color-primary-container)" }} />
                  <h2 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Custom Power</h2>
                </div>
                <CloseIcon
                  style={{ position: "absolute", top: "20px", right: "20px", cursor: "pointer", color: "#aaa" }}
                  onClick={() => setCustomPowerInfoOpen(false)}
                />
                <p style={{ color: "#aaa", fontSize: "14px", lineHeight: "1.5" }}>
                  Set a specific charging limit in kilowatts (kW) tailored to your immediate needs. This mode gives you precise control over exactly how much energy you want your vehicle to draw during this session.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: "24px" }}>
                  <button
                    onClick={() => setCustomPowerInfoOpen(false)}
                    style={{ width: "fit-content", padding: "14px 36px", background: "var(--color-card-bg)", border: "none", borderRadius: "28px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Plans Info Dialog */}
        {
          plansInfoOpen && (
            <div
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}
              onClick={() => setPlansInfoOpen(false)}
            >
              <div
                style={{ background: "#212121", padding: "25px 20px", borderRadius: "28px", width: "90%", maxWidth: "400px", position: "relative", border: "0px solid #333" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: "16px", gap: '8px' }}>
                  <BoltIcon style={{ color: "var(--color-primary-container)" }} />
                  <h2 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Charging Plans</h2>
                </div>
                <CloseIcon
                  style={{ position: "absolute", top: "20px", right: "20px", cursor: "pointer", color: "#aaa" }}
                  onClick={() => setPlansInfoOpen(false)}
                />
                <p style={{ color: "#aaa", fontSize: "14px", lineHeight: "1.5" }}>
                  Select from our predefined charging packages. These plans are optimized to offer structured pricing and specific charging durations tailored to common driving requirements. Choose the one that best suits your routine!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: "24px" }}>
                  <button
                    onClick={() => setPlansInfoOpen(false)}
                    style={{ width: "fit-content", padding: "14px 36px", background: "var(--color-card-bg)", border: "none", borderRadius: "28px", color: "#fff", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* Full-screen Maintenance Override */}
        {isMaintenance && (
          <div style={{
            position: "fixed",
            inset: 0,
            background: "#121212", // Solid full screen background, no transparency
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            padding: "24px"
          }}>
            <div style={{
              width: "100%",
              maxWidth: "360px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center"
            }}>
              <WarningIcon style={{ fontSize: 64, color: "#FFAB00", marginBottom: "24px" }} />
              <h2 style={{ margin: "0 0 12px 0", color: "#fff", fontSize: "18px" }}>Ongoing Maintenance</h2>
              <p style={{ color: "#aaa", fontSize: "12px", lineHeight: "1.6", margin: "0 0 32px 0" }}>
                Our services are temporarily offline for an important system update. We are working hard to restore service as quickly as possible.
                <br /><br />
                Please download the Bentork EV App to get notified automatically once the system is back online.
              </p>
              <button
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.bentork.application&hl=en_IN', '_blank')}
                style={{ width: "60%", padding: "12px", background: "var(--color-primary-container)", border: "none", borderRadius: "28px", color: "#000", fontWeight: "bold", cursor: "pointer", fontSize: "15px" }}
              >
                Download App
              </button>
            </div>
          </div>
        )}

        {/* Auto-redirect handled in useEffect above */}

        <Outlet />
      </div >
    </>
  )
};

export default ConfigCharging;



