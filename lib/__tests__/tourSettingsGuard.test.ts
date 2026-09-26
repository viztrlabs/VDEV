import { resolveRoomsForSave } from '@/lib/toursRepo';

describe('resolveRoomsForSave (publish guard)', () => {
  it('Case A: preserves authored rooms when present', () => {
    const authored = [{ id: 'r1', name: 'Kitchen' }, { id: 'r2', name: 'Lounge' }];
    const result = resolveRoomsForSave({ version: 1, rooms: authored, identity: {} });
    expect(result).toBe(authored);
  });

  it('Case B: existing row without rooms resolves to empty array, never demos', () => {
    const result = resolveRoomsForSave({ version: 1, identity: { name: 'Brand' } });
    expect(result).toEqual([]);
  });

  it('Case B2: an empty rooms array is preserved as empty array', () => {
    const result = resolveRoomsForSave({ version: 1, rooms: [], identity: {} });
    expect(result).toEqual([]);
  });

  it('Case C: no row yet resolves to empty array, never demos', () => {
    expect(resolveRoomsForSave(undefined)).toEqual([]);
    expect(resolveRoomsForSave(null)).toEqual([]);
  });
});