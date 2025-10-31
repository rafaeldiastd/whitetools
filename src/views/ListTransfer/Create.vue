<template>
    <div class="flex flex-col items-center p-6">
        <div class="flex flex-col gap-4 mx-4 rounded-xl bg-wostools-750 mb-30 w-full max-w-md">

                <div class="py-4 grid gap-4 grid-cols-4">

                    <div class="flex flex-col gap-1 col-span-4">
                        <label class="text-md" for="linkTitle">Title</label>
                        <input id="linkTitle" type="text" v-model="transferStore.newTransferData.title"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" />
                    </div>

                    <div class="flex flex-col gap-1 col-span-4">
                        <label class="text-md" for="linkDescription">Description</label>
                        <textarea id="linkDescription" v-model="transferStore.newTransferData.description"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm"></textarea>
                    </div>

                    <div class="flex flex-col gap-2 col-span-4">
                        <label class="text-md">Alliances and Invites</label>
                        <div v-for="(invite, index) in transferStore.newTransferData.alliance_invites" :key="index"
                            class="col-span-4 grid grid-cols-12 gap-2 items-center">
                            <input type="text" v-model="invite.tag" placeholder="TAG" maxlength="3"
                                class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm col-span-5 uppercase">
                            <input type="number" v-model="invite.spots" placeholder="Spots"
                                class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm col-span-5">
                            <button @click="removeInvite(index)"
                                class="col-span-2 text-center text-red-400 hover:cursor-pointer font-bold text-lg">
                                &times;
                            </button>
                        </div>
                        <button @click="addInvite"
                            class="col-span-4 rounded-lg bg-wostools-800 py-2 text-sm hover:bg-wostools-700 text-wostools-text-secondary">
                            + Add Alliance
                        </button>
                    </div>

                    <div class="flex flex-col gap-2 col-span-4">
                        <label class="text-md">Requirements</label>
                        <div class="flex flex-col gap-4 p-4 rounded-xl bg-wos-500">
                            <div class="flex flex-col gap-1">
                                <label class="text-sm text-wos-900" for="req-lab">Min Labyrinth</label>
                                <input id="req-lab" type="number"
                                    v-model.number="transferStore.newTransferData.requirements.max_labyrinth"
                                    class="rounded-lg bg-wostools-750 px-4 py-2 w-full text-wostools-text-primary text-sm">
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm text-wos-900" for="req-power">Min Power</label>
                                <input id="req-power" type="number"
                                    v-model.number="transferStore.newTransferData.requirements.max_power"
                                    class="rounded-lg bg-wostools-750 px-4 py-2 w-full text-wostools-text-primary text-sm">
                            </div>
                            <div class="flex flex-col gap-1">
                                <label class="text-sm text-wos-900" for="req-furnace">Min Furnace Level</label>
                                <select id="req-furnace"
                                    v-model.number="transferStore.newTransferData.requirements.min_furnace_level"
                                    class="rounded-lg bg-wostools-750 px-4 py-2 w-full text-wostools-text-primary text-sm">
                                    <option :value="null">Not required</option>
                                    <option v-for="level in 40" :key="level" :value="level">
                                        Furnace {{ level }}
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button @click="transferStore.createTransferLink()" :disabled="transferStore.isLoading"
                        class="col-span-4 rounded-xl ...">
                        <template v-if="transferStore.isLoading">
                            Creating...
                        </template>
                        <template v-else>
                            Create link
                        </template>
                    </button>
                </div>
            </div>
        </div>
</template>

<script setup>
import { useTransferStore } from '@/stores/transfer.js';
// (Seus outros imports, como NavBar...)

// 1. Inicializa a store
const transferStore = useTransferStore();

// Função para adicionar um novo campo de convite
function addInvite() {
    transferStore.newTransferData.alliance_invites.push({ tag: '', spots: null });
}

// Função para remover um campo de convite
function removeInvite(index) {
    transferStore.newTransferData.alliance_invites.splice(index, 1);
}

// (Opcional) Limpar o formulário caso o usuário tenha voltado para esta página
// import { onMounted } from 'vue';
// onMounted(() => {
//     transferStore.resetNewData(); 
// });

// Você NÃO precisa mais de um 'ref' local para os dados do formulário.
// A store cuida disso.
</script>