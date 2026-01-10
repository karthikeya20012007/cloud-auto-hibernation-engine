/**
 * Stable backend URL for Expo Go on physical device
 * Change ONLY if your LAN IP changes
 */
const BASE_URL = 'http://192.168.1.49:8000';

/**
 * Fetch all compute resources
 */
export async function fetchResources() {
    const res = await fetch(`${BASE_URL}/resources`);

    if (!res.ok) {
        throw new Error('Failed to fetch resources');
    }

    return res.json();
}

/**
 * Approve and stop a VM that requires human approval
 */
export async function approveStop(resourceId: string) {
    const res = await fetch(
        `${BASE_URL}/resources/${resourceId}/approve-stop`,
        {
            method: 'POST',
        }
    );

    if (!res.ok) {
        throw new Error('Failed to approve stop');
    }

    return res.json();
}
