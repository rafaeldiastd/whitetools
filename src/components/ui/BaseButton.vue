<template>
    <button :class="[
        'rounded-xl border-b-3 hover:cursor-pointer shadow-md inset-shadow-sm inset-shadow-white/60 px-9 py-2.5 transition-all active:border-b-0 active:translate-y-[3px]',
        variantClasses,
        { 'opacity-50 cursor-not-allowed': disabled }
    ]" :disabled="disabled">
        <slot />
    </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: (value) => ['primary', 'secondary', 'danger', 'blue'].includes(value)
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const variantClasses = computed(() => {
    switch (props.variant) {
        case 'primary': // Yellow
            return 'hover:from-wosbutton-yh50 hover:to-wosbutton-yh100 border-wosbutton-yb bg-linear-to-t from-wosbutton-y50 to-wosbutton-y100 text-wosbutton-yb';
        case 'blue': // Blue
            return 'hover:from-wosbutton-bh50 hover:to-wosbutton-bh100 border-wosbutton-bb bg-linear-to-t from-wosbutton-b50 to-wosbutton-b100 text-white';
        default:
            return 'bg-gray-500 border-gray-700 text-white';
    }
});
</script>
