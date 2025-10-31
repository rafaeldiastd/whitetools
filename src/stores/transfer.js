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
        loading: false,
        message: null,

        currentList: null, // Para guardar os detalhes da lista (título, ID, requisitos)
        currentInvites: [], // Para guardar a lista de jogadores (o que era seu linkData)
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
            this.currentList = null;    // Reseta os dados
            this.currentInvites = [];   // Reseta os dados

            try {
                // 1. Busca o "PAI" (a lista) e pede os "FILHOS" (os invites)
                const { data, error } = await supabase
                    .from('transfer_lists') // <-- Tabela principal
                    .select(`
                *,
                transfer_invites(*)
            `) // <-- Pede os detalhes da lista E os invites relacionados
                    .eq('id', listid) // Filtra pelo ID da lista
                    .single(); // Esperamos APENAS um resultado

                if (error) {
                    // Se o erro for 'PGRST116', significa que a lista não foi encontrada
                    if (error.code === 'PGRST116') {
                        throw new Error('Lista de transferência não encontrada.');
                    }
                    throw error;
                }

                if (data) {
                    // 'data' agora é o objeto da lista completa
                    // Ex: { id: '...', title: '...', requirements: {...}, transfer_invites: [...] }

                    // Separa os dados no state
                    const { transfer_invites, ...listDetails } = data;

                    this.currentList = listDetails; // Guarda os detalhes da lista
                    this.currentInvites = transfer_invites; // Guarda os convites (pode ser [])

                } else {
                    // Isso não deve acontecer se o .single() funcionar, mas é uma boa checagem
                    throw new Error('Lista de transferência não encontrada.');
                }

            } catch (error) {
                console.error('Erro ao buscar dados da lista:', error);
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

        // Sua ação addPlayer está quase correta, mas ela não atualiza o state.
        // Você pode adicionar o novo jogador manualmente ou apenas recarregar a lista.
        async addPlayer(playerData) {
            this.loading = true; // Adicionado
            const dataWOS = await getPlayerInfo(playerData.player_id)

            if (!dataWOS) {
                this.showMessage('Player not found or error fetching data.');
                this.loading = false; // Adicionado
                return;
            }

            // O 'try...catch' é uma boa prática aqui
            try {
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

                if (error) throw error;

                // Se funcionou, adiciona o novo jogador à lista local
                if (data) {
                    this.currentInvites.push(data);
                    this.showMessage('Player adicionado!');
                }

            } catch (error) {
                console.error('Erro ao adicionar jogador:', error);
                this.showMessage(error.message || 'Erro ao salvar jogador.');
            } finally {
                this.loading = false;
            }
        }
    }
})
