export interface TableColumn {
  key: string;
  label: string;
  type: string;
  // Update this to allow both strings and action objects
  actionLabel?: string | { label: string; actionKey: string; class?: string }[];
}
