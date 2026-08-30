import { CollabClient } from '../collab/collabClient';

describe('CollabClient', () => {
  it('initializes a self collaborator', () => {
    const client = new CollabClient({ userId: 'u1', userName: 'Alice' });
    const all = client.getCollaborators();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe('u1');
    expect(all[0].name).toBe('Alice');
    client.dispose();
  });

  it('emits presence events on subscribe', () => {
    const client = new CollabClient({ userId: 'u2', userName: 'Bob' });
    const events: string[] = [];
    client.subscribe((e) => events.push(e.kind));
    client.updateStatus('editing');
    expect(events).toContain('presence');
    expect(client.getCollaborators()[0].status).toBe('editing');
    client.dispose();
  });

  it('broadcasts edits with author + timestamp', () => {
    const client = new CollabClient({ userId: 'u3', userName: 'Carol' });
    let captured: any = null;
    client.subscribe((e) => {
      if (e.kind === 'edit') captured = e.op;
    });
    const op = client.applyEdit({ type: 'create', entityId: 'e1', payload: { x: 1 } });
    expect(captured).not.toBeNull();
    expect(captured.authorId).toBe('u3');
    expect(op.timestamp).toBeGreaterThan(0);
    client.dispose();
  });
});
