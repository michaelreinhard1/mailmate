import { defineStore } from "pinia";
import { api } from "./index";
import { useToast } from "vue-toastification";
import i18n from "../i18n";
import { IconAlertTriangle, IconSend } from "@tabler/icons-vue";
import { useStorage } from "@vueuse/core";
import { DisplayError } from "@/core/DisplayError";

const $t = i18n.global.t;

const toast = useToast();

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
    invalidEmails: false,
    loading: false,
  }),
  actions: {
    async sendEmail({ to, subject, body, attachments, replyTo, inReplyTo }) {
      this.invalidEmails = false;
      try {
        await api
          .post(`/email/send`, {
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
          })
          .then((response) => {
            if (response.status === 200) {
              toast($t("email.sentSuccesfully"), {
                icon: IconSend,
              });
            }
          });
      } catch (error) {
        if (error.response.status === 400) {
          DisplayError($t("email.invalidEmailAddresses"));
          this.invalidEmails = true;
        } else {
          DisplayError($t("tool.error"));
        }
        throw error;
      }
    },

    async getEmails({ page, box }) {
      this.box = box;
      this.status = "connecting";
      this.loading = true;
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
        this.loading = false;
      } catch (error) {
        DisplayError($t("email.errorFetchingEmails"));
        this.status = "disconnected";
        this.loading = false;
      }
    },
    async getOneEmail({ uid, box }) {
      this.loading = true;
      try {
        await api
          .post(`/email/get-one`, {
            uid,
            box,
          })
          .then((response) => {
            this.email = response.data.message;
            this.loading = false;
          });
      } catch (error) {
        this.loading = false;
        this.email = {};
        DisplayError($t("email.errorFetchingEmails"));
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
