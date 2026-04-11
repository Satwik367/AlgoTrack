const BACKEND_URL = process.env.REACT_APP_API_URL?.replace("/api", "") || "http://localhost:5000";

export const pingBackend = () => {
  fetch(`${BACKEND_URL}/`)
    .catch(() => {});
};