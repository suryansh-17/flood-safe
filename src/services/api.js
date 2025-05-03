// src/services/api.js

// Mock loginUser API
export const loginUser = async (credentials) => {
    // Simulate backend check (you can later replace with real API)
    if (credentials.email === "user@example.com" && credentials.password) {
      return {
        success: true,
        token: "mock-token-123456", // Fake token
      };
    } else {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }
  };
  
  // Mock registerUser API
  export const registerUser = async (userData) => {
    // Always succeed for now (backend will later do real validation)
    return {
      success: true,
      message: "User registered successfully",
    };
  };
  