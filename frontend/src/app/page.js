import Stocks from "@/components/home/Stocks";
import LargNews from "@/components/home/LargNews";
import RelatedNews from "@/components/home/RelatedNews";
import MediumNews from "@/components/home/MediumNews";
import SnowflakeVideoCard from "@/components/home/SnowflakeVideoCard";
import MarketPriceFeed from "@/components/home/MarketPriceFeed";
import HotNews from "@/components/home/HotNews";
import MediumVideoNews from "@/components/home/MediumVideoNews";

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
    category: "دسته بندی بازارها",
    categoryTitle: "سهام ریزش کرد؛ تنش خاورمیانه نفت و بازده را بالا برد",
    image: "/img/918x-1.webp",
  };

  const mediumVideoNewsData = {
    title: "تحلیل کامل اتفاقات مهم امروز در بازار",
    description: "در این ویدیو مهم‌ترین تحولات روز را بررسی می‌کنیم...",
    video: "/video/oddest-moments-trump.mp4",
    category: "ویدیو",
    categoryTitle: "ویدیوهای منتخب امروز",
    duration: "02:45",
  };

  const videoData = [
    {
      image: "/img/600x338.webp",
      title:
        "مدیرعامل Snowflake درباره چشم‌انداز فروش و قرارداد جدید آمازون صحبت کرد",
      duration: "۶:۳۲",
    },
    {
      image: "/img/706x471.webp",
      title: "رشد دوباره سهام تکنولوژی در بازار آمریکا",
      duration: "۴:۱۰",
    },
    {
      image: "/img/918x-1.webp",
      title: "افزایش قیمت نفت در پی تنش‌های خاورمیانه",
      duration: "۵:۲۱",
    },
  ];

  const marketItems = [
    { id: 1, title: "بیت‌کوین", subtitle: "BTC / USDT", value: "۶۴٬۲۵۰", active: true },
    { id: 2, title: "اتریوم", subtitle: "ETH / USDT", value: "۳٬۴۲۰", active: true },
    { id: 3, title: "یورو / دلار", subtitle: "EUR / USD", value: "1.0842", active: true },
    { id: 4, title: "طلا", subtitle: "XAU / USD", value: "۲٬۳۵۸", active: true },
    { id: 5, title: "نفت برنت", subtitle: "BRENT", value: "۸۲.۴۰", active: false },
    { id: 6, title: "شاخص نزدک", subtitle: "NASDAQ", value: "۱۸٬۴۳۰", active: false },
  ];

  const hotNewsItems = [
    { id: 1, label: "جنگ ایران", href: "/" },
    { id: 2, label: "سهام آمریکا", href: "/" },
    { id: 3, label: "نتفلیکس", href: "/" },
    { id: 4, label: "ایران", href: "/" },
    { id: 5, label: "نفت", href: "/" },
    { id: 6, label: "جام جهانی", href: "/" },
  ];

  return (
    <div className="flex justify-center">
      <main className="w-full max-w-7xl border-x border-neutral-200">
        <Stocks />

        <div className="flex border-t border-neutral-200">
          <aside className="basis-1/3 border-e border-neutral-200 p-4">
            <SnowflakeVideoCard videos={videoData} />
            <MarketPriceFeed
              title="آخرین قیمت بازارها"
              filterLabel="همه بازارها"
              items={marketItems}
            />
            <HotNews items={hotNewsItems} />
          </aside>

          <section className="basis-2/3">
            <LargNews {...largeNewsData} />
            <RelatedNews news={relatedNewsData} />

            {/* اینجا هم‌ترازی درست میشه */}
            <div className="flex items-stretch border-t border-neutral-200">
              <div className="flex-3 border-e border-neutral-200 p-6">
                <MediumNews {...mediumNewsData} />
              </div>

              <div className="flex-2 p-6">
                <MediumVideoNews {...mediumVideoNewsData} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
