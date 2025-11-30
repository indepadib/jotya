import { CarrierAdapter } from './types';
import { MockCarrierService } from './MockCarrierService';

export enum CarrierType {
    AMANA = 'AMANA',
    YASSIR = 'YASSIR',
    CHRONOPOST = 'CHRONOPOST',
    INTERNAL = 'INTERNAL'
}

export class CarrierFactory {
    static getCarrier(type: string): CarrierAdapter {
        switch (type) {
            case CarrierType.AMANA:
                // Return AmanaService when implemented
                return new MockCarrierService('AMANA');
            case CarrierType.YASSIR:
                // Return YassirService when implemented
                return new MockCarrierService('YASSIR');
            case CarrierType.CHRONOPOST:
                return new MockCarrierService('CHRONOPOST');
            default:
                return new MockCarrierService('INTERNAL');
        }
    }
}
