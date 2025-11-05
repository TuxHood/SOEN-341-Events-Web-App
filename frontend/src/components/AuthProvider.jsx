import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAccessToken, getProfile, login as apiLogin, logout as apiLogout } from "../api/auth.js";


const AuthCtx = createContext(null);


export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [ready, setReady] = useState(false);


 // On mount: if we have a token, try to load user profile
 useEffect(() => {
   let cancelled = false;
   (async () => {
     try {
       const token = getAccessToken();
       if (token) {
         const me = await getProfile();
         if (!cancelled) setUser(me ?? { email: localStorage.getItem("email") || "" });
       }
     } catch {
       // Don't nuke tokens on transient errors; keep a minimal user
        if (!cancelled) setUser({ email: localStorage.getItem("email") || "" });
     } finally {
       if (!cancelled) setReady(true);
     }
   })();
   return () => { cancelled = true; };
 }, []);


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
   return { route };
 }


 function logout() {
   apiLogout();
   setUser(null);
 }


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
