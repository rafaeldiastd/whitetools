import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useHiveStore = defineStore('hive', {
    state: () => ({
        linkData: null,
        loading: false,
        message: { text: null, type: 'info' }
    }),
    getters: {
        getMessage: (state) => state.message,
    },
    actions: {
        showMessage({ text, type = 'error', duration = 3000 }) {
            this.message = { text, type };
            if (duration) {
                setTimeout(() => {
                    this.message = { text: null, type: 'info' };
                }, duration);
            }
        },

        generateUniqueCode(length = 6) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let code = '';
            for (let i = 0; i < length; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        },

        async createLinkHive(linkData) {
            this.loading = true;
            const accessKey = this.generateUniqueCode(6);

            try {
                const { data, error } = await supabase
                    .from('bearhive')
                    .insert([
                        {
                            title: linkData.title,
                            description: linkData.description,
                            state_number: linkData.state,
                            alliance_name: linkData.alliance,
                            access_key: accessKey
                        }
                    ])
                    .select()
                    .single();

                if (error) throw error;

                if (data) {
                    this.linkData = {
                        ...data,
                        generated_link: `${window.location.origin}/bearhive/view?id=${data.id}`,
                        access_key: accessKey
                    };
                    this.showMessage({ text: 'Hive created successfully!', type: 'success' });
                }

            } catch (error) {
                console.error('Error creating hive:', error);
                this.showMessage({ text: 'Error creating hive', type: 'error' });
            } finally {
                this.loading = false;
            }
        },
    },
})