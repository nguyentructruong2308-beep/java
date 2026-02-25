import apiClient from "./api";

export const login = (email, password) => {
  return apiClient.post("/auth/login", { email, password });
};
