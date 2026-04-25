import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthService from "../services/auth.service";
import ApiService from "../services/api.service";
import API_CONFIG from "../config/api.config";
import APP_CONFIG from "../config/app.config";
import { useAuth } from "../store/AuthContext";
import "@material/web/progress/linear-progress.js"; // ✅ Material Web progress
import logo from "../assets/images/logo-1.png";
import "../assets/styles/SplashScreen.css";
import CacheService from "../services/cache.service";
import SessionService from "../services/session.service"; // Ensure this is imported
import { logError } from "../config/errors.config";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { ocppId } = useParams();
  const { updateChargerData, transactionHistory, updateUserData } = useAuth();

  const [status, setStatus] = useState("Loading...");
  const [isExiting, setIsExiting] = useState(false);

  const handleNavigation = (path) => {
    setIsExiting(true);
    setTimeout(() => {
      navigate(path);
    }, 700);
  };

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line
  }, []);

  const initializeApp = async () => {
    try {

      // Wait for splash duration before proceeding
      await new Promise((r) => setTimeout(r, APP_CONFIG.UI.SPLASH_DURATION));

      setStatus("Checking authentication...");

      const cacheUser = await AuthService.getCurrentUser();
      console.log("CACHE USER →", cacheUser)


      if (!cacheUser) {
        handleNavigation(`/login${ocppId ? `/${ocppId}` : ""}`);
        return;
      }

      setStatus("Validating credentials...");

      const userResult = await AuthService.userByEmail(cacheUser.email); // Fetches user details using the existing valid token
      console.log("USER BY EMAIL RESULT", userResult);
      if (!userResult.success) {
        handleNavigation(`/login${ocppId ? `/${ocppId}` : ""}`);
        return;
      }

      // Update AuthContext with the fresh user data
      updateUserData(userResult.user);

      if (ocppId) {
        try {
          setStatus("Loading charger...");
          const chargerResponse = await ApiService.get(
            API_CONFIG.ENDPOINTS.GET_CHARGER(ocppId)
          );
          updateChargerData(chargerResponse);
        } catch (err) {
          console.error("Charger load failed", err);
        }
      }

      setStatus("Loading transactions...");
      const transactions = await AuthService.loadTransaction(
        userResult.user.id,
        10
      );
      transactionHistory(transactions);


      setStatus("Checking active session...");

      // 1. Check User Profile for Active Session ID
      // RESTORED: activeSessionId (from AuthService) is the correct property, not sessionId
      let userActiveSessionId = userResult.user.activeSessionId || userResult.user.active_session_id || userResult.user.currentSessionId;
      let validActiveSession = null;

      // 2. Fallback: If not in profile, Scan the Sessions Table (Deep Check)
      // This is crucial if the backend user profile hasn't updated yet but the session is active.
      if (!userActiveSessionId) {
        console.log("No activeSessionId in user profile. Scanning all sessions...");
        try {
          const allSessionsResponse = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_SESSIONS);
          const allSessions = Array.isArray(allSessionsResponse) ? allSessionsResponse : (allSessionsResponse?.data || []);

          const foundSession = allSessions.find(s =>
            Number(s.user?.id || s.userId) === Number(userResult.user.id) &&
            String(s.status).toUpperCase() === 'ACTIVE'
          );

          if (foundSession) {
            console.log("Found Active Session via DB Scan:", foundSession);
            userActiveSessionId = foundSession.id || foundSession.sessionId;

            validActiveSession = {
              sessionId: userActiveSessionId,
              id: userActiveSessionId,
              status: 'ACTIVE',
              userId: userResult.user.id,
              chargerId: foundSession.chargerId || ocppId || 'unknown',
              boxId: foundSession.boxId || ocppId || 'unknown',
              startTime: foundSession.startTime || new Date().toISOString()
            };
          }
        } catch (scanErr) {
          console.error("Session scan failed:", scanErr);
        }
      }

      // 3. Verify and Cache Session (if we found an ID via Profile or Scan)
      if (userActiveSessionId && !validActiveSession) {
        console.log("Verifying Session ID:", userActiveSessionId);
        try {
          const sessionStatus = await SessionService.getSessionStatus(userActiveSessionId);
          const normalizedStatus = String(sessionStatus || '').toUpperCase();

          if (["ACTIVE", "INITIATED", "WARMUP"].includes(normalizedStatus)) {
            let sessionDetails = null;
            try {
              sessionDetails = await ApiService.get(API_CONFIG.ENDPOINTS.GET_SESSION_STATUS(userActiveSessionId));
            } catch (e) { console.warn("Could not get session details", e); }

            const cachedSession = CacheService.getSessionData();

            validActiveSession = {
              sessionId: userActiveSessionId,
              id: userActiveSessionId,
              status: normalizedStatus,
              userId: userResult.user.id,
              chargerId: sessionDetails?.chargerId || sessionDetails?.charger_id || ocppId || (cachedSession && cachedSession.chargerId) || 'unknown',
              boxId: sessionDetails?.boxId || sessionDetails?.box_id || ocppId || (cachedSession && cachedSession.boxId) || 'unknown',
              startTime: sessionDetails?.startTime || (cachedSession && cachedSession.startTime) || new Date().toISOString(),
              selectedKwh: sessionDetails?.selectedKwh || sessionDetails?.selected_kwh || (cachedSession && cachedSession.selectedKwh) || 0
            };

            console.log("Session Verified via Status Check");
          } else {
            console.log("Session exists but status is " + normalizedStatus + ". Ignoring.");
          }
        } catch (err) {
          console.error("Failed to verify session status:", err);
          // Fallback: trust cache if ID matches
          const cachedSession = CacheService.getSessionData();
          if (cachedSession && String(cachedSession.sessionId) === String(userActiveSessionId)) {
            validActiveSession = cachedSession;
          }
        }
      }

      // 4. Save to Cache and Decide
      if (validActiveSession) {
        CacheService.saveSessionData(validActiveSession);
        console.log("Redirecting to active session:", validActiveSession);
        handleNavigation("/charging-session");
        return;
      } else {
        CacheService.clearSessionData();
      }

      setStatus("Securing communication...");
      // await new Promise((r) =>
      //   setTimeout(r, APP_CONFIG.UI.SPLASH_DURATION)
      // );

      if (ocppId) {
        handleNavigation(`/config-charging?ocppId=${ocppId}`);
      } else {
        handleNavigation('/home');
      }
    } catch (error) {
      logError('SESSION_INIT_ERROR', error)
      setTimeout(() => {
        handleNavigation(`/login${ocppId ? `/${ocppId}` : ""}`);
      }, 1000);
    }
  };

  return (
    <div className="splash-container">
      {/* Center Logo Section */}
      <div className="splash-center">
        <img src={logo} alt="Bentork Logo" className="splash-logo" />
        {/* <md-linear-progress indeterminate></md-linear-progress> */}
      </div>

      {/* Bottom Loading Text */}
      {/* <p className="splash-text">{status}</p> */}




      <div className={`blob-container ${isExiting ? 'exit' : ''}`}>
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          {/* Layer 1: Dark Base */}
          <path
            className="blob-layer blob-dark"
            d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.9,32.3C59.6,43.1,48.3,51.8,36.5,58.8C24.7,65.8,12.4,71.1,-0.6,72.1C-13.6,73.1,-27.2,69.8,-39.6,62.8C-52,55.8,-63.2,45.1,-71.3,32.2C-79.4,19.3,-84.4,4.2,-81.8,-9.4C-79.2,-23,-69,-35.1,-57.4,-43.8C-45.8,-52.5,-32.8,-57.8,-19.9,-65.4C-7,-73,8.9,-82.9,25.4,-84.2C41.9,-85.5,59,-78.2,44.7,-76.4Z"
            transform="translate(100 100)"
          />
          {/* Layer 2: Main Brand Green */}
          <path
            className="blob-layer blob-green"
            d="M41.3,-72.6C53.4,-65.3,63.2,-54.6,70.4,-42.1C77.6,-29.6,82.2,-15.3,81.3,-1.4C80.4,12.5,74,26,64.8,37.3C55.6,48.6,43.6,57.7,30.8,63.2C18,68.7,4.4,70.6,-8.3,69.7C-21,68.8,-32.8,65.1,-43.2,58.3C-53.6,51.5,-62.6,41.6,-68.9,30.1C-75.2,18.6,-78.8,5.5,-75.9,-6.2C-73,-17.9,-63.6,-28.2,-53.4,-36.5C-43.2,-44.8,-32.2,-51.1,-20.9,-58.5C-9.6,-65.9,2,-74.4,14.5,-76.6C27,-78.8,40.4,-74.7,41.3,-72.6Z"
            transform="translate(100 100)"
          />
          {/* Layer 3: Bright Glow */}
          <path
            className="blob-layer blob-light"
            d="M35.6,-62.3C46.5,-55.8,55.9,-47.5,63.1,-37.2C70.3,-26.9,75.3,-14.6,74.7,-2.6C74.1,9.4,67.9,21.1,60.1,31.8C52.3,42.5,42.9,52.2,31.7,58.5C20.5,64.8,7.5,67.7,-4.8,67.3C-17.1,66.9,-32.7,63.2,-45.3,55.8C-57.9,48.4,-67.5,37.3,-72.8,24.6C-78.1,11.9,-79.1,-2.4,-75.3,-15.8C-71.5,-29.2,-62.9,-41.7,-51.5,-49.6C-40.1,-57.5,-25.9,-60.8,-11.8,-62.8C2.3,-64.8,16.4,-65.5,29.3,-62.9C42.2,-60.3,54,-54.4,35.6,-62.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
    </div>
  );
};

export default SplashScreen;
