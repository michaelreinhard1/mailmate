<script>
import {
  IconInbox,
  IconTrash,
  IconMenu2,
  IconSettings,
  IconStar,
  IconSend,
  IconFile,
  IconPlus,
  IconLogout,
  IconAlertOctagon,
} from "@tabler/icons-vue";
import { useLoginStore } from "@/stores/LoginStore";
import { useEmailStore } from "@/stores/EmailStore";
import { storeToRefs } from "pinia";
import { usePreferencesStore } from "@/stores/PreferencesStore";
import { useComponentUtilsStore } from "@/stores/ComponentUtilsStore";
import { mapState, mapActions } from "pinia";
import BaseButton from "./BaseButton.vue";
import LanguageSwitcher from "./LanguageSwitcher.vue";
import SettingsPage from "@/views/SettingsPage.vue";
export default {
  setup() {
    const emailStore = useEmailStore();
    const loginStore = useLoginStore();
    const componentUtilsStore = useComponentUtilsStore();
    return {
      emailStore,
      loginStore,
      componentUtilsStore,
    };
  },
  components: {
    IconInbox,
    IconTrash,
    IconMenu2,
    IconSettings,
    IconStar,
    IconSend,
    IconFile,
    IconPlus,
    IconAlertOctagon,
    BaseButton,
    IconLogout,
    LanguageSwitcher,
    SettingsPage,
  },
  data() {
    return {
      unreadEmails: storeToRefs(this.emailStore).unreadEmails,
      showCompose: storeToRefs(this.componentUtilsStore).showCompose,
      isComposeMinimized: storeToRefs(this.componentUtilsStore)
        .isComposeMinimized,
      showSettings: storeToRefs(this.componentUtilsStore).showSettings,
      loading: storeToRefs(this.emailStore).loading,
    };
  },
  emits: ["compose", "close"],
  computed: {
    nav() {
      return [
        {
          name: this.$t("nav.inbox"),
          icon: IconInbox,
          to: { name: "Inbox" },
          box: "INBOX",
        },
        {
          name: this.$t("nav.starred"),
          icon: IconStar,
          to: { name: "Starred" },
          box: "STARRED",
        },
        {
          name: this.$t("nav.sent"),
          icon: IconSend,
          to: { name: "Sent" },
          box: "SENT",
        },
        {
          name: this.$t("nav.drafts"),
          icon: IconFile,
          to: { name: "Drafts" },
          box: "DRAFTS",
        },
        {
          name: this.$t("nav.trash"),
          icon: IconTrash,
          to: { name: "Trash" },
          box: "TRASH",
        },
        {
          name: this.$t("nav.spam"),
          icon: IconAlertOctagon,
          to: { name: "Spam" },
          box: "SPAM",
        },
      ];
    },

    ...mapState(usePreferencesStore, {
      collapsed: (state) => state.sideBarCollapsed,
    }),
  },
  methods: {
    compose() {
      this.$emit("compose");
    },
    ...mapActions(usePreferencesStore, {
      toggleSideBar: "toggleSideBar",
    }),
    openSettings() {
      this.componentUtilsStore.toggleSettings(0);
    },
    async getEmails(box) {
      if (!this.isComposeMinimized) this.showCompose = false;
      if (this.$route.meta.box !== box) return;
      this.loading = true;
      await this.emailStore.getEmails({ page: 1, box });
      this.loading = false;
    },
  },
};
</script>

