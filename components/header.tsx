"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type HeaderLanguage = "en" | "zh"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [currentStage, setCurrentStage] = useState<string | null>(null)
  const [language, setLanguage] = useState<HeaderLanguage>("en") // 默认英语
  const pathname = usePathname()
  const router = useRouter()

  // 监听 stage 变化
  useEffect(() => {
    const checkStage = () => {
      const mainElement = document.querySelector('main[data-stage]')
      const stage = mainElement?.getAttribute('data-stage')
      setCurrentStage(stage || null)
    }

    checkStage()
    const observer = new MutationObserver(checkStage)
    if (typeof window !== 'undefined' && document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-stage']
      })
    }

    return () => observer.disconnect()
  }, [])


  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      // 更早折叠：降低阈值，让header在更早的滚动位置就变成窄的
      setIsScrolled(scrollTop > 15)
      setIsAtTop(scrollTop < 5)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const navItems = [
    { label: "Home", href: "/", action: () => {
      // 触发自定义事件来通知主页面切换到home
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigateToHome'))
      }
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } },
    { label: "Write!", href: "/write", action: () => {
      // 触发自定义事件来通知主页面切换到writeTypeSelection
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigateToWriteTypeSelection'))
      }
    } },
    { label: "Mnemosyne's Gallery", href: "/gallery", action: () => {
      // 触发自定义事件来通知主页面切换到gallery
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigateToGallery'))
      }
    } },
    { label: "Resources", href: "/resources", action: () => {} },
    { label: "About us", href: "/#about", action: () => {
      // 触发自定义事件来通知主页面切换到about
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('navigateToAbout'))
      }
    } },
  ]

  const handleLanguageChange = (lang: HeaderLanguage) => {
    console.log('Header language change clicked:', lang)
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteLanguage', lang)
      // 触发全局语言切换事件，让所有页面都能响应
      // 确保传递的是 "en" | "zh"，与主页面一致
      const event = new CustomEvent('headerLanguageChange', { detail: lang })
      console.log('Dispatching headerLanguageChange event with detail:', lang)
      window.dispatchEvent(event)
    }
  }

  // 从localStorage读取语言设置，默认英语
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('siteLanguage') as HeaderLanguage | null
      // 兼容旧数据：将 "yue" 转换为 "zh"
      if (savedLang === 'yue') {
        setLanguage('zh')
        localStorage.setItem('siteLanguage', 'zh')
      } else if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
        setLanguage(savedLang)
      } else {
        // 如果没有保存的语言设置，默认使用英语
        setLanguage('en')
        localStorage.setItem('siteLanguage', 'en')
      }
    }
  }, [])


  // 逻辑：
  // 1. 如果在顶部（isAtTop = true），背景始终透明，不显示背景色
  // 2. 如果向下滚动（isScrolled = true），显示背景和窄窄的header
  // 3. 顶部时，文字为黑色；滚动后，文字根据背景调整
  const isHomePage = currentStage === 'home' || pathname === '/'
  const isAboutPage = currentStage === 'about' || pathname === '/#about'
  const isGalleryPage = currentStage === 'gallery'
  const showBackground = isScrolled || isAboutPage || isGalleryPage // About 和 Gallery 页面始终显示背景
  const showLogo = isHomePage && isAtTop && !isHovering && !isAboutPage && !isGalleryPage // 只在首页顶部且未悬停时显示logo

  // 处理导航点击
  const handleNavClick = (item: typeof navItems[0], e: React.MouseEvent) => {
    e.preventDefault()
    item.action()
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isAboutPage || isGalleryPage
          ? 'h-16 shadow-xl' // About 和 Gallery 页面使用中等高度的header
          : isHomePage 
          ? (isScrolled ? 'h-14 shadow-xl' : 'h-32')
          : 'h-12 shadow-lg' // 非首页始终保持窄的header
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={{
        overflow: 'hidden',
        background: showBackground
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 58, 138, 0.95) 50%, rgba(15, 23, 42, 0.98) 100%)'
          : 'transparent',
        backdropFilter: showBackground ? 'blur(12px) saturate(180%)' : 'none',
        borderBottom: showBackground ? '1px solid rgba(59, 130, 246, 0.3)' : 'none',
        boxShadow: showBackground 
          ? '0 4px 20px rgba(15, 23, 42, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo or Title */}
        <div className="flex items-center h-full">
          <Link 
            href="/" 
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className="transition-all duration-200 flex items-center h-full"
          >
            {isHomePage && showLogo ? (
              // 只在首页顶部显示logo.png
              <Image
                src="/logo.png"
                alt="MuseAIWrite"
                width={960}
                height={320}
                className="object-contain w-auto"
                priority
                unoptimized
                style={{ maxHeight: '100%', height: '100%', objectFit: 'contain', width: 'auto' }}
              />
             ) : isHomePage ? (
               // 首页滚动后显示文字
               <span className={`font-bold text-xl transition-colors ${
                 showBackground 
                   ? 'text-white hover:text-blue-300' 
                   : 'text-black hover:text-blue-600'
               }`}>
                 MuseAIWrite
               </span>
             ) : isGalleryPage ? (
               // Gallery 页面显示白色文字
               <span className="font-bold text-xl text-white hover:text-yellow-200 transition-colors">
                 MuseAIWrite
               </span>
             ) : (
               // 非首页不显示logo和文字，只保留导航按钮
               null
             )}
          </Link>
        </div>

               {/* Navigation Links */}
               <nav className="flex items-center gap-3">
                 {navItems.map((item) => {
                   // 检查是否激活
                  const isHomePageActive = (currentStage === 'home' || pathname === '/') && item.href === "/"
                  const isAboutPageActive = (currentStage === 'about' || pathname === '/#about') && item.href === "/#about"
                  const isWritePageActive = currentStage === 'writeTypeSelection' && item.href === "/write"
                  const isGalleryPageActive = currentStage === 'gallery' && (item.href === "/gallery" || item.label === "Mnemosyne's Gallery")
                  const isActive = isHomePageActive || isAboutPageActive || isWritePageActive || isGalleryPageActive
                   return (
                     <Link
                       key={item.href}
                       href={item.href}
                       onClick={(e) => handleNavClick(item, e)}
                       className={`px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 whitespace-nowrap ${
                         isActive
                           ? showBackground
                             ? isGalleryPage
                               ? 'text-yellow-200' // Gallery 页面激活时显示黄色
                               : 'text-yellow-200' // 其他页面在滚动后显示低饱和度黄色，不显示按钮背景
                             : isGalleryPage
                             ? 'text-white' // Gallery 页面顶部时激活按钮也显示白色
                             : 'text-black' // 顶部时不显示背景，只显示文字
                           : showBackground
                           ? isGalleryPage
                             ? 'text-white hover:text-yellow-200' // Gallery 页面未激活按钮显示白色，hover 时变黄色
                             : 'text-blue-100 hover:text-white' // 其他页面未激活按钮
                           : isGalleryPage
                           ? 'text-white' // Gallery 页面顶部时也显示白色
                           : 'text-black drop-shadow-sm hover:text-gray-700' // 顶部时显示黑色文字
                       }`}
                     >
                       {item.label}
                     </Link>
                   )
                 })}
                 
                 {/* Language Selector - 所有页面都显示 */}
                 <div className="flex gap-2 ml-4">
                   <Button
                     onClick={() => handleLanguageChange("en")}
                     variant={language === "en" ? "default" : "outline"}
                     size="sm"
                     className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                       language === "en"
                         ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-0"
                         : showBackground
                         ? isGalleryPage
                           ? "bg-transparent border-2 border-blue-300 text-white hover:bg-blue-700/60"
                           : "bg-transparent border-2 border-blue-300 text-blue-100 hover:bg-blue-700/60"
                         : "bg-white/80 border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                     }`}
                   >
                     ENG
                   </Button>
                   <Button
                     onClick={() => handleLanguageChange("zh")}
                     variant={language === "zh" ? "default" : "outline"}
                     size="sm"
                     className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                       language === "zh"
                         ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg border-0"
                         : showBackground
                         ? isGalleryPage
                           ? "bg-transparent border-2 border-blue-300 text-white hover:bg-blue-700/60"
                           : "bg-transparent border-2 border-blue-300 text-blue-100 hover:bg-blue-700/60"
                         : "bg-white/80 border-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                     }`}
                   >
                     中文
                   </Button>
                 </div>
               </nav>
      </div>
    </header>
  )
}

