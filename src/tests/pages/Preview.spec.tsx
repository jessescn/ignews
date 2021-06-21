import { render, screen } from '@testing-library/react'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { mocked } from 'ts-jest/utils'

import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'

import { getPrismicClient } from "../../services/prismic"

const post = { 
  slug: "my-new-post", 
  title: "My New Post", 
  content: "<h1>Post excerpt</h1>", 
  updatedAt: "20 de junho"
}

jest.mock("next-auth/client")
jest.mock('next/router')
jest.mock("../../services/prismic")


describe("Posts Page", () => {
  it("renders correctly", () => {

    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValueOnce([null, false])

    render(<Post post={post} />)

    expect(screen.getByText("My New Post")).toBeInTheDocument()
    expect(screen.getByText("Post excerpt")).toBeInTheDocument()
    expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
  })

  it("redirects user to full post when user is subscribed", async () => {

    const useSessionMocked = mocked(useSession)
    const useRouterMocked = mocked(useRouter)
    const pushMocked = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      {
        activeSubscription: 'fake-active-subscription'
      }
    ] as any)

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked
    } as any)

    render(<Post post={post} />)
    
    expect(pushMocked).toHaveBeenCalledWith("/posts/my-new-post")
  })

  it("loads initial data", async () => {
    
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

    const response = await getStaticProps({ params: { slug: 'my-new-post'}})

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