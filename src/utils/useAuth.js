import { jwtDecode } from "jwt-decode";

export const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const user = jwtDecode(token);
    
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    if (user.exp && user.exp < currentTime) {
      // Token is expired, clear it
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.clear();
      localStorage.removeItem("dashboardCache");
      return null;
    }
    
    return user;
  } catch (err) {
    // If there's any error decoding the token, clear it
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    localStorage.removeItem("dashboardCache");
    return null;
  }
};

export const isAuthenticated = () => {
  const user = getCurrentUser();
  return user !== null;
};
