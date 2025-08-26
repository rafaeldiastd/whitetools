import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'
import { getPlayerInfo } from '@/services/wosapi'
import { realtimeService } from '@/services/realtimeService'
import { router } from '@/router'

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    linkId: null,
    slots: {
      training: [],
      construction: [],
      research: []
    },
    linkData: null,
    message: null,
    // Estados do realtime
    realtimeEnabled: true,
    subscriptionStatus: 'disconnected',
    onlineUsers: [],
    lastUpdate: null,
    pendingChanges: new Set()
  }),

  getters: {
    isRealtimeConnected: (state) => state.subscriptionStatus === 'connected',
    onlineUserCount: (state) => state.onlineUsers.length,
    totalSlots: (state) => {
      return Object.values(state.slots).reduce((total, slots) => total + slots.length, 0)
    },
    bookedSlots: (state) => {
      return Object.values(state.slots).reduce(
        (total, slots) => total + slots.filter(slot => slot.is_booked).length,
        0
      )
    }
  },

  actions: {

    saveAccessToCache(linkId, accessKey) {
      try {
        const cacheData = {
          linkId: linkId,
          accessKey: accessKey,
          timestamp: Date.now(),
          expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 dias em millisegundos
        };

        // Tenta salvar no localStorage se disponível
        if (typeof Storage !== 'undefined' && window.localStorage) {
          localStorage.setItem(`wos_access_${linkId}`, JSON.stringify(cacheData));
        } else {
          // Fallback: salvar em uma variável global/sessionStorage se localStorage não estiver disponível
          if (typeof sessionStorage !== 'undefined' && window.sessionStorage) {
            sessionStorage.setItem(`wos_access_${linkId}`, JSON.stringify(cacheData));
          }
        }
      } catch (error) {
        console.warn('Could not save access to cache:', error);
      }
    },

    // Método para recuperar do cache
    getAccessFromCache(linkId) {
      try {
        let cachedData = null;

        // Tenta recuperar do localStorage primeiro
        if (typeof Storage !== 'undefined' && window.localStorage) {
          const stored = localStorage.getItem(`wos_access_${linkId}`);
          if (stored) {
            cachedData = JSON.parse(stored);
          }
        }

        // Fallback para sessionStorage
        if (!cachedData && typeof sessionStorage !== 'undefined' && window.sessionStorage) {
          const stored = sessionStorage.getItem(`wos_access_${linkId}`);
          if (stored) {
            cachedData = JSON.parse(stored);
          }
        }

        if (cachedData) {
          // Verifica se não expirou (7 dias)
          const now = Date.now();
          const isExpired = (now - cachedData.timestamp) > cachedData.expiresIn;

          if (!isExpired) {
            return {
              accessKey: cachedData.accessKey,
              isValid: true
            };
          } else {
            // Remove cache expirado
            this.clearAccessCache(linkId);
          }
        }

        return null;
      } catch (error) {
        console.warn('Could not retrieve access from cache:', error);
        return null;
      }
    },

    // Método para limpar cache
    clearAccessCache(linkId) {
      try {
        if (typeof Storage !== 'undefined' && window.localStorage) {
          localStorage.removeItem(`wos_access_${linkId}`);
        }
        if (typeof sessionStorage !== 'undefined' && window.sessionStorage) {
          sessionStorage.removeItem(`wos_access_${linkId}`);
        }
      } catch (error) {
        console.warn('Could not clear access cache:', error);
      }
    },

    // Método para verificar cache ao inicializar
    async checkCachedAccess() {
      if (!this.linkId) return false;

      const cachedAccess = this.getAccessFromCache(this.linkId);

      if (cachedAccess) {
        // Verifica se o access key ainda é válido no servidor
        try {
          const isValid = await this.verifyAccessKey(cachedAccess.accessKey, this.linkId, true);
          if (isValid) {
            this.accessGranted = true;
            return true;
          } else {
            // Se não for válido no servidor, limpa o cache
            this.clearAccessCache(this.linkId);
          }
        } catch (error) {
          console.warn('Error verifying cached access key:', error);
          this.clearAccessCache(this.linkId);
        }
      }

      return false;
    },

    // Atualizar o método verifyAccessKey para usar cache
    async verifyAccessKey(key, linkId, isFromCache = false) {
      try {
        const { data, error } = await supabase
          .from('links')
          .select('access_key')
          .eq('id', linkId)
          .single();

        if (error) {
          throw error;
        }

        if (data.access_key === key) {
          this.accessGranted = true;

          // Salva no cache apenas se não veio do cache (evita loop)
          if (!isFromCache) {
            this.saveAccessToCache(linkId, key);
            this.showMessage('Access Granted');
          } else if (isFromCache) {
            this.showMessage('Access restored from cache');
          }

          return true;
        } else {
          this.accessGranted = false;
          this.clearAccessCache(linkId); // Limpa cache inválido

          if (!isFromCache) {
            this.showMessage('Invalid Access Key');
          }
          return false;
        }

      } catch (error) {
        console.error('Erro ao verificar access key:', error);
        this.accessGranted = false;
        this.showMessage('Error verifying access key');
        return false;
      }
    },

    // Método para logout (limpar acesso)
    logout() {
      this.accessGranted = false;
      if (this.linkId) {
        this.clearAccessCache(this.linkId);
      }
      this.showMessage('Access revoked');
    },

    getSlotType(slot) {
      if (this.linkData?.training_time) {
        const slotDate = new Date(slot.slot_date).getTime();
        const trainingDate = new Date(this.linkData.training_time).getTime();
        if (slotDate === trainingDate) {
          return 'training';
        }
      }

      if (this.linkData?.construction_time) {
        const slotDate = new Date(slot.slot_date).getTime();
        const constructionDate = new Date(this.linkData.construction_time).getTime();
        if (slotDate === constructionDate) {
          return 'construction';
        }
      }

      if (this.linkData?.research_time) {
        const slotDate = new Date(slot.slot_date).getTime();
        const researchDate = new Date(this.linkData.research_time).getTime();
        if (slotDate === researchDate) {
          return 'research';
        }
      }

      return null;
    },

    checkPlayerExistsInSlotType(playerId, slotType) {

      const exists = this.slots[slotType].some(slot => {
        if (slot.players && slot.players.player_id) {
          // Converte ambos para string para garantir comparação correta
          return String(slot.players.player_id) === String(playerId);
        }
        return false;
      });
      return exists;
    },

    showMessage(messageSend) {
      this.message = messageSend;
      setTimeout(() => {
        this.message = null;
      }, 2000);

    },

    updateLocalSlot(updatedSlot) {
      let slotType = null;
      for (const type in this.slots) {
        if (this.slots[type].some(s => s.id === updatedSlot.id)) {
          slotType = type;
          break;
        }
      }
      if (slotType) {
        const index = this.slots[slotType].findIndex(s => s.id === updatedSlot.id);
        if (index !== -1) {
          this.slots[slotType][index] = updatedSlot;
        }
      }
    },

    async createLinkSchedule(newLinkData) {
      const id = this.generateUniqueCode();
      try {
        const { data, error } = await supabase
          .from('links')
          .insert([
            {
              id: id,
              access_key: this.generateUniqueCode(),
              description: newLinkData.description,
              title: newLinkData.title,
              training_time: newLinkData.training_time,
              construction_time: newLinkData.construction_time,
              research_time: newLinkData.research_time,
              generated_link: `${window.location.origin}/schedule/${id}`
            }
          ])
          .select();

        if (error) {
          throw error;
        }

        // Corrigido: Pegue o primeiro item do array retornado e atribua ao linkData
        if (data && data.length > 0) {
          this.linkData = data[0];
        } else {
          this.linkData = null; // Caso a inserção não retorne dados, zera o estado
        }

      } catch (error) {
        throw error;
      }
    },

    generateUniqueCode(length = 6) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let code = '';
      for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      // adiciona 2 caracteres do timestamp para reduzir colisões
      return code + Date.now().toString(36).slice(-2);
    },

    async refreshAllPlayersData() {
      this.loading = true;
      let updatedCount = 0;
      let errorCount = 0;

      try {
        // Coletar todos os player_ids únicos de todos os slots
        const allPlayerIds = new Set();

        ['training', 'construction', 'research'].forEach(slotType => {
          this.slots[slotType].forEach(slot => {
            if (slot.is_booked && slot.players?.player_id) {
              allPlayerIds.add(slot.players.player_id);
            }
          });
        });

        if (allPlayerIds.size === 0) {
          this.showMessage('No players found to refresh');
          return;
        }

        // Buscar informações atualizadas para cada player
        const playerPromises = Array.from(allPlayerIds).map(async (playerId) => {
          try {
            const playerInfo = await getPlayerInfo(playerId);

            if (playerInfo) {
              // Atualizar na tabela players do Supabase
              const { error: playerError } = await supabase
                .from('players')
                .upsert([
                  {
                    player_id: playerInfo.player_id,
                    player_name: playerInfo.player_name,
                    player_avatar: playerInfo.photo_url
                  },
                ], {
                  onConflict: 'player_id',
                  ignoreDuplicates: false
                });

              if (playerError) {
                console.error(`Error updating player ${playerId}:`, playerError);
                errorCount++;
                return null;
              }

              updatedCount++;
              return playerInfo;
            } else {
              errorCount++;
              return null;
            }
          } catch (error) {
            console.error(`Error refreshing player ${playerId}:`, error);
            errorCount++;
            return null;
          }
        });

        // Aguardar todas as atualizações
        await Promise.all(playerPromises);

        // Recarregar os slots para pegar os dados atualizados
        await this.getSlots();

        // Mostrar resultado
        if (updatedCount > 0 && errorCount === 0) {
          this.showMessage(`Successfully refreshed ${updatedCount} player(s)!`);
        } else if (updatedCount > 0 && errorCount > 0) {
          this.showMessage(`Refreshed ${updatedCount} player(s), ${errorCount} error(s)`);
        } else {
          this.showMessage(`Failed to refresh players. ${errorCount} error(s)`);
        }

      } catch (error) {
        console.error('Error in refreshAllPlayersData:', error);
        this.showMessage('Error refreshing players data');
      } finally {
        this.loading = false;
      }
    },

    // Inicializar subscriptions de realtime
    initializeRealtime() {
      if (!this.realtimeEnabled || !this.linkId) return

      console.log('Initializing Supabase Realtime for linkId:', this.linkId)

      // Callbacks para mudanças nos slots
      const slotCallbacks = {
        onSlotChange: (changeData) => {
          this.handleRealtimeSlotChange(changeData)
        },
        onPlayerUpdate: (updatedPlayer, affectedSlots) => {
          this.handleRealtimePlayerUpdate(updatedPlayer, affectedSlots)
        },
        onSubscriptionStatus: (status) => {
          this.handleSubscriptionStatusChange(status)
        }
      }

      // Callbacks para presença (usuários online)
      const presenceCallbacks = {
        onPresenceSync: (users) => {
          this.onlineUsers = users
        },
        onUserJoin: (key, newPresences) => {
          console.log('User joined:', key)
        },
        onUserLeave: (key, leftPresences) => {
          console.log('User left:', key)
        }
      }

      // Subscrever aos slots
      realtimeService.subscribeToSlots(this.linkId, slotCallbacks)

      // Subscrever à presença (opcional)
      realtimeService.subscribeToPresence(this.linkId, presenceCallbacks)

      // Se for admin, subscrever também ao link
      if (this.accessGranted) {
        realtimeService.subscribeToLink(this.linkId, {
          onLinkUpdate: (newLink, oldLink) => {
            this.handleRealtimeLinkUpdate(newLink, oldLink)
          }
        })
      }
    },

    // Processar mudanças nos slots em tempo real
    async handleRealtimeSlotChange(changeData) {
      const { event, newRecord, oldRecord, timestamp } = changeData

      // Evitar processar mudanças que nós mesmo fizemos
      if (this.pendingChanges.has(newRecord?.id || oldRecord?.id)) {
        return
      }

      console.log('Processing realtime slot change:', event, newRecord)

      try {
        if (event === 'UPDATE' && newRecord) {
          // Buscar dados completos do slot com informações do player
          const { data: fullSlot, error } = await supabase
            .from('slots')
            .select('*, players(player_name, player_avatar, player_id)')
            .eq('id', newRecord.id)
            .single()

          if (!error && fullSlot) {
            this.updateLocalSlot(fullSlot)

            // Mostrar notificação baseada na mudança
            this.showRealtimeNotification(event, fullSlot, oldRecord)
          }
        } else if (event === 'INSERT' && newRecord) {
          // Novo slot criado (raro, mas pode acontecer)
          await this.getSlots(true) // Refresh silencioso
        } else if (event === 'DELETE' && oldRecord) {
          // Slot deletado (raro)
          this.removeLocalSlot(oldRecord.id)
        }

        this.lastUpdate = timestamp

      } catch (error) {
        console.error('Error handling realtime slot change:', error)
      }
    },

    // Processar mudanças nos players (quando atualiza foto/nome)
    handleRealtimePlayerUpdate(updatedPlayer, affectedSlots) {
      console.log('Player data updated:', updatedPlayer)

      // Atualizar slots localmente
      affectedSlots.forEach(slotData => {
        const slotId = slotData.id
        this.updateSlotPlayer(slotId, updatedPlayer)
      })
    },

    // Processar mudanças no link (para admins)
    handleRealtimeLinkUpdate(newLink, oldLink) {
      console.log('Link updated:', newLink)

      // Atualizar dados do link localmente
      this.linkData = { ...this.linkData, ...newLink }

      // Verificar se horários mudaram
      const timesChanged =
        oldLink.construction_time !== newLink.construction_time ||
        oldLink.research_time !== newLink.research_time ||
        oldLink.training_time !== newLink.training_time

      if (timesChanged) {
        // Recarregar slots se necessário
        this.getSlots(true)
      }
    },

    // Processar mudanças de status da subscription
    handleSubscriptionStatusChange(status) {
      this.subscriptionStatus = status === 'SUBSCRIBED' ? 'connected' :
        status === 'CHANNEL_ERROR' ? 'error' : 'connecting'

      console.log('Realtime subscription status:', status)
    },

    // Mostrar notificação de mudança em tempo real
    showRealtimeNotification(event, slot, oldSlot) {
      if (event === 'UPDATE') {
        // Verificar o tipo de mudança
        if (!oldSlot.is_booked && slot.is_booked) {
          // Alguém se inscreveu
          const playerName = slot.players?.player_name || 'Someone'
        } else if (oldSlot.is_booked && !slot.is_booked) {
          // Alguém saiu
        }
      }
    },

    // Atualizar player em um slot específico
    updateSlotPlayer(slotId, playerData) {
      for (const slotType of ['training', 'construction', 'research']) {
        const slotIndex = this.slots[slotType].findIndex(s => s.id === slotId)
        if (slotIndex !== -1) {
          this.slots[slotType][slotIndex].players = {
            player_id: playerData.player_id,
            player_name: playerData.player_name,
            player_avatar: playerData.player_avatar
          }
          break
        }
      }
    },

    // Remover slot localmente
    removeLocalSlot(slotId) {
      for (const slotType of ['training', 'construction', 'research']) {
        const slotIndex = this.slots[slotType].findIndex(s => s.id === slotId)
        if (slotIndex !== -1) {
          this.slots[slotType].splice(slotIndex, 1)
          break
        }
      }
    },

    // Método signUpPlayer atualizado
    async signUpPlayer(slot, playerId) {
      try {
        // Adicionar à lista de mudanças pendentes
        this.pendingChanges.add(slot.id)

        // Sua lógica existente de validação e API calls...
        const slotType = this.getSlotType(slot)
        if (!slotType) {
          throw new Error('Unable to determine slot type')
        }

        const playerExists = this.checkPlayerExistsInSlotType(playerId, slotType)
        if (playerExists) {
          throw new Error(`Player is already signed up for a ${slotType} slot`)
        }


        // Se o slot já tem um player_id, significa que outro usuário já o reservou.
        // Esta verificação evita o sobrescrevemento.
        if (slot.is_booked) {
          throw new Error('This slot is already booked by another player.');
        }
        const playerInfo = await getPlayerInfo(playerId)
        const { data: playerData, error: playerError } = await supabase
          .from('players')
          .upsert([{
            player_id: playerInfo.player_id,
            player_name: playerInfo.player_name,
            player_avatar: playerInfo.photo_url
          }], {
            onConflict: 'player_id',
            ignoreDuplicates: false
          })
          .select()

        const { data: updatedSlot, error: slotError } = await supabase
          .from('slots')
          .update({
            player_id: playerId,
            is_booked: true,
            updated_at: new Date()
          })
          .eq('id', slot.id)
          .eq('is_booked', false)
          .select('*, players(player_name, player_avatar, player_id)')
          .single()

        if (updatedSlot) {
          // Atualizar localmente (o realtime vai notificar outros usuários automaticamente)
          this.updateLocalSlot(updatedSlot)
          this.showMessage('Player signed up successfully!')

          // Remover da lista de mudanças pendentes após um delay
          setTimeout(() => {
            this.pendingChanges.delete(slot.id)
          }, 1000)

          return { success: true, slot: updatedSlot }
        }

        if (slotError) {
          throw slotError;
        }

      } catch (error) {
        this.pendingChanges.delete(slot.id)
        this.showMessage('Error signing up player')
        return { success: false, error }
      }
    },

    // Método removePlayer atualizado
    async removePlayer(slot) {
      try {
        this.pendingChanges.add(slot.id)

        const { data: updatedSlot, error } = await supabase
          .from('slots')
          .update({
            player_id: null,
            is_booked: false,
            updated_at: new Date()
          })
          .eq('id', slot.id)
          .select()
          .single()

        if (error) throw error

        if (updatedSlot) {
          const slotWithoutPlayer = { ...updatedSlot, players: null }
          this.updateLocalSlot(slotWithoutPlayer)
          this.showMessage('Player removed successfully!')

          setTimeout(() => {
            this.pendingChanges.delete(slot.id)
          }, 1000)

          return { success: true, slot: updatedSlot }
        }

      } catch (error) {
        this.pendingChanges.delete(slot.id)
        this.showMessage('Error removing player')
        return { success: false, error }
      }
    },

    // Método getSlots atualizado
    async getSlots(silent = false) {
      if (!silent) this.loading = true

      try {
        // Sua lógica existente para buscar dados...
        const { data: link_data, error: link_error } = await supabase
          .from('links')
          .select('training_time, construction_time, research_time, title, id, description')
          .eq('id', this.linkId)
          .single()

        if (link_error) throw link_error
        this.linkData = link_data

        const { data: allSlotsData, error: allSlotsError } = await supabase
          .from('slots')
          .select('*, players(player_name, player_avatar, player_id)')
          .eq('link_id', this.linkId)
          .order('slot_date', { ascending: true })
          .order('start_time', { ascending: true })

        if (allSlotsError) throw allSlotsError

        // Organizar slots por tipo
        this.slots = { training: [], construction: [], research: [] }
        allSlotsData.forEach(slot => {
          if (this.linkData.training_time && new Date(slot.slot_date).getTime() === new Date(this.linkData.training_time).getTime()) {
            this.slots.training.push(slot)
          }
          if (this.linkData.construction_time && new Date(slot.slot_date).getTime() === new Date(this.linkData.construction_time).getTime()) {
            this.slots.construction.push(slot)
          }
          if (this.linkData.research_time && new Date(slot.slot_date).getTime() === new Date(this.linkData.research_time).getTime()) {
            this.slots.research.push(slot)
          }
        })

        // Inicializar realtime após carregar os dados
        if (this.realtimeEnabled) {
          this.initializeRealtime()
        }

        this.lastUpdate = new Date().toISOString()

      } catch (error) {
        if (!silent) {
          router.push({ name: 'home' })
          this.showMessage('Error loading slots')
        }
        throw error
      } finally {
        if (!silent) this.loading = false
      }
    },

    // Toggle do modo realtime
    toggleRealtime() {
      this.realtimeEnabled = !this.realtimeEnabled

      if (this.realtimeEnabled) {
        this.initializeRealtime()
      } else {
        realtimeService.unsubscribeAll()
        this.subscriptionStatus = 'disconnected'
        this.onlineUsers = []
      }

      this.showMessage(`Real-time ${this.realtimeEnabled ? 'enabled' : 'disabled'}`)
    },

    // Cleanup
    cleanup() {
      realtimeService.unsubscribeAll()
      this.subscriptionStatus = 'disconnected'
      this.onlineUsers = []
      this.pendingChanges.clear()
    },
  }
})