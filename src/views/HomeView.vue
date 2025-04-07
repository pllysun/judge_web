<script setup lang="ts">
import NavBar from '../components/NavBar.vue';
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <NavBar />
    
    <!-- 英雄区域 -->
    <div class="relative overflow-hidden">
      <div class="gradient-bg">
        <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div class="text-center">
            <h1 class="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">CodeJudge 在线编程判题平台</h1>
            <p class="mt-6 max-w-lg mx-auto text-xl text-indigo-100">提升你的编程技能，挑战高质量算法题目，参与编程竞赛</p>
            <div class="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div class="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <router-link to="/problems" class="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-indigo-700 bg-white hover:bg-indigo-50 sm:px-8">
                  开始刷题
                </router-link>
                <a href="#features" class="flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-500 bg-opacity-60 hover:bg-opacity-70 sm:px-8">
                  了解更多
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 平台特色 -->
    <div id="features" class="py-12 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">CodeJudge 平台特色</h2>
          <p class="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            我们提供全面的编程学习和竞赛环境，帮助你成为更优秀的程序员
          </p>
        </div>

        <div class="mt-12">
          <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div class="pt-6">
              <div class="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div>
                    <span class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <i class="fas fa-code text-white text-2xl"></i>
                    </span>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">丰富的题库资源</h3>
                  <p class="mt-5 text-base text-gray-500">
                    超过2000道精选算法题目，覆盖从入门到高级的各种难度，包含详细的题解和多种编程语言支持。
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div>
                    <span class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <i class="fas fa-trophy text-white text-2xl"></i>
                    </span>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">实时竞赛系统</h3>
                  <p class="mt-5 text-base text-gray-500">
                    参与各类编程竞赛，与全球程序员同台竞技，提升解题速度和算法思维，获得成长和荣誉。
                  </p>
                </div>
              </div>
            </div>

            <div class="pt-6">
              <div class="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                <div class="-mt-6">
                  <div>
                    <span class="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-md shadow-lg">
                      <i class="fas fa-users text-white text-2xl"></i>
                    </span>
                  </div>
                  <h3 class="mt-8 text-lg font-medium text-gray-900 tracking-tight">活跃的社区讨论</h3>
                  <p class="mt-5 text-base text-gray-500">
                    与其他程序员交流解题思路，分享编程经验，结交志同道合的朋友，共同进步。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计数据 -->
    <div class="bg-indigo-50 py-16 sm:py-24">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl font-extrabold text-indigo-900 sm:text-4xl">平台数据</h2>
          <p class="mt-3 text-xl text-indigo-600 sm:mt-4">CodeJudge 已经帮助无数程序员提升编程能力</p>
        </div>
        <dl class="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          <div class="flex flex-col">
            <dt class="order-2 mt-2 text-lg leading-6 font-medium text-indigo-600">题目</dt>
            <dd class="order-1 text-5xl font-extrabold text-indigo-900">2,000+</dd>
          </div>
          <div class="flex flex-col mt-10 sm:mt-0">
            <dt class="order-2 mt-2 text-lg leading-6 font-medium text-indigo-600">用户</dt>
            <dd class="order-1 text-5xl font-extrabold text-indigo-900">100,000+</dd>
          </div>
          <div class="flex flex-col mt-10 sm:mt-0">
            <dt class="order-2 mt-2 text-lg leading-6 font-medium text-indigo-600">提交</dt>
            <dd class="order-1 text-5xl font-extrabold text-indigo-900">5,000,000+</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="bg-white">
      <div class="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav class="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          <div class="px-5 py-2">
            <a href="#" class="text-base text-gray-500 hover:text-gray-900 footer-link">关于我们</a>
          </div>
          <div class="px-5 py-2">
            <a href="#" class="text-base text-gray-500 hover:text-gray-900 footer-link">联系我们</a>
          </div>
          <div class="px-5 py-2">
            <a href="#" class="text-base text-gray-500 hover:text-gray-900 footer-link">使用条款</a>
          </div>
          <div class="px-5 py-2">
            <a href="#" class="text-base text-gray-500 hover:text-gray-900 footer-link">隐私政策</a>
          </div>
        </nav>
        <p class="mt-8 text-center text-base text-gray-400">
          &copy; 2025 CodeJudge, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 添加Font Awesome图标支持 */
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css');

.gradient-bg {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
}
</style>
