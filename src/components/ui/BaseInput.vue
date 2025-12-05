<template>
    <div class="flex flex-col gap-1">
        <label v-if="label" :for="id" class="text-md">{{ label }}</label>
        <input 
            :id="id"
            :type="type"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            class="rounded-xl bg-wos-500 px-4 py-3 w-full text-wos-900 text-sm focus:outline-none focus:ring-2 focus:ring-wosbutton-y50"
            v-bind="$attrs"
        />
    </div>
</template>

<script setup>
defineProps({
    label: {
        type: String,
        default: ''
    },
    id: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number],
        default: ''
    },
    type: {
        type: String,
        default: 'text'
    }
});

defineEmits(['update:modelValue']);
</script>
