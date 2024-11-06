import { killPorts } from 'killportall';

async function cleanupPorts() {
    try {
        const results = await killPorts([3000, 3001, 3002], {
            retries: 3,
            timeout: 1000
        });
        console.log('Port cleanup results:', results);
    } catch (error) {
        console.error('Error cleaning up ports:', error);
    }
}

cleanupPorts();