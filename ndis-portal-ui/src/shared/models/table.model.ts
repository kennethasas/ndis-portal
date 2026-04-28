/**
 * Defines the configuration for a single table column.
 */
export interface TableColumn {
  key: string; // The property name from the data object
  label: string; // The display text for the table header

  type?:
    | 'name'
    | 'service'
    | 'category'
    | 'date'
    | 'status'
    | 'view'
    | 'action'
    | 'badge';
}
