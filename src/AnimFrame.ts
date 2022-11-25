import {DateUtil} from "alm";
import {AnimFrameEvent, AnimFrameEventType} from "./AnimFrameEvent";

export class AnimFrame extends EventTarget {

	// --------------------------------------------------
	//
	// CONSTRUCTOR
	//
	// --------------------------------------------------

	/**
	 * requestAnimationFrameベースでのFPSタイマー
	 * @param {number} frameRate 目標フレームレート（0の場合はフレームレートを制限しない）
	 * @param {number} tolerance 許容誤差（frameRateに対する割合）
	 */
	constructor(frameRate:number = 0, tolerance:number = 0.1) {
		super();

		if (!AnimFrame.requestAnimationFrame) {
			AnimFrame.provideFunctions();
		}

		this.targetFrameRate = frameRate;
		this.interval = 1000 / this.targetFrameRate;

		this.tolerance = tolerance;
		this.toleranceDuration = this.interval * this.tolerance;

		this.isRunning = false;
	}





	// --------------------------------------------------
	//
	// METHOD
	//
	// --------------------------------------------------

	public start():void {
		if (this.isRunning) return;
		this.isRunning = true;

		this.frameStartTime = DateUtil.now();
		this.requestId = window.requestAnimationFrame(this.updateHandler);
	}

	public stop():void {
		if (!this.isRunning) return;
		this.isRunning = false;

		window.cancelAnimationFrame(this.requestId);
	}

	public getIsRunning():boolean {
		return this.isRunning;
	}

	public getTargetFrameRate():number {
		return this.targetFrameRate;
	}

	public getInterval():number {
		return this.interval;
	}

	public getTolerance():number {
		return this.tolerance;
	}

	public getToleranceDuration():number {
		return this.toleranceDuration;
	}

	private updateHandler = ():void => {
		this.requestId = window.requestAnimationFrame(this.updateHandler);
		if (this.targetFrameRate > 0) {
			const currentTime:number = DateUtil.now();
			const elapsedTime:number = currentTime - this.frameStartTime;
			if (elapsedTime >= this.interval - this.toleranceDuration) {
				this.frameStartTime = currentTime;
				this.dispatchEvent(new AnimFrameEvent(AnimFrameEventType.tick));
			}
		} else {
			this.dispatchEvent(new AnimFrameEvent(AnimFrameEventType.tick));
		}
	};





	public static addEventListener(listener:EventListener):void {
		const index = AnimFrame.listeners.indexOf(listener);
		if (index === -1) {
			AnimFrame.ticker.addEventListener(AnimFrameEventType.tick, listener);
			AnimFrame.listeners.push(listener);
			++AnimFrame.listenerCount;
			if (AnimFrame.listenerCount === 1) {
				AnimFrame.ticker.start();
			}
		}
	}

	public static removeEventListener(listener:EventListener):void {
		const index = AnimFrame.listeners.indexOf(listener);
		if (index !== -1) {
			AnimFrame.ticker.removeEventListener(AnimFrameEventType.tick, listener);
			AnimFrame.listeners.splice(index, 1);
			--AnimFrame.listenerCount;
			if (AnimFrame.listenerCount === 0) {
				AnimFrame.ticker.stop();
			}
		}
	}





	private static provideFunctions():void {
		const raf = {
			requestAnimationFrame: null,
			cancelAnimationFrame: null,
		};

		// for browser
		if (window) {
			// get default
			raf.requestAnimationFrame = window.requestAnimationFrame;
			raf.cancelAnimationFrame =
				window.cancelAnimationFrame || window['cancelRequestAnimationFrame'];

			// resolve vendor prefix
			if (!raf.requestAnimationFrame) {
				const prefixes = ['ms', 'moz', 'webkit', 'o'];
				for (let i = 0; i < prefixes.length; ++i) {
					const prefix = prefixes[i];
					raf.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
					raf.cancelAnimationFrame =
						window[prefix + 'CancelAnimationFrame'] ||
						window[prefix + 'CancelRequestAnimationFrame'];
					if (raf.requestAnimationFrame) break;
				}
			}
		}

		// for node.js
		if (!raf.requestAnimationFrame) {
			const fps = 60;
			const t = 1000 / fps;
			let prevTime = 0;
			raf.requestAnimationFrame = (callback:FrameRequestCallback): number => {
				const time = DateUtil.now();
				const interval = Math.max(1, t - (time - prevTime));
				const nextTime = time + interval;
				const id = window.setTimeout(() => {
					callback(nextTime);
				}, interval);
				prevTime = nextTime;
				return id;
			};
			raf.cancelAnimationFrame = (id): void => {
				clearTimeout(id);
			};
		}

		AnimFrame.requestAnimationFrame = raf.requestAnimationFrame;
		AnimFrame.cancelAnimationFrame = raf.cancelAnimationFrame;
	}





	// --------------------------------------------------
	//
	// MEMBER
	//
	// --------------------------------------------------

	private isRunning:boolean;
	private requestId:number;
	private targetFrameRate:number;
	private interval:number;
	private tolerance:number;
	private toleranceDuration:number;
	private frameStartTime:number;

	private static requestAnimationFrame:(callback:FrameRequestCallback) => number = null;
	private static cancelAnimationFrame:(handle:number) => void = null;

	private static ticker = new AnimFrame();
	private static listenerCount = 0;
	private static listeners:EventListener[] = [];
}
