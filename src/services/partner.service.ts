import { Partner } from '../entities/partner.e.js'
import { BaseService } from './base.service.js'

class PartnerService extends BaseService<Partner> {
  constructor() {
    super(Partner)
    // Partner has no relations to eager-load.
    // (The legacy controller loaded a non-existent `company` relation — dropped here.)
    this.relations = {}
  }

  // Override applyPermissions() here to enforce Row Level Security once userContext is populated.
}

export const partnerService = new PartnerService()
