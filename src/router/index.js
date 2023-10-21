import { createRouter, createWebHistory } from 'vue-router'
import MainPage from '../views/MainPage.vue'
import About from '../views/About.vue'

const routes = [
        {
            path: "/",
            name: "home",
            component: MainPage,
        },
        {
            path: "/about",
            name: "about",
            component: About,
        },
        {
            path: '/games/pong',
            name: 'pong',
            component: () => import('../views/GamePong.vue')
        },
        {
            path: '/games/asteroids',
            name: 'asteroids',
            component: () => import('../views/GameAsteroids.vue')
        },
        {
            path: '/games/shooter',
            name: 'shooter',
            component: () => import('../views/GameShooter.vue')
        },
        {
            path: '/games/level-quest',
            name: 'level-quest',
            component: () => import('../views/GameTemplate.vue')
        },
        {
            path: '/games/galaga',
            name: 'galaga',
            component: () => import('../views/GameTemplate.vue')
        },
        {
            path: '/games/hellfire',
            name: 'hellfire',
            component: () => import('../views/GameTemplate.vue')
        },
        {
            path: '/games/gravity',
            name: 'gravity',
            component: () => import('../views/GameTemplate.vue')
        },
        {
            path: '/games/fruitflip',
            name: 'fruitflip',
            component: () => import('../views/GameTemplate.vue')
        },
        {
            path: '/games/sandbox',
            name: 'sandbox',
            component: () => import('../views/GameTemplate.vue')
        },
    ]

const router = createRouter({
    history: createWebHistory(),
    routes
  })

export default router