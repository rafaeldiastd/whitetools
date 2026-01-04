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

    async createTransferLink(adminPassword) {
      this.loading = true;
      this.clearMessage();
      const id = this.generateUniqueCode(8);
      // Use provided password or fallback to generated (though UI should prevent empty)
      const accessKey = adminPassword || this.generateUniqueCode(6);

      try {
        const invitesPayload = this.newTransferData.alliance_invites.reduce((acc, invite) => {
          if (invite.tag && (invite.spots !== null && invite.spots !== '')) {
            acc[invite.tag.toUpperCase()] = {
              spots: Number(invite.spots),
              password: this.generateUniqueCode(6) // Generate alliance password
            };
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
            return this.createTransferLink(adminPassword);
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
        // Safe fetch via RPC
        const { data, error } = await supabase
          .rpc('get_transfer_list_details', { list_id: listid })
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            throw new Error('Transfer list not found.');
          }
          throw error;
        }

        // Separate fetch for players
        const { data: invitesData, error: invitesError } = await supabase
          .from('transfer_invites')
          .select('*')
          .eq('transfer_list_id', listid);

        if (invitesError) throw invitesError;

        if (data) {
          this.currentList = data; // Already sanitized by RPC
          this.currentInvites = invitesData || [];
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
          .rpc('verify_transfer_access', { list_id: listId, key: key });

        if (error || !data) {
          this.accessGranted = false;
          this.showMessage({ text: 'Invalid Access Key', type: 'error' });
          return false;
        }

        this.accessGranted = true;
        this.showMessage({ text: 'Access Granted', type: 'success' });
        return true;

      } catch (error) {
        console.error('Error verifying access key:', error);
        this.showMessage({ text: 'Error verifying access key' });
        return false;
      }
    },

    async verifyAlliancePassword(tag, password, listId) {
      try {
        // Check if password matches via JSON path query
        // Note: tag must be sanitized or properly escaped if used in path
        // Supabase/Postgrest arrow operator '->' gets JSON object field
        const { data, error } = await supabase
          .rpc('verify_alliance_password', { list_id: listId, tag: tag, key: password });

        if (error || !data) {
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error verifying alliance password:', error);
        return false;
      }
    },

    // New helper to fetch sensitive data for Admin view
    async fetchAdminDetails(listId) {
      if (!this.accessGranted) return null;
      try {
        const { data, error } = await supabase
          .from('transfer_lists')
          .select('alliance_invites')
          .eq('id', listId)
          .single();

        if (data && data.alliance_invites) {
          return data.alliance_invites; // Contains passwords
        }
        return null;
      } catch (error) {
        console.error("Error fetching admin details", error);
        return null;
      }
    },

    async updateInviteType(fid, listId, type) {
      // Optimistic update
      const invite = this.currentInvites.find(i => i.fid === fid);
      const previousType = invite ? invite.type_invite : null;
      if (invite) invite.type_invite = type;

      try {
        const { error } = await supabase
          .from('transfer_invites')
          .update({ type_invite: type })
          .eq('fid', fid)
          .eq('transfer_list_id', listId);

        if (error) throw error;
      } catch (error) {
        console.error('Error updating invite type:', error);
        // Revert on error
        if (typeof invite !== 'undefined' && invite) invite.type_invite = previousType;
        this.showMessage({ text: 'Error updating invite type.', type: 'error' });
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
        type_invite: playerData.type_invite || 'comum',
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

    async updateTransferListSettings(listId, payload) {
      this.loading = true;
      try {
        const { error } = await supabase
          .from('transfer_lists')
          .update(payload)
          .eq('id', listId);

        if (error) throw error;
        this.showMessage({ text: 'Settings updated successfully!', type: 'success' });
        return true;
      } catch (error) {
        console.error('Error updating settings:', error);
        this.showMessage({ text: 'Error updating settings.', type: 'error' });
        return false;
      } finally {
        this.loading = false;
      }
    },

  }
})