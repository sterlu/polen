import {useEffect, useMemo, useState} from 'react'
import './App.css'
import {
  getAllergens,
  getLocations,
  getMeasurementsForLocation,
} from "./apiUtils.ts";
import {Allergen, Location, MeasurementWithConcentrations, PollenConcentration} from "./types.ts";
import {formatDateToDate, formatDateToWeekday} from "./dateUtils.ts";
import {getColorFromGradient, hexToRgb} from "./colorUtils.ts";

const fetchPrevDays = 14;

const getColor = (concentration: PollenConcentration, allergens: Allergen[]): string => {
  const allergen = allergens.find(allergen => allergen.id === concentration.allergen);
  if (!allergen) {
    return 'white';
  }
  return getColorFromGradient(concentration.value, [
    {from: 0, color: hexToRgb('#00FF00')},
    {from: allergen.margine_bottom, color: hexToRgb('#FFFF00')},
    {from: allergen.margine_top, color: hexToRgb('#FF0000')},
  ]);
}

function App() {
  const [meta, setMeta] = useState({
    allergens: [] as Allergen[],
    locations: [] as Location[]
  });
  const [formData, setFormData] = useState({
    location: 1, // NBG
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [measurements, setMeasurements] = useState([] as MeasurementWithConcentrations[]);
  const onFormChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((formData) => ({
        ...formData,
        [e.target.name]: e.target.value,
      })
    )
  }

  useEffect(() => {
    Promise.all([
      getAllergens(),
      getLocations(),
    ])
      .then(([allergens, locations]) => {
        setMeta({allergens, locations});
      })
      .catch((e) => {
        setError((e?.message || e).toString());
      })
  }, [])

  useEffect(() => {
    if (meta.locations.length === 0) return;
    setLoading(true);
    getMeasurementsForLocation(formData.location, fetchPrevDays)
      .then((measurementsWithConcentration) => {
        console.log(measurementsWithConcentration);
        setMeasurements(measurementsWithConcentration);
      })
      .catch((e) => {
        setError((e?.message || e).toString());
      })
      .finally(() => {
        setLoading(false);
      });
  }, [meta, formData]);

  useEffect(() => {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (tableWrapper) tableWrapper.scrollTo(tableWrapper.scrollWidth, 0)
  }, [measurements]);

  const allergensWithMeasurements = useMemo(() => {
    return meta.allergens.filter(allergen => {
      return measurements.some(measurement => {
        return measurement.concentrations.some(concentration => {
          return concentration.allergen === allergen.id;
        });
      });
    });
  }, [meta.allergens, measurements]);

  const location = meta.locations.find(location => location.id === +formData.location);

  return (
    <div className="app">

      <div className="meta-wrapper">
        <div className="location">
          <select name="location" value={formData.location} onChange={onFormChange}>
            {meta.locations.map(location => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>
          {location && (
            <>
              <span>
                {/*{location.description}{' '}*/}{/*goverment fix typo pls*/}
                <a href={`https://www.google.com/maps/place/${location.latitude},${location.longitude}`} target="_blank">
                  (lat: {location.latitude}, lon: {location.longitude})
                </a>
              </span>
            </>
          )}
        </div>
        {loading && <div className="loading">Учитавање мерења...</div>}
        {error && <div className="error">{error}</div>}
      </div>

      {!loading && !error && (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
              <tr>
                <th></th>
                {measurements.map((measurement) => (
                  <th key={measurement.id}>
                    {formatDateToDate(measurement.date)},
                    <br/>
                    {formatDateToWeekday(measurement.date)}
                  </th>
                ))}
              </tr>
              </thead>
              <tbody>
              {allergensWithMeasurements.map(allergen => (
                <tr key={allergen.id}>
                  <th>
                    {allergen.localized_name}
                    {/*<br />*/}
                    {/*<span className="allergen-desc">med: {allergen.margine_bottom}, high: {allergen.margine_top}</span>*/}
                  </th>
                  {measurements.map(measurement => {
                    const concentration = measurement.concentrations.find(
                      concentration => concentration.allergen === allergen.id
                    );
                    if (!concentration) return <td key={measurement.id}>-</td>;
                    return (
                      <td
                        key={measurement.id}
                        className="concentration-cell"
                        style={{backgroundColor: getColor(concentration, meta.allergens)}}
                      >
                        {concentration?.value}
                      </td>
                    );
                  })}
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default App
