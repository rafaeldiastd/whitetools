<template>
    <div class="p-10 flex flex-col items-center gap-4 pb-[120px]">

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
            <div class="flex items-center p-2" @click="showAdminModal = true">
                <div class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    <img src="/src/assets/images/bearspace-icon.png" alt="" class="w-8 h-8">
                    Settings
                </div>
            </div>
        </div>

        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px] pb-6">
        </router-link>

        <div>
            <div class="flex flex-col rounded-t-xl px-4 py-2 bg-wostools-red gap-4 text-xl text-white">
                Transfer List
            </div>
            <div
                class="grid grid-cols-2 grid-rows-5 gap-2 container bg-wostools-papper border-4 rounded-b-xl border-wostools-red p-2">
                <div
                    class="row-span-5 col-span-1 bg-red-200 rounded-xl bg-no-repeat bg-cover bg-[url(/images/share-link-schedule.png)] p-4 flex flex-col justify-center h-full">
                    <img class="w-8 h-8 cursor-pointer" src="/images/flag.png" alt="">
                    <p class="text-xl"> </p>
                    <div class="flex flex-col gap-1 leading-none">
                        <p class="text-sm font-light">Add the players you would like to invite</p>
                    </div>
                </div>
                <div
                    class="row-span-3 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                    <div class="flex justify-between items-center py-1">
                        <p>Max Power:</p>
                        <p>{{ simplifyNumber(transferStore.currentList?.requirements.max_power) }}</p>
                    </div>
                    <div class="flex justify-between items-center  py-1">
                        <p>Max Labyrinth:</p>
                        <p>{{ transferStore.currentList?.requirements.max_labyrinth }}</p>
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <p>Min Furnace:</p>
                        <p>{{ getFCName(transferStore.currentList?.requirements.min_furnace_level) }}</p>
                    </div>
                </div>
                <div
                    class="row-span-2 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                    <p>{{ transferStore.currentList?.description }}</p>
                </div>
            </div>
        </div>

        <div class="bg-wos-800 p-4 rounded-xl w-full max-w-2xl flex flex-col gap-4 items-center">
            <div class="flex flex-col w-full gap-4">
                <BaseInput id="req-id" type="number" v-model="playerData.player_id" placeholder="Player ID" required />

                <BaseInput id="req-power" type="text" v-model="powerInput" @focus="onPowerFocus" @blur="onPowerBlur"
                    placeholder="Power (ex: 10M ou 10000000)" required />

                <BaseInput id="req-lab" type="number" v-model="playerData.labyrinth" placeholder="Labyrinth" required />


                <label for="req-target" class="text-white">Who are you inviting?</label>
                <select id="req-target" v-model="playerData.alliance_target"
                    class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm focus:outline-none focus:ring-2 focus:ring-wosbutton-y50">
                    <option value="" disabled>Select alliance target</option>
                    <option v-for="(count, allianceName) in transferStore.currentList?.alliance_invites"
                        :key="allianceName" :value="allianceName">
                        {{ allianceName }}
                    </option>
                </select>

                <BaseButton @click="transferStore.addPlayer(playerData)" :disabled="loading" class="w-full">
                    <template v-if="loading">
                        Adding...
                    </template>
                    <template v-else>
                        Add Player
                    </template>
                </BaseButton>
            </div>
        </div>
        <div v-for="(count, allianceName) in transferStore.currentList?.alliance_invites" :key="allianceName"
            class="w-full flex flex-col bg-wostools-750  rounded-xl">
            <div class="flex justify-between text-wos-200 px-4 py-2 rounded-t-xl bg-wostools-400">
                <p class="font-wos text-sm">Alliance: {{ allianceName }}</p>
                <div class="text-xs">
                    Players Invited:
                    <span class="text-xs"
                        :class="{ 'text-red-500': transferStore.currentInvites.filter(p => p.alliance_target === allianceName).length > count }">
                        {{transferStore.currentInvites.filter(p => p.alliance_target === allianceName).length}}</span> /
                    <span>{{ count }}</span>
                </div>
            </div>
            <div class="flex flex-col gap-2 p-4 ">
                <div v-for="player in transferStore.currentInvites.filter(p => p.alliance_target === allianceName).sort((a, b) => b.labyrinth - a.labyrinth)"
                    :key="player.id" class="relative flex flex-col">
                    <div class="grid rounded-xl py-2 px-2 gap-2 min-h-[68px] items-center justify-between bg-wos-5 text-wos-800 bg-wos-500"
                        :class="{ 'grid-cols-8': transferStore.isAdmin, 'grid-cols-7': !transferStore.isAdmin }">
                        <div class="col-span-1 flex flex-col items-center justify-center gap-[-10px]">
                            <img class="rounded-xl w-[50px] h-full object-fit flex items-center justify-center bg-wos-400"
                                :src="player.avatar_image" alt="">
                            <img :src="player.stove_lv_content" class="h-7 w-7 mt-[-10px]" alt="">
                        </div>
                        <div class="col-span-4 flex flex-col justify-center  text-xs">
                            <p class="font-wos">{{ player.nickname }}</p>
                            <p class="font-wos">ID: {{ player.fid }}</p>
                            <p class="font-wos">State: {{ player.state_id }}</p>
                        </div>
                        <div class="col-span-2 flex flex-col text-xs">
                            <p class="font-wos" :class="{
                                'bg-red-300 rounded px-1 pw-2  w-fit': player.labyrinth >= transferStore.currentList?.requirements.max_labyrinth,
                            }">Lab: {{ player.labyrinth }}</p>
                            <p class="font-wos" :class="{
                                'bg-red-300 rounded px-1 pw-2  w-fit': player.power >= transferStore.currentList?.requirements.max_power,
                            }">Power: {{ simplifyNumber(player.power) }}</p>
                            <p class="font-wos" :class="{
                                'bg-orange-300 rounded px-1 pw-2 w-fit': player.stove_lv <= (transferStore.currentList?.requirements.min_furnace_level - 1),
                            }">Furnace: {{ getFCName(player.stove_lv) }}</p>
                        </div>
                        <div v-if="transferStore.isAdmin"
                            class="col-span-1 items-center justify-center flex absolute right-[0px] top-[-4px]">
                            <button @click="transferStore.removePlayer(player.fid, transferStore.currentList.id)"
                                class="group relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-red-600 border-2 border-red-800 shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_4px_rgba(0,0,0,0.2)] active:scale-95 active:shadow-none transition-all duration-150">
                                <div class="w-2 h-0.5 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <!-- Admin Modal -->
        <div v-if="showAdminModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-wostools-800 p-6 rounded-xl w-full max-w-sm flex flex-col gap-4">
                <h3 class="text-xl text-white font-bold">Admin Access</h3>
                <p class="text-sm text-gray-300">Enter the access key to manage this list.</p>
                <BaseInput id="access-key" v-model="accessKeyInput" placeholder="Access Key" />
                <div class="flex gap-2">
                    <BaseButton variant="secondary" @click="showAdminModal = false" class="w-full">Cancel</BaseButton>
                    <BaseButton @click="verifyKey" class="w-full">Verify</BaseButton>
                </div>
            </div>
        </div>

        <Alert v-if="transferStore.message.text" :message="transferStore.message.text"
            :type="transferStore.message.type" />
    </div>


