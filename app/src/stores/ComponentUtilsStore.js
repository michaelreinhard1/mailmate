import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useComponentUtilsStore = defineStore({
  id: "ComponentUtilsStore",
  state: () => ({
    showSettings: false,
    settingsOpenTab: 0,
    isComposeMinimized: useStorage("isComposeMinimized", false),
    showCompose: false,
  }),
  actions: {
    toggleSettings(tab) {
      this.showSettings = !this.showSettings;
      this.settingsOpenTab = tab;
    },
    toggleCompose() {
      this.showCompose = !this.showCompose;
    },
  },
});
