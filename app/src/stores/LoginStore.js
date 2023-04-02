import { defineStore } from "pinia";
import { api } from "./index";
import { useStorage } from "@vueuse/core";
import { useToast } from "vue-toastification";
import i18n from "../i18n";
import { IconCircleCheck } from "@tabler/icons-vue";

const toast = useToast();
const $t = i18n.global.t;

export const useLoginStore = defineStore("LoginStore", {
  state: () => ({
    isLoggedIn: useStorage("isLoggedIn", false),
    profile: useStorage("profile", {}),
    token: useStorage("token", ""),
    setup: useStorage("setup", true),
    loading: false,
  }),
  getters: {
    getProfile() {
      return this.profile;
    },
  },
  actions: {
    async verifyToken() {
      if (!this.isLoggedIn) {
        throw new Error("Not logged in");
      }
      if (!this.token) {
        this.isLoggedIn = false;
        throw new Error("No token");
      }
      try {
        await api.post(`/auth/verify`);
        this.isLoggedIn = true;
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
            if (response.data.profile.appPassword !== "") this.setup = false;
            this.profile = response.data.profile;
            this.token = response.data.token;
            this.isLoggedIn = true;
          });
      } catch (error) {}
    },
    async saveFullName({ fname, lname }) {
      try {
        await api
          .post(`/email/save-full-name`, {
            fname,
            lname,
          })
          .then(() => {
            this.profile.fname = fname;
            this.profile.lname = lname;
          });

        toast.success($t("settings.savedSuccessfully"), {
          icon: IconCircleCheck,
        });
      } catch (error) {}
    },
    async signOut() {
      this.isLoggedIn = false;
      this.profile = {};
      this.token = "";
      this.setup = true;
    },
  },
});
