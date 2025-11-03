<template>
    <div class="flex gap-2 items-center justify-center px-4 pt-4">
        <NavBar />
    </div>
    <div class="flex flex-col items-center p-6">
        <a href="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px] pb-6">
        </a>
        <div class="flex flex-col gap-4 mx-4 rounded-xl bg-wostools-750 mb-30 p-6">
            <div>
                <p class="text-wostools-text-secondary text-xs py-4">So that the transfer minister and the State can
                    organize the invitations, you can create a link to share with them. Fill in a title, description,
                    add each alliance and its number of invitations (seats) and enter the requirements to receive an
                    invitation</p>
            </div>
            <div class="grid gap-4 grid-cols-4">
                <div class="flex flex-col gap-1 col-span-4">
                    <label class="text-sm" for="linkTitle">Title</label>
                    <input id="linkTitle" type="text" v-model="transferStore.newTransferData.title"
                        class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" />
                </div>

                <div class="flex flex-col gap-1 col-span-4">
                    <label class="text-sm" for="linkDescription">Description</label>
                    <textarea id="linkDescription" v-model="transferStore.newTransferData.description"
                        class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm"></textarea>
                </div>

                <div class="flex flex-col gap-2 col-span-4">
                    <label class="text-sm">Alliances and Invites</label>
                    <div v-for="(invite, index) in transferStore.newTransferData.alliance_invites" :key="index"
                        class="col-span-4 grid grid-cols-12 gap-2 items-center">
                        <input type="text" v-model="invite.tag" placeholder="TAG" maxlength="3"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm col-span-5 uppercase"
                            required>
                        <input type="number" v-model="invite.spots" placeholder="Spots"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm col-span-5" required>
                        <button @click="removeInvite(index)"
                            class="w-full h-full col-span-2 rounded-xl border-b-3 hover:cursor-pointer hover:from-red-600 hover:to-red-800 border-red-900 bg-linear-to-t from-red-500 to-red-700 shadow-md inset-shadow-sm inset-shadow-white/60 text-red-200 text-2xl">
                            -
                        </button>
                    </div>
                    <button @click="addInvite"
                        class="col-span-4 rounded-lg bg-wostools-800 py-2 text-sm hover:bg-wostools-700 text-wostools-text-secondary">
                        + Add Alliance
                    </button>
                </div>


            </div>

            <div class="flex flex-col gap-2 col-span-4 ">
                <label class="text-sm">Requirements</label>
                <div class="flex flex-col gap-4 p-4 rounded-xl bg-wos-800">
                    <div class="flex flex-col gap-1">
                        <label class="text-sm text-wos-100" for="req-lab">Max Labyrinth</label>
                        <input id="req-lab" type="number" placeholder="e.g.: 1450"
                            v-model.number="transferStore.newTransferData.requirements.max_labyrinth"
                            class="rounded-lg bg-white px-4 py-2 w-full text-wostools-900 text-sm" required>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm text-wos-100" for="req-power">Max Power</label>
                        <input id="req-power" type="text" v-model="powerInput" @focus="onPowerFocus" @blur="onPowerBlur"
                            placeholder="e.g.: 10M, 12.3M or 10000000"
                            class="rounded-lg bg-white px-4 py-2 w-full text-wostools-900 text-sm" required>
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-sm text-wos-100" for="req-furnace">Min Furnace Level</label>
                        <select id="req-furnace"
                            v-model.number="transferStore.newTransferData.requirements.min_furnace_level"
                            class="rounded-lg bg-white px-4 py-2 w-full text-wostools-900 text-sm">
                            <option v-for="option in furnaceOptions" :key="option.text" :value="option.value">
                                {{ option.text }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>


            <button @click="transferStore.createTransferLink()" :disabled="transferStore.isLoading"
                class="w-full col-span-3 rounded-xl border-b-3 hover:cursor-pointer hover:from-wosbutton-yh50 hover:to-wosbutton-yh100 border-wosbutton-yb bg-linear-to-t from-wosbutton-y50 to-wosbutton-y100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-wosbutton-yb">
                <template v-if="transferStore.isLoading">
                    Creating...
                </template>
                <template v-else>
                    Create link
                </template>
            </button>
        </div>
    </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import { ref } from 'vue'; // Importe o 'ref'
import { useTransferStore } from '@/stores/transfer.js';

// 1. Instanciar a store (apenas uma vez)
const transferStore = useTransferStore();


// Array para preencher as opções da Fornalha
const furnaceOptions = [
    { text: 'Not required', value: null },
    { text: 'Furnace 30', value: 30 }
];

const baseLevel = 31; // Nível inicial do FC1
const numCamps = 8;   // De FC1 a FC7

// Gera as opções de FC1 a FC7
for (let i = 0; i < numCamps; i++) {
    const campNumber = i + 1;
    const startLevel = baseLevel + (i * 5); // 31, 36, 41...

    furnaceOptions.push({
        text: `FC${campNumber}`,
        value: startLevel // Salva o nível mínimo do "camp"
    });
}


// --- Funções de Formatação (copiadas da sua implementação) ---

const numberFormatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 3
});

function simplifyNumber(value) {
    const number = parseFloat(value);
    if (isNaN(number)) {
        // Retorna string vazia ou o valor original se não for número
        return value === null || isNaN(number) ? '' : value;
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

// --- Lógica dos Inputs de Requisitos ---

// 2. Refs para controlar o TEXTO dos inputs
// Inicializa com o valor formatado que já possa existir na store
const labyrinthInput = ref(
    simplifyNumber(transferStore.newTransferData.requirements.max_labyrinth)
);
const powerInput = ref(
    simplifyNumber(transferStore.newTransferData.requirements.max_power)
);

// 3. Handlers para Labyrinth
const onLabyrinthFocus = () => {
    // Ao focar, mostra o número real
    if (transferStore.newTransferData.requirements.max_labyrinth) {
        labyrinthInput.value = transferStore.newTransferData.requirements.max_labyrinth;
    }
};
const onLabyrinthBlur = () => {
    // Ao sair, parseia o valor digitado (ex: "1.5M")
    const parsedValue = parseSimplifiedNumber(labyrinthInput.value);
    // Salva o NÚMERO REAL na store
    transferStore.newTransferData.requirements.max_labyrinth = parsedValue;
    // Atualiza o input para exibir o texto formatado (ou '' se inválido)
    labyrinthInput.value = parsedValue ? simplifyNumber(parsedValue) : '';
};

// 4. Handlers para Power
const onPowerFocus = () => {
    // Ao focar, mostra o número real
    if (transferStore.newTransferData.requirements.max_power) {
        powerInput.value = transferStore.newTransferData.requirements.max_power;
    }
};
const onPowerBlur = () => {
    // Ao sair, parseia o valor digitado (ex: "10M")
    const parsedValue = parseSimplifiedNumber(powerInput.value);
    // Salva o NÚMERO REAL na store
    transferStore.newTransferData.requirements.max_power = parsedValue;
    // Atualiza o input para exibir o texto formatado (ou '' se inválido)
    powerInput.value = parsedValue ? simplifyNumber(parsedValue) : '';
};


// --- Lógica dos Convites (Alliance Invites) ---
function addInvite() {
    transferStore.showMessage('New Invite added!');
    transferStore.newTransferData.alliance_invites.push({ tag: '', spots: null });
}

function removeInvite(index) {
    transferStore.newTransferData.alliance_invites.splice(index, 1);
}

</script>