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
  mounted() {
    console.log(this.email.to);
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
      this.emailStore.setFlag({
        uid: this.email.uid,
        flag: flag,
      });
    },
  },
};
</script>
<template>
  <router-link
    :to="{ name: 'Email', params: { uid: email.uid } }"
    @click="markAsRead"
    :key="email.uid"
    class="email-card"
    :class="
      markedAsRead
        ? ' bg-primary-900/50 dark:bg-dark-500 border-b border-primary-800 dark:border-dark-400'
        : ' bg-primary-900 dark:bg-dark-400 font-extrabold border-b border-primary-700 dark:border-dark-300'
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
              loginStore.profile.email === email.from.address &&
              !email.flags.includes('\\Sent')
            "
          >
            {{ $t("email.me") }}</span
          >
          <span v-else-if="email.flags.includes('\\Sent')">
            {{ $t("email.to") }}:
            <span
              class="lowercase"
              v-if="email.to.address === loginStore.profile.email"
              >{{ $t("email.toMe") }}</span
            >
            <!-- if name is not empty -->
            <span v-else>{{
              email.to.name === "" ? email.to.address : email.to.name
            }}</span>
          </span>

          <span class="" v-else> {{ email.from.name }}</span>
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
  @apply p-4 dark:text-primary-900 text-sm dark:hover:bg-dark-400/50 hover:bg-primary-900/75 transition duration-150 ease-in-out;
  &.active-link {
    @apply hover:bg-primary-800 dark:hover:bg-accent-700 dark:text-primary-900 text-dark-900;
  }
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
