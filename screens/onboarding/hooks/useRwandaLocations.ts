import {
  getAllDistricts,
  getSectorsByDistrictName,
} from '@/services/rwandaLocation.service';
import { useQuery } from '@tanstack/react-query';

export const rwandaLocationKeys = {
  districts: ['rwanda-locations', 'districts'] as const,
  sectors: (districtName: string) => ['rwanda-locations', 'sectors', districtName] as const,
};

export const useRwandaDistricts = () =>
  useQuery({
    queryKey: rwandaLocationKeys.districts,
    queryFn: getAllDistricts,
    staleTime: Infinity,
  });

export const useRwandaSectors = (districtName: string) =>
  useQuery({
    queryKey: rwandaLocationKeys.sectors(districtName),
    queryFn: () => getSectorsByDistrictName(districtName),
    enabled: districtName.trim().length > 0,
    staleTime: Infinity,
  });
