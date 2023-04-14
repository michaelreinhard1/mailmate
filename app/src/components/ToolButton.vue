<script>
import BaseButton from "@/components/BaseButton.vue";
import LoadingIndicator from "@/components/LoadingIndicator.vue";
import { useToolStore } from "@/stores/ToolStore";
import { storeToRefs } from "pinia";

export default {
  name: "ToolButton",
  props: {
    type: {
      type: String,
      required: true,
    },
    input: {
      type: String,
      required: true,
    },
    minimumInputLength: {
      type: Number,
      default: 100,
    },
  },
  setup() {
    const toolStore = useToolStore();
    return {
      toolStore,
    };
  },
  data() {
    return {
      output: storeToRefs(this.toolStore).output,
      loading: false,
    };
  },
  methods: {
    async generate() {
      try {
        this.loading = true;
        await this.toolStore
          .generate({
            type: this.type,
            content: this.input,
          })
          .then(() => {
            this.loading = false;
          });
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.log(error);
      }
    },
  },
  components: { BaseButton, LoadingIndicator },
};
</script>

<template>
  <BaseButton
    v-ripple="{ center: true }"
    @click="generate"
    :disabled="loading || input === '' || input.length < minimumInputLength"
    type="primary"
  >
    <slot />
    <slot name="icon"></slot>
    <div
      :class="{
        'text-transparent': loading,
      }"
    >
      <slot name="text"></slot>
    </div>
    <div v-if="loading" class="absolute inset-x-1/2">
      <LoadingIndicator color="light" />
    </div>
  </BaseButton>
</template>
