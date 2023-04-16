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
    if (this.html && this.style) {
      this.$refs.iframe.contentDocument.body.innerHTML = this.html;
      this.$refs.iframe.style.height =
        this.$refs.iframe.contentWindow.document.documentElement.scrollHeight +
        "px";

      this.$refs.iframe.style.minHeight =
        this.$refs.iframe.contentWindow.document.documentElement.scrollHeight +
        "px";
    }
  },
};
</script>

<template>
  <iframe
    id="iframe"
    ref="iframe"
    v-if="html && this.style"
    scrolling="no"
    class="my-5 bg-white overflow-hidden border border-gray-200 dark:border-dark-500 rounded-md"
  />

  <div class="html-prose" v-html="html" v-if="!style" />
</template>

<style lang="scss" scoped>
.html-prose {
  @apply prose bg-white whitespace-normal break-words border border-gray-200 dark:border-dark-500 p-5 rounded-md min-h-max min-w-full prose-p:mt-0 prose-a:text-accent-900 dark:prose-a:text-blue-500 prose-code:text-white prose-pre:overflow-auto prose-pre:rounded-md prose-pre:shadow-md;
}
</style>
