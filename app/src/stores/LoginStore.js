import { defineStore } from "pinia";
import { api } from "./index";
import { useStorage } from "@vueuse/core";
import { useToast } from "vue-toastification";
import i18n from "../i18n";
import { IconCircleCheck } from "@tabler/icons-vue";
import { DisplayError } from "@/core/DisplayError";
import { useEmailStore } from "@/stores/EmailStore";

const toast = useToast();
const $t = i18n.global.t;

export const useLoginStore = defineStore("LoginStore", {
  state: () => ({
    profile: useStorage("profile", {}),
    token: useStorage("token", ""),
    setup: useStorage("setup", false),
    loading: false,
  }),
  actions: {
    async verifyToken() {
      if (!this.token) {
        throw new Error("No token");
      }
      try {
        await api.post(`/auth/verify`);
        return true;
      } catch (error) {
        this.signOut();
        return false;
      }
    },
    async signIn({ email, password }) {
      try {
        const response = await api.post(`/auth/signin`, {
          email: email,
          password: password,
        });
        this.profile = response.data;
      } catch (error) {
        console.log(error.response.data.message);
      }
    },
    async googleSignIn({ code }) {
      try {
        await api
          .post(`/auth/signin/google`, {
            code,
          })
          .then((response) => {
            this.setup = true;
            if (response.data.profile.setup === false) {
              this.setup = false;
            }
            delete response.data.profile.setup;
            this.profile = response.data.profile;
            this.token = response.data.token;
          });
      } catch (error) {
        DisplayError($t("tool.error"));
        throw error;
      }
    },
    async saveFullName({ name }) {
      try {
        await api
          .post(`/user/save-full-name`, {
            name,
          })
          .then(() => {
            this.profile.name = name;
            toast.success($t("settings.savedSuccessfully"), {
              icon: IconCircleCheck,
            });
          });
      } catch (error) {
        DisplayError($t("tool.error"));
        throw error;
      }
    },
    async saveAppPassword({ password }) {
      this.status = "connecting";
      try {
        await api.post(`/user/save-app-password`, {
          password,
        });
        this.status = "connected";
        const emailStore = useEmailStore();
        await emailStore.getEmails({ page: 1, box: "INBOX" });
        this.setup = false;
      } catch (error) {
        DisplayError($t("settings.profile.couldNotConnect"));
        this.setup = true;
        this.status = "disconnected";
        console.log("error", error);
        this.emails = [];
        this.totalEmails = 0;
        this.unreadEmails = 0;
        throw error;
      }
    },
    async signOut() {
      this.profile = {};
      this.token = "";
      this.setup = true;
    },
  },
});
