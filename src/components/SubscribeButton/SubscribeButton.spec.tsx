import { render, screen, fireEvent } from '@testing-library/react'
import { SubscribeButton } from '.'

import { useRouter} from 'next/router'

import { signIn, useSession } from 'next-auth/client'
import { mocked } from 'ts-jest/utils'

jest.mock('next-auth/client')

jest.mock('next/router')

describe("SubscribeButton component", () => {
  it("renders correctly", () => {

    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValue([null, false])

    render(
      <SubscribeButton />
    )
  
    expect(screen.getByText('Subscribe Now!')).toBeInTheDocument()
  })

  it("redirects user to sign in when not authenticated", () => {

    const signInMocked = mocked(signIn)
    const useSessionMocked = mocked(useSession)

    useSessionMocked.mockReturnValue([null, false])

    render(<SubscribeButton />)

    const subscribeBtn = screen.getByText("Subscribe Now!")

    fireEvent.click(subscribeBtn)

    expect(signInMocked).toHaveBeenCalled()
  })

  it("redirects to posts when user already has a subscription", () => {
    const useRouterMocked = mocked(useRouter)
    const useSessionMocked = mocked(useSession)
    const pushMock = jest.fn()

    useSessionMocked.mockReturnValueOnce([
      {
        user: { name: "John Doe", email: "john.doe@example.com"},
        activeSubscription: "fake active subscription",
        expires: "fake-value",
      }, false
    ])

    useRouterMocked.mockReturnValueOnce({
      push: pushMock
    } as any)

    render(<SubscribeButton />)

    const subscribeBtn = screen.getByText("Subscribe Now!")

    fireEvent.click(subscribeBtn)

    expect(pushMock).toHaveBeenCalled()
  })

})