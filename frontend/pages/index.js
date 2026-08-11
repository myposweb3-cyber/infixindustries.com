import PremiumHome from './premium-home'

export default PremiumHome

export async function getServerSideProps(ctx) {
  // Redirect to premium-home if direct / is requested
  // (This ensures the page always loads correctly without 404)
  if (ctx.req.url === '/') {
    return {
      redirect: {
        destination: '/premium-home',
        permanent: false
      }
    }
  }
  return { props: {} }
}

