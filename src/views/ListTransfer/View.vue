<template>
    <div class="p-10 flex flex-col items-center gap-4 pb-[120px]">

        <!-- Navigation Tabs -->
        <div
            class="flex items-center justify-center w-full bg-wostools-menu py-2 divide-x divide-wostools-50/10 inset-shadow-sm inset-shadow-wostools-50/20 mb-4 rounded-xl">
            <div class="flex items-center p-2" @click="showAdminModal = true">
                <div class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    <img src="/src/assets/images/bearspace-icon.png" alt="" class="w-8 h-8">
                    Settings
                </div>
            </div>
            <div class="flex items-center p-2" @click="handleAddPlayerClick">
                <div class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    <img src="/src/assets/images/add-icon.png" alt="Add" class="w-8 h-8">
                    Add Player
                </div>
            </div>
        </div>

        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px] pb-6">
        </router-link>

        <div>
            <div
                class="flex justify-between items-center rounded-t-xl px-4 py-2 bg-wostools-red gap-4 text-xl text-white">
                <span>Transfer List</span>
                <div class="flex gap-2">
                    <button v-if="transferStore.isAdmin" @click="saveSettings"
                        class="bg-white text-wostools-red text-sm px-3 py-1 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm">
                        Save Changes
                    </button>
                </div>
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
                        <p v-if="!transferStore.isAdmin">{{
                            simplifyNumber(transferStore.currentList?.requirements.max_power) }}</p>
                        <input v-else v-model="transferStore.currentList.requirements.max_power" type="number"
                            class="w-20 text-right bg-transparent border-b border-wostools-500/50 focus:outline-none focus:border-wostools-red p-0 text-xs" />
                    </div>
                    <div class="flex justify-between items-center  py-1">
                        <p>Max Labyrinth:</p>
                        <p v-if="!transferStore.isAdmin">{{ transferStore.currentList?.requirements.max_labyrinth }}</p>
                        <input v-else v-model="transferStore.currentList.requirements.max_labyrinth" type="number"
                            class="w-20 text-right bg-transparent border-b border-wostools-500/50 focus:outline-none focus:border-wostools-red p-0 text-xs" />
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <p>Min Furnace:</p>
                        <p v-if="!transferStore.isAdmin">{{
                            getFCName(transferStore.currentList?.requirements.min_furnace_level) }}</p>
                        <input v-else v-model="transferStore.currentList.requirements.min_furnace_level" type="number"
                            class="w-20 text-right bg-transparent border-b border-wostools-500/50 focus:outline-none focus:border-wostools-red p-0 text-xs" />
                    </div>
                </div>
                <div
                    class="row-span-2 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                    <span class="text-xs">Responsible: {{ transferStore.currentList?.responsible_data.name }} #{{
                        transferStore.currentList?.responsible_data.state }}</span>
                </div>
            </div>
        </div>
        
        <!-- Sorting Controls -->
        <div class="w-full flex justify-end gap-2 mb-[-10px] px-2">
             <select v-model="sortBy" class="bg-wostools-750 text-white text-xs rounded-lg px-2 py-1 border border-wostools-500/50 focus:outline-none">
                <option value="nickname">Name</option>
                <option value="labyrinth">Labyrinth</option>
                <option value="power">Power</option>
                <option value="stove_lv">Furnace</option>
                <option value="type_invite">Type</option>
                <option value="status">Status</option>
            </select>
            <button @click="sortDesc = !sortDesc" class="bg-wostools-750 text-white text-xs rounded-lg px-2 py-1 border border-wostools-500/50 hover:bg-wostools-600 transition">
                {{ sortDesc ? 'Desc ⬇' : 'Asc ⬆' }}
            </button>
        </div>

        <div v-for="(count, allianceName) in transferStore.currentList?.alliance_invites" :key="allianceName"
            class="w-full flex flex-col bg-wostools-750  rounded-xl">
            <div class="flex justify-between text-wos-200 px-4 py-2 rounded-t-xl bg-wostools-400">
                <div class="flex flex-col">
                    <p class="font-wos text-sm">Alliance: {{ allianceName }}</p>
                    <p v-if="transferStore.isAdmin && alliancePasswords[allianceName]" class="text-xs text-yellow-300">
                        Pass: {{ alliancePasswords[allianceName] }}
                    </p>
                </div>
                <div class="text-xs flex items-center gap-2">
                    <span>Players Invited:</span>
                    <span class="text-xs"
                        :class="{ 'text-red-500': transferStore.currentInvites.filter(p => p.alliance_target === allianceName).length > count.spots }">
                        {{transferStore.currentInvites.filter(p => p.alliance_target === allianceName).length}}</span> /
                    <span v-if="!transferStore.isAdmin">{{ count.spots }}</span>
                    <input v-else v-model="count.spots" type="number"
                        class="w-12 text-center text-wos-900 bg-white rounded px-1" />
                </div>
            </div>
            <div class="flex flex-col gap-2 p-4 ">
                 <div v-for="player in getSortedPlayers(allianceName)"
                    :key="player.id" class="relative flex flex-col">
                    <div class="grid rounded-xl py-2 px-2 gap-2 min-h-[68px] items-center justify-between bg-wos-5 text-wos-800 bg-wos-500 transition-all duration-300"
                        :class="[
                            { 'grid-cols-8': transferStore.isAdmin || transferStore.isAllianceGlobal, 'grid-cols-7': !transferStore.isAdmin && !transferStore.isAllianceGlobal },
                            player.status === 'transferred' ? 'grayscale opacity-75' : '',
                            player.status === 'refused' ? 'border-2 border-red-500 bg-red-100/10' : ''
                        ]">
                        <div class="col-span-1 flex flex-col items-center justify-center gap-[-10px]">
                            <img class="rounded-xl w-[50px] h-full object-fit flex items-center justify-center bg-wos-400"
                                :src="player.avatar_image" alt="">
                            <img :src="player.stove_lv_content" class="h-7 w-7 mt-[-10px]" alt="">
                        </div>
                        <div class="col-span-4 flex flex-col justify-center  text-xs">
                            <div class="flex items-center gap-2">
                                <p class="font-wos">{{ player.nickname }}</p>
                                <!-- Status Indicator for everyone -->
                                <span v-if="player.status && player.status !== 'pending'" 
                                    class="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-white shadow-sm flex items-center gap-1"
                                    :class="{
                                        'bg-gray-500': player.status === 'transferred',
                                        'bg-red-600': player.status === 'refused',
                                        'bg-wostools-red': player.status === 'pending'
                                    }">
                                    {{ player.status }}
                                    <span v-if="player.status === 'refused'" class="text-xs">⚠️</span>
                                </span>
                            </div>
                            <p class="font-wos">ID: {{ player.fid }}</p>
                            <p class="font-wos">State: {{ player.state_id }}</p>

                            <div class="flex gap-2 mt-1">
                                <!-- Type Invite Display/Edit -->
                                <div v-if="player.type_invite || transferStore.isAdmin">
                                    <select v-if="transferStore.isAdmin" :value="player.type_invite || 'common'"
                                        @change="transferStore.updateInviteType(player.fid, transferStore.currentList.id, $event.target.value)"
                                        class="bg-wos-400 text-wos-100 rounded px-1 py-0.5 text-[10px] border border-wos-300 focus:outline-none">
                                        <option value="common">Common</option>
                                        <option value="special">Special</option>
                                        <option value="free">Free Entry</option>
                                    </select>
                                    <span v-else
                                        class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-white shadow-sm"
                                        :class="{
                                            'bg-gray-500': !player.type_invite || player.type_invite === 'common',
                                            'bg-yellow-600': player.type_invite === 'special',
                                            'bg-green-600': player.type_invite === 'free'
                                        }">
                                        {{ player.type_invite || 'Common' }}
                                    </span>
                                </div>

                                <!-- Status Edit for Admin -->
                                <div v-if="transferStore.isAdmin">
                                    <select :value="player.status || 'pending'"
                                        @change="transferStore.updatePlayerStatus(player.fid, transferStore.currentList.id, $event.target.value)"
                                        class="bg-wos-400 text-wos-100 rounded px-1 py-0.5 text-[10px] border border-wos-300 focus:outline-none">
                                        <option value="pending">Pending</option>
                                        <option value="transferred">Transferred</option>
                                        <option value="refused">Refused</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="col-span-2 flex flex-col text-xs">
                            <template v-if="transferStore.isAdmin || transferStore.isAllianceGlobal">
                                <div class="flex items-center gap-1 mb-1">
                                    <span class="w-8">Lab:</span>
                                    <input type="number" v-model="player.labyrinth"
                                        class="w-16 bg-wos-400 rounded px-1 border border-wos-300 text-center"
                                        @change="transferStore.updatePlayer(player)" />
                                </div>
                                <div class="flex items-center gap-1">
                                    <span class="w-8">Pow:</span>
                                    <input type="text" :value="simplifyNumber(player.power)"
                                        class="w-16 bg-wos-400 rounded px-1 border border-wos-300 text-center"
                                        @change="updatePlayerPower(player, $event.target.value)" />
                                </div>
                            </template>
                            <template v-else>
                                <p class="font-wos" :class="{
                                    'bg-red-300 rounded px-1 pw-2  w-fit': player.labyrinth >= transferStore.currentList?.requirements.max_labyrinth,
                                }">Lab: {{ player.labyrinth }}</p>
                                <p class="font-wos" :class="{
                                    'bg-red-300 rounded px-1 pw-2  w-fit': player.power >= transferStore.currentList?.requirements.max_power,
                                }">Power: {{ simplifyNumber(player.power) }}</p>
                                <p class="font-wos" :class="{
                                    'bg-orange-300 rounded px-1 pw-2 w-fit': player.stove_lv <= (transferStore.currentList?.requirements.min_furnace_level - 1),
                                }">Furnace: {{ getFCName(player.stove_lv) }}</p>
                            </template>
                        </div>
                        <div v-if="transferStore.isAdmin || transferStore.isAllianceGlobal"
                            class="col-span-1 items-center justify-center flex absolute right-[0px] top-[-4px]">
                            <button @click="handleRemovePlayer(player.fid, transferStore.currentList.id, allianceName)"
                                class="group relative flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-red-600 border-2 border-red-800 shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_4px_rgba(0,0,0,0.2)] active:scale-95 active:shadow-none transition-all duration-150">
                                <div class="w-2 h-0.5 bg-white rounded-full shadow-sm"></div>
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <!-- Add Player Modal -->
        <div v-if="showAddPlayerModal"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div
                class="bg-wostools-800 p-6 rounded-xl w-full max-w-lg flex flex-col gap-6 shadow-xl border border-wostools-red/30">
                <div class="flex justify-between items-center border-b border-white/10 pb-4">
                    <h3 class="text-xl text-white font-bold">Add Player</h3>
                    <button @click="showAddPlayerModal = false" class="text-gray-400 hover:text-white">✕</button>
                </div>

                <div class="flex flex-col w-full gap-4">
                    <BaseInput id="req-id" type="number" v-model="playerData.player_id" placeholder="Player ID"
                        required />

                    <div class="grid grid-cols-2 gap-4">
                        <BaseInput id="req-power" type="text" v-model="powerInput" @focus="onPowerFocus"
                            @blur="onPowerBlur" placeholder="Power (ex: 10M)" required />

                        <BaseInput id="req-lab" type="number" v-model="playerData.labyrinth" placeholder="Labyrinth"
                            required />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="req-type" class="text-white text-sm ml-1">Type</label>
                        <select id="req-type" v-model="playerData.type_invite"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm focus:outline-none focus:ring-2 focus:ring-wosbutton-y50">
                            <option value="common">Common</option>
                            <option value="special">Special</option>
                            <option value="free">Free Entry</option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label for="req-target" class="text-white text-sm ml-1">Who are you inviting?</label>
                        <select id="req-target" v-model="playerData.alliance_target"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm focus:outline-none focus:ring-2 focus:ring-wosbutton-y50">
                            <option value="" disabled>Select alliance target</option>
                            <option v-for="(count, allianceName) in transferStore.currentList?.alliance_invites"
                                :key="allianceName" :value="allianceName">
                                {{ allianceName }}
                            </option>
                        </select>
                    </div>

                    <BaseButton @click="handleAddPlayer" :disabled="loading" class="w-full mt-2">
                        <template v-if="loading">
                            Adding...
                        </template>
                        <template v-else>
                            Add Player
                        </template>
                    </BaseButton>
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

        <!-- Alliance Auth Modal -->
        <!-- Alliance Auth Modal -->
        <div v-if="showAllianceAuthModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-wostools-800 p-6 rounded-xl w-full max-w-sm flex flex-col gap-4">
                <h3 class="text-xl text-white font-bold">Alliance Access</h3>

                <p class="text-sm text-gray-300">Enter the Alliance Access Key to manage players.</p>

                <BaseInput id="alliance-pass" v-model="allianceAuthPassword" placeholder="Alliance Password" />
                <div class="flex gap-2">
                    <BaseButton variant="secondary" @click="showAllianceAuthModal = false" class="w-full">Cancel
                    </BaseButton>
                    <BaseButton @click="verifyAllianceAuth" class="w-full">Verify</BaseButton>
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
const showAddPlayerModal = ref(false); // New Modal State
const accessKeyInput = ref('');

