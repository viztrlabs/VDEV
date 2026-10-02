'use client';

/**
 * GyroscopeControl — device-orientation control for the tour viewer.
 * Ports marzipano/demos/device-orientation/DeviceOrientationControlMethod.js.
 * Registers the method with the engine's Controls and toggles it; iOS 13+
 * requires DeviceOrientationEvent.requestPermission().
 */
import React, { useCallback, useState } from 'react';
import { Smartphone } from 'lucide-react';

type MarzipanoAny = any;

const BTN_CLASS =
  'p-2 rounded-lg bg-[#18181B]/70 border border-[#27272A] text-[#A1A1AA] hover:text-white hover:bg-white/5 transition-all cursor-pointer';
const BTN_ACTIVE_CLASS =
  'p-2 rounded-lg bg-[#3ECF8E]/20 border border-[#3ECF8E] text-[#3ECF8E] hover:bg-[#3ECF8E]/30 transition-all cursor-pointer';

function rotateEuler(
  euler: { yaw: number; pitch: number; roll: number },
  result: { yaw: number; pitch: number; roll: number }
) {
  const ch = Math.cos(euler.yaw), sh = Math.sin(euler.yaw);
  const ca = Math.cos(euler.pitch), sa = Math.sin(euler.pitch);
  const cb = Math.cos(euler.roll), sb = Math.sin(euler.roll);
  const matrix = [
    sh * sb - ch * sa * cb, -ch * ca, sh * sa * sb + sh * cb,
    ca * cb, -sa, -ca * sb,
    sh * sa * cb + ch * sb, sh * ca, -sh * sa * sb + ch * cb,
  ];
  let heading: number, attitude: number, bank: number;
  if (matrix[3] > 0.9999) {
    heading = Math.atan2(matrix[2], matrix[8]);
    attitude = Math.PI / 2;
    bank = 0;
  } else if (matrix[3] < -0.9999) {
    heading = Math.atan2(matrix[2], matrix[8]);
    attitude = -Math.PI / 2;
    bank = 0;
  } else {
    heading = Math.atan2(-matrix[6], matrix[0]);
    bank = Math.atan2(-matrix[5], matrix[4]);
    attitude = Math.asin(matrix[3]);
  }
  result.yaw = heading;
  result.pitch = attitude;
  result.roll = bank;
}

export function createDeviceOrientationMethod(Marzipano: MarzipanoAny): MarzipanoAny {
  const dynamics = { yaw: new Marzipano.Dynamics(), pitch: new Marzipano.Dynamics() };
  const previous: Record<string, number | null> = {};
  const current: Record<string, number | null> = {};
  const tmp = { yaw: 0, pitch: 0, roll: 0 };

  const method: MarzipanoAny = {};
  Marzipano.dependencies.eventEmitter(method);

  const handleData = (data: DeviceOrientationEvent) => {
    tmp.yaw = Marzipano.util.degToRad(data.alpha ?? 0);
    tmp.pitch = Marzipano.util.degToRad(data.beta ?? 0);
    tmp.roll = Marzipano.util.degToRad(data.gamma ?? 0);
    rotateEuler(tmp, current as any);

    if (previous.yaw != null && previous.pitch != null && previous.roll != null) {
      dynamics.yaw.offset = -(current.yaw! - previous.yaw);
      dynamics.pitch.offset = current.pitch! - previous.pitch;
      method.emit('parameterDynamics', 'yaw', dynamics.yaw);
      method.emit('parameterDynamics', 'pitch', dynamics.pitch);
    }
    previous.yaw = current.yaw;
    previous.pitch = current.pitch;
    previous.roll = current.roll;
  };

  if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', handleData);
  }
  method.__cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', handleData);
    }
  };
  return method;
}

interface GyroscopeControlProps {
  getMarzipano: () => MarzipanoAny;
  getViewer: () => MarzipanoAny;
}

export function GyroscopeControl({ getMarzipano, getViewer }: GyroscopeControlProps) {
  const [state, setState] = useState<'off' | 'on' | 'unsupported' | 'denied'>('off');

  const toggle = useCallback(async () => {
    if (state === 'on') {
      getViewer()?.controls?.()?.disableMethod?.('deviceOrientation');
      setState('off');
      return;
    }
    if (state === 'unsupported' || state === 'denied') return;
    if (typeof window === 'undefined' || !window.DeviceOrientationEvent) {
      setState('unsupported');
      return;
    }
    const doe = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof doe.requestPermission === 'function') {
      try {
        const res = await doe.requestPermission();
        if (res !== 'granted') { setState('denied'); return; }
      } catch {
        setState('denied');
        return;
      }
    }
    const M = getMarzipano();
    const controlsObj = getViewer()?.controls?.();
    if (M && controlsObj) {
      if (!controlsObj.__deviceOrientationRegistered) {
        controlsObj.registerMethod?.('deviceOrientation', createDeviceOrientationMethod(M));
        controlsObj.__deviceOrientationRegistered = true;
      }
      controlsObj.enableMethod?.('deviceOrientation');
    }
    setState('on');
  }, [state, getMarzipano, getViewer]);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        className={state === 'on' ? BTN_ACTIVE_CLASS : BTN_CLASS}
        title={state === 'unsupported' ? 'Gyroscope not supported' : state === 'denied' ? 'Gyroscope permission denied' : 'Toggle gyroscope'}
        aria-label="Toggle gyroscope control"
        aria-pressed={state === 'on'}
      >
        <Smartphone className="w-4 h-4" />
      </button>
      {(state === 'unsupported' || state === 'denied') && (
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 rounded bg-[#09090B] border border-[#27272A] text-[9px] font-mono text-amber-400 whitespace-nowrap">
          {state === 'unsupported' ? 'Gyroscope not supported' : 'Permission denied'}
        </div>
      )}
    </div>
  );
}
