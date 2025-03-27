import axios from "axios";

const API_URL = "http://localhost:5000"; // ⚠️ Mets le bon port de ton backend

export const submitUserData = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la requête :", error);
    throw error;
  }
};
