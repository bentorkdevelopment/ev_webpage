import ApiService from './api.service'
import CacheService from './cache.service'
import API_CONFIG from '../config/api.config'
import { parseJwtToken } from '../utils/jwtHelper'

class AuthService {

  static async login(email) {
    try {
      console.log('Attempting login for:', email)
      const response = await ApiService.get(API_CONFIG.ENDPOINTS.LOGIN, {
        email: email
      })
      console.log('Login response:', response)

      if (response.token) {
        const tokenData = parseJwtToken(response.token)
        console.log('Parsed token data:', tokenData)

        let userDetails = await ApiService.get(
          API_CONFIG.ENDPOINTS.GET_USER_BY_EMAIL(email),
          null,
          { headers: { Authorization: `Bearer ${response.token}` } }
        )
        console.log(userDetails)
        let user = null
        if (userDetails) {
          user = {
            id: userDetails.id,
            email: userDetails.email,
            name: userDetails.name || email,
            mobile: userDetails.mobile,
            picture: userDetails.imageUrl || userDetails.picture || userDetails.avatar || userDetails.profile_picture || userDetails.profileImage || tokenData.picture || null,
            walletBalance: Number(userDetails.walletBalance ?? 0),
            activeSessionId: userDetails.activeSessionId || userDetails.active_session_id || userDetails.currentSessionId || userDetails.current_session_id || null
          }
        }

        CacheService.saveUserCredentials(user, response.token)

        return {
          success: true,
          user: user,
          token: response.token
        }
      }
      console.log("error")
      throw new Error('Invalid response from server')
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }


  static async googleLogin(tokenString) {
    try {
      const tokenData = parseJwtToken(tokenString)
      const email = tokenData.sub || tokenData.email

      if (!email) {
        throw new Error('Email not found')
      }

      const userDetails = await ApiService.get(
        API_CONFIG.ENDPOINTS.GET_USER_BY_EMAIL(email),
        null,
        { headers: { Authorization: `Bearer ${tokenString}` } }
      )

      const user = {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name || email,
        mobile: userDetails.mobile,
        picture: userDetails.imageUrl || userDetails.picture || userDetails.avatar || userDetails.profile_picture || userDetails.profileImage || tokenData.picture || null,
        walletBalance: Number(userDetails.walletBalance ?? 0),
        activeSessionId: userDetails.activeSessionId || userDetails.active_session_id || userDetails.currentSessionId || userDetails.current_session_id || null
      }

      CacheService.saveUserCredentials(user, tokenString)

      return {
        success: true,
        user: user,
        token: tokenString
      }
    } catch (error) {
      console.error('Google login error', error)
      return {
        success: false,
        error: error.message || 'Google login failed'
      }
    }
  }

  static async checkTruecallerStatus(requestId) {
    try {
      const response = await ApiService.get(
        API_CONFIG.ENDPOINTS.TRUECALLER_STATUS(requestId)
      )

      if (response && response.token) {
        // Retrieve and build session using the token
        return await this.googleLogin(response.token)
      }
      return { success: false, pending: true }
    } catch (error) {
      console.warn('Truecaller status check pending/failed:', error)
      return { success: false, pending: true, error: error.message }
    }
  }

  static async userByEmail(email) {
    const token = CacheService.getToken()

    if (token) {
      const userDetails = await ApiService.get(
        API_CONFIG.ENDPOINTS.GET_USER_BY_EMAIL(email),
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      const user = {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name || email,
        mobile: userDetails.mobile,
        picture: userDetails.imageUrl || userDetails.picture || userDetails.avatar || userDetails.profile_picture || userDetails.profileImage || null,
        walletBalance: Number(userDetails.walletBalance ?? 0),
        activeSessionId: userDetails.activeSessionId || userDetails.active_session_id || userDetails.currentSessionId || userDetails.current_session_id || null
      }

      CacheService.saveUserCredentials(user, token)

      return {
        success: true,
        user: user,
        token: token
      }
    } else {
      return {
        success: false,
        message: "Falied to get user details"
      }
    }

  }

  static async loadTransaction(userId, limit = 10) {
    try {

      const endpoint = limit === 'all'
        ? API_CONFIG.ENDPOINTS.GET_ALL_USER_TRANSACTIONS(userId)
        : API_CONFIG.ENDPOINTS.GET_USER_TRANSACTION(userId)

      const transactions = await ApiService.get(endpoint, { limit })
      return transactions || []

    } catch (error) {
      console.error('Failed to load transactions:', error)
      return []
    }
  }


  static async verifyCachedCredentials() {
    const cachedData = CacheService.getCachedUser()

    if (!cachedData) {
      console.log('No cached credentials')
      return { success: false, message: 'No cached credentials' }
    }

    if (cachedData.token) {
      console.log('Cached credentials')
      console.log(cachedData.token)
      const tokenData = parseJwtToken(cachedData.token)
      if (tokenData) {
        return {
          success: true,
          user: cachedData.user,
          token: cachedData.token
        }
      }
    }

    CacheService.clearCache()
    console.log('Clean cache')
    return { success: false, message: 'Token expired' }
  }


  static logout() {
    CacheService.clearCache()
    window.location.href = '/login'
  }


  static getCurrentUser() {
    const cachedData = CacheService.getCachedUser()
    console.log(cachedData)
    console.log(cachedData?.user)
    return cachedData?.user || null
  }


  static isAuthenticated() {
    return !!CacheService.getToken()
  }
}

export default AuthService