export const syncTimeApi = {
  getConnectors: async () => {
    return [
      {
        id: "ob",
        displayName: "Open Banking",
        environment: "dev",
        isEditable: true
      }
    ];
  },

  getSchedule: async () => {
    return {
      connector: { id: "ob", displayName: "Open Banking" },
      schedule: {
        Monday: "00:00:01.000",
        Tuesday: "00:00:01.000",
        Wednesday: "00:00:01.000",
        Thursday: "00:00:01.000",
        Friday: "00:00:01.000",
        Saturday: "00:00:01.000",
        Sunday: "00:00:01.000"
      }
    };
  },

  preview: async (data: any) => {
    return {
      changes: Object.keys(data.schedule).map((day) => ({
        day,
        before: "00:00:01.000",
        after: data.schedule[day],
        changed: true
      }))
    };
  },

  update: async (data: any) => {
    console.log("✅ SyncTime Updated:", data);
    return { success: true };
  }
};