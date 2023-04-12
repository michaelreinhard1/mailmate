<script>
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import UploadFile from "@/components/UploadFile.vue";
import ToolButton from "@/components/ToolButton.vue";
import { useEmailStore } from "@/stores/EmailStore";
import { useToolStore } from "@/stores/ToolStore";
import { useComponentUtilsStore } from "@/stores/ComponentUtilsStore";
import { storeToRefs } from "pinia";
import cheerio from "cheerio";
import fileSVG from "../assets/drop-files.svg?url";

import {
  useElementSize,
  useDropZone,
  useThrottledRefHistory,
} from "@vueuse/core";
import { toBase64 } from "b64-lite";
import { ref } from "vue";
import {
  IconWindowMinimize,
  IconPaperclip,
  IconX,
  IconSend,
  IconBulb,
  IconAlertTriangle,
  IconSquareRoundedChevronRight,
  IconTextSpellcheck,
  IconSparkles,
  IconPencil,
  IconBold,
} from "@tabler/icons-vue";
import BaseButton from "@/components/BaseButton.vue";
import Editor from "@/components/Editor.vue";
import { useToast } from "vue-toastification";
import Dialog from "@/components/Dialog.vue";
import SmartWriteModal from "@/components/SmartWriteModal.vue";

export default {
  setup() {
    const emailStore = useEmailStore();
    const toolStore = useToolStore();
    const componentUtilsStore = useComponentUtilsStore();
    const toast = useToast();
    const el = ref(null);
    const { width, height } = useElementSize(el);
    const delay = 5000;

    const { history, undo, redo, canUndo, canRedo } = useThrottledRefHistory(
      storeToRefs(toolStore).body,
      { deep: true, throttle: delay, capacity: 10, trailing: true }
    );

    return {
      emailStore,
      toolStore,
      componentUtilsStore,
      el,
      width,
      height,
      history,
      undo,
      redo,
      canUndo,
      canRedo,
      fileSVG,
      toast,
    };
  },
  components: {
    LoadingIndicator,
    ToolButton,
    IconWindowMinimize,
    IconX,
    BaseButton,
    IconSend,
    IconBulb,
    UploadFile,
    IconPaperclip,
    IconAlertTriangle,
    IconSquareRoundedChevronRight,
    IconPencil,
    IconTextSpellcheck,
    IconSparkles,
    IconBold,
    Editor,
    Dialog,
    SmartWriteModal,
  },
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
    key: {
      type: String,
      default: "",
    },
  },
  emits: ["close"],
  data() {
    return {
      to: [],
      emailRules: (value) => {
        if (!value || value.length === 0) {
          return "Email is required";
        } else if (!this.isValidEmail(value)) {
          return "Please enter a valid email address";
        } else {
          return true;
        }
      },
      subject: storeToRefs(this.toolStore).subject,
      body: storeToRefs(this.toolStore).body,
      AIgenerated: storeToRefs(this.toolStore).AIgenerated,
      minimized: storeToRefs(this.componentUtilsStore).isComposeMinimized,
      attachments: [],
      dropZoneRef: null,
      isOverDropZone: false,
      loading: false,
      showForgotAttachmentDialog: false,
      userHasBeenWarned: false,
      tools: storeToRefs(this.toolStore).AItools,
      showSmartWriteModal: false,
    };
  },
  mounted() {
    this.dropZoneRef = this.$refs.dropZoneRef;
    const { isOverDropZone } = useDropZone(this.dropZoneRef, this.onDrop);
    this.isOverDropZone = isOverDropZone;
  },
  computed: {
    plainBody() {
      const $ = cheerio.load(this.body);
      return $.text();
    },
    AItools() {
      const enabledAndVisibleTools = this.tools.filter(
        (tool) => tool.enabled && tool.visible
      );
      const tools = enabledAndVisibleTools.map((tool) => {
        return {
          name: this.$t(`tool.${tool.name}.title`),
          type: tool.name,
          input: this.plainBody,
          minimumInputLength: 30,
        };
      });
      return tools;
    },
    smartWriteEnabled() {
      const smartWritePreference = this.tools.find(
        (tool) => tool.name === "smartWrite"
      );
      return smartWritePreference.enabled;
    },
  },
  methods: {
    async sendAndClear() {
      if (this.type == "new") {
        if (this.to.length === 0) return;
      } else {
        this.to = this.emailStore.email.from.text;
      }
      const attachmentDetectionPreference = this.tools.find(
        (tool) => tool.name === "attachmentDetection"
      );

      if (attachmentDetectionPreference.enabled) {
        if (this.attachments.length === 0) {
          if (!this.showForgotAttachmentDialog && !this.userHasBeenWarned) {
            const attachmentNeeded = await this.checkAttachment();
            if (attachmentNeeded) {
              this.showForgotAttachmentDialog = true;
              return;
            }
          }
        }
      }

      await this.emailStore.sendEmail({
        to: this.to,
        subject: this.subject,
        body: this.body,
        attachments: this.attachments,
        inReplyTo: this.emailStore.email.uid,
      });
      this.to = "";
      this.subject = "";
      this.body = "";
      this.attachments = [];
      this.userHasBeenWarned = false;
      this.$emit("close");
    },
    async checkAttachment() {
      console.log("Checking if attachment is needed...");
      const response = await this.toolStore.generate({
        content: this.body,
        type: "attachmentDetection",
      });
      if (response.toUpperCase().includes("YES")) {
        console.log("Showing dialog", this.showForgotAttachmentDialog);
        console.log("User has been warned", this.userHasBeenWarned);
        console.log("Attachment needed");
        return true;
      }
    },
    minimize() {
      this.minimized = !this.minimized;
    },
    newFiles(file) {
      // if multiple files then push all files to attachments
      if (Array.isArray(file)) {
        file.forEach((f) => this.attachments.push({ ...f }));
        return;
      }
      console.log(file);
      this.attachments.push({ ...file });
    },
    onDrop(files) {
      if (files) {
        files.forEach((file) => {
          const reader = new FileReader();
          reader.onload = () => {
            const fileBuffer = reader.result;
            this.attachments.push({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              content: toBase64(fileBuffer),
            });
            console.log(this.attachments);
          };
          reader.readAsArrayBuffer(file);
        });
      }
    },
    removeAttachment(index) {
      this.attachments.splice(index, 1);
    },
    async onTab() {
      try {
        this.loading = true;
        await this.toolStore
          .generate({
            type: "autocomplete",
            content: this.body,
          })
          .then(() => {
            this.loading = false;
          });
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log(error);
      }
    },
    openSmartWriteModal() {
      this.showSmartWriteModal = true;
    },
    isValidEmail(email) {
      // Use a regular expression to validate the email address.
      const emailRegex = /\S+@\S+\.\S+/;
      return emailRegex.test(email);
    },
  },
};
</script>

