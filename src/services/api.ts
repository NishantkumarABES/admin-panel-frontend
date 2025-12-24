
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.BACKEND_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
