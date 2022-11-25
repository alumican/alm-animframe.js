export declare enum AnimFrameEventType {
    tick = "tick"
}
export declare class AnimFrameEvent extends CustomEvent<void> {
    constructor(type: AnimFrameEventType);
}
