<template>

    <div class="p-10 flex flex-col items-center gap-4 pb-[120px]">

        <a href="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px] pb-6">
        </a>

        <div>
            <div class="flex flex-col rounded-t-xl px-4 py-2 bg-wostools-red gap-4 text-xl text-white">
                Transfer List
            </div>
            <div
                class="grid grid-cols-2 grid-rows-5 gap-2 container bg-wostools-papper border-4 rounded-b-xl border-wostools-red p-2">
                <div
                    class="row-span-5 col-span-1 bg-red-200 rounded-xl bg-no-repeat bg-cover bg-[url(/images/share-link-schedule.png)] p-4 flex flex-col justify-center h-full">
                    <img class="w-8 h-8" src="/images/flag.png" alt="">
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
                <input id="req-id" type="number" v-model="playerData.player_id" placeholder="Player ID"
                    class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" required>
                </input>
                <input id="req-power" type="text" v-model="powerInput" @focus="onPowerFocus" @blur="onPowerBlur"
                    placeholder="Power (ex: 10M ou 10000000)"
                    class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" required>
                </input>

                <input id="req-lab" type="number" v-model="playerData.labyrinth" placeholder="Labyrinth"
                    class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" required>
                </input>


                <label for="req-target">Who are you inviting?</label>
                <select id="req-target" v-model="playerData.alliance_target"
                    class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm">
                    <option value="" disabled>Select alliance target</option>
                    <option v-for="(count, allianceName) in transferStore.currentList?.alliance_invites"
                        :key="allianceName" :value="allianceName">
                        {{ allianceName }}
                    </option>
                </select>

                <button @click="transferStore.addPlayer(playerData)" :disabled="loading"
                    class="w-full col-span-3 rounded-xl border-b-3 hover:cursor-pointer hover:from-wosbutton-yh50 hover:to-wosbutton-yh100 border-wosbutton-yb bg-linear-to-t from-wosbutton-y50 to-wosbutton-y100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-wosbutton-yb">
                    <template v-if="loading">
                        Adding...
                    </template>
                    <template v-else>
                        Add Player
                    </template>
                </button>
            </div>
        </div>
        <div v-for="(count, allianceName) in transferStore.currentList?.alliance_invites"
            :key="allianceName" class="w-full flex flex-col bg-wostools-750  rounded-xl">
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
                    <div class="grid grid-cols-6 rounded-xl py-2 px-2 gap-2 min-h-[68px] items-center justify-between bg-wos-50 text-wos-800 "
                        >
                        <div class="col-span-1 flex flex-col items-center justify-center gap-[-10px]">
                            <img class="rounded-xl w-[50px] h-full object-fit flex items-center justify-center bg-wos-400"
                                :src="player.avatar_image" alt="">
                                <img :src="player.stove_lv_content" class="h-7 w-7 mt-[-10px]"  alt="">
                        </div>
                        
                        <div class="col-span-3 flex flex-col justify-center  text-xs">
                            <p class="font-wos">{{ player.nickname }}</p>
                            <p class="font-wos">ID: {{ player.fid }}</p>
                            <p class="font-wos">State: {{ player.state_id }}</p>
                        </div>
                        <div class="col-span-2 flex flex-col text-xs">
                            <p class="font-wos"
                            :class="{
                                'bg-red-300 rounded px-1 pw-2  w-fit' : player.labyrinth >= transferStore.currentList?.requirements.max_labyrinth,
                            }">Labyrinth: {{ player.labyrinth }}</p>
                            <p class="font-wos"
                            :class="{
                                'bg-red-300 rounded px-1 pw-2  w-fit' : player.power >= transferStore.currentList?.requirements.max_power,
                            }">Power: {{ simplifyNumber(player.power) }}</p>
                            <p class="font-wos"
                            :class="{
                                'bg-orange-300 rounded px-1 pw-2 w-fit' : player.stove_lv <= (transferStore.currentList?.requirements.min_furnace_level - 1),
                            }">Furnace: {{ getFCName(player.stove_lv) }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


</template>

<script setup>
import { ref } from 'vue';
import { useTransferStore } from '@/stores/transfer';
import { onMounted } from 'vue';

const props = defineProps({
    id: {
        type: [String, Number],
        required: false,
        default: null
    }
});

const powerInput = ref('');

const onPowerFocus = () => {
    // Ao focar, mostre o número real (se existir) para edição
    if (playerData.value.power) {
        powerInput.value = playerData.value.power;
    }
};
const onPowerBlur = () => {
    // Ao sair, parseie o que foi digitado (ex: "10m")
    const parsedValue = parseSimplifiedNumber(powerInput.value);
    // Salve o NÚMERO REAL no playerData
    playerData.value.power = parsedValue;
    // E formate o input para exibir o texto (ex: "10M")
    if (parsedValue) {
        powerInput.value = simplifyNumber(parsedValue);
    } else {
        powerInput.value = '';
    }
};

// 2. Instanciar a store
const transferStore = useTransferStore();
const loading = ref(false);

const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact', // Isso faz a mágica: 1,500,000 -> 1.5M
    maximumFractionDigits: 3 // Define o máximo de casas decimais
});

// Crie a função que será usada no template
function simplifyNumber(value) {
    // Primeiro, converta o valor (que pode ser string) para número
    const number = parseFloat(value);

    // Se não for um número válido, retorne o valor original
    if (isNaN(number)) {
        return value;
    }

    // Formate o número
    return numberFormatter.format(number);
}

function parseSimplifiedNumber(str) {
    if (!str || typeof str !== 'string') {
        // Se já for número (do @focus), apenas retorne.
        if (typeof str === 'number') return str;
        return null;
    }

    let value = String(str).toLowerCase().trim();
    let num = parseFloat(value.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return null;

    if (value.endsWith('b')) {
        return num * 1000000000; // Bilhão
    }
    if (value.endsWith('m')) {
        return num * 1000000; // Milhão
    }
    if (value.endsWith('k')) {
        return num * 1000; // Mil
    }

    // Se não tiver 'm' ou 'k', retorna o número que foi digitado
    return num;
}

function getFCName(stove_lv) {
    const level = Number(stove_lv);

    if (level >= 31 && level <= 35) return 'FC1';
    if (level >= 36 && level <= 40) return 'FC2';
    if (level >= 41 && level <= 45) return 'FC3';
    if (level >= 46 && level <= 50) return 'FC4';
    if (level >= 51 && level <= 55) return 'FC5';
    if (level >= 56 && level <= 60) return 'FC6';
    if (level >= 61 && level <= 65) return 'FC7';
    if (level >= 66 && level <= 70) return 'FC8';

    return 'N/A';
}

onMounted(async () => {
    await transferStore.getTransferInvites(props.id);
});

// Objeto reativo para armazenar os dados do novo formulário
const playerData = ref({
    transfer_list_id: props.id,
    player_id: '',
    labyrinth: null,
    power: null,
    alliance_target: '',
});

</script>