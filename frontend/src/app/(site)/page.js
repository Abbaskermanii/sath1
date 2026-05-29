import Stocks from "@/components/home/Stocks";
import LargNews from "@/components/home/LargNews";
import RelatedNews from "@/components/home/RelatedNews";
import MediumNews from "@/components/home/MediumNews";
import SnowflakeVideoCard from "@/components/home/SnowflakeVideoCard";
import MarketPriceFeed from "@/components/home/MarketPriceFeed";
import HotNews from "@/components/home/HotNews";
import MediumVideoNews from "@/components/home/MediumVideoNews";
import WarMarketTracker from "@/components/home/WarMarketTracker";
import AdBox from "@/components/home/AdBox";

export default function Home() {
  const relatedNewsData = [
    "ترامپ در تنگنا قرار گرفت؛ بسته شدن هرمز و فشار جنگ‌طلبان",
    "ترافیک آبراه هرمز به شدت کاهش یافت؛ پس از خروج ابرنفتکش‌ها",
    "توضیح: نبرد اسرائیل با حزب‌الله چگونه به جنگ ایران مرتبط است؟",
  ];

  const largeNewsData = {
    title:
      "آمریکا بدون چشم‌انداز توافق، به اهداف ایرانی در نزدیکی هرمز حمله کرد",
    description:
      "ایالات متحده همچنین تحریم‌های جدیدی را برای جلوگیری از سود بردن تهران از کشتی‌هایی که از این آبراه عبور می‌کنند وضع کرد.",
    categoryText: "دسته بندی بازارها",
    categoryTitle: "سهام ریزش کرد؛ تنش خاورمیانه نفت و بازده را بالا برد",
    image: "/img/918x-1.webp",
  };

  const mediumNewsData = {
    title:
      "آمریکا بدون چشم‌انداز توافق، به اهداف ایرانی در نزدیکی هرمز حمله کرد",
    description:
      "ایالات متحده همچنین تحریم‌های جدیدی را برای جلوگیری از سود بردن تهران از کشتی‌هایی که از این آبراه عبور می‌کنند وضع کرد.",
    categoryText: "دسته بندی بازارها",
    category: "دسته بندی بازارها",
    categoryTitle: "سهام ریزش کرد؛ تنش خاورمیانه نفت و بازده را بالا برد",
    image: "/img/918x-1.webp",
  };

  // در فایل Home.js
  const mediumVideoNewsData = {
    title: "تحلیل کامل اتفاقات مهم امروز در بازار",
    description: "در این ویدیو مهم‌ترین تحولات روز را بررسی می‌کنیم...",
    // فیلدهای اضافی مثل video، duration و AriaLabelها را حذف کردم

    suggestedLabel: "ویدیوی پیشنهادی",
    suggestedVideoThumbnail: "/img/918x612.webp",
    suggestedVideoTitle: "تحولات مهم بازار امروز",
    suggestedVideoHref: "/",
    suggestedVideoAlt: "ویدیوی پیشنهادی بازار",
  };

  const videoData = [
    {
      image: "/img/600x338.webp",
      title: "تحلیل بازار آمریکا",
      duration: "۶:۳۲",
    },
    { image: "/img/706x471.webp", title: "رشد تکنولوژی", duration: "۴:۱۰" },
    { image: "/img/918x-1.webp", title: "افزایش قیمت نفت", duration: "۵:۲۱" },
  ];

  const marketItems = [
    {
      id: 1,
      title: "بیت‌کوین",
      subtitle: "BTC / USDT",
      value: "۶۴٬۲۵۰",
      active: true,
    },
    {
      id: 2,
      title: "اتریوم",
      subtitle: "ETH / USDT",
      value: "۳٬۴۲۰",
      active: true,
    },
    {
      id: 3,
      title: "یورو / دلار",
      subtitle: "EUR / USD",
      value: "1.0842",
      active: true,
    },
    {
      id: 4,
      title: "طلا",
      subtitle: "XAU / USD",
      value: "۲٬۳۵۸",
      active: true,
    },
    {
      id: 5,
      title: "نفت برنت",
      subtitle: "BRENT",
      value: "۸۲.۴۰",
      active: false,
    },
    {
      id: 6,
      title: "نزدک",
      subtitle: "NASDAQ",
      value: "۱۸٬۴۳۰",
      active: false,
    },
  ];

  const hotNewsItems = [
    { id: 1, label: "جنگ ایران", href: "/" },
    { id: 2, label: "سهام آمریکا", href: "/" },
    { id: 3, label: "نفت", href: "/" },
    { id: 4, label: "ایران", href: "/" },
  ];

  const trackerItems = [
    { id: 1, label: "عبور کشتی‌ها از هرمز", value: "۱۰۴ کشتی", trend: "down" },
    { id: 2, label: "نفت برنت", value: "۲۹.۲٪", trend: "up" },
    { id: 3, label: "گاز اروپا", value: "۴۸.۶٪", trend: "up" },
    { id: 4, label: "دلار", value: "۱.۱٪", trend: "up" },
  ];

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-7xl border-x border-neutral-200">
        <Stocks />

        <div className="flex border-t border-neutral-200">
          {/* Sidebar */}
          <aside className="w-1/3 border-e border-neutral-200">
            <div className="divide-y divide-neutral-200">
              <div className="p-4">
                <SnowflakeVideoCard videos={videoData} />
              </div>

              <div className="p-4">
                <MarketPriceFeed
                  title="آخرین قیمت بازارها"
                  filterLabel="همه بازارها"
                  items={marketItems}
                />
              </div>

              <div className="p-4">
                <HotNews items={hotNewsItems} />
              </div>

              <div className="p-4">
                <WarMarketTracker title="رصد بازار" items={trackerItems} />
              </div>
            </div>
          </aside>

          {/* Main */}
          <section className="w-2/3">
            <LargNews {...largeNewsData} />

            <RelatedNews news={relatedNewsData} />

            <div className="flex border-t border-neutral-200">
              <div className="flex-1 border-e border-neutral-200 p-6">
                <MediumNews {...mediumNewsData} />

                <AdBox
                  image="/img/530x353.webp"
                  label="تبلیغ"
                  title="سرمایه‌گذاری هوشمند"
                  description="فرصت‌های ویژه بازار امروز"
                  buttonText="مشاهده بیشتر"
                  href="/"
                />
              </div>

              <div className="p-6">
                <MediumVideoNews {...mediumVideoNewsData} />
              </div>
            </div>

            <div className="border-t border-neutral-200">
              <LargNews {...largeNewsData} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
