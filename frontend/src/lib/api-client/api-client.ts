import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});
