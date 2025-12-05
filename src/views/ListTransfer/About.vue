<template>
    <div class="flex flex-col items-center p-6 gap-6 max-w-2xl mx-auto pb-26">
        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px]">
        </router-link>

        <div class="bg-wostools-750 p-8 rounded-xl flex flex-col gap-6 items-center text-center">
            <img src="/images/transfer.png" alt="Transfer List" class="w-16 h-16">
            <h1 class="text-3xl font-bold text-white">Transfer Invitations</h1>

            <p class="text-wostools-text-secondary text-lg">
                Managing <strong>State Transfers</strong> can be chaotic with power caps and limited spots. The Transfer
                Invitations tool simplifies this process by creating a centralized hub for player applications.
            </p>

            <div class="text-center flex flex-col gap-4 text-white">
                <p>
                    <strong>Simplify State Transfers:</strong>
                </p>
                <ul class="text-wostools-text-secondary text-lg list-disc list-inside text-left inline-block">
                    <li><strong>Centralized Applications:</strong> Collect all transfer requests in one organized list.
                    </li>
                    <li><strong>Custom Requirements:</strong> Set minimum Power, Furnace, and Labyrinth levels to filter
                        candidates.</li>
                    <li><strong>Alliance Management:</strong> Allocate spots to specific alliances and track fill rates.
                    </li>
                    <li><strong>Secure Admin:</strong> Review applications and manage invites with secure admin access.
                    </li>
                </ul>
            </div>

            <router-link to="/transfer/create" class="w-full">
                <BaseButton class="w-full text-lg py-4">
                    Create Transfer List
                </BaseButton>
            </router-link>
        </div>
    </div>
</template>

<script setup>
import BaseButton from '@/components/ui/BaseButton.vue';
</script>
