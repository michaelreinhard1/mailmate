<script>
import { googleAuthCodeLogin } from "vue3-google-login";
import store from "../store";
import LoadingIndicator from "./LoadingIndicator.vue";
export default {
  store,
  data() {
    return {
      loading: false,
    };
  },
  components: {
    LoadingIndicator,
  },
  methods: {
    login() {
      this.loading = true;
      googleAuthCodeLogin().then((response) => {
        try {
          this.$store
            .dispatch("googleSignIn", { code: response.code })
            .then(() => {
              this.loading = false;
              this.$router.push({ name: "Inbox" });
            });
        } catch (error) {
          this.loading = false;
          console.log(error);
        }
      });
    },
  },
};
</script>

<template>
  <button
    @click="login"
    type="button"
    class="text-primary-900 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 inline-flex items-center"
  >
    <LoadingIndicator :loading="loading" />
    Login Using Google
  </button>
</template>
