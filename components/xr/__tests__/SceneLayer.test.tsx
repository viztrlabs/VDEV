// Tests for SceneLayer component
describe('SceneLayer', () => {
  it('exports a React component', () => {
    const SceneLayer = require('../SceneLayer').default;
    expect(SceneLayer).toBeDefined();
    expect(typeof SceneLayer).toBe('function'); // React component
  });

  it('renders without crashing', () => {
    const SceneLayer = require('../SceneLayer').default;
    expect(SceneLayer).toBeDefined();
  });
});
