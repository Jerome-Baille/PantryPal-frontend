// Shared utility function to convert time to seconds
export function convertToSeconds(time: string, unit: string): number {
    if (unit === 'h') {
        const [hours, minutes] = time.split('.').map(Number);
        return (hours * 60 + minutes) * 60;
    } else if (unit === 'min') {
        return parseFloat(time) * 60;
    } else {
        return 0; // Invalid unit, treat as zero duration
    }
}