export interface UnitDefinition {
  key: string;
  label: string;
  symbol: string;
  color: string;
  isMaster?: boolean; // Optional, true if this is the master unit
  toMaster: (value: number) => number;
  fromMaster: (value: number) => number;
}

export interface BaseConverterProps {
  units: UnitDefinition[];
  formatNumber: (value: number | undefined) => string;
  parseInput: (value: string) => number | undefined;
  converter: any;
}
