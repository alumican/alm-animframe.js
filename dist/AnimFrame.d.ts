export declare class AnimFrame extends EventTarget {
    /**
     * requestAnimationFrameベースでのFPSタイマー
     * @param {number} frameRate 目標フレームレート（0の場合はフレームレートを制限しない）
     * @param {number} tolerance 許容誤差（frameRateに対する割合）
     */
    constructor(frameRate?: number, tolerance?: number);
    start(): void;
    stop(): void;
    getIsRunning(): boolean;
    getTargetFrameRate(): number;
    getInterval(): number;
    getTolerance(): number;
    getToleranceDuration(): number;
    private updateHandler;
    static addEventListener(listener: EventListener): void;
    static removeEventListener(listener: EventListener): void;
    private static provideFunctions;
    private isRunning;
    private requestId;
    private targetFrameRate;
    private interval;
    private tolerance;
    private toleranceDuration;
    private frameStartTime;
    private static requestAnimationFrame;
    private static cancelAnimationFrame;
    private static ticker;
    private static listenerCount;
    private static listeners;
}
