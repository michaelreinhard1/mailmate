import { defineStore } from "pinia";
import { api } from "./index";
import cheerio from "cheerio";
import { useToast } from "vue-toastification";
import { useStorage } from "@vueuse/core";
import { IconAlertTriangle } from "@tabler/icons-vue";
import i18n from "../i18n";

const toast = useToast();
const $t = i18n.global.t;

export const useToolStore = defineStore("ToolStore", {
  state: () => ({
    subject: "",
    body: "",
    generatedBody: "",
    AIgenerated: false,
    autocomplete: "",
    AItools: [
      {
        name: "generateSubject",
        minimumInputLength: 100,
        enabled: useStorage("generateSubject", true),
        visible: true,
      },
      {
        name: "autocomplete",
        minimumInputLength: 30,
        enabled: useStorage("autocomplete", true),
        visible: true,
      },
      {
        name: "checkGrammar",
        minimumInputLength: 30,
        enabled: useStorage("checkGrammar", true),
        visible: true,
        alpha: true,
      },
      {
        name: "attachmentDetection",
        minimumInputLength: 30,
        enabled: useStorage("attachmentDetection", true),
        visible: false,
      },
    ],
  }),
  actions: {
    typeWriter(text, type) {
      console.log("typeWriter");
      return new Promise((resolve) => {
        let i = 0;
        const speed = 20;
        this.subject = "";
        const typeWriter = () => {
          if (i < text.length) {
            switch (type) {
              case "generateSubject":
                this.subject += text.charAt(i);
                break;
              default:
                break;
            }
            i++;
            setTimeout(typeWriter, speed);
          } else {
            resolve();
          }
        };
        typeWriter();
      });
    },
    async generate({ content, type, tonality }) {
      const $ = cheerio.load(content);
      const text = $("body").text();
      this.autocomplete = "";
      let APIurl = "";
      switch (type) {
        case "generateSubject":
          APIurl = "subject";
          break;
        case "checkGrammar":
          APIurl = "grammar";
          break;
        case "attachmentDetection":
          APIurl = "attachment-detection";
          break;
        case "autocomplete":
          APIurl = "autocomplete";
          break;
        case "generateBody":
          APIurl = "body";
          break;
        case "chat":
          APIurl = "chat";
          break;
        default:
          break;
      }
      try {
        const response = await api.post(`/ai/email/${APIurl}`, {
          content: text,
          tonality: tonality,
        });

        switch (type) {
          case "checkGrammar":
            this.generatedBody = response.data.output;
            break;
          case "attachmentDetection":
            return response.data.output;
          case "autocomplete":
            this.autocomplete = response.data.output;
            break;
          case "generateBody":
            this.generatedBody = response.data.output;
            break;
          default:
            this.typeWriter(response.data.output, type);
        }
        this.AIgenerated = true;
      } catch (error) {
        if (error.response.data.success === false) {
          toast.error($t("tool.error"), {
            icon: IconAlertTriangle,
          });
          return;
        }
        if (error.response.data.safeContent === false) {
          console.log("unsafe content detected");
          toast.error($t("tool.unsafeContentDetected"), {
            icon: IconAlertTriangle,
          });
          return;
        }
      }
    },
    async getContacts() {
      try {
        const response = await api.get("/contact/get");
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.log(error);
      }
    },
    toggleAItool(id) {
      this.AIgenerated = false;
      this.AItools[id].enabled = !this.AItools[id].enabled;
    },
  },
});
