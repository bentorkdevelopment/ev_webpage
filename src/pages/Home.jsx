import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import "../assets/styles/global.css";

// CSS styles moved into the component
const homeStyles = `
/* =====================================================
   Home Page Styles
   Matching the 'ConfigCharging' premium dark theme
   ===================================================== */

.home-page {
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--color-matte-black, #111);
    color: #fff;
    font-family: var(--font-primary, Roboto, sans-serif);
    position: relative;
    overflow-x: hidden;
    overflow-y: auto !important;
    padding-bottom: 0px;
    width: 100%;
}

html, body {
    overflow-y: auto !important;
    height: auto !important;
    margin: 0;
    padding: 0;
}

.home-page * {
    box-sizing: border-box;
}

/* ===== BACKGROUND BLOBS ===== */
.blob-container-home {
    position: fixed;
    top: -60vmin;
    right: -40vmin;
    width: 140vmin;
    height: 140vmin;
    z-index: 0;
    pointer-events: none;
    opacity: 0.45;
}

.blob-container-home svg {
    width: 100%;
    height: 100%;
    filter: blur(50px);
}

/* Use global animations if available, otherwise define simpler ones here handled by global.css usually */

/* ===== TOP BAR ===== */
.home-topbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 82px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18px;
    z-index: 100;
    background: transparent;
}

.home-topbar::before {
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
    gap: 12px;
}

.menu-icon {
    font-size: 28px !important;
    cursor: pointer;
    color: #fff;
}

.top-logo {
    height: 20px;
    width: auto;
}

.wallet-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
}

.wallet-pill:active {
    background: rgba(255, 255, 255, 0.2);
}

.wallet-pill img {
    width: 16px;
    height: 16px;
}

/* ===== CONTENT ===== */
.home-content {
    position: relative;
    z-index: 10;
    padding: 100px 20px 36px;
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* WELCOME */
.welcome-section {
    margin-bottom: 24px;
}

.greeting {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0 0 4px;
}

.main-heading {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    margin: 0;
    background: linear-gradient(90deg, #fff, #b3b3b3);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* SCAN CARD */
.scan-card {
    background: linear-gradient(135deg, rgba(57, 226, 155, 0.15), rgba(57, 226, 155, 0.05));
    border: 2px solid rgba(57, 226, 155, 0.3);
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 32px rgba(57, 226, 155, 0.1);
}

.scan-card:active {
    transform: scale(0.98);
}

.scan-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.scan-icon-wrapper {
    width: 48px;
    height: 48px;
    background: #39E29B;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
}

.scan-icon {
    font-size: 28px !important;
}

.scan-text h2 {
    font-size: 18px;
    font-weight: 700;
    margin: 0 0 4px;
    color: #fff;
}

.scan-text p {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

.scan-arrow {
    font-size: 24px;
    color: #39E29B;
    font-weight: 300;
}

/* ===== LANDING SECTIONS ===== */
.landing-section {
    width: 100%;
    margin-top: 36px;
    padding: 4px 0;
}

.section-inner {
    max-width: 600px;
    width: 100%;
    margin: 0 auto;
    padding: 0 20px;
    box-sizing: border-box;
}

.full-bleed-section {
    width: 100%;
    background: rgba(255, 255, 255, 0.02);
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 48px 0;
    margin: 48px 0;
}

.feature-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 24px;
}

@media (max-width: 480px) {
    .feature-grid {
        grid-template-columns: 1fr;
    }
}

.benefit-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 24px;
    backdrop-filter: blur(14px);
    transition: transform 0.3s, background 0.3s;
}

.benefit-card:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-4px);
}

.stat-item h4 {
    font-size: 32px;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, var(--color-primary-container), #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* SEARCH BAR */
.search-bar {
    position: relative;
    margin-bottom: 32px;
}

.search-bar input {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 14px 14px 14px 44px;
    color: #fff;
    font-size: 14px;
    outline: none;
}

.search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px !important;
}

/* LIST HEADER */
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
}

.section-header h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #fff;
}

.see-all {
    font-size: 12px;
    color: #39E29B;
    cursor: pointer;
}

/* STATION ITEM */
.stations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.station-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: background 0.2s;
}

.station-card:hover {
    background: rgba(255, 255, 255, 0.06);
}

.station-icon-box {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
}

.station-info {
    flex: 1;
}

.station-info h4 {
    font-size: 15px;
    font-weight: 500;
    margin: 0 0 4px;
    color: #fff;
}

.station-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
}

.meta-icon {
    font-size: 12px !important;
    vertical-align: middle;
}

.status-text.available {
    color: #39E29B;
}

.status-text.busy {
    color: #ffa726;
}

.power-badge {
    font-size: 11px;
    color: #39E29B;
    background: rgba(57, 226, 155, 0.1);
    padding: 4px 8px;
    border-radius: 6px;
    font-weight: 500;
}

/* ===== DRAWER CSS FROM CONFIG SCREEN ===== */
/* ===== OVERLAY ===== */
.drawer-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    pointer-events: none;
    transition: 0.3s;
    z-index: 102;
    /* Higher than topbar */
}

.drawer-overlay.show {
    opacity: 1;
    pointer-events: all;
}

/* ===== DRAWER ===== */
.drawer-box {
    display: flex;
    flex-direction: column;
    height: 100%;
    margin: 16px;
    background: rgba(33, 33, 33, 0.03);
    /* Subtle internal background */
    border-radius: 22px;
    overflow: hidden;
    /* Prevent internal spill */
}

.side-drawer {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    height: 100dvh;
    width: 85vw;
    max-width: 340px;
    background: rgba(33, 33, 33, 0.95);
    /* High opacity for legibility */
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    transform: translateX(-100%);
    transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 105;
    /* Highest z-index */
    border-radius: 0 28px 28px 0;
    display: flex;
    flex-direction: column;
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
    /* Add shadow for depth */
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
    padding: 20px 16px 10px;
    /* Adjusted padding */
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
}

.user-info {
    display: flex;
    gap: 12px;
    align-items: center;
    overflow: hidden;
    /* Protect text overflow */
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
    overflow: hidden;
}

.user-text-container {
    min-width: 0;
    /* Important for text-overflow to work in flex */
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

/* ===== MENU ===== */
.drawer-menu {
    flex: 1;
    /* Take up remaining space */
    overflow-y: auto;
    /* Scroll if menu is too long */
    padding: 0 16px;
}

.drawer-menu .item {
    padding: 12px 0;
    /* More vertically spacing for touch */
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #fff;
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
    margin: 16px;
    /* Margin around button */
    margin-top: auto;
    /* Push to bottom if space permits */
    padding: 14px;
    background: #ff3131;
    color: #fff;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    flex-shrink: 0;
    /* Don't shrink */
}
`;

