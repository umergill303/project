export default defineEventHandler(async () => {
  return await useDb().select({
    id: tables.slider.id,
    buttonColor: tables.slider.buttonColor,
    buttonText: tables.slider.buttonText,
    category: tables.slider.category,
    layout: tables.slider.layout,
    label: tables.slider.label,
    description: tables.slider.description,
    image: tables.slider.image,
    product: tables.slider.product,
    name: tables.products.name,
  }).from(tables.slider)
    .leftJoin(tables.products, eq(tables.slider.product, tables.products.id)).all()
})
