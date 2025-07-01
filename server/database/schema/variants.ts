import { sqliteTable, int, real, text, primaryKey } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'
import { AttributeType } from '../../../shared/types/enums'
import { products } from './products'
import { _id, _timestamps } from './_'

// --- Attributes Table ---
export const attributes = sqliteTable('attributes', {
  ..._id,
  name: text('name').default(''),
  order: int('order').default(0),
  product: text('product').references(() => products.id, { onDelete: 'cascade' }),
  attributeType: text('attribute_type').$type<AttributeType>().default(AttributeType.Button),
})

// --- Options Table ---
export const options = sqliteTable('options', {
  ..._id,
  attribute: int('attribute').notNull().references(() => attributes.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  hint: text('hint').default(''),
  color: text('color').default(''),
  image: text('image').default(''),
  order: int('order').default(0),
})
//  t => [primaryKey({ columns: [t.attribute, t.name] })])

// --- Variants Table ---
export const variants = sqliteTable('variants', {
  ..._id,
  product: text('product').references(() => products.id, { onDelete: 'cascade' }),
  purchasePrice: real('purchase_price').default(0),
  salePrice: real('sale_price').default(0),
  discount: int('discount').default(0),
  stock: int('stock').default(0),
  sku: text('sku').default(''),
  order: int('order').default(0),
  active: int('active', { mode: 'boolean' }).default(true),
  ..._timestamps
})

// --- Variants Options Table ---
export const variantOptions = sqliteTable('variant_options', {
  variant: int('variant').references(() => variants.id, { onDelete: 'cascade' }),
  option: int('option').references(() => options.id, { onDelete: 'cascade' }),
}, t => [primaryKey({ columns: [t.variant, t.option] })])

// Define relations for attributes
export const attributesRelations = relations(attributes, ({ one, many }) => ({
  product: one(products, {
    fields: [attributes.product],
    references: [products.id],
  }),
  options: many(options),
}))

// Define relations for options
export const optionsRelations = relations(options, ({ one, many }) => ({
  attribute: one(attributes, {
    fields: [options.attribute],
    references: [attributes.id],
  }),
  variantOptions: many(variantOptions),
}))

export const variantsRelations = relations(variants, ({ one, many }) => ({
  product: one(products, {
    fields: [variants.product],
    references: [products.id],
  }),
  variantOptions: many(variantOptions), // Matches the junction table name
}))

// Define relations for products
export const productsRelations = relations(products, ({ many }) => ({
  attributes: many(attributes),
  variants: many(variants),
}))

// Define relations for the junction table
export const variantOptionsRelations = relations(variantOptions, ({ one }) => ({
  variant: one(variants, {
    fields: [variantOptions.variant],
    references: [variants.id],
  }),
  option: one(options, {
    fields: [variantOptions.option],
    references: [options.id],
  }),
}))
