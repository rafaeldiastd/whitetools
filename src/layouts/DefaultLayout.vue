<template>
    <div class="min-h-screen bg-wostools-900 text-white pb-[100px]">
        <slot />
        <NavBar />
        <BlockModal :visible="scheduleStore.blockModal.visible" :message="scheduleStore.blockModal.message"
            :image="scheduleStore.blockModal.image" @close="scheduleStore.closeBlockModal" />
    </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import BlockModal from '@/components/BlockModal.vue';
import { useScheduleStore } from '@/stores/schedule';

const scheduleStore = useScheduleStore();
</script>
