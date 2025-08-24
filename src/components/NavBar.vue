<template>
    <RouterLink v-for="tab in tabs" :key="tab.label" :to="tab.link"
        class="rounded-t-xl px-6 py-3 hover:cursor-pointer hover:bg-wostools-50 hover:text-wostools-700 flex gap-2 text-sm"
        :class="$route.path === tab.link
            ? 'bg-wostools-50 text-wostools-700'
            : 'bg-wostools-tab text-wostools-50'">
        <img :src="tab.icon" alt="" class="w-6 h-6">
        {{ tab.label }}
    </RouterLink>
</template>
<script setup>
import { RouterLink } from 'vue-router'

const tabs = [
    { label: 'Schedule', link: '/', icon: '/images/schedule-icon.png' },
    { label: 'BearHive', link: '/bearhive/create', icon: '/images/bearspace-icon.png' },
];
</script>