import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { router } from '@/router'
import { getPlayerInfo } from '@/services/wosapi'

export const useTransferStore = defineStore('transfer', {

    state: () => ({
        newTransferData: {
            title: '',
            description: '',
            // O estado inicial deve ser um array com um item
            alliance_invites: [{ tag: '', spots: null }],
            requirements: {
                max_power: null,
                min_furnace_level: null,
                max_labyrinth: null
            }
        },
        // Você precisa do state completo para a store funcionar
        linkData: [],
        loading: false,
        message: null,
    }),

    getters: {
        isLoading: (state) => state.loading,
    },

    actions: {
        updateNewData(payload) {
            this.newTransferData = { ...this.newTransferData, ...payload };
        },

        updateRequirement(key, value) {
            if (Object.prototype.hasOwnProperty.call(this.newTransferData.requirements, key)) {
                this.newTransferData.requirements[key] = value;
            }
        },

        resetNewData() {
            this.newTransferData = {
                title: '',
                description: '',
                alliance_invites: [{ tag: '', spots: null }], // <-- CORRIGIDO
                requirements: {
                    min_power: null,
                    min_furnace_level: null,
                    min_labyrinth: null
                }
            };
            this.linkData = [];
        },

        async createTransferLink() {
            this.loading = true;
            this.message = null;
            const id = this.generateUniqueCode(8); // Este será seu slug/ID principal

            try {
                // --- 1. Processar Payloads (Re-adicionado) ---

                // Processa o array de convites para o formato JSON {tag: spots}
                const invitesPayload = this.newTransferData.alliance_invites.reduce((acc, invite) => {
                    if (invite.tag && (invite.spots !== null && invite.spots !== '')) {
                        acc[invite.tag.toUpperCase()] = Number(invite.spots);
                    }
                    return acc;
                }, {});

                // Filtra requisitos (para não enviar 'null' para o DB)
                const requirementsPayload = {};
                for (const key in this.newTransferData.requirements) {
                    const value = this.newTransferData.requirements[key];
                    if (value !== null && value !== '' && value > 0) {
                        requirementsPayload[key] = Number(value);
                    }
                }

                // --- 2. Insere na tabela 'transfer_lists' ---
                const { data, error } = await supabase
                    .from('transfer_lists')
                    .insert([
                        {
                            id: id, // O seu ID/slug gerado
                            title: this.newTransferData.title,
                            description: this.newTransferData.description,
                            alliance_invites: invitesPayload, // <-- Payload processado
                            requirements: requirementsPayload, // <-- Payload processado
                        }
                    ])
                    .select()
                    .single();

                // --- 3. Tratamento de Erro e Redirecionamento (CORRIGIDO) ---
                if (error) {
                    // Trata colisão de ID/slug
                    if (error.code === '23505') {
                        console.warn('Slug collision detected, retrying...');
                        return this.createTransferLink(); // Tenta criar novamente com novo ID
                    }
                    throw error; // Joga o erro para o bloco catch
                }

                // Se chegou aqui, 'data' existe e o erro é 'null'
                if (data) {
                    // Redireciona para a nova página
                    router.push({
                        name: 'transfer-view',
                        params: { id: data.id } // data.id será o 'id' que você inseriu
                    });
                } else {
                    throw new Error("Criação falhou, mas nenhum erro foi retornado.");
                }

            } catch (error) {
                console.error('Erro ao criar lista de transferência:', error);
                this.showMessage(error.message || 'Erro ao criar a lista.');
                this.linkData = [];
            } finally {
                this.loading = false;
            }
        },

        async getTransferInvites(listid) {
            this.loading = true;
            this.message = null;
            this.linkData = [];

            try {
                const { data, error } = await supabase
                    .from('transfer_invites')
                    // A query correta para join é uma string única:
                    .select('*, transfer_list_id(*)')
                    .eq('transfer_list_id', listid);

                if (error) throw error;

                if (data) {
                    this.linkData = data; // 'data' agora é um ARRAY [ {..}, {..} ]
                } else {
                    throw new Error('Nenhum convite encontrado para esta lista.');
                }

            } catch (error) {
                console.error('Erro ao buscar convites:', error);
                this.showMessage(error.message || 'Lista não encontrada.');
            } finally {
                this.loading = false;
            }
        },

        // --- Funções Utilitárias (sem alteração) ---
        generateUniqueCode(length = 8) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let code = '';
            for (let i = 0; i < length; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return code;
        },

        showMessage(messageSend) {
            this.message = messageSend;
            setTimeout(() => {
                this.message = null;
            }, 3000);
        },

        async addPlayer(playerData) {
            const dataWOS = await getPlayerInfo(playerData.player_id)

            console.log(dataWOS);
            if (!dataWOS) {
                this.showMessage('Player not found or error fetching data.');
                return;
            } else {
                const { data, error } = await supabase
                    .from('transfer_invites')
                    .insert([
                        {
                            avatar_image: dataWOS.photo_url,
                            fid: dataWOS.player_id,
                            state_id: dataWOS.kid,
                            nickname: dataWOS.player_name,
                            stove_lv: dataWOS.stove_lv,
                            stove_lv_content: dataWOS.stove_lv_content,
                            alliance_target: playerData.alliance_target,
                            transfer_list_id: playerData.transfer_list_id,
                            labyrinth: playerData.labyrinth,
                            power: playerData.power,
                        }
                    ])
                    .select()
                    .single();
            }
        }
    }
})
