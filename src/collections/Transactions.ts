import type { CollectionConfig } from 'payload'

export const Transactions: CollectionConfig = {
  slug: 'transactions',
  access: {
    create: () => true,
    delete: () => false,
    read: () => true,
    update: () => false,
  },
  admin: {
    group: 'Rojo-Yaki POS',
    useAsTitle: 'transactionNumber',
    defaultColumns: ['transactionNumber', 'branch', 'occurredAt', 'total', 'status'],
  },
  fields: [
    {
      name: 'transactionNumber',
      type: 'text',
      required: true,
      unique: true,
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
      name: 'occurredAt',
      type: 'date',
      required: true,
      index: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'cashier',
      type: 'text',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        { name: 'productName', type: 'text', required: true },
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unitPrice', type: 'number', required: true, min: 0 },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'discount',
      type: 'number',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'paymentMethod',
      type: 'select',
      options: ['Cash', 'GCash', 'Card'],
      required: true,
    },
    {
      name: 'amountReceived',
      type: 'number',
      min: 0,
    },
    {
      name: 'status',
      type: 'select',
      options: ['Completed', 'Pending', 'Cancelled'],
      required: true,
      defaultValue: 'Completed',
      index: true,
    },
  ],
  timestamps: true,
  versions: false,
}
