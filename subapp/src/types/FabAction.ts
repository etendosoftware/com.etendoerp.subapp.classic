export interface FabAction {
  key: string;
  icon: string;
  label: string;
  process: any;
  onPress: (fabProcess: FabProcess) => void;
}

export interface FabProcess {
  smfmuScan: boolean;
  id: string;
}
