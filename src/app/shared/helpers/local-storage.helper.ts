export function getLocalStorageData<T = unknown>(key: string): T | null {
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data) as T;
    }
    return null;
}

export function setLocalStorageData<T = unknown>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
}