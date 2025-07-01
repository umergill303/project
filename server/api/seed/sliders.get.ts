import { v4 as uuid4 } from 'uuid'

export default defineEventHandler(async () => {
  const sliderLabels = [
    'Summer Sale',
    'New Arrivals',
    'Top Picks',
    'Limited Time Offer',
    'Best Deals',
    'Exclusive Offer',
    'Hot Picks',
    'Flash Sale',
    'Winter Collection',
    'Buy One Get One Free'
  ]

  const buttonTexts = ['Shop Now', 'View More', 'Discover', 'Buy Now', 'Explore']

  const descriptions = [
    'Exciting deals and discounts available now!',
    'Don\'t miss out on these amazing products',
    'Limited stock available at these prices',
    'Special offers just for you',
    'Upgrade your style with our new collection'
  ]

  const sliderLayouts = ['full-width', 'grid', 'banner', 'carousel']
  const buttonColors = ['neutral', 'primary', 'secondary', 'error']

  const images = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4',
    'https://picsum.photos/800/400?random=5',
  ]

  // Get all categories and products for reference
  const allCategories = await useDb().select().from(tables.categories)
  const allProducts = await useDb().select().from(tables.products)

  // Function to generate random slider data
  const getRandomElement = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]
  const getRandomReference = (arr: any[]) => arr.length > 0 ? getRandomElement(arr).id : null

  // First create 5 sliders with products
  for (let i = 0; i < 5; i++) {
    const slider = {
      id: uuid4(),
      label: getRandomElement(sliderLabels),
      image: getRandomElement(images),
      layout: getRandomElement(sliderLayouts),
      buttonText: getRandomElement(buttonTexts),
      description: getRandomElement(descriptions),
      buttonColor: getRandomElement(buttonColors),
      category: getRandomReference(allCategories),
      product: getRandomReference(allProducts) // This ensures a product is assigned
    }

    await useDb().insert(tables.slider).values(slider)
  }

  // Then create 5 sliders without products
  for (let i = 0; i < 5; i++) {
    const slider = {
      id: uuid4(),
      label: getRandomElement(sliderLabels),
      image: getRandomElement(images),
      layout: getRandomElement(sliderLayouts),
      buttonText: getRandomElement(buttonTexts),
      description: getRandomElement(descriptions),
      buttonColor: getRandomElement(buttonColors),
      category: getRandomReference(allCategories),
      product: null // Explicitly set to null for no product
    }

    await useDb().insert(tables.slider).values(slider)
  }

  return {
    status: 'success',
    message: '10 random sliders generated successfully (5 with products, 5 without)'
  }
})
