import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    create: () => true,
    delete: () => true,
    read: () => true,
    update: () => true,
  },
  admin: {
    group: 'Rojo-Yaki POS',
    useAsTitle: 'name',
    defaultColumns: ['name', 'branch', 'category', 'price', 'stock'],
  },
  fields: [
    {
      name: 'recordKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable branch-and-product key used by the POS.',
        readOnly: true,
      },
    },
    {
      name: 'sku',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'branch',
      type: 'relationship',
      relationTo: 'branches',
      required: true,
      index: true,
      maxDepth: 1,
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      options: ['Takoyaki', 'Snacks', 'Drinks', 'Add-ons', 'Other'],
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'stock',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'minStock',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 10,
    },
    {
      name: 'emoji',
      type: 'text',
      required: true,
    },
    {
      name: 'color',
      type: 'text',
      required: true,
    },
  ],
  versions: false,
}
