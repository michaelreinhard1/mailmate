<script>
import BaseLayout from "@/layouts/BaseLayout.vue";
import HtmlParser from "@/components/HtmlParser.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import {
  IconPaperclip,
  IconDownload,
  IconArrowBackUp,
  IconArrowForwardUp,
} from "@tabler/icons-vue";
import { useEmailStore } from "@/stores/EmailStore";
import { storeToRefs } from "pinia";
import { useElementSize } from "@vueuse/core";
import { ref } from "vue";
import FileViewer from "@/components/FileViewer.vue";
import BaseButton from "@/components/BaseButton.vue";
import Compose from "@/components/Compose.vue";
import cheerio from "cheerio";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default {
  name: "Email",
  setup() {
    const emailStore = useEmailStore();
    const el = ref(null);
    const { width, height } = useElementSize(el);
    return {
      emailStore,
      el,
      width,
      height,
    };
  },
  components: {
    BaseLayout,
    HtmlParser,
    LoadingIndicator,
    IconPaperclip,
    IconDownload,
    FileViewer,
    BaseButton,
    IconArrowBackUp,
    IconArrowForwardUp,
    Compose,
  },
  data() {
    return {
      loading: false,
      email: storeToRefs(this.emailStore).email,
      fromEmail: "",
      toEmail: "",
      fromName: "",
      html: "",
      text: "",
      replyModal: false,
    };
  },
  created() {
    this.getOneEmail();
  },
  watch: {
    $route() {
      this.getOneEmail();
    },
    emailFetched() {
      if (!this.emailFetched) {
        // Get the parent route. This is the route that the user was on before they clicked on an email
        const parentRoute = this.$router.resolve({
          name: "Emails",
          params: { box: this.box },
        }).route;
        // Go back to the parent route
        this.$router.push(parentRoute);
      }
    },
  },
  emits: ["compose"],
  methods: {
    async getOneEmail() {
      if (this.uid === undefined) return;
      try {
        this.loading = true;
        await this.emailStore.getOneEmail({ uid: this.uid, box: this.box });
        this.loading = false;
        this.fromEmail =
          this.email.from.value.length > 0
            ? this.email.from.value[0].address
            : "";
        this.toEmail =
          this.email.to.value > 0 ? this.email.to.value[0].address : "";
        this.fromName = this.email.from.value[0].name;
      } catch (error) {
        this.loading = false;
      }

      // this.email object is empty, fetch the email again
      // if (Object.keys(this.email).length === 0) {
      //   await this.getOneEmail();
      // }
    },
    convertToDownloadableURL({ buffer, type }) {
      const data = Uint8Array.from(buffer);
      const content = new Blob([data.buffer], { type });
      const url = URL.createObjectURL(content);
      return url;
    },
    async sendEmailReply() {
      this.loading = true;
      await this.emailStore
        .sendEmailReply({
          to: this.toEmail,
          from: this.fromEmail,
          subject: this.email.subject,
          text: this.text,
          html: this.html,
        })
        .then(() => {
          this.loading = false;
        });
    },
    openReplyModal() {
      // emit
      this.$emit("compose");
    },
    downloadAll() {
      const zip = new JSZip();
      let filenames = {}; // initialize object to store filenames and their counts
      this.email.attachments.forEach((attachment) => {
        const data = Uint8Array.from(attachment.content.data);
        const type = attachment.contentType;
        const content = new Blob([data.buffer], { type });
        let parts = attachment.filename.split(".");
        let extension = parts.pop();
        let basename = parts.join(".");
        let filename = attachment.filename;
        if (filenames[filename]) {
          // check if filename already exists in object
          filenames[filename]++; // increment count for filename
          filename = `${basename} (${filenames[filename]}).${extension}`; // append count before extension
        } else {
          filenames[filename] = 1; // initialize count for filename
        }
        zip.file(filename, content);
      });
      zip.generateAsync({ type: "blob" }).then((content) => {
        const attachmentsName = this.email.subject + ".zip";
        saveAs(content, attachmentsName);
      });
    },
  },
  computed: {
    box() {
      return this.$route.meta.box;
    },
    uid() {
      return this.$router.currentRoute.value.params.uid;
    },
    attachments() {
      const attachmentsArray = [];
      if (this.email.attachments?.length > 0) {
        this.email.attachments.forEach((attachment) => {
          if (attachment.content.type === "Buffer") {
            attachmentsArray.push({
              name: attachment.filename,
              url: this.convertToDownloadableURL({
                buffer: attachment.content.data,
                type: attachment.contentType,
              }),
              type: attachment.contentType,
              fileIcon: this.$fileIcon(attachment.contentType),
            });
          }
        });
      }
      return attachmentsArray;
    },
    body() {
      let html;
      let text;
      if (this.email.html) {
        const $ = cheerio.load(this.email.html, { sanitize: true });

        // remove any script tags
        $("script").remove();

        const sanitizedHtml = $.html();

        const hasScriptTags = $("script").length > 0;

        const hasFormTags = $("form").length > 0;

        const hasIframeTags = $("iframe").length > 0;

        const hasHtmlTags = $("html").length > 0;

        const hasDoctype = this.email.html.includes("!DOCTYPE");

        if (
          hasDoctype ||
          hasScriptTags ||
          hasFormTags ||
          hasIframeTags ||
          hasHtmlTags
        ) {
          html = this.email.html;
          text = null;
        } else {
          text = this.email.html;
          html = null;
        }
      } else {
        html = null;
        text = this.email.text;
      }
      return { html, text };
    },
    emailFetched() {
      return Object.keys(this.email).length > 0;
    },
  },
};
</script>