</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTransferStore } from '@/stores/transfer';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import Alert from '@/components/Alert.vue';

const props = defineProps({
    id: {
        type: [String, Number],
        required: false,
        default: null
    }
});

const transferStore = useTransferStore();
const loading = ref(false);
const showAdminModal = ref(false);
const accessKeyInput = ref('');

async function verifyKey() {
    const isValid = await transferStore.verifyAccessKey(accessKeyInput.value, props.id);
    if (isValid) {
        showAdminModal.value = false;
        accessKeyInput.value = '';
    }
}

const powerInput = ref('');

const onPowerFocus = () => {
    if (playerData.value.power) {
        powerInput.value = playerData.value.power;
    }
};
const onPowerBlur = () => {
    const parsedValue = parseSimplifiedNumber(powerInput.value);
    playerData.value.power = parsedValue;
    if (parsedValue) {
        powerInput.value = simplifyNumber(parsedValue);
    } else {
        powerInput.value = '';
    }
};

const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 3
});

function simplifyNumber(value) {
    const number = parseFloat(value);
    if (isNaN(number)) {
        return value;
    }
    return numberFormatter.format(number);
}

function parseSimplifiedNumber(str) {
    if (!str || typeof str !== 'string') {
        if (typeof str === 'number') return str;
        return null;
    }
    let value = String(str).toLowerCase().trim();
    let num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return null;

    if (value.endsWith('b')) return num * 1000000000;
    if (value.endsWith('m')) return num * 1000000;
    if (value.endsWith('k')) return num * 1000;

    return num;
}

function getFCName(stove_lv) {
    const level = Number(stove_lv);
    if (level >= 34 && level <= 39) return 'FC1';
    if (level >= 40 && level <= 44) return 'FC2';
    if (level >= 45 && level <= 49) return 'FC3';
    if (level >= 50 && level <= 54) return 'FC4';
    if (level >= 55 && level <= 59) return 'FC5';
    if (level >= 60 && level <= 64) return 'FC6';
    if (level >= 65 && level <= 69) return 'FC7';
    return 'N/A';
}

onMounted(async () => {
    await transferStore.getTransferInvites(props.id);
});

const playerData = ref({
    transfer_list_id: props.id,
    player_id: '',
    labyrinth: null,
    power: null,
    alliance_target: '',
});

</script>