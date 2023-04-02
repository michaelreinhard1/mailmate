<script>
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import Compose from "@/components/Compose.vue";
import Emails from "@/components/Emails.vue";
import { useEmailStore } from "@/stores/EmailStore";
import { useLoginStore } from "@/stores/LoginStore";
import { storeToRefs } from "pinia";
import BaseLayout from "@/layouts/BaseLayout.vue";
import { useHead } from "@vueuse/head";
import { useDebounceFn } from "@vueuse/core";
import { ref } from "vue";

import {
  IconChevronRight,
  IconChevronLeft,
  IconReload,
} from "@tabler/icons-vue";

export default {
  setup() {
    const emailStore = useEmailStore();
    const loginStore = useLoginStore();
    return {
      emailStore,
      loginStore,
    };
  },
  data() {
    return {
      loading: false,
      compose: false,
      currentPage: storeToRefs(this.emailStore).currentPage,
      emails: storeToRefs(this.emailStore).emails,
      totalEmails: storeToRefs(this.emailStore).totalEmails,
      unreadEmails: storeToRefs(this.emailStore).unreadEmails,
      currentDate: new Date().toLocaleDateString(),
      storedBox: storeToRefs(this.emailStore).box,
      updated: 0,
      clicked: 0,
    };
  },
  components: {
    LoadingIndicator,
    Navigation,
    Compose,
    Emails,
    IconChevronRight,
    IconChevronLeft,
    IconReload,
    BaseLayout,
  },
  created() {
    this.currentPage = 1;
    this.getEmails();
    this.setHeader();
  },
  updated() {
    this.getEmails();
    this.setHeader();
  },
  computed: {
    title() {
      return this.$t(
        "nav." + this.$router.currentRoute.value.name.toLowerCase()
      );
    },
    box() {
      return this.$route.meta.box;
    },
  },
  watch: {
    unreadEmails() {
      this.setHeader();
    },
  },
  methods: {
    debouncedFn: useDebounceFn(
      function () {
        this.updated += 1;
        this.getEmails();
      },
      300,
      { maxWait: 600 }
    ),
    async getEmails() {
      if (this.box !== this.storedBox) {
        this.currentPage = 1;
      }
      this.loading = true;
      await this.emailStore.getEmails({
        page: this.currentPage,
        box: this.box,
      });
      this.loading = false;
    },
    setCurrentPage(amount) {
      this.currentPage = amount;
      this.debouncedFn();
    },
    refresh() {
      this.getEmails();
    },
    setHeader() {
      let headTitle;
      if (this.unreadEmails > 0) {
        headTitle = `${this.title} (${this.unreadEmails}) - ${this.loginStore.getProfile.email}`;
      } else {
        headTitle = `${this.title} - ${this.loginStore.getProfile.email}`;
      }
      useHead({
        title: headTitle,
      });
    },
  },
};
</script>

<template>
  <BaseLayout>
    <div class="emails bg-primary-800 h-screen w-full dark:bg-dark-500">
      <div class="flex overflow-y-hidden h-screen w-full">
        <Emails
          :title="title"
          :currentPage="currentPage"
          :emails="emails"
          :unreadEmails="unreadEmails"
          :totalEmails="totalEmails"
          :loading="loading"
          @setCurrentPage="setCurrentPage"
        />
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0%);
  opacity: 1;
}
</style>
