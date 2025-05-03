import React, { createContext, useState, useContext, useEffect } from "react";
import supabase from "../utils/supabase";
import { useNavigate } from "react-router";

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [session, setSession] = useState(undefined);

  const signUp = async (email, password, name) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error("Error signing up", error);
        return { success: false, error: error };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Error signing in", error);
        return { success: false, error: error };
      }

      return { success: true, data: data };
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out", error);
      }
      return { success: true };
    } catch (error) {
      console.error("An error occurred", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthContextProvider, useAuth };
