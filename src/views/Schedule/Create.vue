<template>
    <div class="flex gap-2 items-center justify-center px-4 pt-4">
        <NavBar />
    </div>
    <div>
        <div class="flex flex-col gap-4 mx-4 border-4 border-wostools-50 rounded-xl p-6 bg-wostools-700">
            <div
                class="bg-[url(@/assets/images/share-link-schedule.png)] py-3 px-5 rounded-xl min-h-20 bg-cover bg-center flex gap-3 items-center">
                <img src="@/assets/images/flag.png" alt="">
                <div class="flex flex-col gap-1 leading-none">
                    <p class="max-w-40">Share the link with your alliance</p>
                </div>
            </div>

            <div v-if="!scheduleStore.linkData">
                <div>
                    <p class="text-wostools-text-secondary text-xs py-4">Easily coordinate alliance events without messy
                        spreadsheets or endless chats. Ensure everyone knows the exact bonus days for construction,
                        research, and troop training, maximizing efficiency and teamwork.<br><br>
                        With a secure access key, you stay in full control of sign-ups and changes, keeping your
                        strategy organized and stress-free.</p>
                </div>
                <div class="py-4 grid gap-4 grid-cols-3">
                    <div class="flex flex-col gap-1 col-span-3">
                        <label class="text-md" for="linkTitle">Title for the link</label>
                        <input id="linkTitle" type="text" v-model="newLinkData.title"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" maxlength="20" />
                    </div>
                    <div class="flex flex-col gap-1 col-span-3">
                        <label class="text-md" for="linkDescription">Description or Message</label>
                        <textarea id="linkDescription" maxlength="120" v-model="newLinkData.description"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm"></textarea>
                    </div>
                    <div class="flex flex-col gap-1 col-span-1">
                        <label class="text-md" for="construction">Construction</label>
                        <input id="construction" type="date" v-model="newLinkData.construction_time"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" />
                    </div>
                    <div class="flex flex-col gap-1 col-span-1">
                        <label class="text-md" for="research">Research</label>
                        <input id="research" type="date" v-model="newLinkData.research_time"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" />
                    </div>
                    <div class="flex flex-col gap-1 col-span-1">
                        <label class="text-md" for="training">Training</label>
                        <input id="training" type="date" v-model="newLinkData.training_time"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm" />
                    </div>
                    <button @click="createLink" :disabled="loading"
                        class="col-span-3 rounded-xl border-b-3 hover:cursor-pointer hover:from-wosbutton-yh50 hover:to-wosbutton-yh100 border-wosbutton-yb bg-linear-to-t from-wosbutton-y50 to-wosbutton-y100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-wosbutton-yb">
                        <template v-if="loading">
                            Creating...
                        </template>
                        <template v-else>
                            Create link
                        </template>
                    </button>
                </div>
            </div>

            <div v-else>
                <div class="bg-yellow-100 rounded-xl py-4 px-4 text-yellow-900 text-center text-xs">
                    <span>Remember to save your key – it's essential for managing player sign-ups later! Keep this key
                        safe.</span>
                </div>

                <div class="grid grid-cols-6 gap-3 py-4 items-center">
                    <div class="bg-wostools-800 px-4 py-3 rounded-xl col-span-2 text-center">
                        {{ scheduleStore.linkData?.access_key }}
                    </div>
                    <button @click="copyToClipboard(scheduleStore.linkData?.access_key)"
                        class="col-span-4 rounded-xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50 hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-full">
                        <span>Copy key</span>
                    </button>
                    <div class="bg-wostools-800 p-4 rounded-xl col-span-6">
                        {{ scheduleStore.linkData?.generated_link }}
                    </div>
                    <button @click="copyToClipboard(scheduleStore.linkData?.generated_link)"
                        class="col-span-3 rounded-xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50 hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-full">
                        <span>Copy link</span>
                    </button>
                    <a :href="scheduleStore.linkData?.generated_link"
                        class="col-span-3 text-center rounded-xl border-b-3 hover:cursor-pointer hover:from-wosbutton-bh50 hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 text-white w-full">
                        <span>Access link</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue';
import { ref } from 'vue';
import { copyToClipboard } from '@/services/copyClipboard.js';
import { useScheduleStore } from '@/stores/schedule.js';
const scheduleStore = useScheduleStore();

const loading = ref(false);
const newLinkData = ref({
    title: '',
    construction_time: '',
    research_time: '',
    training_time: '',
});

function createLink() {
    loading.value = true;
    scheduleStore.createLinkSchedule(newLinkData.value).finally(() => {
        loading.value = false;
    });
}
</script>