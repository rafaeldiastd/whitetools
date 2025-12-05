<template>
    <div class="flex flex-col items-center p-6">
        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px] pb-6">
        </router-link>
        <div class="flex flex-col gap-4 mx-4 rounded-xl bg-wostools-750 mb-30 w-full max-w-2xl">
            <div v-if="!hiveStore.linkData" class="p-6">
                <div>
                    <p class="text-wostools-text-secondary text-xs py-4">Easily coordinate alliance events without messy
                        spreadsheets or endless chats. Ensure everyone knows the exact bonus days for construction,
                        research, and troop training, maximizing efficiency and teamwork.<br><br>
                        With a secure access key, you stay in full control of sign-ups and changes, keeping your
                        strategy organized and stress-free.</p>
                </div>
                <div class="py-4 grid gap-4 grid-cols-4">
                    <div class="col-span-4">
                        <BaseInput id="linkTitle" label="Title" v-model="newLinkData.title" maxlength="20" />
                    </div>
                    <div class="flex flex-col gap-1 col-span-4">
                        <label class="text-md" for="linkDescription">Description or Message</label>
                        <textarea id="linkDescription" maxlength="120" v-model="newLinkData.description"
                            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm focus:outline-none focus:ring-2 focus:ring-wosbutton-y50"></textarea>
                    </div>
                    <div class="col-span-2">
                        <BaseInput id="state" label="State" v-model="newLinkData.state" maxlength="4" />
                    </div>
                    <div class="col-span-2">
                        <BaseInput id="alliance" label="Alliance" v-model="newLinkData.alliance" />
                    </div>
                    <div class="col-span-4">
                        <BaseButton @click="createLink" :disabled="loading" class="w-full">
                            <template v-if="loading">
                                Creating...
                            </template>
                            <template v-else>
                                Create link
                            </template>
                        </BaseButton>
                    </div>
                </div>
            </div>

            <LinkCreatedSuccess v-else :access-key="hiveStore.linkData?.access_key"
                :generated-link="hiveStore.linkData?.generated_link" />
        </div>
    </div>
    <Alert v-if="hiveStore.message.text" :message="hiveStore.message.text" :type="hiveStore.message.type" />
</template>

<script setup>
import { ref } from 'vue';
import { useHiveStore } from '@/stores/bearhive.js';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import LinkCreatedSuccess from '@/components/LinkCreatedSuccess.vue';
import Alert from '@/components/Alert.vue';

const hiveStore = useHiveStore();

const loading = ref(false);
const newLinkData = ref({
    title: '',
    description: '',
    state: '',
    alliance: ''
});

function createLink() {
    loading.value = true;
    hiveStore.createLinkHive(newLinkData.value)
        .catch(error => {
            console.error(error);
            hiveStore.showMessage({ text: 'Error creating hive', type: 'error' });
        })
        .finally(() => {
            loading.value = false;
        });
}
</script>