import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;
console.log(API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Event APIs
export const eventAPI = {
  getAll: (params) => api.get("/events", { params }),
  getOne: (id) => api.get(`/events/${id}`),
  getMyEvents: () => api.get("/events/organizer/my-events"),
  create: (data) => api.post("/events", data),
  update: (id, data) => api.put(`/events/${id}`, data),
  publish: (id) => api.post(`/events/${id}/publish`),
  cancel: (id) => api.post(`/events/${id}/cancel`),
  getAnalytics: (id) => api.get(`/events/${id}/analytics`),
};

// Ticket APIs
export const ticketAPI = {
  purchase: (data) => api.post("/tickets/purchase", data),
  verify: (reference) => api.post("/tickets/verify", { reference }),
  getMyTickets: () => api.get("/tickets/my-tickets"),
  getOne: (id) => api.get(`/tickets/${id}`),
  download: (id, config = {}) =>
    api.get(`/tickets/${id}/download`, { responseType: "blob", ...config }),
};

// Validation APIs
export const validationAPI = {
  scan: (data) => api.post("/validate/scan", data),
  getMyEvents: () => api.get("/validate/my-events"),
  getEventStats: (eventId) => api.get(`/validate/event/${eventId}/stats`),
};

// Admin APIs
export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (params) => api.get("/admin/users", { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  getPendingOrganizers: () => api.get("/admin/organizers/pending"),
  approveOrganizer: (id) => api.post(`/admin/organizers/${id}/approve`),
  rejectOrganizer: (id, reason) =>
    api.post(`/admin/organizers/${id}/reject`, { reason }),
  createSubaccount: (id, data) =>
    api.post(`/admin/organizers/${id}/create-subaccount`, data),
  getBanks: () => api.get("/admin/banks"),
  assignValidator: (userId, eventId) =>
    api.post(`/admin/validators/${userId}/assign`, { eventId }),
};

export const organizerAPI = {
  getBanks: () => api.get("/organizer/banks"),
  setupPayout: (data) => api.post("/organizer/setup-payout", data),
  // Validator management
  getEventValidators: (eventId) =>
    api.get(`/organizer/events/${eventId}/validators`),
  createValidator: (eventId, data) =>
    api.post(`/organizer/events/${eventId}/validators`, data),
  removeValidator: (eventId, validatorId) =>
    api.delete(`/organizer/events/${eventId}/validators/${validatorId}`),
};

// Order APIs (user-facing)
export const orderAPI = {
  getMyOrders: () => api.get("/orders"),
  retryPayment: (orderId) => api.post(`/orders/${orderId}/retry`),
};

export default api;