const sortBy = ref('labyrinth');
const sortDesc = ref(true);

function getSortedPlayers(allianceName) {
    const players = transferStore.currentInvites.filter(p => p.alliance_target === allianceName);
    
    return players.sort((a, b) => {
        let valA = a[sortBy.value];
        let valB = b[sortBy.value];

        // Handle null/undefined values safely
        if (valA === null || valA === undefined) valA = '';
        if (valB === null || valB === undefined) valB = '';

        // Handle string comparison for non-numeric fields
        if (typeof valA === 'string' && typeof valB === 'string') {
             valA = valA.toLowerCase();
             valB = valB.toLowerCase();
        }

        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;

        return sortDesc.value ? comparison * -1 : comparison;
    });
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
    if (!level || isNaN(level)) return 'N/A';
    
    if (level < 36) {
        return `F${level}`;
    }
    
    const fcLevel = Math.floor((level - 35) / 5) + 1;
    return `FC${fcLevel}`;
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
    type_invite: 'common',
});

// --- Security Logic ---
const authenticatedAlliances = ref(new Set()); // Tags of alliances the user has unlocked
const alliancePasswords = ref({}); // For Admin view: map of Tag -> Password
const showAllianceAuthModal = ref(false);
const authTargetAlliance = ref('');
const allianceAuthPassword = ref('');

