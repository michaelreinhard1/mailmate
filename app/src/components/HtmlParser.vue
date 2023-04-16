<!-- Html Parser -->
<script>
import cheerio from "cheerio";
export default {
  name: "HtmlParser",
  props: {
    body: {
      type: Object,
    },
    style: {
      type: String,
    },
  },
  computed: {
    html() {
      return this.body.html;
    },
    text() {
      return this.body.text;
    },
    iframe() {
      return this.$refs.iframe;
    },
  },
  mounted() {
    this.setIframe();
  },
  methods: {
    setIframe() {
      console.log("Iframe loaded");
      if (this.html && this.style) {
        if (this.$refs.iframe) {
          this.$refs.iframe.contentDocument.body.innerHTML = this.html;
          this.$refs.iframe.style.width = "100%";
          this.$refs.iframe.style.minHeight = `${
            this.iframe.contentWindow.document.documentElement.scrollHeight + 20
          }px`;
          this.$refs.iframe.style.height = `${
            this.iframe.contentWindow.document.documentElement.scrollHeight + 20
          }px`;
        }
      }
    },
  },
};
</script>

<template>
  <iframe
    ref="iframe"
    v-if="html && style"
    class="my-5 bg-white overflow-hidden border border-gray-200 dark:border-dark-500 rounded-md"
  />

  <div class="html-prose" v-html="html" v-if="!style" />
</template>

<style lang="scss" scoped>
.html-prose {
  @apply prose bg-white whitespace-normal break-words border border-gray-200 dark:border-dark-500 p-5 rounded-md min-h-max min-w-full prose-p:mt-0 prose-a:text-accent-900 dark:prose-a:text-blue-500 prose-code:text-white prose-pre:overflow-auto prose-pre:rounded-md prose-pre:shadow-md;
}
</style>
