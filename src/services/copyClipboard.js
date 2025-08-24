import { ref } from 'vue';

const copyToClipboard = (text) => {
    const errorMessage = ref('');
    navigator.clipboard.writeText(text).then(() => {
        errorMessage.value = 'Copied to clipboard!';
        setTimeout(() => errorMessage.value = '', 3000);
    }).catch(err => {
        errorMessage.value = 'Failed to copy.';
        setTimeout(() => errorMessage.value = '', 3000);
        console.error('Could not copy text: ', err);
    });
};

export { copyToClipboard };