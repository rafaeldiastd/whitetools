<template>
    <img src="/images/frametop.png" class="fixed bottom-[70px] left-0 z-92"></img>
    <div
        class="flex items-center justify-center fixed z-90 bottom-0 w-full bg-wostools-menu py-2 divide-x divide-wostools-50/10 inset-shadow-sm inset-shadow-wostools-50/20">
        <div v-for="tab in tabs" :key="tab.label" @click="router.push(tab.link)" class="flex items-center p-2">
            <div class=" hover:cursor-pointer flex flex-col items-center text-xs px-4"
                :class="tab.disabled ? 'opacity-50' : ''">
                <img :src="tab.icon" alt="" class="w-8 h-8">
                {{ tab.label }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const tabs = [
    { label: 'SVS Bonus', link: '/schedule', icon: '/images/state-power.png' },
    { label: 'BearHive', link: '/bearhive', icon: '/images/bearspace-ico.png' },
    { label: 'Transfers', link: '/transfer', icon: '/images/transfer.png' },
];
</script>
