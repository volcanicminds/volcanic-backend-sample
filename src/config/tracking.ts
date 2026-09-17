//
// What gets an audit trail.
//
// `changeEntity` is gone: in v5 there is one `change` table per container, written inside the
// container the request ran in. In v4 the trail was configurable and, in multi-tenant, it was
// silently empty — the tracker called the manager without a context, the manager refused, and
// the refusal became a log line nobody read (defect D-05).
//
// A failed tracking write now fails the request, unless a route says otherwise with
// `tracking: { strict: false }`. An untracked write on a system that promises an audit trail
// is worse than a visible error.
//
export default {
  config: {
    enableAll: false, // optional, default true
    primaryKey: 'id' // optional, default 'id'
  },
  changes: [
    {
      method: 'PUT',
      path: '/partners/:id',
      fields: { excludes: ['createdAt', 'updatedAt'] },
      entity: 'partner'
    }
  ]
}
