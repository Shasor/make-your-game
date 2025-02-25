// create/audio_create.js
import { Audio } from '../core/components/audio_component.js';

export function addAudioToEntity(entity) {
    if (!entity.getComponent('audio')) {
        entity.addComponent('audio', new Audio());
    }
    return entity.getComponent('audio');
}

