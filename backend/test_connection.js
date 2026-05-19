const axios = require('axios');

async function test() {
    const LICENSE_SERVER = 'http://127.0.0.1:7000';
    try {
        console.log('Calling:', `${LICENSE_SERVER}/api/validate`);
        const resp = await axios.post(`${LICENSE_SERVER}/api/validate`, {
            token: "SIA-838C-D853-058A-2D9D",
            totp_code: "123456"
        }, { timeout: 5000 });
        console.log('Success:', resp.data);
    } catch (e) {
        console.log('Error Message:', e.message);
        if (e.response) {
            console.log('Status:', e.response.status);
            console.log('Data:', e.response.data);
        } else {
            console.log('No response from server.');
        }
    }
}

test();
