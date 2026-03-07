import { useEffect, useRef } from "react";

const SHAKE_THRESHOLD = 15; // m/s²
const SHAKE_COOLDOWN_MS = 3000;

export function useShakeDetection(onShake: () => void, enabled: boolean): void {
  const lastShakeTime = useRef<number>(0);
  const onShakeRef = useRef(onShake);
  onShakeRef.current = onShake;

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;
    if (!window.DeviceMotionEvent) return;

    let permissionRequested = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x ?? 0;
      const y = acc.y ?? 0;
      const z = acc.z ?? 0;
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      if (magnitude > SHAKE_THRESHOLD) {
        const now = Date.now();
        if (now - lastShakeTime.current > SHAKE_COOLDOWN_MS) {
          lastShakeTime.current = now;
          onShakeRef.current();
        }
      }
    };

    // iOS 13+ requires permission
    const requestAndListen = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dme = DeviceMotionEvent as any;
        if (
          typeof dme.requestPermission === "function" &&
          !permissionRequested
        ) {
          permissionRequested = true;
          const permission = await dme.requestPermission();
          if (permission !== "granted") return;
        }
        window.addEventListener("devicemotion", handleMotion, {
          passive: true,
        });
      } catch {
        // Permission denied or not supported
        window.addEventListener("devicemotion", handleMotion, {
          passive: true,
        });
      }
    };

    void requestAndListen();

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [enabled]);
}
