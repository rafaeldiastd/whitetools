<template>
    <div class="p-10 flex flex-col items-center gap-4 pb-[120px]">

        <!-- Navigation Tabs -->
        <div
            class="flex items-center justify-center w-full bg-wostools-menu py-2 divide-x divide-wostools-50/10 inset-shadow-sm inset-shadow-wostools-50/20 mb-4 rounded-xl">
            <div class="flex items-center p-2">
                <button class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    Add City
                </button>
                <button class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    Add Beartrap
                </button>
                <button class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    Add Flag
                </button>
                <button class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    Add Node
                </button>
            </div>
            <div class="flex items-center p-2" @click="showAdminModal = true">
                <div class="hover:cursor-pointer hover:text-wostools-800 flex flex-col items-center text-xs px-4">
                    <img src="/src/assets/images/bearspace-icon.png" alt="" class="w-8 h-8">
                    Settings
                </div>
            </div>
        </div>

        <router-link to="/">
            <img src="@/assets/images/logotipo.png" alt="" class="w-[200px] pb-6">
        </router-link>

        <div v-for="player in players" :key="player.id" class="relative w-full flex flex-col">

        </div>

        <canvas id="layoutCanvas" class="w-full h-full" @wheel.prevent="handleWheel" @mousedown="handleMouseDown"
            @mousemove="handleMouseMove" @mouseup="handleMouseUp" @touchstart="handleTouchStart"
            @touchmove="handleTouchMove" @touchend="handleTouchEnd"></canvas>
    </div>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTransferStore } from '@/stores/transfer';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import Alert from '@/components/Alert.vue';

const props = defineProps({
    id: {
        type: [String, Number],
        required: false,
        default: null
    }
});

const players = ref([
    {
        id: 1,
        nickname: 'Player 1',
        avatar_image: '/src/assets/images/avatar_1.png',
        position: {
            x: 0,
            y: 0,
        },
        time: 0,
        beartrap: 1
    },
]);

const canvas = ref(null);
const ctx = ref(null);
const baseGridSize = 30;
const gridSize = ref(baseGridSize);
const zoom = ref(1);
const panX = ref(0);
const panY = ref(0);
const gridCols = 20;
const gridRows = 20;
const isPanning = ref(false);
const lastMouseX = ref(0);
const lastMouseY = ref(0);
const isTouchPanning = ref(false);
const touchStartX = ref(0);
const touchStartY = ref(0);

onMounted(() => {
    canvas.value = document.getElementById('layoutCanvas');
    ctx.value = canvas.value.getContext('2d');
    resizeCanvas();
    drawDiamondGrid();
});


function resizeCanvas() {
    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;
    canvas.value.width = canvasWidth;
    canvas.value.height = canvasHeight;
    panX.value = canvasWidth / 2;
    panY.value = canvasHeight / 2;
    drawDiamondGrid();
}

function diamondToScreenCorner(gridX, gridY) {
    const offsetX = (gridX - gridY) * gridSize.value * 0.5;
    const offsetY = (gridX + gridY) * gridSize.value * 0.5;
    return { x: offsetX * zoom.value + panX.value, y: offsetY * zoom.value + panY.value };
}

function drawDiamondGrid() {
    const canvasWidth = canvas.value.width;
    const canvasHeight = canvas.value.height;
    ctx.value.clearRect(0, 0, canvasWidth, canvasHeight);

    const gradient = ctx.value.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, '#0D4B88');
    gradient.addColorStop(1, '#0D4B88');
    ctx.value.fillStyle = gradient;
    ctx.value.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.value.save();
    ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.value.lineWidth = 1;

    const currentGridSize = gridSize.value * zoom.value;

    for (let x = -gridCols; x <= gridCols; x++) {
        for (let y = -gridRows; y <= gridRows; y++) {
            const screen = diamondToScreenCorner(x, y);
            const screen2 = diamondToScreenCorner(x + 1, y);
            const screen3 = diamondToScreenCorner(x, y + 1);

            if (screen.x > -100 && screen.x < canvasWidth + 100 && screen.y > -100 && screen.y < canvasHeight + 100) {
                ctx.value.beginPath();
                ctx.value.moveTo(screen.x, screen.y);
                ctx.value.lineTo(screen2.x, screen2.y);
                ctx.value.lineTo(diamondToScreenCorner(x + 1, y + 1).x, diamondToScreenCorner(x + 1, y + 1).y);
                ctx.value.lineTo(screen3.x, screen3.y);
                ctx.value.closePath();
                ctx.value.stroke();
            }
        }
    }

    ctx.value.fillStyle = 'rgba(255, 100, 100, 0.8)';
    ctx.value.beginPath();
    ctx.value.arc(panX.value, panY.value, 8 * zoom.value, 0, 2 * Math.PI);
    ctx.value.fill();
    ctx.value.restore();
}

function handleWheel(event) {
    const rect = canvas.value.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom.value * zoomFactor));
    const dx = mouseX - panX.value;
    const dy = mouseY - panY.value;
    panX.value = mouseX - dx * (newZoom / zoom.value);
    panY.value = mouseY - dy * (newZoom / zoom.value);
    zoom.value = newZoom;
    gridSize.value = baseGridSize * zoom.value;
    drawDiamondGrid();
}

function handleMouseDown(event) {
    if (event.button === 1) {
        isPanning.value = true;
        const rect = canvas.value.getBoundingClientRect();
        lastMouseX.value = event.clientX - rect.left;
        lastMouseY.value = event.clientY - rect.top;
    }
}

function handleMouseMove(event) {
    if (isPanning.value) {
        const rect = canvas.value.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        panX.value += mouseX - lastMouseX.value;
        panY.value += mouseY - lastMouseY.value;
        lastMouseX.value = mouseX;
        lastMouseY.value = mouseY;
        drawDiamondGrid();
    }
}

function handleMouseUp(event) {
    if (event.button === 1) {
        isPanning.value = false;
    }
}

function handleTouchStart(event) {
    if (event.touches.length === 1) {
        isTouchPanning.value = true;
        const rect = canvas.value.getBoundingClientRect();
        touchStartX.value = event.touches[0].clientX - rect.left;
        touchStartY.value = event.touches[0].clientY - rect.top;
    }
}

function handleTouchMove(event) {
    if (isTouchPanning.value && event.touches.length === 1) {
        const rect = canvas.value.getBoundingClientRect();
        const touchX = event.touches[0].clientX - rect.left;
        const touchY = event.touches[0].clientY - rect.top;
        panX.value += touchX - touchStartX.value;
        panY.value += touchY - touchStartY.value;
        touchStartX.value = touchX;
        touchStartY.value = touchY;
        drawDiamondGrid();
    }
}

function handleTouchEnd() {
    isTouchPanning.value = false;
}

window.addEventListener('resize', resizeCanvas);
</script>