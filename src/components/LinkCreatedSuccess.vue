<template>
    <div class="p-6">
        <div class="bg-yellow-100 rounded-xl py-4 px-4 text-yellow-900 text-center text-xs">
            <span>Remember to save your key – it's essential for managing player sign-ups later! Keep this key
                safe.</span>
        </div>

        <div class="grid grid-cols-6 gap-3 py-4 items-center">
            <div class="bg-wostools-800 px-4 py-3 rounded-xl col-span-6 text-center truncate text-white">
                {{ accessKey }}
            </div>
            <div class="col-span-6">
                <BaseButton variant="blue" @click="copyToClipboard(accessKey)" class="w-full">
                    Copy key
                </BaseButton>
            </div>
            <div class="bg-wostools-800 p-4 rounded-xl col-span-6 text-center truncate text-white">
                {{ generatedLink }}
            </div>
            <div class="col-span-6">
                <BaseButton variant="blue" @click="copyToClipboard(generatedLink)" class="w-full">
                    Copy link
                </BaseButton>
            </div>
            <a :href="generatedLink" class="col-span-6">
                <BaseButton variant="blue" class="w-full">
                    Access link
                </BaseButton>
            </a>
        </div>
    </div>
</template>

<script setup>
import { copyToClipboard } from '@/services/copyClipboard.js';
import BaseButton from '@/components/ui/BaseButton.vue';

defineProps({
    accessKey: {
        type: String,
        required: true
    },
    generatedLink: {
        type: String,
        required: true
    }
});
</script>
