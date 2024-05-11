import { Identifier } from './identifier';

describe('Identifier', () => {
  it('should create valid Identifier', () => {
    const identify = new Identifier('thing');

    expect(identify.toString()).toBe('minecraft:thing');
    expect(identify.namespace).toBe('minecraft');
    expect(identify.value).toBe('thing');
  });

  it('should create valid Identifier with custom namespace', () => {
    const identify = new Identifier('custom:test');

    expect(identify.toString()).toBe('custom:test');
    expect(identify.namespace).toBe('custom');
    expect(identify.value).toBe('test');
  });

  it('should throw error when create Identifier with invalid namespace', () => {
    const createIdentifier = () => new Identifier('my@namespace:test');

    expect(createIdentifier).toThrow(Error);
  });

  it('should throw error when create Identifier with invalid value', () => {
    const createIdentifier = () => new Identifier('@@@');

    expect(createIdentifier).toThrow(Error);
  });

  it('should throw error when create Identifier with more than one colon', () => {
    const createIdentifier = () => new Identifier('my_namespace:test:test');

    expect(createIdentifier).toThrow(Error);
  });

  it('should create Identifier and transform namespace & value in lower case', () => {
    const identify = new Identifier('CUSTOM:TES_T');

    expect(identify.toString()).toBe('custom:tes_t');
    expect(identify.namespace).toBe('custom');
    expect(identify.value).toBe('tes_t');
  });
});
