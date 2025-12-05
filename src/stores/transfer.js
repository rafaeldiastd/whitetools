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
    message: { text: null, type: 'info' },
    linkData: null, // Stores the created link data (id, access_key, etc.)
    accessGranted: false, // Controls admin access

    currentList: null, // Para guardar os detalhes da lista (título, ID, requisitos)
    currentInvites: [], // Para guardar a lista de jogadores
  }),

  getters: {
    isLoading: (state) => state.loading,
    getMessage: (state) => state.message,
    isAdmin: (state) => state.accessGranted,
  },

  actions: {
    // --- AÇÕES DE MENSAGEM ---
    showMessage({ text, type = 'error', duration = 5000 }) {
      this.message = { text, type };

      if (duration) {
        setTimeout(() => {
          this.clearMessage();
        }, duration);
      }
    },

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
      this.newTransferData = getInitialNewData();
      this.linkData = null;
    },

    // --- AÇÕES ASYNC (BANCO DE DADOS) ---

    async createTransferLink() {
      this.loading = true;
      this.clearMessage();
      const id = this.generateUniqueCode(8);
      const accessKey = this.generateUniqueCode(6);

      try {
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

        const { data, error } = await supabase
          .from('transfer_lists')
          .insert([
            {
              id: id,
              title: this.newTransferData.title,
              description: this.newTransferData.description,
              alliance_invites: invitesPayload,
              requirements: requirementsPayload,
              access_key: accessKey,
            }
          ])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            console.warn('Slug collision detected, retrying...');
            return this.createTransferLink();
          }
          throw error;
        }

        if (data) {
          this.linkData = {
            ...data,
            generated_link: `${window.location.origin}/transfer/${data.id}`,
            access_key: accessKey
          };
          this.showMessage({ text: 'Link created successfully!', type: 'success' });
        } else {
          throw new Error("Creation failed but no error was returned.");
        }

      } catch (error) {
        console.error('Error creating transfer list:', error);
        this.showMessage({ text: error.message || 'Error creating transfer list.' });
      } finally {
        this.loading = false;
      }
    },

    async getTransferInvites(listid) {
      this.loading = true;
      this.clearMessage();
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
            throw new Error('Transfer list not found.');
          }
          throw error;
        }

        if (data) {
          const { transfer_invites, ...listDetails } = data;
          this.currentList = listDetails;
          this.currentInvites = transfer_invites || [];
        } else {
          throw new Error('Transfer list not found.');
        }

      } catch (error) {
        console.error('Error fetching transfer list:', error);
        this.showMessage({ text: error.message || 'Lista não encontrada.' });
      } finally {
        this.loading = false;
      }
    },

    async verifyAccessKey(key, listId) {
      try {
        const { data, error } = await supabase
          .from('transfer_lists')
          .select('access_key')
          .eq('id', listId)
          .single();

        if (error) throw error;

        if (data.access_key === key) {
          this.accessGranted = true;
          this.showMessage({ text: 'Access Granted', type: 'success' });
          return true;
        } else {
          this.accessGranted = false;
          this.showMessage({ text: 'Invalid Access Key', type: 'error' });
          return false;
        }
      } catch (error) {
        console.error('Error verifying access key:', error);
        this.showMessage({ text: 'Error verifying access key' });
        return false;
      }
    },

    async addPlayer(playerData) {
      this.loading = true;
      this.clearMessage();

      const dataWOS = await getPlayerInfo(playerData.player_id);

      if (!dataWOS) {
        this.showMessage({ text: 'Player not found or error fetching data.' });
        this.loading = false;
        return;
      }

      const newInvite = {
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
      };

      try {
        const { data, error } = await supabase
          .from('transfer_invites')
          .insert([newInvite])
          .select()
          .single();

        if (error) throw error;

        if (data) {
          this.currentInvites.push(data);
          this.showMessage({ text: 'Player added successfully!', type: 'success' });
        }

      } catch (error) {
        console.error('Error adding player:', error);
        this.showMessage({ text: 'Error adding player.' });
      } finally {
        this.loading = false;
      }
    },

    async removePlayer(inviteId, listId) {
      this.loading = true;
      this.clearMessage();

      try {
        const { error } = await supabase
          .from('transfer_invites')
          .delete()
          .eq('fid', inviteId)
          .eq('transfer_list_id', listId);

        if (error) throw error;

        this.currentInvites = this.currentInvites.filter(
          (player) => player.fid !== inviteId
        );

        this.showMessage({ text: 'Player removed successfully!', type: 'success' });

      } catch (error) {
        console.error('Error removing player:', error);
        this.showMessage({ text: 'Error removing player.' });
      } finally {
        this.loading = false;
      }
    },

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