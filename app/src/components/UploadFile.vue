<script setup lang="ts">
import { useFileSystemAccess } from "@vueuse/core";
import { watch } from "vue";
import type { Ref } from "vue";
import { reactive, ref } from "vue";
import { toBase64 } from "b64-lite";
import { IconPaperclip } from "@tabler/icons-vue";

const dataType = ref("ArrayBuffer") as Ref<"ArrayBuffer">;
const res = useFileSystemAccess({
  multiple: true,
  dataType,
});

const file = reactive({
  content: res.data.value,
  name: res.fileName.value,
  type: res.fileMIME.value,
  size: res.fileSize.value,
});

const emit = defineEmits(["file"]);

// If multiple files are selected, send all of them

watch(
  () => res.data.value,
  (value) => {
    file.content = toBase64(value);
    file.name = res.fileName.value;
    file.type = res.fileMIME.value;
    file.size = res.fileSize.value;
    emit("file", file);
  }
);
</script>

<template>
  <button type="button" @click="res.open()">
    <IconPaperclip class="w-5 h-5" />
  </button>
</template>