<template>
  <div
    id="sidebar"
    tag="div"
    class="bg-primary-900 text-sm flex flex-col h-screen px-4 border-r border-gray-200 dark:bg-dark-800 dark:text-primary-900 dark:border-dark-600"
    :style="
      collapsed
        ? 'min-width: 80px; max-width: 80px;'
        : 'min-width: 220px; max-width: 220px;'
    "
  >
    <div class="top">
      <button
        class="menu-item rounded-md px-3 py-2 max-h-10 bg-accent-900 text-white hover:bg-accent-900/90 disabled:bg-accent-900 disabled:hover:bg-accent-900 my-4"
        :class="collapsed ? '' : 'open'"
        v-ripple="{ center: true }"
        @click="compose"
      >
        <IconPlus stroke-width="2.0" class="outline-none menu-icon" />
        <Transition key="compose" name="fade">
          <span v-if="!collapsed" class="font-bold min-w-max ml-3">
            {{ $t("nav.compose") }}
          </span>
        </Transition>
      </button>
      <v-tooltip
        v-for="item in nav"
        :text="item.name"
        close-delay="50"
        open-delay="700"
        :disabled="!collapsed"
      >
        <template v-slot:activator="{ props }">
          <router-link
            class="menu-item rounded-md px-3 py-2 mt-2 max-h-10"
            :class="collapsed ? '' : 'open'"
            :to="item.to"
            :key="item.name"
            v-bind="props"
            @click="getEmails(item.box)"
          >
            <component
              v-bind="props"
              :is="item.icon"
              stroke-width="2.0"
              class="outline-none menu-icon"
            />
            <Transition :key="item.name" name="fade">
              <span v-if="!collapsed" class="font-bold min-w-max ml-3">
                {{ item.name }}
              </span>
            </Transition>
            <Transition
              key="unreadEmails"
              name="fade"
              v-if="item.to.name === 'Inbox'"
            >
              <span
                v-if="emailStore.unreadEmails > 0 && !collapsed"
                class="unread-emails"
              >
                {{ emailStore.unreadEmails }}
              </span>
              <span
                v-else-if="emailStore.unreadEmails > 0 && collapsed"
                class="unread-emails collapsed"
              >
                {{
                  emailStore.unreadEmails > 99 ? "99+" : emailStore.unreadEmails
                }}
              </span>
            </Transition>
          </router-link>
        </template>
      </v-tooltip>
      <v-tooltip
        :text="$t('nav.expand')"
        close-delay="50"
        open-delay="700"
        :disabled="!collapsed"
      >
        <template v-slot:activator="{ props }">
          <button
            id="collapse-button"
            class="menu-item rounded-md px-3 py-2 mt-2 max-h-10"
            :class="collapsed ? '' : 'open'"
            @click="toggleSideBar"
            v-bind="props"
          >
            <IconMenu2 stroke-width="2.0" class="outline-none menu-icon" />
            <Transition name="fade">
              <span v-if="!collapsed" class="font-bold min-w-max ml-3">
                {{ $t("nav.collapse") }}
              </span>
            </Transition>
          </button>
        </template>
      </v-tooltip>
    </div>
    <div class="bottom mb-5">
      <button
        type="button"
        @click="openSettings"
        id="settings-button"
        class="menu-item px-3 py-2 mt-2 max-h-10 rounded-md"
        :class="collapsed ? '' : 'open'"
      >
        <IconSettings stroke-width="2.0" class="outline-0 menu-icon" />
        <Transition name="fade">
          <span class="font-bold min-w-max ml-3" v-if="!collapsed">
            {{ $t("nav.settings") }}
          </span>
        </Transition>
      </button>
    </div>
  </div>
</template>

<style>
:root {
  --duration: 0.15s;
}
.active-link {
  transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  @apply bg-primary-800 dark:bg-accent-700 dark:text-primary-900;
  color: #6366f1;
  font-weight: bold;
}
#sidebar {
  transition-property: width, min-width, max-width;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
  justify-content: space-between;
}

.menu-item {
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  @apply transition-transform transition-colors;
}
a.menu-item:hover,
button#collapse-button:hover,
button#settings-button:hover {
  @apply bg-primary-800 dark:bg-dark-500 dark:text-primary-900;
}
.active-link.menu-item:hover {
  @apply bg-primary-800 dark:bg-accent-700 dark:text-primary-900;
}

.menu-icon {
  @apply w-5 min-w-max relative;
  left: 50%;
  transform: translateX(-50%);
  transition-delay: var(--duration);
}

.menu-item.open .menu-icon {
  position: relative;
  left: 0;
  transform: translateX(0);
  transition-delay: 0s;
}

.unread-emails {
  @apply rounded-lg ml-auto text-sm font-bold p-3 py-1;
}

.unread-emails.collapsed {
  @apply text-primary-900 absolute right-2 top-2 transform translate-x-1/2 -translate-y-1/2  bg-accent-900 dark:text-primary-900 overflow-hidden px-2  flex items-center justify-center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
