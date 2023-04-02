import { defineStore } from "pinia";

export const useComponentUtilsStore = defineStore({
  id: "ComponentUtilsStore",
  state: () => ({
    clickedSettings: false,
    settingsOpenTab: 0,
  }),
  actions: {
    toggleSettings(tab) {
      this.clickedSettings = !this.clickedSettings;
      this.settingsOpenTab = tab;
    },
  },
});
