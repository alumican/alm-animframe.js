/*! alm-animframe.js 1.0.0 (c) 2022 alumican, licensed under the MIT, more information https://github.com/alumican/alm-animframe.js */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('alm')) :
    typeof define === 'function' && define.amd ? define(['exports', 'alm'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.alm = global.alm || {}, global.alm));
})(this, (function (exports, alm) { 'use strict';

    exports.AnimFrameEventType = void 0;
    (function (AnimFrameEventType) {
        AnimFrameEventType["tick"] = "tick";
    })(exports.AnimFrameEventType || (exports.AnimFrameEventType = {}));
    class AnimFrameEvent extends CustomEvent {
        constructor(type) {
            super(type);
        }
    }

    class AnimFrame extends EventTarget {
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
        constructor(frameRate = 0, tolerance = 0.1) {
            super();
            this.updateHandler = () => {
                this.requestId = window.requestAnimationFrame(this.updateHandler);
                if (this.targetFrameRate > 0) {
                    const currentTime = alm.DateUtil.now();
                    const elapsedTime = currentTime - this.frameStartTime;
                    if (elapsedTime >= this.interval - this.toleranceDuration) {
                        this.frameStartTime = currentTime;
                        this.dispatchEvent(new AnimFrameEvent(exports.AnimFrameEventType.tick));
                    }
                }
                else {
                    this.dispatchEvent(new AnimFrameEvent(exports.AnimFrameEventType.tick));
                }
            };
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
        start() {
            if (this.isRunning)
                return;
            this.isRunning = true;
            this.frameStartTime = alm.DateUtil.now();
            this.requestId = window.requestAnimationFrame(this.updateHandler);
        }
        stop() {
            if (!this.isRunning)
                return;
            this.isRunning = false;
            window.cancelAnimationFrame(this.requestId);
        }
        getIsRunning() {
            return this.isRunning;
        }
        getTargetFrameRate() {
            return this.targetFrameRate;
        }
        getInterval() {
            return this.interval;
        }
        getTolerance() {
            return this.tolerance;
        }
        getToleranceDuration() {
            return this.toleranceDuration;
        }
        static addEventListener(listener) {
            const index = AnimFrame.listeners.indexOf(listener);
            if (index === -1) {
                AnimFrame.ticker.addEventListener(exports.AnimFrameEventType.tick, listener);
                AnimFrame.listeners.push(listener);
                ++AnimFrame.listenerCount;
                if (AnimFrame.listenerCount === 1) {
                    AnimFrame.ticker.start();
                }
            }
        }
        static removeEventListener(listener) {
            const index = AnimFrame.listeners.indexOf(listener);
            if (index !== -1) {
                AnimFrame.ticker.removeEventListener(exports.AnimFrameEventType.tick, listener);
                AnimFrame.listeners.splice(index, 1);
                --AnimFrame.listenerCount;
                if (AnimFrame.listenerCount === 0) {
                    AnimFrame.ticker.stop();
                }
            }
        }
        static provideFunctions() {
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
                        if (raf.requestAnimationFrame)
                            break;
                    }
                }
            }
            // for node.js
            if (!raf.requestAnimationFrame) {
                const fps = 60;
                const t = 1000 / fps;
                let prevTime = 0;
                raf.requestAnimationFrame = (callback) => {
                    const time = alm.DateUtil.now();
                    const interval = Math.max(1, t - (time - prevTime));
                    const nextTime = time + interval;
                    const id = window.setTimeout(() => {
                        callback(nextTime);
                    }, interval);
                    prevTime = nextTime;
                    return id;
                };
                raf.cancelAnimationFrame = (id) => {
                    clearTimeout(id);
                };
            }
            AnimFrame.requestAnimationFrame = raf.requestAnimationFrame;
            AnimFrame.cancelAnimationFrame = raf.cancelAnimationFrame;
        }
    }
    AnimFrame.requestAnimationFrame = null;
    AnimFrame.cancelAnimationFrame = null;
    AnimFrame.ticker = new AnimFrame();
    AnimFrame.listenerCount = 0;
    AnimFrame.listeners = [];

    exports.AnimFrame = AnimFrame;
    exports.AnimFrameEvent = AnimFrameEvent;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=index.js.map
