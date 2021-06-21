import Head from 'next/head'
import { GetStaticProps } from 'next';

import { SubscribeButton } from '../components/SubscribeButton';

import styles from './home.module.scss';
import { stripe } from '../services/stripe';

interface HomeProps {
  product: {
    priceId: string;
    amount: string;
  }
}

export default function Home({ product }: HomeProps) {
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, Welcome</span>
          <h1>News about the <span>React</span> world.</h1>
          <p>
            Get Access to all the publications <br/>
            <span>for { product.amount } month</span>
            <SubscribeButton/>
          </p>
        </section>
        <img src="/images/avatar.svg" alt="girl codding"/>
      </main>
    </>
  )
}

export const getStaticProps:GetStaticProps = async () => {

  const price = await stripe.prices.retrieve("price_1IYcOsDxMhuqd9AXYPiBsiH7")

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price.unit_amount/100)
  }

  return {
    props: {
      product
    },
    revalidate: 24 * 60 * 60 // 24 hours
  }
}
