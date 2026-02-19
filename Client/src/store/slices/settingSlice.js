import apiClient from "@/lib/apiClient";

export const createSettingSlice = (set, get) => ({
  settings: null,
  loadingSettings: false,
  fetchSettings: async () => {
    try {
      set({ loadingSettings: true });
      const res = await apiClient.get("/api/admin/settings");
      set({ settings: res.data.settings });
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      set({ loadingSettings: false });
    }
  },
  updateSettings: async (update) => {
    try {
      const res = await apiClient.put("/api/admin/settings", update);
      set({ settings: res.data.settings });
      return { success: true };
    } catch (err) {
      console.error("Failed to update settings", err);
      return { success: false, error: err };
    }
  },
});