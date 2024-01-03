import { createHash } from 'crypto'
import type { Avocado, Attributes, PrismaClient } from '@prisma/client'

type ResolverContext = {
  orm: PrismaClient
}

export async function findAll(
  parent: unknown,
  arg: unknown,
  context: ResolverContext
): Promise<Avocado[]> {
  return await context.orm.avocado.findMany({
    include: {
      attributes: true,
    },
  })
}

export async function findOne(
  parent: unknown,
  args: { id: string },
  { orm }: ResolverContext
): Promise<Avocado | null> {
  const avocado = await orm.avocado.findFirst({
    where: { id: parseInt(args.id) },
    include: {
      attributes: true,
    },
  })

  if (!avocado) throw new Error('Not Found')
  return avocado
}

export const resolver: Record<
  keyof (Avocado & { attributes: Attributes }),
  (parent: Avocado & { attributes: Attributes }) => unknown
> = {
  id: (parent) => parent.id,
  createdAt: (parent) => parent.createdAt,
  updatedAt: (parent) => parent.updatedAt,
  deletedAt: (parent) => parent.deletedAt,
  sku: (parent) => parent.sku,
  name: (parent) => parent.name,
  price: (parent) => parent.price,
  image: (parent) => parent.image,
  attributes: (parent) => ({
    description: parent.attributes.description,
    shape: parent.attributes.shape,
    hardiness: parent.attributes.hardiness,
    taste: parent.attributes.taste,
  }),
}

export async function createAvo(
  parent: unknown,
  { data }: { data: Pick<Avocado, 'name' | 'price' | 'image'> & Attributes },
  context: ResolverContext
): Promise<Avocado> {
  const { name, price, image, ...attributes } = data

  return await context.orm.avocado.create({
    data: {
      name,
      price,
      image,
      sku: new Date().getTime().toString(),
      attributes: {
        create: { ...attributes },
      },
    },
  })
}