<template>
  <div
    id="compose"
    class="flex flex-col justify-between"
    :class="
      minimized ? 'shadow-2xl border-gray-200 rounded-xl' : 'rounded-none'
    "
    :style="
      minimized && type === 'new'
        ? 'min-width: 600px; min-height: 850px; width:40%; height: 70%;  transform: translate(-100%, -100%); top: calc(100% - 2rem); left: calc(100% - 2rem);'
        : type === 'new'
        ? 'width: 100%; height: 100vh; top: 0; left: 0;'
        : ''
    "
  >
    <Dialog
      :isOpen="showForgotAttachmentDialog"
      @close="(userHasBeenWarned = true), (showForgotAttachmentDialog = false)"
      @sendAnyway="
        (userHasBeenWarned = true),
          (showForgotAttachmentDialog = false),
          sendAndClear()
      "
    />
    <SmartWriteModal
      :isOpen="showSmartWriteModal"
      @close="showSmartWriteModal = false"
    />
    <div
      class="divide-y divide-gray-200 dark:divide-dark-400 h-full flex flex-col overflow-hidden"
    >
      <div class="flex justify-between p-4" v-if="type === 'new'">
        <button
          @click="minimize"
          class="text-dark-800 hover:text-dark-700 dark:text-primary-600 dark:hover:text-primary-500 transition-colors"
        >
          <IconWindowMinimize class="w-5 h-5" />
        </button>
        <button
          @click="$emit('close')"
          class="dark:text-primary-600 dark:hover:text-primary-500 transition-colors"
        >
          <IconX class="w-4 h-5" />
        </button>
      </div>
      <template v-if="type === 'new'">
        <div>
          <input
            type="text"
            v-model="to"
            :placeholder="$t('email.to')"
            class="p-4 sm:text-sm block w-full placeholder-dark-100 dark:placeholder-primary-500 outline-none"
          />
          <!-- <v-combobox
            v-model="to"
            chips
            clearable
            closable-chips
            label="Aan"
            multiple
            variant="solo"
            bg-color="white"
            theme="dark"
            update:modelValue="updateTo"
            :rules="[emailRules]"
          >
            <template v-slot:selection="{ attrs, item, select, selected }">
              <v-chip
                v-bind="attrs"
                :model-value="selected"
                closable
                @click="select"
                @click:close="remove(item)"
              >
                <strong>{{ item }}</strong>
              </v-chip>
            </template>
          </v-combobox> -->
        </div>
        <div>
          <input
            type="text"
            v-model="subject"
            maxlength="997"
            :placeholder="$t('email.subject')"
            class="p-4 sm:text-sm block w-full placeholder-dark-100 dark:placeholder-primary-500 outline-none"
          />
        </div>
      </template>
      <div id="ai-toolbar" v-if="AItools.length > 0 || smartWriteEnabled">
        <div class="flex gap-2 pt-4 px-4 text-sm font-bold text-[#a782c3]">
          <IconSparkles class="w-5 h-5" /> AI tools
        </div>
        <div class="flex flex-col text-sm p-4 gap-2">
          <div class="flex items-center gap-2 flex-wrap w-full">
            <ToolButton
              v-for="tool in AItools"
              :type="tool.type"
              :input="plainBody"
              :minimumInputLength="tool.minimumInputLength"
            >
              <template #icon>
                <component :is="tool.icon" class="w-4 h-4" />
              </template>
              <template #text> {{ tool.name }} </template>
            </ToolButton>
          </div>
          <BaseButton
            class="w-fit flex items-center gap-2 py-2 px-4"
            @click="openSmartWriteModal"
            v-if="smartWriteEnabled"
          >
            <IconPencil class="w-4 h-4" />
            {{ $t("tool.smartWrite.title") }}
          </BaseButton>
          <!-- <BaseButton
            class="w-fit flex items-center gap-2 py-2 px-4"
            @click="chat"
          >
            CONTACTS
          </BaseButton> -->
        </div>
        <!-- <div class="text-sm dark:text-primary-400 px-6 pb-4">
          {{ $t("tool.CharMinReqForAI", { number: 30 }) }}
        </div> -->
      </div>
      <div
        class="bg-primary-800 dark:bg-dark-900 dark:text-primary-500 font-bold py-2 px-4 flex items-center text-sm w-full outline-none"
        v-if="AIgenerated"
      >
        <IconAlertTriangle class="w-4 h-4 mr-2" />
        {{ $t("tool.AIresponseAlert") }}
      </div>
      <div
        class="dropzone flex flex-col grow overflow-hidden relative"
        ref="dropZoneRef"
      >
        <Transition name="fade">
          <div
            v-if="isOverDropZone"
            class="absolute w-full z-10 inset-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center border-dashed border-2 border-[#66bb6a] rounded-md bg-[#e8f5e9] dark:bg-[#2b2b2b] dark:border-[#66bb6a] flex-col overflow-hidden h-full"
          >
            <img :src="fileSVG" class="w-32 h-32" />
            {{ $t("email.dropFilesHere") }}
          </div>
        </Transition>
        <Editor v-model="body" @onTab="onTab" />
      </div>
    </div>

    <div ref="el" class="w-full dark:bg-dark-800">
      <div
        class="dark:bg-dark-800 border-t p-5 overflow-hidden dark:border-dark-500 bg-primary-800"
        v-if="attachments?.length > 0"
      >
        <div class="flex justify-between">
          <div class="flex items-center gap-2">
            <IconPaperclip class="w-5 h-5" />
            <span class="text-sm">{{ $t("email.attachments") }}</span>
            <span class="text-sm">({{ attachments.length }})</span>
          </div>
        </div>
        <div
          class="mt-5 grid gap-3 overflow-y-scroll max-h-12"
          ref="el"
          :class="{
            'grid-cols-3': width > 900,
            'grid-cols-2': width < 900 && width > 600,
            'grid-cols-1': width < 600,
            'max-h-32': minimized,
          }"
        >
          <div v-for="attachment in attachments" :key="attachment.id">
            <div>
              <div
                class="flex items-center gap-3 bg-gray-200 dark:bg-dark-500 p-3 rounded-md min-w-max transition-colors"
              >
                <img
                  :src="$fileIcon(attachment.type)"
                  alt="file-icon"
                  v-if="!minimized"
                  class="w-5 h-5"
                />
                <div class="text-sm">
                  {{ attachment.name.substring(0, 15) }}
                  {{ attachment.name.length > 15 ? "..." : "" }}
                  {{
                    attachment.name.length > 15
                      ? attachment.name.substring(
                          attachment.name.lastIndexOf(".") + 1,
                          attachment.name.length
                        )
                      : ""
                  }}
                </div>
                <button
                  class="ml-auto"
                  @click="removeAttachment(attachment.id)"
                >
                  <IconX class="w-4 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        class="flex justify-between items-center gap-4 p-4 bg-primary-900 dark:bg-dark-800 border-t dark:border-dark-500"
      >
        <div class="attachments">
          <div class="flex items-center gap-2">
            <UploadFile @file="newFiles"></UploadFile>
          </div>
        </div>
        <BaseButton @click="sendAndClear()" class="flex items-center gap-3">
          {{ $t("email.send") }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
#compose {
  transition-property: width, height, top, left, transform;
  transition-duration: 0.3s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
.dropzone {
  border-radius: 5px;
  transition: border 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.alpha {
  @apply bg-indigo-200 text-indigo-700 font-bold text-xs leading-4 py-1 px-2 rounded-md whitespace-nowrap inline-block align-middle disabled:opacity-50;
}
.dropzone.active {
  border: 2px dashed #66bb6a;
}

.highlight {
  @apply text-primary-900 bg-accent-900 dark:text-primary-900 dark:bg-accent-900 transition-colors;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave {
  opacity: 1;
}
</style>
