<template>
    <div class="min-h-screen bg-wostools-900 text-white pb-[100px]">
        <slot />
        <NavBar />
    </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
</script>
