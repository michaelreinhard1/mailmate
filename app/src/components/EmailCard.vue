<script>
import { useLoginStore } from "@/stores/LoginStore";
import { IconMailOpened, IconMail, IconTrash } from "@tabler/icons-vue";
import { useEmailStore } from "@/stores/EmailStore";

export default {
  props: {
    email: {
      type: Object,
      required: true,
    },
  },
  components: {
    IconMailOpened,
    IconMail,
    IconTrash,
  },
  setup() {
    const loginStore = useLoginStore();
    const emailStore = useEmailStore();
    return {
      loginStore,
      emailStore,
    };
  },
  data() {
    return {
      localEmail: this.email,
    };
  },
  computed: {
    formattedDate() {
      const date = new Date(this.email.date);
      return date.toLocaleDateString();
    },
    markedAsRead() {
      return this.localEmail.flags.includes("\\Seen");
    },
    flags() {
      return [
        {
          name: "Seen",
          icons: {
            active: IconMail,
            inactive: IconMailOpened,
          },
        },
        {
          name: "Deleted",
          icons: {
            active: IconTrash,
            inactive: IconTrash,
          },
        },
      ];
    },
  },
  methods: {
    markAsRead() {
      this.localEmail.flags.push("\\Seen");
    },
    setFlag(flag) {
      // Remove the flag
      switch (flag) {
        case "Seen":
          flag = "\\Seen";
          break;
        case "Deleted":
          flag = "\\Deleted";
          break;
        default:
          break;
      }
      if (this.localEmail.flags.includes(flag)) {
        this.localEmail.flags = this.localEmail.flags.filter((f) => f !== flag);
      } else {
        this.localEmail.flags.push(flag);
      }
      this.emailStore.setFlag({
        uid: this.email.uid,
        flag: flag,
      });
      console.log(this.localEmail.flags);
    },
  },
};
</script>
<template>
  <router-link
    :to="{ name: 'Email', params: { uid: email.uid } }"
    @click="markAsRead"
    :key="email.uid"
    class="email-card p-4 dark:text-primary-900 text-sm hover:bg-primary-900/50 transition duration-150 ease-in-out"
    :class="
      markedAsRead
        ? ' bg-primary-900 dark:bg-dark-500 border-b border-primary-800 dark:border-dark-400'
        : ' bg-primary-800 dark:bg-dark-400 font-extrabold border-b border-primary-700 dark:border-dark-300'
    "
  >
    <!-- Blue dot indicator -->
    <div class="flex cursor-pointer">
      <div
        class="w-2 h-2 rounded-full bg-accent-900 mt-2 mr-3"
        :class="markedAsRead ? 'opacity-0' : 'opacity-100'"
      ></div>
      <div class="w-full">
        <div class="flex items-center justify-between min-w-[200px]">
          <span
            v-if="
              loginStore.getProfile.email === email.from &&
              !email.flags.includes('\\Sent')
            "
          >
            {{ $t("email.me") }}</span
          >
          <span v-else-if="email.flags.includes('\\Sent')">
            {{ $t("email.to") }}: {{ email.to }}
          </span>
          <span class="" v-else> {{ email.from }}</span>
          <span class="text-gray-500 dark:text-primary-600">
            {{ email.date }}
          </span>
        </div>
        <div class="mt-3 flex justify-between">
          <span class="text-gray-500 dark:text-primary-600">{{
            email.subject
          }}</span>
          <div class="flags flex gap-1">
            <button
              v-for="flag in flags"
              :key="flag.name"
              @click.prevent="setFlag(flag.name)"
              class="flex items-center justify-center"
            >
              <component
                :is="flag.icons.active"
                v-if="localEmail.flags.includes(`\\${flag.name}`)"
                class="w-5 h-5"
              />
              <component :is="flag.icons.inactive" v-else class="w-5 h-5">
              </component>
            </button>
          </div>
        </div>
      </div>
    </div>
  </router-link>
</template>

<style lang="scss" scoped>
.email-card {
  .flags {
    @apply opacity-0 transition-opacity duration-150 ease-in-out;
    button {
      @apply dark:bg-dark-500 p-2 rounded-full flex items-center justify-center dark:hover:bg-dark-400 hover:bg-primary-700;
    }
  }
  &:hover .flags {
    @apply opacity-100;
  }
}
</style>
