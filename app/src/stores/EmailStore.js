import { defineStore } from "pinia";
import { api } from "./index";
import { useToast } from "vue-toastification";
import i18n from "../i18n";
import { IconAlertTriangle, IconSend } from "@tabler/icons-vue";
import { useLoginStore } from "./LoginStore";
import { useStorage } from "@vueuse/core";

const $t = i18n.global.t;

const toast = useToast();
const loginStore = useLoginStore();

export const useEmailStore = defineStore("EmailStore", {
  state: () => ({
    currentPage: useStorage("currentPage", 1),
    emails: [],
    totalEmails: 0,
    unreadEmails: useStorage("unreadEmails", 0),
    message: "",
    email: {},
    box: "",
    status: "disconnected",
  }),
  actions: {
    async sendEmail({ to, subject, body, attachments, replyTo, inReplyTo }) {
      try {
        await api.post(`/email/send`, {
          to,
          subject,
          body,
          test: true,
          attachments: [
            ...attachments.map((attachment) => ({
              filename: attachment.name,
              content: attachment.content,
              encoding: "base64",
            })),
          ],
          ...(replyTo && { replyTo }),
          ...(inReplyTo && { inReplyTo }),
        });
        toast($t("email.sentSuccesfully"), {
          icon: IconSend,
        });
      } catch (error) {
        toast.error($t("tool.error"), {
          icon: IconAlertTriangle,
        });
        throw error;
      }
    },
    async saveAppPassword({ password }) {
      this.status = "connecting";
      try {
        await api.post(`/email/save-app-password`, {
          password,
        });
        this.status = "connected";
        await this.getEmails({ page: 1, box: "INBOX" });
        loginStore.setup = false;
      } catch (error) {
        toast.error($t("settings.profile.couldNotConnect"), {
          icon: IconAlertTriangle,
        });
        this.status = "disconnected";
        console.log("error", error);
        this.emails = [];
        this.totalEmails = 0;
        this.unreadEmails = 0;
        throw error;
      }
    },
    async getEmails({ page, box }) {
      if (box) this.box = box;
      this.status = "connecting";
      try {
        const response = await api.post(`/email/get`, {
          page,
          box: this.box,
        });
        this.status = "connected";
        this.emails = response.data.emails;
        this.totalEmails = response.data.totalEmails;
        if (box === "INBOX") {
          this.unreadEmails = response.data.unreadEmails;
        }
        this.message = "Emails fetched successfully";
        this.currentPage = page;
      } catch (error) {
        toast.error($t("email.errorFetchingEmails"), {
          icon: IconAlertTriangle,
        });
        this.status = "disconnected";
        console.log(error.message);
      }
    },
    async getOneEmail({ uid }) {
      try {
        const response = await api.post(`/email/get-one`, {
          uid,
        });
        this.email = response.data.message;
      } catch (error) {
        console.log(error);
      }
    },
    async setFlag({ uid, flag, value }) {
      try {
        await api.post(`/email/set-flag`, {
          uid,
          flag,
          value,
        });
      } catch (error) {
        console.log(error);
      }
    },
  },
});
