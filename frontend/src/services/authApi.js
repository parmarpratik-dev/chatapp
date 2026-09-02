
import axiosInstance from "../config/axiosConfig";


export const registerUser = async (formData) => {
    const response = await axiosInstance.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  
export const loginUser = async (loginData) => {
  try {
      const response = await axiosInstance.post("/auth/login", loginData);
      return response.data;
  } catch (error) {
      throw error;
  }
};

export const loginGuest = async (guestLoginData) => {

  try {
      const response = await axiosInstance.post("/auth/guest", guestLoginData);
      return response.data;
  } catch (error) {
    throw error;
  }
}