<template>
    <div v-if="visible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
        <div class="bg-wostools-800 p-6 rounded-xl w-full max-w-sm flex flex-col gap-4">
            <!-- Image at the top -->
            <div v-if="image"
                class="w-full aspect-square rounded-lg overflow-hidden border border-wostools-600 bg-black/30">
                <img :src="image" alt="Blocked" class="w-full h-full object-cover" />
            </div>

            <h3 class="text-xl text-white font-bold">Access Denied</h3>
            <p class="text-sm text-gray-300">{{ message }}</p>

            <div class="flex gap-2">
                <BaseButton @click="close" class="w-full" variant="primary">Dismiss</BaseButton>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useScheduleStore } from '@/stores/schedule';
import { computed } from 'vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const store = useScheduleStore();

const visible = computed(() => store.blockModal.visible);
const message = computed(() => store.blockModal.message);
const image = computed(() => store.blockModal.image);

const close = () => {
    store.closeBlockModal();
};
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}
</style>
