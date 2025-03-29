import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ProblemListView from '../views/ProblemListView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ContestListView from '../views/ContestListView.vue'
import DiscussionListView from '../views/DiscussionListView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import AdminView from '../views/AdminView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'
import CreateProblemView from '../views/CreateProblemView.vue'
import CodeEditorView from '../views/CodeEditorView.vue'
import SubmissionDetailView from '../views/SubmissionDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/submissions/:id',
      name: 'submission-detail',
      component: SubmissionDetailView,
      meta: { requiresAuth: true },
    },
    {
      path: '/problems/:id/solve',
      name: 'code-editor',
      component: CodeEditorView,
    },
    {
      path: '/create-problem',
      name: 'create-problem',
      component: CreateProblemView,
      meta: { requiresAuth: true },
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/problems',
      name: 'problems',
      component: ProblemListView,
    },
    {
      path: '/problems/:id',
      name: 'problem-detail',
      // route level code-splitting
      component: () => import('../views/ProblemDetailView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/contests',
      name: 'contests',
      component: ContestListView,
    },
    {
      path: '/discussions',
      name: 'discussions',
      component: DiscussionListView,
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView,
    },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: ChangePasswordView,
      meta: { requiresAuth: true },
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 全局前置守卫
import { useAuthStore } from '../stores/auth'

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查页面是否需要登录权限
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 如果需要登录权限但用户未登录，则重定向到登录页面
    next({ path: '/login' })
  } else if (to.path === '/admin' && authStore.isLoggedIn) {
    // 检查管理员权限
    const userRoles = authStore.user?.roles || []
    const isAdmin = Array.isArray(userRoles)
      ? userRoles.includes('ROLE_ADMIN') || userRoles.includes('ROLE_SUPER_ADMIN')
      : typeof userRoles === 'string' &&
        (userRoles === 'ROLE_ADMIN' ||
          userRoles === 'ROLE_SUPER_ADMIN' ||
          userRoles.split(',').includes('ROLE_ADMIN') ||
          userRoles.split(',').includes('ROLE_SUPER_ADMIN'))

    if (!isAdmin) {
      // 如果不是管理员，重定向到首页
      next({ path: '/' })
    } else {
      // 是管理员，正常导航
      next()
    }
  } else {
    // 正常导航
    next()
  }
})

export default router
