<template>
    <div class="flex flex-col items-center p-6">
        <img src="@/assets/images/logotipo.png" alt="Whiteout Survival Tools" class="w-[200px] pb-6">

        <div class="text-center max-w-2xl mb-8 text-wostools-text-secondary">
            <p class="mb-4">
                Welcome to the ultimate utility suite for <strong>Whiteout Survival</strong> players. Our tools are
                designed to streamline alliance management, optimize event participation, and enhance your gaming
                strategy.
            </p>
            <p>
                Whether you are coordinating a Bear Trap event, planning for State vs State (SVS) bonuses, or managing
                player transfers, we have the right tool for you.
            </p>
        </div>

        <div class="grid gap-4 w-full max-w-md">
            <div v-for="tool in tools" :key="tool.path" @click="router.push(tool.path)"
                class="bg-wostools-750 p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-wostools-700 transition-colors">
                <img :src="tool.icon" :alt="tool.title" class="w-12 h-12">
                <div>
                    <h2 class="text-lg font-bold text-white">{{ tool.title }}</h2>
                    <p class="text-sm text-wostools-text-secondary">{{ tool.description }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const tools = [
    {
        title: 'SVS Bonus',
        description: 'Coordinate alliance events and bonuses.',
        path: '/schedule',
        icon: '/images/state-power.png'
    },
    {
        title: 'Bear Hive',
        description: 'Manage hive location and sign-ups.',
        path: '/bearhive',
        icon: '/images/bearspace-ico.png'
    },
    {
        title: 'Transfers',
        description: 'Manage player transfer invitations.',
        path: '/transfer',
        icon: '/images/transfer.png'
    }
];
</script>
