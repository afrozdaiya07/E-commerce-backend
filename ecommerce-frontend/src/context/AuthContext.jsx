import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* Login */
  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(userData);
  };

  /* Logout */
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  /* Fetch Profile */
  const fetchProfile = async () => {
    try {
      const currentToken =
        localStorage.getItem("token");

      if (!currentToken) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await api.get(
        "/users/profile"
      );

      setUser(response.data.user);
    } catch (error) {
      console.log(
        "Failed to load user profile:",
        error.response?.data?.message ||
          error.message
      );

      localStorage.removeItem("token");

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  /* Initial / Token Change */
  useEffect(() => {
    fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);