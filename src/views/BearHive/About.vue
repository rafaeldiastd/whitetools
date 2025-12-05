<template>
    <div class="flex flex-col items-center p-6 gap-6 mx-auto max-w-2xl pb-26">
        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px]">
        </router-link>

        <div class="bg-wostools-750 p-8 rounded-xl flex flex-col gap-6 items-center text-center">
            <img src="/images/bearspace-ico.png" alt="Bear Hive" class="w-16 h-16">
            <h1 class="text-3xl font-bold text-white">Bear Hive Manager</h1>

            <p class="text-wostools-text-secondary text-lg">
                The <strong>Bear Trap</strong> is a crucial alliance event in Whiteout Survival where coordination is
                key. Our Bear Hive Manager allows alliance leaders to design and share the optimal hive layout. By
                assigning specific spots to members, you ensure maximum participation and damage output.
            </p>

            <div class="text-center flex flex-col gap-4 text-white">
                <p>
                    <strong>Why use this tool?</strong>
                </p>
                <ul class="text-wostools-text-secondary text-lg list-disc list-inside text-left inline-block">
                    <li><strong>Visual Hive Mapping:</strong> Create a clear, visual representation of your hive's
                        layout.</li>
                    <li><strong>Easy Coordination:</strong> Assign slots to members and share the map with a single
                        link.</li>
                    <li><strong>Maximize Rewards:</strong> A well-organized hive leads to better event results and
                        higher rewards for everyone.</li>
                </ul>
            </div>

            <router-link to="/bearhive/create" class="w-full">
                <BaseButton class="w-full text-lg py-4">
                    Create New Hive
                </BaseButton>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue';
</script>
