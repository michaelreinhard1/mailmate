<script>
import {
  IconInbox,
  IconTrash,
  IconUserCircle,
  IconMenu2,
  IconLayoutSidebarRightCollapse,
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
    IconUserCircle,
    IconMenu2,
    IconLayoutSidebarRightCollapse,
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
      isComposeMinimized: storeToRefs(this.componentUtilsStore)
        .isComposeMinimized,
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
        },
        {
          name: this.$t("nav.starred"),
          icon: IconStar,
          to: { name: "Starred" },
        },
        {
          name: this.$t("nav.sent"),
          icon: IconSend,
          to: { name: "Sent" },
        },
        {
          name: this.$t("nav.drafts"),
          icon: IconFile,
          to: { name: "Drafts" },
        },
        {
          name: this.$t("nav.trash"),
          icon: IconTrash,
          to: { name: "Trash" },
        },
        // spam
        {
          name: this.$t("nav.spam"),
          icon: IconAlertOctagon,
          to: { name: "Spam" },
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
      <BaseButton
        class="my-4 flex relative rounded-md px-3 py-2 w-full max-h-10"
        @click="compose"
      >
        <div class="flex items-center font-bold gap-3 min-w-max">
          <IconPlus stroke-width="2.0" />
          <Transition key="compose" name="fade">
            <span v-if="!collapsed">
              {{ $t("nav.compose") }}
            </span>
          </Transition>
        </div>
      </BaseButton>
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
            @click="item.onClick"
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
      <SettingsPage :collapsed="collapsed">
        <template #icon>
          <IconSettings stroke-width="2.0" class="outline-0 menu-icon" />
        </template>
        <template #title>
          <Transition name="fade">
            <span class="font-bold min-w-max ml-3" v-if="!collapsed">
              {{ $t("nav.settings") }}
            </span>
          </Transition>
        </template>
      </SettingsPage>
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
.menu-item:hover {
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
  @apply text-primary-900 rounded-lg ml-auto text-sm font-bold p-3 py-1;
}

.unread-emails.collapsed {
  @apply absolute right-2 top-2 transform translate-x-1/2 -translate-y-1/2  bg-accent-900 dark:text-primary-900 overflow-hidden px-2  flex items-center justify-center;
}

.active-link .unread-emails {
  @apply text-accent-900 bg-primary-700 dark:bg-accent-900 dark:text-primary-900;
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
