import { useState, useCallback } from "react";

export interface InsertRecord {
    timestamp: string;
    duration: number;
}

export interface InsertRecords {
    mariadb: InsertRecord[];
    neo4j: InsertRecord[];
}

const STORAGE_KEY = "insert";

export function useInsertToLocalStorage() {
    const [records, setRecords] = useState<InsertRecords>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { mariadb: [], neo4j: [] };
    });

    const addRecord = useCallback(
        (base: "mariadb" | "neo4j", duration: number) => {
            const newRecord: InsertRecord = {
                timestamp: new Date().toISOString(),
                duration,
            };
            setRecords((prevRecords) => {
                const updated = {
                    ...prevRecords,
                    [base]: [...prevRecords[base], newRecord],
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                return updated;
            });
        },
        []
    );

    return { records, addRecord };
}