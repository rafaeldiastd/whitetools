import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { router } from '@/router'
import { getPlayerInfo } from '@/services/wosapi'

// Um estado inicial padrão para newTransferData, para ser reutilizado no reset
const getInitialNewData = () => ({
  title: '',
  description: '',
  alliance_invites: [{ tag: '', spots: null }],
  requirements: {
    max_power: null,
    min_furnace_level: null,
    max_labyrinth: null
  }
});

export const useTransferStore = defineStore('transfer', {

  state: () => ({
    newTransferData: getInitialNewData(),
    loading: false,
    // Mensagem agora é um objeto para suportar tipos (error, success, info)
    message: { text: null, type: 'info' },

    currentList: null, // Para guardar os detalhes da lista (título, ID, requisitos)
    currentInvites: [], // Para guardar a lista de jogadores
  }),

  getters: {
    isLoading: (state) => state.loading,
    getMessage: (state) => state.message,
  },

  actions: {
    // --- AÇÕES DE MENSAGEM ---
    /**
     * Define uma mensagem de feedback para o usuário.
     * @param {object} payload - { text, type = 'error', duration = 5000 }
     */
    showMessage({ text, type = 'error', duration = 5000 }) {
      this.message = { text, type };
      
      // Limpa a mensagem após 'duration' milissegundos
      if (duration) {
        setTimeout(() => {
          this.clearMessage();
        }, duration);
      }
    },

    /**
     * Limpa a mensagem de feedback.
     */
    clearMessage() {
      this.message = { text: null, type: 'info' };
    },

    // --- AÇÕES DE FORMULÁRIO ---
    updateNewData(payload) {
      this.newTransferData = { ...this.newTransferData, ...payload };
    },

    updateRequirement(key, value) {
      if (Object.prototype.hasOwnProperty.call(this.newTransferData.requirements, key)) {
        this.newTransferData.requirements[key] = value;
      }
    },

    resetNewData() {
      // CORRIGIDO: Usa a função helper para garantir consistência
      this.newTransferData = getInitialNewData();
    },

    // --- AÇÕES ASYNC (BANCO DE DADOS) ---

    async createTransferLink() {
      this.loading = true;
      this.clearMessage(); // CORRIGIDO: Usa a nova action
      const id = this.generateUniqueCode(8);

      try {
        // --- 1. Processar Payloads ---
        const invitesPayload = this.newTransferData.alliance_invites.reduce((acc, invite) => {
          if (invite.tag && (invite.spots !== null && invite.spots !== '')) {
            acc[invite.tag.toUpperCase()] = Number(invite.spots);
          }
          return acc;
        }, {});

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
              id: id,
              title: this.newTransferData.title,
              description: this.newTransferData.description,
              alliance_invites: invitesPayload,
              requirements: requirementsPayload,
            }
          ])
          .select()
          .single();

        // --- 3. Tratamento de Erro e Redirecionamento ---
        if (error) {
          if (error.code === '23505') {
            console.warn('Slug collision detected, retrying...');
            return this.createTransferLink();
          }
          throw error;
        }

        if (data) {
          // Redireciona para a nova página
          router.push({
            name: 'transfer-view',
            params: { id: data.id }
          });
        } else {
          throw new Error("Criação falhou, mas nenhum erro foi retornado.");
        }

      } catch (error) {
        console.error('Erro ao criar lista de transferência:', error);
        // CORRIGIDO: Usa a nova action
        this.showMessage({ text: error.message || 'Erro ao criar a lista.' });
        // REMOVIDO: this.linkData = []; (não existe no state)
      } finally {
        this.loading = false;
      }
    },

    async getTransferInvites(listid) {
      this.loading = true;
      this.clearMessage(); // CORRIGIDO
      this.currentList = null;
      this.currentInvites = [];

      try {
        const { data, error } = await supabase
          .from('transfer_lists')
          .select(`
            *,
            transfer_invites(*)
          `)
          .eq('id', listid)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Lista de transferência não encontrada.');
          }
          throw error;
        }

        if (data) {
          const { transfer_invites, ...listDetails } = data;
          this.currentList = listDetails;
          this.currentInvites = transfer_invites || []; // Garante que seja um array
        } else {
          throw new Error('Lista de transferência não encontrada.');
        }

      } catch (error) {
        console.error('Erro ao buscar dados da lista:', error);
        this.showMessage({ text: error.message || 'Lista não encontrada.' }); // CORRIGIDO
      } finally {
        this.loading = false;
      }
    },

    async addPlayer(playerData) {
      this.loading = true;
      this.clearMessage(); // CORRIGIDO

      // 1. Busca dados externos
      const dataWOS = await getPlayerInfo(playerData.player_id);

      if (!dataWOS) {
        this.showMessage({ text: 'Jogador não encontrado ou erro ao buscar dados.' }); // CORRIGIDO
        this.loading = false;
        return;
      }

      // 2. Prepara o objeto para inserção
      const newInvite = {
        avatar_image: dataWOS.photo_url,
        fid: dataWOS.player_id,
        state_id: dataWOS.kid,
        nickname: dataWOS.player_name,
        stove_lv: dataWOS.stove_lv,
        stove_lv_content: dataWOS.stove_lv_content,
        // Dados vindos do formulário
        alliance_target: playerData.alliance_target,
        transfer_list_id: playerData.transfer_list_id,
        labyrinth: playerData.labyrinth,
        power: playerData.power,
      };

      try {
        // 3. Insere no Supabase
        const { data, error } = await supabase
          .from('transfer_invites')
          .insert([newInvite])
          .select()
          .single();

        if (error) throw error;

        // 4. Atualiza o estado local
        if (data) {
          this.currentInvites.push(data);
          this.showMessage({ text: 'Jogador adicionado com sucesso!', type: 'success' }); // Adicionado feedback de sucesso
        }

        // REMOVIDO: router.push(...)
        // O componente que exibe 'currentInvites' será atualizado automaticamente.

      } catch (error) {
        console.error('Erro ao adicionar jogador:', error);
        this.showMessage({ text: 'Erro ao adicionar jogador.' }); // CORRIGIDO
      } finally {
        this.loading = false;
      }
    },

    async removePlayer(inviteId, listId) {
      this.loading = true;
      this.clearMessage(); // CORRIGIDO

      try {
        const { error } = await supabase
          .from('transfer_invites')
          .delete()
          .eq('fid', inviteId)
          .eq('transfer_list_id', listId);

        if (error) throw error;

        // CORRIGIDO: Lógica de atualização do estado
        // Filtra o array local para remover o jogador
        this.currentInvites = this.currentInvites.filter(
          (player) => player.fid !== inviteId
        );
        
        this.showMessage({ text: 'Jogador removido com sucesso!', type: 'success' }); // Adicionado feedback

        // REMOVIDO: router.push(...)

      } catch (error) {
        console.error('Erro ao remover jogador:', error);
        this.showMessage({ text: 'Erro ao remover jogador.' }); // CORRIGIDO
      } finally {
        this.loading = false;
      }
    },

    // --- Funções Utilitárias ---
    generateUniqueCode(length = 8) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    },

  }
})