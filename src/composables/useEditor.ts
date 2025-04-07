import { ref, watch } from 'vue';

/**
 * 编辑器相关逻辑
 */
export function useEditor() {
  // 代码内容
  const code = ref(``);

  // 当前选择的语言
  const selectedLanguage = ref('javascript');
  
  // 存储用户输入的代码，按语言分类
  const userCodeMap = ref({});
  
  // 监听语言变化，切换到对应语言的代码
  watch(selectedLanguage, (newLang, oldLang) => {
    // 保存当前语言的代码
    if (oldLang && code.value) {
      userCodeMap.value[oldLang] = code.value;
    }
    
    // 如果新语言有保存的代码，则使用保存的代码
    if (userCodeMap.value[newLang]) {
      code.value = userCodeMap.value[newLang];
    } else {
      // 否则使用默认代码
      resetCode();
    }
  });
  
  // 初始化时调用一次resetCode，确保有默认代码
  setTimeout(() => {
    if (!code.value) {
      resetCode();
    }
  }, 0);
  
  // 监听代码变化，保存到userCodeMap
  watch(code, (newCode) => {
    if (newCode && selectedLanguage.value) {
      userCodeMap.value[selectedLanguage.value] = newCode;
    }
  });

  // 支持的语言列表
  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'c', label: 'C' }
  ];

  // 重置代码
  const resetCode = () => {
    if (selectedLanguage.value === 'javascript') {
      code.value = `// 请在此处编写JavaScript代码
console.log("Hello World");
`;
    } else if (selectedLanguage.value === 'python') {
      code.value = `# 请在此处编写Python代码
print("Hello World")
`;
    } else if (selectedLanguage.value === 'java') {
      code.value = `// 请在此处编写Java代码
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}
`;
    } else if (selectedLanguage.value === 'cpp') {
      code.value = `// 请在此处编写C++代码
#include <iostream>

int main() {
    std::cout << "Hello World" << std::endl;
    return 0;
}
`;
    } else if (selectedLanguage.value === 'c') {
      code.value = `// 请在此处编写C代码
#include <stdio.h>

int main() {
    printf("Hello World\n");
    return 0;
}
`;
    }
  };

  // 语言变更时的处理
  const handleLanguageChange = (newLanguage) => {
    selectedLanguage.value = newLanguage;
  };

  return {
    code,
    selectedLanguage,
    languages,
    resetCode,
    handleLanguageChange
  };
}