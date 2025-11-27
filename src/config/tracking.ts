export default {
  config: {
    enableAll: false, // optional, default true
    changeEntity: 'Change', // optional, default 'Change'
    primaryKey: 'id' // optional, default 'id'
  },
  changes: [
    {
      method: 'PUT',
      path: '/partners/:id',
      fields: { excludes: ['createdAt', 'updatedAt'] },
      entity: 'Partner'
    }
  ]
}
