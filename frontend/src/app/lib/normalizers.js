const MEDIA_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL || "http://localhost";

export function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  // بعضی endpointهای swagger توی مثال object نشون داده شدن.
  // اگر API واقعی object تکی برگردونه، این باعث میشه کرش نکنه.
  if (data && typeof data === "object" && data.id) return [data];

  return [];
}

function getFileUrl(file) {
  if (!file) return "";

  if (typeof file === "string") return file;

  if (typeof file === "object") {
    return (
      file.url ||
      file.file ||
      file.image ||
      file.cover ||
      file.thumbnail ||
      ""
    );
  }

  return "";
}

export function resolveImageUrl(image, placeholder = "/images/placeholder.jpg") {
  const rawUrl = getFileUrl(image);

  if (!rawUrl) return placeholder;

  if (typeof rawUrl !== "string") return placeholder;

  // اگر آدرس کامل بود، دست نزن
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  // فایل‌های public خود Next مثل /images/... یا /img/... نباید به localhost وصل شوند
  if (
    rawUrl.startsWith("/images/") ||
    rawUrl.startsWith("/img/") ||
    rawUrl.startsWith("/icons/")
  ) {
    return rawUrl;
  }

  // مسیرهای media بک‌اند
  if (rawUrl.startsWith("/")) {
    return `${MEDIA_BASE_URL}${rawUrl}`;
  }

  return `${MEDIA_BASE_URL}/${rawUrl}`;
}

export function resolveFileUrl(file) {
  const rawUrl = getFileUrl(file);

  if (!rawUrl) return "";

  if (typeof rawUrl !== "string") return "";

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return rawUrl;
  }

  if (rawUrl.startsWith("/")) {
    return `${MEDIA_BASE_URL}${rawUrl}`;
  }

  return `${MEDIA_BASE_URL}/${rawUrl}`;
}

export function normalizePost(post) {
  if (!post) return null;

  const cover =
    post.cover_url ||
    post.cover?.url ||
    post.cover ||
    post.image_url ||
    post.image?.url ||
    post.image ||
    post.thumbnail_url ||
    post.thumbnail?.url ||
    post.thumbnail ||
    "";

  return {
    id: post.id,
    title: post.title || "",
    slug: post.slug || "",
    href: post.slug ? `/news/${post.slug}` : "#",

    description: post.excerpt || post.summary || post.description || "",
    excerpt: post.excerpt || post.summary || post.description || "",
    content: post.content || "",

    image: resolveImageUrl(cover, "/images/placeholder.jpg"),
    cover: resolveImageUrl(cover, "/images/placeholder.jpg"),

    category: post.category?.title || post.category?.name || "",
    categorySlug: post.category?.slug || "",
    categoryHref: post.category?.slug ? `/category/${post.category.slug}` : "#",

    author: post.author?.full_name || post.author?.name || "",
    authorEmail: post.author?.email || "",
    authorAvatar: resolveImageUrl(
      post.author?.avatar ||
        post.author?.avatar_url ||
        post.author?.image ||
        "",
      "/images/placeholder-avatar.jpg",
    ),

    tags: post.tags || [],

    views: post.views || post.views_count || 0,
    commentsCount: post.comments_count || 0,

    publishedAt: post.published_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,

    isBookmarked: Boolean(post.is_bookmarked),
    isFeatured: Boolean(post.is_featured),
    isHero: Boolean(post.is_hero),
    showOnHomepage: Boolean(post.show_on_homepage),

    postType: post.post_type,
    postTypeLabel: post.post_type_label,

    homepageSection: post.homepage_section,
    homepageSectionLabel: post.homepage_section_label,
    homepageOrder: post.homepage_order,
  };
}

export function normalizePosts(data) {
  return getList(data).map(normalizePost).filter(Boolean);
}

export function normalizeCategory(category) {
  if (!category) return null;

  return {
    id: category.id,
    title: category.title || category.name || "",
    label: category.title || category.name || "",
    slug: category.slug || "",
    value: category.slug || "",
    href: category.slug ? `/category/${category.slug}` : "#",
    postsCount: category.posts_count || 0,
    image: resolveImageUrl(
      category.image_url || category.image?.url || category.image || "",
      "",
    ),
  };
}

export function normalizeCategories(data) {
  return getList(data).map(normalizeCategory).filter(Boolean);
}

export function normalizeTag(tag) {
  if (!tag) return null;

  return {
    id: tag.id,
    title: tag.title || tag.name || "",
    label: tag.title || tag.name || "",
    slug: tag.slug || "",
    value: tag.slug || "",
    href: tag.slug ? `/tag/${tag.slug}` : "#",
    postsCount: tag.posts_count || 0,
  };
}

export function normalizeTags(data) {
  return getList(data).map(normalizeTag).filter(Boolean);
}

export function normalizeVideo(video) {
  if (!video) return null;

  const thumbnail =
    video.thumbnail_url ||
    video.thumbnail?.url ||
    video.thumbnail ||
    video.cover_url ||
    video.cover?.url ||
    video.cover ||
    video.image_url ||
    video.image?.url ||
    video.image ||
    "";

  return {
    id: video.id,
    title: video.title || "",
    slug: video.slug || "",
    href: video.slug ? `/videos/${video.slug}` : "#",

    description: video.summary || video.description || "",
    summary: video.summary || video.description || "",
    content: video.content || "",

    image: resolveImageUrl(thumbnail, "/images/placeholder-video.jpg"),
    thumbnail: resolveImageUrl(thumbnail, "/images/placeholder-video.jpg"),

    videoUrl: resolveFileUrl(video.video_url || video.video_file?.url || video.video_file || ""),
    embedUrl: video.embed_url || "",

    duration: video.duration || 0,
    views: video.views_count || video.views || 0,

    isFeatured: Boolean(video.is_featured),

    category: video.category?.title || video.category?.name || "",
    categorySlug: video.category?.slug || "",
    tags: video.tags || [],

    publishedAt: video.published_at,
  };
}

export function normalizeVideos(data) {
  return getList(data).map(normalizeVideo).filter(Boolean);
}

export function normalizePodcast(podcast) {
  if (!podcast) return null;

  const cover =
    podcast.cover_url ||
    podcast.cover_image?.url ||
    podcast.cover_image ||
    podcast.cover?.url ||
    podcast.cover ||
    podcast.image_url ||
    podcast.image?.url ||
    podcast.image ||
    "";

  return {
    id: podcast.id,
    title: podcast.title || "",
    slug: podcast.slug || "",
    href: podcast.slug ? `/podcasts/${podcast.slug}` : "#",

    description: podcast.summary || podcast.description || "",
    summary: podcast.summary || podcast.description || "",
    content: podcast.content || "",

    image: resolveImageUrl(cover, "/images/placeholder-podcast.jpg"),
    cover: resolveImageUrl(cover, "/images/placeholder-podcast.jpg"),

    audioUrl: resolveFileUrl(podcast.audio_url || podcast.audio_file?.url || podcast.audio_file || ""),

    duration: podcast.duration || 0,
    listens: podcast.listens_count || podcast.listens || 0,

    isFeatured: Boolean(podcast.is_featured),

    category: podcast.category?.title || podcast.category?.name || "",
    categorySlug: podcast.category?.slug || "",
    tags: podcast.tags || [],

    publishedAt: podcast.published_at,
  };
}

export function normalizePodcasts(data) {
  return getList(data).map(normalizePodcast).filter(Boolean);
}
