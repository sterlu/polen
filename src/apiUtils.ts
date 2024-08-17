import {Allergen, Location, Measurement, MeasurementWithConcentrations, PollenConcentration} from "./types.ts";
import {dateStampFromDaysAgo} from "./dateUtils.ts";

const API_URL = 'http://polen.sepa.gov.rs/api/opendata';

export const getAllergens = async (): Promise<Allergen[]> => {
  const res = await fetch(`${API_URL}/allergens/`);
  return res.json();
}

export const getLocations = async (): Promise<Location[]> => {
  const res = await fetch(`${API_URL}/locations/`);
  return res.json();
}

export const getMeasurements = async (locationId: number, dateAfter: string): Promise<Measurement[]> => {
  const res = await fetch(`${API_URL}/pollens/?date_after=${dateAfter}&location_ids=${locationId}`);
  const {results} = await res.json();
  return results;
}

export const getPollenConcentrations = async (concentrationId: number): Promise<PollenConcentration> => {
  const res = await fetch(`${API_URL}/concentrations/${concentrationId}/`);
  return res.json();
}

export const getMeasurementsForLocation = async (locationId: number, fetchPrevDays: number): Promise<MeasurementWithConcentrations[]> => {
  const dateAfter = dateStampFromDaysAgo(fetchPrevDays);
  const _measurements = await getMeasurements(locationId, dateAfter);

  // Pad with empty arrays for days with missing measurements
  const measurements = [
    ..._measurements,
    ...Array(fetchPrevDays - _measurements.length).fill(null)
      .map((_, i) => ({
        id: -i,
        location: locationId,
        date: dateStampFromDaysAgo(fetchPrevDays - _measurements.length - i),
        concentrations: [],
      })),
  ];

  const measurementsWithConcentration = [] as MeasurementWithConcentrations[];
  for (const measurement of measurements) {
    const concentrations = await Promise.all(
      measurement.concentrations.map(getPollenConcentrations)
    );
    measurementsWithConcentration.push({
      ...measurement,
      concentrations,
    });
  }
  return measurementsWithConcentration;
}
