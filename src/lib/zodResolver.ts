import { zodResolver as upstreamZodResolver } from '@hookform/resolvers/zod'
import type { FieldValues, Resolver } from 'react-hook-form'

interface ZodSchemaShape<TInput, TOutput> {
  _zod: { input: TInput; output: TOutput }
}

export function zodResolver<TInput extends FieldValues, TOutput extends FieldValues = TInput>(
  schema: ZodSchemaShape<TInput, TOutput>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @hookform/resolvers@5.2.2 fue compilado contra Zod 4.0.x; sus overloads exigen _zod.version.minor literal 0 y rompen con Zod >= 4.1 aunque el runtime funciona. Issues: react-hook-form/resolvers#813, #842.
): Resolver<TInput, any, TOutput> {
  return upstreamZodResolver(schema as never) as unknown as Resolver<
    TInput,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- coincide con la signature original del paquete (TContext es any en el upstream).
    any,
    TOutput
  >
}
