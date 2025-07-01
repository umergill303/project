export default eventHandler(async event => {
  const { pathname } = getRouterParams(event)
  console.log(`Serving video from path: product-videos/${pathname}`)

  setHeader(event, 'Content-Type', 'video/mp4')
  setHeader(event, 'Accept-Ranges', 'bytes')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000')

  setHeader(event, 'Access-Control-Allow-Origin', '*')

  return hubBlob().serve(event, `product-videos/${pathname}`)
})
