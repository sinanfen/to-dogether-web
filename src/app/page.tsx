import Link from 'next/link'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-sky-100">
      {/* Navigation */}
      <nav className="bg-transparent">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent truncate">To-Dogether</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              <Link
                href="/auth/login"
                className="relative overflow-hidden px-2.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-base text-gray-700 border border-gray-300 rounded-lg transition-all duration-300 font-medium min-h-[40px] sm:min-h-[44px] flex items-center justify-center group hover:border-purple-300 hover:shadow-md hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50 hover:text-purple-700 active:scale-95 whitespace-nowrap"
              >
                <span className="relative z-10">Giriş Yap</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-orange-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              </Link>
              <Link
                href="/auth/register"
                className="relative overflow-hidden px-2.5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-base bg-gradient-to-r from-purple-500 to-orange-500 text-white rounded-lg transition-all duration-300 font-medium min-h-[40px] sm:min-h-[44px] flex items-center justify-center group hover:shadow-lg hover:shadow-purple-200 active:scale-95 before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-400 before:to-orange-400 before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-100 whitespace-nowrap"
              >
                <span className="relative z-10">Kayıt Ol</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-1">
            <span className="block">
              Birlikte Planlayın,
              <span className="bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent">
                {' '}Birlikte Başarın
              </span>
            </span>
          </h1>

          <p className="text-base sm:text-xl text-gray-600 mb-6 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-2">
            Takımlar için tasarlanmış iş birliğine dayalı yapılacaklar uygulaması. Hedeflerinizi paylaşın, ilerlemenizi birlikte takip edin ve başarılarınızı kutlayın.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-2">
            <div className="relative group w-full sm:w-auto">
              {/* Animated Border Background */}
              <div className="absolute inset-0 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'conic-gradient(from var(--angle), transparent 70%, rgb(168 85 247) 80%, rgb(249 115 22) 85%, transparent 95%)',
                  animation: 'border-spin 3s linear infinite',
                  padding: '2px'
                }}>
              </div>

              <Link
                href="/auth/register"
                className="relative w-full sm:w-auto bg-gradient-to-r from-purple-500 to-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium transition-all duration-500 inline-flex items-center justify-center space-x-2 min-h-[52px] sm:min-h-[56px] text-base sm:text-lg group hover:shadow-2xl hover:shadow-purple-400/50 active:scale-95"
              >
                {/* Inner Background */}
                <div className="absolute inset-[2px] bg-gradient-to-r from-purple-500 to-orange-500 rounded-xl transition-all duration-500 group-hover:from-purple-400 group-hover:to-orange-400"></div>

                {/* Content */}
                <div className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold tracking-wide">Hemen Planlamaya Başla</span>
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-ping hidden sm:block"></div>
                </div>

                {/* Sparkle Effects */}
                <div className="absolute top-2 right-4 w-1 h-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping hidden sm:block" style={{ animationDelay: '0.1s' }}></div>
                <div className="absolute bottom-3 left-6 w-1 h-1 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping hidden sm:block" style={{ animationDelay: '0.3s' }}></div>
                <div className="absolute top-1/2 left-4 w-0.5 h-0.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping hidden sm:block" style={{ animationDelay: '0.5s' }}></div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-slow rounded-xl"></div>
              </Link>
            </div>
            <Link
              href="/demo"
              className="relative overflow-hidden w-full sm:w-auto bg-white border border-gray-200 transition-all duration-300 font-medium inline-flex items-center justify-center space-x-1 min-h-[52px] sm:min-h-[56px] text-base sm:text-lg rounded-lg px-6 sm:px-8 py-3 sm:py-4 shadow-sm group hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100 active:scale-95 hover:bg-gradient-to-r hover:from-purple-50 hover:to-orange-50"
            >
              <span className="bg-gradient-to-r from-purple-500 to-orange-500 bg-clip-text text-transparent font-semibold relative z-10 transition-all duration-300 group-hover:from-purple-600 group-hover:to-orange-600">Demoyu Gör</span>
              <svg className="w-4 h-4 text-purple-500 relative z-10 transition-all duration-300 group-hover:translate-x-1 group-hover:text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 bg-gradient-to-r from-transparent via-purple-100 to-transparent animate-shimmer"></div>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-3 sm:px-6 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-16 px-2">
          <p className="text-purple-500 font-semibold text-sm sm:text-lg mb-2 sm:mb-4">Birlikte Daha İyi</p>
          <h2 className="text-xl sm:text-4xl font-bold text-gray-900">
            Takım olarak planlamak için ihtiyacınız olan her şey
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm text-center transition-all duration-500 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-purple-50/30 group cursor-pointer">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-500 group-hover:bg-purple-200 group-hover:rotate-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500 transition-all duration-500 group-hover:text-purple-600 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 transition-all duration-500 group-hover:text-purple-700">Paylaşılan Listeler</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed transition-all duration-500 group-hover:text-gray-700">
              Yapılacaklar listelerini birlikte oluşturun ve yönetin. Takım arkadaşlarınızın gerçek zamanlı olarak ne üzerinde çalıştığını görün.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm text-center transition-all duration-500 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-blue-50/30 group cursor-pointer">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-500 group-hover:bg-blue-200 group-hover:-rotate-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500 transition-all duration-500 group-hover:text-blue-600 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 transition-all duration-500 group-hover:text-blue-700">Mobil Uyumlu</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed transition-all duration-500 group-hover:text-gray-700">
              Tüm cihazlarda kusursuz çalışır. Ana ekrana ekleyerek uygulama gibi kullanabilirsiniz.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm text-center sm:col-span-2 lg:col-span-1 transition-all duration-500 hover:shadow-md hover:bg-gradient-to-br hover:from-white hover:to-orange-50/30 group cursor-pointer">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transition-all duration-500 group-hover:bg-orange-200 group-hover:rotate-12">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500 transition-all duration-500 group-hover:text-orange-600 group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 transition-all duration-500 group-hover:text-orange-700">Öncelik Seviyeleri</h3>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed transition-all duration-500 group-hover:text-gray-700">
              Görevler için öncelik belirleyin, böylece herkes en önemli işlere odaklanabilir.
            </p>
          </div>
        </div>
      </div>


    </div>
  )
}


