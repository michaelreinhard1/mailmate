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
  data() {
    return {
      frameHeight: 0,
    };
  },
  methods: {
    setFrameHeight() {
      const iframe = this.$refs.iframe;
      this.frameHeight =
        iframe.contentWindow.document.documentElement.scrollHeight + 20;
      iframe.style.height = this.frameHeight + "px";
    },
  },
};
</script>

<template>
  <iframe
    ref="iframe"
    v-if="html && style"
    :srcdoc="html"
    @load="setFrameHeight"
    :style="{ minHeight: frameHeight + 'px' }"
    class="my-5 bg-white overflow-hidden border border-gray-200 dark:border-dark-500 rounded-md"
  />

  <div class="html-prose" v-html="html" v-if="!style" />
</template>

<style lang="scss" scoped>
.html-prose {
  @apply prose bg-white whitespace-normal break-words border border-gray-200 dark:border-dark-500 p-5 rounded-md min-h-max min-w-full prose-p:mt-0 prose-a:text-accent-900 dark:prose-a:text-blue-500 prose-code:text-white prose-pre:overflow-auto prose-pre:rounded-md prose-pre:shadow-md;
}
</style>
