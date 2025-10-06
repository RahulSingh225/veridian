'use client';

import { useState, useEffect } from 'react';

interface Unit {
  name: string;
  value: number | ((val: number) => number);
}

interface Category {
  name: string;
  base: string;
  units: Record<string, number | ((val: number) => number)>;
}

const categories: Category[] = [
  // Length
  {
    name: 'length',
    base: 'meter',
    units: {
      nanometer: 1e-9,
      micrometer: 1e-6,
      millimeter: 0.001,
      centimeter: 0.01,
      meter: 1,
      kilometer: 1000,
      inch: 0.0254,
      foot: 0.3048,
      yard: 0.9144,
      mile: 1609.34,
      nautical_mile: 1852,
    },
  },
  // Area
  {
    name: 'area',
    base: 'square_meter',
    units: {
      square_millimeter: 1e-6,
      square_centimeter: 0.0001,
      square_meter: 1,
      square_kilometer: 1e6,
      square_inch: 0.00064516,
      square_foot: 0.092903,
      square_yard: 0.836127,
      acre: 4046.86,
      hectare: 10000,
    },
  },
  // Volume
  {
    name: 'volume',
    base: 'liter',
    units: {
      milliliter: 0.001,
      liter: 1,
      cubic_meter: 1000,
      gallon: 3.78541,
      quart: 0.946353,
      pint: 0.473176,
      fluid_ounce: 0.0295735,
      cubic_inch: 0.0163871,
      cubic_foot: 28.3168,
    },
  },
  // Mass
  {
    name: 'mass',
    base: 'kilogram',
    units: {
      microgram: 1e-9,
      milligram: 0.000001,
      gram: 0.001,
      kilogram: 1,
      tonne: 1000,
      ounce: 0.0283495,
      pound: 0.453592,
      stone: 6.35029,
    },
  },
  // Temperature
  {
    name: 'temperature',
    base: 'celsius',
    units: {
      celsius: (value: number) => value,
      fahrenheit: (value: number) => (value * 9 / 5) + 32,
      kelvin: (value: number) => value + 273.15,
    },
  },
  // Pressure
  {
    name: 'pressure',
    base: 'pascal',
    units: {
      pascal: 1,
      kilopascal: 1000,
      bar: 100000,
      atmosphere: 101325,
      psi: 6894.76,
      torr: 133.322,
      mmhg: 133.322,
    },
  },
  // Energy
  {
    name: 'energy',
    base: 'joule',
    units: {
      joule: 1,
      kilojoule: 1000,
      calorie: 4.184,
      kilocalorie: 4184,
      watt_hour: 3600,
      kilowatt_hour: 3600000,
      btu: 1055.06,
    },
  },
  // Power
  {
    name: 'power',
    base: 'watt',
    units: {
      watt: 1,
      kilowatt: 1000,
      horsepower: 745.7,
      btu_per_hour: 0.293071,
    },
  },
  // Speed
  {
    name: 'speed',
    base: 'meter_per_second',
    units: {
      meter_per_second: 1,
      kilometer_per_hour: 0.277778,
      mile_per_hour: 0.44704,
      knot: 0.514444,
      foot_per_second: 0.3048,
    },
  },
  // Time
  {
    name: 'time',
    base: 'second',
    units: {
      nanosecond: 1e-9,
      microsecond: 1e-6,
      millisecond: 0.001,
      second: 1,
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      year: 31536000,
    },
  },
  // Angle
  {
    name: 'angle',
    base: 'radian',
    units: {
      radian: 1,
      degree: Math.PI / 180,
      gradian: Math.PI / 200,
      arcminute: Math.PI / (180 * 60),
      arcsecond: Math.PI / (180 * 3600),
    },
  },
  // Data Storage
  {
    name: 'data',
    base: 'byte',
    units: {
      bit: 0.125,
      byte: 1,
      kilobyte: 1024,
      megabyte: 1024 * 1024,
      gigabyte: 1024 * 1024 * 1024,
      terabyte: 1024 * 1024 * 1024 * 1024,
    },
  },
  // Fuel Efficiency
  {
    name: 'fuel_efficiency',
    base: 'kilometer_per_liter',
    units: {
      kilometer_per_liter: 1,
      mile_per_gallon: 0.425144,
      liter_per_100km: 100,
    },
  },
  // Torque
  {
    name: 'torque',
    base: 'newton_meter',
    units: {
      newton_meter: 1,
      foot_pound: 1.35582,
      inch_pound: 0.112985,
    },
  },
  // Frequency
  {
    name: 'frequency',
    base: 'hertz',
    units: {
      hertz: 1,
      kilohertz: 1000,
      megahertz: 1000000,
      gigahertz: 1000000000,
    },
  },
  // Force
  {
    name: 'force',
    base: 'newton',
    units: {
      newton: 1,
      kilonewton: 1000,
      dyne: 0.00001,
      pound_force: 4.44822,
      kilogram_force: 9.80665,
    },
  },
];

const UnitConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('length');
  const [inputValue, setInputValue] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('meter');
  const [toUnit, setToUnit] = useState<string>('inch');
  const [outputValue, setOutputValue] = useState<number>(0);
  const [currentCategory, setCurrentCategory] = useState<Category>(categories[0]);

  useEffect(() => {
    const cat = categories.find((c) => c.name === selectedCategory);
    if (cat) {
      setCurrentCategory(cat);
      setFromUnit(cat.base);
      setToUnit(Object.keys(cat.units)[1] || cat.base);
    }
    convert();
  }, [selectedCategory]);

  useEffect(() => {
    convert();
  }, [inputValue, fromUnit, toUnit]);

  const convert = () => {
    const category = categories.find((c) => c.name === selectedCategory);
    if (!category) return;

    let baseValue: number;
    const fromConverter = category.units[fromUnit];
    const toConverter = category.units[toUnit];

    // Handle temperature special cases (non-linear)
    if (selectedCategory === 'temperature') {
      baseValue = typeof fromConverter === 'function' ? fromConverter(inputValue) : inputValue / (fromConverter as number);
      const result = typeof toConverter === 'function' ? toConverter(baseValue) : baseValue * (toConverter as number);
      setOutputValue(result);
    } else {
      // Linear conversions
      baseValue = typeof fromConverter === 'function' ? fromConverter(inputValue) : inputValue * (fromConverter as number);
      const result = typeof toConverter === 'function' ? toConverter(baseValue) : baseValue / (toConverter as number);
      setOutputValue(result);
    }
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const getUnitOptions = (units: Record<string, number | ((val: number) => number)>) => {
    return Object.keys(units).map((key) => (
      <option key={key} value={key}>
        {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </option>
    ));
  };

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl mx-auto">
      <div className="card-body p-6">
        <h2 className="card-title text-2xl font-bold mb-6 text-center">Universal Unit Converter</h2>
        
        {/* Category Select */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Category</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select select-bordered w-full"
          >
            {categories.map((cat) => (
              <option key={cat.name} value={cat.name}>
                {cat.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
        
        {/* From Input */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">From</span>
          </label>
          <div className="join w-full">
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
              placeholder="Enter value"
              className="input input-bordered join-item flex-1"
              step="any"
            />
            <select
              value={fromUnit}
              onChange={(e) => setFromUnit(e.target.value)}
              className="select select-bordered join-item w-48"
            >
              {getUnitOptions(currentCategory.units)}
            </select>
          </div>
        </div>
        
        {/* Swap Button */}
        <div className="flex justify-center mb-4">
          <button onClick={swapUnits} className="btn btn-square btn-outline">
            ↔
          </button>
        </div>
        
        {/* To Output */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">To</span>
          </label>
          <div className="join w-full">
            <input
              type="number"
              value={outputValue.toFixed(6)}
              readOnly
              placeholder="Result"
              className="input input-bordered join-item flex-1 bg-base-200"
              step="any"
            />
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="select select-bordered join-item w-48"
            >
              {getUnitOptions(currentCategory.units)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;