// Updated verifyKey for Admin
async function verifyKey() {
    const isValid = await transferStore.verifyAccessKey(accessKeyInput.value, props.id);
    if (isValid) {
        showAdminModal.value = false;
        accessKeyInput.value = '';
        // Fetch alliance passwords for admin view
        const details = await transferStore.fetchAdminDetails(props.id);
        if (details) {
            alliancePasswords.value = {};
            for (const [tag, info] of Object.entries(details)) {
                if (typeof info === 'object' && info.password) {
                    alliancePasswords.value[tag] = info.password;
                }
            }
        }
    }
}

// Wrapper for Adding Player
async function handleAddPlayer() {
    if (!playerData.value.alliance_target) {
        transferStore.showMessage({ text: 'Please select an alliance', type: 'error' });
        return;
    }

    // Since we are in a modal now, we handle closure or auth trigger
    const addLogic = async () => {
        await transferStore.addPlayer(playerData.value);
        showAddPlayerModal.value = false; // Close on success? 
        // Reset form?
        playerData.value = {
            transfer_list_id: props.id,
            player_id: '',
            labyrinth: null,
            power: null,
            alliance_target: '',
            type_invite: 'common',
        };
        powerInput.value = '';
    };

    if (transferStore.isAdmin || transferStore.isAllianceGlobal) {
        await addLogic();
    } else {
        // Prompt for password
        playerData.value.alliance_target = playerData.value.alliance_target; // keep selection
        showAllianceAuthModal.value = true;
    }
}

