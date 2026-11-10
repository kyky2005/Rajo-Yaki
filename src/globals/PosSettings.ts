import type { GlobalConfig } from 'payload'

export const PosSettings: GlobalConfig = {
  slug: 'pos-settings',
  access: {
    read: () => true,
    update: () => true,
  },
  admin: {
    group: 'Rojo-Yaki POS',
  },
  fields: [
    {
      name: 'autoPrint',
      type: 'checkbox',
      defaultValue: false,
      required: true,
    },
  ],
  versions: false,
}
