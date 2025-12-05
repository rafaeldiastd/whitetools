<template>
    <div class="p-4 max-w-2xl mx-auto">
        <!-- Navigation Tabs -->
        <div
            class="flex items-center justify-center w-full bg-wostools-menu py-2 divide-x divide-wostools-50/10 inset-shadow-sm inset-shadow-wostools-50/20 mb-4 rounded-xl">
            <div v-for="tab in tabs" :key="tab.label" @click="currentTab = tab.link" class="flex items-center p-2">
                <div :class="currentTab === tab.link ? ' text-wostools-800' : ''"
                    class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    <img :src="tab.icon" alt="" class="w-8 h-8">
                    {{ tab.label }}
                </div>
            </div>
            <div class="flex items-center p-2" @click="showModalAdmin = true">
                <div class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    <img src="/src/assets/images/bearspace-icon.png" alt="" class="w-8 h-8">
                    Settings
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'construction'" class="flex flex-col items-center gap-4 pb-[120px]"
            :class="showSignupModal ? 'overflow-hidden' : ''">
            <div>
                <div class="flex flex-col rounded-t-xl px-4 py-2 bg-wostools-red gap-4 text-xl text-white">
                    Construction
                </div>
                <div
                    class="grid grid-cols-2 grid-rows-5 gap-2 container bg-wostools-papper border-4 rounded-b-xl border-wostools-red p-2">
                    <div
                        class="row-span-5 col-span-1 bg-red-200 rounded-xl bg-no-repeat bg-cover bg-[url(/images/share-link-schedule.png)] p-4 flex flex-col justify-center h-full">
                        <img class="w-8 h-8" src="/images/flag.png" alt="">
                        <p class="text-xl"> {{ scheduleStore.linkData?.title }}</p>
                        <div class="flex flex-col gap-1 leading-none">
                            <p class="text-sm font-light">Share the link with your alliance</p>
                        </div>
                    </div>
                    <div
                        class="row-span-3 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                        <div class="flex justify-between items-center py-1">
                            <p>Day</p>
                            <p>{{ scheduleStore.linkData?.construction_time }}</p>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <p>Construction:</p>
                            <p> +10%</p>
                        </div>
                        <div class="flex justify-between items-center  py-1">
                            <p>Search:</p>
                            <p> +10% </p>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <p>Training:</p>
                            <p> +10%</p>
                        </div>
                    </div>
                    <div
                        class="row-span-2 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                        <p>{{ scheduleStore.linkData?.description }}</p>
                    </div>
                </div>
            </div>

            <div class="w-full">
                <div class="flex flex-col rounded-t-xl p-4 bg-wostools-400 gap-4 text-sm">
                    Slots: {{scheduleStore.slots.construction.filter(slot => slot.is_booked).length}}/{{
                        scheduleStore.slots.construction.length }}
                </div>
                <div class="flex flex-col gap-2 container bg-wostools-750 p-4 rounded-b-xl ">
                    <div v-for="slot in scheduleStore.slots.construction" :key="slot.id" v-if="!scheduleStore.loading"
                        class="relative">
                        <div v-if="scheduleStore.accessGranted && slot.is_booked" @click="removeSlot(slot)"
                            class="rounded-full w-5 h-5 bg-red-700 justify-center flex items-center text-white absolute top-[-5px] right-0  hover:cursor-pointer">
                            <span class="mt-[-5px]">-</span>
                        </div>
                        <div class="rounded-xl py-2 px-4 flex gap-2 min-h-[68px] items-center justify-between"
                            :class="slot.is_booked ? 'bg-wos-50 text-wos-900' : 'bg-wos-600 text-wos-300'"
                            @click="slot.is_booked && scheduleStore.accessGranted ? copyToClipboard(slot.players.player_id) : null">
                            <div class="flex gap-3 items-center justify-between w-full">
                                <div class="flex gap-3 items-center">
                                    <img v-if="slot.is_booked" :src="slot.players.player_avatar"
                                        class="rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400">
                                    </img>
                                    <div v-else @click="openModal(slot)"
                                        class="hover:cursor-pointer rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400 text-lime-400 text-2xl font-black">
                                        +
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p class=" font-wos text-xs">
                                            {{ slot.is_booked ? slot.players.player_name : 'Slot_Empty' }}
                                        </p>
                                        <p class="font-wos text-xs">
                                            {{ slot.start_time }} - {{ slot.end_time }} UTC
                                        </p>
                                    </div>
                                </div>
                                <div class="text-xs">
                                    {{ slot.players?.player_id }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="scheduleStore.loading">Loading...</div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'research'" class="flex flex-col items-center  gap-4 pb-[120px]"
            :class="showSignupModal ? 'overflow-hidden' : ''">
            <div>
                <div class="flex flex-col rounded-t-xl px-4 py-2 bg-wostools-red gap-4 text-xl text-white">
                    Research
                </div>
                <div
                    class="grid grid-cols-2 grid-rows-5 gap-2 container bg-wostools-papper border-4 rounded-b-xl border-wostools-red p-2">
                    <div
                        class="row-span-5 col-span-1 bg-red-200 rounded-xl bg-no-repeat bg-cover bg-[url(/images/share-link-schedule.png)] p-4 flex flex-col justify-center h-full">
                        <img class="w-8 h-8" src="/images/flag.png" alt="">
                        <p class="text-xl"> {{ scheduleStore.linkData?.title }}</p>
                        <div class="flex flex-col gap-1 leading-none">
                            <p class="text-sm font-light">Share the link with your alliance</p>
                        </div>
                    </div>
                    <div
                        class="row-span-3 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                        <div class="flex justify-between items-center py-1">
                            <p>Day:</p>
                            <p>{{ scheduleStore.linkData?.research_time }}</p>
                        </div>
                        <div class="flex justify-between items-center  py-1">
                            <p>Search:</p>
                            <p> +10% </p>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <p>Construction:</p>
                            <p> +10%</p>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <p>Training:</p>
                            <p> +10%</p>
                        </div>
                    </div>
                    <div
                        class="row-span-2 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                        <p>{{ scheduleStore.linkData?.description }}</p>
                    </div>
                </div>
            </div>

            <div class="w-full">
                <div class="flex flex-col rounded-t-xl p-4 bg-wostools-400 gap-4 text-sm">
                    Slots: {{scheduleStore.slots.research.filter(slot => slot.is_booked).length}}/{{
                        scheduleStore.slots.research.length }}
                </div>
                <div class="flex flex-col gap-2 container bg-wostools-750 p-4 rounded-b-xl">
                    <div v-for="slot in scheduleStore.slots.research" :key="slot.id" v-if="!scheduleStore.loading"
                        class="relative">
                        <div v-if="scheduleStore.accessGranted && slot.is_booked" @click="removeSlot(slot)"
                            class="rounded-full w-5 h-5 bg-red-700 justify-center flex items-center text-white absolute top-[-5px] right-0  hover:cursor-pointer">
                            <span class="mt-[-5px]">-</span>
                        </div>
                        <div class="rounded-xl py-2 px-4 flex gap-2 min-h-[68px] items-center justify-between"
                            :class="slot.is_booked ? 'bg-wos-50 text-wos-900' : 'bg-wos-600 text-wos-300'"
                            @click="slot.is_booked && scheduleStore.accessGranted ? copyToClipboard(slot.players.player_id) : null">
                            <div class="flex gap-3 items-center justify-between w-full">
                                <div class="flex gap-3 items-center">
                                    <img v-if="slot.is_booked" :src="slot.players.player_avatar"
                                        class="rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400">
                                    </img>
                                    <div v-else @click="openModal(slot)"
                                        class="hover:cursor-pointer rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400 text-lime-400 text-2xl font-black">
                                        +
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p class=" font-wos text-xs">
                                            {{ slot.is_booked ? slot.players.player_name : 'Slot_Empty' }}
                                        </p>
                                        <p class="font-wos text-xs">
                                            {{ slot.start_time }} - {{ slot.end_time }} UTC
                                        </p>
                                    </div>
                                </div>
                                <div class="text-xs">
                                    {{ slot.players?.player_id }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="scheduleStore.loading">Loading...</div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'training'" class="flex flex-col items-center  gap-4 pb-[120px]"
            :class="showSignupModal ? 'overflow-hidden' : ''">
            <div>
                <div class="flex flex-col rounded-t-xl px-4 py-2 bg-wostools-red gap-4 text-xl text-white">
                    Training Troops
                </div>
                <div
                    class="grid grid-cols-2 grid-rows-5 gap-2 container bg-wostools-papper border-4 rounded-b-xl border-wostools-red p-2">
                    <div
                        class="row-span-5 col-span-1 bg-red-200 rounded-xl bg-no-repeat bg-cover bg-[url(/images/share-link-schedule.png)] p-4 flex flex-col justify-center h-full">
                        <img class="w-8 h-8" src="/images/flag.png" alt="">
                        <p class="text-xl"> {{ scheduleStore.linkData?.title }}</p>
                        <div class="flex flex-col gap-1 leading-none">
                            <p class="text-sm font-light">Share the link with your alliance</p>
                        </div>
                    </div>
                    <div
                        class="row-span-3 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                        <div class="flex justify-between items-center py-1">
                            <p>Day:</p>
                            <p>{{ scheduleStore.linkData?.training_time }}</p>
                        </div>
                        <div class="flex justify-between items-center  py-1">
                            <p>Training Capacity:</p>
                            <p> +200 </p>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <p>Training:</p>
                            <p>+50%</p>
                        </div>
                    </div>
                    <div
                        class="row-span-2 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                        <p>{{ scheduleStore.linkData?.description }}</p>
                    </div>
                </div>
            </div>

            <div class="w-full">
                <div class="flex flex-col rounded-t-xl p-4 bg-wostools-400 gap-4 text-sm">
                    Slots: {{scheduleStore.slots.training.filter(slot => slot.is_booked).length}}/{{
                        scheduleStore.slots.training.length }}
                </div>
                <div class="flex flex-col gap-2 container bg-wostools-750 p-4 rounded-b-xl">
                    <div v-for="slot in scheduleStore.slots.training" :key="slot.id" v-if="!scheduleStore.loading"
                        class="relative">
                        <div v-if="scheduleStore.accessGranted && slot.is_booked" @click="removeSlot(slot)"
                            class="rounded-full w-5 h-5 bg-red-700 justify-center flex items-center text-white absolute top-[-5px] right-0  hover:cursor-pointer">
                            <span class="mt-[-5px]">-</span>
                        </div>
                        <div class="rounded-xl py-2 px-4 flex gap-2 min-h-[68px] items-center justify-between"
                            :class="slot.is_booked ? 'bg-wos-50 text-wos-900' : 'bg-wos-600 text-wos-300'">
                            <div class="flex gap-3 items-center justify-between w-full">
                                <div class="flex gap-3 items-center">
                                    <img v-if="slot.is_booked" :src="slot.players.player_avatar"
                                        class="rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400">
                                    </img>
                                    <div v-else @click="openModal(slot)"
                                        class="hover:cursor-pointer rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400 text-lime-400 text-2xl font-black">
                                        +
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <p class=" font-wos text-xs">
                                            {{ slot.is_booked ? slot.players.player_name : 'Slot_Empty' }}
                                        </p>
                                        <p class="font-wos text-xs">
                                            {{ slot.start_time }} - {{ slot.end_time }} UTC
                                        </p>
                                    </div>
                                </div>
                                <div class="text-xs">
                                    {{ slot.players?.player_id }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-if="scheduleStore.loading">Loading...</div>
                </div>
            </div>
        </div>

        <Alert v-if="scheduleStore.message.text || message" :message="scheduleStore.message.text || message"
            :type="scheduleStore.message.type || 'info'" />

        <div v-if="showSignupModal"
            class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-95 ">
            <div class="bg-wos-800 p-6 rounded-xl w-80 max-w-full flex flex-col gap-4 relative">
                <img src="/images/frametop-modal.png" class="absolute top-[-5px] left-0 z-99"></img>
                <h2 class="text-wos-50 text-center">Your ID Player</h2>
                <div class="flex flex-col gap-1">
                    <input type="text" v-model="playerId"
                        class="rounded-xl bg-wos-500 px-4 py-2 w-full text-wos-900 text-sm" maxlength="20" />
                </div>
                <div class="flex justify-center gap-4">
                    <button @click="showSignupModal = false"
                        class="rounded-2xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50  hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-fit">
                        <span>Cancel</span>
                    </button>
                    <button @click="signUpPlayer(modalSlot); showSignupModal = false"
                        class="rounded-2xl border-b-3 hover:cursor-pointer hover:from-wosbutton-yh50  hover:to-wosbutton-yh100 border-wosbutton-yb bg-linear-to-t from-wosbutton-y50 to-wosbutton-y100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-wosbutton-yb w-fit">
                        Confirm
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showModalAdmin"
            class="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-95 ">
            <div class="bg-wos-800 p-6 rounded-xl w-80 max-w-full flex flex-col gap-4 relative">
                <img src="/images/frametop-modal.png" class="absolute top-[-5px] left-0 z-99"></img>
                <h2 class="text-wos-50 text-center">Your Access Key</h2>
                <p v-if="scheduleStore.accessGranted" class="text-green-500 text-center">Access Granted</p>
                <div class="flex flex-col gap-1">
                    <input type="text" v-model="accessKey" v-if="!scheduleStore.accessGranted"
                        class="rounded-xl bg-wos-500 px-4 py-2 w-full text-wos-900 text-sm" maxlength="20" />
                </div>
                <div class="grid grid-cols-2 justify-center gap-4">
                    <button @click="showModalAdmin = false"
                        class="col-span-1 rounded-2xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50  hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-full">
                        <span>Cancel</span>
                    </button>
                    <button @click="logout" v-if="scheduleStore.accessGranted"
                        class="col-span-1 rounded-2xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50  hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-full">
                        <span>Logout</span>
                    </button>
                    <button @click="accessKeyVerification(accessKey, scheduleStore.linkId)"
                        v-if="!scheduleStore.accessGranted"
                        class="col-span-1 rounded-2xl border-b-3 hover:cursor-pointer hover:from-wosbutton-yh50  hover:to-wosbutton-yh100 border-wosbutton-yb bg-linear-to-t from-wosbutton-y50 to-wosbutton-y100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-wosbutton-yb w-full">
                        Confirm
                    </button>
                    <button v-if="scheduleStore.accessGranted" @click="refreshAllPlayersInfo()" :disabled="loading"
                        class="col-span-2 rounded-2xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50  hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-full disabled:opacity-50 disabled:cursor-not-allowed">
                        <span v-if="loading">Refreshing...</span>
                        <span v-else>Refresh Players</span>
                    </button>
                </div>
            </div>
        </div>

        <img src="/images/frametop.png" class="fixed bottom-[70px] left-0 z-92"></img>
    </div>
</template>
<script setup>
const currentTab = ref('construction');

const tabs = [
    { label: 'Construction', link: 'construction', icon: '/images/vp-constr-research.png' },
    { label: 'Research', link: 'research', icon: '/images/vp-constr-research.png' },
    { label: 'Training', link: 'training', icon: '/images/education-training.png' },
];

import Alert from '@/components/Alert.vue';
import { useScheduleStore } from '@/stores/schedule';
import { onMounted, ref, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const message = ref('');

const scheduleStore = useScheduleStore();
const linkId = ref(route.params.id);
scheduleStore.linkId = linkId.value;

const playerId = ref('');
const loading = ref(false);

const showSignupModal = ref(false);
const modalSlot = ref(null);

const showModalAdmin = ref(false);
const accessKey = ref(null);

function accessKeyVerification(key, linkId) {
    scheduleStore.verifyAccessKey(key, linkId).then((res) => {
        if (res === true) {
            scheduleStore.accessGranted = true;
        } else {
            scheduleStore.accessGranted = false;
        }
    });
}

function refreshAllPlayersInfo() {
    loading.value = true;
    scheduleStore.refreshAllPlayersData().finally(() => {
        loading.value = false;
    });
}

// Função para logout/revogar acesso
function logout() {
    scheduleStore.logout();
    showModalAdmin.value = false;
    accessKey.value = null;
}

function signUpPlayer(slot) {
    loading.value = true;
    scheduleStore.signUpPlayer(slot, playerId.value).finally(() => {
        loading.value = false;
    });
}

function openModal(slot) {
    modalSlot.value = slot;
    showSignupModal.value = true;
}

function removeSlot(slot) {
    scheduleStore.removePlayer(slot);
}

onMounted(async () => {
    // Primeiro verifica se existe acesso em cache
    const hasCachedAccess = await scheduleStore.checkCachedAccess();

    // Então carrega os slots
    await scheduleStore.getSlots();

    // Se não tinha acesso em cache, pode mostrar uma mensagem indicando que precisa fazer login
    if (!hasCachedAccess && !scheduleStore.accessGranted) {
        console.log('No cached access found. User will need to enter access key for admin features.');
    }
});

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        message.value = 'Copied to clipboard';
        setTimeout(() => message.value = '', 3000);
    }).catch(err => {
        message.value = 'Failed to copy.';
        setTimeout(() => message.value = '', 3000);
        console.error('Could not copy text: ', err);
    });
};

</script>
