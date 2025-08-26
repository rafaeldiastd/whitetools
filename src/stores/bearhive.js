import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { getPlayerInfo } from '@/services/wosapi'
import { realtimeService } from '@/services/realtimeService'
import { router } from '@/router'

export const useHiveStore = defineStore('hive', {
    state: () => ({

    }),
    getters: {

    },
    actions: {
        async createLinkHive(linkData) {
            try {
                const { data, error } = await supabase
                    .from('bearhive')
                    .insert([
                        {
                            title: linkData.title,
                            description: linkData.description,
                            state_number: linkData.state,
                            alliance_name: linkData.alliance
                        }
                    ])
                    .select()
                    console.log(data);

            } catch (error) {

            }

        },
    },

})