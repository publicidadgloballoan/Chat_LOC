
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model SaaSCompany
 * 
 */
export type SaaSCompany = $Result.DefaultSelection<Prisma.$SaaSCompanyPayload>
/**
 * Model SAAgent
 * 
 */
export type SAAgent = $Result.DefaultSelection<Prisma.$SAAgentPayload>
/**
 * Model Channel
 * 
 */
export type Channel = $Result.DefaultSelection<Prisma.$ChannelPayload>
/**
 * Model Knowledge
 * 
 */
export type Knowledge = $Result.DefaultSelection<Prisma.$KnowledgePayload>
/**
 * Model Ticket
 * 
 */
export type Ticket = $Result.DefaultSelection<Prisma.$TicketPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more SaaSCompanies
 * const saaSCompanies = await prisma.saaSCompany.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more SaaSCompanies
   * const saaSCompanies = await prisma.saaSCompany.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.saaSCompany`: Exposes CRUD operations for the **SaaSCompany** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SaaSCompanies
    * const saaSCompanies = await prisma.saaSCompany.findMany()
    * ```
    */
  get saaSCompany(): Prisma.SaaSCompanyDelegate<ExtArgs>;

  /**
   * `prisma.sAAgent`: Exposes CRUD operations for the **SAAgent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SAAgents
    * const sAAgents = await prisma.sAAgent.findMany()
    * ```
    */
  get sAAgent(): Prisma.SAAgentDelegate<ExtArgs>;

  /**
   * `prisma.channel`: Exposes CRUD operations for the **Channel** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Channels
    * const channels = await prisma.channel.findMany()
    * ```
    */
  get channel(): Prisma.ChannelDelegate<ExtArgs>;

  /**
   * `prisma.knowledge`: Exposes CRUD operations for the **Knowledge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Knowledges
    * const knowledges = await prisma.knowledge.findMany()
    * ```
    */
  get knowledge(): Prisma.KnowledgeDelegate<ExtArgs>;

  /**
   * `prisma.ticket`: Exposes CRUD operations for the **Ticket** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tickets
    * const tickets = await prisma.ticket.findMany()
    * ```
    */
  get ticket(): Prisma.TicketDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    SaaSCompany: 'SaaSCompany',
    SAAgent: 'SAAgent',
    Channel: 'Channel',
    Knowledge: 'Knowledge',
    Ticket: 'Ticket'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "saaSCompany" | "sAAgent" | "channel" | "knowledge" | "ticket"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      SaaSCompany: {
        payload: Prisma.$SaaSCompanyPayload<ExtArgs>
        fields: Prisma.SaaSCompanyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SaaSCompanyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SaaSCompanyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>
          }
          findFirst: {
            args: Prisma.SaaSCompanyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SaaSCompanyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>
          }
          findMany: {
            args: Prisma.SaaSCompanyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>[]
          }
          create: {
            args: Prisma.SaaSCompanyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>
          }
          createMany: {
            args: Prisma.SaaSCompanyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SaaSCompanyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>[]
          }
          delete: {
            args: Prisma.SaaSCompanyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>
          }
          update: {
            args: Prisma.SaaSCompanyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>
          }
          deleteMany: {
            args: Prisma.SaaSCompanyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SaaSCompanyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SaaSCompanyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SaaSCompanyPayload>
          }
          aggregate: {
            args: Prisma.SaaSCompanyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSaaSCompany>
          }
          groupBy: {
            args: Prisma.SaaSCompanyGroupByArgs<ExtArgs>
            result: $Utils.Optional<SaaSCompanyGroupByOutputType>[]
          }
          count: {
            args: Prisma.SaaSCompanyCountArgs<ExtArgs>
            result: $Utils.Optional<SaaSCompanyCountAggregateOutputType> | number
          }
        }
      }
      SAAgent: {
        payload: Prisma.$SAAgentPayload<ExtArgs>
        fields: Prisma.SAAgentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SAAgentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SAAgentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>
          }
          findFirst: {
            args: Prisma.SAAgentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SAAgentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>
          }
          findMany: {
            args: Prisma.SAAgentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>[]
          }
          create: {
            args: Prisma.SAAgentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>
          }
          createMany: {
            args: Prisma.SAAgentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SAAgentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>[]
          }
          delete: {
            args: Prisma.SAAgentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>
          }
          update: {
            args: Prisma.SAAgentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>
          }
          deleteMany: {
            args: Prisma.SAAgentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SAAgentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SAAgentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SAAgentPayload>
          }
          aggregate: {
            args: Prisma.SAAgentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSAAgent>
          }
          groupBy: {
            args: Prisma.SAAgentGroupByArgs<ExtArgs>
            result: $Utils.Optional<SAAgentGroupByOutputType>[]
          }
          count: {
            args: Prisma.SAAgentCountArgs<ExtArgs>
            result: $Utils.Optional<SAAgentCountAggregateOutputType> | number
          }
        }
      }
      Channel: {
        payload: Prisma.$ChannelPayload<ExtArgs>
        fields: Prisma.ChannelFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChannelFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChannelFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          findFirst: {
            args: Prisma.ChannelFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChannelFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          findMany: {
            args: Prisma.ChannelFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>[]
          }
          create: {
            args: Prisma.ChannelCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          createMany: {
            args: Prisma.ChannelCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChannelCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>[]
          }
          delete: {
            args: Prisma.ChannelDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          update: {
            args: Prisma.ChannelUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          deleteMany: {
            args: Prisma.ChannelDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChannelUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChannelUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChannelPayload>
          }
          aggregate: {
            args: Prisma.ChannelAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChannel>
          }
          groupBy: {
            args: Prisma.ChannelGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChannelGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChannelCountArgs<ExtArgs>
            result: $Utils.Optional<ChannelCountAggregateOutputType> | number
          }
        }
      }
      Knowledge: {
        payload: Prisma.$KnowledgePayload<ExtArgs>
        fields: Prisma.KnowledgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.KnowledgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.KnowledgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          findFirst: {
            args: Prisma.KnowledgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.KnowledgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          findMany: {
            args: Prisma.KnowledgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>[]
          }
          create: {
            args: Prisma.KnowledgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          createMany: {
            args: Prisma.KnowledgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.KnowledgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>[]
          }
          delete: {
            args: Prisma.KnowledgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          update: {
            args: Prisma.KnowledgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          deleteMany: {
            args: Prisma.KnowledgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.KnowledgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.KnowledgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$KnowledgePayload>
          }
          aggregate: {
            args: Prisma.KnowledgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateKnowledge>
          }
          groupBy: {
            args: Prisma.KnowledgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.KnowledgeCountArgs<ExtArgs>
            result: $Utils.Optional<KnowledgeCountAggregateOutputType> | number
          }
        }
      }
      Ticket: {
        payload: Prisma.$TicketPayload<ExtArgs>
        fields: Prisma.TicketFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TicketFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TicketFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          findFirst: {
            args: Prisma.TicketFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TicketFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          findMany: {
            args: Prisma.TicketFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>[]
          }
          create: {
            args: Prisma.TicketCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          createMany: {
            args: Prisma.TicketCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TicketCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>[]
          }
          delete: {
            args: Prisma.TicketDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          update: {
            args: Prisma.TicketUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          deleteMany: {
            args: Prisma.TicketDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TicketUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TicketUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TicketPayload>
          }
          aggregate: {
            args: Prisma.TicketAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTicket>
          }
          groupBy: {
            args: Prisma.TicketGroupByArgs<ExtArgs>
            result: $Utils.Optional<TicketGroupByOutputType>[]
          }
          count: {
            args: Prisma.TicketCountArgs<ExtArgs>
            result: $Utils.Optional<TicketCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type SaaSCompanyCountOutputType
   */

  export type SaaSCompanyCountOutputType = {
    agents: number
    channels: number
  }

  export type SaaSCompanyCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agents?: boolean | SaaSCompanyCountOutputTypeCountAgentsArgs
    channels?: boolean | SaaSCompanyCountOutputTypeCountChannelsArgs
  }

  // Custom InputTypes
  /**
   * SaaSCompanyCountOutputType without action
   */
  export type SaaSCompanyCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompanyCountOutputType
     */
    select?: SaaSCompanyCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SaaSCompanyCountOutputType without action
   */
  export type SaaSCompanyCountOutputTypeCountAgentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SAAgentWhereInput
  }

  /**
   * SaaSCompanyCountOutputType without action
   */
  export type SaaSCompanyCountOutputTypeCountChannelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChannelWhereInput
  }


  /**
   * Count Type SAAgentCountOutputType
   */

  export type SAAgentCountOutputType = {
    tickets: number
  }

  export type SAAgentCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    tickets?: boolean | SAAgentCountOutputTypeCountTicketsArgs
  }

  // Custom InputTypes
  /**
   * SAAgentCountOutputType without action
   */
  export type SAAgentCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgentCountOutputType
     */
    select?: SAAgentCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * SAAgentCountOutputType without action
   */
  export type SAAgentCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
  }


  /**
   * Count Type ChannelCountOutputType
   */

  export type ChannelCountOutputType = {
    knowledgeBase: number
    tickets: number
  }

  export type ChannelCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    knowledgeBase?: boolean | ChannelCountOutputTypeCountKnowledgeBaseArgs
    tickets?: boolean | ChannelCountOutputTypeCountTicketsArgs
  }

  // Custom InputTypes
  /**
   * ChannelCountOutputType without action
   */
  export type ChannelCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChannelCountOutputType
     */
    select?: ChannelCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChannelCountOutputType without action
   */
  export type ChannelCountOutputTypeCountKnowledgeBaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeWhereInput
  }

  /**
   * ChannelCountOutputType without action
   */
  export type ChannelCountOutputTypeCountTicketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
  }


  /**
   * Models
   */

  /**
   * Model SaaSCompany
   */

  export type AggregateSaaSCompany = {
    _count: SaaSCompanyCountAggregateOutputType | null
    _avg: SaaSCompanyAvgAggregateOutputType | null
    _sum: SaaSCompanySumAggregateOutputType | null
    _min: SaaSCompanyMinAggregateOutputType | null
    _max: SaaSCompanyMaxAggregateOutputType | null
  }

  export type SaaSCompanyAvgAggregateOutputType = {
    id: number | null
  }

  export type SaaSCompanySumAggregateOutputType = {
    id: number | null
  }

  export type SaaSCompanyMinAggregateOutputType = {
    id: number | null
    businessName: string | null
    legalName: string | null
    taxId: string | null
    taxType: string | null
    brandManualUrl: string | null
    createdAt: Date | null
  }

  export type SaaSCompanyMaxAggregateOutputType = {
    id: number | null
    businessName: string | null
    legalName: string | null
    taxId: string | null
    taxType: string | null
    brandManualUrl: string | null
    createdAt: Date | null
  }

  export type SaaSCompanyCountAggregateOutputType = {
    id: number
    businessName: number
    legalName: number
    taxId: number
    taxType: number
    brandManualUrl: number
    createdAt: number
    _all: number
  }


  export type SaaSCompanyAvgAggregateInputType = {
    id?: true
  }

  export type SaaSCompanySumAggregateInputType = {
    id?: true
  }

  export type SaaSCompanyMinAggregateInputType = {
    id?: true
    businessName?: true
    legalName?: true
    taxId?: true
    taxType?: true
    brandManualUrl?: true
    createdAt?: true
  }

  export type SaaSCompanyMaxAggregateInputType = {
    id?: true
    businessName?: true
    legalName?: true
    taxId?: true
    taxType?: true
    brandManualUrl?: true
    createdAt?: true
  }

  export type SaaSCompanyCountAggregateInputType = {
    id?: true
    businessName?: true
    legalName?: true
    taxId?: true
    taxType?: true
    brandManualUrl?: true
    createdAt?: true
    _all?: true
  }

  export type SaaSCompanyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaaSCompany to aggregate.
     */
    where?: SaaSCompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaaSCompanies to fetch.
     */
    orderBy?: SaaSCompanyOrderByWithRelationInput | SaaSCompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SaaSCompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaaSCompanies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaaSCompanies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SaaSCompanies
    **/
    _count?: true | SaaSCompanyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SaaSCompanyAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SaaSCompanySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SaaSCompanyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SaaSCompanyMaxAggregateInputType
  }

  export type GetSaaSCompanyAggregateType<T extends SaaSCompanyAggregateArgs> = {
        [P in keyof T & keyof AggregateSaaSCompany]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSaaSCompany[P]>
      : GetScalarType<T[P], AggregateSaaSCompany[P]>
  }




  export type SaaSCompanyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SaaSCompanyWhereInput
    orderBy?: SaaSCompanyOrderByWithAggregationInput | SaaSCompanyOrderByWithAggregationInput[]
    by: SaaSCompanyScalarFieldEnum[] | SaaSCompanyScalarFieldEnum
    having?: SaaSCompanyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SaaSCompanyCountAggregateInputType | true
    _avg?: SaaSCompanyAvgAggregateInputType
    _sum?: SaaSCompanySumAggregateInputType
    _min?: SaaSCompanyMinAggregateInputType
    _max?: SaaSCompanyMaxAggregateInputType
  }

  export type SaaSCompanyGroupByOutputType = {
    id: number
    businessName: string
    legalName: string | null
    taxId: string
    taxType: string | null
    brandManualUrl: string | null
    createdAt: Date
    _count: SaaSCompanyCountAggregateOutputType | null
    _avg: SaaSCompanyAvgAggregateOutputType | null
    _sum: SaaSCompanySumAggregateOutputType | null
    _min: SaaSCompanyMinAggregateOutputType | null
    _max: SaaSCompanyMaxAggregateOutputType | null
  }

  type GetSaaSCompanyGroupByPayload<T extends SaaSCompanyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SaaSCompanyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SaaSCompanyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SaaSCompanyGroupByOutputType[P]>
            : GetScalarType<T[P], SaaSCompanyGroupByOutputType[P]>
        }
      >
    >


  export type SaaSCompanySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessName?: boolean
    legalName?: boolean
    taxId?: boolean
    taxType?: boolean
    brandManualUrl?: boolean
    createdAt?: boolean
    agents?: boolean | SaaSCompany$agentsArgs<ExtArgs>
    channels?: boolean | SaaSCompany$channelsArgs<ExtArgs>
    _count?: boolean | SaaSCompanyCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["saaSCompany"]>

  export type SaaSCompanySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    businessName?: boolean
    legalName?: boolean
    taxId?: boolean
    taxType?: boolean
    brandManualUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["saaSCompany"]>

  export type SaaSCompanySelectScalar = {
    id?: boolean
    businessName?: boolean
    legalName?: boolean
    taxId?: boolean
    taxType?: boolean
    brandManualUrl?: boolean
    createdAt?: boolean
  }

  export type SaaSCompanyInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    agents?: boolean | SaaSCompany$agentsArgs<ExtArgs>
    channels?: boolean | SaaSCompany$channelsArgs<ExtArgs>
    _count?: boolean | SaaSCompanyCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SaaSCompanyIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $SaaSCompanyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SaaSCompany"
    objects: {
      agents: Prisma.$SAAgentPayload<ExtArgs>[]
      channels: Prisma.$ChannelPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      businessName: string
      legalName: string | null
      taxId: string
      taxType: string | null
      brandManualUrl: string | null
      createdAt: Date
    }, ExtArgs["result"]["saaSCompany"]>
    composites: {}
  }

  type SaaSCompanyGetPayload<S extends boolean | null | undefined | SaaSCompanyDefaultArgs> = $Result.GetResult<Prisma.$SaaSCompanyPayload, S>

  type SaaSCompanyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SaaSCompanyFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SaaSCompanyCountAggregateInputType | true
    }

  export interface SaaSCompanyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SaaSCompany'], meta: { name: 'SaaSCompany' } }
    /**
     * Find zero or one SaaSCompany that matches the filter.
     * @param {SaaSCompanyFindUniqueArgs} args - Arguments to find a SaaSCompany
     * @example
     * // Get one SaaSCompany
     * const saaSCompany = await prisma.saaSCompany.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SaaSCompanyFindUniqueArgs>(args: SelectSubset<T, SaaSCompanyFindUniqueArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SaaSCompany that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SaaSCompanyFindUniqueOrThrowArgs} args - Arguments to find a SaaSCompany
     * @example
     * // Get one SaaSCompany
     * const saaSCompany = await prisma.saaSCompany.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SaaSCompanyFindUniqueOrThrowArgs>(args: SelectSubset<T, SaaSCompanyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SaaSCompany that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyFindFirstArgs} args - Arguments to find a SaaSCompany
     * @example
     * // Get one SaaSCompany
     * const saaSCompany = await prisma.saaSCompany.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SaaSCompanyFindFirstArgs>(args?: SelectSubset<T, SaaSCompanyFindFirstArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SaaSCompany that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyFindFirstOrThrowArgs} args - Arguments to find a SaaSCompany
     * @example
     * // Get one SaaSCompany
     * const saaSCompany = await prisma.saaSCompany.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SaaSCompanyFindFirstOrThrowArgs>(args?: SelectSubset<T, SaaSCompanyFindFirstOrThrowArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SaaSCompanies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SaaSCompanies
     * const saaSCompanies = await prisma.saaSCompany.findMany()
     * 
     * // Get first 10 SaaSCompanies
     * const saaSCompanies = await prisma.saaSCompany.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const saaSCompanyWithIdOnly = await prisma.saaSCompany.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SaaSCompanyFindManyArgs>(args?: SelectSubset<T, SaaSCompanyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SaaSCompany.
     * @param {SaaSCompanyCreateArgs} args - Arguments to create a SaaSCompany.
     * @example
     * // Create one SaaSCompany
     * const SaaSCompany = await prisma.saaSCompany.create({
     *   data: {
     *     // ... data to create a SaaSCompany
     *   }
     * })
     * 
     */
    create<T extends SaaSCompanyCreateArgs>(args: SelectSubset<T, SaaSCompanyCreateArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SaaSCompanies.
     * @param {SaaSCompanyCreateManyArgs} args - Arguments to create many SaaSCompanies.
     * @example
     * // Create many SaaSCompanies
     * const saaSCompany = await prisma.saaSCompany.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SaaSCompanyCreateManyArgs>(args?: SelectSubset<T, SaaSCompanyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SaaSCompanies and returns the data saved in the database.
     * @param {SaaSCompanyCreateManyAndReturnArgs} args - Arguments to create many SaaSCompanies.
     * @example
     * // Create many SaaSCompanies
     * const saaSCompany = await prisma.saaSCompany.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SaaSCompanies and only return the `id`
     * const saaSCompanyWithIdOnly = await prisma.saaSCompany.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SaaSCompanyCreateManyAndReturnArgs>(args?: SelectSubset<T, SaaSCompanyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SaaSCompany.
     * @param {SaaSCompanyDeleteArgs} args - Arguments to delete one SaaSCompany.
     * @example
     * // Delete one SaaSCompany
     * const SaaSCompany = await prisma.saaSCompany.delete({
     *   where: {
     *     // ... filter to delete one SaaSCompany
     *   }
     * })
     * 
     */
    delete<T extends SaaSCompanyDeleteArgs>(args: SelectSubset<T, SaaSCompanyDeleteArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SaaSCompany.
     * @param {SaaSCompanyUpdateArgs} args - Arguments to update one SaaSCompany.
     * @example
     * // Update one SaaSCompany
     * const saaSCompany = await prisma.saaSCompany.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SaaSCompanyUpdateArgs>(args: SelectSubset<T, SaaSCompanyUpdateArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SaaSCompanies.
     * @param {SaaSCompanyDeleteManyArgs} args - Arguments to filter SaaSCompanies to delete.
     * @example
     * // Delete a few SaaSCompanies
     * const { count } = await prisma.saaSCompany.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SaaSCompanyDeleteManyArgs>(args?: SelectSubset<T, SaaSCompanyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SaaSCompanies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SaaSCompanies
     * const saaSCompany = await prisma.saaSCompany.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SaaSCompanyUpdateManyArgs>(args: SelectSubset<T, SaaSCompanyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SaaSCompany.
     * @param {SaaSCompanyUpsertArgs} args - Arguments to update or create a SaaSCompany.
     * @example
     * // Update or create a SaaSCompany
     * const saaSCompany = await prisma.saaSCompany.upsert({
     *   create: {
     *     // ... data to create a SaaSCompany
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SaaSCompany we want to update
     *   }
     * })
     */
    upsert<T extends SaaSCompanyUpsertArgs>(args: SelectSubset<T, SaaSCompanyUpsertArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SaaSCompanies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyCountArgs} args - Arguments to filter SaaSCompanies to count.
     * @example
     * // Count the number of SaaSCompanies
     * const count = await prisma.saaSCompany.count({
     *   where: {
     *     // ... the filter for the SaaSCompanies we want to count
     *   }
     * })
    **/
    count<T extends SaaSCompanyCountArgs>(
      args?: Subset<T, SaaSCompanyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SaaSCompanyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SaaSCompany.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SaaSCompanyAggregateArgs>(args: Subset<T, SaaSCompanyAggregateArgs>): Prisma.PrismaPromise<GetSaaSCompanyAggregateType<T>>

    /**
     * Group by SaaSCompany.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SaaSCompanyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SaaSCompanyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SaaSCompanyGroupByArgs['orderBy'] }
        : { orderBy?: SaaSCompanyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SaaSCompanyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSaaSCompanyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SaaSCompany model
   */
  readonly fields: SaaSCompanyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SaaSCompany.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SaaSCompanyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    agents<T extends SaaSCompany$agentsArgs<ExtArgs> = {}>(args?: Subset<T, SaaSCompany$agentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findMany"> | Null>
    channels<T extends SaaSCompany$channelsArgs<ExtArgs> = {}>(args?: Subset<T, SaaSCompany$channelsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SaaSCompany model
   */ 
  interface SaaSCompanyFieldRefs {
    readonly id: FieldRef<"SaaSCompany", 'Int'>
    readonly businessName: FieldRef<"SaaSCompany", 'String'>
    readonly legalName: FieldRef<"SaaSCompany", 'String'>
    readonly taxId: FieldRef<"SaaSCompany", 'String'>
    readonly taxType: FieldRef<"SaaSCompany", 'String'>
    readonly brandManualUrl: FieldRef<"SaaSCompany", 'String'>
    readonly createdAt: FieldRef<"SaaSCompany", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SaaSCompany findUnique
   */
  export type SaaSCompanyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * Filter, which SaaSCompany to fetch.
     */
    where: SaaSCompanyWhereUniqueInput
  }

  /**
   * SaaSCompany findUniqueOrThrow
   */
  export type SaaSCompanyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * Filter, which SaaSCompany to fetch.
     */
    where: SaaSCompanyWhereUniqueInput
  }

  /**
   * SaaSCompany findFirst
   */
  export type SaaSCompanyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * Filter, which SaaSCompany to fetch.
     */
    where?: SaaSCompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaaSCompanies to fetch.
     */
    orderBy?: SaaSCompanyOrderByWithRelationInput | SaaSCompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaaSCompanies.
     */
    cursor?: SaaSCompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaaSCompanies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaaSCompanies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaaSCompanies.
     */
    distinct?: SaaSCompanyScalarFieldEnum | SaaSCompanyScalarFieldEnum[]
  }

  /**
   * SaaSCompany findFirstOrThrow
   */
  export type SaaSCompanyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * Filter, which SaaSCompany to fetch.
     */
    where?: SaaSCompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaaSCompanies to fetch.
     */
    orderBy?: SaaSCompanyOrderByWithRelationInput | SaaSCompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SaaSCompanies.
     */
    cursor?: SaaSCompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaaSCompanies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaaSCompanies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SaaSCompanies.
     */
    distinct?: SaaSCompanyScalarFieldEnum | SaaSCompanyScalarFieldEnum[]
  }

  /**
   * SaaSCompany findMany
   */
  export type SaaSCompanyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * Filter, which SaaSCompanies to fetch.
     */
    where?: SaaSCompanyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SaaSCompanies to fetch.
     */
    orderBy?: SaaSCompanyOrderByWithRelationInput | SaaSCompanyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SaaSCompanies.
     */
    cursor?: SaaSCompanyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SaaSCompanies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SaaSCompanies.
     */
    skip?: number
    distinct?: SaaSCompanyScalarFieldEnum | SaaSCompanyScalarFieldEnum[]
  }

  /**
   * SaaSCompany create
   */
  export type SaaSCompanyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * The data needed to create a SaaSCompany.
     */
    data: XOR<SaaSCompanyCreateInput, SaaSCompanyUncheckedCreateInput>
  }

  /**
   * SaaSCompany createMany
   */
  export type SaaSCompanyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SaaSCompanies.
     */
    data: SaaSCompanyCreateManyInput | SaaSCompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SaaSCompany createManyAndReturn
   */
  export type SaaSCompanyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SaaSCompanies.
     */
    data: SaaSCompanyCreateManyInput | SaaSCompanyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SaaSCompany update
   */
  export type SaaSCompanyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * The data needed to update a SaaSCompany.
     */
    data: XOR<SaaSCompanyUpdateInput, SaaSCompanyUncheckedUpdateInput>
    /**
     * Choose, which SaaSCompany to update.
     */
    where: SaaSCompanyWhereUniqueInput
  }

  /**
   * SaaSCompany updateMany
   */
  export type SaaSCompanyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SaaSCompanies.
     */
    data: XOR<SaaSCompanyUpdateManyMutationInput, SaaSCompanyUncheckedUpdateManyInput>
    /**
     * Filter which SaaSCompanies to update
     */
    where?: SaaSCompanyWhereInput
  }

  /**
   * SaaSCompany upsert
   */
  export type SaaSCompanyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * The filter to search for the SaaSCompany to update in case it exists.
     */
    where: SaaSCompanyWhereUniqueInput
    /**
     * In case the SaaSCompany found by the `where` argument doesn't exist, create a new SaaSCompany with this data.
     */
    create: XOR<SaaSCompanyCreateInput, SaaSCompanyUncheckedCreateInput>
    /**
     * In case the SaaSCompany was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SaaSCompanyUpdateInput, SaaSCompanyUncheckedUpdateInput>
  }

  /**
   * SaaSCompany delete
   */
  export type SaaSCompanyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
    /**
     * Filter which SaaSCompany to delete.
     */
    where: SaaSCompanyWhereUniqueInput
  }

  /**
   * SaaSCompany deleteMany
   */
  export type SaaSCompanyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SaaSCompanies to delete
     */
    where?: SaaSCompanyWhereInput
  }

  /**
   * SaaSCompany.agents
   */
  export type SaaSCompany$agentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    where?: SAAgentWhereInput
    orderBy?: SAAgentOrderByWithRelationInput | SAAgentOrderByWithRelationInput[]
    cursor?: SAAgentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SAAgentScalarFieldEnum | SAAgentScalarFieldEnum[]
  }

  /**
   * SaaSCompany.channels
   */
  export type SaaSCompany$channelsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    where?: ChannelWhereInput
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    cursor?: ChannelWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * SaaSCompany without action
   */
  export type SaaSCompanyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SaaSCompany
     */
    select?: SaaSCompanySelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SaaSCompanyInclude<ExtArgs> | null
  }


  /**
   * Model SAAgent
   */

  export type AggregateSAAgent = {
    _count: SAAgentCountAggregateOutputType | null
    _avg: SAAgentAvgAggregateOutputType | null
    _sum: SAAgentSumAggregateOutputType | null
    _min: SAAgentMinAggregateOutputType | null
    _max: SAAgentMaxAggregateOutputType | null
  }

  export type SAAgentAvgAggregateOutputType = {
    id: number | null
    companyId: number | null
  }

  export type SAAgentSumAggregateOutputType = {
    id: number | null
    companyId: number | null
  }

  export type SAAgentMinAggregateOutputType = {
    id: number | null
    companyId: number | null
    name: string | null
    email: string | null
    passwordHash: string | null
    role: string | null
    status: string | null
    createdAt: Date | null
  }

  export type SAAgentMaxAggregateOutputType = {
    id: number | null
    companyId: number | null
    name: string | null
    email: string | null
    passwordHash: string | null
    role: string | null
    status: string | null
    createdAt: Date | null
  }

  export type SAAgentCountAggregateOutputType = {
    id: number
    companyId: number
    name: number
    email: number
    passwordHash: number
    role: number
    status: number
    createdAt: number
    _all: number
  }


  export type SAAgentAvgAggregateInputType = {
    id?: true
    companyId?: true
  }

  export type SAAgentSumAggregateInputType = {
    id?: true
    companyId?: true
  }

  export type SAAgentMinAggregateInputType = {
    id?: true
    companyId?: true
    name?: true
    email?: true
    passwordHash?: true
    role?: true
    status?: true
    createdAt?: true
  }

  export type SAAgentMaxAggregateInputType = {
    id?: true
    companyId?: true
    name?: true
    email?: true
    passwordHash?: true
    role?: true
    status?: true
    createdAt?: true
  }

  export type SAAgentCountAggregateInputType = {
    id?: true
    companyId?: true
    name?: true
    email?: true
    passwordHash?: true
    role?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type SAAgentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SAAgent to aggregate.
     */
    where?: SAAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SAAgents to fetch.
     */
    orderBy?: SAAgentOrderByWithRelationInput | SAAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SAAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SAAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SAAgents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SAAgents
    **/
    _count?: true | SAAgentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SAAgentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SAAgentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SAAgentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SAAgentMaxAggregateInputType
  }

  export type GetSAAgentAggregateType<T extends SAAgentAggregateArgs> = {
        [P in keyof T & keyof AggregateSAAgent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSAAgent[P]>
      : GetScalarType<T[P], AggregateSAAgent[P]>
  }




  export type SAAgentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SAAgentWhereInput
    orderBy?: SAAgentOrderByWithAggregationInput | SAAgentOrderByWithAggregationInput[]
    by: SAAgentScalarFieldEnum[] | SAAgentScalarFieldEnum
    having?: SAAgentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SAAgentCountAggregateInputType | true
    _avg?: SAAgentAvgAggregateInputType
    _sum?: SAAgentSumAggregateInputType
    _min?: SAAgentMinAggregateInputType
    _max?: SAAgentMaxAggregateInputType
  }

  export type SAAgentGroupByOutputType = {
    id: number
    companyId: number
    name: string
    email: string
    passwordHash: string
    role: string
    status: string
    createdAt: Date
    _count: SAAgentCountAggregateOutputType | null
    _avg: SAAgentAvgAggregateOutputType | null
    _sum: SAAgentSumAggregateOutputType | null
    _min: SAAgentMinAggregateOutputType | null
    _max: SAAgentMaxAggregateOutputType | null
  }

  type GetSAAgentGroupByPayload<T extends SAAgentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SAAgentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SAAgentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SAAgentGroupByOutputType[P]>
            : GetScalarType<T[P], SAAgentGroupByOutputType[P]>
        }
      >
    >


  export type SAAgentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    status?: boolean
    createdAt?: boolean
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
    tickets?: boolean | SAAgent$ticketsArgs<ExtArgs>
    _count?: boolean | SAAgentCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sAAgent"]>

  export type SAAgentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    status?: boolean
    createdAt?: boolean
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sAAgent"]>

  export type SAAgentSelectScalar = {
    id?: boolean
    companyId?: boolean
    name?: boolean
    email?: boolean
    passwordHash?: boolean
    role?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type SAAgentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
    tickets?: boolean | SAAgent$ticketsArgs<ExtArgs>
    _count?: boolean | SAAgentCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type SAAgentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
  }

  export type $SAAgentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SAAgent"
    objects: {
      company: Prisma.$SaaSCompanyPayload<ExtArgs>
      tickets: Prisma.$TicketPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      companyId: number
      name: string
      email: string
      passwordHash: string
      role: string
      status: string
      createdAt: Date
    }, ExtArgs["result"]["sAAgent"]>
    composites: {}
  }

  type SAAgentGetPayload<S extends boolean | null | undefined | SAAgentDefaultArgs> = $Result.GetResult<Prisma.$SAAgentPayload, S>

  type SAAgentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SAAgentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SAAgentCountAggregateInputType | true
    }

  export interface SAAgentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SAAgent'], meta: { name: 'SAAgent' } }
    /**
     * Find zero or one SAAgent that matches the filter.
     * @param {SAAgentFindUniqueArgs} args - Arguments to find a SAAgent
     * @example
     * // Get one SAAgent
     * const sAAgent = await prisma.sAAgent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SAAgentFindUniqueArgs>(args: SelectSubset<T, SAAgentFindUniqueArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SAAgent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SAAgentFindUniqueOrThrowArgs} args - Arguments to find a SAAgent
     * @example
     * // Get one SAAgent
     * const sAAgent = await prisma.sAAgent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SAAgentFindUniqueOrThrowArgs>(args: SelectSubset<T, SAAgentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SAAgent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentFindFirstArgs} args - Arguments to find a SAAgent
     * @example
     * // Get one SAAgent
     * const sAAgent = await prisma.sAAgent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SAAgentFindFirstArgs>(args?: SelectSubset<T, SAAgentFindFirstArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SAAgent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentFindFirstOrThrowArgs} args - Arguments to find a SAAgent
     * @example
     * // Get one SAAgent
     * const sAAgent = await prisma.sAAgent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SAAgentFindFirstOrThrowArgs>(args?: SelectSubset<T, SAAgentFindFirstOrThrowArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SAAgents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SAAgents
     * const sAAgents = await prisma.sAAgent.findMany()
     * 
     * // Get first 10 SAAgents
     * const sAAgents = await prisma.sAAgent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sAAgentWithIdOnly = await prisma.sAAgent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SAAgentFindManyArgs>(args?: SelectSubset<T, SAAgentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SAAgent.
     * @param {SAAgentCreateArgs} args - Arguments to create a SAAgent.
     * @example
     * // Create one SAAgent
     * const SAAgent = await prisma.sAAgent.create({
     *   data: {
     *     // ... data to create a SAAgent
     *   }
     * })
     * 
     */
    create<T extends SAAgentCreateArgs>(args: SelectSubset<T, SAAgentCreateArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SAAgents.
     * @param {SAAgentCreateManyArgs} args - Arguments to create many SAAgents.
     * @example
     * // Create many SAAgents
     * const sAAgent = await prisma.sAAgent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SAAgentCreateManyArgs>(args?: SelectSubset<T, SAAgentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SAAgents and returns the data saved in the database.
     * @param {SAAgentCreateManyAndReturnArgs} args - Arguments to create many SAAgents.
     * @example
     * // Create many SAAgents
     * const sAAgent = await prisma.sAAgent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SAAgents and only return the `id`
     * const sAAgentWithIdOnly = await prisma.sAAgent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SAAgentCreateManyAndReturnArgs>(args?: SelectSubset<T, SAAgentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SAAgent.
     * @param {SAAgentDeleteArgs} args - Arguments to delete one SAAgent.
     * @example
     * // Delete one SAAgent
     * const SAAgent = await prisma.sAAgent.delete({
     *   where: {
     *     // ... filter to delete one SAAgent
     *   }
     * })
     * 
     */
    delete<T extends SAAgentDeleteArgs>(args: SelectSubset<T, SAAgentDeleteArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SAAgent.
     * @param {SAAgentUpdateArgs} args - Arguments to update one SAAgent.
     * @example
     * // Update one SAAgent
     * const sAAgent = await prisma.sAAgent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SAAgentUpdateArgs>(args: SelectSubset<T, SAAgentUpdateArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SAAgents.
     * @param {SAAgentDeleteManyArgs} args - Arguments to filter SAAgents to delete.
     * @example
     * // Delete a few SAAgents
     * const { count } = await prisma.sAAgent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SAAgentDeleteManyArgs>(args?: SelectSubset<T, SAAgentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SAAgents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SAAgents
     * const sAAgent = await prisma.sAAgent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SAAgentUpdateManyArgs>(args: SelectSubset<T, SAAgentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SAAgent.
     * @param {SAAgentUpsertArgs} args - Arguments to update or create a SAAgent.
     * @example
     * // Update or create a SAAgent
     * const sAAgent = await prisma.sAAgent.upsert({
     *   create: {
     *     // ... data to create a SAAgent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SAAgent we want to update
     *   }
     * })
     */
    upsert<T extends SAAgentUpsertArgs>(args: SelectSubset<T, SAAgentUpsertArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SAAgents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentCountArgs} args - Arguments to filter SAAgents to count.
     * @example
     * // Count the number of SAAgents
     * const count = await prisma.sAAgent.count({
     *   where: {
     *     // ... the filter for the SAAgents we want to count
     *   }
     * })
    **/
    count<T extends SAAgentCountArgs>(
      args?: Subset<T, SAAgentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SAAgentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SAAgent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SAAgentAggregateArgs>(args: Subset<T, SAAgentAggregateArgs>): Prisma.PrismaPromise<GetSAAgentAggregateType<T>>

    /**
     * Group by SAAgent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SAAgentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SAAgentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SAAgentGroupByArgs['orderBy'] }
        : { orderBy?: SAAgentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SAAgentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSAAgentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SAAgent model
   */
  readonly fields: SAAgentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SAAgent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SAAgentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends SaaSCompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SaaSCompanyDefaultArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    tickets<T extends SAAgent$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, SAAgent$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SAAgent model
   */ 
  interface SAAgentFieldRefs {
    readonly id: FieldRef<"SAAgent", 'Int'>
    readonly companyId: FieldRef<"SAAgent", 'Int'>
    readonly name: FieldRef<"SAAgent", 'String'>
    readonly email: FieldRef<"SAAgent", 'String'>
    readonly passwordHash: FieldRef<"SAAgent", 'String'>
    readonly role: FieldRef<"SAAgent", 'String'>
    readonly status: FieldRef<"SAAgent", 'String'>
    readonly createdAt: FieldRef<"SAAgent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SAAgent findUnique
   */
  export type SAAgentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * Filter, which SAAgent to fetch.
     */
    where: SAAgentWhereUniqueInput
  }

  /**
   * SAAgent findUniqueOrThrow
   */
  export type SAAgentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * Filter, which SAAgent to fetch.
     */
    where: SAAgentWhereUniqueInput
  }

  /**
   * SAAgent findFirst
   */
  export type SAAgentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * Filter, which SAAgent to fetch.
     */
    where?: SAAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SAAgents to fetch.
     */
    orderBy?: SAAgentOrderByWithRelationInput | SAAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SAAgents.
     */
    cursor?: SAAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SAAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SAAgents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SAAgents.
     */
    distinct?: SAAgentScalarFieldEnum | SAAgentScalarFieldEnum[]
  }

  /**
   * SAAgent findFirstOrThrow
   */
  export type SAAgentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * Filter, which SAAgent to fetch.
     */
    where?: SAAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SAAgents to fetch.
     */
    orderBy?: SAAgentOrderByWithRelationInput | SAAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SAAgents.
     */
    cursor?: SAAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SAAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SAAgents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SAAgents.
     */
    distinct?: SAAgentScalarFieldEnum | SAAgentScalarFieldEnum[]
  }

  /**
   * SAAgent findMany
   */
  export type SAAgentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * Filter, which SAAgents to fetch.
     */
    where?: SAAgentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SAAgents to fetch.
     */
    orderBy?: SAAgentOrderByWithRelationInput | SAAgentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SAAgents.
     */
    cursor?: SAAgentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SAAgents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SAAgents.
     */
    skip?: number
    distinct?: SAAgentScalarFieldEnum | SAAgentScalarFieldEnum[]
  }

  /**
   * SAAgent create
   */
  export type SAAgentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * The data needed to create a SAAgent.
     */
    data: XOR<SAAgentCreateInput, SAAgentUncheckedCreateInput>
  }

  /**
   * SAAgent createMany
   */
  export type SAAgentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SAAgents.
     */
    data: SAAgentCreateManyInput | SAAgentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SAAgent createManyAndReturn
   */
  export type SAAgentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SAAgents.
     */
    data: SAAgentCreateManyInput | SAAgentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SAAgent update
   */
  export type SAAgentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * The data needed to update a SAAgent.
     */
    data: XOR<SAAgentUpdateInput, SAAgentUncheckedUpdateInput>
    /**
     * Choose, which SAAgent to update.
     */
    where: SAAgentWhereUniqueInput
  }

  /**
   * SAAgent updateMany
   */
  export type SAAgentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SAAgents.
     */
    data: XOR<SAAgentUpdateManyMutationInput, SAAgentUncheckedUpdateManyInput>
    /**
     * Filter which SAAgents to update
     */
    where?: SAAgentWhereInput
  }

  /**
   * SAAgent upsert
   */
  export type SAAgentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * The filter to search for the SAAgent to update in case it exists.
     */
    where: SAAgentWhereUniqueInput
    /**
     * In case the SAAgent found by the `where` argument doesn't exist, create a new SAAgent with this data.
     */
    create: XOR<SAAgentCreateInput, SAAgentUncheckedCreateInput>
    /**
     * In case the SAAgent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SAAgentUpdateInput, SAAgentUncheckedUpdateInput>
  }

  /**
   * SAAgent delete
   */
  export type SAAgentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    /**
     * Filter which SAAgent to delete.
     */
    where: SAAgentWhereUniqueInput
  }

  /**
   * SAAgent deleteMany
   */
  export type SAAgentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SAAgents to delete
     */
    where?: SAAgentWhereInput
  }

  /**
   * SAAgent.tickets
   */
  export type SAAgent$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    cursor?: TicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * SAAgent without action
   */
  export type SAAgentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
  }


  /**
   * Model Channel
   */

  export type AggregateChannel = {
    _count: ChannelCountAggregateOutputType | null
    _avg: ChannelAvgAggregateOutputType | null
    _sum: ChannelSumAggregateOutputType | null
    _min: ChannelMinAggregateOutputType | null
    _max: ChannelMaxAggregateOutputType | null
  }

  export type ChannelAvgAggregateOutputType = {
    id: number | null
    companyId: number | null
  }

  export type ChannelSumAggregateOutputType = {
    id: number | null
    companyId: number | null
  }

  export type ChannelMinAggregateOutputType = {
    id: number | null
    companyId: number | null
    platform: string | null
    botName: string | null
    instanceName: string | null
    status: string | null
    createdAt: Date | null
  }

  export type ChannelMaxAggregateOutputType = {
    id: number | null
    companyId: number | null
    platform: string | null
    botName: string | null
    instanceName: string | null
    status: string | null
    createdAt: Date | null
  }

  export type ChannelCountAggregateOutputType = {
    id: number
    companyId: number
    platform: number
    botName: number
    instanceName: number
    configA1: number
    configA2: number
    configA3: number
    credentials: number
    debugMode: number
    status: number
    createdAt: number
    _all: number
  }


  export type ChannelAvgAggregateInputType = {
    id?: true
    companyId?: true
  }

  export type ChannelSumAggregateInputType = {
    id?: true
    companyId?: true
  }

  export type ChannelMinAggregateInputType = {
    id?: true
    companyId?: true
    platform?: true
    botName?: true
    instanceName?: true
    status?: true
    createdAt?: true
  }

  export type ChannelMaxAggregateInputType = {
    id?: true
    companyId?: true
    platform?: true
    botName?: true
    instanceName?: true
    status?: true
    createdAt?: true
  }

  export type ChannelCountAggregateInputType = {
    id?: true
    companyId?: true
    platform?: true
    botName?: true
    instanceName?: true
    configA1?: true
    configA2?: true
    configA3?: true
    credentials?: true
    debugMode?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type ChannelAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Channel to aggregate.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Channels
    **/
    _count?: true | ChannelCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChannelAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChannelSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChannelMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChannelMaxAggregateInputType
  }

  export type GetChannelAggregateType<T extends ChannelAggregateArgs> = {
        [P in keyof T & keyof AggregateChannel]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChannel[P]>
      : GetScalarType<T[P], AggregateChannel[P]>
  }




  export type ChannelGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChannelWhereInput
    orderBy?: ChannelOrderByWithAggregationInput | ChannelOrderByWithAggregationInput[]
    by: ChannelScalarFieldEnum[] | ChannelScalarFieldEnum
    having?: ChannelScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChannelCountAggregateInputType | true
    _avg?: ChannelAvgAggregateInputType
    _sum?: ChannelSumAggregateInputType
    _min?: ChannelMinAggregateInputType
    _max?: ChannelMaxAggregateInputType
  }

  export type ChannelGroupByOutputType = {
    id: number
    companyId: number
    platform: string
    botName: string
    instanceName: string
    configA1: JsonValue | null
    configA2: JsonValue | null
    configA3: JsonValue | null
    credentials: JsonValue | null
    debugMode: JsonValue | null
    status: string
    createdAt: Date
    _count: ChannelCountAggregateOutputType | null
    _avg: ChannelAvgAggregateOutputType | null
    _sum: ChannelSumAggregateOutputType | null
    _min: ChannelMinAggregateOutputType | null
    _max: ChannelMaxAggregateOutputType | null
  }

  type GetChannelGroupByPayload<T extends ChannelGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChannelGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChannelGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChannelGroupByOutputType[P]>
            : GetScalarType<T[P], ChannelGroupByOutputType[P]>
        }
      >
    >


  export type ChannelSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    platform?: boolean
    botName?: boolean
    instanceName?: boolean
    configA1?: boolean
    configA2?: boolean
    configA3?: boolean
    credentials?: boolean
    debugMode?: boolean
    status?: boolean
    createdAt?: boolean
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
    knowledgeBase?: boolean | Channel$knowledgeBaseArgs<ExtArgs>
    tickets?: boolean | Channel$ticketsArgs<ExtArgs>
    _count?: boolean | ChannelCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["channel"]>

  export type ChannelSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    companyId?: boolean
    platform?: boolean
    botName?: boolean
    instanceName?: boolean
    configA1?: boolean
    configA2?: boolean
    configA3?: boolean
    credentials?: boolean
    debugMode?: boolean
    status?: boolean
    createdAt?: boolean
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["channel"]>

  export type ChannelSelectScalar = {
    id?: boolean
    companyId?: boolean
    platform?: boolean
    botName?: boolean
    instanceName?: boolean
    configA1?: boolean
    configA2?: boolean
    configA3?: boolean
    credentials?: boolean
    debugMode?: boolean
    status?: boolean
    createdAt?: boolean
  }

  export type ChannelInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
    knowledgeBase?: boolean | Channel$knowledgeBaseArgs<ExtArgs>
    tickets?: boolean | Channel$ticketsArgs<ExtArgs>
    _count?: boolean | ChannelCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ChannelIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    company?: boolean | SaaSCompanyDefaultArgs<ExtArgs>
  }

  export type $ChannelPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Channel"
    objects: {
      company: Prisma.$SaaSCompanyPayload<ExtArgs>
      knowledgeBase: Prisma.$KnowledgePayload<ExtArgs>[]
      tickets: Prisma.$TicketPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      companyId: number
      platform: string
      botName: string
      instanceName: string
      configA1: Prisma.JsonValue | null
      configA2: Prisma.JsonValue | null
      configA3: Prisma.JsonValue | null
      credentials: Prisma.JsonValue | null
      debugMode: Prisma.JsonValue | null
      status: string
      createdAt: Date
    }, ExtArgs["result"]["channel"]>
    composites: {}
  }

  type ChannelGetPayload<S extends boolean | null | undefined | ChannelDefaultArgs> = $Result.GetResult<Prisma.$ChannelPayload, S>

  type ChannelCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChannelFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChannelCountAggregateInputType | true
    }

  export interface ChannelDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Channel'], meta: { name: 'Channel' } }
    /**
     * Find zero or one Channel that matches the filter.
     * @param {ChannelFindUniqueArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChannelFindUniqueArgs>(args: SelectSubset<T, ChannelFindUniqueArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Channel that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChannelFindUniqueOrThrowArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChannelFindUniqueOrThrowArgs>(args: SelectSubset<T, ChannelFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Channel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelFindFirstArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChannelFindFirstArgs>(args?: SelectSubset<T, ChannelFindFirstArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Channel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelFindFirstOrThrowArgs} args - Arguments to find a Channel
     * @example
     * // Get one Channel
     * const channel = await prisma.channel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChannelFindFirstOrThrowArgs>(args?: SelectSubset<T, ChannelFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Channels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Channels
     * const channels = await prisma.channel.findMany()
     * 
     * // Get first 10 Channels
     * const channels = await prisma.channel.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const channelWithIdOnly = await prisma.channel.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChannelFindManyArgs>(args?: SelectSubset<T, ChannelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Channel.
     * @param {ChannelCreateArgs} args - Arguments to create a Channel.
     * @example
     * // Create one Channel
     * const Channel = await prisma.channel.create({
     *   data: {
     *     // ... data to create a Channel
     *   }
     * })
     * 
     */
    create<T extends ChannelCreateArgs>(args: SelectSubset<T, ChannelCreateArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Channels.
     * @param {ChannelCreateManyArgs} args - Arguments to create many Channels.
     * @example
     * // Create many Channels
     * const channel = await prisma.channel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChannelCreateManyArgs>(args?: SelectSubset<T, ChannelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Channels and returns the data saved in the database.
     * @param {ChannelCreateManyAndReturnArgs} args - Arguments to create many Channels.
     * @example
     * // Create many Channels
     * const channel = await prisma.channel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Channels and only return the `id`
     * const channelWithIdOnly = await prisma.channel.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChannelCreateManyAndReturnArgs>(args?: SelectSubset<T, ChannelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Channel.
     * @param {ChannelDeleteArgs} args - Arguments to delete one Channel.
     * @example
     * // Delete one Channel
     * const Channel = await prisma.channel.delete({
     *   where: {
     *     // ... filter to delete one Channel
     *   }
     * })
     * 
     */
    delete<T extends ChannelDeleteArgs>(args: SelectSubset<T, ChannelDeleteArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Channel.
     * @param {ChannelUpdateArgs} args - Arguments to update one Channel.
     * @example
     * // Update one Channel
     * const channel = await prisma.channel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChannelUpdateArgs>(args: SelectSubset<T, ChannelUpdateArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Channels.
     * @param {ChannelDeleteManyArgs} args - Arguments to filter Channels to delete.
     * @example
     * // Delete a few Channels
     * const { count } = await prisma.channel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChannelDeleteManyArgs>(args?: SelectSubset<T, ChannelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Channels
     * const channel = await prisma.channel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChannelUpdateManyArgs>(args: SelectSubset<T, ChannelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Channel.
     * @param {ChannelUpsertArgs} args - Arguments to update or create a Channel.
     * @example
     * // Update or create a Channel
     * const channel = await prisma.channel.upsert({
     *   create: {
     *     // ... data to create a Channel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Channel we want to update
     *   }
     * })
     */
    upsert<T extends ChannelUpsertArgs>(args: SelectSubset<T, ChannelUpsertArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Channels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelCountArgs} args - Arguments to filter Channels to count.
     * @example
     * // Count the number of Channels
     * const count = await prisma.channel.count({
     *   where: {
     *     // ... the filter for the Channels we want to count
     *   }
     * })
    **/
    count<T extends ChannelCountArgs>(
      args?: Subset<T, ChannelCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChannelCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Channel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChannelAggregateArgs>(args: Subset<T, ChannelAggregateArgs>): Prisma.PrismaPromise<GetChannelAggregateType<T>>

    /**
     * Group by Channel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChannelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChannelGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChannelGroupByArgs['orderBy'] }
        : { orderBy?: ChannelGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChannelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChannelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Channel model
   */
  readonly fields: ChannelFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Channel.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChannelClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    company<T extends SaaSCompanyDefaultArgs<ExtArgs> = {}>(args?: Subset<T, SaaSCompanyDefaultArgs<ExtArgs>>): Prisma__SaaSCompanyClient<$Result.GetResult<Prisma.$SaaSCompanyPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    knowledgeBase<T extends Channel$knowledgeBaseArgs<ExtArgs> = {}>(args?: Subset<T, Channel$knowledgeBaseArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findMany"> | Null>
    tickets<T extends Channel$ticketsArgs<ExtArgs> = {}>(args?: Subset<T, Channel$ticketsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Channel model
   */ 
  interface ChannelFieldRefs {
    readonly id: FieldRef<"Channel", 'Int'>
    readonly companyId: FieldRef<"Channel", 'Int'>
    readonly platform: FieldRef<"Channel", 'String'>
    readonly botName: FieldRef<"Channel", 'String'>
    readonly instanceName: FieldRef<"Channel", 'String'>
    readonly configA1: FieldRef<"Channel", 'Json'>
    readonly configA2: FieldRef<"Channel", 'Json'>
    readonly configA3: FieldRef<"Channel", 'Json'>
    readonly credentials: FieldRef<"Channel", 'Json'>
    readonly debugMode: FieldRef<"Channel", 'Json'>
    readonly status: FieldRef<"Channel", 'String'>
    readonly createdAt: FieldRef<"Channel", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Channel findUnique
   */
  export type ChannelFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel findUniqueOrThrow
   */
  export type ChannelFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel findFirst
   */
  export type ChannelFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Channels.
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Channels.
     */
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * Channel findFirstOrThrow
   */
  export type ChannelFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channel to fetch.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Channels.
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Channels.
     */
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * Channel findMany
   */
  export type ChannelFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter, which Channels to fetch.
     */
    where?: ChannelWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Channels to fetch.
     */
    orderBy?: ChannelOrderByWithRelationInput | ChannelOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Channels.
     */
    cursor?: ChannelWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Channels from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Channels.
     */
    skip?: number
    distinct?: ChannelScalarFieldEnum | ChannelScalarFieldEnum[]
  }

  /**
   * Channel create
   */
  export type ChannelCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * The data needed to create a Channel.
     */
    data: XOR<ChannelCreateInput, ChannelUncheckedCreateInput>
  }

  /**
   * Channel createMany
   */
  export type ChannelCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Channels.
     */
    data: ChannelCreateManyInput | ChannelCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Channel createManyAndReturn
   */
  export type ChannelCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Channels.
     */
    data: ChannelCreateManyInput | ChannelCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Channel update
   */
  export type ChannelUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * The data needed to update a Channel.
     */
    data: XOR<ChannelUpdateInput, ChannelUncheckedUpdateInput>
    /**
     * Choose, which Channel to update.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel updateMany
   */
  export type ChannelUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Channels.
     */
    data: XOR<ChannelUpdateManyMutationInput, ChannelUncheckedUpdateManyInput>
    /**
     * Filter which Channels to update
     */
    where?: ChannelWhereInput
  }

  /**
   * Channel upsert
   */
  export type ChannelUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * The filter to search for the Channel to update in case it exists.
     */
    where: ChannelWhereUniqueInput
    /**
     * In case the Channel found by the `where` argument doesn't exist, create a new Channel with this data.
     */
    create: XOR<ChannelCreateInput, ChannelUncheckedCreateInput>
    /**
     * In case the Channel was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChannelUpdateInput, ChannelUncheckedUpdateInput>
  }

  /**
   * Channel delete
   */
  export type ChannelDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
    /**
     * Filter which Channel to delete.
     */
    where: ChannelWhereUniqueInput
  }

  /**
   * Channel deleteMany
   */
  export type ChannelDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Channels to delete
     */
    where?: ChannelWhereInput
  }

  /**
   * Channel.knowledgeBase
   */
  export type Channel$knowledgeBaseArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    where?: KnowledgeWhereInput
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    cursor?: KnowledgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Channel.tickets
   */
  export type Channel$ticketsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    cursor?: TicketWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Channel without action
   */
  export type ChannelDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Channel
     */
    select?: ChannelSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChannelInclude<ExtArgs> | null
  }


  /**
   * Model Knowledge
   */

  export type AggregateKnowledge = {
    _count: KnowledgeCountAggregateOutputType | null
    _avg: KnowledgeAvgAggregateOutputType | null
    _sum: KnowledgeSumAggregateOutputType | null
    _min: KnowledgeMinAggregateOutputType | null
    _max: KnowledgeMaxAggregateOutputType | null
  }

  export type KnowledgeAvgAggregateOutputType = {
    id: number | null
    channelId: number | null
  }

  export type KnowledgeSumAggregateOutputType = {
    id: number | null
    channelId: number | null
  }

  export type KnowledgeMinAggregateOutputType = {
    id: number | null
    channelId: number | null
    fileName: string | null
    filePath: string | null
    fileType: string | null
    embeddingStatus: string | null
    lastUpdated: Date | null
  }

  export type KnowledgeMaxAggregateOutputType = {
    id: number | null
    channelId: number | null
    fileName: string | null
    filePath: string | null
    fileType: string | null
    embeddingStatus: string | null
    lastUpdated: Date | null
  }

  export type KnowledgeCountAggregateOutputType = {
    id: number
    channelId: number
    fileName: number
    filePath: number
    fileType: number
    embeddingStatus: number
    lastUpdated: number
    _all: number
  }


  export type KnowledgeAvgAggregateInputType = {
    id?: true
    channelId?: true
  }

  export type KnowledgeSumAggregateInputType = {
    id?: true
    channelId?: true
  }

  export type KnowledgeMinAggregateInputType = {
    id?: true
    channelId?: true
    fileName?: true
    filePath?: true
    fileType?: true
    embeddingStatus?: true
    lastUpdated?: true
  }

  export type KnowledgeMaxAggregateInputType = {
    id?: true
    channelId?: true
    fileName?: true
    filePath?: true
    fileType?: true
    embeddingStatus?: true
    lastUpdated?: true
  }

  export type KnowledgeCountAggregateInputType = {
    id?: true
    channelId?: true
    fileName?: true
    filePath?: true
    fileType?: true
    embeddingStatus?: true
    lastUpdated?: true
    _all?: true
  }

  export type KnowledgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Knowledge to aggregate.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Knowledges
    **/
    _count?: true | KnowledgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: KnowledgeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: KnowledgeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: KnowledgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: KnowledgeMaxAggregateInputType
  }

  export type GetKnowledgeAggregateType<T extends KnowledgeAggregateArgs> = {
        [P in keyof T & keyof AggregateKnowledge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateKnowledge[P]>
      : GetScalarType<T[P], AggregateKnowledge[P]>
  }




  export type KnowledgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: KnowledgeWhereInput
    orderBy?: KnowledgeOrderByWithAggregationInput | KnowledgeOrderByWithAggregationInput[]
    by: KnowledgeScalarFieldEnum[] | KnowledgeScalarFieldEnum
    having?: KnowledgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: KnowledgeCountAggregateInputType | true
    _avg?: KnowledgeAvgAggregateInputType
    _sum?: KnowledgeSumAggregateInputType
    _min?: KnowledgeMinAggregateInputType
    _max?: KnowledgeMaxAggregateInputType
  }

  export type KnowledgeGroupByOutputType = {
    id: number
    channelId: number
    fileName: string
    filePath: string
    fileType: string | null
    embeddingStatus: string
    lastUpdated: Date
    _count: KnowledgeCountAggregateOutputType | null
    _avg: KnowledgeAvgAggregateOutputType | null
    _sum: KnowledgeSumAggregateOutputType | null
    _min: KnowledgeMinAggregateOutputType | null
    _max: KnowledgeMaxAggregateOutputType | null
  }

  type GetKnowledgeGroupByPayload<T extends KnowledgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<KnowledgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof KnowledgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], KnowledgeGroupByOutputType[P]>
            : GetScalarType<T[P], KnowledgeGroupByOutputType[P]>
        }
      >
    >


  export type KnowledgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channelId?: boolean
    fileName?: boolean
    filePath?: boolean
    fileType?: boolean
    embeddingStatus?: boolean
    lastUpdated?: boolean
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledge"]>

  export type KnowledgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channelId?: boolean
    fileName?: boolean
    filePath?: boolean
    fileType?: boolean
    embeddingStatus?: boolean
    lastUpdated?: boolean
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["knowledge"]>

  export type KnowledgeSelectScalar = {
    id?: boolean
    channelId?: boolean
    fileName?: boolean
    filePath?: boolean
    fileType?: boolean
    embeddingStatus?: boolean
    lastUpdated?: boolean
  }

  export type KnowledgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
  }
  export type KnowledgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
  }

  export type $KnowledgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Knowledge"
    objects: {
      channel: Prisma.$ChannelPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      channelId: number
      fileName: string
      filePath: string
      fileType: string | null
      embeddingStatus: string
      lastUpdated: Date
    }, ExtArgs["result"]["knowledge"]>
    composites: {}
  }

  type KnowledgeGetPayload<S extends boolean | null | undefined | KnowledgeDefaultArgs> = $Result.GetResult<Prisma.$KnowledgePayload, S>

  type KnowledgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<KnowledgeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: KnowledgeCountAggregateInputType | true
    }

  export interface KnowledgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Knowledge'], meta: { name: 'Knowledge' } }
    /**
     * Find zero or one Knowledge that matches the filter.
     * @param {KnowledgeFindUniqueArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends KnowledgeFindUniqueArgs>(args: SelectSubset<T, KnowledgeFindUniqueArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Knowledge that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {KnowledgeFindUniqueOrThrowArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends KnowledgeFindUniqueOrThrowArgs>(args: SelectSubset<T, KnowledgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Knowledge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeFindFirstArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends KnowledgeFindFirstArgs>(args?: SelectSubset<T, KnowledgeFindFirstArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Knowledge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeFindFirstOrThrowArgs} args - Arguments to find a Knowledge
     * @example
     * // Get one Knowledge
     * const knowledge = await prisma.knowledge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends KnowledgeFindFirstOrThrowArgs>(args?: SelectSubset<T, KnowledgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Knowledges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Knowledges
     * const knowledges = await prisma.knowledge.findMany()
     * 
     * // Get first 10 Knowledges
     * const knowledges = await prisma.knowledge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const knowledgeWithIdOnly = await prisma.knowledge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends KnowledgeFindManyArgs>(args?: SelectSubset<T, KnowledgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Knowledge.
     * @param {KnowledgeCreateArgs} args - Arguments to create a Knowledge.
     * @example
     * // Create one Knowledge
     * const Knowledge = await prisma.knowledge.create({
     *   data: {
     *     // ... data to create a Knowledge
     *   }
     * })
     * 
     */
    create<T extends KnowledgeCreateArgs>(args: SelectSubset<T, KnowledgeCreateArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Knowledges.
     * @param {KnowledgeCreateManyArgs} args - Arguments to create many Knowledges.
     * @example
     * // Create many Knowledges
     * const knowledge = await prisma.knowledge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends KnowledgeCreateManyArgs>(args?: SelectSubset<T, KnowledgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Knowledges and returns the data saved in the database.
     * @param {KnowledgeCreateManyAndReturnArgs} args - Arguments to create many Knowledges.
     * @example
     * // Create many Knowledges
     * const knowledge = await prisma.knowledge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Knowledges and only return the `id`
     * const knowledgeWithIdOnly = await prisma.knowledge.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends KnowledgeCreateManyAndReturnArgs>(args?: SelectSubset<T, KnowledgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Knowledge.
     * @param {KnowledgeDeleteArgs} args - Arguments to delete one Knowledge.
     * @example
     * // Delete one Knowledge
     * const Knowledge = await prisma.knowledge.delete({
     *   where: {
     *     // ... filter to delete one Knowledge
     *   }
     * })
     * 
     */
    delete<T extends KnowledgeDeleteArgs>(args: SelectSubset<T, KnowledgeDeleteArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Knowledge.
     * @param {KnowledgeUpdateArgs} args - Arguments to update one Knowledge.
     * @example
     * // Update one Knowledge
     * const knowledge = await prisma.knowledge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends KnowledgeUpdateArgs>(args: SelectSubset<T, KnowledgeUpdateArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Knowledges.
     * @param {KnowledgeDeleteManyArgs} args - Arguments to filter Knowledges to delete.
     * @example
     * // Delete a few Knowledges
     * const { count } = await prisma.knowledge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends KnowledgeDeleteManyArgs>(args?: SelectSubset<T, KnowledgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Knowledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Knowledges
     * const knowledge = await prisma.knowledge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends KnowledgeUpdateManyArgs>(args: SelectSubset<T, KnowledgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Knowledge.
     * @param {KnowledgeUpsertArgs} args - Arguments to update or create a Knowledge.
     * @example
     * // Update or create a Knowledge
     * const knowledge = await prisma.knowledge.upsert({
     *   create: {
     *     // ... data to create a Knowledge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Knowledge we want to update
     *   }
     * })
     */
    upsert<T extends KnowledgeUpsertArgs>(args: SelectSubset<T, KnowledgeUpsertArgs<ExtArgs>>): Prisma__KnowledgeClient<$Result.GetResult<Prisma.$KnowledgePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Knowledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeCountArgs} args - Arguments to filter Knowledges to count.
     * @example
     * // Count the number of Knowledges
     * const count = await prisma.knowledge.count({
     *   where: {
     *     // ... the filter for the Knowledges we want to count
     *   }
     * })
    **/
    count<T extends KnowledgeCountArgs>(
      args?: Subset<T, KnowledgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], KnowledgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Knowledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends KnowledgeAggregateArgs>(args: Subset<T, KnowledgeAggregateArgs>): Prisma.PrismaPromise<GetKnowledgeAggregateType<T>>

    /**
     * Group by Knowledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {KnowledgeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends KnowledgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: KnowledgeGroupByArgs['orderBy'] }
        : { orderBy?: KnowledgeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, KnowledgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetKnowledgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Knowledge model
   */
  readonly fields: KnowledgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Knowledge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__KnowledgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    channel<T extends ChannelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChannelDefaultArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Knowledge model
   */ 
  interface KnowledgeFieldRefs {
    readonly id: FieldRef<"Knowledge", 'Int'>
    readonly channelId: FieldRef<"Knowledge", 'Int'>
    readonly fileName: FieldRef<"Knowledge", 'String'>
    readonly filePath: FieldRef<"Knowledge", 'String'>
    readonly fileType: FieldRef<"Knowledge", 'String'>
    readonly embeddingStatus: FieldRef<"Knowledge", 'String'>
    readonly lastUpdated: FieldRef<"Knowledge", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Knowledge findUnique
   */
  export type KnowledgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge findUniqueOrThrow
   */
  export type KnowledgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge findFirst
   */
  export type KnowledgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Knowledges.
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Knowledges.
     */
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Knowledge findFirstOrThrow
   */
  export type KnowledgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledge to fetch.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Knowledges.
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Knowledges.
     */
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Knowledge findMany
   */
  export type KnowledgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter, which Knowledges to fetch.
     */
    where?: KnowledgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Knowledges to fetch.
     */
    orderBy?: KnowledgeOrderByWithRelationInput | KnowledgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Knowledges.
     */
    cursor?: KnowledgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Knowledges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Knowledges.
     */
    skip?: number
    distinct?: KnowledgeScalarFieldEnum | KnowledgeScalarFieldEnum[]
  }

  /**
   * Knowledge create
   */
  export type KnowledgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * The data needed to create a Knowledge.
     */
    data: XOR<KnowledgeCreateInput, KnowledgeUncheckedCreateInput>
  }

  /**
   * Knowledge createMany
   */
  export type KnowledgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Knowledges.
     */
    data: KnowledgeCreateManyInput | KnowledgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Knowledge createManyAndReturn
   */
  export type KnowledgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Knowledges.
     */
    data: KnowledgeCreateManyInput | KnowledgeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Knowledge update
   */
  export type KnowledgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * The data needed to update a Knowledge.
     */
    data: XOR<KnowledgeUpdateInput, KnowledgeUncheckedUpdateInput>
    /**
     * Choose, which Knowledge to update.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge updateMany
   */
  export type KnowledgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Knowledges.
     */
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyInput>
    /**
     * Filter which Knowledges to update
     */
    where?: KnowledgeWhereInput
  }

  /**
   * Knowledge upsert
   */
  export type KnowledgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * The filter to search for the Knowledge to update in case it exists.
     */
    where: KnowledgeWhereUniqueInput
    /**
     * In case the Knowledge found by the `where` argument doesn't exist, create a new Knowledge with this data.
     */
    create: XOR<KnowledgeCreateInput, KnowledgeUncheckedCreateInput>
    /**
     * In case the Knowledge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<KnowledgeUpdateInput, KnowledgeUncheckedUpdateInput>
  }

  /**
   * Knowledge delete
   */
  export type KnowledgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
    /**
     * Filter which Knowledge to delete.
     */
    where: KnowledgeWhereUniqueInput
  }

  /**
   * Knowledge deleteMany
   */
  export type KnowledgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Knowledges to delete
     */
    where?: KnowledgeWhereInput
  }

  /**
   * Knowledge without action
   */
  export type KnowledgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Knowledge
     */
    select?: KnowledgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: KnowledgeInclude<ExtArgs> | null
  }


  /**
   * Model Ticket
   */

  export type AggregateTicket = {
    _count: TicketCountAggregateOutputType | null
    _avg: TicketAvgAggregateOutputType | null
    _sum: TicketSumAggregateOutputType | null
    _min: TicketMinAggregateOutputType | null
    _max: TicketMaxAggregateOutputType | null
  }

  export type TicketAvgAggregateOutputType = {
    id: number | null
    channelId: number | null
    lastAgentId: number | null
  }

  export type TicketSumAggregateOutputType = {
    id: number | null
    channelId: number | null
    lastAgentId: number | null
  }

  export type TicketMinAggregateOutputType = {
    id: number | null
    channelId: number | null
    customerNumber: string | null
    customerName: string | null
    status: string | null
    lastAgentId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TicketMaxAggregateOutputType = {
    id: number | null
    channelId: number | null
    customerNumber: string | null
    customerName: string | null
    status: string | null
    lastAgentId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TicketCountAggregateOutputType = {
    id: number
    channelId: number
    customerNumber: number
    customerName: number
    status: number
    lastAgentId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TicketAvgAggregateInputType = {
    id?: true
    channelId?: true
    lastAgentId?: true
  }

  export type TicketSumAggregateInputType = {
    id?: true
    channelId?: true
    lastAgentId?: true
  }

  export type TicketMinAggregateInputType = {
    id?: true
    channelId?: true
    customerNumber?: true
    customerName?: true
    status?: true
    lastAgentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TicketMaxAggregateInputType = {
    id?: true
    channelId?: true
    customerNumber?: true
    customerName?: true
    status?: true
    lastAgentId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TicketCountAggregateInputType = {
    id?: true
    channelId?: true
    customerNumber?: true
    customerName?: true
    status?: true
    lastAgentId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TicketAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ticket to aggregate.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tickets
    **/
    _count?: true | TicketCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TicketAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TicketSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TicketMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TicketMaxAggregateInputType
  }

  export type GetTicketAggregateType<T extends TicketAggregateArgs> = {
        [P in keyof T & keyof AggregateTicket]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTicket[P]>
      : GetScalarType<T[P], AggregateTicket[P]>
  }




  export type TicketGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TicketWhereInput
    orderBy?: TicketOrderByWithAggregationInput | TicketOrderByWithAggregationInput[]
    by: TicketScalarFieldEnum[] | TicketScalarFieldEnum
    having?: TicketScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TicketCountAggregateInputType | true
    _avg?: TicketAvgAggregateInputType
    _sum?: TicketSumAggregateInputType
    _min?: TicketMinAggregateInputType
    _max?: TicketMaxAggregateInputType
  }

  export type TicketGroupByOutputType = {
    id: number
    channelId: number
    customerNumber: string
    customerName: string | null
    status: string
    lastAgentId: number | null
    createdAt: Date
    updatedAt: Date
    _count: TicketCountAggregateOutputType | null
    _avg: TicketAvgAggregateOutputType | null
    _sum: TicketSumAggregateOutputType | null
    _min: TicketMinAggregateOutputType | null
    _max: TicketMaxAggregateOutputType | null
  }

  type GetTicketGroupByPayload<T extends TicketGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TicketGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TicketGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TicketGroupByOutputType[P]>
            : GetScalarType<T[P], TicketGroupByOutputType[P]>
        }
      >
    >


  export type TicketSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channelId?: boolean
    customerNumber?: boolean
    customerName?: boolean
    status?: boolean
    lastAgentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
    lastAgent?: boolean | Ticket$lastAgentArgs<ExtArgs>
  }, ExtArgs["result"]["ticket"]>

  export type TicketSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    channelId?: boolean
    customerNumber?: boolean
    customerName?: boolean
    status?: boolean
    lastAgentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
    lastAgent?: boolean | Ticket$lastAgentArgs<ExtArgs>
  }, ExtArgs["result"]["ticket"]>

  export type TicketSelectScalar = {
    id?: boolean
    channelId?: boolean
    customerNumber?: boolean
    customerName?: boolean
    status?: boolean
    lastAgentId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TicketInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
    lastAgent?: boolean | Ticket$lastAgentArgs<ExtArgs>
  }
  export type TicketIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    channel?: boolean | ChannelDefaultArgs<ExtArgs>
    lastAgent?: boolean | Ticket$lastAgentArgs<ExtArgs>
  }

  export type $TicketPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ticket"
    objects: {
      channel: Prisma.$ChannelPayload<ExtArgs>
      lastAgent: Prisma.$SAAgentPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      channelId: number
      customerNumber: string
      customerName: string | null
      status: string
      lastAgentId: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["ticket"]>
    composites: {}
  }

  type TicketGetPayload<S extends boolean | null | undefined | TicketDefaultArgs> = $Result.GetResult<Prisma.$TicketPayload, S>

  type TicketCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TicketFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TicketCountAggregateInputType | true
    }

  export interface TicketDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ticket'], meta: { name: 'Ticket' } }
    /**
     * Find zero or one Ticket that matches the filter.
     * @param {TicketFindUniqueArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TicketFindUniqueArgs>(args: SelectSubset<T, TicketFindUniqueArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Ticket that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TicketFindUniqueOrThrowArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TicketFindUniqueOrThrowArgs>(args: SelectSubset<T, TicketFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Ticket that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindFirstArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TicketFindFirstArgs>(args?: SelectSubset<T, TicketFindFirstArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Ticket that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindFirstOrThrowArgs} args - Arguments to find a Ticket
     * @example
     * // Get one Ticket
     * const ticket = await prisma.ticket.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TicketFindFirstOrThrowArgs>(args?: SelectSubset<T, TicketFindFirstOrThrowArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tickets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tickets
     * const tickets = await prisma.ticket.findMany()
     * 
     * // Get first 10 Tickets
     * const tickets = await prisma.ticket.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const ticketWithIdOnly = await prisma.ticket.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TicketFindManyArgs>(args?: SelectSubset<T, TicketFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Ticket.
     * @param {TicketCreateArgs} args - Arguments to create a Ticket.
     * @example
     * // Create one Ticket
     * const Ticket = await prisma.ticket.create({
     *   data: {
     *     // ... data to create a Ticket
     *   }
     * })
     * 
     */
    create<T extends TicketCreateArgs>(args: SelectSubset<T, TicketCreateArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tickets.
     * @param {TicketCreateManyArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const ticket = await prisma.ticket.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TicketCreateManyArgs>(args?: SelectSubset<T, TicketCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tickets and returns the data saved in the database.
     * @param {TicketCreateManyAndReturnArgs} args - Arguments to create many Tickets.
     * @example
     * // Create many Tickets
     * const ticket = await prisma.ticket.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tickets and only return the `id`
     * const ticketWithIdOnly = await prisma.ticket.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TicketCreateManyAndReturnArgs>(args?: SelectSubset<T, TicketCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Ticket.
     * @param {TicketDeleteArgs} args - Arguments to delete one Ticket.
     * @example
     * // Delete one Ticket
     * const Ticket = await prisma.ticket.delete({
     *   where: {
     *     // ... filter to delete one Ticket
     *   }
     * })
     * 
     */
    delete<T extends TicketDeleteArgs>(args: SelectSubset<T, TicketDeleteArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Ticket.
     * @param {TicketUpdateArgs} args - Arguments to update one Ticket.
     * @example
     * // Update one Ticket
     * const ticket = await prisma.ticket.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TicketUpdateArgs>(args: SelectSubset<T, TicketUpdateArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tickets.
     * @param {TicketDeleteManyArgs} args - Arguments to filter Tickets to delete.
     * @example
     * // Delete a few Tickets
     * const { count } = await prisma.ticket.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TicketDeleteManyArgs>(args?: SelectSubset<T, TicketDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tickets
     * const ticket = await prisma.ticket.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TicketUpdateManyArgs>(args: SelectSubset<T, TicketUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ticket.
     * @param {TicketUpsertArgs} args - Arguments to update or create a Ticket.
     * @example
     * // Update or create a Ticket
     * const ticket = await prisma.ticket.upsert({
     *   create: {
     *     // ... data to create a Ticket
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ticket we want to update
     *   }
     * })
     */
    upsert<T extends TicketUpsertArgs>(args: SelectSubset<T, TicketUpsertArgs<ExtArgs>>): Prisma__TicketClient<$Result.GetResult<Prisma.$TicketPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tickets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketCountArgs} args - Arguments to filter Tickets to count.
     * @example
     * // Count the number of Tickets
     * const count = await prisma.ticket.count({
     *   where: {
     *     // ... the filter for the Tickets we want to count
     *   }
     * })
    **/
    count<T extends TicketCountArgs>(
      args?: Subset<T, TicketCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TicketCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ticket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TicketAggregateArgs>(args: Subset<T, TicketAggregateArgs>): Prisma.PrismaPromise<GetTicketAggregateType<T>>

    /**
     * Group by Ticket.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TicketGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TicketGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TicketGroupByArgs['orderBy'] }
        : { orderBy?: TicketGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TicketGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTicketGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ticket model
   */
  readonly fields: TicketFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ticket.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TicketClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    channel<T extends ChannelDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChannelDefaultArgs<ExtArgs>>): Prisma__ChannelClient<$Result.GetResult<Prisma.$ChannelPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    lastAgent<T extends Ticket$lastAgentArgs<ExtArgs> = {}>(args?: Subset<T, Ticket$lastAgentArgs<ExtArgs>>): Prisma__SAAgentClient<$Result.GetResult<Prisma.$SAAgentPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ticket model
   */ 
  interface TicketFieldRefs {
    readonly id: FieldRef<"Ticket", 'Int'>
    readonly channelId: FieldRef<"Ticket", 'Int'>
    readonly customerNumber: FieldRef<"Ticket", 'String'>
    readonly customerName: FieldRef<"Ticket", 'String'>
    readonly status: FieldRef<"Ticket", 'String'>
    readonly lastAgentId: FieldRef<"Ticket", 'Int'>
    readonly createdAt: FieldRef<"Ticket", 'DateTime'>
    readonly updatedAt: FieldRef<"Ticket", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Ticket findUnique
   */
  export type TicketFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket findUniqueOrThrow
   */
  export type TicketFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket findFirst
   */
  export type TicketFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tickets.
     */
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket findFirstOrThrow
   */
  export type TicketFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Ticket to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tickets.
     */
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket findMany
   */
  export type TicketFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter, which Tickets to fetch.
     */
    where?: TicketWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tickets to fetch.
     */
    orderBy?: TicketOrderByWithRelationInput | TicketOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tickets.
     */
    cursor?: TicketWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tickets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tickets.
     */
    skip?: number
    distinct?: TicketScalarFieldEnum | TicketScalarFieldEnum[]
  }

  /**
   * Ticket create
   */
  export type TicketCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The data needed to create a Ticket.
     */
    data: XOR<TicketCreateInput, TicketUncheckedCreateInput>
  }

  /**
   * Ticket createMany
   */
  export type TicketCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tickets.
     */
    data: TicketCreateManyInput | TicketCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ticket createManyAndReturn
   */
  export type TicketCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tickets.
     */
    data: TicketCreateManyInput | TicketCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ticket update
   */
  export type TicketUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The data needed to update a Ticket.
     */
    data: XOR<TicketUpdateInput, TicketUncheckedUpdateInput>
    /**
     * Choose, which Ticket to update.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket updateMany
   */
  export type TicketUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tickets.
     */
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyInput>
    /**
     * Filter which Tickets to update
     */
    where?: TicketWhereInput
  }

  /**
   * Ticket upsert
   */
  export type TicketUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * The filter to search for the Ticket to update in case it exists.
     */
    where: TicketWhereUniqueInput
    /**
     * In case the Ticket found by the `where` argument doesn't exist, create a new Ticket with this data.
     */
    create: XOR<TicketCreateInput, TicketUncheckedCreateInput>
    /**
     * In case the Ticket was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TicketUpdateInput, TicketUncheckedUpdateInput>
  }

  /**
   * Ticket delete
   */
  export type TicketDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
    /**
     * Filter which Ticket to delete.
     */
    where: TicketWhereUniqueInput
  }

  /**
   * Ticket deleteMany
   */
  export type TicketDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tickets to delete
     */
    where?: TicketWhereInput
  }

  /**
   * Ticket.lastAgent
   */
  export type Ticket$lastAgentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SAAgent
     */
    select?: SAAgentSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SAAgentInclude<ExtArgs> | null
    where?: SAAgentWhereInput
  }

  /**
   * Ticket without action
   */
  export type TicketDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ticket
     */
    select?: TicketSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TicketInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SaaSCompanyScalarFieldEnum: {
    id: 'id',
    businessName: 'businessName',
    legalName: 'legalName',
    taxId: 'taxId',
    taxType: 'taxType',
    brandManualUrl: 'brandManualUrl',
    createdAt: 'createdAt'
  };

  export type SaaSCompanyScalarFieldEnum = (typeof SaaSCompanyScalarFieldEnum)[keyof typeof SaaSCompanyScalarFieldEnum]


  export const SAAgentScalarFieldEnum: {
    id: 'id',
    companyId: 'companyId',
    name: 'name',
    email: 'email',
    passwordHash: 'passwordHash',
    role: 'role',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type SAAgentScalarFieldEnum = (typeof SAAgentScalarFieldEnum)[keyof typeof SAAgentScalarFieldEnum]


  export const ChannelScalarFieldEnum: {
    id: 'id',
    companyId: 'companyId',
    platform: 'platform',
    botName: 'botName',
    instanceName: 'instanceName',
    configA1: 'configA1',
    configA2: 'configA2',
    configA3: 'configA3',
    credentials: 'credentials',
    debugMode: 'debugMode',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type ChannelScalarFieldEnum = (typeof ChannelScalarFieldEnum)[keyof typeof ChannelScalarFieldEnum]


  export const KnowledgeScalarFieldEnum: {
    id: 'id',
    channelId: 'channelId',
    fileName: 'fileName',
    filePath: 'filePath',
    fileType: 'fileType',
    embeddingStatus: 'embeddingStatus',
    lastUpdated: 'lastUpdated'
  };

  export type KnowledgeScalarFieldEnum = (typeof KnowledgeScalarFieldEnum)[keyof typeof KnowledgeScalarFieldEnum]


  export const TicketScalarFieldEnum: {
    id: 'id',
    channelId: 'channelId',
    customerNumber: 'customerNumber',
    customerName: 'customerName',
    status: 'status',
    lastAgentId: 'lastAgentId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TicketScalarFieldEnum = (typeof TicketScalarFieldEnum)[keyof typeof TicketScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type SaaSCompanyWhereInput = {
    AND?: SaaSCompanyWhereInput | SaaSCompanyWhereInput[]
    OR?: SaaSCompanyWhereInput[]
    NOT?: SaaSCompanyWhereInput | SaaSCompanyWhereInput[]
    id?: IntFilter<"SaaSCompany"> | number
    businessName?: StringFilter<"SaaSCompany"> | string
    legalName?: StringNullableFilter<"SaaSCompany"> | string | null
    taxId?: StringFilter<"SaaSCompany"> | string
    taxType?: StringNullableFilter<"SaaSCompany"> | string | null
    brandManualUrl?: StringNullableFilter<"SaaSCompany"> | string | null
    createdAt?: DateTimeFilter<"SaaSCompany"> | Date | string
    agents?: SAAgentListRelationFilter
    channels?: ChannelListRelationFilter
  }

  export type SaaSCompanyOrderByWithRelationInput = {
    id?: SortOrder
    businessName?: SortOrder
    legalName?: SortOrderInput | SortOrder
    taxId?: SortOrder
    taxType?: SortOrderInput | SortOrder
    brandManualUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    agents?: SAAgentOrderByRelationAggregateInput
    channels?: ChannelOrderByRelationAggregateInput
  }

  export type SaaSCompanyWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    taxId?: string
    AND?: SaaSCompanyWhereInput | SaaSCompanyWhereInput[]
    OR?: SaaSCompanyWhereInput[]
    NOT?: SaaSCompanyWhereInput | SaaSCompanyWhereInput[]
    businessName?: StringFilter<"SaaSCompany"> | string
    legalName?: StringNullableFilter<"SaaSCompany"> | string | null
    taxType?: StringNullableFilter<"SaaSCompany"> | string | null
    brandManualUrl?: StringNullableFilter<"SaaSCompany"> | string | null
    createdAt?: DateTimeFilter<"SaaSCompany"> | Date | string
    agents?: SAAgentListRelationFilter
    channels?: ChannelListRelationFilter
  }, "id" | "taxId">

  export type SaaSCompanyOrderByWithAggregationInput = {
    id?: SortOrder
    businessName?: SortOrder
    legalName?: SortOrderInput | SortOrder
    taxId?: SortOrder
    taxType?: SortOrderInput | SortOrder
    brandManualUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: SaaSCompanyCountOrderByAggregateInput
    _avg?: SaaSCompanyAvgOrderByAggregateInput
    _max?: SaaSCompanyMaxOrderByAggregateInput
    _min?: SaaSCompanyMinOrderByAggregateInput
    _sum?: SaaSCompanySumOrderByAggregateInput
  }

  export type SaaSCompanyScalarWhereWithAggregatesInput = {
    AND?: SaaSCompanyScalarWhereWithAggregatesInput | SaaSCompanyScalarWhereWithAggregatesInput[]
    OR?: SaaSCompanyScalarWhereWithAggregatesInput[]
    NOT?: SaaSCompanyScalarWhereWithAggregatesInput | SaaSCompanyScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SaaSCompany"> | number
    businessName?: StringWithAggregatesFilter<"SaaSCompany"> | string
    legalName?: StringNullableWithAggregatesFilter<"SaaSCompany"> | string | null
    taxId?: StringWithAggregatesFilter<"SaaSCompany"> | string
    taxType?: StringNullableWithAggregatesFilter<"SaaSCompany"> | string | null
    brandManualUrl?: StringNullableWithAggregatesFilter<"SaaSCompany"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"SaaSCompany"> | Date | string
  }

  export type SAAgentWhereInput = {
    AND?: SAAgentWhereInput | SAAgentWhereInput[]
    OR?: SAAgentWhereInput[]
    NOT?: SAAgentWhereInput | SAAgentWhereInput[]
    id?: IntFilter<"SAAgent"> | number
    companyId?: IntFilter<"SAAgent"> | number
    name?: StringFilter<"SAAgent"> | string
    email?: StringFilter<"SAAgent"> | string
    passwordHash?: StringFilter<"SAAgent"> | string
    role?: StringFilter<"SAAgent"> | string
    status?: StringFilter<"SAAgent"> | string
    createdAt?: DateTimeFilter<"SAAgent"> | Date | string
    company?: XOR<SaaSCompanyRelationFilter, SaaSCompanyWhereInput>
    tickets?: TicketListRelationFilter
  }

  export type SAAgentOrderByWithRelationInput = {
    id?: SortOrder
    companyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    company?: SaaSCompanyOrderByWithRelationInput
    tickets?: TicketOrderByRelationAggregateInput
  }

  export type SAAgentWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: SAAgentWhereInput | SAAgentWhereInput[]
    OR?: SAAgentWhereInput[]
    NOT?: SAAgentWhereInput | SAAgentWhereInput[]
    companyId?: IntFilter<"SAAgent"> | number
    name?: StringFilter<"SAAgent"> | string
    passwordHash?: StringFilter<"SAAgent"> | string
    role?: StringFilter<"SAAgent"> | string
    status?: StringFilter<"SAAgent"> | string
    createdAt?: DateTimeFilter<"SAAgent"> | Date | string
    company?: XOR<SaaSCompanyRelationFilter, SaaSCompanyWhereInput>
    tickets?: TicketListRelationFilter
  }, "id" | "email">

  export type SAAgentOrderByWithAggregationInput = {
    id?: SortOrder
    companyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: SAAgentCountOrderByAggregateInput
    _avg?: SAAgentAvgOrderByAggregateInput
    _max?: SAAgentMaxOrderByAggregateInput
    _min?: SAAgentMinOrderByAggregateInput
    _sum?: SAAgentSumOrderByAggregateInput
  }

  export type SAAgentScalarWhereWithAggregatesInput = {
    AND?: SAAgentScalarWhereWithAggregatesInput | SAAgentScalarWhereWithAggregatesInput[]
    OR?: SAAgentScalarWhereWithAggregatesInput[]
    NOT?: SAAgentScalarWhereWithAggregatesInput | SAAgentScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SAAgent"> | number
    companyId?: IntWithAggregatesFilter<"SAAgent"> | number
    name?: StringWithAggregatesFilter<"SAAgent"> | string
    email?: StringWithAggregatesFilter<"SAAgent"> | string
    passwordHash?: StringWithAggregatesFilter<"SAAgent"> | string
    role?: StringWithAggregatesFilter<"SAAgent"> | string
    status?: StringWithAggregatesFilter<"SAAgent"> | string
    createdAt?: DateTimeWithAggregatesFilter<"SAAgent"> | Date | string
  }

  export type ChannelWhereInput = {
    AND?: ChannelWhereInput | ChannelWhereInput[]
    OR?: ChannelWhereInput[]
    NOT?: ChannelWhereInput | ChannelWhereInput[]
    id?: IntFilter<"Channel"> | number
    companyId?: IntFilter<"Channel"> | number
    platform?: StringFilter<"Channel"> | string
    botName?: StringFilter<"Channel"> | string
    instanceName?: StringFilter<"Channel"> | string
    configA1?: JsonNullableFilter<"Channel">
    configA2?: JsonNullableFilter<"Channel">
    configA3?: JsonNullableFilter<"Channel">
    credentials?: JsonNullableFilter<"Channel">
    debugMode?: JsonNullableFilter<"Channel">
    status?: StringFilter<"Channel"> | string
    createdAt?: DateTimeFilter<"Channel"> | Date | string
    company?: XOR<SaaSCompanyRelationFilter, SaaSCompanyWhereInput>
    knowledgeBase?: KnowledgeListRelationFilter
    tickets?: TicketListRelationFilter
  }

  export type ChannelOrderByWithRelationInput = {
    id?: SortOrder
    companyId?: SortOrder
    platform?: SortOrder
    botName?: SortOrder
    instanceName?: SortOrder
    configA1?: SortOrderInput | SortOrder
    configA2?: SortOrderInput | SortOrder
    configA3?: SortOrderInput | SortOrder
    credentials?: SortOrderInput | SortOrder
    debugMode?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    company?: SaaSCompanyOrderByWithRelationInput
    knowledgeBase?: KnowledgeOrderByRelationAggregateInput
    tickets?: TicketOrderByRelationAggregateInput
  }

  export type ChannelWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    instanceName?: string
    AND?: ChannelWhereInput | ChannelWhereInput[]
    OR?: ChannelWhereInput[]
    NOT?: ChannelWhereInput | ChannelWhereInput[]
    companyId?: IntFilter<"Channel"> | number
    platform?: StringFilter<"Channel"> | string
    botName?: StringFilter<"Channel"> | string
    configA1?: JsonNullableFilter<"Channel">
    configA2?: JsonNullableFilter<"Channel">
    configA3?: JsonNullableFilter<"Channel">
    credentials?: JsonNullableFilter<"Channel">
    debugMode?: JsonNullableFilter<"Channel">
    status?: StringFilter<"Channel"> | string
    createdAt?: DateTimeFilter<"Channel"> | Date | string
    company?: XOR<SaaSCompanyRelationFilter, SaaSCompanyWhereInput>
    knowledgeBase?: KnowledgeListRelationFilter
    tickets?: TicketListRelationFilter
  }, "id" | "instanceName">

  export type ChannelOrderByWithAggregationInput = {
    id?: SortOrder
    companyId?: SortOrder
    platform?: SortOrder
    botName?: SortOrder
    instanceName?: SortOrder
    configA1?: SortOrderInput | SortOrder
    configA2?: SortOrderInput | SortOrder
    configA3?: SortOrderInput | SortOrder
    credentials?: SortOrderInput | SortOrder
    debugMode?: SortOrderInput | SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    _count?: ChannelCountOrderByAggregateInput
    _avg?: ChannelAvgOrderByAggregateInput
    _max?: ChannelMaxOrderByAggregateInput
    _min?: ChannelMinOrderByAggregateInput
    _sum?: ChannelSumOrderByAggregateInput
  }

  export type ChannelScalarWhereWithAggregatesInput = {
    AND?: ChannelScalarWhereWithAggregatesInput | ChannelScalarWhereWithAggregatesInput[]
    OR?: ChannelScalarWhereWithAggregatesInput[]
    NOT?: ChannelScalarWhereWithAggregatesInput | ChannelScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Channel"> | number
    companyId?: IntWithAggregatesFilter<"Channel"> | number
    platform?: StringWithAggregatesFilter<"Channel"> | string
    botName?: StringWithAggregatesFilter<"Channel"> | string
    instanceName?: StringWithAggregatesFilter<"Channel"> | string
    configA1?: JsonNullableWithAggregatesFilter<"Channel">
    configA2?: JsonNullableWithAggregatesFilter<"Channel">
    configA3?: JsonNullableWithAggregatesFilter<"Channel">
    credentials?: JsonNullableWithAggregatesFilter<"Channel">
    debugMode?: JsonNullableWithAggregatesFilter<"Channel">
    status?: StringWithAggregatesFilter<"Channel"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Channel"> | Date | string
  }

  export type KnowledgeWhereInput = {
    AND?: KnowledgeWhereInput | KnowledgeWhereInput[]
    OR?: KnowledgeWhereInput[]
    NOT?: KnowledgeWhereInput | KnowledgeWhereInput[]
    id?: IntFilter<"Knowledge"> | number
    channelId?: IntFilter<"Knowledge"> | number
    fileName?: StringFilter<"Knowledge"> | string
    filePath?: StringFilter<"Knowledge"> | string
    fileType?: StringNullableFilter<"Knowledge"> | string | null
    embeddingStatus?: StringFilter<"Knowledge"> | string
    lastUpdated?: DateTimeFilter<"Knowledge"> | Date | string
    channel?: XOR<ChannelRelationFilter, ChannelWhereInput>
  }

  export type KnowledgeOrderByWithRelationInput = {
    id?: SortOrder
    channelId?: SortOrder
    fileName?: SortOrder
    filePath?: SortOrder
    fileType?: SortOrderInput | SortOrder
    embeddingStatus?: SortOrder
    lastUpdated?: SortOrder
    channel?: ChannelOrderByWithRelationInput
  }

  export type KnowledgeWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: KnowledgeWhereInput | KnowledgeWhereInput[]
    OR?: KnowledgeWhereInput[]
    NOT?: KnowledgeWhereInput | KnowledgeWhereInput[]
    channelId?: IntFilter<"Knowledge"> | number
    fileName?: StringFilter<"Knowledge"> | string
    filePath?: StringFilter<"Knowledge"> | string
    fileType?: StringNullableFilter<"Knowledge"> | string | null
    embeddingStatus?: StringFilter<"Knowledge"> | string
    lastUpdated?: DateTimeFilter<"Knowledge"> | Date | string
    channel?: XOR<ChannelRelationFilter, ChannelWhereInput>
  }, "id">

  export type KnowledgeOrderByWithAggregationInput = {
    id?: SortOrder
    channelId?: SortOrder
    fileName?: SortOrder
    filePath?: SortOrder
    fileType?: SortOrderInput | SortOrder
    embeddingStatus?: SortOrder
    lastUpdated?: SortOrder
    _count?: KnowledgeCountOrderByAggregateInput
    _avg?: KnowledgeAvgOrderByAggregateInput
    _max?: KnowledgeMaxOrderByAggregateInput
    _min?: KnowledgeMinOrderByAggregateInput
    _sum?: KnowledgeSumOrderByAggregateInput
  }

  export type KnowledgeScalarWhereWithAggregatesInput = {
    AND?: KnowledgeScalarWhereWithAggregatesInput | KnowledgeScalarWhereWithAggregatesInput[]
    OR?: KnowledgeScalarWhereWithAggregatesInput[]
    NOT?: KnowledgeScalarWhereWithAggregatesInput | KnowledgeScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Knowledge"> | number
    channelId?: IntWithAggregatesFilter<"Knowledge"> | number
    fileName?: StringWithAggregatesFilter<"Knowledge"> | string
    filePath?: StringWithAggregatesFilter<"Knowledge"> | string
    fileType?: StringNullableWithAggregatesFilter<"Knowledge"> | string | null
    embeddingStatus?: StringWithAggregatesFilter<"Knowledge"> | string
    lastUpdated?: DateTimeWithAggregatesFilter<"Knowledge"> | Date | string
  }

  export type TicketWhereInput = {
    AND?: TicketWhereInput | TicketWhereInput[]
    OR?: TicketWhereInput[]
    NOT?: TicketWhereInput | TicketWhereInput[]
    id?: IntFilter<"Ticket"> | number
    channelId?: IntFilter<"Ticket"> | number
    customerNumber?: StringFilter<"Ticket"> | string
    customerName?: StringNullableFilter<"Ticket"> | string | null
    status?: StringFilter<"Ticket"> | string
    lastAgentId?: IntNullableFilter<"Ticket"> | number | null
    createdAt?: DateTimeFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeFilter<"Ticket"> | Date | string
    channel?: XOR<ChannelRelationFilter, ChannelWhereInput>
    lastAgent?: XOR<SAAgentNullableRelationFilter, SAAgentWhereInput> | null
  }

  export type TicketOrderByWithRelationInput = {
    id?: SortOrder
    channelId?: SortOrder
    customerNumber?: SortOrder
    customerName?: SortOrderInput | SortOrder
    status?: SortOrder
    lastAgentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    channel?: ChannelOrderByWithRelationInput
    lastAgent?: SAAgentOrderByWithRelationInput
  }

  export type TicketWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TicketWhereInput | TicketWhereInput[]
    OR?: TicketWhereInput[]
    NOT?: TicketWhereInput | TicketWhereInput[]
    channelId?: IntFilter<"Ticket"> | number
    customerNumber?: StringFilter<"Ticket"> | string
    customerName?: StringNullableFilter<"Ticket"> | string | null
    status?: StringFilter<"Ticket"> | string
    lastAgentId?: IntNullableFilter<"Ticket"> | number | null
    createdAt?: DateTimeFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeFilter<"Ticket"> | Date | string
    channel?: XOR<ChannelRelationFilter, ChannelWhereInput>
    lastAgent?: XOR<SAAgentNullableRelationFilter, SAAgentWhereInput> | null
  }, "id">

  export type TicketOrderByWithAggregationInput = {
    id?: SortOrder
    channelId?: SortOrder
    customerNumber?: SortOrder
    customerName?: SortOrderInput | SortOrder
    status?: SortOrder
    lastAgentId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TicketCountOrderByAggregateInput
    _avg?: TicketAvgOrderByAggregateInput
    _max?: TicketMaxOrderByAggregateInput
    _min?: TicketMinOrderByAggregateInput
    _sum?: TicketSumOrderByAggregateInput
  }

  export type TicketScalarWhereWithAggregatesInput = {
    AND?: TicketScalarWhereWithAggregatesInput | TicketScalarWhereWithAggregatesInput[]
    OR?: TicketScalarWhereWithAggregatesInput[]
    NOT?: TicketScalarWhereWithAggregatesInput | TicketScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Ticket"> | number
    channelId?: IntWithAggregatesFilter<"Ticket"> | number
    customerNumber?: StringWithAggregatesFilter<"Ticket"> | string
    customerName?: StringNullableWithAggregatesFilter<"Ticket"> | string | null
    status?: StringWithAggregatesFilter<"Ticket"> | string
    lastAgentId?: IntNullableWithAggregatesFilter<"Ticket"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Ticket"> | Date | string
  }

  export type SaaSCompanyCreateInput = {
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
    agents?: SAAgentCreateNestedManyWithoutCompanyInput
    channels?: ChannelCreateNestedManyWithoutCompanyInput
  }

  export type SaaSCompanyUncheckedCreateInput = {
    id?: number
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
    agents?: SAAgentUncheckedCreateNestedManyWithoutCompanyInput
    channels?: ChannelUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type SaaSCompanyUpdateInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agents?: SAAgentUpdateManyWithoutCompanyNestedInput
    channels?: ChannelUpdateManyWithoutCompanyNestedInput
  }

  export type SaaSCompanyUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agents?: SAAgentUncheckedUpdateManyWithoutCompanyNestedInput
    channels?: ChannelUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type SaaSCompanyCreateManyInput = {
    id?: number
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
  }

  export type SaaSCompanyUpdateManyMutationInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SaaSCompanyUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SAAgentCreateInput = {
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
    company: SaaSCompanyCreateNestedOneWithoutAgentsInput
    tickets?: TicketCreateNestedManyWithoutLastAgentInput
  }

  export type SAAgentUncheckedCreateInput = {
    id?: number
    companyId: number
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
    tickets?: TicketUncheckedCreateNestedManyWithoutLastAgentInput
  }

  export type SAAgentUpdateInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: SaaSCompanyUpdateOneRequiredWithoutAgentsNestedInput
    tickets?: TicketUpdateManyWithoutLastAgentNestedInput
  }

  export type SAAgentUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUncheckedUpdateManyWithoutLastAgentNestedInput
  }

  export type SAAgentCreateManyInput = {
    id?: number
    companyId: number
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
  }

  export type SAAgentUpdateManyMutationInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SAAgentUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelCreateInput = {
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    company: SaaSCompanyCreateNestedOneWithoutChannelsInput
    knowledgeBase?: KnowledgeCreateNestedManyWithoutChannelInput
    tickets?: TicketCreateNestedManyWithoutChannelInput
  }

  export type ChannelUncheckedCreateInput = {
    id?: number
    companyId: number
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    knowledgeBase?: KnowledgeUncheckedCreateNestedManyWithoutChannelInput
    tickets?: TicketUncheckedCreateNestedManyWithoutChannelInput
  }

  export type ChannelUpdateInput = {
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: SaaSCompanyUpdateOneRequiredWithoutChannelsNestedInput
    knowledgeBase?: KnowledgeUpdateManyWithoutChannelNestedInput
    tickets?: TicketUpdateManyWithoutChannelNestedInput
  }

  export type ChannelUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    knowledgeBase?: KnowledgeUncheckedUpdateManyWithoutChannelNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutChannelNestedInput
  }

  export type ChannelCreateManyInput = {
    id?: number
    companyId: number
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
  }

  export type ChannelUpdateManyMutationInput = {
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeCreateInput = {
    fileName: string
    filePath: string
    fileType?: string | null
    embeddingStatus?: string
    lastUpdated?: Date | string
    channel: ChannelCreateNestedOneWithoutKnowledgeBaseInput
  }

  export type KnowledgeUncheckedCreateInput = {
    id?: number
    channelId: number
    fileName: string
    filePath: string
    fileType?: string | null
    embeddingStatus?: string
    lastUpdated?: Date | string
  }

  export type KnowledgeUpdateInput = {
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
    channel?: ChannelUpdateOneRequiredWithoutKnowledgeBaseNestedInput
  }

  export type KnowledgeUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    channelId?: IntFieldUpdateOperationsInput | number
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeCreateManyInput = {
    id?: number
    channelId: number
    fileName: string
    filePath: string
    fileType?: string | null
    embeddingStatus?: string
    lastUpdated?: Date | string
  }

  export type KnowledgeUpdateManyMutationInput = {
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    channelId?: IntFieldUpdateOperationsInput | number
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketCreateInput = {
    customerNumber: string
    customerName?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    channel: ChannelCreateNestedOneWithoutTicketsInput
    lastAgent?: SAAgentCreateNestedOneWithoutTicketsInput
  }

  export type TicketUncheckedCreateInput = {
    id?: number
    channelId: number
    customerNumber: string
    customerName?: string | null
    status?: string
    lastAgentId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketUpdateInput = {
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channel?: ChannelUpdateOneRequiredWithoutTicketsNestedInput
    lastAgent?: SAAgentUpdateOneWithoutTicketsNestedInput
  }

  export type TicketUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    channelId?: IntFieldUpdateOperationsInput | number
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    lastAgentId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketCreateManyInput = {
    id?: number
    channelId: number
    customerNumber: string
    customerName?: string | null
    status?: string
    lastAgentId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketUpdateManyMutationInput = {
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    channelId?: IntFieldUpdateOperationsInput | number
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    lastAgentId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SAAgentListRelationFilter = {
    every?: SAAgentWhereInput
    some?: SAAgentWhereInput
    none?: SAAgentWhereInput
  }

  export type ChannelListRelationFilter = {
    every?: ChannelWhereInput
    some?: ChannelWhereInput
    none?: ChannelWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SAAgentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChannelOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SaaSCompanyCountOrderByAggregateInput = {
    id?: SortOrder
    businessName?: SortOrder
    legalName?: SortOrder
    taxId?: SortOrder
    taxType?: SortOrder
    brandManualUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type SaaSCompanyAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type SaaSCompanyMaxOrderByAggregateInput = {
    id?: SortOrder
    businessName?: SortOrder
    legalName?: SortOrder
    taxId?: SortOrder
    taxType?: SortOrder
    brandManualUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type SaaSCompanyMinOrderByAggregateInput = {
    id?: SortOrder
    businessName?: SortOrder
    legalName?: SortOrder
    taxId?: SortOrder
    taxType?: SortOrder
    brandManualUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type SaaSCompanySumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SaaSCompanyRelationFilter = {
    is?: SaaSCompanyWhereInput
    isNot?: SaaSCompanyWhereInput
  }

  export type TicketListRelationFilter = {
    every?: TicketWhereInput
    some?: TicketWhereInput
    none?: TicketWhereInput
  }

  export type TicketOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SAAgentCountOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type SAAgentAvgOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
  }

  export type SAAgentMaxOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type SAAgentMinOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    name?: SortOrder
    email?: SortOrder
    passwordHash?: SortOrder
    role?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type SAAgentSumOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type KnowledgeListRelationFilter = {
    every?: KnowledgeWhereInput
    some?: KnowledgeWhereInput
    none?: KnowledgeWhereInput
  }

  export type KnowledgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChannelCountOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    platform?: SortOrder
    botName?: SortOrder
    instanceName?: SortOrder
    configA1?: SortOrder
    configA2?: SortOrder
    configA3?: SortOrder
    credentials?: SortOrder
    debugMode?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ChannelAvgOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
  }

  export type ChannelMaxOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    platform?: SortOrder
    botName?: SortOrder
    instanceName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ChannelMinOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
    platform?: SortOrder
    botName?: SortOrder
    instanceName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type ChannelSumOrderByAggregateInput = {
    id?: SortOrder
    companyId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type ChannelRelationFilter = {
    is?: ChannelWhereInput
    isNot?: ChannelWhereInput
  }

  export type KnowledgeCountOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    fileName?: SortOrder
    filePath?: SortOrder
    fileType?: SortOrder
    embeddingStatus?: SortOrder
    lastUpdated?: SortOrder
  }

  export type KnowledgeAvgOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
  }

  export type KnowledgeMaxOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    fileName?: SortOrder
    filePath?: SortOrder
    fileType?: SortOrder
    embeddingStatus?: SortOrder
    lastUpdated?: SortOrder
  }

  export type KnowledgeMinOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    fileName?: SortOrder
    filePath?: SortOrder
    fileType?: SortOrder
    embeddingStatus?: SortOrder
    lastUpdated?: SortOrder
  }

  export type KnowledgeSumOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type SAAgentNullableRelationFilter = {
    is?: SAAgentWhereInput | null
    isNot?: SAAgentWhereInput | null
  }

  export type TicketCountOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    customerNumber?: SortOrder
    customerName?: SortOrder
    status?: SortOrder
    lastAgentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TicketAvgOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    lastAgentId?: SortOrder
  }

  export type TicketMaxOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    customerNumber?: SortOrder
    customerName?: SortOrder
    status?: SortOrder
    lastAgentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TicketMinOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    customerNumber?: SortOrder
    customerName?: SortOrder
    status?: SortOrder
    lastAgentId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TicketSumOrderByAggregateInput = {
    id?: SortOrder
    channelId?: SortOrder
    lastAgentId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type SAAgentCreateNestedManyWithoutCompanyInput = {
    create?: XOR<SAAgentCreateWithoutCompanyInput, SAAgentUncheckedCreateWithoutCompanyInput> | SAAgentCreateWithoutCompanyInput[] | SAAgentUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: SAAgentCreateOrConnectWithoutCompanyInput | SAAgentCreateOrConnectWithoutCompanyInput[]
    createMany?: SAAgentCreateManyCompanyInputEnvelope
    connect?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
  }

  export type ChannelCreateNestedManyWithoutCompanyInput = {
    create?: XOR<ChannelCreateWithoutCompanyInput, ChannelUncheckedCreateWithoutCompanyInput> | ChannelCreateWithoutCompanyInput[] | ChannelUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ChannelCreateOrConnectWithoutCompanyInput | ChannelCreateOrConnectWithoutCompanyInput[]
    createMany?: ChannelCreateManyCompanyInputEnvelope
    connect?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
  }

  export type SAAgentUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<SAAgentCreateWithoutCompanyInput, SAAgentUncheckedCreateWithoutCompanyInput> | SAAgentCreateWithoutCompanyInput[] | SAAgentUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: SAAgentCreateOrConnectWithoutCompanyInput | SAAgentCreateOrConnectWithoutCompanyInput[]
    createMany?: SAAgentCreateManyCompanyInputEnvelope
    connect?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
  }

  export type ChannelUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: XOR<ChannelCreateWithoutCompanyInput, ChannelUncheckedCreateWithoutCompanyInput> | ChannelCreateWithoutCompanyInput[] | ChannelUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ChannelCreateOrConnectWithoutCompanyInput | ChannelCreateOrConnectWithoutCompanyInput[]
    createMany?: ChannelCreateManyCompanyInputEnvelope
    connect?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type SAAgentUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<SAAgentCreateWithoutCompanyInput, SAAgentUncheckedCreateWithoutCompanyInput> | SAAgentCreateWithoutCompanyInput[] | SAAgentUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: SAAgentCreateOrConnectWithoutCompanyInput | SAAgentCreateOrConnectWithoutCompanyInput[]
    upsert?: SAAgentUpsertWithWhereUniqueWithoutCompanyInput | SAAgentUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: SAAgentCreateManyCompanyInputEnvelope
    set?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    disconnect?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    delete?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    connect?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    update?: SAAgentUpdateWithWhereUniqueWithoutCompanyInput | SAAgentUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: SAAgentUpdateManyWithWhereWithoutCompanyInput | SAAgentUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: SAAgentScalarWhereInput | SAAgentScalarWhereInput[]
  }

  export type ChannelUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<ChannelCreateWithoutCompanyInput, ChannelUncheckedCreateWithoutCompanyInput> | ChannelCreateWithoutCompanyInput[] | ChannelUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ChannelCreateOrConnectWithoutCompanyInput | ChannelCreateOrConnectWithoutCompanyInput[]
    upsert?: ChannelUpsertWithWhereUniqueWithoutCompanyInput | ChannelUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: ChannelCreateManyCompanyInputEnvelope
    set?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    disconnect?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    delete?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    connect?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    update?: ChannelUpdateWithWhereUniqueWithoutCompanyInput | ChannelUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: ChannelUpdateManyWithWhereWithoutCompanyInput | ChannelUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: ChannelScalarWhereInput | ChannelScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type SAAgentUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<SAAgentCreateWithoutCompanyInput, SAAgentUncheckedCreateWithoutCompanyInput> | SAAgentCreateWithoutCompanyInput[] | SAAgentUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: SAAgentCreateOrConnectWithoutCompanyInput | SAAgentCreateOrConnectWithoutCompanyInput[]
    upsert?: SAAgentUpsertWithWhereUniqueWithoutCompanyInput | SAAgentUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: SAAgentCreateManyCompanyInputEnvelope
    set?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    disconnect?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    delete?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    connect?: SAAgentWhereUniqueInput | SAAgentWhereUniqueInput[]
    update?: SAAgentUpdateWithWhereUniqueWithoutCompanyInput | SAAgentUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: SAAgentUpdateManyWithWhereWithoutCompanyInput | SAAgentUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: SAAgentScalarWhereInput | SAAgentScalarWhereInput[]
  }

  export type ChannelUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: XOR<ChannelCreateWithoutCompanyInput, ChannelUncheckedCreateWithoutCompanyInput> | ChannelCreateWithoutCompanyInput[] | ChannelUncheckedCreateWithoutCompanyInput[]
    connectOrCreate?: ChannelCreateOrConnectWithoutCompanyInput | ChannelCreateOrConnectWithoutCompanyInput[]
    upsert?: ChannelUpsertWithWhereUniqueWithoutCompanyInput | ChannelUpsertWithWhereUniqueWithoutCompanyInput[]
    createMany?: ChannelCreateManyCompanyInputEnvelope
    set?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    disconnect?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    delete?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    connect?: ChannelWhereUniqueInput | ChannelWhereUniqueInput[]
    update?: ChannelUpdateWithWhereUniqueWithoutCompanyInput | ChannelUpdateWithWhereUniqueWithoutCompanyInput[]
    updateMany?: ChannelUpdateManyWithWhereWithoutCompanyInput | ChannelUpdateManyWithWhereWithoutCompanyInput[]
    deleteMany?: ChannelScalarWhereInput | ChannelScalarWhereInput[]
  }

  export type SaaSCompanyCreateNestedOneWithoutAgentsInput = {
    create?: XOR<SaaSCompanyCreateWithoutAgentsInput, SaaSCompanyUncheckedCreateWithoutAgentsInput>
    connectOrCreate?: SaaSCompanyCreateOrConnectWithoutAgentsInput
    connect?: SaaSCompanyWhereUniqueInput
  }

  export type TicketCreateNestedManyWithoutLastAgentInput = {
    create?: XOR<TicketCreateWithoutLastAgentInput, TicketUncheckedCreateWithoutLastAgentInput> | TicketCreateWithoutLastAgentInput[] | TicketUncheckedCreateWithoutLastAgentInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutLastAgentInput | TicketCreateOrConnectWithoutLastAgentInput[]
    createMany?: TicketCreateManyLastAgentInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type TicketUncheckedCreateNestedManyWithoutLastAgentInput = {
    create?: XOR<TicketCreateWithoutLastAgentInput, TicketUncheckedCreateWithoutLastAgentInput> | TicketCreateWithoutLastAgentInput[] | TicketUncheckedCreateWithoutLastAgentInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutLastAgentInput | TicketCreateOrConnectWithoutLastAgentInput[]
    createMany?: TicketCreateManyLastAgentInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type SaaSCompanyUpdateOneRequiredWithoutAgentsNestedInput = {
    create?: XOR<SaaSCompanyCreateWithoutAgentsInput, SaaSCompanyUncheckedCreateWithoutAgentsInput>
    connectOrCreate?: SaaSCompanyCreateOrConnectWithoutAgentsInput
    upsert?: SaaSCompanyUpsertWithoutAgentsInput
    connect?: SaaSCompanyWhereUniqueInput
    update?: XOR<XOR<SaaSCompanyUpdateToOneWithWhereWithoutAgentsInput, SaaSCompanyUpdateWithoutAgentsInput>, SaaSCompanyUncheckedUpdateWithoutAgentsInput>
  }

  export type TicketUpdateManyWithoutLastAgentNestedInput = {
    create?: XOR<TicketCreateWithoutLastAgentInput, TicketUncheckedCreateWithoutLastAgentInput> | TicketCreateWithoutLastAgentInput[] | TicketUncheckedCreateWithoutLastAgentInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutLastAgentInput | TicketCreateOrConnectWithoutLastAgentInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutLastAgentInput | TicketUpsertWithWhereUniqueWithoutLastAgentInput[]
    createMany?: TicketCreateManyLastAgentInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutLastAgentInput | TicketUpdateWithWhereUniqueWithoutLastAgentInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutLastAgentInput | TicketUpdateManyWithWhereWithoutLastAgentInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type TicketUncheckedUpdateManyWithoutLastAgentNestedInput = {
    create?: XOR<TicketCreateWithoutLastAgentInput, TicketUncheckedCreateWithoutLastAgentInput> | TicketCreateWithoutLastAgentInput[] | TicketUncheckedCreateWithoutLastAgentInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutLastAgentInput | TicketCreateOrConnectWithoutLastAgentInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutLastAgentInput | TicketUpsertWithWhereUniqueWithoutLastAgentInput[]
    createMany?: TicketCreateManyLastAgentInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutLastAgentInput | TicketUpdateWithWhereUniqueWithoutLastAgentInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutLastAgentInput | TicketUpdateManyWithWhereWithoutLastAgentInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type SaaSCompanyCreateNestedOneWithoutChannelsInput = {
    create?: XOR<SaaSCompanyCreateWithoutChannelsInput, SaaSCompanyUncheckedCreateWithoutChannelsInput>
    connectOrCreate?: SaaSCompanyCreateOrConnectWithoutChannelsInput
    connect?: SaaSCompanyWhereUniqueInput
  }

  export type KnowledgeCreateNestedManyWithoutChannelInput = {
    create?: XOR<KnowledgeCreateWithoutChannelInput, KnowledgeUncheckedCreateWithoutChannelInput> | KnowledgeCreateWithoutChannelInput[] | KnowledgeUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutChannelInput | KnowledgeCreateOrConnectWithoutChannelInput[]
    createMany?: KnowledgeCreateManyChannelInputEnvelope
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type TicketCreateNestedManyWithoutChannelInput = {
    create?: XOR<TicketCreateWithoutChannelInput, TicketUncheckedCreateWithoutChannelInput> | TicketCreateWithoutChannelInput[] | TicketUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutChannelInput | TicketCreateOrConnectWithoutChannelInput[]
    createMany?: TicketCreateManyChannelInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type KnowledgeUncheckedCreateNestedManyWithoutChannelInput = {
    create?: XOR<KnowledgeCreateWithoutChannelInput, KnowledgeUncheckedCreateWithoutChannelInput> | KnowledgeCreateWithoutChannelInput[] | KnowledgeUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutChannelInput | KnowledgeCreateOrConnectWithoutChannelInput[]
    createMany?: KnowledgeCreateManyChannelInputEnvelope
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
  }

  export type TicketUncheckedCreateNestedManyWithoutChannelInput = {
    create?: XOR<TicketCreateWithoutChannelInput, TicketUncheckedCreateWithoutChannelInput> | TicketCreateWithoutChannelInput[] | TicketUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutChannelInput | TicketCreateOrConnectWithoutChannelInput[]
    createMany?: TicketCreateManyChannelInputEnvelope
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
  }

  export type SaaSCompanyUpdateOneRequiredWithoutChannelsNestedInput = {
    create?: XOR<SaaSCompanyCreateWithoutChannelsInput, SaaSCompanyUncheckedCreateWithoutChannelsInput>
    connectOrCreate?: SaaSCompanyCreateOrConnectWithoutChannelsInput
    upsert?: SaaSCompanyUpsertWithoutChannelsInput
    connect?: SaaSCompanyWhereUniqueInput
    update?: XOR<XOR<SaaSCompanyUpdateToOneWithWhereWithoutChannelsInput, SaaSCompanyUpdateWithoutChannelsInput>, SaaSCompanyUncheckedUpdateWithoutChannelsInput>
  }

  export type KnowledgeUpdateManyWithoutChannelNestedInput = {
    create?: XOR<KnowledgeCreateWithoutChannelInput, KnowledgeUncheckedCreateWithoutChannelInput> | KnowledgeCreateWithoutChannelInput[] | KnowledgeUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutChannelInput | KnowledgeCreateOrConnectWithoutChannelInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutChannelInput | KnowledgeUpsertWithWhereUniqueWithoutChannelInput[]
    createMany?: KnowledgeCreateManyChannelInputEnvelope
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutChannelInput | KnowledgeUpdateWithWhereUniqueWithoutChannelInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutChannelInput | KnowledgeUpdateManyWithWhereWithoutChannelInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type TicketUpdateManyWithoutChannelNestedInput = {
    create?: XOR<TicketCreateWithoutChannelInput, TicketUncheckedCreateWithoutChannelInput> | TicketCreateWithoutChannelInput[] | TicketUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutChannelInput | TicketCreateOrConnectWithoutChannelInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutChannelInput | TicketUpsertWithWhereUniqueWithoutChannelInput[]
    createMany?: TicketCreateManyChannelInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutChannelInput | TicketUpdateWithWhereUniqueWithoutChannelInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutChannelInput | TicketUpdateManyWithWhereWithoutChannelInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type KnowledgeUncheckedUpdateManyWithoutChannelNestedInput = {
    create?: XOR<KnowledgeCreateWithoutChannelInput, KnowledgeUncheckedCreateWithoutChannelInput> | KnowledgeCreateWithoutChannelInput[] | KnowledgeUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: KnowledgeCreateOrConnectWithoutChannelInput | KnowledgeCreateOrConnectWithoutChannelInput[]
    upsert?: KnowledgeUpsertWithWhereUniqueWithoutChannelInput | KnowledgeUpsertWithWhereUniqueWithoutChannelInput[]
    createMany?: KnowledgeCreateManyChannelInputEnvelope
    set?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    disconnect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    delete?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    connect?: KnowledgeWhereUniqueInput | KnowledgeWhereUniqueInput[]
    update?: KnowledgeUpdateWithWhereUniqueWithoutChannelInput | KnowledgeUpdateWithWhereUniqueWithoutChannelInput[]
    updateMany?: KnowledgeUpdateManyWithWhereWithoutChannelInput | KnowledgeUpdateManyWithWhereWithoutChannelInput[]
    deleteMany?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
  }

  export type TicketUncheckedUpdateManyWithoutChannelNestedInput = {
    create?: XOR<TicketCreateWithoutChannelInput, TicketUncheckedCreateWithoutChannelInput> | TicketCreateWithoutChannelInput[] | TicketUncheckedCreateWithoutChannelInput[]
    connectOrCreate?: TicketCreateOrConnectWithoutChannelInput | TicketCreateOrConnectWithoutChannelInput[]
    upsert?: TicketUpsertWithWhereUniqueWithoutChannelInput | TicketUpsertWithWhereUniqueWithoutChannelInput[]
    createMany?: TicketCreateManyChannelInputEnvelope
    set?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    disconnect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    delete?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    connect?: TicketWhereUniqueInput | TicketWhereUniqueInput[]
    update?: TicketUpdateWithWhereUniqueWithoutChannelInput | TicketUpdateWithWhereUniqueWithoutChannelInput[]
    updateMany?: TicketUpdateManyWithWhereWithoutChannelInput | TicketUpdateManyWithWhereWithoutChannelInput[]
    deleteMany?: TicketScalarWhereInput | TicketScalarWhereInput[]
  }

  export type ChannelCreateNestedOneWithoutKnowledgeBaseInput = {
    create?: XOR<ChannelCreateWithoutKnowledgeBaseInput, ChannelUncheckedCreateWithoutKnowledgeBaseInput>
    connectOrCreate?: ChannelCreateOrConnectWithoutKnowledgeBaseInput
    connect?: ChannelWhereUniqueInput
  }

  export type ChannelUpdateOneRequiredWithoutKnowledgeBaseNestedInput = {
    create?: XOR<ChannelCreateWithoutKnowledgeBaseInput, ChannelUncheckedCreateWithoutKnowledgeBaseInput>
    connectOrCreate?: ChannelCreateOrConnectWithoutKnowledgeBaseInput
    upsert?: ChannelUpsertWithoutKnowledgeBaseInput
    connect?: ChannelWhereUniqueInput
    update?: XOR<XOR<ChannelUpdateToOneWithWhereWithoutKnowledgeBaseInput, ChannelUpdateWithoutKnowledgeBaseInput>, ChannelUncheckedUpdateWithoutKnowledgeBaseInput>
  }

  export type ChannelCreateNestedOneWithoutTicketsInput = {
    create?: XOR<ChannelCreateWithoutTicketsInput, ChannelUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: ChannelCreateOrConnectWithoutTicketsInput
    connect?: ChannelWhereUniqueInput
  }

  export type SAAgentCreateNestedOneWithoutTicketsInput = {
    create?: XOR<SAAgentCreateWithoutTicketsInput, SAAgentUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: SAAgentCreateOrConnectWithoutTicketsInput
    connect?: SAAgentWhereUniqueInput
  }

  export type ChannelUpdateOneRequiredWithoutTicketsNestedInput = {
    create?: XOR<ChannelCreateWithoutTicketsInput, ChannelUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: ChannelCreateOrConnectWithoutTicketsInput
    upsert?: ChannelUpsertWithoutTicketsInput
    connect?: ChannelWhereUniqueInput
    update?: XOR<XOR<ChannelUpdateToOneWithWhereWithoutTicketsInput, ChannelUpdateWithoutTicketsInput>, ChannelUncheckedUpdateWithoutTicketsInput>
  }

  export type SAAgentUpdateOneWithoutTicketsNestedInput = {
    create?: XOR<SAAgentCreateWithoutTicketsInput, SAAgentUncheckedCreateWithoutTicketsInput>
    connectOrCreate?: SAAgentCreateOrConnectWithoutTicketsInput
    upsert?: SAAgentUpsertWithoutTicketsInput
    disconnect?: SAAgentWhereInput | boolean
    delete?: SAAgentWhereInput | boolean
    connect?: SAAgentWhereUniqueInput
    update?: XOR<XOR<SAAgentUpdateToOneWithWhereWithoutTicketsInput, SAAgentUpdateWithoutTicketsInput>, SAAgentUncheckedUpdateWithoutTicketsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type SAAgentCreateWithoutCompanyInput = {
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
    tickets?: TicketCreateNestedManyWithoutLastAgentInput
  }

  export type SAAgentUncheckedCreateWithoutCompanyInput = {
    id?: number
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
    tickets?: TicketUncheckedCreateNestedManyWithoutLastAgentInput
  }

  export type SAAgentCreateOrConnectWithoutCompanyInput = {
    where: SAAgentWhereUniqueInput
    create: XOR<SAAgentCreateWithoutCompanyInput, SAAgentUncheckedCreateWithoutCompanyInput>
  }

  export type SAAgentCreateManyCompanyInputEnvelope = {
    data: SAAgentCreateManyCompanyInput | SAAgentCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type ChannelCreateWithoutCompanyInput = {
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    knowledgeBase?: KnowledgeCreateNestedManyWithoutChannelInput
    tickets?: TicketCreateNestedManyWithoutChannelInput
  }

  export type ChannelUncheckedCreateWithoutCompanyInput = {
    id?: number
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    knowledgeBase?: KnowledgeUncheckedCreateNestedManyWithoutChannelInput
    tickets?: TicketUncheckedCreateNestedManyWithoutChannelInput
  }

  export type ChannelCreateOrConnectWithoutCompanyInput = {
    where: ChannelWhereUniqueInput
    create: XOR<ChannelCreateWithoutCompanyInput, ChannelUncheckedCreateWithoutCompanyInput>
  }

  export type ChannelCreateManyCompanyInputEnvelope = {
    data: ChannelCreateManyCompanyInput | ChannelCreateManyCompanyInput[]
    skipDuplicates?: boolean
  }

  export type SAAgentUpsertWithWhereUniqueWithoutCompanyInput = {
    where: SAAgentWhereUniqueInput
    update: XOR<SAAgentUpdateWithoutCompanyInput, SAAgentUncheckedUpdateWithoutCompanyInput>
    create: XOR<SAAgentCreateWithoutCompanyInput, SAAgentUncheckedCreateWithoutCompanyInput>
  }

  export type SAAgentUpdateWithWhereUniqueWithoutCompanyInput = {
    where: SAAgentWhereUniqueInput
    data: XOR<SAAgentUpdateWithoutCompanyInput, SAAgentUncheckedUpdateWithoutCompanyInput>
  }

  export type SAAgentUpdateManyWithWhereWithoutCompanyInput = {
    where: SAAgentScalarWhereInput
    data: XOR<SAAgentUpdateManyMutationInput, SAAgentUncheckedUpdateManyWithoutCompanyInput>
  }

  export type SAAgentScalarWhereInput = {
    AND?: SAAgentScalarWhereInput | SAAgentScalarWhereInput[]
    OR?: SAAgentScalarWhereInput[]
    NOT?: SAAgentScalarWhereInput | SAAgentScalarWhereInput[]
    id?: IntFilter<"SAAgent"> | number
    companyId?: IntFilter<"SAAgent"> | number
    name?: StringFilter<"SAAgent"> | string
    email?: StringFilter<"SAAgent"> | string
    passwordHash?: StringFilter<"SAAgent"> | string
    role?: StringFilter<"SAAgent"> | string
    status?: StringFilter<"SAAgent"> | string
    createdAt?: DateTimeFilter<"SAAgent"> | Date | string
  }

  export type ChannelUpsertWithWhereUniqueWithoutCompanyInput = {
    where: ChannelWhereUniqueInput
    update: XOR<ChannelUpdateWithoutCompanyInput, ChannelUncheckedUpdateWithoutCompanyInput>
    create: XOR<ChannelCreateWithoutCompanyInput, ChannelUncheckedCreateWithoutCompanyInput>
  }

  export type ChannelUpdateWithWhereUniqueWithoutCompanyInput = {
    where: ChannelWhereUniqueInput
    data: XOR<ChannelUpdateWithoutCompanyInput, ChannelUncheckedUpdateWithoutCompanyInput>
  }

  export type ChannelUpdateManyWithWhereWithoutCompanyInput = {
    where: ChannelScalarWhereInput
    data: XOR<ChannelUpdateManyMutationInput, ChannelUncheckedUpdateManyWithoutCompanyInput>
  }

  export type ChannelScalarWhereInput = {
    AND?: ChannelScalarWhereInput | ChannelScalarWhereInput[]
    OR?: ChannelScalarWhereInput[]
    NOT?: ChannelScalarWhereInput | ChannelScalarWhereInput[]
    id?: IntFilter<"Channel"> | number
    companyId?: IntFilter<"Channel"> | number
    platform?: StringFilter<"Channel"> | string
    botName?: StringFilter<"Channel"> | string
    instanceName?: StringFilter<"Channel"> | string
    configA1?: JsonNullableFilter<"Channel">
    configA2?: JsonNullableFilter<"Channel">
    configA3?: JsonNullableFilter<"Channel">
    credentials?: JsonNullableFilter<"Channel">
    debugMode?: JsonNullableFilter<"Channel">
    status?: StringFilter<"Channel"> | string
    createdAt?: DateTimeFilter<"Channel"> | Date | string
  }

  export type SaaSCompanyCreateWithoutAgentsInput = {
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
    channels?: ChannelCreateNestedManyWithoutCompanyInput
  }

  export type SaaSCompanyUncheckedCreateWithoutAgentsInput = {
    id?: number
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
    channels?: ChannelUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type SaaSCompanyCreateOrConnectWithoutAgentsInput = {
    where: SaaSCompanyWhereUniqueInput
    create: XOR<SaaSCompanyCreateWithoutAgentsInput, SaaSCompanyUncheckedCreateWithoutAgentsInput>
  }

  export type TicketCreateWithoutLastAgentInput = {
    customerNumber: string
    customerName?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    channel: ChannelCreateNestedOneWithoutTicketsInput
  }

  export type TicketUncheckedCreateWithoutLastAgentInput = {
    id?: number
    channelId: number
    customerNumber: string
    customerName?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketCreateOrConnectWithoutLastAgentInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutLastAgentInput, TicketUncheckedCreateWithoutLastAgentInput>
  }

  export type TicketCreateManyLastAgentInputEnvelope = {
    data: TicketCreateManyLastAgentInput | TicketCreateManyLastAgentInput[]
    skipDuplicates?: boolean
  }

  export type SaaSCompanyUpsertWithoutAgentsInput = {
    update: XOR<SaaSCompanyUpdateWithoutAgentsInput, SaaSCompanyUncheckedUpdateWithoutAgentsInput>
    create: XOR<SaaSCompanyCreateWithoutAgentsInput, SaaSCompanyUncheckedCreateWithoutAgentsInput>
    where?: SaaSCompanyWhereInput
  }

  export type SaaSCompanyUpdateToOneWithWhereWithoutAgentsInput = {
    where?: SaaSCompanyWhereInput
    data: XOR<SaaSCompanyUpdateWithoutAgentsInput, SaaSCompanyUncheckedUpdateWithoutAgentsInput>
  }

  export type SaaSCompanyUpdateWithoutAgentsInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channels?: ChannelUpdateManyWithoutCompanyNestedInput
  }

  export type SaaSCompanyUncheckedUpdateWithoutAgentsInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channels?: ChannelUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type TicketUpsertWithWhereUniqueWithoutLastAgentInput = {
    where: TicketWhereUniqueInput
    update: XOR<TicketUpdateWithoutLastAgentInput, TicketUncheckedUpdateWithoutLastAgentInput>
    create: XOR<TicketCreateWithoutLastAgentInput, TicketUncheckedCreateWithoutLastAgentInput>
  }

  export type TicketUpdateWithWhereUniqueWithoutLastAgentInput = {
    where: TicketWhereUniqueInput
    data: XOR<TicketUpdateWithoutLastAgentInput, TicketUncheckedUpdateWithoutLastAgentInput>
  }

  export type TicketUpdateManyWithWhereWithoutLastAgentInput = {
    where: TicketScalarWhereInput
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyWithoutLastAgentInput>
  }

  export type TicketScalarWhereInput = {
    AND?: TicketScalarWhereInput | TicketScalarWhereInput[]
    OR?: TicketScalarWhereInput[]
    NOT?: TicketScalarWhereInput | TicketScalarWhereInput[]
    id?: IntFilter<"Ticket"> | number
    channelId?: IntFilter<"Ticket"> | number
    customerNumber?: StringFilter<"Ticket"> | string
    customerName?: StringNullableFilter<"Ticket"> | string | null
    status?: StringFilter<"Ticket"> | string
    lastAgentId?: IntNullableFilter<"Ticket"> | number | null
    createdAt?: DateTimeFilter<"Ticket"> | Date | string
    updatedAt?: DateTimeFilter<"Ticket"> | Date | string
  }

  export type SaaSCompanyCreateWithoutChannelsInput = {
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
    agents?: SAAgentCreateNestedManyWithoutCompanyInput
  }

  export type SaaSCompanyUncheckedCreateWithoutChannelsInput = {
    id?: number
    businessName: string
    legalName?: string | null
    taxId: string
    taxType?: string | null
    brandManualUrl?: string | null
    createdAt?: Date | string
    agents?: SAAgentUncheckedCreateNestedManyWithoutCompanyInput
  }

  export type SaaSCompanyCreateOrConnectWithoutChannelsInput = {
    where: SaaSCompanyWhereUniqueInput
    create: XOR<SaaSCompanyCreateWithoutChannelsInput, SaaSCompanyUncheckedCreateWithoutChannelsInput>
  }

  export type KnowledgeCreateWithoutChannelInput = {
    fileName: string
    filePath: string
    fileType?: string | null
    embeddingStatus?: string
    lastUpdated?: Date | string
  }

  export type KnowledgeUncheckedCreateWithoutChannelInput = {
    id?: number
    fileName: string
    filePath: string
    fileType?: string | null
    embeddingStatus?: string
    lastUpdated?: Date | string
  }

  export type KnowledgeCreateOrConnectWithoutChannelInput = {
    where: KnowledgeWhereUniqueInput
    create: XOR<KnowledgeCreateWithoutChannelInput, KnowledgeUncheckedCreateWithoutChannelInput>
  }

  export type KnowledgeCreateManyChannelInputEnvelope = {
    data: KnowledgeCreateManyChannelInput | KnowledgeCreateManyChannelInput[]
    skipDuplicates?: boolean
  }

  export type TicketCreateWithoutChannelInput = {
    customerNumber: string
    customerName?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    lastAgent?: SAAgentCreateNestedOneWithoutTicketsInput
  }

  export type TicketUncheckedCreateWithoutChannelInput = {
    id?: number
    customerNumber: string
    customerName?: string | null
    status?: string
    lastAgentId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketCreateOrConnectWithoutChannelInput = {
    where: TicketWhereUniqueInput
    create: XOR<TicketCreateWithoutChannelInput, TicketUncheckedCreateWithoutChannelInput>
  }

  export type TicketCreateManyChannelInputEnvelope = {
    data: TicketCreateManyChannelInput | TicketCreateManyChannelInput[]
    skipDuplicates?: boolean
  }

  export type SaaSCompanyUpsertWithoutChannelsInput = {
    update: XOR<SaaSCompanyUpdateWithoutChannelsInput, SaaSCompanyUncheckedUpdateWithoutChannelsInput>
    create: XOR<SaaSCompanyCreateWithoutChannelsInput, SaaSCompanyUncheckedCreateWithoutChannelsInput>
    where?: SaaSCompanyWhereInput
  }

  export type SaaSCompanyUpdateToOneWithWhereWithoutChannelsInput = {
    where?: SaaSCompanyWhereInput
    data: XOR<SaaSCompanyUpdateWithoutChannelsInput, SaaSCompanyUncheckedUpdateWithoutChannelsInput>
  }

  export type SaaSCompanyUpdateWithoutChannelsInput = {
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agents?: SAAgentUpdateManyWithoutCompanyNestedInput
  }

  export type SaaSCompanyUncheckedUpdateWithoutChannelsInput = {
    id?: IntFieldUpdateOperationsInput | number
    businessName?: StringFieldUpdateOperationsInput | string
    legalName?: NullableStringFieldUpdateOperationsInput | string | null
    taxId?: StringFieldUpdateOperationsInput | string
    taxType?: NullableStringFieldUpdateOperationsInput | string | null
    brandManualUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    agents?: SAAgentUncheckedUpdateManyWithoutCompanyNestedInput
  }

  export type KnowledgeUpsertWithWhereUniqueWithoutChannelInput = {
    where: KnowledgeWhereUniqueInput
    update: XOR<KnowledgeUpdateWithoutChannelInput, KnowledgeUncheckedUpdateWithoutChannelInput>
    create: XOR<KnowledgeCreateWithoutChannelInput, KnowledgeUncheckedCreateWithoutChannelInput>
  }

  export type KnowledgeUpdateWithWhereUniqueWithoutChannelInput = {
    where: KnowledgeWhereUniqueInput
    data: XOR<KnowledgeUpdateWithoutChannelInput, KnowledgeUncheckedUpdateWithoutChannelInput>
  }

  export type KnowledgeUpdateManyWithWhereWithoutChannelInput = {
    where: KnowledgeScalarWhereInput
    data: XOR<KnowledgeUpdateManyMutationInput, KnowledgeUncheckedUpdateManyWithoutChannelInput>
  }

  export type KnowledgeScalarWhereInput = {
    AND?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
    OR?: KnowledgeScalarWhereInput[]
    NOT?: KnowledgeScalarWhereInput | KnowledgeScalarWhereInput[]
    id?: IntFilter<"Knowledge"> | number
    channelId?: IntFilter<"Knowledge"> | number
    fileName?: StringFilter<"Knowledge"> | string
    filePath?: StringFilter<"Knowledge"> | string
    fileType?: StringNullableFilter<"Knowledge"> | string | null
    embeddingStatus?: StringFilter<"Knowledge"> | string
    lastUpdated?: DateTimeFilter<"Knowledge"> | Date | string
  }

  export type TicketUpsertWithWhereUniqueWithoutChannelInput = {
    where: TicketWhereUniqueInput
    update: XOR<TicketUpdateWithoutChannelInput, TicketUncheckedUpdateWithoutChannelInput>
    create: XOR<TicketCreateWithoutChannelInput, TicketUncheckedCreateWithoutChannelInput>
  }

  export type TicketUpdateWithWhereUniqueWithoutChannelInput = {
    where: TicketWhereUniqueInput
    data: XOR<TicketUpdateWithoutChannelInput, TicketUncheckedUpdateWithoutChannelInput>
  }

  export type TicketUpdateManyWithWhereWithoutChannelInput = {
    where: TicketScalarWhereInput
    data: XOR<TicketUpdateManyMutationInput, TicketUncheckedUpdateManyWithoutChannelInput>
  }

  export type ChannelCreateWithoutKnowledgeBaseInput = {
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    company: SaaSCompanyCreateNestedOneWithoutChannelsInput
    tickets?: TicketCreateNestedManyWithoutChannelInput
  }

  export type ChannelUncheckedCreateWithoutKnowledgeBaseInput = {
    id?: number
    companyId: number
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    tickets?: TicketUncheckedCreateNestedManyWithoutChannelInput
  }

  export type ChannelCreateOrConnectWithoutKnowledgeBaseInput = {
    where: ChannelWhereUniqueInput
    create: XOR<ChannelCreateWithoutKnowledgeBaseInput, ChannelUncheckedCreateWithoutKnowledgeBaseInput>
  }

  export type ChannelUpsertWithoutKnowledgeBaseInput = {
    update: XOR<ChannelUpdateWithoutKnowledgeBaseInput, ChannelUncheckedUpdateWithoutKnowledgeBaseInput>
    create: XOR<ChannelCreateWithoutKnowledgeBaseInput, ChannelUncheckedCreateWithoutKnowledgeBaseInput>
    where?: ChannelWhereInput
  }

  export type ChannelUpdateToOneWithWhereWithoutKnowledgeBaseInput = {
    where?: ChannelWhereInput
    data: XOR<ChannelUpdateWithoutKnowledgeBaseInput, ChannelUncheckedUpdateWithoutKnowledgeBaseInput>
  }

  export type ChannelUpdateWithoutKnowledgeBaseInput = {
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: SaaSCompanyUpdateOneRequiredWithoutChannelsNestedInput
    tickets?: TicketUpdateManyWithoutChannelNestedInput
  }

  export type ChannelUncheckedUpdateWithoutKnowledgeBaseInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUncheckedUpdateManyWithoutChannelNestedInput
  }

  export type ChannelCreateWithoutTicketsInput = {
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    company: SaaSCompanyCreateNestedOneWithoutChannelsInput
    knowledgeBase?: KnowledgeCreateNestedManyWithoutChannelInput
  }

  export type ChannelUncheckedCreateWithoutTicketsInput = {
    id?: number
    companyId: number
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
    knowledgeBase?: KnowledgeUncheckedCreateNestedManyWithoutChannelInput
  }

  export type ChannelCreateOrConnectWithoutTicketsInput = {
    where: ChannelWhereUniqueInput
    create: XOR<ChannelCreateWithoutTicketsInput, ChannelUncheckedCreateWithoutTicketsInput>
  }

  export type SAAgentCreateWithoutTicketsInput = {
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
    company: SaaSCompanyCreateNestedOneWithoutAgentsInput
  }

  export type SAAgentUncheckedCreateWithoutTicketsInput = {
    id?: number
    companyId: number
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
  }

  export type SAAgentCreateOrConnectWithoutTicketsInput = {
    where: SAAgentWhereUniqueInput
    create: XOR<SAAgentCreateWithoutTicketsInput, SAAgentUncheckedCreateWithoutTicketsInput>
  }

  export type ChannelUpsertWithoutTicketsInput = {
    update: XOR<ChannelUpdateWithoutTicketsInput, ChannelUncheckedUpdateWithoutTicketsInput>
    create: XOR<ChannelCreateWithoutTicketsInput, ChannelUncheckedCreateWithoutTicketsInput>
    where?: ChannelWhereInput
  }

  export type ChannelUpdateToOneWithWhereWithoutTicketsInput = {
    where?: ChannelWhereInput
    data: XOR<ChannelUpdateWithoutTicketsInput, ChannelUncheckedUpdateWithoutTicketsInput>
  }

  export type ChannelUpdateWithoutTicketsInput = {
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: SaaSCompanyUpdateOneRequiredWithoutChannelsNestedInput
    knowledgeBase?: KnowledgeUpdateManyWithoutChannelNestedInput
  }

  export type ChannelUncheckedUpdateWithoutTicketsInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    knowledgeBase?: KnowledgeUncheckedUpdateManyWithoutChannelNestedInput
  }

  export type SAAgentUpsertWithoutTicketsInput = {
    update: XOR<SAAgentUpdateWithoutTicketsInput, SAAgentUncheckedUpdateWithoutTicketsInput>
    create: XOR<SAAgentCreateWithoutTicketsInput, SAAgentUncheckedCreateWithoutTicketsInput>
    where?: SAAgentWhereInput
  }

  export type SAAgentUpdateToOneWithWhereWithoutTicketsInput = {
    where?: SAAgentWhereInput
    data: XOR<SAAgentUpdateWithoutTicketsInput, SAAgentUncheckedUpdateWithoutTicketsInput>
  }

  export type SAAgentUpdateWithoutTicketsInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    company?: SaaSCompanyUpdateOneRequiredWithoutAgentsNestedInput
  }

  export type SAAgentUncheckedUpdateWithoutTicketsInput = {
    id?: IntFieldUpdateOperationsInput | number
    companyId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SAAgentCreateManyCompanyInput = {
    id?: number
    name: string
    email: string
    passwordHash: string
    role?: string
    status?: string
    createdAt?: Date | string
  }

  export type ChannelCreateManyCompanyInput = {
    id?: number
    platform: string
    botName: string
    instanceName: string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: string
    createdAt?: Date | string
  }

  export type SAAgentUpdateWithoutCompanyInput = {
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUpdateManyWithoutLastAgentNestedInput
  }

  export type SAAgentUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tickets?: TicketUncheckedUpdateManyWithoutLastAgentNestedInput
  }

  export type SAAgentUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    passwordHash?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChannelUpdateWithoutCompanyInput = {
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    knowledgeBase?: KnowledgeUpdateManyWithoutChannelNestedInput
    tickets?: TicketUpdateManyWithoutChannelNestedInput
  }

  export type ChannelUncheckedUpdateWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    knowledgeBase?: KnowledgeUncheckedUpdateManyWithoutChannelNestedInput
    tickets?: TicketUncheckedUpdateManyWithoutChannelNestedInput
  }

  export type ChannelUncheckedUpdateManyWithoutCompanyInput = {
    id?: IntFieldUpdateOperationsInput | number
    platform?: StringFieldUpdateOperationsInput | string
    botName?: StringFieldUpdateOperationsInput | string
    instanceName?: StringFieldUpdateOperationsInput | string
    configA1?: NullableJsonNullValueInput | InputJsonValue
    configA2?: NullableJsonNullValueInput | InputJsonValue
    configA3?: NullableJsonNullValueInput | InputJsonValue
    credentials?: NullableJsonNullValueInput | InputJsonValue
    debugMode?: NullableJsonNullValueInput | InputJsonValue
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketCreateManyLastAgentInput = {
    id?: number
    channelId: number
    customerNumber: string
    customerName?: string | null
    status?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TicketUpdateWithoutLastAgentInput = {
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    channel?: ChannelUpdateOneRequiredWithoutTicketsNestedInput
  }

  export type TicketUncheckedUpdateWithoutLastAgentInput = {
    id?: IntFieldUpdateOperationsInput | number
    channelId?: IntFieldUpdateOperationsInput | number
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUncheckedUpdateManyWithoutLastAgentInput = {
    id?: IntFieldUpdateOperationsInput | number
    channelId?: IntFieldUpdateOperationsInput | number
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeCreateManyChannelInput = {
    id?: number
    fileName: string
    filePath: string
    fileType?: string | null
    embeddingStatus?: string
    lastUpdated?: Date | string
  }

  export type TicketCreateManyChannelInput = {
    id?: number
    customerNumber: string
    customerName?: string | null
    status?: string
    lastAgentId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type KnowledgeUpdateWithoutChannelInput = {
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeUncheckedUpdateWithoutChannelInput = {
    id?: IntFieldUpdateOperationsInput | number
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type KnowledgeUncheckedUpdateManyWithoutChannelInput = {
    id?: IntFieldUpdateOperationsInput | number
    fileName?: StringFieldUpdateOperationsInput | string
    filePath?: StringFieldUpdateOperationsInput | string
    fileType?: NullableStringFieldUpdateOperationsInput | string | null
    embeddingStatus?: StringFieldUpdateOperationsInput | string
    lastUpdated?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUpdateWithoutChannelInput = {
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastAgent?: SAAgentUpdateOneWithoutTicketsNestedInput
  }

  export type TicketUncheckedUpdateWithoutChannelInput = {
    id?: IntFieldUpdateOperationsInput | number
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    lastAgentId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TicketUncheckedUpdateManyWithoutChannelInput = {
    id?: IntFieldUpdateOperationsInput | number
    customerNumber?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    lastAgentId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use SaaSCompanyCountOutputTypeDefaultArgs instead
     */
    export type SaaSCompanyCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SaaSCompanyCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SAAgentCountOutputTypeDefaultArgs instead
     */
    export type SAAgentCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SAAgentCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChannelCountOutputTypeDefaultArgs instead
     */
    export type ChannelCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChannelCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SaaSCompanyDefaultArgs instead
     */
    export type SaaSCompanyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SaaSCompanyDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SAAgentDefaultArgs instead
     */
    export type SAAgentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SAAgentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChannelDefaultArgs instead
     */
    export type ChannelArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChannelDefaultArgs<ExtArgs>
    /**
     * @deprecated Use KnowledgeDefaultArgs instead
     */
    export type KnowledgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = KnowledgeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TicketDefaultArgs instead
     */
    export type TicketArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TicketDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}
