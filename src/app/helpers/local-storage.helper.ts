export function getLocalStorageData(key: string): any {
    const data = localStorage.getItem(key);
    if (data) {
        return JSON.parse(data);
    }
    return null;
}

export function setLocalStorageData(key: string, data: any): void {
    localStorage.setItem(key, JSON.stringify(data));
}