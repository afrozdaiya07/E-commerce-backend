import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  // Login
  const login = (newToken, userData) => {
    localStorage.setItem("token", newToken);

    setToken(newToken);
    setUser(userData);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");

    setToken(null);
    setUser(null);
  };

  // Get logged-in user after refresh
  const fetchProfile = async () => {
    try {
      const currentToken = localStorage.getItem("token");

      if (!currentToken) {
        setUser(null);
        return;
      }

      const response = await axios.get(
        "http://localhost:5000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${currentToken}`,
          },
        }
      );

      setUser(response.data.user);
    } catch (error) {
      console.log("Failed to load user profile");

      // Token invalid/expired
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Run when app starts or token changes
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

export const useAuth = () => {
  return useContext(AuthContext);
};