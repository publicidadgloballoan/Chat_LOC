
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.SaaSCompanyScalarFieldEnum = {
  id: 'id',
  businessName: 'businessName',
  legalName: 'legalName',
  taxId: 'taxId',
  taxType: 'taxType',
  brandManualUrl: 'brandManualUrl',
  phones: 'phones',
  website: 'website',
  emails: 'emails',
  licenseToken: 'licenseToken',
  createdAt: 'createdAt'
};

exports.Prisma.SAAgentScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  name: 'name',
  email: 'email',
  passwordHash: 'passwordHash',
  phone: 'phone',
  role: 'role',
  registrationToken: 'registrationToken',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.ChannelScalarFieldEnum = {
  id: 'id',
  companyId: 'companyId',
  platform: 'platform',
  botName: 'botName',
  instanceName: 'instanceName',
  configA1: 'configA1',
  configA2: 'configA2',
  configA3: 'configA3',
  debugMode: 'debugMode',
  swarmRole: 'swarmRole',
  parentId: 'parentId',
  loadCount: 'loadCount',
  status: 'status',
  createdAt: 'createdAt',
  credentials: 'credentials'
};

exports.Prisma.KnowledgeScalarFieldEnum = {
  id: 'id',
  channelId: 'channelId',
  fileName: 'fileName',
  filePath: 'filePath',
  fileType: 'fileType',
  embeddingStatus: 'embeddingStatus',
  lastUpdated: 'lastUpdated'
};

exports.Prisma.TicketScalarFieldEnum = {
  id: 'id',
  channelId: 'channelId',
  customerNumber: 'customerNumber',
  customerName: 'customerName',
  status: 'status',
  lastAgentId: 'lastAgentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductStockScalarFieldEnum = {
  id: 'id',
  channelId: 'channelId',
  productId: 'productId',
  breed: 'breed',
  sex: 'sex',
  age: 'age',
  color: 'color',
  status: 'status'
};

exports.Prisma.PricingConfigScalarFieldEnum = {
  id: 'id',
  channelId: 'channelId',
  cashPrice: 'cashPrice',
  listPrice: 'listPrice',
  minDeposit: 'minDeposit',
  supportedQuotas: 'supportedQuotas',
  approxInterest: 'approxInterest'
};

exports.Prisma.CompanyIdentityScalarFieldEnum = {
  id: 'id',
  channelId: 'channelId',
  mission: 'mission',
  vision: 'vision',
  brandManual: 'brandManual',
  voiceTone: 'voiceTone',
  faqs: 'faqs'
};

exports.Prisma.LogisticsConfigScalarFieldEnum = {
  id: 'id',
  channelId: 'channelId',
  coverageZones: 'coverageZones',
  deliveryTerms: 'deliveryTerms',
  daysAndHours: 'daysAndHours',
  interiorCost: 'interiorCost'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};


exports.Prisma.ModelName = {
  SaaSCompany: 'SaaSCompany',
  SAAgent: 'SAAgent',
  Channel: 'Channel',
  Knowledge: 'Knowledge',
  Ticket: 'Ticket',
  ProductStock: 'ProductStock',
  PricingConfig: 'PricingConfig',
  CompanyIdentity: 'CompanyIdentity',
  LogisticsConfig: 'LogisticsConfig'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
