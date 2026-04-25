import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import SessionService from '../services/session.service'
import CacheService from '../services/cache.service'
import NotificationService from '../services/notification.service'
// import EmailService from '../services/email.service'
import AuthService from '../services/auth.service'
import ApiService from '../services/api.service'
import API_CONFIG from '../config/api.config'
import APP_CONFIG from '../config/app.config'
import { logError } from '../config/errors.config'

const SessionContext = createContext(null)

export const useSession = () => {
  const context = useContext(SessionContext)
  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }
  return context
}

const LOADING_MESSAGES = [
  "Initializing your session...",
  "Communicating with charger...",
  "Establishing connection...",
  "Preparing charging station...",
  "Starting charge...",
  "Almost ready..."
]

const RESUMING_MESSAGES = [
  "Resuming your session...",
  "Syncing session data...",
  "Updating status...",
  "Almost there..."
]

export const SessionProvider = ({ children }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, chargerData } = useAuth()

  const timerRef = useRef(null)
  const pollingRef = useRef(null)
  const messageRef = useRef(null)
  const lowTimeWarningShown = useRef(false)
  const sessionCompleteHandled = useRef(false)
  const initializationStarted = useRef(false)

  const sessionRef = useRef(null)
  const planRef = useRef(null)
  const chargerDataRef = useRef(chargerData)
  const chargingDataRef = useRef({
    energyUsed: 0,
    timeElapsed: 0,
    percentage: 0,
    status: 'INITIALIZING'
  })

  const isResuming = useRef(false) // Track if we are resuming or starting fresh
  const [session, setSession] = useState(null)
  const [plan, setPlan] = useState(null)
  const [chargingData, setChargingData] = useState({
    energyUsed: 0,
    timeElapsed: 0,
    percentage: 0,
    status: 'INITIALIZING'
  })

  const [isInitializing, setIsInitializing] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [messageIndex, setMessageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isStopping, setIsStopping] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [notifyOnComplete, setNotifyOnComplete] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    planRef.current = plan
  }, [plan])

  // Sync chargerData to ref for interval access
  useEffect(() => {
    chargerDataRef.current = chargerData
  }, [chargerData])

  useEffect(() => {
    chargingDataRef.current = chargingData
  }, [chargingData])

  const isSessionActive = useMemo(() => {
    const status = String(chargingData.status || '').toLowerCase()
    const active = ['active', 'initiated'].includes(status)
    console.log('isSessionActive check: ', { status, active })
    return active
  }, [chargingData.status])

  const isOnSessionPage = location.pathname === '/charging-session'

  useEffect(() => {
    const savedPref = CacheService.getNotificationPreference()
    setNotifyOnComplete(savedPref)

    if (NotificationService.isSupported) {
      setNotificationPermission(Notification.permission)
    }

    return () => {
      cleanupAllIntervals()
    }
  }, [])

  useEffect(() => {
    if (isOnSessionPage && isSessionActive && !isCompleted) {

      const handleBeforeUnload = (e) => {
        e.preventDefault()
        e.returnValue = 'Charging session is active. Are you sure you want to leave?'
        return e.returnValue
      }

      const handlePopState = (e) => {
        if (isSessionActive && !isCompleted) {
          window.history.pushState(null, '', location.pathname)
          setError('Cannot leave during active charging session')
          setTimeout(() => setError(''), 3000)
        }
      }

      window.history.pushState(null, '', location.pathname)

      window.addEventListener('beforeunload', handleBeforeUnload)
      window.addEventListener('popstate', handlePopState)

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        window.removeEventListener('popstate', handlePopState)
      }
    }
  }, [isOnSessionPage, isSessionActive, isCompleted, location.pathname])


  useEffect(() => {
    if (isInitializing) {
      messageRef.current = setInterval(() => {
        setMessageIndex((prev) => {
          const messages = isResuming.current ? RESUMING_MESSAGES : LOADING_MESSAGES
          const next = (prev + 1) % messages.length
          setLoadingMessage(messages[next])
          return next
        })
      }, APP_CONFIG.SESSION.MESSAGE_ROTATE_INTERVAL)
    } else {
      if (messageRef.current) {
        clearInterval(messageRef.current)
        messageRef.current = null
      }
    }

    return () => {
      if (messageRef.current) {
        clearInterval(messageRef.current)
      }
    }
  }, [isInitializing])


  const cleanupAllIntervals = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    if (messageRef.current) {
      clearInterval(messageRef.current)
      messageRef.current = null
    }
    SessionService.stopStatusPolling()
  }, [])


  const initializeSession = useCallback(async () => {
    if (initializationStarted.current) {
      return { success: false, message: 'Already initializing' }
    }
    initializationStarted.current = true

    try {
      console.log('Initialize Session Started - DB SCAN MODE')
      setError('')
      sessionCompleteHandled.current = false
      lowTimeWarningShown.current = false

      setIsLoading(false)
      setIsInitializing(true)

      // 0. Check for New Session Warmup Flag
      if (CacheService.getWarmupFlag()) {
        console.log('Warmup Flag Detected - Running Warmup Sequence')
        const wSession = CacheService.getSessionData()
        const wPlan = CacheService.getPlanData()
        if (wSession) {
          isResuming.current = false // Explicitly new session
          runWarmupSequence(wSession, wPlan)
          return { success: true }
        }
      }

      // 1. Get Current User
      let currentUserId = user?.id;
      if (!currentUserId) {
        const cachedUser = await AuthService.getCurrentUser();
        currentUserId = cachedUser?.id;
      }
      console.log('User ID:', currentUserId)

      let activeSession = CacheService.getSessionData()
      let activePlan = CacheService.getPlanData()

      // 2. SEARCH DB: Fetch ALL sessions and filter for this user's ACTIVE session
      // This ensures we get the "Source of Truth" directly from the Session Table as requested
      try {
        console.log('Scanning DB for active session...')
        const allSessionsResponse = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_SESSIONS)

        // Handle response which might be wrapped or just an array
        const allSessions = Array.isArray(allSessionsResponse) ? allSessionsResponse : (allSessionsResponse?.data || [])

        console.log(`Scanned ${allSessions.length} records.`)

        const foundSession = allSessions.find(s =>
          Number(s.user?.id || s.userId) === Number(currentUserId) &&
          String(s.status).toUpperCase() === 'ACTIVE'
        )

        if (foundSession) {
          console.log('✅ FOUND ACTIVE SESSION IN DB:', foundSession)
          isResuming.current = true // We found it in DB, so we are resuming
          setLoadingMessage(RESUMING_MESSAGES[0])

          activeSession = {
            ...foundSession,
            sessionId: foundSession.id,
            startTime: foundSession.startTime, // This is the gold standard from DB
            status: foundSession.status,
            energyUsed: foundSession.energyKwh || foundSession.energyUsed || 0,
            // Map generic DB fields to our internal standard
            selectedKwh: Number(foundSession.selectedKwh || foundSession.selected_kwh || foundSession.kwh || foundSession.targetKwh || foundSession.target_kwh || 0)
          }
          CacheService.saveSessionData(activeSession)

          // 3. Match Plan using Transaction Amount (Secondary Recovery)
          // Since Session Table lacks Plan info, we still assume Plan matches similar debit
          if (!activePlan) {
            // A. Try matching generic plans by transaction logic
            const transactions = await AuthService.loadTransaction(currentUserId, 20)
            const sessionTx = transactions.find(t =>
              (String(t.sessionId) === String(foundSession.id) || String(t.session_id) === String(foundSession.id)) &&
              ['DEBIT', 'debit'].includes(t.type)
            )
            if (sessionTx) {
              const allPlans = await ApiService.get(API_CONFIG.ENDPOINTS.GET_ALL_PLANS)
              const matchedPlan = allPlans.find(p => Math.abs(Number(p.walletDeduction) - Number(sessionTx.amount)) < 0.5)
              if (matchedPlan) {
                console.log('Matched Plan:', matchedPlan)
                activePlan = matchedPlan
                CacheService.savePlanData(matchedPlan)
              }
            }

            // B. If still no plan, but session has target info -> SYNTHETIC CUSTOM PLAN
            if (!activePlan && activeSession.selectedKwh > 0) {
              console.log('Detected Custom Session without Plan object - Synthesizing...')
              activePlan = {
                type: 'CUSTOM',
                isCustom: true,
                planName: 'Custom Power',
                kw: activeSession.selectedKwh, // Target
                durationMin: 0
              }
              CacheService.savePlanData(activePlan)
            }
          }

        } else {
          console.warn('No ACTIVE session found in DB for this user.')
          // If we rely purely on DB, we might stop here. 
          // But valid scenarios might have latency, so fall back to cache if really needed
          // For now, assume if DB says no, then NO.
        }
      } catch (dbErr) {
        console.error('Failed to scan DB sessions:', dbErr)
      }


      const sessionId = activeSession?.sessionId || activeSession?.id

      if (!sessionId) {
        console.warn('No active session identified after DB scan.')
        setIsInitializing(false)
        navigate('/config-charging') //Redirect - STRICT
        return { success: false }
      }

      // 4. Live Status Double-Check (Energy & Status)
      const sessionData = await SessionService.fetchSessionData(sessionId)

      const sessionStatus = String(sessionData.status || activeSession.status || '').toUpperCase()

      if (['FAILED', 'COMPLETED', 'STOPPED'].includes(sessionStatus)) {
        console.error('Session is finished (verified live):', sessionStatus)
        setError(`Session ${sessionStatus.toLowerCase()}.`)
        CacheService.clearSessionData()
        CacheService.clearPlanData()
        setIsInitializing(false)
        setTimeout(() => navigate('/config-charging'), 2000)
        return { success: false, error: 'Session unavailable' }
      }

      // 5. Update Context State - MERGE FULL DATA
      // Critical: Ensure we have fields like selectedKwh/targetKwh from the detail view
      if (activeSession) {
        Object.assign(activeSession, sessionData)

        // Remap keys if necessary after merge
        activeSession.selectedKwh = Number(
          activeSession.selectedKwh ||
          activeSession.selected_kwh ||
          activeSession.kwh ||
          activeSession.targetKwh ||
          activeSession.target_kwh ||
          0
        )
      }

      // 5b. Synthetic Custom Plan Check (Redo)
      // If we didn't find a plan earlier, check again now that we have full session data
      const cachedKw = Number(localStorage.getItem('active_custom_kwh') || 0)
      const targetFromSession = Number(activeSession?.selectedKwh || 0)
      const finalTarget = targetFromSession > 0 ? targetFromSession : cachedKw

      if (!activePlan && finalTarget > 0) {
        console.log('Synthesizing Custom Plan from Live Data/Cache...', finalTarget)
        activePlan = {
          type: 'CUSTOM',
          isCustom: true,
          planName: 'Custom Power',
          kw: finalTarget,
          durationMin: 0
        }
        // Ensure session has it too for redundancy
        activeSession.selectedKwh = finalTarget
        CacheService.savePlanData(activePlan)
      }

      setSession(activeSession)
      setPlan(activePlan)
      sessionRef.current = activeSession
      planRef.current = activePlan

      // 6. Calculate Timer
      let initialElapsed = 0

      if (activeSession?.startTime) {
        let startMs = 0;
        const sTime = activeSession.startTime;
        // Robust Date Parsing for Java LocalDateTime array [yyyy, MM, dd, HH, mm, ss]
        if (Array.isArray(sTime)) {
          startMs = new Date(sTime[0], sTime[1] - 1, sTime[2], sTime[3], sTime[4], sTime[5] || 0).getTime()
        } else {
          startMs = new Date(sTime).getTime()
        }

        if (!isNaN(startMs)) {
          const now = Date.now()
          initialElapsed = Math.floor((now - startMs) / 1000)
          if (initialElapsed < 0) initialElapsed = 0
          console.log('Calculated Initial Elapsed:', initialElapsed, 's')
        }
      }

      setChargingData(prev => ({
        ...prev,
        timeElapsed: initialElapsed,
        percentage: 0,
        energyUsed: activeSession?.energyUsed || 0,
        status: activeSession?.status || 'ACTIVE'
      }))

      // 7. Start UI Timers
      setIsInitializing(false)
      startChargingTimers(activeSession, activePlan, initialElapsed)

      return { success: true }
    } catch (err) {
      console.error('Session Init Error:', err)
      setError(logError('SESSION_INIT_ERROR', err))
      setIsInitializing(false)
      setIsLoading(false)
      return { success: false, error: err.message }
    }
  }, [navigate, user])




  const startChargingTimers = useCallback((activeSession, activePlan, initialElapsed = 0) => {
    const sessionId = activeSession.sessionId || activeSession.id
    const durationSeconds = (activePlan?.durationMin || 0) * 60

    if (timerRef.current) clearInterval(timerRef.current)
    if (pollingRef.current) clearInterval(pollingRef.current)

    // Anchor time locally
    const timerStartTimestamp = Date.now() - (initialElapsed * 1000)

    setChargingData(prev => ({
      ...prev,
      timeElapsed: initialElapsed,
      percentage: durationSeconds > 0 ? (initialElapsed / durationSeconds) * 100 : 0
    }))

    timerRef.current = setInterval(() => {
      if (sessionCompleteHandled.current) {
        return
      }

      setChargingData(prev => {
        const now = Date.now()
        // Calculate real elapsed time (float) based on LOCAL anchor
        const elapsedFloat = Math.max(0, (now - timerStartTimestamp) / 1000)
        const newElapsed = Math.floor(elapsedFloat)

        const currentSession = sessionRef.current || activeSession;
        const currentPlan = planRef.current || activePlan;

        // FAIL-SAFE TARGET EXTRACTION
        // 1. Session Data
        // 2. Plan Data
        // 3. Local Storage (Direct read to bypass any state/prop staleness)
        let targetKwh = Number(
          currentSession?.selectedKwh ||
          currentSession?.selected_kwh ||
          currentSession?.kwh ||
          currentSession?.targetKwh ||
          currentSession?.target_kwh ||
          (currentPlan?.isCustom ? currentPlan?.kw : 0) ||
          0
        );

        if (targetKwh <= 0) {
          targetKwh = Number(localStorage.getItem('active_custom_kwh') || 0);
        }

        let percentage = 0;

        if (durationSeconds > 0) {
          percentage = (elapsedFloat / durationSeconds) * 100;
        } else if (targetKwh > 0) {
          // STRICT CONTROL LOGIC
          // 1. Get Backend (Polled) Values
          const backendEnergy = Number(chargingDataRef.current?.energyKwh || chargingDataRef.current?.energyUsed || 0);
          const backendPercentage = Number(chargingDataRef.current?.backendPercentage || 0);

          // 2. Decide Source
          // If Backend has ANY progress, we prefer it exactly as is (interpolated for smoothness if needed, but anchored to it)
          let currentEnergy = 0;

          if (backendEnergy > 0) {
            currentEnergy = backendEnergy;
            // Optional: Add tiny tick for visual liveness if needed, but user wants CONTROL
            // so we stick to backend value primarily. 
            // Maybe interpolate slightly between polls if needed later.
          } else {
            // Fallback Simulation ONLY if backend is 0 (start of session)
            const realTimePower = Number(chargerDataRef.current?.power) || 30; // Default 30kW
            currentEnergy = (realTimePower * elapsedFloat) / 3600;
          }

          // 3. Calculate Final Percentage
          if (backendPercentage > 0) {
            percentage = backendPercentage;
          } else {
            percentage = (currentEnergy / targetKwh) * 100;
          }

          prev.energyUsed = currentEnergy;
        }

        const updated = {
          ...prev,
          timeElapsed: newElapsed,
          percentage: Math.min(100, percentage),
          status: 'ACTIVE'
        }

        chargingDataRef.current = updated
        SessionService.updateTimerState(newElapsed, percentage)

        const remaining = durationSeconds - newElapsed
        if (remaining === APP_CONFIG.SESSION.LOW_TIME_WARNING && !lowTimeWarningShown.current) {
          lowTimeWarningShown.current = true
          if (notifyOnComplete && notificationPermission === 'granted') {
            NotificationService.sendLowTimeWarning(5)
          }
        }

        if (newElapsed >= durationSeconds && durationSeconds > 0 && !sessionCompleteHandled.current) {
          setTimeout(() => handleSessionComplete({ status: 'COMPLETED' }), 0)
        }

        return updated
      })
    }, 100)

    pollingRef.current = setInterval(async () => {
      if (sessionCompleteHandled.current) return

      try {
        const polledData = await SessionService.fetchSessionData(sessionId)

        // 1. Check for completion signals
        const status = String(polledData.status || '').toUpperCase()
        if (['COMPLETED', 'FINISHED', 'FAILED', 'STOPPED'].includes(status) && !sessionCompleteHandled.current) {
          handleSessionComplete(polledData)
          return
        }

        // 2. Sync Real Energy from Backend to Ref
        // This allows the fast 100ms timer loop to correct its course
        const remoteEnergy = Number(polledData.energyUsed || polledData.energyKwh || 0);

        if (!isNaN(remoteEnergy)) {
          // We prioritize the MAX of local vs remote to prevent rollbacks, 
          // BUT if remote is valid, we inject it into the ref so the next 100ms timer tick uses it.
          // Note: We deliberately do NOT call setChargingData here to avoid fighting with the 100ms timer.
          // The timer loop naturally reads chargingDataRef.current values.
          if (remoteEnergy > (chargingDataRef.current.energyUsed || 0)) {
            chargingDataRef.current.energyUsed = remoteEnergy
          }
          if (remoteEnergy > (chargingDataRef.current.energyKwh || 0)) {
            chargingDataRef.current.energyKwh = remoteEnergy
          }
        }

        // 3. Sync Power if available (adjusts speed dynamically)
        if (polledData.power) {
          chargingDataRef.current.power = Number(polledData.power)
        }

        // 4. Sync Percentage (Critical for Hybrid Logic)
        if (polledData.percentage || polledData.soc) {
          chargingDataRef.current.backendPercentage = Number(polledData.percentage || polledData.soc)
        }

      } catch (err) {
        console.warn('Poll error', err)
      }
    }, APP_CONFIG.SESSION.STATUS_POLL_INTERVAL || 5000)

    SessionService.fetchSessionData(sessionId).then(data => {
      setChargingData(prev => {
        const updated = {
          ...prev,
          energyUsed: typeof data.energyUsed === 'number' ? data.energyUsed : 0
        }
        chargingDataRef.current = updated
        return updated
      })
    })
  }, [notifyOnComplete, notificationPermission])

  const runWarmupSequence = useCallback(async (activeSession, activePlan) => {
    // 1. Force UI into Initializing State
    setIsInitializing(true)
    setChargingData(prev => ({ ...prev, status: 'INITIALIZING' }))

    // 2. Wait for full animation duration
    await new Promise(resolve => setTimeout(resolve, APP_CONFIG.SESSION.WARMUP_DURATION))

    let finalSession = { ...activeSession }

    // 3. Perform Backend Handoff
    try {
      const updatedSession = await SessionService.completeWarmup(activeSession.sessionId || activeSession.id)
      if (updatedSession) {
        // Merge updated backend data but PRESERVE critical local fields like selectedKwh if backend misses them
        finalSession = {
          ...finalSession,
          ...updatedSession,
          // Ensure mapping exists
          selectedKwh: Number(updatedSession.selectedKwh || updatedSession.selected_kwh || updatedSession.kwh || updatedSession.targetKwh || updatedSession.target_kwh || activeSession.selectedKwh || 0)
        }
        setSession(finalSession)
        sessionRef.current = finalSession
      }
    } catch (err) {
      console.warn('Warmup completion warning:', err)
    }

    // 4. Finally Switch to Active
    setIsInitializing(false)
    setChargingData(prev => ({ ...prev, status: 'ACTIVE' }))
    startChargingTimers(finalSession, activePlan, 0)
  }, [startChargingTimers])


  const stopSession = useCallback(async () => {
    if (isStopping || sessionCompleteHandled.current) {
      return { success: false }
    }

    setIsStopping(true)
    setError('')

    try {
      const sessionId = session?.sessionId || session?.id
      const result = await SessionService.stopSession(sessionId)

      if (result.success) {
        handleSessionComplete({
          status: 'STOPPED',
          ...result.sessionData
        })
        return { success: true }
      } else {
        setError(result.error || 'Failed to stop session')
        return { success: false, error: result.error }
      }

    } catch (err) {
      setError(logError('SESSION_STOP_FAILED', err))
      return { success: false, error: err.message }
    } finally {
      setIsStopping(false)
    }
  }, [session, isStopping])


  const handleSessionComplete = useCallback(async (data) => {
    if (sessionCompleteHandled.current) {
      console.log('Session complete already handled, skipping...')
      return
    }
    sessionCompleteHandled.current = true

    console.log('Session complete:', data)

    cleanupAllIntervals()

    setChargingData(prev => ({ ...prev, status: data.status }))
    setIsCompleted(true)

    const currentSession = sessionRef.current
    const currentPlan = planRef.current
    const currentChagingData = chargingDataRef.current

    console.log('Building completion data with ', { currentSession, currentPlan, currentChagingData })

    const completionData = {
      sessionId: data.sessionId || currentSession?.sessionId || currentSession?.id,
      receiptId: data.receiptId || currentSession?.receiptId,
      status: data.status,
      startTime: data.startTime || currentSession?.startTime,
      endTime: new Date().toISOString(),
      duration: Math.floor((currentChagingData.timeElapsed || 0) / 60),
      energyUsed: data.energyUsed || data.energyKwh || currentChagingData.energyUsed || 0,
      plan: currentPlan,
      // Prioritize backend response (data), then session, then plan
      amountDebited: data.amountDebited ?? currentSession?.amountDebited,
      finalCost: data.finalCost ?? data.amountDebited ?? currentSession?.amountDebited,
      rate: data.rate ?? currentChagingData?.rate ?? currentPlan?.rate ?? 0,

      transactionId: data.transactionId || session?.receiptId || session?.sessionId || session?.id,
      paymentMethod: 'Wallet',
      stationName: currentChagingData?.stationName || currentChagingData?.name,
      chargerType: currentChagingData?.chargerType,
      userName: user?.name,
      userEmail: user?.email
    }

    console.log('Complete session data: ', completionData)

    const dataToSave = {
      completionData,
      notifyOnComplete
    }
    CacheService.saveSessionData(dataToSave)

    if (notifyOnComplete && notificationPermission === 'granted') {
      await NotificationService.sendSessionCompleted(
        completionData.sessionId,
        user?.name || 'User'
      )
    }

    setTimeout(() => {
      navigate('/invoice')
    }, 1500)
  }, [chargingData,
    chargerData,
    plan,
    session,
    user,
    notifyOnComplete,
    notificationPermission,
    cleanupAllIntervals,
    navigate
  ])


  const toggleNotification = useCallback(async () => {
    if (!notifyOnComplete) {
      const granted = await NotificationService.requestPermission()
      if (granted) {
        setNotificationPermission('granted')
        setNotifyOnComplete(true)
        CacheService.saveNotificationPreference(true)
      } else {
        setNotificationPermission(Notification.permission)
        setError('Notification permission denied')
        setTimeout(() =>
          setError('')
          , 3000)
      }
    } else {
      setNotifyOnComplete(false)
      CacheService.saveNotificationPreference(false)
    }
  }, [notifyOnComplete])


  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const isCustomSession = useMemo(() => {
    // 1. Check Plan Object
    if (plan?.type === 'CUSTOM' || plan?.isCustom === true) return true

    // 2. Check Session Data for Custom Markers (Target/Selected kWh)
    const s = session || chargingData
    // Check widely for any property indicating a custom energy target
    const target = Number(s?.selectedKwh || s?.selected_kwh || s?.kwh || s?.targetKwh || s?.target_kwh || 0)

    return target > 0
  }, [plan, session, chargingData])

  const getRemainingTime = useCallback(() => {
    // Always show elapsed time for consistency
    return formatTime(chargingData.timeElapsed)
  }, [chargingData.timeElapsed, formatTime])

  const getBatteryHealth = useCallback(() => {
    const p = chargingData.percentage
    if (p >= 80) return 'Excellent'
    if (p >= 55) return 'Good'
    if (p >= 30) return 'Average'
    return 'Low'
  }, [chargingData.percentage])


  const isNotificationDisabled = useMemo(() => {
    return notificationPermission === 'denied'
  }, [notificationPermission])


  // const sendInvoiceEmail = useCallback(async (invoiceData) => {
  //   if (!user?.email) {
  //     console.warn('No user email available')
  //     return { success: false, error: 'No email address' }
  //   }

  //   return await EmailService.sendInvoiceEmail({
  //     ...invoiceData,
  //     userName: user.name,
  //     userEmail: user.email
  //   })
  // }, [user])


  const value = useMemo(() => ({

    session,
    plan,
    chargingData,
    isInitializing,
    loadingMessage,
    messageIndex,
    isLoading,
    error,
    isStopping,
    isCompleted,
    notifyOnComplete,
    isSessionActive,
    notificationPermission,
    isNotificationDisabled,
    isCustomSession,

    loadingMessages: isResuming.current ? RESUMING_MESSAGES : LOADING_MESSAGES,
    remainingTime: getRemainingTime(),
    batteryHealth: getBatteryHealth(),

    initializeSession,
    stopSession,
    toggleNotification,
    formatTime,
    getRemainingTime,
    getBatteryHealth,
    // sendInvoiceEmail,
    setError,
    cleanupAllIntervals
  }), [
    session,
    plan,
    chargingData,
    isInitializing,
    loadingMessage,
    messageIndex,
    isLoading,
    error,
    isStopping,
    isCompleted,
    notifyOnComplete,
    isSessionActive,
    notificationPermission,
    isNotificationDisabled,
    isCustomSession,
    getRemainingTime,
    getBatteryHealth,
    initializeSession,
    stopSession,
    toggleNotification,
    formatTime,
    // sendInvoiceEmail,
    cleanupAllIntervals
  ])

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )

}