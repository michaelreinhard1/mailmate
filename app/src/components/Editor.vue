<template>
  <div
    v-if="editor"
    id="editor-toolbar"
    class="bg-primary-900 dark:bg-dark-800 dark:text-primary-500 font-bold py-2 px-4 flex items-center text-sm w-full outline-0 border-b dark:border-dark-500 gap-2 border-gray-200 justify-between"
  >
    <div class="flex items-center">
      <button
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
      >
        <IconArrowBackUp class="w-5 h-5" stroke-width="2.5" />
      </button>
      <button
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
      >
        <IconArrowForwardUp class="w-5 h-5" stroke-width="2.5" />
      </button>
      <!-- <input
        type="color"
        @input="
          editor
            .chain()
            .focus()
            .setColor($event.target.value ?? '')
            .run()
        "
        :value="editor.getAttributes('textStyle').color"
      /> -->
      <!-- <button @click="editor.chain().focus().unsetColor().run()">
        unsetColor
      </button> -->
      <button
        @click="editor.chain().focus().toggleBold().run()"
        class=""
        :class="{ 'dark:bg-dark-500 bg-primary-800 ': editor.isActive('bold') }"
      >
        <b>B</b>
      </button>
      <button
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{
          'dark:bg-dark-500 bg-primary-800 ': editor.isActive('underline'),
        }"
      >
        <u>U</u>
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        class=""
        :class="{
          'dark:bg-dark-500 bg-primary-800 ': editor.isActive('italic'),
        }"
      >
        <i>I</i>
      </button>
      <button
        @click="editor.chain().focus().toggleStrike().run()"
        class=""
        :class="{
          'dark:bg-dark-500 bg-primary-800 ': editor.isActive('strike'),
        }"
      >
        <s>S</s>
      </button>
      <!-- <button
        @click="editor.chain().focus().toggleCode().run()"
        class=""
        :class="{ 'dark:bg-dark-500 bg-primary-800 ': editor.isActive('code') }"
      >
        <code>Code</code>
      </button> -->
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        class=""
        :class="{
          'dark:bg-dark-500 bg-primary-800': editor.isActive('bulletList'),
        }"
      >
        <ul>
          <li>UL</li>
        </ul>
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{
          'dark:bg-dark-500 bg-primary-800 ': editor.isActive('orderedList'),
        }"
      >
        <ol>
          <li>OL</li>
        </ol>
      </button>
      <button
        @click="setLink"
        :class="{ 'is-active': editor.isActive('link') }"
      >
        create link
      </button>
      <button
        @click="editor.chain().focus().unsetLink().run()"
        :disabled="!editor.isActive('link')"
      >
        remove link
      </button>
    </div>
    <div class="flex items-center gap-2 min-w-max">
      <!-- <button
        @click="editor.chain().focus().unsetHighlight().run()"
        class="is-active"
      >
        <span> Remove Highlights </span>
      </button> -->

      <button
        @click="showCounters = !showCounters"
        class="is-active min-w-max flex items-center gap-2"
      >
        <div v-if="editor && showCounters" class="lowercase">
          {{ editor.storage.characterCount.characters() }}
          {{
            $t("editor.characters", editor.storage.characterCount.characters())
          }}
        </div>
        <div v-if="editor && showCounters" class="lowercase">
          {{ editor.storage.characterCount.words() }}
          {{ $t("editor.words", editor.storage.characterCount.words()) }}
        </div>
        <IconAlphabetLatin class="w-5 h-5" stroke-width="2.5" v-else />
      </button>
    </div>
  </div>

  <editor-content
    spellcheck="false"
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    :editable="true"
    ref="editor"
    :editor="editor"
    class="w-full grow overflow-hidden flex flex-col custom-scrollbar"
    @keydown.tab.prevent="onTab"
  />
</template>

<script>
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import {
  IconArrowForwardUp,
  IconArrowBackUp,
  IconAlphabetLatin,
} from "@tabler/icons-vue";
import TextStyle from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { storeToRefs } from "pinia";
import { useToolStore } from "@/stores/ToolStore";
import { usePreferencesStore } from "@/stores/PreferencesStore";
import Underline from "@tiptap/extension-underline";
import CharacterCount from "@tiptap/extension-character-count";
import { markPasteRule } from "@tiptap/core";
import Link from "@tiptap/extension-link";

