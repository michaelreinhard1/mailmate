import { defineStore } from "pinia";
import { api } from "./index";
import cheerio from "cheerio";
import { useToast } from "vue-toastification";
import { useStorage } from "@vueuse/core";
import i18n from "../i18n";
import { DisplayError } from "@/core/DisplayError";

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
        enabled: useStorage("attachmentDetection", true),
        visible: false,
      },
      {
        name: "smartWrite",
        enabled: useStorage("smartWrite", true),
        visible: false,
      },
    ],
  }),
  actions: {
    typeWriter(text, type) {
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
          this.autocomplete = "";
          APIurl = "autocomplete";
          break;
        case "generateBody":
          APIurl = "body";
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
          DisplayError($t("tool.error"));
          throw error;
        }
        if (error.response.data.safeContent === false) {
          DisplayError($t("tool.tool.unsafeContentDetected"));
          throw error;
        }
      }
    },
    toggleAItool(id) {
      this.AItools[id].enabled = !this.AItools[id].enabled;
      // if all tools are disabled, this.AIgenerated = false;
      if (this.AItools.filter((tool) => tool.enabled === true).length === 0) {
        this.AIgenerated = false;
      }
    },
  },
});
