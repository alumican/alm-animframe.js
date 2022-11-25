export enum AnimFrameEventType {
	tick = 'tick',
}

export class AnimFrameEvent extends CustomEvent<void> {
	constructor(type:AnimFrameEventType) {
		super(type);
	}
}
