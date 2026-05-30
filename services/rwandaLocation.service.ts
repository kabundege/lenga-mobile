import { rwandaLocation, type District, type Sector } from '@devrw/rwanda-location';

const sortByName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name));

export const getAllDistricts = (): District[] => sortByName(rwandaLocation.getDistricts());

export const getDistrictByName = (districtName: string): District | null => {
  const normalized = districtName.trim().toLowerCase();
  if (!normalized) return null;

  return (
    rwandaLocation.getDistricts().find((district) => district.name.toLowerCase() === normalized) ??
    null
  );
};

export const getSectorsByDistrictName = (districtName: string): Sector[] => {
  const district = getDistrictByName(districtName);
  if (!district) return [];
  return sortByName(rwandaLocation.getSectors(district.code));
};
