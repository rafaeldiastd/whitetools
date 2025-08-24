// services/realtimeService.js - Serviço para Supabase Realtime
import { supabase } from '@/services/supabase'

class SupabaseRealtimeService {
  constructor() {
    this.subscriptions = new Map()
    this.isEnabled = true
  }

  // Subscrever mudanças nos slots de um link específico
  subscribeToSlots(linkId, callbacks = {}) {
    const channelName = `slots-${linkId}`
    
    // Se já existe uma subscription para este link, remove primeiro
    this.unsubscribeFromSlots(linkId)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'slots',
          filter: `link_id=eq.${linkId}`
        },
        (payload) => {
          console.log('Slot change received:', payload)
          this.handleSlotChange(payload, callbacks)
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'players'
        },
        (payload) => {
          console.log('Player change received:', payload)
          this.handlePlayerChange(payload, callbacks, linkId)
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${channelName}:`, status)
        
        if (callbacks.onSubscriptionStatus) {
          callbacks.onSubscriptionStatus(status)
        }
      })

    // Armazena a subscription
    this.subscriptions.set(linkId, channel)
    
    return channel
  }

  // Processar mudanças nos slots
  handleSlotChange(payload, callbacks) {
    const { eventType, new: newRecord, old: oldRecord } = payload

    switch (eventType) {
      case 'INSERT':
        if (callbacks.onSlotInsert) {
          callbacks.onSlotInsert(newRecord)
        }
        break
        
      case 'UPDATE':
        if (callbacks.onSlotUpdate) {
          callbacks.onSlotUpdate(newRecord, oldRecord)
        }
        break
        
      case 'DELETE':
        if (callbacks.onSlotDelete) {
          callbacks.onSlotDelete(oldRecord)
        }
        break
    }

    // Callback genérico para qualquer mudança
    if (callbacks.onSlotChange) {
      callbacks.onSlotChange({
        event: eventType,
        newRecord,
        oldRecord,
        timestamp: new Date().toISOString()
      })
    }
  }

  // Processar mudanças nos players (para quando atualiza foto/nome)
  async handlePlayerChange(payload, callbacks, linkId) {
    const { eventType, new: newRecord } = payload

    if (eventType === 'UPDATE' && newRecord) {
      // Verifica se este player está em algum slot do link atual
      const { data: slotsWithPlayer } = await supabase
        .from('slots')
        .select('id')
        .eq('link_id', linkId)
        .eq('player_id', newRecord.player_id)

      if (slotsWithPlayer && slotsWithPlayer.length > 0) {
        if (callbacks.onPlayerUpdate) {
          callbacks.onPlayerUpdate(newRecord, slotsWithPlayer)
        }
      }
    }
  }

  // Subscrever mudanças nos links (para admin)
  subscribeToLink(linkId, callbacks = {}) {
    const channelName = `link-${linkId}`
    
    if (this.subscriptions.has(`link-${linkId}`)) {
      return this.subscriptions.get(`link-${linkId}`)
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'links',
          filter: `id=eq.${linkId}`
        },
        (payload) => {
          console.log('Link updated:', payload)
          if (callbacks.onLinkUpdate) {
            callbacks.onLinkUpdate(payload.new, payload.old)
          }
        }
      )
      .subscribe()

    this.subscriptions.set(`link-${linkId}`, channel)
    return channel
  }

  // Subscrever presença (usuários online) - Feature experimental
  subscribeToPresence(linkId, callbacks = {}) {
    const channelName = `presence-${linkId}`
    
    if (this.subscriptions.has(channelName)) {
      return this.subscriptions.get(channelName)
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          presence: {
            key: `user-${Date.now()}-${Math.random()}`,
          }
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).flat()
        
        if (callbacks.onPresenceSync) {
          callbacks.onPresenceSync(users)
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (callbacks.onUserJoin) {
          callbacks.onUserJoin(key, newPresences)
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (callbacks.onUserLeave) {
          callbacks.onUserLeave(key, leftPresences)
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Enviar presença
          await channel.track({
            user_id: `user-${Date.now()}`,
            online_at: new Date().toISOString(),
          })
        }
      })

    this.subscriptions.set(channelName, channel)
    return channel
  }

  // Desinscrever de um link específico
  unsubscribeFromSlots(linkId) {
    const channel = this.subscriptions.get(linkId)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(linkId)
      console.log(`Unsubscribed from slots for link: ${linkId}`)
    }
  }

  // Desinscrever de um link
  unsubscribeFromLink(linkId) {
    const channelKey = `link-${linkId}`
    const channel = this.subscriptions.get(channelKey)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(channelKey)
      console.log(`Unsubscribed from link: ${linkId}`)
    }
  }

  // Desinscrever de presença
  unsubscribeFromPresence(linkId) {
    const channelKey = `presence-${linkId}`
    const channel = this.subscriptions.get(channelKey)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(channelKey)
      console.log(`Unsubscribed from presence: ${linkId}`)
    }
  }

  // Desinscrever de tudo
  unsubscribeAll() {
    for (const [key, channel] of this.subscriptions) {
      supabase.removeChannel(channel)
      console.log(`Unsubscribed from: ${key}`)
    }
    this.subscriptions.clear()
  }

  // Verificar status das subscriptions
  getSubscriptionStatus() {
    const status = {}
    for (const [key, channel] of this.subscriptions) {
      status[key] = {
        state: channel.state,
        subscribed: channel.state === 'joined'
      }
    }
    return status
  }

  // Habilitar/desabilitar realtime
  setEnabled(enabled) {
    this.isEnabled = enabled
    
    if (!enabled) {
      this.unsubscribeAll()
    }
    
    return this.isEnabled
  }

  // Getter para status
  get enabled() {
    return this.isEnabled
  }

  // Destruir todas as subscriptions
  destroy() {
    this.unsubscribeAll()
    this.isEnabled = false
  }
}

// Instância singleton
export const realtimeService = new SupabaseRealtimeService()
export default realtimeService