import CryptoJS from 'crypto-js';
import axios from 'axios';
const wosKey = 'tB87#kPtkxqOS2';


function generateSign(data) {
    const sortedKeys = Object.keys(data).sort();
    const signStr = sortedKeys.map(key => `${key}=${data[key]}`).join('&') + wosKey;
    return CryptoJS.MD5(signStr).toString();
}

async function getPlayerInfo(playerId) {
    const data = {
        fid: playerId,
        time: Date.now(),
    };

    try {
        const signedData = { ...data, sign: generateSign(data) };
        const response = await axios.post('https://wos-giftcode-api.centurygame.com/api/player', signedData);

        if (response.data.err_code === 40004) {
            console.warn(`Player ID ${playerId} not found: ${response.data.msg}`);
            return null;
        }

        if (response.data.err_code === 40001) {
            throw new Error('Invalid player ID format.');
        }

        if (response.data.data) {
            return {
                player_name: response.data.data.nickname || 'Unknown Player',
                photo_url: response.data.data.avatar_image || null,
                player_id: response.data.data.fid || playerId
            };
        } else {
            console.warn(`API returned unexpected successful response for ID ${playerId}:`, response.data);
            return null;
        }

    } catch (err) {
        console.error(`Error fetching player info for ID ${playerId}:`, err);
        return null;
    }
};

export { getPlayerInfo };