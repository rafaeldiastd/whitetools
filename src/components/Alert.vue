<template>
    <div
        class="absolute top-1/2 min-w-full bg-wos-950 border-wos-800 border-b-2 border-t-2 text-xs text-wos-50 text-center p-2 animate-wiggle z-99">
        {{message}}
    </div>
</template>
<script setup>

const props = defineProps({
    message: {
        type: String,
        required: true
    }
});

</script>