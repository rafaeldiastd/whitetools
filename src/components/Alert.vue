<template>
    <div
        class="absolute top-1/2 min-w-full bg-wos-950 border-wos-800 border-b-2 border-t-2 text-xs text-wos-50 text-center p-2 animate-wiggle z-99">
        {{ message }}
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: 'info',
        validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
    }
});

const typeClasses = computed(() => {
    switch (props.type) {
        case 'success':
            return 'bg-green-600 border-green-800';
        case 'error':
            return 'bg-red-600 border-red-800';
        case 'warning':
            return 'bg-yellow-600 border-yellow-800';
        default:
            return 'bg-wos-950 border-wos-800';
    }
});
</script>