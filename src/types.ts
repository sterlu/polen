
export type Allergen = {
  id: number;
  name: string;
  localized_name: string;
  margine_top: number;
  margine_bottom: number;
  type: number;
  allergenicity: number;
  allergenicity_display: string;
};

export type Location = {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
  description: string;
};

export type Measurement = {
  id: number;
  location: number;
  date: string;
  concentrations: number[];
};

export type PollenConcentration = {
  id: number;
  allergen: number;
  value: number;
  pollen: number;
};

export type MeasurementWithConcentrations = {
  id: number;
  location: number;
  date: string;
  concentrations: PollenConcentration[];
};
