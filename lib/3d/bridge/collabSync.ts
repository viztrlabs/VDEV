'use client';

/**
 * Collab Sync Engine
 *
 * Connects the WebSocket Collaboration Client with the EngineStore & EngineBridge.
 * Facilitates multi-user editing, cursor sharing, entity leases, and live synchronization.
 */

import { CollabClient, EditOp, CollabEvent } from '@/components/xr/collab/collabClient';
import { useEngineStore } from '@/lib/editor/engineStore';
import { engineBridge } from './engine-bridge';
import { Vector3D } from './types';

export class CollabSyncEngine {
  private client: CollabClient | null = null;
  private unsubscribeCollab: (() => void) | null = null;
  private activeLocks: Map<string, string> = new Map(); // entityId -> userId
  private isApplyingRemoteOp = false;

  public attach(client: CollabClient): void {
    if (this.client) {
      this.detach();
    }
    this.client = client;

    this.unsubscribeCollab = client.subscribe((event: CollabEvent) => {
      this.handleCollabEvent(event);
    });

    // Listen to local engine transform commits and broadcast
    engineBridge.on('TRANSFORM_COMMITTED', (evt) => {
      if (this.isApplyingRemoteOp) return;
      this.broadcastLocalEdit({
        type: 'move',
        entityId: evt.payload.entityId,
        payload: {
          position: evt.payload.position,
          rotation: evt.payload.rotation,
          scale: evt.payload.scale,
        },
      });
    });
  }

  public detach(): void {
    if (this.unsubscribeCollab) {
      this.unsubscribeCollab();
      this.unsubscribeCollab = null;
    }
    this.client = null;
    this.activeLocks.clear();
  }

  public updateCursor(point: Vector3D): void {
    if (!this.client) return;
    this.client.updateCursor(point.x, point.y, String(point.z));
  }

  public requestEntityLock(entityId: string): boolean {
    const currentLockHolder = this.activeLocks.get(entityId);
    const selfId = this.client?.getSelf().id;
    if (currentLockHolder && currentLockHolder !== selfId) {
      return false; // Locked by someone else
    }
    this.activeLocks.set(entityId, selfId || 'local');
    return true;
  }

  public releaseEntityLock(entityId: string): void {
    this.activeLocks.delete(entityId);
  }

  public isEntityLockedByPeer(entityId: string): boolean {
    const holder = this.activeLocks.get(entityId);
    const selfId = this.client?.getSelf().id;
    return Boolean(holder && holder !== selfId);
  }

  private broadcastLocalEdit(op: Omit<EditOp, 'id' | 'authorId' | 'timestamp'>): void {
    if (!this.client) return;
    this.client.applyEdit(op);
  }

  private handleCollabEvent(event: CollabEvent): void {
    if (event.kind === 'edit') {
      const op = event.op;
      const selfId = this.client?.getSelf().id;
      if (op.authorId === selfId) return; // Ignore local echo

      this.isApplyingRemoteOp = true;
      try {
        if (op.type === 'move' && op.payload) {
          const { position, rotation, scale } = op.payload as any;
          useEngineStore.getState().updateEntityTransform(
            op.entityId,
            { position, rotation, scale },
            false // Don't push remote edits into local undo stack
          );
        } else if (op.type === 'update' && op.payload) {
          if (op.payload.material) {
            const { materialId, patch } = op.payload.material as any;
            useEngineStore.getState().updateMaterial(materialId, patch, false);
          }
        }
      } finally {
        this.isApplyingRemoteOp = false;
      }
    }
  }
}

export const collabSyncEngine = new CollabSyncEngine();
