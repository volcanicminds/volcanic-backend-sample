// The managers this application could take from @volcanicminds/tools, checked against the
// interfaces of @volcanicminds/backend. The two packages do not depend on each other, so this is
// the one place where both are installed and a drift between them fails to compile.
import type { TransferManagement } from '@volcanicminds/backend'
import type { TransferManager } from '@volcanicminds/tools/transfer'

type Implements<T extends Contract, Contract> = T

export type TransferContract = Implements<TransferManager, TransferManagement>
