<script setup lang="ts">
// FIXME: This needs to be corrected
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { onBeforeUnmount, onMounted, ref, computed } from 'vue'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import Underline from '@tiptap/extension-underline'
import type { DropdownMenuItem } from '@nuxt/ui'
import { UTooltip } from '#components'

const props = defineProps({
  modelValue: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
watch(() => props.modelValue, newValue => {
  if (editor.value && editor.value.getHTML() !== newValue) {
    editor.value.commands.setContent(newValue || '')
  }
})

const editor = ref<Editor | null>(null)

const items = computed<DropdownMenuItem[]>(() => [
  {
    value: 'h1',
    label: 'Heading 1',
    // kbds: ['ctrl', 'alt', '1'],
    icon: 'i-lucide-heading-1',
    active: editor.value?.isActive('heading', { level: 1 }),
    onSelect: () => editor.value?.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    value: 'h2',
    label: 'Heading 2',
    // kbds: ['ctrl', 'alt', '2'],
    icon: 'i-lucide-heading-2',
    active: editor.value?.isActive('heading', { level: 2 }),
    onSelect: () => editor.value?.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    value: 'h3',
    label: 'Heading 3',
    icon: 'i-lucide-heading-3',
    // kbds: ['ctrl', 'alt', '3'],
    active: editor.value?.isActive('heading', { level: 3 }),
    onSelect: () => editor.value?.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    value: 'h4',
    label: 'Heading 4',
    icon: 'i-lucide-heading-4',
    // kbds: ['ctrl', 'alt', '4'],
    active: editor.value?.isActive('heading', { level: 4 }),
    onSelect: () => editor.value?.chain().focus().toggleHeading({ level: 4 }).run()
  },
  {
    value: 'h5',
    label: 'Heading 5',
    icon: 'i-lucide-heading-5',
    // kbds: ['ctrl', 'alt', '5'],
    active: editor.value?.isActive('heading', { level: 5 }),
    onSelect: () => editor.value?.chain().focus().toggleHeading({ level: 5 }).run()
  },
  {
    label: 'Paragraph',
    icon: 'i-lucide-pilcrow-right',
    value: 'paragraph',
    // kbds: ['ctrl', 'alt', '2'],
    active: editor.value?.isActive('paragraph'),
    onSelect: () => editor.value?.chain().focus().setParagraph().run()
  },
  {
    label: 'Bullet List',
    icon: 'i-lucide-list',
    value: 'bulletList',
    // kbds: ['ctrl', 'shift', '8'],
    active: editor.value?.isActive('bulletList'),
    onSelect: () => editor.value?.chain().focus().toggleBulletList().run()
  },
  {
    label: 'Ordered List',
    icon: 'i-lucide-list-ordered',
    value: 'orderedList',
    // kbds: ['ctrl', 'shift', '7'],
    active: editor.value?.isActive('orderedList'),
    onSelect: () => editor.value?.chain().focus().toggleOrderedList().run()
  },
  {
    label: 'Code Block',
    icon: 'i-lucide-terminal',
    value: 'codeBlock',
    // kbds: ['ctrl', 'alt', 'c'],
    active: editor.value?.isActive('codeBlock'),
    onSelect: () => editor.value?.chain().focus().toggleCodeBlock().run()
  },
  {
    label: 'Blockquote',
    icon: 'i-lucide-quote',
    value: 'blockquote',
    // kbds: ['ctrl', 'shift', 'b'],
    active: editor.value?.isActive('blockquote'),
    onSelect: () => editor.value?.chain().focus().toggleBlockquote().run()
  },
])

onMounted(() => {
  editor.value = new Editor({
    editorProps: {
      attributes: {
        class: 'tiptap border border-muted focus:outline-none p-4 rounded min-h-[12rem] max-h-[12rem] overflow-auto max-w-none prose',
      },
    },

    content: props.modelValue,
    extensions: [
      StarterKit,
      Underline,
      BulletList,
      Heading.configure({
        levels: [1, 2, 3, 4, 5],
      }),
    ],

    onUpdate: () => {
      emit('update:modelValue', editor.value?.getHTML() || '')
    },
  })
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <UPageCard variant="subtle" :ui="{ container: 'p-3 sm:p-3', body: 'w-full' }">
    <template #body>
      <div v-if="editor" class="space-y-2">
        <div class="flex flex-wrap *:flex *:flex-1 *:justify-center *:cursor-pointer gap-1 border border-muted rounded p-1">
          <UTooltip text="Bold" :kbds="['ctrl', 'b']" :content="{ side: 'top' }">
            <UButton
              :disabled="!editor.can().chain().focus().toggleBold().run()"
              :color="editor.isActive('bold') ? 'primary' : 'neutral'"
              icon="i-lucide-bold"
              variant="subtle"
              size="sm"
              @click="editor.chain().focus().toggleBold().run()" />
          </UTooltip>

          <UTooltip text="Italic" :kbds="['ctrl', 'i']" :content="{ side: 'top' }">
            <UButton
              :disabled="!editor.can().chain().focus().toggleItalic().run()"
              :color="editor.isActive('italic') ? 'primary' : 'neutral'"
              icon="i-lucide-italic"
              variant="subtle"
              size="sm"
              @click="editor.chain().focus().toggleItalic().run()" />
          </UTooltip>

          <UTooltip text="Underline" :kbds="['ctrl', 'u']" :content="{ side: 'top' }">
            <UButton
              :disabled="!editor.can().chain().focus().toggleUnderline().run()"
              :color="editor.isActive('underline') ? 'primary' : 'neutral'"
              icon="i-lucide-underline"
              variant="subtle"
              size="sm"
              @click="editor.chain().focus().toggleUnderline().run()" />
          </UTooltip>

          <UTooltip text="Strikethrough" :kbds="['Alt', 'Shift', '5']" :content="{ side: 'top' }">
            <UButton
              :disabled="!editor.can().chain().focus().toggleStrike().run()"
              :color="editor.isActive('strike') ? 'primary' : 'neutral'"
              icon="i-lucide-strikethrough"
              variant="subtle"
              size="sm"
              @click="editor.chain().focus().toggleStrike().run()" />
          </UTooltip>

          <UTooltip text="Hard Break" :kbds="['ctrl', 'enter']" :content="{ side: 'top' }">
            <UButton
              icon="i-lucide-corner-down-left"
              color="neutral"
              variant="subtle"
              size="sm"
              @click="editor.chain().focus().setHardBreak().run()" />
          </UTooltip>

          <UTooltip text="Clear Formatting" :kbds="['ctrl', 'z']" :content="{ side: 'top' }">
            <UButton
              icon="i-lucide-eraser"
              variant="subtle"
              size="sm"
              color="neutral"
              @click="editor.chain().focus().undo().run()" />
          </UTooltip>

          <UDropdownMenu :items="items" :ui="{ content: 'w-44', item: 'cursor-pointer' }" :content="{ align: 'end' }">
            <UTooltip text="More Options" :content="{ side: 'top' }">
              <UButton
                size="sm"
                color="neutral"
                variant="subtle"
                icon="i-lucide-more-horizontal" />
              <!-- :color="items.some(item => item.active) ? 'primary' : 'neutral'" -->
            </UTooltip>

            <!-- <template #item="{ item }">
              <UTooltip :kbds="item.kbds" :content="{ side: 'left', sideOffset: 14 }">
                <UButton
                  :disabled="item.disabled"
                  :color="item.active ? 'primary' : 'neutral'"
                  variant="link"
                  size="sm"
                  :icon="item.icon"
                  :label="item.label"
                  class="w-full"
                  @click="item.onSelect && item.onSelect($event)" />
              </UTooltip>
            </template> -->
          </UDropdownMenu>
        </div>

        <EditorContent :editor="editor" class="prose" />
      </div>
    </template>
  </UPageCard>
</template>
