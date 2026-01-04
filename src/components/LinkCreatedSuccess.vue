<template>
    <div class="p-6">
        <div class="bg-yellow-100 rounded-xl py-4 px-4 text-yellow-900 text-center text-xs">
            <span>Remember to save your key – it's essential for managing player sign-ups later! Keep this key
                safe.</span>
        </div>

        <div class="grid grid-cols-6 gap-3 py-4 items-center">
            <div class="col-span-6 flex flex-col gap-1">
                <span class="text-white text-sm ml-1">Admin Access Key</span>
                <div class="flex gap-2">
                    <div
                        class="bg-wostools-800 px-4 py-3 rounded-xl w-full text-center truncate text-white border border-white/10">
                        {{ accessKey }}
                    </div>
                    <BaseButton variant="blue" @click="copyToClipboard(accessKey)">
                        Copy
                    </BaseButton>
                </div>
            </div>
            <div class="col-span-6 flex flex-col gap-1">
                <span class="text-white text-sm ml-1">Share Link</span>
                <div class="flex gap-2">
                    <div
                        class="bg-wostools-800 px-4 py-3 rounded-xl w-full text-center truncate text-white border border-white/10">
                        {{ generatedLink }}
                    </div>
                    <BaseButton variant="blue" @click="copyToClipboard(generatedLink)">
                        Copy
                    </BaseButton>
                </div>
            </div>

            <div class="col-span-6 pt-2">
                <a :href="generatedLink" class="w-full block">
                    <BaseButton variant="blue" class="w-full">
                        Access link
                    </BaseButton>
                </a>
            </div>

            <div v-if="alliancePassword" class="col-span-6 flex flex-col gap-1 mt-2 border-t border-white/10 pt-4">
                <span class="text-white text-sm ml-1 font-bold">Alliance Access Key (Shared)</span>
                <p class="text-xs text-wostools-text-secondary mb-1">Use this key to let alliance leaders add players.
                </p>
                <div class="flex gap-2">
                    <div
                        class="bg-wostools-800 px-4 py-3 rounded-xl w-full text-center truncate text-white border border-white/10">
                        {{ alliancePassword }}
                    </div>
                    <BaseButton variant="secondary" @click="copyToClipboard(alliancePassword)">
                        Copy
                    </BaseButton>
                </div>
            </div>

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
    },
    alliancePassword: {
        type: String,
        default: ''
    }
});
</script>
