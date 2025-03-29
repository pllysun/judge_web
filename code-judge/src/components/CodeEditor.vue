<script setup lang="ts">
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue';
import * as monaco from 'monaco-editor';

const props = defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  theme: {
    type: String,
    default: 'vs'
  },
  readOnly: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:code', 'run', 'submit']);

const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneCodeEditor | null = null;

// 支持的语言映射
const languageMap: Record<string, string> = {
  'c': 'c',
  'cpp': 'cpp',
  'java': 'java',
  'python': 'python',
  'javascript': 'javascript'
};

// 初始化编辑器
onMounted(() => {
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: props.code,
      language: languageMap[props.language] || 'javascript',
      theme: props.theme,
      automaticLayout: true,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      readOnly: props.readOnly,
      fontSize: 14,
      tabSize: 2,
      lineNumbers: 'on',
      wordWrap: 'on',
      renderLineHighlight: 'all',
      backgroundColor: '#ffffff',
      scrollbar: {
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    });

    // 监听编辑器内容变化
    editor.onDidChangeModelContent(() => {
      const value = editor?.getValue() || '';
      emit('update:code', value);
    });

    // 添加快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      emit('submit');
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      emit('run');
    });
  }
});

// 监听代码变化
watch(() => props.code, (newCode) => {
  if (editor && newCode !== editor.getValue()) {
    editor.setValue(newCode);
  }
});

// 监听语言变化
watch(() => props.language, (newLanguage) => {
  if (editor) {
    monaco.editor.setModelLanguage(
      editor.getModel()!,
      languageMap[newLanguage] || 'javascript'
    );
  }
});

// 监听主题变化
watch(() => props.theme, (newTheme) => {
  monaco.editor.setTheme(newTheme);
});

// 监听只读状态变化
watch(() => props.readOnly, (newReadOnly) => {
  if (editor) {
    editor.updateOptions({ readOnly: newReadOnly });
  }
});

// 组件卸载时销毁编辑器
const disposeEditor = () => {
  if (editor) {
    editor.dispose();
    editor = null;
  }
};

// 重置编辑器内容
const resetEditor = () => {
  if (editor) {
    editor.setValue('');
  }
};

// 获取编辑器内容
const getCode = () => {
  return editor?.getValue() || '';
};

// 暴露方法给父组件
defineExpose({
  disposeEditor,
  resetEditor,
  getCode
});
</script>

<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 4px;
  overflow: hidden;
}
</style>