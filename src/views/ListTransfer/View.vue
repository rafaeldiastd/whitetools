<template>
    <Alert v-if="transferStore.message || message" :message="transferStore.message || message" />

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
                        <p>{{ transferStore.linkData[0]?.transfer_list_id.requirements.max_power }}</p>
                    </div>
                    <div class="flex justify-between items-center  py-1">
                        <p>Max Labyrinth:</p>
                        <p>{{ transferStore.linkData[0]?.transfer_list_id.requirements.max_labyrinth }}</p>
                    </div>
                    <div class="flex justify-between items-center py-1">
                        <p>Min Furnace:</p>
                        <p>{{ transferStore.linkData[0]?.transfer_list_id.requirements.min_furnace_level }}</p>
                    </div>
                </div>
                <div
                    class="row-span-2 col-span-1 bg-wostools-papper-200 rounded-xl flex flex-col divide-y divide-wostools-papper-500/20  text-wostools-papper-500 justify-between p-2 text-xs">
                    <p>{{ transferStore.linkData[0]?.transfer_list_id.description }}</p>
                </div>
            </div>
        </div>

        <div class="flex flex-wrap gap-3">
            <input id="req-id" type="text" v-model="playerData.player_id" placeholder="Player ID"
                class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm">
            </input>
            <input id="req-power" type="text" v-model="playerData.power" placeholder="Power"
                class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm">
            </input>
            <input id="req-lab" type="text" v-model="playerData.labyrinth" placeholder="Labyrinth Power"
                class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm">
            </input>
            <span>
                {{ allianceName }}
            </span>
            <label for="req-target">Who are you inviting?</label>
            <select id="req-target" v-model="playerData.alliance_target"
                class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm">
                <option value="" disabled>Select alliance target</option>
                <option v-for="(count, allianceName) in transferStore.linkData[0]?.transfer_list_id.alliance_invites"
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

            {{ playerData.player_id }}
        </div>

        <div class="w-full">
            <div class="grid grid-cols-12 gap-2 rounded-t-xl p-4 bg-wostools-400 text-sm justify-between">
                <span v-for="(count, allianceName) in transferStore.linkData[0]?.transfer_list_id.alliance_invites"
                    class="col-span-2 w-full flex flex-col justify-between items-center px-2 py-3 bg-wostools-750 rounded-xl gap-2">
                    <span>{{ allianceName }}</span>
                    <span>{{ count }}</span>
                </span>
            </div>
            <div class="flex flex-col gap-2 container bg-wostools-750 p-4 rounded-b-xl">
                <div v-for="player in transferStore.linkData" :key="player.id" class="relative">
                    <div
                        class="rounded-xl py-2 px-4 flex gap-2 min-h-[68px] items-center justify-between bg-wos-50 text-wos-900">
                        <div class="flex gap-3 items-center justify-between w-full">
                            <div class="flex  gap-3 items-center">
                                <div class="flex flex-col items-center justify-center gap-2">
                                    <img :src="player.avatar_image"
                                        class="rounded-xl w-[50px] h-[50px] flex items-center justify-center bg-wos-400">
                                    </img>
                                    <img :src="player.stove_lv_content" class="w-8 h-8 m-[-20px]"></img>
                                </div>
                                <div class="grid grid-cols-2 gap-1">

                                    <div class="col-span-1 gap-1 flex flex-col">
                                        <p class=" font-wos text-sm">{{ player.nickname }}</p>
                                        <p class="font-wos text-xs">ID: {{ player.fid }}</p>
                                        <p class="font-wos text-xs">State: {{ player.state_id }}</p>
                                        <p class="font-wos text-xs">Alliance Target: {{ player.alliance_target }}</p>
                                    </div>
                                    <div class="col-span-1 gap-2 flex flex-col">
                                        <p class="font-wos text-xs px-2 py-2 rounded" :class="{
                                            'bg-green-100 text-green-900': player.labyrinth < transferStore.linkData[0].transfer_list_id.requirements.max_labyrinth,
                                            'bg-red-200 text-red-900': player.labyrinth > transferStore.linkData[0].transfer_list_id.requirements.max_labyrinth
                                        }">
                                            Labyrinth: {{ player.labyrinth }}
                                        </p>
                                        <p class="font-wos text-xs px-2 py-2 rounded" :class="{
                                            'bg-green-100 text-green-900': player.power <= transferStore.linkData[0].transfer_list_id.requirements.max_power,
                                            'bg-red-200 text-red-900': player.power > transferStore.linkData[0].transfer_list_id.requirements.max_power
                                        }">
                                            Current Power: {{ player.power }}
                                        </p>
                                    </div>




                                </div>
                            </div>
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
import Alert from '@/components/Alert.vue';

const props = defineProps({
    id: {
        type: [String, Number],
        required: false,
        default: null
    }
});


// 2. Instanciar a store
const transferStore = useTransferStore();
const loading = ref(false);


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