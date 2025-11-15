import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getAccessToken, getProfile, login as apiLogin, logout as apiLogout, refreshAccess } from "../api/auth.js";


const AuthCtx = createContext(null);


export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [ready, setReady] = useState(false);
 const refreshTimerRef = useRef(null);
 const inFlightRefresh = useRef(null);
 


 // On mount: if we have a token, try to load user profile
 useEffect(() => {
   let cancelled = false;
   (async () => {
     try {
       const token = getAccessToken();
       if (token) {
          const me = await getProfile();
          // If profile loaded successfully, use it. If getProfile returned null
          // that indicates the token is invalid/expired (401). In that case
          // clear stored tokens and treat user as signed out so the UI shows
          // Sign in / Sign up instead of a stale placeholder.
          if (me) {
            if (!cancelled) setUser(me);
          } else {
            // token invalid/expired → clear local storage and show signed-out UI
            try { apiLogout(); } catch (e) {}
            if (!cancelled) setUser(null);
          }
          // schedule proactive refresh based on token expiry
          try {
            scheduleRefreshFromToken(token);
          } catch (e) {
            // ignore scheduling errors
          }
       }
     } catch {
        // On other transient errors we'll treat the user as signed-out to
        // avoid showing stale placeholder accounts in the header.
        if (!cancelled) setUser(null);
     } finally {
       if (!cancelled) setReady(true);
     }
   })();
   return () => { cancelled = true; };
 }, []);

  // Decode JWT payload safely
  function decodeJwtPayload(token) {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const str = atob(b64);
      const decoded = decodeURIComponent(str.split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(decoded);
    } catch (e) {
      return null;
    }
  }

  function clearRefreshTimer() {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }

  function scheduleRefreshFromToken(token) {
    clearRefreshTimer();
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) return; // nothing to schedule
    const expMs = payload.exp * 1000;
    const now = Date.now();
    // refresh 60 seconds before expiry, but at least 1s from now
    const buffer = 60 * 1000;
    const msUntilRefresh = Math.max(1000, expMs - now - buffer);
    refreshTimerRef.current = setTimeout(async () => {
      try {
        await doRefresh();
      } catch (e) {
        // do nothing — doRefresh will emit an event if refresh failed
      }
    }, msUntilRefresh);
  }

  async function doRefresh() {
    // Avoid parallel refreshes
    if (inFlightRefresh.current) return inFlightRefresh.current;
    inFlightRefresh.current = (async () => {
      try {
        const newAccess = await refreshAccess();
        // reschedule using newly issued token
        if (newAccess) scheduleRefreshFromToken(newAccess);
        return newAccess;
      } catch (e) {
        // notify listeners that refresh failed
        try {
          window.dispatchEvent(new CustomEvent('auth:refresh_failed', { detail: { reason: e?.message || 'Session expired' } }));
        } catch (ev) {}
        throw e;
      } finally {
        inFlightRefresh.current = null;
      }
    })();
    return inFlightRefresh.current;
  }

  // Previously we displayed a temporary session-expired banner here.
  // The banner has been removed per UX request; we still clear timers and user state when refresh fails.


 // This mirrors your earlier “mockLogin”: return a route based on email for UX consistency
 async function login(email, password) {
   // If LoginPage already called apiLogin, this can be a no-op.
   // But it’s safe to call again; apiLogin sets tokens for us.
   const { route } = await apiLogin(email, password);
   // Best effort: refresh profile so <TopRightProfile/> has data
   try {
     const me = await getProfile();
     setUser(me ?? { email });
   } catch {
     setUser({ email });
   }
  // schedule proactive refresh for this session if token present
  try {
    const token = getAccessToken();
    if (token) scheduleRefreshFromToken(token);
  } catch (e) {}
   return { route };
 }


 function logout() {
  apiLogout();
  clearRefreshTimer();
  setUser(null);
 }

  // Listen for global logout events (used by top-level nav) so other parts
  // of the app can trigger logout without direct prop threading.
  useEffect(() => {
    const handler = () => logout();
  window.addEventListener('auth:logout', handler);
  return () => window.removeEventListener('auth:logout', handler);
  }, []);


 const value = useMemo(() => ({
   user, setUser, ready, login, logout,
   access: getAccessToken() // some components check this
 }), [user, ready]);


  return (
    <AuthCtx.Provider value={value}>
      {children}
    </AuthCtx.Provider>
  );
}


export function useAuth() {
 return useContext(AuthCtx);
}


export default AuthProvider;
