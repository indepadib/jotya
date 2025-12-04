import { CarrierAdapter } from './types';
import { MockCarrierService } from './MockCarrierService';
import { DigylogService } from './DigylogService';
import { TawssilService } from './TawssilService';
import { AmanaService } from './AmanaService';

export enum CarrierType {
    AMANA = 'AMANA',
    TAWSSIL = 'TAWSSIL',
    CHRONOPOST = 'CHRONOPOST',
    DIGYLOG = 'DIGYLOG',
    INTERNAL = 'INTERNAL'
}

export class CarrierFactory {
    static getCarrier(type: string): CarrierAdapter {
        switch (type) {
            case CarrierType.DIGYLOG:
                return new DigylogService();
            case CarrierType.TAWSSIL:
                return new TawssilService();
            case CarrierType.AMANA:
                return new AmanaService();
            case CarrierType.CHRONOPOST:
                return new MockCarrierService('CHRONOPOST');
            default:
                return new MockCarrierService('INTERNAL');
        }
    }
}
