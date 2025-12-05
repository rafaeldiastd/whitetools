<template>
    <div class="flex flex-col items-center p-6 gap-6 max-w-2xl mx-auto pb-26">
        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px]">
        </router-link>

        <div class="bg-wostools-750 p-8 rounded-xl flex flex-col gap-6 items-center text-center">
            <img src="/images/state-power.png" alt="Schedule" class="w-16 h-16">
            <h1 class="text-3xl font-bold text-white">SVS Bonus</h1>


            <p class="text-wostools-text-secondary text-lg text-center">
                <strong>State vs State (SVS)</strong> events offer massive bonuses for coordinated actions. The SVS
                Bonus Scheduler helps your alliance maximize these benefits by providing a clear timeline for using
                speedups on Construction, Research, and Training.
            </p>

            <div class="text-center flex flex-col gap-4 text-white">
                <p>
                    <strong>How it works:</strong>
                </p>
                <ul class="text-wostools-text-secondary text-lg list-disc list-inside text-left inline-block">
                    <li><strong>Precise Timing:</strong> Know exactly when to activate your speedups to align with
                        alliance bonuses.</li>
                    <li><strong>Alliance Synchronization:</strong> Ensure all members are on the same page to trigger
                        maximum buffs.</li>
                    <li><strong>Efficiency:</strong> Stop wasting resources and start playing smarter with a shared
                        schedule.</li>
                </ul>
            </div>

            <router-link to="/schedule/create" class="w-full">
                <BaseButton class="w-full text-lg py-4">
                    Create Link
                </BaseButton>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue';
</script>
