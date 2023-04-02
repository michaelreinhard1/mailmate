<script>
import EmailCard from "./EmailCard.vue";
import { useElementSize } from "@vueuse/core";
import { ref } from "vue";
import NoResult from "./NoResult.vue";
import {
  IconChevronLeft,
  IconChevronRight,
  IconReload,
} from "@tabler/icons-vue";
export default {
  props: {
    currentPage: {
      type: Number,
      default: 1,
    },
    title: {
      type: String,
      required: true,
    },
    emails: {
      type: Array,
      default: () => [],
    },
    unreadEmails: {
      type: Number,
      default: 0,
    },
    totalEmails: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    EmailCard,
    NoResult,
    IconChevronLeft,
    IconChevronRight,
    IconReload,
  },
  setup() {
    const el = ref(null);
    const { width, height } = useElementSize(el);
    return {
      el,
      width,
      height,
    };
  },
  computed: {
    currentDate() {
      return new Date().toLocaleDateString();
    },
    formattedEmails() {
      return this.formatEmails(this.emails);
    },
    latestPageNumber() {
      const emailsPerPage = 50;
      const latestPageNumber = Math.ceil(this.totalEmails / emailsPerPage);

      return this.currentPage <= latestPageNumber ? latestPageNumber : 0;
    },
  },
  emits: ["setCurrentPage"],
  methods: {
    formatEmails(emails) {
      return emails.map((email) => {
        let emailDate = new Date(email.date);
        let currentYear = new Date().getFullYear();
        let emailYear = emailDate.getFullYear();

        return {
          ...email,
          date:
            new Date(email.date).toLocaleDateString() === this.currentDate
              ? new Date(email.date).toLocaleTimeString().slice(0, 5)
              : emailYear < currentYear
              ? emailDate
                  .toLocaleDateString("nl-BE", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })
                  .split("/")
                  .reverse()
                  .join("-")
              : emailDate.toLocaleDateString("nl-BE", {
                  month: "short",
                  day: "numeric",
                }),
          from:
            email.from && email.from.length > 0
              ? this.extractNameFromEmail(email.from[0])
              : "",
          to:
            email.to && email.to.length > 0
              ? this.extractNameFromEmail(email.to[0])
              : "",
          subject:
            // If there is no email.subject, show "No subject"
            email.subject === undefined
              ? this.$t("inbox.noSubject")
              : // Else, show the subject without ""
                email.subject.toString().replace(/"/g, ""),
        };
      });
    },
    extractNameFromEmail(email) {
      const match = email.match(/^"?(.*?)"?\s*(?:<.*>)?$/);
      if (match && match[1]) {
        return match[1];
      } else {
        const emailParts = email.split(/<|>/);
        if (emailParts.length > 1) {
          return emailParts[1];
        } else {
          return emailParts[0];
        }
      }
    },
  },
};
</script>
<template>
  <div class="w-full border-r border-gray-200 dark:border-dark-400">
    <div
      id="inboxHeader"
      class="sticky bg-primary-900 top-0 z-10 border-b border-gray-200 min-h-48 dark:bg-dark-500 dark:text-primary-900 dark:border-dark-400"
      ref="el"
    >
      <div class="justify-between min-h-max py-10 px-5 w-full">
        <h1 class="text font-black text-3xl dark:text-primary-900">
          {{ title }}
        </h1>
        <div
          v-if="totalEmails !== 0"
          class="text-md text-gray-500 gap-2 mt-5 lowercase dark:text-gray-300 flex justify-between w-full"
        >
          <div class="flex gap-2">
            <span> {{ totalEmails }} {{ $t("inbox.emails") }} </span>
            <span v-if="unreadEmails > 0" class="opacity-80">•</span
            ><span v-if="unreadEmails > 0">
              {{ unreadEmails }} {{ $t("inbox.unread") }}
            </span>
          </div>
          <div class="flex items-center gap-2" v-if="totalEmails > 50">
            <div class="mr-5">
              {{ currentPage * 50 - 49 }} - {{ currentPage * 50 }}
            </div>
            <button
              @click="$emit('setCurrentPage', currentPage - 1)"
              :disabled="currentPage === 1"
              class="bg-gray-200 dark:bg-dark-400 rounded-full p-1 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-dark-300 disabled:opacity-50 disabled:dark:hover:bg-dark-400/50 disabled:cursor-default transition-colors"
            >
              <IconChevronLeft />
            </button>
            <button
              @click="$emit('setCurrentPage', currentPage + 1)"
              :disabled="currentPage === latestPageNumber"
              class="bg-gray-200 dark:bg-dark-400 rounded-full p-1 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-dark-300 disabled:opacity-50 disabled:dark:hover:bg-dark-400/50 disabled:cursor-default transition-colors"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      v-if="emails.length === 0"
      class="flex justify-center items-center w-full h-3/4"
    >
      <NoResult />
    </div>
    <div
      v-else
      id="email-list"
      class="flex flex-col scrollbar-thin scrollbar-thumb-gray-500/0 scrollbar-track-transparant overflow-y-scroll scrollbar-thumb-rounded-xl hover:scrollbar-thumb-gray-500/20"
    >
      <EmailCard
        v-for="email in formattedEmails"
        :key="email.uid"
        :email="email"
      />
    </div>
  </div>
</template>

<style scoped>
#email-list {
  height: calc(100vh - 160px);
}
</style>