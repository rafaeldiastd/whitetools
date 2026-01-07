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
    max_power: null,
    min_furnace_level: null,
    max_labyrinth: null
  },
  responsible_id: '',
  responsible_data: null
});

// Rules for blocking players
const BLOCKED_RULES = {
  names: {},
  states: {
    "1898": "This state is blocked. Congrats piece of shit Guarilha."
  }
};

export const useTransferStore = defineStore('transfer', {

  state: () => ({
    newTransferData: getInitialNewData(),
    loading: false,
    message: { text: null, type: 'info' },
    linkData: null, // Stores the created link data (id, access_key, etc.)
    accessGranted: false, // Controls admin access
    isAllianceMod: false, // Controls global alliance access

    currentList: null, // Para guardar os detalhes da lista (título, ID, requisitos)
    currentInvites: [], // Para guardar a lista de jogadores

    // Modal de Bloqueio (Igual ao Schedule)
    blockModal: {
      visible: false,
      message: '',
      image: null
    }
  }),

  getters: {
    isLoading: (state) => state.loading,
    getMessage: (state) => state.message,
    isAdmin: (state) => state.accessGranted,
    isAllianceGlobal: (state) => state.isAllianceMod,
  },

  actions: {
    // --- ACTIONS FOR BLOCK MODAL ---
    showBlockModal(message, image = null) {
      this.blockModal = { visible: true, message, image };
    },

    closeBlockModal() {
      this.blockModal = { visible: false, message: '', image: null };
    },

    checkBlocked(playerInfo) {
      if (!playerInfo) return false;

      // Helper to process rule (string or object)
      const processBlock = (rule) => {
        if (typeof rule === 'string') {
          return { message: rule, image: null };
        }
        return rule;
      };

      // Check by Name
      if (playerInfo.player_name) {
        const rule = Object.entries(BLOCKED_RULES.names).find(([name, rule]) =>
          name.toLowerCase() === playerInfo.player_name.toLowerCase()
        )?.[1];

        if (rule) {
          return processBlock(rule);
        }
      }

      // Check by State (Kid)
      if (playerInfo.kid) {
        const rule = BLOCKED_RULES.states[String(playerInfo.kid)];
        if (rule) {
          return processBlock(rule);
        }
      }

      return false; // Not blocked
    },

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

    async createTransferLink(adminPassword, alliancePassword) {
      this.loading = true;
      this.clearMessage();
      const id = this.generateUniqueCode(8);
      // Use provided password or fallback to generated (though UI should prevent empty)
      const accessKey = adminPassword || this.generateUniqueCode(6);

      // Use provided alliance password or generate a shared one
      const sharedAlliancePass = alliancePassword || this.generateUniqueCode(6);

      try {
        const invitesPayload = this.newTransferData.alliance_invites.reduce((acc, invite) => {
          if (invite.tag && (invite.spots !== null && invite.spots !== '')) {
            acc[invite.tag.toUpperCase()] = {
              spots: Number(invite.spots),
              password: sharedAlliancePass // Use the SAME password for all
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
              responsible_id: this.newTransferData.responsible_id,
              responsible_data: this.newTransferData.responsible_data
            }
          ])
          .select()
          .single();

        if (error) {
          if (error.code === '23505') {
            console.warn('Slug collision detected, retrying...');
            return this.createTransferLink(adminPassword, alliancePassword);
          }
          throw error;
        }

        if (data) {
          this.linkData = {
            ...data,
            generated_link: `${window.location.origin}/transfer/${data.id}`,
            access_key: accessKey,
            alliance_password: sharedAlliancePass // Pass back for display
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

    // Updated to handle global verification (verifies against the first available tag)
    async verifyAlliancePasswordGlobal(password, listId) {
      // We need at least one alliance tag to verify against the RPC
      // RPC check: list_id, tag, key. 
      // Since all alliances share the same key now, checking against any works.
      if (!this.currentList || !this.currentList.alliance_invites) {
        return false;
      }

      const tags = Object.keys(this.currentList.alliance_invites);
      if (tags.length === 0) return false;

      const tagToVerify = tags[0]; // Pick the first one

      try {
        const { data, error } = await supabase
          .rpc('verify_alliance_password', { list_id: listId, tag: tagToVerify, key: password });

        if (error || !data) {
          return false;
        }

        this.isAllianceMod = true; // Global flag
        return true;
      } catch (error) {
        console.error('Error verifying alliance password:', error);
        return false;
      }
    },

    // Kept for backward compatibility or if using tag specific
    async verifyAlliancePassword(tag, password, listId) {
      try {
        const { data, error } = await supabase
          .rpc('verify_alliance_password', { list_id: listId, tag: tag, key: password });

        if (error || !data) {
          return false;
        }

        // If success, we also set global Mod because passwords are same
        this.isAllianceMod = true;
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

    async updatePlayer(player) {
      // Optimistic update is already happening via v-model in component, 
      // but we need to ensure the DB is updated.
      try {
        const { error } = await supabase
          .from('transfer_invites')
          .update({
            labyrinth: player.labyrinth,
            power: player.power,
            // stove_lv: player.stove_lv // If we decide to allow editing stove_lv later
          })
          .eq('fid', player.fid)
          .eq('transfer_list_id', player.transfer_list_id);

        if (error) throw error;
        this.showMessage({ text: 'Player updated successfully', type: 'success' });
      } catch (error) {
        console.error('Error updating player:', error);
        this.showMessage({ text: 'Error updating player', type: 'error' });
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

    async updatePlayerStatus(fid, listId, status) {
      // Optimistic update
      const invite = this.currentInvites.find(i => i.fid === fid);
      const previousStatus = invite ? invite.status : null;
      if (invite) invite.status = status;

      try {
        const { error } = await supabase
          .from('transfer_invites')
          .update({ status: status })
          .eq('fid', fid)
          .eq('transfer_list_id', listId);

        if (error) throw error;
        // this.showMessage({ text: 'Status updated successfully', type: 'success' });
      } catch (error) {
        console.error('Error updating player status:', error);
        // Revert on error
        if (invite) invite.status = previousStatus;
        this.showMessage({ text: 'Error updating status.', type: 'error' });
      }
    },

  }
})