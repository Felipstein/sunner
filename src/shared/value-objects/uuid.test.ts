import { UUID } from './uuid';

describe('UUID', () => {
  it('should create a valid UUID', () => {
    const uuid = new UUID('e242ed3b-b4a1-4336-95ad-a02d43f6a9fc');

    expect(uuid.toString()).toBe('e242ed3b-b4a1-4336-95ad-a02d43f6a9fc');
  });

  it.each([
    '1234567-e89b-12d3-a456-426614174000',
    'z23e4567-e89b-12d3-a456-426614174000',
    '123e4567-89b-12d3-a456-426614174000',
    '123e4567-e89b-12d3-a456-42661417400g',
    '123e4567e89b12d3a456426614174000',
  ])('should throw an error when create invalid UUID', (invalidUUID) => {
    const createUUID = () => new UUID(invalidUUID);

    expect(createUUID).toThrow(Error);
  });

  it.each([
    { uuid: '7c9a6b8a-16f0-11ea-a8d5-2f67b402bd82', expectedVersion: 1 },
    { uuid: '7c9a6b8a-16f0-21ea-a8d5-2f67b402bd82', expectedVersion: 2 },
    { uuid: '237e9877-e79b-32d4-a765-3213c8c9c1da', expectedVersion: 3 },
    { uuid: 'e242ed3b-b4a1-4336-95ad-a02d43f6a9fc', expectedVersion: 4 },
    { uuid: '4aedf69d-e6a5-5343-bfa9-841b4b0f6d76', expectedVersion: 5 },
  ])('should return correct version of UUID', ({ uuid: fromString, expectedVersion }) => {
    const uuid = new UUID(fromString);

    expect(uuid.version).toBe(expectedVersion);
  });
});