import Logo from "../assets/images/logo-1.png";
import WalletIcon from "../assets/images/wallet.svg";
import AppFeaturesMockup from "../assets/images/app_features_mockup.jpg";
import CacheService from "../services/cache.service";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BoltIcon from '@mui/icons-material/Bolt';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PowerIcon from "@mui/icons-material/Power";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EastIcon from '@mui/icons-material/East';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SecurityIcon from '@mui/icons-material/Security';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import EvStationIcon from '@mui/icons-material/EvStation';
import MapIcon from '@mui/icons-material/Map';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import NearMeIcon from '@mui/icons-material/NearMe';
import RouteIcon from '@mui/icons-material/Route';
import TimerIcon from '@mui/icons-material/Timer';
import MailIcon from '@mui/icons-material/Mail';
import { motion } from "framer-motion";

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
                { label: "My Wallet", icon: <AccountBalanceWalletIcon />, path: "/dashboard" },
            ]
        },
        {
            section: "features",
            items: [
                { label: "Buy Station", icon: <ShoppingCartIcon />, action: 'buy' },
                { label: "Trip Planner", icon: <MapIcon />, action: 'trip' },
            ]
        },
        {
            section: "support",
            items: [
                { label: "Help", icon: <HelpOutlineIcon />, path: "/faq" },
                { label: "FAQ", icon: <QuizIcon />, path: "/faq" },
                { label: "Tutorial", icon: <SchoolIcon />, path: "/onboarding-1" },
                { label: "Download App", icon: <DownloadIcon />, external: "https://play.google.com/store/apps/details?id=com.bentork.application" }
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

import ApiService from "../services/api.service";
import API_CONFIG from "../config/api.config";

const Home = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [showScannerGuide, setShowScannerGuide] = useState(false);
    const [showBuyStationDialog, setShowBuyStationDialog] = useState(false);
    const [showTripPlannerDialog, setShowTripPlannerDialog] = useState(false);
    const [activeSession, setActiveSession] = useState(() => CacheService.getSessionData());
    const [activeStep, setActiveStep] = useState(0); // Track active flow step
    const [isAutoLooping, setIsAutoLooping] = useState(true); // Track if auto-cycling is active

    const handleScanClick = () => {
        const isAndroid = /Android/i.test(navigator.userAgent);

        if (isAndroid) {
            const intentUrl = "intent://#Intent;package=com.google.ar.lens;S.browser_fallback_url=https%3A%2F%2Fplay.google.com%2Fstore%2Fsearch%3Fq%3Dgoogle%2520lens%26c%3Dapps;end";
            window.location.href = intentUrl;

            setTimeout(() => {
                setShowScannerGuide(true);
            }, 100);
        } else {
            setShowScannerGuide(true);
        }
    };

    // Reset imgError when user picture changes
    React.useEffect(() => {
        setImgError(false);
    }, [user?.picture]);

    // Poll active session from cache every 5s
    React.useEffect(() => {
        const refresh = () => {
            const session = CacheService.getSessionData();
            const isActive = session && ['ACTIVE', 'INITIATED'].includes(String(session.status).toUpperCase());
            setActiveSession(isActive ? session : null);
        };
        refresh();
        const interval = setInterval(refresh, 5000);
        return () => clearInterval(interval);
    }, []);

    // Auto-cycling logic for the 3 steps
    React.useEffect(() => {
        let interval;
        if (isAutoLooping) {
            interval = setInterval(() => {
                setActiveStep((prev) => (prev + 1) % 3);
            }, 4000); // 4-second interval
        }
        return () => clearInterval(interval);
    }, [isAutoLooping]);

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



    return (
        <div className="home-page">
            <style>{homeStyles}</style>
            {/* ===== BACKGROUND BLOBS ===== */}
            <div className="blob-container-home">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <path className="blob-layer blob-dark" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.9,32.3C59.6,43.1,48.3,51.8,36.5,58.8C24.7,65.8,12.4,71.1,-0.6,72.1C-13.6,73.1,-27.2,69.8,-39.6,62.8C-52,55.8,-63.2,45.1,-71.3,32.2C-79.4,19.3,-84.4,4.2,-81.8,-9.4C-79.2,-23,-69,-35.1,-57.4,-43.8C-45.8,-52.5,-32.8,-57.8,-19.9,-65.4C-7,-73,8.9,-82.9,25.4,-84.2C41.9,-85.5,59,-78.2,44.7,-76.4Z" transform="translate(100 100)" />
                    <path className="blob-layer blob-green" d="M41.3,-72.6C53.4,-65.3,63.2,-54.6,70.4,-42.1C77.6,-29.6,82.2,-15.3,81.3,-1.4C80.4,12.5,74,26,64.8,37.3C55.6,48.6,43.6,57.7,30.8,63.2C18,68.7,4.4,70.6,-8.3,69.7C-21,68.8,-32.8,65.1,-43.2,58.3C-53.6,51.5,-62.6,41.6,-68.9,30.1C-75.2,18.6,-78.8,5.5,-75.9,-6.2C-73,-17.9,-63.6,-28.2,-53.4,-36.5C-43.2,-44.8,-32.2,-51.1,-20.9,-58.5C-9.6,-65.9,2,-74.4,14.5,-76.6C27,-78.8,40.4,-74.7,41.3,-72.6Z" transform="translate(100 100)" />
                    <path className="blob-layer blob-light" d="M35.6,-62.3C46.5,-55.8,55.9,-47.5,63.1,-37.2C70.3,-26.9,75.3,-14.6,74.7,-2.6C74.1,9.4,67.9,21.1,60.1,31.8C52.3,42.5,42.9,52.2,31.7,58.5C20.5,64.8,7.5,67.7,-4.8,67.3C-17.1,66.9,-32.7,63.2,-45.3,55.8C-57.9,48.4,-67.5,37.3,-72.8,24.6C-78.1,11.9,-79.1,-2.4,-75.3,-15.8C-71.5,-29.2,-62.9,-41.7,-51.5,-49.6C-40.1,-57.5,-25.9,-60.8,-11.8,-62.8C2.3,-64.8,16.4,-65.5,29.3,-62.9C42.2,-60.3,54,-54.4,35.6,-62.3Z" transform="translate(100 100)" />
                </svg>
            </div>



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
                            <div className="user-text-container">
                                <strong style={{ fontSize: '15px', fontWeight: '600' }}>{user?.name || sidebarConfig.user.name}</strong>
                                <p style={{ fontSize: '13px', opacity: 0.7 }}>{user?.email || sidebarConfig.user.email}</p>
                            </div>
                        </div>
                    </div>

                    <hr />

                    {/* MENU ITEMS */}
                    <div className="drawer-menu">
                        {sidebarConfig.menu.map((section, idx) => (
                            <React.Fragment key={idx}>
                                {section.items.map((item, i) => (
                                    <div
                                        key={i}
                                        className="item"
                                        onClick={() => {
                                            setDrawerOpen(false);
                                            if (item.action === 'buy') {
                                                setShowBuyStationDialog(true);
                                            } else if (item.action === 'trip') {
                                                setShowTripPlannerDialog(true);
                                            } else if (item.external) {
                                                window.open(item.external, '_blank', 'noopener noreferrer');
                                            } else if (item.path) {
                                                navigate(item.path);
                                            }
                                        }}
                                    >
                                        {item.icon}
                                        <span style={{ flex: 1 }}>{item.label}</span>
                                        <ChevronRightIcon style={{ fontSize: '20px', opacity: 0.3 }} />
                                    </div>
                                ))}
                                {idx < sidebarConfig.menu.length - 1 && <hr />}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* LOGOUT */}
                    <button
                        className="logout-btn"
                        onClick={() => {
                            logout();
                        }}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* ===== HEADER ===== */}
            <div className="home-topbar">
                <div className="topbar-left">
                    <MenuIcon className="menu-icon" onClick={() => setDrawerOpen(true)} />
                    <img src={Logo} className="top-logo" alt="Bentork" />
                </div>
                <button className="wallet-pill" onClick={() => navigate("/dashboard")}>
                    <img src={WalletIcon} alt="Wallet" />
                    ₹{Number(user?.walletBalance ?? 0).toLocaleString("en-IN")}
                </button>
            </div>

            {/* ===== CONTENT ===== */}
            <div className="home-content page-enter-anim">

                {/* WELCOME SECTION */}
                <div className="welcome-section">
                    <p className="greeting">Hello, {user?.name?.split(' ')[0] || "Driver"} 👋</p>
                    <h1 className="main-heading">{activeSession ? 'Session in progress.' : 'Ready to charge?'}</h1>
                </div>

                {/* SCAN CARD / ACTIVE SESSION CARD */}
                {activeSession ? (
                    // ── ACTIVE SESSION MINI CARD ──
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="scan-card"
                        onClick={() => navigate('/charging-session')}
                        style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                    >
                        {/* Pulsing green glow */}
                        <motion.div
                            animate={{ opacity: [0.3, 0.7, 0.3] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{
                                position: 'absolute', inset: 0,
                                background: 'radial-gradient(ellipse at 20% 50%, rgba(57,226,155,0.15) 0%, transparent 70%)',
                                pointerEvents: 'none'
                            }}
                        />
                        <div className="scan-content">
                            <div className="scan-icon-wrapper" style={{ background: 'rgba(57,226,155,0.15)' }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <BoltIcon className="scan-icon" style={{ color: 'var(--color-primary-container)' }} />
                                </motion.div>
                            </div>
                            <div className="scan-text">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                    <span style={{
                                        width: '7px', height: '7px', borderRadius: '50%',
                                        background: 'var(--color-primary-container)',
                                        display: 'inline-block',
                                        boxShadow: '0 0 6px rgba(57,226,155,0.8)'
                                    }} />
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-container)', letterSpacing: '0.05em' }}>CHARGING ACTIVE</span>
                                </div>
                                <h2>Active Session</h2>
                                <p>Tap to view your live charging progress</p>
                            </div>
                        </div>
                        <div className="scan-arrow">→</div>
                    </motion.div>
                ) : (
                    // ── SCAN QR CARD ──
                    <div className="scan-card" onClick={handleScanClick}>
                        <div className="scan-content">
                            <div className="scan-icon-wrapper">
                                <QrCodeScannerIcon className="scan-icon" />
                            </div>
                            <div className="scan-text">
                                <h2>Scan QR Code</h2>
                                <p>Scan the code on the charger to start</p>
                            </div>
                        </div>
                        <div className="scan-arrow">→</div>
                    </div>
                )}

                {/* Trust Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                    viewport={{ once: true }}
                    style={{
                        marginTop: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}>
                    
                </motion.div>
            </div>

            {/* FULL WIDTH LANDING EXPERIENCE */}
            <div className="landing-area" style={{ position: 'relative', zIndex: 10, width: '100%', paddingBottom: '0px' }}>

                {/* Visual Depth Blobs */}
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    right: '-20%',
                    width: '600px',
                    height: '600px',
                    background: 'radial-gradient(circle, rgba(57, 226, 155, 0.03) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '20%',
                    left: '-20%',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: -1,
                    pointerEvents: 'none'
                }} />
                {/* 1. GUIDED STEPS SECTION */}
                <section className="landing-section">
                    <div className="section-inner">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '32px' }}
                        >
                            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px', background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>How it works.</h1>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '400px', margin: '0 auto' }}>
                                A simple three-step process to get you back on the road.
                            </p>
                        </motion.div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                        }}>
                            {[
                                { label: "Scan", icon: <QrCodeScannerIcon />, desc: "Focus your camera on the charger QR." },
                                { label: "Plug", icon: <PowerIcon />, desc: "Connect the charger to your EV's port." },
                                { label: "Go", icon: <PlayArrowIcon />, desc: "Pay & track your session in real-time." }
                            ].map((step, idx) => (
                                <React.Fragment key={idx}>
                                    <motion.div
                                        onClick={() => {
                                            setActiveStep(idx);
                                            setIsAutoLooping(false); // Stop loop on manual interaction
                                        }}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1, type: 'spring', damping: 20 }}
                                        style={{
                                            flex: '0 1 auto',
                                            width: '94px',
                                            height: '94px',
                                            background: activeStep === idx ? 'rgba(57, 226, 155, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                                            border: activeStep === idx ? '2px solid var(--color-primary-container)' : '2px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '24px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backdropFilter: 'blur(10px)',
                                            cursor: 'pointer',
                                            transition: '0.3s'
                                        }}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            background: activeStep === idx ? 'rgba(57, 226, 155, 0.2)' : 'rgba(57, 226, 155, 0.1)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--color-primary-container)',
                                            marginBottom: '8px'
                                        }}>
                                            {React.cloneElement(step.icon, { style: { fontSize: '18px' } })}
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{step.label}</span>
                                    </motion.div>
                                    {idx < 2 && (
                                        <motion.div
                                            animate={{ x: [0, 5, 0], opacity: [0.2, 0.5, 0.2] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                        >
                                            <EastIcon style={{ fontSize: '14px', color: 'rgba(255,255,255,0.2)' }} />
                                        </motion.div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* STEP DETAIL VIEW */}
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '24px',
                                textAlign: 'center',
                                minHeight: '60px',
                                padding: '0 20px'
                            }}
                        >
                            <p style={{ 
                                fontSize: '13px', 
                                color: 'rgba(255,255,255,0.6)', 
                                lineHeight: '1.6',
                                maxWidth: '300px',
                                margin: '0 auto'
                            }}>
                                <span style={{ color: 'var(--color-primary-container)', fontWeight: 700, marginRight: '4px' }}>
                                    {[ "Scan:", "Plug:", "Go:" ][activeStep]}
                                </span>
                                {[
                                    "Focus your camera on the unique QR code located on the charger faceplate.",
                                    "Firmly insert the charging cable into your vehicle's port until it locks.",
                                    "Authorize payment and monitor your session progress in real-time."
                                ][activeStep]}
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* COMING SOON — APP FEATURES TEASER */}
                <section className="landing-section" style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '36px' }}>
                    <div className="section-inner">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '32px' }}
                        >
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                color: 'var(--color-primary-container)',
                                display: 'block',
                                marginBottom: '10px'
                            }}>LIVE NOW</span>
                            <h3 style={{
                                fontSize: '22px',
                                fontWeight: 700,
                                margin: '0 0 10px',
                                background: 'linear-gradient(90deg, #fff 40%, rgba(255,255,255,0.35))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>More power in the app.</h3>
                            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', maxWidth: '300px', margin: '0 auto', lineHeight: 1.7 }}>
                                Advanced features are on the way — all living inside the Bentork app.
                            </p>
                        </motion.div>

                        {/* 2:3 MOCK IMAGE */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', damping: 18 }}
                            style={{
                                margin: '0 auto',
                                width: '100%',
                                maxWidth: '240px',
                                aspectRatio: '2 / 3',
                                borderRadius: '28px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '0px solid rgba(57, 226, 155, 0.2)',
                                boxShadow: '6px 8px 28px rgba(0,0,0,0.5), 0 0 40px rgba(57, 226, 155, 0.08)'
                            }}
                        >
                            <img
                                src={AppFeaturesMockup}
                                alt="App features preview"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                            {/* Gradient overlay at bottom */}
                            <div style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0,
                                height: '45%',
                                background: 'linear-gradient(to bottom, rgba(10,10,10,0.85) 0%, transparent 100%)'
                            }} />
                            {/* Floating label */}
                            <div style={{
                                position: 'absolute',
                                top: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(57,226,155,0.15)',
                                border: '1px solid rgba(57,226,155,0.3)',
                                borderRadius: '20px',
                                padding: '6px 14px',
                                backdropFilter: 'blur(8px)',
                                whiteSpace: 'nowrap'
                            }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary-container)' }}>
                                    Live Station Map
                                </span>
                            </div>
                        </motion.div>

                        {/* FEATURE PILLS */}
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            justifyContent: 'center',
                            marginTop: '28px'
                        }}>
                            {[
                                { icon: <RouteIcon />,     label: 'Trip Planner' },
                                { icon: <MapIcon />,       label: 'Station Map' },
                                { icon: <LocalCafeIcon />, label: 'Nearby Amenities' },
                                { icon: <NearMeIcon />,    label: 'Real-time Range' },
                                { icon: <EvStationIcon />, label: 'Buy a Station' },
                            ].map((feat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.85 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07, type: 'spring', damping: 20 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '99px',
                                        padding: '7px 14px',
                                        fontSize: '12px',
                                        fontWeight: 500,
                                        color: 'rgba(255,255,255,0.75)'
                                    }}
                                >
                                    {React.cloneElement(feat.icon, { style: { fontSize: '14px', color: 'var(--color-primary-container)' } })}
                                    {feat.label}
                                </motion.div>
                            ))}
                        </div>

                        {/* Sub-label */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            style={{
                                textAlign: 'center',
                                fontSize: '11px',
                                color: 'rgba(255,255,255,0.25)',
                                marginTop: '20px',
                                letterSpacing: '0.03em'
                            }}
                        >
                            Available exclusively in the Bentork mobile app
                        </motion.p>

                        {/* Download App Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginTop: '24px' }}
                        >
                            <motion.a
                                href="https://play.google.com/store/apps/details?id=com.bentork.application"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'var(--color-primary-container)',
                                    color: '#000',
                                    padding: '12px 24px',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    boxShadow: '0 8px 16px rgba(57, 226, 155, 0.2)'
                                }}
                            >
                                <DownloadIcon style={{ fontSize: '20px' }} />
                                Download App
                            </motion.a>
                        </motion.div>
                    </div>
                </section>

                {/* 2. LIVE IMPACT SECTION (Full Bleed) */}
                <section className="full-bleed-section" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(57, 226, 155, 0.08) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        zIndex: -1
                    }} />

                    <div className="section-inner" style={{ textAlign: 'center' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                            >
                                <h4>1,000+</h4>
                                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginTop: '8px' }}>Charges Completed</p>
                            </motion.div>
                            <motion.div
                                className="stat-item"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                            >
                                <h4>5,000+</h4>
                                <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, marginTop: '8px' }}>CO2 Saved (KG)</p>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* 3. BENTORK ADVANTAGE */}
                <section className="landing-section" style={{ marginTop: '0' }}>
                    <div className="section-inner">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            style={{ textAlign: 'center', marginBottom: '40px' }}
                        >
                            <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.4))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Advantage?</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', maxWidth: '440px', margin: '0 auto' }}>
                                We've redefined every step of the EV charging journey for modern drivers.
                            </p>
                        </motion.div>

                        <div className="feature-grid">
                            {[
                                {
                                    title: "Adaptive Power",
                                    icon: <BoltIcon />,
                                    desc: "Our chargers dynamically adjust power delivery to protect your battery's health."
                                },
                                {
                                    title: "Seamless Access",
                                    icon: <QrCodeScannerIcon />,
                                    desc: "No apps, no hardware keys. Scan and start in less than 10 seconds."
                                },
                                {
                                    title: "24/7 Monitoring",
                                    icon: <SecurityIcon />,
                                    desc: "Every session is monitored remotely to ensure maximum uptime and safety."
                                },
                                {
                                    title: "Ready for Go",
                                    icon: <FlashOnIcon />,
                                    desc: "Real-time alerts letting you know exactly when you're charged and ready."
                                }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    className="benefit-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, type: 'spring', damping: 20 }}
                                >
                                    <div style={{ color: 'var(--color-primary-container)', marginBottom: '16px' }}>
                                        {React.cloneElement(feature.icon, { style: { fontSize: '28px' } })}
                                    </div>
                                    <h5 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: 700 }}>{feature.title}</h5>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                                        {feature.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 4. CONTACT US */}
                <section className="landing-section" style={{ marginTop: '20px' }}>
                    <div className="section-inner">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            style={{
                                background: 'linear-gradient(135deg, rgba(57, 226, 155, 0.1), rgba(0,0,0,0))',
                                borderRadius: '32px',
                                padding: '40px 24px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                textAlign: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <MailIcon style={{ fontSize: '48px', color: 'rgba(57, 226, 155, 0.9)', marginBottom: '16px' }} />
                            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>Contact Us</h3>
                            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
                                Have any questions or need support? Reach out to us, and our team will get back to you.
                            </p>
                            <motion.a
                                href="mailto:support@bentork.com"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    background: 'var(--color-primary-container)',
                                    color: '#000',
                                    padding: '12px 24px',
                                    borderRadius: '16px',
                                    textDecoration: 'none',
                                    fontWeight: 700,
                                    fontSize: '14px',
                                    boxShadow: '0 8px 16px rgba(57, 226, 155, 0.2)'
                                }}
                            >
                                <MailIcon style={{ fontSize: '20px' }} />
                                support@bentork.com
                            </motion.a>
                        </motion.div>
                    </div>
                </section>

                {/* FOOTER NOTE */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.2 }}
                    viewport={{ once: true }}
                    style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '32px' }}
                >
                    <p style={{ fontSize: '11px', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        © 2021 Bentork Industries LLP. All Rights Reserved.
                    </p>
                </motion.div>

            </div>

            {/* ... other code remains ... */}

            {/* SCANNER GUIDE DIALOG */}
            {showScannerGuide && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div className="page-enter-anim" style={{
                        background: '#212121',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--color-primary-container)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: '#000'
                        }}>
                            <QrCodeScannerIcon style={{ fontSize: '32px' }} />
                        </div>

                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Scan to Start</h2>
                        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                            Open your phone's camera and point it at the QR code on the charger.
                            <br /><br />
                            Once scanned, you will be redirected automatically to the charging screen.
                        </p>

                        <button
                            onClick={() => setShowScannerGuide(false)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'var(--color-primary-container)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: '0.2s',
                                marginBottom: '12px'
                            }}
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}

            {/* BUY STATION DIALOG */}
            {showBuyStationDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div className="page-enter-anim" style={{
                        background: '#212121',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--color-primary-container)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: '#000'
                        }}>
                            <EvStationIcon style={{ fontSize: '32px' }} />
                        </div>

                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Buy Charging Station</h2>
                        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                            To purchase your own Bentork charging station and start your passive income journey, please download our mobile application.
                        </p>

                        <button
                            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.bentork.application', '_blank')}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'var(--color-primary-container)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: '0.2s',
                                marginBottom: '12px'
                            }}
                        >
                            Download App
                        </button>
                        <button
                            onClick={() => setShowBuyStationDialog(false)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* TRIP PLANNER DIALOG */}
            {showTripPlannerDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '24px'
                }}>
                    <div className="page-enter-anim" style={{
                        background: '#212121',
                        borderRadius: '24px',
                        padding: '32px',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: 'var(--color-primary-container)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: '#000'
                        }}>
                            <MapIcon style={{ fontSize: '32px' }} />
                        </div>

                        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>Trip Planner</h2>
                        <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                            Plan your EV trips with ease — find charging stations along your route, estimate range, and never run out of power. Download the Bentork app to get started.
                        </p>

                        <button
                            onClick={() => window.open('https://play.google.com/store/apps/details?id=com.bentork.application', '_blank')}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'var(--color-primary-container)',
                                border: 'none',
                                borderRadius: '14px',
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: '0.2s',
                                marginBottom: '12px'
                            }}
                        >
                            Download App
                        </button>
                        <button
                            onClick={() => setShowTripPlannerDialog(false)}
                            style={{
                                width: '100%',
                                padding: '14px',
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px',
                                color: '#fff',
                                fontWeight: 500,
                                fontSize: '15px',
                                cursor: 'pointer',
                                transition: '0.2s'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Home;
