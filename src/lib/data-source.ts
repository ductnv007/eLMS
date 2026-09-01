export type DataSource = 'mock' | 'supabase' | 'remote-api';

export const DATA_SOURCE = (process.env.DATA_SOURCE as DataSource) || 'mock';

export function getDataSource() {
  return DATA_SOURCE;
}
