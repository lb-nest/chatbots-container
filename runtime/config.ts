export class ConfigByEnvironmemt {
  constructor() {
    Deno.env.set('WS_URL', 'ws://localhost:1337');
    Deno.env.set(
      'TOKEN',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwicHJvamVjdCI6eyJpZCI6MCwicm9sZSI6MH0sImlhdCI6MTY1MzY1MjY1N30.ECkF_ow11SrRw43sNEEZPrGisSx30-2uEl6Oa5D5Ms4',
    );
  }

  get(key: string) {
    return Deno.env.get(key);
  }
}