// Wrapper for Removing Player
async function handleRemovePlayer(fid, listId, allianceTarget) {
    if (transferStore.isAdmin || transferStore.isAllianceGlobal) {
        await transferStore.removePlayer(fid, listId);
    } else {
        showAllianceAuthModal.value = true;
    }
}

async function saveSettings() {
    if (!transferStore.currentList) return;

    const invites = {};
    for (const [tag, info] of Object.entries(transferStore.currentList.alliance_invites)) {
        const password = alliancePasswords.value[tag];

        if (!password) {
            transferStore.showMessage({ text: `Error: Password for ${tag} not found. Cannot save.`, type: 'error' });
            return;
        }

        invites[tag] = {
            spots: Number(info.spots),
            password: password
        };
    }

    const payload = {
        requirements: transferStore.currentList.requirements,
        alliance_invites: invites
    };

    await transferStore.updateTransferListSettings(props.id, payload);
}

const isPendingAddPlayer = ref(false);

function handleAddPlayerClick() {
    // If admin or already authenticated globally, open Add Player modal directly
    if (transferStore.isAdmin || transferStore.isAllianceGlobal) {
        showAddPlayerModal.value = true;
    } else {
        // Prompt for authentication first
        isPendingAddPlayer.value = true;
        showAllianceAuthModal.value = true;
    }
}

async function verifyAllianceAuth() {
    // Check global password first
    const isGlobal = await transferStore.verifyAlliancePasswordGlobal(allianceAuthPassword.value, props.id);

    if (isGlobal) {
        showAllianceAuthModal.value = false;
        allianceAuthPassword.value = '';
        transferStore.showMessage({ text: 'Alliance Access Granted', type: 'success' });

        if (isPendingAddPlayer.value) {
            isPendingAddPlayer.value = false;
            showAddPlayerModal.value = true;
        }
        return;
    }

    // If not global, try Admin key
    const isAdmin = await transferStore.verifyAccessKey(allianceAuthPassword.value, props.id);
    if (isAdmin) {
        showAllianceAuthModal.value = false;
        allianceAuthPassword.value = '';
        // Store already shows "Access Granted" message

        if (isPendingAddPlayer.value) {
            isPendingAddPlayer.value = false;
            showAddPlayerModal.value = true;
        }
        return;
    }

    // If both failed, verifyAccessKey already showed "Invalid Access Key"
    // But verifyAlliancePasswordGlobal didn't show anything.
    // If verifyAccessKey showed error, we are good.
}

function updatePlayerPower(player, value) {
    const parsed = parseSimplifiedNumber(value);
    if (parsed !== null) {
        player.power = parsed;
        transferStore.updatePlayer(player);
    }
}

</script>