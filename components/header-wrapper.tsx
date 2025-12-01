"use client"

import { useEffect, useState } from "react"
import Header from "./header"

export default function HeaderWrapper() {
  const [shouldShowHeader, setShouldShowHeader] = useState(true)

    useEffect(() => {
      const checkLoginStage = () => {
        // 检查是否有登录页面的特定元素或data属性
        const mainElement = document.querySelector('main[data-stage="login"]')
        const loginElements = document.querySelectorAll('[data-login-page]')
        // 检查是否有登录页面的类名或ID
        const loginPage = document.querySelector('.login-page, #login-page')
        // 检查是否有no-header属性（library界面）
        const noHeaderElements = document.querySelectorAll('[data-no-header]')
        
        // 更严格的检查：如果main元素的data-stage属性是"login"，则不显示header
        if (mainElement && mainElement.getAttribute('data-stage') === 'login') {
          setShouldShowHeader(false)
          return
        }
        
        // 检查是否有data-login-page属性
        if (loginElements.length > 0) {
          setShouldShowHeader(false)
          return
        }
        
        // 检查是否有data-no-header属性（library界面）
        if (noHeaderElements.length > 0) {
          setShouldShowHeader(false)
          return
        }
        
        setShouldShowHeader(true)
      }

    // 初始检查（延迟一下确保DOM已渲染）
    const timeoutId = setTimeout(checkLoginStage, 50)
    checkLoginStage()

    // 使用 MutationObserver 监听 DOM 变化
    const observer = new MutationObserver(() => {
      checkLoginStage()
    })
    
    if (typeof window !== 'undefined' && document.body) {
      observer.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        attributeFilter: ['data-stage', 'data-login-page', 'data-no-header', 'class', 'id']
      })
    }

    // 定期检查（作为备用方案）
    const intervalId = setInterval(checkLoginStage, 300)

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
      observer.disconnect()
    }
  }, [])

  if (!shouldShowHeader) {
    return null
  }

  return <Header />
}

