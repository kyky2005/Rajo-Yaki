import type { Access, CollectionConfig } from 'payload'

const isPayloadAdmin: Access = ({ req }) => req.user?.collection === 'admins'

export const Branches: CollectionConfig = {
  slug: 'branches',
  access: {
    create: isPayloadAdmin,
    delete: isPayloadAdmin,
    read: () => true,
    update: isPayloadAdmin,
  },
  admin: {
    group: 'Rojo-Yaki POS',
    useAsTitle: 'name',
    defaultColumns: ['name', 'code', 'city'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'code',
      type: 'select',
      options: [
        { label: 'Branch 1', value: 'branch1' },
        { label: 'Branch 2', value: 'branch2' },
      ],
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
  ],
  versions: false,
}
