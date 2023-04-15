<script>
import { IconX } from "@tabler/icons-vue";

export default {
  name: "ChipInput",
  components: {
    IconX,
  },
  props: {
    set: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      chips: [],
      currentInput: "",
    };
  },
  methods: {
    saveChip() {
      const { chips, currentInput, set } = this;
      if (currentInput !== "" && set && chips.indexOf(currentInput) === -1) {
        chips.push(currentInput);
        this.$emit("update:chips", chips);
      }
      this.currentInput = "";
    },
    deleteChip(index) {
      this.chips.splice(index, 1);
      this.$emit("update:chips", this.chips);
    },
    backspaceDelete({ which }) {
      which == 8 &&
        this.currentInput === "" &&
        this.chips.splice(this.chips.length - 1);
    },
  },
  emits: ["update:chips"],
};
</script>
<template>
  <div class="chip-container">
    <div class="chip" v-for="(chip, i) of chips" :key="chip.label">
      {{ chip }}
      <IconX
        class="icon w-4 h-4 flex justify-center items-center"
        @click="deleteChip(i)"
      />
    </div>
    <input
      v-model="currentInput"
      @keypress.enter="saveChip"
      @keydown.delete="backspaceDelete"
      :placeholder="chips.length === 0 ? $t('email.to') : ''"
      @blur="saveChip"
    />
  </div>
</template>

<style lang="scss" scoped>
.chip-container {
  @apply w-full flex flex-wrap content-between items-center;
}

.chip {
  @apply bg-primary-700 border border-gray-300 rounded-lg flex items-center whitespace-nowrap text-sm text-dark-700 dark:bg-dark-400 dark:border-dark-200 dark:text-white w-auto h-8 px-2 ml-2;
}

.chip .icon {
  @apply cursor-pointer opacity-50 ml-2;
}

.chip-container input {
  @apply p-4 sm:text-sm placeholder-dark-100 dark:placeholder-primary-500 outline-none grow;
}
</style>
