export function getList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  // بعضی endpointهای swagger توی مثال object نشون داده شدن.
  // اگر API واقعی object تکی برگردونه، این باعث میشه کرش نکنه.
  if (data && typeof data === "object" && data.id) return [data];

  return [];
}

export function normalizePost(post) {
  if (!post) return null;

  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    href: `/news/${post.slug}`,
    description: post.excerpt || "",
    excerpt: post.excerpt || "",
    content: post.content || "",
    image: post.cover || "/images/placeholder.jpg",
    cover: post.cover || "/images/placeholder.jpg",

    category: post.category?.title || "",
    categorySlug: post.category?.slug || "",
    categoryHref: post.category?.slug
      ? `/category/${post.category.slug}`
      : "#",

    author: post.author?.full_name || "",
    authorEmail: post.author?.email || "",

    tags: post.tags || [],

    views: post.views || 0,
    commentsCount: post.comments_count || 0,

    publishedAt: post.published_at,
    createdAt: post.created_at,
    updatedAt: post.updated_at,

    isBookmarked: post.is_bookmarked,
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
    title: category.title,
    label: category.title,
    slug: category.slug,
    value: category.slug,
    href: `/category/${category.slug}`,
    postsCount: category.posts_count || 0,
  };
}

export function normalizeCategories(data) {
  return getList(data).map(normalizeCategory).filter(Boolean);
}

export function normalizeTag(tag) {
  if (!tag) return null;

  return {
    id: tag.id,
    title: tag.title,
    label: tag.title,
    slug: tag.slug,
    value: tag.slug,
    href: `/tag/${tag.slug}`,
    postsCount: tag.posts_count || 0,
  };
}

export function normalizeTags(data) {
  return getList(data).map(normalizeTag).filter(Boolean);
}

export function normalizeVideo(video) {
  if (!video) return null;

  return {
    id: video.id,
    title: video.title,
    slug: video.slug,
    href: `/videos/${video.slug}`,
    description: video.summary || "",
    summary: video.summary || "",
    content: video.content || "",
    image:
      video.thumbnail_url ||
      video.thumbnail?.url ||
      "/images/placeholder-video.jpg",
    thumbnail:
      video.thumbnail_url ||
      video.thumbnail?.url ||
      "/images/placeholder-video.jpg",
    videoUrl: video.video_url || video.video_file?.url || "",
    embedUrl: video.embed_url || "",
    duration: video.duration || 0,
    views: video.views_count || 0,
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

  return {
    id: podcast.id,
    title: podcast.title,
    slug: podcast.slug,
    href: `/podcasts/${podcast.slug}`,
    description: podcast.summary || "",
    summary: podcast.summary || "",
    content: podcast.content || "",
    image:
      podcast.cover_url ||
      podcast.cover_image?.url ||
      "/images/placeholder-podcast.jpg",
    cover:
      podcast.cover_url ||
      podcast.cover_image?.url ||
      "/images/placeholder-podcast.jpg",
    audioUrl: podcast.audio_url || podcast.audio_file?.url || "",
    duration: podcast.duration || 0,
    listens: podcast.listens_count || 0,
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
