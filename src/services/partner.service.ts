import { BaseService } from './base.service.js'

class PartnerService extends BaseService<'partner'> {
  constructor() {
    super('partner')
  }

  // Override applyPermissions() here to enforce row-level security: the condition it returns
  // is AND-ed after everything the URL asked for, so no filter a caller writes reaches
  // around it.
}

export const partnerService = new PartnerService()
