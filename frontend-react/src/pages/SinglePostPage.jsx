import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { newsApi } from "../lib/news/newsApi"; // فرض بر این است که متد getPostBySlug را داری
import moment from "moment";

const SinglePostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await newsApi.getPostBySlug(slug);
        setPost(response.data);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!post) return <div className="text-center py-20">Post not found.</div>;

  return (
    <div className="bg-white min-h-screen font-sans text-black">
      {/* Header Border */}
      <div className="border-t-4 border-black mb-8"></div>

      <article className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Category & Breadcrumb */}
        <div className="mb-4">
          <span className="text-blue-700 font-bold uppercase text-xs tracking-widest border-b-2 border-blue-700 pb-1">
            {post.category?.name || "News"}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black leading-tight mb-6">
          {post.title}
        </h1>

        {/* Meta Info: Author & Date */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-b border-gray-200 py-4 mb-8">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm uppercase">By</span>
            <span className="font-bold text-sm uppercase hover:underline cursor-pointer">
              {post.author_full_name || post.author?.username}
            </span>
          </div>
          <div className="text-gray-500 text-sm mt-2 md:mt-0 uppercase tracking-tighter">
            {moment(post.created_at).format("MMMM D, YYYY, h:mm A [GMT+3:30]")}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Featured Image */}
            {post.image && (
              <figure className="mb-8">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
                <figcaption className="text-xs text-gray-500 mt-2 italic">
                  Photographer: {post.author_full_name} via News Agency
                </figcaption>
              </figure>
            )}

            {/* Post Body */}
            <div
              className="prose prose-lg max-w-none font-serif leading-relaxed text-gray-900 
                         first-letter:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="bg-gray-100 px-3 py-1 text-xs font-bold uppercase tracking-widest"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 border-l border-gray-100 pl-8 hidden lg:block">
            <div className="sticky top-8">
              <h3 className="font-bold text-xs uppercase tracking-widest border-b-2 border-black pb-2 mb-6">
                More From Bloomberg
              </h3>
              {/* Fake "Related" items for UI look */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="mb-6 group cursor-pointer">
                  <h4 className="font-serif font-bold text-lg group-hover:text-blue-700 leading-snug">
                    Global Markets React as Central Banks Signal Higher Rates
                  </h4>
                  <p className="text-xs text-gray-400 mt-2 uppercase tracking-tighter">
                    2 hours ago
                  </p>
                </div>
              ))}

              <div className="bg-blue-50 p-6 mt-12 border-t-2 border-blue-600">
                <h3 className="font-bold text-lg mb-2">
                  The Weekly Newsletter
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Everything you need to know about the markets, sent every
                  Sunday.
                </p>
                <button className="w-full bg-black text-white py-2 font-bold text-sm uppercase tracking-widest">
                  Subscribe
                </button>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
};

export default SinglePostPage;
