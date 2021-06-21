import { render, screen } from '@testing-library/react'
import { getSession } from 'next-auth/client'
import { mocked } from 'ts-jest/utils'

import  { getStaticProps } from '../../pages'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'

import { getPrismicClient } from "../../services/prismic"

const post = { slug: "new-post", title: "My New Post", content: "<h1>Post excerpt</h1>", updatedAt: "20 de junho"}

jest.mock("next-auth/client")
jest.mock("../../services/prismic")


describe("Posts Page", () => {
  it("renders correctly", () => {
    render(<Post post={post} />)

    expect(screen.getByText("My New Post")).toBeInTheDocument()
    expect(screen.getByText("Post excerpt")).toBeInTheDocument()
  })

  it("redirects user if no subscription is found", async () => {

    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockReturnValueOnce(null)

    const response = await getServerSideProps({ params: { slug: 'my-new-post'}} as any)

    expect(response).toEqual(
        expect.objectContaining({
          redirect: expect.objectContaining({
            destination: '/'
          })
      }))
  })

  it("loads initial data", async () => {
    
    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockReturnValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any)

    const getPrismicClientMocked = mocked(getPrismicClient)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
              { type: 'heading', text: "My new text"}
          ],
          content: [
            { type: "paragraph", text: "Post content"}
          ]
        },
        last_publication_date: "04-01-2021"
      })
    } as any)

    const response = await getServerSideProps({ params: { slug: 'my-new-post'}} as any)

    expect(response).toEqual(
        expect.objectContaining({
          props: {
            post: {
              slug: "my-new-post",
              title: "My new text",
              content: "<p>Post content</p>",
              updatedAt: "2021 M04 01"
            }
          }
      }))
  })
})