export default {
  props: {
    modelValue: {
      type: String,
      default: "",
    },
  },
  components: {
    EditorContent,
    IconArrowForwardUp,
    IconArrowBackUp,
    IconAlphabetLatin,
  },
  emits: ["update:modelValue", "onTab"],
  setup() {
    const toolStore = useToolStore();
    const preferencesStore = usePreferencesStore();
    return {
      toolStore,
      preferencesStore,
    };
  },
  data() {
    return {
      editor: null,
      autocomplete: storeToRefs(this.toolStore).autocomplete,
      generatedBody: storeToRefs(this.toolStore).generatedBody,
      showCounters: storeToRefs(this.preferencesStore).showCounters,
    };
  },
  watch: {
    modelValue(value) {
      // HTML
      const isSame = this.editor.getHTML() === value;

      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)

      if (isSame) {
        return;
      }

      this.editor.commands.setContent(value, false);
    },
    autocomplete() {
      // use formatText() to format the text
      const formattedAutocomplete = this.formatText(this.autocomplete);

      this.editor.commands.insertContent(formattedAutocomplete);

      setTimeout(() => {
        // Remove all highlights without needing to select the text
        this.editor.chain().focus().unsetHighlight().run();
      }, 2000);
    },
    generatedBody() {
      const paragraphs = this.generatedBody.split(/\n\s*\n/);
      const html = paragraphs.map((p) => `<p>${p.trim()}</p>`).join("");
      this.editor.commands.setContent(html, false);
      this.$emit("update:modelValue", this.editor.getHTML());
    },
  },
  mounted() {
    this.editor = new Editor({
      editorProps: {
        transformPastedText(text) {
          return text.replace(/\xA0/g, " ");
        },
        transformPastedHTML(html) {
          return html.replace(/\xA0/g, " ");
        },
      },
      extensions: [
        TextStyle,
        Highlight.configure({
          types: ["highlight"],
          HTMLAttributes: {
            class: "highlight",
          },
        }),
        Underline.configure({
          HTMLAttributes: {
            class: "underline",
          },
        }).extend(markPasteRule(/(?:__)([^_]+)(?:__)/g, "underline")),
        StarterKit.configure({
          history: true,
          onFocus: ({ editor }) => {
            editor.chain().clearNodes().run();
          },
          onUpdate: ({ editor }) => {
            editor.chain().focus().run();
          },
        }),
        CharacterCount.configure({
          limit: 384000,
        }),
        Link.configure({
          openOnClick: false,
        }),
      ],
      content: this.modelValue,
      onUpdate: () => {
        // HTML
        this.$emit("update:modelValue", this.editor.getHTML());
      },
    });
  },
  methods: {
    formatText(text) {
      const lines = text.split("\n");
      let formattedText = "";
      let isFirstLine = true;

      for (const line of lines) {
        if (line.trim() === "") {
          continue; // skip empty lines
        }

        if (isFirstLine) {
          formattedText += `${line}`;
          isFirstLine = false;
        } else {
          formattedText += `<p>${line.trim()}</p>`;
        }
      }

      return formattedText;
    },
    addHighlightedText() {
      this.editor
        .chain()
        .focus()
        .toggleHighlight({ color: "#ffa8a8" })
        .insertContent(this.autocomplete)
        .run();

      this.autocomplete = "";
      this.$emit("update:modelValue", this.editor.getHTML());
    },
    onTab() {
      this.$emit("onTab");
    },
    setLink() {
      const previousUrl = this.editor.getAttributes("link").href;
      const url = window.prompt("URL", previousUrl);

      // cancelled
      if (url === null) {
        return;
      }

      // empty
      if (url === "") {
        this.editor.chain().focus().extendMarkRange("link").unsetLink().run();

        return;
      }

      // update link
      this.editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    },
  },
  beforeUnmount() {
    this.editor.destroy();
  },
};
</script>

<style lang="scss">
#editor-toolbar {
  button {
    @apply p-2 rounded-md hover:bg-primary-800 dark:hover:bg-dark-700 transition-colors duration-200 ease-in-out;
    &[disabled] {
      @apply opacity-50 cursor-default hover:bg-transparent;
    }
  }
}
.is-active {
  @apply bg-primary-800 dark:bg-dark-500;
}
.ProseMirror {
  @apply text-left outline-none p-4 text-base overflow-y-auto grow;
  p {
    padding: 0.4rem 0.2rem;
    &:first-child {
      @apply mt-0;
    }
    &:last-child {
      @apply mb-0;
    }
  }
  a {
    @apply underline text-blue-500 dark:text-blue-500;
  }
  ul {
    li {
      @apply list-disc pl-2 ml-4;
    }
  }

  ol {
    li {
      @apply list-decimal pl-2 ml-4;
    }
  }
}
</style>
