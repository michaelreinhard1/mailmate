import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export const useComponentUtilsStore = defineStore({
  id: "ComponentUtilsStore",
  state: () => ({
    clickedSettings: false,
    settingsOpenTab: 0,
    isComposeMinimized: useStorage("isComposeMinimized", false),
    showCompose: false,
  }),
  actions: {
    toggleSettings(tab) {
      this.clickedSettings = !this.clickedSettings;
      this.settingsOpenTab = tab;
    },
    toggleCompose() {
      this.showCompose = !this.showCompose;
    },
  },
});
