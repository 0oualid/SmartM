
/**
 * Types et interfaces pour les avaries d'équipement
 */

/**
 * Représente une avarie d'équipement
 */
export interface EquipmentFailure {
    id?: number;
    equipment_id: number;
    failure_type: string;
    failure_date: string;
    component: string;
    reference?: string;
}

/**
 * Statistiques d'avaries d'équipement
 */
export interface FailureStatistics {
    total: number;
    byType?: Record<string, number>;
    byComponent?: Record<string, number>;
    byDate?: Record<string, number>;
}