<template>
  <div
    class="relative flex flex-col p-10 bg-primary-900 overflow-y-scroll dark:bg-dark-800 dark:text-primary-900 w-full"
  >
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      v-if="loading"
    >
      <LoadingIndicator />
    </div>
    <template v-if="!loading && emailFetched">
      <div class="flex justify-between">
        <div class="flex flex-col mb-5 gap-2">
          <div class="font-bold">
            {{ fromName }}
          </div>
          <div class="flex justify-between gap-2">
            <div class="text-sm">
              {{ fromEmail }}
            </div>
            <div class="text-sm lowercase" v-if="toEmail !== ''">
              {{ $t("email.to") }}
            </div>
            <div class="text-sm" v-if="toEmail !== ''">
              {{ toEmail }}
            </div>
          </div>
        </div>
      </div>
      <h2 class="text font-bold text-2xl pb-5 break-words w-3/4">
        {{ email.subject }}
      </h2>
      <HtmlParser :body="body" />
      <div class="mt-5">
        <Compose v-if="replyModal" @close="replyModal = false" />
      </div>
      <div class="mt-8 flex gap-2">
        <v-tooltip :text="$t('feature.comingSoon')" location="bottom">
          <template v-slot:activator="{ props }">
            <button
              class="w-fit relative flex justify-center gap-2 text-sm rounded-lg px-3 py-2 items-center opacity-50 cursor-default transition-colors text-white hover:bg-accent-900/90 bg-accent-900 hover:bg-accent-900"
              @click="openReplyModal"
              v-bind="props"
            >
              <IconArrowBackUp class="w-5 h-5" />
              {{ $t("email.reply") }}
            </button>
          </template>
        </v-tooltip>
        <v-tooltip :text="$t('feature.comingSoon')" location="bottom">
          <template v-slot:activator="{ props }">
            <button
              class="w-fit relative flex justify-center gap-2 text-sm rounded-lg px-3 py-2 items-center opacity-50 cursor-default transition-colors text-white hover:bg-accent-900/90 bg-accent-900 hover:bg-accent-900"
              v-bind="props"
            >
              <IconArrowForwardUp class="w-5 h-5" />
              {{ $t("email.forward") }}
            </button>
          </template>
        </v-tooltip>
      </div>
      <div id="attachments" v-if="attachments?.length > 0" class="mt-5">
        <div class="flex justify-between">
          <div class="flex items-center gap-2 just">
            <IconPaperclip class="w-5 h-5" />
            <span class="text-sm">{{ $t("email.attachments") }}</span>
            <span class="text-sm">({{ attachments.length }})</span>
          </div>
          <div v-if="attachments.length > 1">
            <!-- Download all in a zip -->
            <button
              class="flex items-center gap-3 text-sm hover:cursor-pointer bg-gray-100 dark:bg-dark-500 p-3 rounded-2xl min-w-max hover:bg-gray-200 transition-colors"
              @click="downloadAll"
              v-ripple="{ center: true }"
            >
              <IconDownload class="w-5 h-5" />
              {{ $t("email.downloadAll") }}
            </button>
          </div>
        </div>
        <div class="mt-5 grid gap-3 grid-cols-1" ref="el">
          <div
            v-for="attachment in attachments"
            :key="attachment.id"
            class="bg-gray-100 dark:bg-dark-500 p-3 rounded-2xl flex justify-between items-center"
          >
            <div class="flex items-center gap-3">
              <img
                :src="attachment.fileIcon"
                alt="file-icon"
                class="w-12 h-12 rounded-xl"
                v-if="
                  !attachment.type.includes('image') &&
                  !attachment.type.includes('video') &&
                  !attachment.type.includes('pdf')
                "
              />
              <!-- Only the first 50 characters of the name, then ... and the extension -->
              <FileViewer :file="attachment" v-else />
              <div
                class="text-sm break-all"
                :class="{ flex: attachment.type.includes('image') }"
              >
                {{
                  attachment.name?.length > 50
                    ? attachment.name?.substring(0, 50) +
                      "..." +
                      attachment.name?.substring(
                        attachment.name?.length - 4,
                        attachment.name?.length
                      )
                    : attachment.name
                }}
              </div>
            </div>
            <a
              class="mr-3"
              :href="attachment.url"
              target="_blank"
              rel="noopener noreferrer"
              :download="attachment.name"
            >
              <IconDownload size="1.5rem" />
            </a>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
